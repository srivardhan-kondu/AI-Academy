# Module 18: Building End-to-End Machine Learning Applications

**Phase 6 · Production Engineering** · Goal: go from a business problem to a working ML application that other software and people can use, not just a notebook.

---

## 1. Understanding the End-to-End ML Lifecycle

```
 ┌──────────── Business problem ─────────────┐
 ▼                                            │
Scoping → Data → Features → Training → Evaluation → Packaging → Serving → Monitoring
                                                                      │
                     ◄──────── retrain / iterate ◄────────────────────┘
```

| Phase | Key outputs | Owner(s) |
|---|---|---|
| Scoping | Problem statement, success metric, constraints | Product + ML |
| Data | Datasets, data contracts, quality checks | Data engineering + ML |
| Features | Reusable feature pipelines | ML / data engineering |
| Training & experimentation | Tracked experiments, candidate models | ML |
| Evaluation | Offline report, fairness and robustness checks | ML + domain experts |
| Packaging | Versioned model artifact plus its preprocessing | ML engineering |
| Serving | API or batch job, latency/SLA | ML engineering + platform |
| Monitoring | Dashboards, drift alerts, feedback loop | ML engineering + ops |

**Hidden technical debt in ML systems** (Sculley et al., 2015): the model code is a small box surrounded by much larger systems for data collection, verification, feature extraction, serving infrastructure, configuration and monitoring. ML engineering is mostly about those surrounding systems.

**Check yourself.** List four components of a production ML system that are *not* the model.

---

## 2. Problem Definition and Business Requirements

**Questions to answer before writing code.**
1. **What decision or action** will the prediction drive? Who uses it, and how?
2. **What is the target exactly?** ("Churn = no paid activity for 30 days after the renewal date.")
3. **What does success look like?** A business KPI (revenue retained) and an ML metric (recall at 70% precision).
4. **What is the baseline?** The current rules, human performance, or a simple heuristic.
5. **Constraints:** latency (50 ms?), throughput, cost, interpretability, regulation (GDPR, sector rules), fairness.
6. **When is the prediction made, and what data exists then?** (This prevents leakage.)
7. **What is the cost of each type of error?**
8. **Is ML even needed?** Would a rule or SQL query do?

**Write it down in a one-page ML design doc / model brief:** objective, users, data sources, target definition, metrics, baselines, constraints, risks, rollout and monitoring plan.

**Check yourself.** Turn the vague goal "use AI to reduce customer churn" into a precise ML problem statement.

---

## 3. Dataset Collection and Preparation

**Sources.** Operational databases (via SQL or data warehouses such as BigQuery, Snowflake and Redshift), event streams (Kafka), APIs, logs, third-party data, and human labelling.

**Engineering practices.**
- **Point-in-time correctness:** build training rows using only the data available at each prediction moment (a "snapshot" or "as-of" join).
- **Data contracts and validation:** check schemas, types, ranges and null rates automatically (Great Expectations, Pandera, `pydantic` models).
- **Labelling:** clear guidelines, measured inter-annotator agreement, gold-standard checks, and active learning to label the most informative examples.
- **Versioning:** snapshot the datasets (DVC, Delta Lake, Module 19) so every model can be reproduced.
- **Privacy:** minimise personal data, pseudonymise IDs, respect consent and retention rules.

```python
import pandera.pandas as pa   # older versions: import pandera as pa
schema = pa.DataFrameSchema({
    "customer_id": pa.Column(str, unique=True),
    "age": pa.Column(int, pa.Check.in_range(18, 110), nullable=True),
    "monthly_charges": pa.Column(float, pa.Check.ge(0)),
    "churned": pa.Column(int, pa.Check.isin([0, 1])),
})
schema.validate(df)        # raises with a clear report if the data breaks the contract
```

**Check yourself.** Why is "point-in-time correctness" the most common source of leakage in production ML datasets?

---

## 4. Exploratory Data Analysis

In a production project, EDA has extra goals beyond Module 02's checklist:
- **Confirm the target definition** behaves as expected (base rate, trend over time).
- **Check representativeness:** does the training period reflect production? Seasonality? Recent policy changes?
- **Quantify data quality** and turn the findings into **automated validation rules**.
- **Check the label and feature distributions by segment** for fairness risks.
- **Estimate how much signal there is:** quick baselines (logistic regression, LightGBM) on a sample.
- **Document everything** in a reproducible notebook or report that stakeholders can read.

