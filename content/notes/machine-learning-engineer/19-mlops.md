# Module 19: MLOps and Production Machine Learning

**Phase 6 · Production Engineering** · Goal: run ML systems reliably over time. That means reproducible, automated, monitored, secure and responsible.

---

## 1. Introduction to MLOps

**In plain English.** MLOps applies DevOps practices (automation, version control, testing, CI/CD, monitoring) to machine learning. The difference is that ML systems depend on **code, data and models**, and all three change.

**Goals.** Make ML **reproducible, reliable, scalable, auditable and fast to iterate**.

**Maturity levels** (after Google's MLOps framework):
| Level | Description |
|---|---|
| 0, manual | Notebooks; models handed over by email or file share; manual deployment; no monitoring |
| 1, ML pipeline automation | Automated training pipelines, experiment tracking, model registry, continuous training on new data |
| 2, CI/CD pipeline automation | Pipelines themselves are tested and deployed automatically; full monitoring and automated retraining |

**Core components.** Version control (code, data, models), experiment tracking, a model registry, orchestration, CI/CD, serving infrastructure, monitoring and alerting, feature stores, and governance.

**Check yourself.** Which level describes a team that retrains manually in a notebook each quarter and uploads a pickle to a server?

---

## 2. ML Development vs Production ML

| | Development / research | Production |
|---|---|---|
| Priority | Best offline metric | Reliability, latency, cost and maintainability, plus a good metric |
| Data | Static, cleaned snapshot | Constantly changing, messy and late-arriving |
| Code | Notebooks, experiments | Tested packages, pipelines, APIs |
| Compute | Ad hoc GPUs | Budgeted, autoscaled |
| Failure | A cell errors out | Silent degradation affecting users and revenue |
| Evaluation | Once, on the test set | Continuously, on live traffic |
| Stakeholders | The ML team | Users, product, legal, security, operations |

**Common production failure modes.** Training-serving skew, data pipeline breakages (a column renamed upstream), drift, feedback loops (the model's own predictions change future data), dependency updates, scaling bottlenecks and unmonitored model decay.

**Check yourself.** Give an example of a feedback loop in a recommender system and its effect on training data.

---

## 3. Experiment Tracking

**What to track for every run.**
| Category | Examples |
|---|---|
| Parameters | Hyperparameters, feature set, preprocessing options |
| Metrics | Train/val/test scores, per epoch (curves) and final |
| Artifacts | Model files, plots (ROC, confusion matrix), SHAP charts |
| Code version | Git commit SHA, whether there were uncommitted changes |
| Data version | DVC hash, table snapshot ID |
| Environment | Library versions, hardware |
| Notes and tags | Hypothesis, author, the "why" |

**Why it matters.** Comparing hundreds of runs, reproducing the best one months later, collaboration, and audit trails.

**Tools.** **MLflow** (open source, self-hosted or managed), Weights & Biases, Neptune, Comet, ClearML, TensorBoard (training curves).

**Check yourself.** Your best model came from "some run last Tuesday". What can't you do without tracking?

---

## 4. MLflow Fundamentals

**Components.**
| Component | Purpose |
|---|---|
| **Tracking** | Log parameters, metrics and artifacts; UI for comparing runs |
| **Models** | A standard packaging format with "flavours" (sklearn, pytorch, xgboost, pyfunc) and a captured environment |
| **Model Registry** | Versioned models with aliases and tags (topic 5) |
| Projects / Recipes | Reproducible run packaging |
| GenAI tracing / evaluation | Tracing and evaluating LLM applications |

```python
import mlflow, mlflow.sklearn
from sklearn.metrics import roc_auc_score
from mlflow.models import infer_signature

mlflow.set_tracking_uri("http://localhost:5000")       # or a managed server; default is local ./mlruns
mlflow.set_experiment("churn")

with mlflow.start_run(run_name="lgbm-optuna-best"):
    mlflow.log_params({"learning_rate": 0.05, "num_leaves": 63})
    pipe.fit(X_train, y_train)
    auc = roc_auc_score(y_val, pipe.predict_proba(X_val)[:, 1])
    mlflow.log_metric("val_auc", auc)
    mlflow.log_figure(make_roc_figure(pipe, X_val, y_val), "roc.png")
    mlflow.sklearn.log_model(pipe, name="model",
                             signature=infer_signature(X_val, pipe.predict_proba(X_val)),
                             input_example=X_val.head(3))
```

```bash
mlflow ui --port 5000           # browse and compare runs
mlflow models serve -m "models:/churn@champion" -p 5001   # instant REST serving
```

**Autologging.** `mlflow.autolog()` captures parameters, metrics and models for scikit-learn, XGBoost, LightGBM and PyTorch Lightning automatically.

**Check yourself.** What does logging a model **signature** protect against at serving time?

---

## 5. Model Registry

**What it is.** A central catalogue of **versioned models** with metadata, lineage and lifecycle state. It answers: *Which model is in production? Who approved it? What data trained it?*

**Workflow.**
```
train run → register as "churn" v8 → validate (automated checks + review)
         → set alias @challenger → shadow / canary → promote to @champion → archive old
```

```python
from mlflow import MlflowClient
result = mlflow.register_model(f"runs:/{run_id}/model", "churn")
client = MlflowClient()
client.set_registered_model_alias("churn", "champion", result.version)
client.set_model_version_tag("churn", result.version, "validated_by", "data-science-lead")

model = mlflow.pyfunc.load_model("models:/churn@champion")    # serving code never hard-codes a version
```

**Benefits.** Decouples training from deployment (serving pulls "@champion"), one-command rollback (point the alias back), governance and approvals, and an audit history.

**Other registries.** SageMaker Model Registry, Vertex AI Model Registry, Azure ML, Databricks Unity Catalog, Hugging Face Hub (public or private).

**Check yourself.** Why should serving code reference `models:/churn@champion` instead of `models:/churn/8`?

---

## 6. Dataset and Model Versioning

**Why version data?** The same code with different data produces a different model. Reproducing or auditing a model requires the **exact training data**.

**Approaches.**
| Approach | Tools | Best for |
|---|---|---|
| Git-like data versioning | **DVC**, lakeFS | File-based datasets, small or medium teams |
| Table formats with time travel | Delta Lake, Apache Iceberg, Apache Hudi | Data lakes; `SELECT … VERSION AS OF` |
| Warehouse snapshots | BigQuery, Snowflake time travel / cloning | SQL-based teams |
| Dataset hubs | Hugging Face Datasets | Public or shared ML datasets |

**Model versioning.** The registry (topic 5) plus immutable artifact storage (S3/GCS with object versioning).

**Lineage.** Model v8 ← run abc123 ← data `md5:9f3…` + code `git:1a2b3c` + config `lgbm.yaml`.

**Check yourself.** A regulator asks you to retrain last year's model exactly. Which three versioned things do you need?

---

## 7. Introduction to DVC

**DVC (Data Version Control).** It works alongside Git: **Git tracks small pointer files (hashes)**, and DVC stores the large data and model files in remote storage (S3, GCS, Azure, SSH or a local drive).

```bash
pip install "dvc[s3]"
git init && dvc init
dvc remote add -d storage s3://my-bucket/dvc-store

dvc add data/raw/customers.parquet        # creates data/raw/customers.parquet.dvc (a pointer)
git add data/raw/customers.parquet.dvc data/raw/.gitignore
git commit -m "Track raw customer data v1"
dvc push                                  # upload the data to remote storage

# A teammate (or a CI job) on another machine:
git clone <repo> && dvc pull              # fetch the exact data for this commit
git checkout v1.0 && dvc checkout         # time-travel data together with code
```

**Pipelines** (`dvc.yaml`): define stages with dependencies and outputs. DVC reruns only what changed.
```yaml
stages:
  prepare:
    cmd: python -m churn.prepare
    deps: [src/churn/prepare.py, data/raw/customers.parquet]
    outs: [data/processed/train.parquet, data/processed/test.parquet]
  train:
    cmd: python -m churn.train --config configs/lgbm.yaml
    deps: [src/churn/train.py, data/processed/train.parquet, configs/lgbm.yaml]
    outs: [models/model.joblib]
    metrics: [reports/metrics.json: {cache: false}]
```
```bash
dvc repro                 # run the pipeline (skips unchanged stages)
dvc metrics diff          # compare metrics with the last commit
dvc exp run -S train.learning_rate=0.03   # lightweight experiments
```

**Check yourself.** Why does DVC store a hash in Git instead of the data itself?

---

## 8. Reproducible Machine Learning

**Definition.** Anyone can recreate the same model and results from the repository.

**Checklist.**
| Layer | Practice |
|---|---|
| Code | Git; tagged releases; no unexplained notebook-only steps |
| Data | DVC or snapshots; point-in-time extraction queries saved |
| Environment | Pinned dependencies (lockfile: `uv.lock`, `poetry.lock`, `requirements.txt` with hashes); **Docker** image |
| Randomness | Seeds everywhere; deterministic algorithms where feasible |
| Configuration | All parameters in versioned config files |
| Pipeline | A single command reproduces everything (`dvc repro`, `make train`) |
| Tracking | MLflow run linking all of the above |
| Documentation | README, model card, data card |

**Sources of non-determinism to know about.** GPU kernels (cuDNN autotuning, atomics), multi-threaded data loading order, floating-point summation order, unpinned library upgrades, and external data that changes.

**Check yourself.** Two colleagues run the same training script and get AUCs of 0.871 and 0.866. List three possible causes.

---

## 9. Docker Fundamentals for ML Engineers

**Why containers?** "It works on my machine" becomes "it works everywhere". A container packages the code, the Python version, system libraries and dependencies into one image that runs the same on a laptop, in CI and in the cloud.

**Key concepts.**
| Term | Meaning |
|---|---|
| **Image** | An immutable template built from a Dockerfile |
| **Container** | A running instance of an image |
| **Dockerfile** | Build instructions, one layer per instruction |
| **Registry** | Image storage (Docker Hub, ECR, GCR/Artifact Registry, GHCR) |
| Volume | Persistent or shared storage mounted into a container |
| Port mapping | `-p 8000:8000` exposes the container port on the host |

**Essential commands.**
```bash
docker build -t churn-api:1.0 .
docker run -p 8000:8000 --env-file .env churn-api:1.0
docker ps; docker logs <id>; docker exec -it <id> bash; docker stop <id>
docker tag churn-api:1.0 ghcr.io/org/churn-api:1.0 && docker push ghcr.io/org/churn-api:1.0
```

**Images for ML.** `python:3.11-slim` for CPU inference. `nvidia/cuda:*-runtime` or `pytorch/pytorch` images for GPU work (they need the NVIDIA Container Toolkit and `--gpus all`).

**Check yourself.** What is the difference between an image and a container?

---

## 10. Containerising ML Applications

**A production-quality Dockerfile for a FastAPI model service.**
```dockerfile
# ---- build stage: install dependencies ----
FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt

# ---- runtime stage: small final image ----
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY src/ src/
COPY api/ api/
COPY models/churn_v1.joblib models/
RUN useradd --create-home appuser
USER appuser                                   # don't run as root
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
HEALTHCHECK CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

**Best practices.**
- **Order layers for caching:** install dependencies *before* copying code, so code edits don't reinstall everything.
- Use a **`.dockerignore`** to exclude `.git`, `data/`, `.venv`, notebooks and secrets.
- **Multi-stage builds** and slim base images give smaller, more secure images.
- **Run as a non-root user**, and scan images for vulnerabilities (Trivy, Docker Scout).
- **Never bake secrets** into images. Pass them as environment variables from a secret manager.
- Model artifacts: either bake them into the image (immutable, simple) or download them from the registry at startup (smaller image, flexible). Pin the version either way.
- **docker compose** runs several services locally (API + MLflow + Postgres + monitoring).

**Check yourself.** Why does copying `requirements.txt` and installing dependencies *before* `COPY src/` speed up rebuilds?

---

## 11. Deploying Models to Cloud Platforms

**Deployment options, from simplest to most flexible.**
| Option | Examples | Pros | Cons |
|---|---|---|---|
| **Serverless containers** | Google Cloud Run, AWS App Runner, Azure Container Apps | Deploy a Docker image, autoscale to zero, pay per use | Cold starts; limited GPU support |
| Serverless functions | AWS Lambda, Cloud Functions | Very cheap for spiky, light workloads | Size and time limits; cold starts |
| **Managed ML platforms** | AWS SageMaker, Google Vertex AI, Azure ML, Databricks | Built-in registry, endpoints, monitoring, autoscaling, GPUs | Cost; vendor lock-in |
| Kubernetes | EKS, GKE, AKS + KServe / Seldon / Ray Serve | Maximum control and scale; canary deployments; multi-model | Operational complexity |
| Model hubs / inference APIs | Hugging Face Inference Endpoints, Replicate, Modal | Fast GPU serving for deep-learning models | Less control |
| Edge / on-device | ONNX, TF Lite, Core ML | Privacy, offline use, no server cost | Model size limits |

**Example: deploy to Google Cloud Run.**
```bash
gcloud builds submit --tag europe-west2-docker.pkg.dev/PROJECT/ml/churn-api:1.0
gcloud run deploy churn-api --image europe-west2-docker.pkg.dev/PROJECT/ml/churn-api:1.0 \
  --region europe-west2 --memory 1Gi --cpu 1 --min-instances 1 --max-instances 10 \
  --set-secrets API_KEY=churn-api-key:latest --no-allow-unauthenticated
```

**Production checklist.** Health checks, autoscaling limits, resource requests, secrets in a secret manager, HTTPS and authentication, structured logs, metrics and alerts, a rollback plan, cost budgets and alerts, and data residency for regulated data.

**Check yourself.** Why might you set `--min-instances 1` for a latency-sensitive model on a serverless platform?

---

## 12. Introduction to CI/CD for Machine Learning

**CI (Continuous Integration).** Every change is tested automatically.
**CD (Continuous Delivery/Deployment).** Validated changes are released automatically.
**CT (Continuous Training).** Models are retrained automatically when data or triggers require it. This is ML-specific.

**What to test in ML.**
| Test type | Examples |
|---|---|
| Unit tests | Feature functions, preprocessing, utilities |
| Data tests | Schema, ranges, null rates, distribution checks on new data |
| Model tests | Minimum quality gate (AUC ≥ baseline), slice metrics, invariance tests (changing a name doesn't change the prediction), directional tests (a higher income doesn't increase default risk) |
| Integration / API tests | End-to-end request → response; latency budget |
| Infrastructure | Docker builds, security scan |

**Example: a GitHub Actions workflow.**
```yaml
name: ml-ci
on: [push, pull_request]
jobs:
  test-train-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - run: pip install -r requirements.txt -r requirements-dev.txt
      - run: ruff check . && pytest -q tests/
      - run: dvc pull data/sample          # small sample dataset for CI
        env: { AWS_ACCESS_KEY_ID: "${{ secrets.AWS_ACCESS_KEY_ID }}", AWS_SECRET_ACCESS_KEY: "${{ secrets.AWS_SECRET_ACCESS_KEY }}" }
      - run: python -m churn.train --config configs/ci.yaml
      - run: python -m churn.quality_gate --min-pr-auc 0.55   # fails the build if the model regresses
      - run: docker build -t churn-api:${{ github.sha }} .
```

**Deployment strategies.** Shadow → canary (5% → 25% → 100%) with automated rollback on metric regressions. Blue-green for instant switches. **CML** (from the DVC team) posts metric reports as comments on pull requests.

**Check yourself.** Write two "model tests" (beyond overall accuracy) for a loan-default model.

---

## 13. Model Monitoring

**Why.** Models degrade silently. The code doesn't crash; the predictions just get worse.

**What to monitor (four layers).**
| Layer | Metrics | Example alert |
|---|---|---|
| **Service health** | Latency (p50/p95/p99), throughput, error rate, CPU/GPU/memory | p95 > 100 ms for 5 minutes |
| **Data quality** | Schema violations, missing rates, out-of-range values, new categories | `income` null rate jumps from 2% to 40% |
| **Drift** | Input feature distributions, prediction distribution | PSI > 0.25 on top features |
| **Model performance** | Accuracy/AUC/MAE once labels arrive; business KPIs | Weekly PR-AUC drops 10% below baseline |

**The label delay problem.** True outcomes often arrive late (churn after 30 days, loan defaults after months). Meanwhile, monitor **proxies**: input drift, prediction drift, and early signals.

**Tools.** Prometheus + Grafana (service metrics), **Evidently AI**, WhyLabs/whylogs, NannyML (estimates performance without labels), Arize, Fiddler, and cloud-native monitors (SageMaker Model Monitor, Vertex AI Model Monitoring).

**Logging for monitoring.** For each prediction, log the timestamp, model version, input features (or a hash or sample, respecting privacy), the prediction, and the latency. Later, join with the true outcome.

**Check yourself.** For a model whose labels arrive 90 days later, what can you monitor on day 1?

---

## 14. Data Drift

**Definition.** The **input distribution P(X) changes** between training and production (also called covariate shift).

**Causes.** New customer segments, seasonality, marketing campaigns, a product UI change, an upstream pipeline bug (units changed from £ to pence), sensor recalibration.

**Detection methods.**
| Method | For | Notes |
|---|---|---|
| **Population Stability Index (PSI)** | Numeric (binned) / categorical | PSI = Σ (pₚᵣₒd − pₜᵣₐᵢₙ)·ln(pₚᵣₒd/pₜᵣₐᵢₙ). As a rule of thumb, < 0.1 is stable, 0.1-0.25 is moderate, > 0.25 is significant |
| Kolmogorov-Smirnov test | Numeric | Very sensitive with large samples (everything looks "significant"); look at effect sizes |
| Chi-square test | Categorical | |
| Jensen-Shannon / Wasserstein distance | Any | Bounded, interpretable distances |
| Domain classifier | Multivariate | Train a model to tell training from production data; AUC ≫ 0.5 means drift |

```python
import numpy as np
def psi(expected, actual, bins=10):
    edges = np.unique(np.quantile(expected, np.linspace(0, 1, bins + 1)))
    e = np.histogram(expected, edges)[0] / len(expected)
    a = np.histogram(np.clip(actual, edges[0], edges[-1]), edges)[0] / len(actual)
    e, a = np.clip(e, 1e-6, None), np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))
