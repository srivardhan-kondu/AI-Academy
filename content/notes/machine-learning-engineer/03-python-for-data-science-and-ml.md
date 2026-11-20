# Module 03: Python for Data Science and Machine Learning

**Phase 1 · Foundation** · Goal: turn raw, messy data into a clean, reproducible, model-ready dataset using real ML workflow tools.

---

## 1. Understanding the Machine Learning Development Workflow

**In plain English.** An ML project is not "train a model". It is a loop:

```
Define problem → Get data → Explore → Clean & prepare → Engineer features
      ↑                                                        ↓
 Monitor ← Deploy ← Evaluate on test set ← Tune ← Train baseline → Train better models
```

**Stages and their deliverables.**
| Stage | Key question | Output |
|---|---|---|
| Problem framing | What decision will the prediction support? What does success cost? | Target definition, metric, baseline |
| Data | Do we have the right data, legally and in enough volume? | Raw dataset plus data card |
| EDA | What does the data actually look like? | Findings and cleaning plan |
| Preparation | How do we make it model-ready *without leakage*? | A reusable pipeline |
| Modelling | What is the simplest model that beats the baseline? | Trained candidates |
| Evaluation | Does it generalise? Is it fair? Where does it fail? | Test report and error analysis |
| Deployment and monitoring | Does it keep working? | API, dashboards, alerts |

**Reality check.** Practitioners commonly report spending most of their time (often quoted as 60-80%) on data work rather than modelling.

**Check yourself.** Why should you define the evaluation metric *before* you train anything?

---

## 2. Working with Real-World Datasets

**In plain English.** Real data is messy: inconsistent formats, typos, missing values, duplicates, wrong units, bias in how it was collected, and documentation that is out of date.

**Where datasets come from.** Company databases (SQL), APIs, logs, spreadsheets, public repositories (Kaggle, UCI ML Repository, Hugging Face Datasets, OpenML, government open-data portals).

**Questions to ask about any dataset.**
- **Provenance:** who collected it, when, how and why?
- **Unit of observation:** what does one row represent (a customer, a transaction, a customer-month)?
- **Time:** what time period does it cover? Is it a snapshot or a history?
- **Labels:** how was the target defined, and by whom? How noisy is it?
- **Representativeness:** does it reflect the population the model will serve?
- **Licence and privacy:** may you use it? Does it contain personal data (GDPR or similar)?

**Check yourself.** A churn dataset contains only customers who are still active today. What bias does that create?

---

## 3. Data Loading and Inspection

```python
import pandas as pd
df = pd.read_csv("data/customers.csv")

df.shape                     # rows, columns
df.head(); df.sample(5, random_state=0)   # random rows show more than the first rows
df.info(memory_usage="deep") # dtypes, non-null counts, memory
df.describe(include="all").T
df.nunique().sort_values()   # cardinality: spot IDs and constant columns
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")   # tidy names
```

**What to look for.** Numeric columns read as `object` (because of stray text like `"N/A"`), date columns read as strings, constant columns (no information), ID-like columns (unique per row, usually not features), and inconsistent categories (`"UK"`, `"U.K."`, `"united kingdom"`).

**Loading from SQL.**
```python
from sqlalchemy import create_engine
engine = create_engine("postgresql://user:pass@host/db")
df = pd.read_sql("SELECT * FROM customers WHERE signup_date >= '2024-01-01'", engine)
```
(Keep credentials in environment variables, never in code.)

**Check yourself.** Why is `df.sample()` a better first look than `df.head()`?

---

## 4. Data Cleaning and Transformation