**Check yourself.** EDA shows the churn rate doubled three months ago after a price change. How does this affect your training window and validation strategy?

---

## 5. Feature Engineering Pipelines

**Requirement.** Features must be computed **identically** in training and serving. Any mismatch causes **training-serving skew**, a silent and common production bug.

**Approaches.**
| Approach | How | When |
|---|---|---|
| Model-bundled preprocessing | scikit-learn `Pipeline` / `ColumnTransformer` saved with the model | Most projects; features derivable from the request |
| Shared feature code | One Python package used by both the training job and the API | Custom transformations |
| **Feature store** (Feast, Tecton, Databricks) | Central definitions, an offline store (training) and an online store (low-latency serving), point-in-time joins | Many models sharing features; real-time aggregates |
| SQL / dbt transformations | Features built in the warehouse | Batch-oriented analytics teams |

**Best practices.** Write features as pure, tested functions. Version feature definitions. Log the feature values used at prediction time, so you can debug and use them for future training.

**Check yourself.** A "number of purchases in the last 7 days" feature is computed nightly for training but in real time for serving. What skew can occur?

---

## 6. Model Training and Experimentation

**Make experiments systematic.**
- **Configuration files** (YAML, Hydra) instead of hard-coded values.
- **Track every run:** code version (git SHA), data version, parameters, metrics, artifacts (MLflow, Weights & Biases; Module 19).
- **Seeds and environment pinning** for reproducibility.
- **One change at a time** relative to a baseline, so you know what helped.
- **Training scripts, not notebooks,** for anything that will be rerun: `python -m churn.train --config configs/lgbm.yaml`.

```python
# src/churn/train.py (sketch)
import mlflow, yaml, joblib
def main(cfg_path):
    cfg = yaml.safe_load(open(cfg_path))
    X_train, y_train, X_val, y_val = load_splits(cfg["data"])
    pipe = build_pipeline(cfg["model"])
    with mlflow.start_run():
        mlflow.log_params(flatten(cfg))
        pipe.fit(X_train, y_train)
        metrics = evaluate(pipe, X_val, y_val)
        mlflow.log_metrics(metrics)
        mlflow.sklearn.log_model(pipe, name="model")
```

**Check yourself.** Six weeks from now, someone asks how model v3 was trained. What must you have recorded to answer exactly?

---

## 7. Model Evaluation and Selection

**Beyond the headline metric:**
1. **Compare against the baselines** (the current system, a heuristic, a simple model).
2. **Confidence intervals** (bootstrap) on the key metrics.
3. **Slice-based evaluation:** performance by segment (region, device, customer tier, protected groups).
4. **Robustness:** noisy or missing inputs, out-of-range values, recent data (temporal holdout).
5. **Calibration** if the probabilities are used.
6. **Error analysis:** inspect the worst errors and group them by cause.
7. **Operational metrics:** latency, memory, model size, cost per 1,000 predictions.
8. **Explainability:** global (SHAP summary) and local explanations for stakeholders.

**Selection criteria.** The simplest model that meets the requirements is often best. A slight accuracy gain rarely justifies 10× the latency or an unexplainable model in a regulated context.

**Model card.** Document the intended use, training data, metrics (including by slice), limitations, ethical considerations, and the owner (Mitchell et al., 2019).

**Check yourself.** Model A has AUC 0.88 and p95 latency 8 ms. Model B has AUC 0.89 and p95 latency 140 ms, and the SLA is 50 ms. Which do you ship?

---

## 8. Building Reusable ML Pipelines

**Two levels of pipeline.**
1. **Model pipeline:** preprocessing plus the model as one object (scikit-learn `Pipeline`). It travels with the artifact.
2. **Workflow pipeline:** the steps of the whole process (ingest → validate → features → train → evaluate → register), orchestrated and scheduled.

**Recommended project layout.**
```
churn-ml/
├── configs/                 # YAML configs per experiment
├── src/churn/
│   ├── data.py              # load + validate
│   ├── features.py          # feature functions / ColumnTransformer
│   ├── train.py             # training entry point
│   ├── evaluate.py
│   └── predict.py           # shared inference logic (used by the API and the batch job)
├── api/main.py              # FastAPI app
├── tests/                   # unit tests for features, schema, API
├── dvc.yaml                 # pipeline stages (Module 19)
├── Dockerfile
└── pyproject.toml
```