```

```python
from evidently import Report
from evidently.presets import DataDriftPreset
report = Report([DataDriftPreset()])
snapshot = report.run(reference_data=train_df, current_data=prod_df)
snapshot.save_html("drift_report.html")
```

**Important.** Drift does **not always** hurt performance (it may affect unimportant features). Prioritise drift in the **important features** and confirm the impact on performance.

**Check yourself.** Compute the PSI contribution of one bin where the training share is 10% and the production share is 25%. ((0.25 − 0.10)·ln(2.5) ≈ 0.137.)

---

## 15. Concept Drift

**Definition.** The **relationship between inputs and target, P(y | X), changes**. The same inputs now mean something different.

**Examples.**
- Fraudsters change tactics after a model is deployed (adversarial drift).
- The COVID-19 pandemic changed purchasing behaviour for the same customer profiles.
- A competitor's price cut changes what makes customers churn.
- Spam evolves to evade filters.

**Types (by time pattern).**
| Type | Pattern | Response |
|---|---|---|
| Sudden | An abrupt change (a policy change, a pandemic) | Rapid retraining on post-change data |
| Gradual | Slow transition | Regular retraining; weight recent data more |
| Incremental | Continuous small shifts | Online learning or frequent retraining |
| Recurring / seasonal | Patterns return (holidays) | Seasonal features; models per season |

**Detection.** Concept drift can only be confirmed with **labels**. Monitor performance over time windows, the error rate per segment, and statistical drift detectors (DDM, ADWIN) on the stream of errors.

**Data drift vs concept drift.**
| | Data drift | Concept drift |
|---|---|---|
| What changes | P(X) | P(y \| X) |
| Detect without labels? | Yes | No (proxies only) |
| Example | More young users sign up | Young users now churn for different reasons |

Label shift (a change in P(y), for example the fraud base rate doubling) is a third type that affects calibration and thresholds.

**Check yourself.** Input distributions look stable, but the model's precision has dropped sharply. Which type of drift is likely, and how do you confirm it?

---

## 16. Model Performance Monitoring

**Closing the loop.** Join predictions with their eventual outcomes, then compute metrics over time.

```
prediction log (id, ts, version, features, score)  ⋈  outcomes (id, label, label_ts)
                         → daily/weekly metrics by version and segment → dashboard + alerts