**Common cleaning operations.**
```python
# Fix types
df["total_charges"] = pd.to_numeric(df["total_charges"], errors="coerce")  # bad -> NaN
df["signup_date"] = pd.to_datetime(df["signup_date"], errors="coerce")

# Standardise text categories
df["country"] = (df["country"].str.strip().str.lower()
                 .replace({"u.k.": "uk", "united kingdom": "uk"}))

# Fix impossible values
df.loc[~df["age"].between(0, 120), "age"] = pd.NA

# Derive simple columns
df["tenure_years"] = df["tenure_months"] / 12

# Rename and drop
df = df.drop(columns=["unused_col"]).rename(columns={"cust_id": "customer_id"})
```

**Principles.**
1. **Never edit raw data in place.** Keep `data/raw/` read-only and write cleaned data to `data/processed/`.
2. **Make cleaning a function** (`clean(df) -> df`) so the same steps run in training and in production.
3. **Log what changed:** how many rows were dropped and how many values were coerced.
4. **Separate cleaning from learned transforms.** Fixing typos is fine to do on the whole dataset. Anything that *learns from the data* (means, medians, scalers, encoders) must be fitted on training data only.

**Check yourself.** Which of these are safe to do before the train/test split: lower-casing strings, filling NaNs with the column mean, removing exact duplicate rows, scaling to unit variance?

---

## 5. Handling Duplicate Records

```python
df.duplicated().sum()                                 # exact duplicate rows
df[df.duplicated(keep=False)]                         # inspect all copies
df.duplicated(subset=["customer_id"]).sum()           # duplicate keys
df = df.drop_duplicates()
df = (df.sort_values("updated_at")
        .drop_duplicates(subset=["customer_id"], keep="last"))   # keep the latest record
```

**Why duplicates matter in ML.**
- They over-weight some examples during training.
- **Leakage:** the same record can land in both train and test sets, which inflates scores.
- **Near-duplicates** (the same person with a different email capitalisation) need fuzzy matching or normalisation first.

**Group-aware splitting.** If one patient has many rows, split by patient with `GroupShuffleSplit` or `GroupKFold`, so the model is not tested on people it has already seen.

**Check yourself.** A medical image dataset has three scans per patient. Why is a random row-level split dangerous?

---

## 6. Missing Data Imputation

**Strategies.**
| Method | When | Caveat |
|---|---|---|
| Drop rows | Very few missing values, MCAR | Loses data and can bias it |
| Drop column | Mostly missing *and* uninformative | You lose any signal |
| Mean / median | Numeric, quick baseline | Shrinks variance; median is robust to outliers |
| Most frequent / "Missing" | Categorical | "Missing" as its own category is often best |
| Constant + indicator | Missingness is informative | Adds columns |
| KNN imputer | Values related to similar rows | Slow on big data; needs scaling |
| Iterative (MICE-style) | Features predict each other | Slower; can overfit |
| Model-native | Gradient-boosted trees handle NaN | Only for those models |

```python
from sklearn.impute import SimpleImputer, KNNImputer
num_imputer = SimpleImputer(strategy="median", add_indicator=True)
num_imputer.fit(X_train_num)                 # learn medians from TRAIN only
X_train_num = num_imputer.transform(X_train_num)
X_test_num  = num_imputer.transform(X_test_num)  # reuse the train medians
```

**Pitfall.** Never impute the **target**. Drop rows with a missing label (or treat them as unlabelled data).

**Check yourself.** Why must the imputer learn its median from the training set only, even though "it's just a median"?

---

## 7. Outlier Detection and Treatment

**Detection.**
```python
# IQR rule
q1, q3 = df["income"].quantile([0.25, 0.75])
iqr = q3 - q1
mask = ~df["income"].between(q1 - 1.5 * iqr, q3 + 1.5 * iqr)

# Z-score (assumes roughly normal data)
z = (df["income"] - df["income"].mean()) / df["income"].std()
mask = z.abs() > 3

# Multivariate: IsolationForest (Module 11), or visual checks with box plots and scatter plots
```