**Orchestrators.** DVC pipelines (simple, Git-based), Prefect and Airflow (general workflows), Kubeflow Pipelines and Vertex AI Pipelines (Kubernetes / cloud), and ZenML and Metaflow (ML-focused).

**Check yourself.** Why should `predict.py` be shared between the batch job and the API, rather than each having its own copy of the preprocessing logic?

---

## 9. Model Serialization with Pickle and Joblib

**Serialisation** saves a trained Python object to disk so another process can load it.

```python
import joblib
joblib.dump(pipeline, "models/churn_v1.joblib", compress=3)
pipeline = joblib.load("models/churn_v1.joblib")
```

| Format | For | Notes |
|---|---|---|
| `pickle` | Any Python object | Built in |
| **`joblib`** | scikit-learn models with large NumPy arrays | Efficient for arrays; compression |
| `skops` | scikit-learn | Safer loading (checks the allowed types) |
| Native formats | XGBoost (`.json`/`.ubj`), LightGBM (`.txt`), CatBoost (`.cbm`) | Stable across versions |
| PyTorch `state_dict` / **safetensors** | Neural networks | Safe weight-only formats |
| **ONNX** | Cross-framework, cross-language | Fast runtimes (ONNX Runtime), C#/Java/JS serving |

**Two critical warnings.**
1. **Security: never unpickle untrusted files.** Unpickling can execute arbitrary code. Only load artifacts from trusted, access-controlled storage. Prefer safetensors, ONNX or skops where possible.
2. **Version compatibility:** a pickle may fail or silently misbehave under a different scikit-learn or Python version. **Pin the versions** and store them with the model (requirements file, MLflow environment).

**Save metadata with the model:** version, training date, data version, metrics, feature names and order, decision threshold, and library versions.

**Check yourself.** Why is it dangerous to let users upload a `.pkl` model file to your server?

---

## 10. Introduction to FastAPI

**What it is.** A modern, high-performance Python web framework for building APIs. It is based on type hints, uses **Pydantic** for validation and generates interactive documentation automatically.

**Why it suits ML serving.**
- Type-hinted request and response models are validated automatically.
- Auto-generated **OpenAPI/Swagger docs** at `/docs`.
- Async support and high throughput (Starlette plus Uvicorn).
- Simple to containerise.

```python
# api/main.py
from fastapi import FastAPI
app = FastAPI(title="Churn Prediction API", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "ok"}
```
```bash
pip install "fastapi[standard]"
fastapi dev api/main.py                 # or: uvicorn api.main:app --reload
# open http://127.0.0.1:8000/docs
```

**Alternatives.** Flask (simpler, older), BentoML, Ray Serve, TorchServe, NVIDIA Triton, and KServe (dedicated model servers for scaling, batching and GPUs).

**Check yourself.** What is the benefit of the auto-generated `/docs` page for the teams that consume your ML API?

---

## 11. Building ML Prediction APIs

```python
# api/main.py
from contextlib import asynccontextmanager
from typing import Literal
import joblib, pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_PATH = "models/churn_v1.joblib"
state: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    bundle = joblib.load(MODEL_PATH)            # load ONCE at startup, not per request
    state["pipeline"] = bundle["pipeline"]
    state["threshold"] = bundle["threshold"]
    state["version"] = "churn_v1"
    yield
    state.clear()

app = FastAPI(title="Churn Prediction API", version="1.0.0", lifespan=lifespan)

class Customer(BaseModel):
    tenure_months: int = Field(ge=0, le=600)
    monthly_charges: float = Field(ge=0)
    n_support_calls_90d: int = Field(ge=0)
    contract: Literal["month-to-month", "one-year", "two-year"]
    payment_method: str
    city: str

class Prediction(BaseModel):
    churn_probability: float
    will_churn: bool
    model_version: str

@app.post("/predict", response_model=Prediction)
def predict(customer: Customer):
    try:
        X = pd.DataFrame([customer.model_dump()])
        p = float(state["pipeline"].predict_proba(X)[0, 1])
    except Exception as e:                      # log the full error internally; return a safe message
        raise HTTPException(status_code=500, detail="Prediction failed") from e
    return Prediction(churn_probability=round(p, 4),
                      will_churn=p >= state["threshold"],
                      model_version=state["version"])

@app.post("/predict/batch", response_model=list[Prediction])
def predict_batch(customers: list[Customer]):
    X = pd.DataFrame([c.model_dump() for c in customers])
    probs = state["pipeline"].predict_proba(X)[:, 1]
    return [Prediction(churn_probability=round(float(p), 4), will_churn=bool(p >= state["threshold"]),
                       model_version=state["version"]) for p in probs]
```