```

**Good practice.**
- Track the **same metrics as offline evaluation**, plus business KPIs (retention rate, fraud loss).
- Break the metrics down **by segment and model version**.
- Compute **confidence intervals**, because small weekly samples are noisy.
- Watch **calibration** over time (predicted vs observed rates).
- Set **alert thresholds relative to the baseline** and route alerts to an owner (on-call or a runbook).
- **Beware feedback loops:** if the model's decisions change outcomes (for example blocked transactions never reveal whether they were fraud), keep a small **holdout or exploration group** to get unbiased labels.

**Without labels yet?** Estimate performance (NannyML's confidence-based performance estimation), monitor prediction drift, and use human review of samples.

**Check yourself.** A fraud model blocks high-risk transactions, so you never learn whether they were really fraud. How can you still measure its precision fairly?

---

## 17. Retraining Strategies

| Strategy | Trigger | Pros | Cons |
|---|---|---|---|
| **Scheduled (periodic)** | Every day, week or month | Simple and predictable | May retrain needlessly or too late |
| **Performance-triggered** | A metric drops below a threshold | Retrains only when needed | Needs timely labels |
| **Drift-triggered** | PSI or drift tests exceed a threshold | Works before labels arrive | Drift ≠ degradation (false alarms) |
| **Online / continual learning** | Every new example or mini-batch | Adapts fastest | Risk of instability, forgetting and poisoning; hard to validate |

**Data window choices.** A sliding window (recent N months), an expanding window (all history), or weighting recent data more heavily. With sudden concept drift, use only post-change data.

**A safe retraining pipeline.**
1. Pull fresh, validated data.
2. Retrain with the **same pipeline code** (versioned).
3. Evaluate against the **current champion** on the *same* recent holdout data, including slices and fairness checks.
4. Register it as a challenger. Promote only if it is better (the quality gate).
5. Shadow or canary deploy, then promote, keeping instant rollback available.

**Check yourself.** Why should a retrained model be compared with the current production model on the *same* recent data rather than with its own historical test score?

---

## 18. ML Pipeline Automation

**Goal.** Connect everything (data → validation → features → training → evaluation → registration → deployment → monitoring) into **automated, scheduled, observable workflows**.

**Orchestrators.**
| Tool | Style | Notes |
|---|---|---|
| **Apache Airflow** | Python DAGs, scheduler | Industry standard for data pipelines |
| **Prefect** | Pythonic flows and tasks | Easy local-to-cloud; dynamic workflows |
| Dagster | Asset-based (data assets as first-class) | Strong lineage and testing |
| Kubeflow Pipelines | Containers on Kubernetes | Scalable ML pipelines |
| Vertex AI / SageMaker Pipelines | Managed | Integrated with cloud ML services |
| ZenML, Metaflow | ML-focused abstractions | Portable across infrastructure |
| DVC pipelines | Git-based stages | Lightweight and local-first |

**Example: a Prefect training flow.**
```python
from prefect import flow, task