**Treatment options.**
| Option | When |
|---|---|
| Fix | It is a data error (an age of 999, wrong units) |
| Remove | It is clearly invalid *and* would not occur in production |
| Cap / winsorise | It is real but extreme, and the model is sensitive (linear models) |
| Transform | Skewed data (`np.log1p`, Box-Cox, Yeo-Johnson) |
| Keep | It is real and important (fraud *is* the outlier!) |
| Robust model | Trees and robust losses (Huber) are less affected |

**Pitfall.** Removing outliers blindly from the *test* set makes your evaluation dishonest. Production data will contain them.

**Check yourself.** In a fraud-detection project, why might removing outliers destroy your model?

---

## 8. Feature Creation Using Python

**In plain English.** Features are the inputs the model sees. Good features expose the signal in a form the model can use easily.

```python
# Ratios and interactions
df["charge_per_month"] = df["total_charges"] / df["tenure_months"].clip(lower=1)

# Dates -> parts and durations
df["signup_month"] = df["signup_date"].dt.month
df["signup_dow"] = df["signup_date"].dt.dayofweek
df["days_since_signup"] = (pd.Timestamp("2025-01-01") - df["signup_date"]).dt.days

# Binning
df["age_band"] = pd.cut(df["age"], bins=[0, 25, 40, 60, 120],
                        labels=["<25", "25-40", "40-60", "60+"])

# Aggregates from another table (behaviour)
agg = orders.groupby("customer_id").agg(n_orders=("order_id", "count"),
                                        avg_value=("amount", "mean"),
                                        last_order=("date", "max"))
df = df.merge(agg, on="customer_id", how="left")

# Text
df["review_len"] = df["review"].str.len()
df["has_refund_word"] = df["review"].str.contains("refund", case=False)
```

**Domain knowledge is the strongest feature engineer.** Ask experts which signals they use.

**Pitfall: time leakage.** Aggregates must use only data available **before** the prediction time. "Number of support calls in the last 30 days" must not include calls made after the churn date.

**Check yourself.** You are predicting whether a loan will default. Why is "number of late payments" (computed over the whole loan history) a dangerous feature?

---

## 9. Data Encoding Techniques

**In plain English.** Models need numbers, so categories must be encoded.

| Encoding | How | Use when |
|---|---|---|
| One-hot | One 0/1 column per category | Nominal categories, low or medium cardinality |
| Ordinal | Map to ordered integers | Categories with a real order (S < M < L) |
| Target / mean | Replace a category with the target mean (cross-fitted) | High cardinality (zip codes) |
| Frequency / count | Replace with how often the category occurs | High cardinality, quick baseline |
| Hashing | Hash into a fixed number of columns | Huge or unknown vocabularies |
| Embeddings | Learned dense vectors | Deep learning |

```python
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
ohe = OneHotEncoder(handle_unknown="ignore", min_frequency=20, sparse_output=False)
ord_enc = OrdinalEncoder(categories=[["S", "M", "L", "XL"]])
```

**Pitfalls.**
- Ordinal-encoding nominal data (`red=0, green=1, blue=2`) tells linear models that blue > green > red.
- `pd.get_dummies` on train and test separately can produce **different columns**. Use a fitted `OneHotEncoder`.
- Target encoding without cross-fitting leaks the label.

Module 14 covers encoding in more depth.

**Check yourself.** A new city appears in production that was never seen in training. What does `handle_unknown="ignore"` do with it?

---

## 10. Data Normalisation and Standardisation

| Method | Formula | Result | Good for |
|---|---|---|---|
| Standardisation (z-score) | `(x − μ) / σ` | Mean 0, std 1 | Linear models, SVM, PCA, neural networks |
| Min-max normalisation | `(x − min) / (max − min)` | Range [0, 1] | Bounded inputs (pixels), some neural networks |
| Robust scaling | `(x − median) / IQR` | Centred, outlier-resistant | Data with outliers |
| Log / power transform | `log1p(x)`, Yeo-Johnson | Less skew | Heavy right tails (income, counts) |