```bash
curl -X POST localhost:8000/predict -H "Content-Type: application/json" \
  -d '{"tenure_months": 3, "monthly_charges": 80, "n_support_calls_90d": 4,
       "contract": "month-to-month", "payment_method": "card", "city": "Leeds"}'
```

**Production concerns.** Load the model once at startup. Run several Uvicorn/Gunicorn workers. Add timeouts, request logging (inputs, outputs, latency, model version) and authentication (API keys or OAuth). Add rate limiting, and test with `fastapi.testclient.TestClient`.

**Check yourself.** Why should the model be loaded in the `lifespan` handler rather than inside the `predict` function?

---

## 12. Request and Response Validation

**Pydantic models are your API contract.** Invalid requests are rejected with **HTTP 422** and a clear explanation before they ever reach the model.

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict

class Customer(BaseModel):
    model_config = ConfigDict(extra="forbid")      # reject unexpected fields
    tenure_months: int = Field(ge=0, le=600, description="Months since signup")
    monthly_charges: float = Field(gt=0, lt=10_000)
    email: str | None = None

    @field_validator("monthly_charges")
    @classmethod
    def round_charges(cls, v: float) -> float:
        return round(v, 2)
```

**What to validate.** Types, ranges, allowed categories (`Literal` or `Enum`), required vs optional fields, batch size limits, and string lengths (to prevent abuse).

**Response models** guarantee the output shape and prevent leaking internal fields.

**Testing.**
```python
from fastapi.testclient import TestClient
from api.main import app

def test_rejects_negative_tenure():
    with TestClient(app) as client:          # `with` runs the lifespan, so the model loads
        r = client.post("/predict", json={"tenure_months": -1, "monthly_charges": 50,
                                          "n_support_calls_90d": 0, "contract": "one-year",
                                          "payment_method": "card", "city": "York"})
        assert r.status_code == 422
```

**Check yourself.** A new contract type "three-year" starts appearing in requests. What happens with a `Literal` validator, and how should the team handle it?

---

## 13. Connecting ML Models to Web Applications

**Integration patterns.**
| Pattern | How | When |
|---|---|---|
| Frontend → backend → ML API | The web app's server calls the ML service over HTTP/gRPC | Most common; keeps the model private |
| Direct frontend → ML API | Browser calls the API (CORS needed) | Prototypes and internal tools |
| Embedded model | Model runs inside the main backend (same process) | Small models, simple systems |
| In-browser / on-device | ONNX Runtime Web, TensorFlow.js, Core ML, TF Lite | Privacy, offline use, zero server cost |
| Async / queue | The app publishes a job; a worker predicts; the result is stored or pushed | Slow models (seconds to minutes) |

**Quick UIs for demos and internal users.** **Streamlit** or **Gradio** turn a Python function into a web interface in minutes:
```python
import streamlit as st, requests
tenure = st.slider("Tenure (months)", 0, 72, 12)
charges = st.number_input("Monthly charges", 0.0, 500.0, 70.0)
if st.button("Predict"):
    r = requests.post("http://localhost:8000/predict", json={...}).json()
    st.metric("Churn probability", f"{r['churn_probability']:.0%}")