@task(retries=2)
def extract(snapshot_date): ...
@task
def validate(df): ...                      # Pandera / Great Expectations
@task
def train(df, cfg): ...                    # logs to MLflow, returns run_id
@task
def evaluate_vs_champion(run_id) -> bool: ...
@task
def promote(run_id): ...                   # set the @champion alias

@flow(name="weekly-churn-retrain")
def retrain(snapshot_date: str, cfg_path: str = "configs/lgbm.yaml"):
    df = validate(extract(snapshot_date))
    run_id = train(df, cfg_path)
    if evaluate_vs_champion(run_id):
        promote(run_id)

# Deploy with a schedule, e.g. every Monday 02:00:
# retrain.serve(name="weekly", cron="0 2 * * 1")
```

**Principles.** Make tasks idempotent (safe to rerun), add retries and alerts, log lineage, separate configuration from code, and test pipelines in CI.

**Check yourself.** Why should each pipeline task be idempotent?

---

## 19. Model Reliability and Scalability

**Reliability: the service keeps working correctly.**
- **SLOs:** for example 99.9% availability and p95 latency under 100 ms.
- **Graceful degradation:** fall back to a simpler model, cached predictions or business rules if the model or feature store fails.
- **Timeouts, retries with backoff, circuit breakers** for dependencies.
- **Input validation** and safe defaults for missing features.
- **Health and readiness probes**, multiple replicas, and multi-zone deployment.
- **Runbooks and on-call ownership** for model incidents.

**Scalability: handling more load efficiently.**
| Technique | Effect |
|---|---|
| Horizontal autoscaling (replicas) | Throughput |
| **Dynamic batching** of requests (Triton, Ray Serve, TorchServe) | GPU efficiency |
| Caching (repeat inputs, precomputed embeddings) | Latency and cost |
| **Model optimisation:** quantisation (INT8/INT4), pruning, **distillation** to smaller models, ONNX Runtime / TensorRT compilation | Latency, memory and cost |
| Async / queue-based processing | Absorbs spikes |
| Precomputing in batch | Removes real-time load |
| Right hardware (CPU vs GPU; instance sizing) | Cost-efficiency |

**Load testing.** Use Locust or k6 to find the throughput limits and latency curves before launch.

**Cost awareness.** Track cost per 1,000 predictions, and use autoscaling to zero for low-traffic services.

**Check yourself.** Your model's p99 latency spikes during traffic peaks. Name three changes that could fix it.

---

## 20. ML Security and Responsible AI

### ML security

**Threats specific to ML systems.**
| Threat | Description | Mitigations |
|---|---|---|
| **Data poisoning** | Attackers corrupt the training data (for example fake reviews) to manipulate the model | Data provenance, validation, anomaly detection on training data, restricting who can write data |
| **Adversarial examples / evasion** | Small, crafted input changes cause misclassification | Adversarial training, input validation, ensembles, monitoring |
| **Model extraction / stealing** | Repeated queries reconstruct the model | Rate limiting, authentication, returning labels rather than full probabilities where possible |
| **Membership inference / data leakage** | Inferring whether someone's data was used in training; memorised personal data in outputs | Differential privacy, regularisation, data minimisation |
| **Supply chain** | Malicious pickles, compromised packages or pretrained weights | Safe formats (safetensors), pinned and scanned dependencies, trusted sources, signed artifacts |
| **Prompt injection** (LLM apps) | Untrusted text overrides the system's instructions | Treat model output as untrusted, least-privilege tools, input/output filtering, human approval for risky actions |
| **Infrastructure** | Exposed endpoints, leaked secrets | Authentication, network policies, secret managers, the OWASP Top 10 for LLM Applications |

### Responsible AI

**Principles.** Fairness, transparency and explainability, privacy, safety and reliability, accountability, and human oversight.

**Fairness in practice.**
- Evaluate metrics **by group** (with appropriate legal care around protected attributes).
- Common criteria: **demographic parity** (equal positive rates), **equal opportunity** (equal TPR), **equalised odds** (equal TPR and FPR). These usually **cannot all be satisfied at once**, so choose based on context and harm.
- Sources of bias: historical bias in labels, unrepresentative sampling, proxy features (a postcode standing in for ethnicity), measurement bias.
- Mitigation: better data, reweighting, fairness constraints during training, group-aware threshold adjustments where lawful, and **human review**.
- Tools: Fairlearn, AIF360, SHAP for explanations.

```python
from fairlearn.metrics import MetricFrame, selection_rate
from sklearn.metrics import recall_score
mf = MetricFrame(metrics={"recall": recall_score, "selection_rate": selection_rate},
                 y_true=y_test, y_pred=y_pred, sensitive_features=df_test["age_band"])