**Who needs scaling?**
- **Needs it:** anything based on distances or gradients (KNN, K-means, SVM, PCA, regularised linear models, neural networks).
- **Doesn't need it:** tree-based models (decision trees, random forests, gradient boosting). Splits don't care about scale.

```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler().fit(X_train)     # learn μ and σ on TRAIN
X_train_s = scaler.transform(X_train)
X_test_s  = scaler.transform(X_test)
```

**Check yourself.** Why does KNN perform badly when one feature is "income in pounds" and another is "age in years" and neither is scaled?

---

## 11. Working with Scikit-learn

**In plain English.** scikit-learn is the standard library for classical ML. Its strength is a **consistent API**: every model and transformer works the same way.

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

X = df.drop(columns=["churned"]); y = df["churned"]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

model = RandomForestClassifier(n_estimators=300, random_state=42)
model.fit(X_train, y_train)
print(classification_report(y_test, model.predict(X_test)))
```

**What it includes.** Preprocessing, linear models, trees and ensembles, SVMs, neighbours, clustering, decomposition (PCA), model selection (CV, grid search), metrics, pipelines and toy datasets (`load_iris`, `fetch_california_housing`).

**What it does not include.** Deep learning (use PyTorch), GPU training, and the very best gradient boosting (use XGBoost, LightGBM or CatBoost, which follow the scikit-learn API).

**Check yourself.** Why does `stratify=y` matter when only 5% of customers churn?

---

## 12. Understanding Estimators and Transformers

| Object | Methods | Learns from data? | Example |
|---|---|---|---|
| **Estimator** | `fit(X, y)` | Yes | Any model |
| **Predictor** | `predict(X)`, `predict_proba(X)`, `score(X, y)` | n/a | `LogisticRegression` |
| **Transformer** | `fit(X)`, `transform(X)`, `fit_transform(X)` | Yes | `StandardScaler`, `OneHotEncoder` |

**Conventions.**
- **Hyperparameters** go in `__init__` and are readable with `get_params()`.
- **Learned state** is stored in attributes with a trailing underscore: `coef_`, `mean_`, `classes_`, `feature_importances_`.
- `fit` returns `self`.

**Writing your own transformer.**
```python
from sklearn.base import BaseEstimator, TransformerMixin
import numpy as np

class Log1pTransformer(BaseEstimator, TransformerMixin):
    def fit(self, X, y=None):
        return self                      # nothing to learn
    def transform(self, X):
        return np.log1p(np.clip(X, 0, None))
```

**Golden rule.** `fit_transform` on **train**; only `transform` on validation, test and production.

**Check yourself.** What would go wrong if you called `scaler.fit_transform(X_test)`?

---

## 13. Pipelines in Scikit-learn

**In plain English.** A Pipeline chains preprocessing and the model into **one object**. You fit it once and predict with it once. It prevents leakage and makes deployment a single file.

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

num_cols = ["age", "income", "tenure_months"]
cat_cols = ["city", "plan"]

preprocess = ColumnTransformer([
    ("num", Pipeline([("impute", SimpleImputer(strategy="median")),
                      ("scale", StandardScaler())]), num_cols),
    ("cat", Pipeline([("impute", SimpleImputer(strategy="most_frequent")),
                      ("onehot", OneHotEncoder(handle_unknown="ignore"))]), cat_cols),
])

clf = Pipeline([("prep", preprocess),
                ("model", LogisticRegression(max_iter=1000))])

clf.fit(X_train, y_train)
clf.score(X_test, y_test)

# Cross-validation is leak-free: preprocessing is refitted inside each fold
from sklearn.model_selection import cross_val_score
cross_val_score(clf, X, y, cv=5, scoring="roc_auc")

# Tune any step with step__param syntax
from sklearn.model_selection import GridSearchCV
GridSearchCV(clf, {"model__C": [0.1, 1, 10]}, cv=5).fit(X_train, y_train)

import joblib; joblib.dump(clf, "model.joblib")   # deploy one artifact
```