```

**From JavaScript (for example a Next.js app):**
```ts
const res = await fetch(`${process.env.ML_API_URL}/predict`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-API-Key": process.env.ML_API_KEY! },
  body: JSON.stringify(customer),
});
const { churn_probability } = await res.json();
```
(Call it from server-side code so the API key never reaches the browser.)

**UX considerations.** Show uncertainty and explanations where appropriate, design fallbacks for when the ML service is down, and collect user feedback as future labels.

**Check yourself.** Why should a public web app call the ML API from its backend instead of directly from the browser?

---

## 14. Batch Prediction vs Real-Time Prediction

| | **Batch (offline)** | **Real-time (online)** | **Streaming** |
|---|---|---|---|
| When predictions are made | On a schedule (hourly, nightly) for many records | On demand, per request | Continuously on event streams |
| Latency | Minutes to hours | Milliseconds | Seconds |
| Infrastructure | Scheduled job (Airflow, cron, Spark) writes to a table | API service, always on | Kafka/Flink + model |
| Features | Can be expensive and complete | Must be available quickly (online store) | Windowed aggregates |
| Cost | Cheap, efficient | Higher (always-on, scaling) | Higher |
| Examples | Nightly churn scores for a CRM; weekly demand forecasts | Fraud check at payment; search ranking; chat | Real-time anomaly detection on sensors |

**Rule.** Use **batch unless you truly need fresh predictions.** It is simpler, cheaper and easier to monitor. Hybrid designs are common: precompute in batch, and adjust in real time with fresh signals.

```python
# Batch scoring job: reads from the warehouse, writes scores back
df = pd.read_parquet("s3://bucket/customers/2025-01-15.parquet")
df["churn_score"] = pipeline.predict_proba(df[FEATURES])[:, 1]
df[["customer_id", "churn_score"]].assign(model_version="churn_v1", scored_at=pd.Timestamp.utcnow()) \
  .to_parquet("s3://bucket/scores/churn/2025-01-15.parquet")
```

**Check yourself.** For each case, choose batch or real-time: (a) credit-card fraud, (b) monthly sales forecasts, (c) product recommendations on the homepage, (d) email marketing churn campaigns.

---

## 15. Model Versioning

**Why.** Reproducibility, safe rollbacks, auditing ("which model made this decision?"), and comparing versions in production.

**What a model version must link together:**
```
model v7 ─┬─ code commit (git SHA)
          ├─ data version (DVC hash / table snapshot)
          ├─ config / hyperparameters
          ├─ environment (library versions, Docker image)
          ├─ metrics (offline evaluation report)
          └─ lineage: who trained it, when, approval status
```

**Practices.**
- **Semantic versioning** for models: major (breaking change to the input schema), minor (retrained with new data or features), patch (fix).
- A **model registry** (MLflow, SageMaker, Vertex AI) with stages or aliases: `staging` → `production` → `archived`.
- **Immutable artifacts:** never overwrite `model.joblib`; publish a new version.
- **Return `model_version` in every prediction** and log it.
- **Deployment strategies:** shadow mode (the new model predicts silently alongside the old one), canary (a small percentage of traffic), A/B testing, blue-green, with instant rollback.

**Check yourself.** A customer disputes an automated decision from three months ago. What must your versioning system let you reconstruct?

---

## 16. Building an ML Application from Scratch

**Capstone: a Churn Prediction Service, end to end.**

**1. Scope.** Predict 30-day churn for subscription customers. The retention team calls the top 5% highest-risk customers weekly. Metric: precision@5% plus PR-AUC. Constraint: p95 latency under 100 ms for the CRM's on-demand lookups.

**2. Data and validation.** Extract point-in-time snapshots and validate them with Pandera. Version them with DVC.

**3. Pipeline and training.** `ColumnTransformer` + LightGBM inside a scikit-learn `Pipeline`. Optuna tuning with stratified CV. Threshold chosen on validation data for precision@5%. MLflow tracking.

**4. Evaluation.** Test-set metrics with bootstrap CIs, slices by plan and region, SHAP explanations, and a model card.

**5. Packaging.** Bundle the pipeline, threshold and metadata into `churn_vX.joblib`, and register it in MLflow.

**6. Serving.** A FastAPI app with `/health`, `/predict` and `/predict/batch`, Pydantic validation and structured logging.
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ src/
COPY api/ api/
COPY models/ models/
EXPOSE 8000
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

**7. Batch job.** A weekly scoring job writes scores to the CRM table.

**8. Testing and CI.** Unit tests (features, schema), API tests (TestClient), and a model quality gate (fail the build if PR-AUC drops below the threshold). Run with GitHub Actions.

**9. Deploy.** A container on a cloud service (Cloud Run, ECS, Azure Container Apps, or Kubernetes), with secrets in a secret manager.

**10. Monitor.** Latency and error rates, the prediction distribution, input drift, and realised churn (once the labels arrive 30 days later). Plan retraining (Module 19).

**Deliverables.** A Git repo with a README (how to train, test, run and deploy), a Docker image, the API docs, a model card and a monitoring dashboard.