print(mf.by_group); print(mf.difference())
```

**Governance and regulation.**
- **Documentation:** model cards, datasheets for datasets, risk assessments.
- **Regulations:** the **EU AI Act** (risk-based obligations; high-risk systems such as credit scoring and hiring need risk management, data governance, logging, transparency and human oversight), **GDPR** (lawful basis, data minimisation, rights around automated decision-making), and sector rules (finance, health).
- **Frameworks:** NIST AI Risk Management Framework, ISO/IEC 42001 (AI management systems).
- **Human-in-the-loop** for high-stakes decisions, and clear routes for people to contest decisions.

**Check yourself.** A hiring-screening model has equal accuracy across genders but recommends women at half the rate of men. Which fairness criterion is violated, what could cause it, and what would you do next?

---

### Module 19 capstone
Take the churn service from Module 18 and make it production grade:
1. Version the data with DVC, and define the pipeline in `dvc.yaml`.
2. Track experiments and register models in MLflow, with `@champion` / `@challenger` aliases.
3. Add a GitHub Actions workflow: lint → tests → train on sample → quality gate → Docker build → push.
4. Deploy the container to a cloud service with secrets, health checks and autoscaling.
5. Add monitoring: request logging, a weekly Evidently drift report, and a performance job that joins the labels when they arrive.
6. Automate a weekly retraining flow (Prefect or Airflow) with champion/challenger evaluation.
7. Write a model card that includes fairness results by segment, plus a one-page incident runbook.

**Recommended resources.** Chip Huyen, *Designing Machine Learning Systems*; *Made With ML* (Goku Mohandas, free); Google, *Rules of Machine Learning*; *Machine Learning Engineering* (Andriy Burkov); the MLflow, DVC and Evidently documentation.