**Check yourself.** Explain why scaling the whole dataset and *then* running `cross_val_score` gives an optimistic estimate, while the Pipeline version does not.

---

## 14. Reproducibility and Random Seeds

**In plain English.** Reproducibility means someone else (or you, in six months) can rerun the project and get the same result.

**Sources of randomness:** data splits, shuffling, model initialisation, bootstrap sampling, dropout, GPU non-determinism and library versions.

```python
import random, os
import numpy as np

SEED = 42
random.seed(SEED)
np.random.seed(SEED)                      # for libraries that use global state
rng = np.random.default_rng(SEED)
os.environ["PYTHONHASHSEED"] = str(SEED)  # only affects subprocesses started after this

# scikit-learn: pass random_state everywhere
train_test_split(X, y, random_state=SEED)
RandomForestClassifier(random_state=SEED)

# PyTorch (Module 16)
import torch
torch.manual_seed(SEED)
torch.use_deterministic_algorithms(True)  # may be slower; some ops will raise
```

**Reproducibility checklist.** Pinned dependency versions, versioned data (DVC, Module 19), committed code, logged configs and seeds (MLflow), and documented hardware.

**Pitfall.** A result that only appears with one lucky seed is not a result. Report the **mean ± std across several seeds** for important comparisons.

**Check yourself.** Model A beats model B by 0.4% accuracy with seed 42. What should you do before you claim A is better?

---

## 15. Introduction to Git and GitHub for ML Projects

**Core commands.**
```bash
git init
git add -A && git commit -m "Add data cleaning pipeline"
git checkout -b feature/target-encoding     # work on a branch
git push -u origin feature/target-encoding  # then open a Pull Request on GitHub
git log --oneline; git diff; git status
```

**ML-specific practices.**
| Do commit | Don't commit |
|---|---|
| Code (`src/`), configs, small sample data | Large datasets, model weights (use DVC, Git LFS or a model registry) |
| `requirements.txt` / lockfile | `.venv/`, `__pycache__/`, `.ipynb_checkpoints/` |
| Notebooks with cleared outputs (or paired via `jupytext`) | Secrets: `.env`, API keys, credentials |

**A typical ML repo layout.**
```
├── data/            (git-ignored; tracked by DVC)
├── notebooks/       exploration
├── src/project/     reusable code
├── tests/
├── configs/
├── requirements.txt
├── README.md        how to reproduce results
└── .gitignore
```

**Collaboration.** Use pull requests with code review, GitHub Actions to run tests and linting on every push, and tags or releases for model versions.

**Check yourself.** You accidentally committed an API key and pushed it. Why is deleting it in the next commit not enough?

---

## Practical Project: Analyse and Prepare a Real-World Customer Dataset

**Brief.** Using a public customer-churn dataset (for example IBM's Telco Customer Churn), deliver a model-ready dataset and a reusable preprocessing pipeline.

**Steps.**
1. **Frame the problem:** target = churned within the period. Choose a metric (for example ROC-AUC plus recall at a fixed precision) and justify it.
2. **Load and inspect:** fix dtypes (`TotalCharges` is stored as text), and standardise column names.
3. **EDA:** churn rate overall and by contract type, tenure and payment method. Produce at least five annotated charts.
4. **Clean:** duplicates, impossible values, inconsistent categories. Log every change.
5. **Split first:** stratified train/test split with a fixed seed.
6. **Build a `ColumnTransformer` pipeline:** imputation, scaling, one-hot encoding, and at least two engineered features (for example `charge_per_month` and `n_services`).
7. **Baseline:** a `DummyClassifier`, then logistic regression inside the pipeline. Report cross-validated scores.
8. **Reproducibility:** seeds, `requirements.txt`, a Git repo with a README explaining how to rerun everything.

**Deliverables.** A notebook (EDA plus narrative), `src/prep.py` (the pipeline), the saved `pipeline.joblib`, and a README.
