# Module 14: Feature Engineering and Hyperparameter Tuning

**Phase 4 · Model Quality** · Goal: get the most out of your data and models, without fooling yourself.

---

## 1. Introduction to Feature Engineering

**In plain English.** Feature engineering is transforming raw data into inputs that make the patterns **easy for the model to learn**. On tabular problems, it often matters more than the choice of algorithm.

> "Coming up with features is difficult, time-consuming, requires expert knowledge. Applied machine learning is basically feature engineering." (Andrew Ng)

**What it covers.** Cleaning, transforming (log, scaling), encoding categoricals, creating new features (ratios, aggregates, time features, interactions), extracting features from text, images or time, and selecting the useful ones.

**Deep learning vs classical ML.** Deep networks *learn* features from raw images, audio and text. On tabular data, hand-engineered features plus gradient boosting still dominate.

**The golden rules.**
1. **Only use information available at prediction time.**
2. **Fit every learned transform on training data only** (put it in a Pipeline).
3. **Validate every new feature** with cross-validation. Intuition is often wrong.

**Check yourself.** Why do tree-based models benefit less from feature scaling but still benefit from ratio features?

---

## 2. Feature Extraction

**In plain English.** Derive informative numeric features from raw or complex data.

| Source | Extracted features |
|---|---|
| **Date/time** | Hour, day of week, month, is_weekend, is_holiday, days since an event; **cyclical encoding**: sin(2π·hour/24), cos(2π·hour/24) |
| **Text** | Length, word counts, TF-IDF, sentiment, keyword flags, **sentence embeddings** |
| **Transactions / logs** | Counts, sums, means, recency, frequency over windows (7d, 30d), trends |
| **Geospatial** | Distance to a city centre or store, clusters, the haversine distance between two points |
| **Images** | Colour histograms, edges (classical); **CNN embeddings** (modern) |
| **Audio** | MFCCs, spectrograms |
| **Signals** | Rolling mean and std, FFT frequencies, peaks |

```python
# Cyclical time: 23:00 and 00:00 should be close together
df["hour_sin"] = np.sin(2 * np.pi * df.hour / 24)
df["hour_cos"] = np.cos(2 * np.pi * df.hour / 24)

# Text with TF-IDF
from sklearn.feature_extraction.text import TfidfVectorizer
tfidf = TfidfVectorizer(ngram_range=(1, 2), min_df=3, max_features=50_000, sublinear_tf=True)

# Rolling behavioural features. closed="left" excludes the current row, so there is no leakage
df = df.sort_values(["user_id", "ts"]).set_index("ts")
df["spend_7d_prior"] = (df.groupby("user_id")["amount"]
                          .transform(lambda s: s.rolling("7D", closed="left").sum())
                          .fillna(0))
```

**Check yourself.** Why is encoding "hour of day" as 0-23 suboptimal for a linear model, and what does sin/cos encoding fix?

---

## 3. Feature Selection

**Why.** Less overfitting, faster training and inference, cheaper data pipelines, and better interpretability.

| Family | Methods | Pros | Cons |
|---|---|---|---|
| **Filter** | Variance threshold, correlation, χ², ANOVA F-test, **mutual information** | Fast, model-agnostic | Ignore interactions and redundancy |
| **Wrapper** | Forward/backward selection, **RFE / RFECV** | Account for the model and interactions | Expensive; can overfit the selection |
| **Embedded** | **L1 (Lasso)**, tree importances (`SelectFromModel`) | Efficient, part of training | Model-specific |
| **Permutation / SHAP-based** | Drop features with no validation importance | Faithful to held-out performance | Correlated features confuse them |

```python
from sklearn.feature_selection import VarianceThreshold, SelectKBest, mutual_info_classif, SelectFromModel
from sklearn.linear_model import LogisticRegression
pipe = Pipeline([
    ("prep", preprocess),
    ("var", VarianceThreshold(0.0)),
    ("select", SelectFromModel(LogisticRegression(penalty="l1", solver="liblinear", C=0.1))),
    ("model", HistGradientBoostingClassifier()),
])
```

**Also remove:** ID columns, constant columns, near-duplicate features (|ρ| > 0.95), and features unavailable at prediction time.

**Pitfall.** Selecting features on the full dataset *before* cross-validation leaks. Put selection inside the Pipeline.

**Check yourself.** With 10,000 features and 200 samples, why might feature selection *outside* CV report a high AUC even on pure noise?

---

## 4. Categorical Feature Encoding

**Types of categorical variable.**
- **Nominal:** no order (city, colour).
- **Ordinal:** a natural order (education level, size S/M/L).
- **Cardinality:** low (< 10 levels), medium, or high (thousands: zip code, product ID).

**Choosing an encoding.**
| Situation | Encoding |
|---|---|
| Nominal, low/medium cardinality, linear model or neural network | **One-hot** |
| Ordinal | **Ordinal** with the explicit order |
| High cardinality | **Target encoding** (cross-fitted), frequency encoding, hashing, or embeddings |
| Tree boosting | Native categorical support (LightGBM, CatBoost, HistGB) or ordinal codes |
| Deep learning | **Entity embeddings** (a learned dense vector per category) |

**Handling unknowns and rare levels.** Group rare categories into "Other" (`min_frequency`), and handle unseen categories at inference time (`handle_unknown`).

**Check yourself.** For a "product_id" column with 80,000 levels in a gradient-boosting model, which encodings would you consider?

---

## 5. One-Hot Encoding

**How.** One binary column per category. Exactly one of them is 1.
```
colour: red, green, blue  →  colour_red, colour_green, colour_blue
green                     →        0           1            0
```

```python
from sklearn.preprocessing import OneHotEncoder
ohe = OneHotEncoder(handle_unknown="infrequent_if_exist", min_frequency=0.01, sparse_output=True)
```

**The dummy variable trap.** For linear models with an intercept, the K one-hot columns sum to 1, which is perfectly collinear with the intercept. Use `drop="first"` for unregularised linear regression. With regularisation it isn't needed.

**Pros/cons.** It imposes no false order and is ideal for linear models. But high cardinality gives very wide, sparse matrices, which hurts trees: each split can separate only one category from the rest.

**Pitfall.** `pd.get_dummies` applied to train and test separately gives mismatched columns. Use a fitted `OneHotEncoder` inside a Pipeline.

**Check yourself.** How many columns does one-hot encoding create for a feature with 5 categories with and without `drop="first"`?

---

## 6. Ordinal Encoding

**How.** Map the categories to integers **in their meaningful order**.
```python
from sklearn.preprocessing import OrdinalEncoder
enc = OrdinalEncoder(categories=[["primary", "secondary", "bachelor", "master", "phd"]],
                     handle_unknown="use_encoded_value", unknown_value=-1)
```

**When it is right.** True ordinal variables (ratings, sizes, education levels). Also, as a compact encoding of *nominal* variables for **tree models**, which can split arbitrary integer codes. That is less ideal than native categorical support, but it works.

**When it is wrong.** Nominal variables with linear models or neural networks. Encoding {Paris = 0, Tokyo = 1, Lima = 2} tells the model that Lima = 2 × Tokyo.

**Check yourself.** Is the gap between "bachelor" (2) and "master" (3) really the same as between "primary" (0) and "secondary" (1)? How could a linear model cope with that?

---

## 7. Target Encoding

**How.** Replace each category with a statistic of the **target** for that category, usually the mean (for example the churn rate for each city).

**Smoothing** shrinks rare categories towards the global mean:
enc(c) = (n_c·mean_c + m·global_mean)/(n_c + m)   (m = the smoothing strength)

**Leakage danger.** If a row's own target contributes to its encoding, the model sees the label. This is severe for rare categories (a category with one row encodes its own label perfectly).

**Fix: cross-fitting.** Compute the encoding for each training row using **only the other folds**. scikit-learn's `TargetEncoder` does this automatically in `fit_transform`:
```python
from sklearn.preprocessing import TargetEncoder
te = TargetEncoder(target_type="binary", smooth="auto", cv=5, random_state=0)
X_train_enc = te.fit_transform(X_train[["zip_code"]], y_train)   # cross-fitted
X_test_enc  = te.transform(X_test[["zip_code"]])                 # uses the full-train statistics
```

**Pros.** One numeric column, whatever the cardinality, and it captures the category-target relationship directly.
**Cons.** Leakage risk, and it can overfit noise in rare categories.

**Check yourself.** Why is `fit(X_train).transform(X_train)` different from `fit_transform(X_train)` for `TargetEncoder`, and which should you use for the training data?

---

## 8. Feature Scaling

**Why scale?**
- **Distance-based models** (KNN, K-means, SVM-RBF) are dominated by large-scale features.
- **Gradient descent** converges much faster on a well-conditioned (round) loss surface.
- **Regularisation** (L1/L2) penalises coefficients equally, which only makes sense if the features are comparable.
- **PCA** finds directions of maximum variance, so it is dominated by large-scale features.

| Model | Scaling needed? |
|---|---|
| Linear/logistic regression (regularised), SVM, KNN, K-means, PCA, neural networks | **Yes** |
| Decision trees, random forests, gradient boosting | No |
| Naive Bayes | Usually no |

**Options:** StandardScaler, MinMaxScaler, RobustScaler, MaxAbsScaler (for sparse data), and QuantileTransformer / PowerTransformer (to reshape distributions).

**Check yourself.** Why is `MaxAbsScaler` preferred over `StandardScaler` for a sparse TF-IDF matrix? (Centring would destroy the sparsity.)

---

## 9. Min-Max Normalisation

**x′ = (x − min)/(max − min)** → [0, 1]. Or rescale to [a, b].

```python
from sklearn.preprocessing import MinMaxScaler
X_scaled = MinMaxScaler(feature_range=(0, 1)).fit(X_train).transform(X_test)
```

**Use when** you need bounded inputs: image pixels (divide by 255), some neural networks, or algorithms that assume [0, 1].

**Weaknesses.**
- **Very sensitive to outliers:** one extreme value squashes everything else into a narrow band.
- Test values outside the training range map outside [0, 1]. Use `clip=True` if that matters.

**Check yourself.** The training incomes span £10k-£200k, plus one £10M outlier. What happens to the scaled values of typical incomes?

---

## 10. Standardisation

**z = (x − μ)/σ** → mean 0, standard deviation 1 (computed on the training data).

```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler().fit(X_train)
X_train_s, X_test_s = scaler.transform(X_train), scaler.transform(X_test)
```

**Use when.** It is the default choice for linear models, SVMs, PCA and neural networks. It is unbounded, less distorted by moderate outliers than min-max, and the coefficients can be read as "per standard deviation" effects.

**Notes.**
- It doesn't make data normal. It only shifts and scales it. For skewed data, apply `np.log1p` or `PowerTransformer(method="yeo-johnson")` first.
- For heavy outliers, use `RobustScaler` (median and IQR).
- In deep learning, the analogous ideas *inside* the network are batch norm and layer norm (Module 16).

**Check yourself.** After standardisation, a value has z = −2.5. Interpret it.

---

## 11. Handling Imbalanced Datasets

**The problem.** When one class is rare (fraud 0.5%, disease 2%), models learn to predict the majority class, and accuracy hides the failure.

**Strategies, roughly in order of what to try first.**
1. **Use the right metrics:** PR-AUC, recall at a fixed precision, F1, or cost-based metrics. Not accuracy (Module 13).
2. **Tune the decision threshold** on validation data. This is often the single biggest win and costs nothing.
3. **Class weights:** make errors on the minority class cost more in the loss.
   ```python
   LogisticRegression(class_weight="balanced")
   RandomForestClassifier(class_weight="balanced_subsample")
   XGBClassifier(scale_pos_weight=n_neg / n_pos)
   ```
4. **Resampling:** oversample the minority class, undersample the majority, or SMOTE (topics 12-13).
5. **Get more minority data,** or better features.
6. **Anomaly-detection framing** for extreme rarity with few labels.
7. **Ensembles designed for imbalance:** `BalancedRandomForestClassifier`, `EasyEnsembleClassifier` (imbalanced-learn).

**Important.** Resampling and class weights distort the predicted probabilities (they no longer match real-world frequencies). **Recalibrate** if you need true probabilities.

**Check yourself.** Why is threshold tuning often as effective as resampling, and much simpler?

---

## 12. Oversampling and Undersampling

| Method | How | Pros | Cons |
|---|---|---|---|
| **Random oversampling** | Duplicate minority rows | Simple; keeps all the data | Overfitting to the duplicated points |
| **Random undersampling** | Drop majority rows | Fast; smaller dataset | Throws away information |
| Tomek links / ENN | Remove majority points near the boundary | Cleaner boundary | Small effect on its own |
| Combinations (SMOTE + Tomek, SMOTEENN) | Oversample, then clean | Often better | More complex |

**Critical rule: resample only the training data, inside CV.** Never resample before splitting or on the validation/test data. Validation data must reflect the real distribution. Use imbalanced-learn's Pipeline, which applies samplers only during `fit`:

```python
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.under_sampling import RandomUnderSampler
pipe = ImbPipeline([("prep", preprocess),
                    ("under", RandomUnderSampler(sampling_strategy=0.2, random_state=0)),
                    ("model", LogisticRegression(max_iter=1000))])
cross_val_score(pipe, X, y, cv=StratifiedKFold(5, shuffle=True, random_state=0), scoring="average_precision")
```

**Check yourself.** If you oversample *before* splitting, how do duplicated minority rows inflate your test score?

---

## 13. SMOTE

**Synthetic Minority Over-sampling TEchnique.** Instead of duplicating minority points, **create synthetic points by interpolating** between minority neighbours.

**Algorithm.**
1. For a minority sample **x**, find its k nearest **minority** neighbours (k = 5 by default).
2. Pick one neighbour **x̃** at random.
3. Create **x_new = x + λ·(x̃ − x)**, with λ ~ U(0, 1): a random point on the line segment between them.
4. Repeat until the desired balance is reached.

```python
from imblearn.over_sampling import SMOTE, SMOTENC, BorderlineSMOTE, ADASYN
pipe = ImbPipeline([("scale", StandardScaler()),
                    ("smote", SMOTE(sampling_strategy=0.3, k_neighbors=5, random_state=0)),
                    ("model", LogisticRegression(max_iter=1000))])
```

**Variants.** **SMOTENC** (mixed numeric and categorical features), **Borderline-SMOTE** (generates only near the class boundary), **ADASYN** (generates more in harder regions).

**Limitations.**
- It assumes interpolating between neighbours gives realistic samples. This can create **noise** when classes overlap.
- It needs scaled features (it uses KNN) and doesn't suit raw categorical, text or image data.
- Recent studies suggest that, for strong learners like gradient boosting, **class weights and threshold tuning often match or beat SMOTE**. Always compare against those simpler baselines.

**Check yourself.** Two minority points are (1, 2) and (3, 6). With λ = 0.25, what synthetic point does SMOTE create? ((1.5, 3).)

---

## 14. Hyperparameters vs Model Parameters

| | **Parameters** | **Hyperparameters** |
|---|---|---|
| Set by | Learned from the data during training | Chosen *before* training, by you or a search |
| Examples | Linear regression weights; tree split thresholds; neural network weights | Learning rate, tree depth, number of trees, C, k in KNN, dropout rate, batch size |
| Stored in (sklearn) | `coef_`, `tree_`, `feature_importances_` | `get_params()` |
| Optimised by | The training algorithm (gradient descent, CART) | Validation performance (search) |

**Why tuning matters.** Defaults are reasonable, but tuning can matter a lot, especially for gradient boosting and neural networks. However, **good features and data usually matter more than tuning.**

**Which hyperparameters matter most** (tune these first):
| Model | Key hyperparameters |
|---|---|
| Logistic / linear | C or α (regularisation strength) |
| Random forest | max_features, min_samples_leaf (n_estimators: just make it large enough) |
| Gradient boosting | learning_rate + n_estimators (with early stopping), num_leaves/max_depth, min_child_samples, subsample, colsample, reg_lambda |
| SVM-RBF | C and γ (jointly) |
| KNN | k, weights, metric |
| Neural networks | Learning rate (by far the most important), batch size, width/depth, weight decay, dropout |

**Check yourself.** Is the number of boosting rounds a parameter or a hyperparameter? How does early stopping blur the line?

---

## 15. Grid Search

**Method.** Try **every combination** of the specified values, evaluating each with cross-validation.

```python
from sklearn.model_selection import GridSearchCV
param_grid = {
    "model__C": [0.01, 0.1, 1, 10, 100],
    "model__penalty": ["l1", "l2"],
}
pipe = Pipeline([("prep", preprocess), ("model", LogisticRegression(solver="liblinear"))])
gs = GridSearchCV(pipe, param_grid, cv=StratifiedKFold(5, shuffle=True, random_state=0),
                  scoring="roc_auc", n_jobs=-1, refit=True)
gs.fit(X_train, y_train)
gs.best_params_, gs.best_score_
pd.DataFrame(gs.cv_results_).sort_values("rank_test_score").head()
```

| Pros | Cons |
|---|---|
| Exhaustive and simple; reproducible | The cost grows **exponentially** with the number of hyperparameters (the curse of dimensionality) |
| Good for 1-3 hyperparameters | Wastes trials on unimportant dimensions |

**Tips.** Use log-spaced values for scale parameters (C, α, learning rate). Start coarse, then refine around the best region. Remember `best_score_` is optimistic, so confirm on a held-out test set or with nested CV.

**Check yourself.** A grid of 5 values for each of 6 hyperparameters with 5-fold CV needs how many model fits? (5⁶ × 5 = 78,125.)

---

## 16. Randomised Search

**Method.** Sample N random configurations from specified **distributions**.

```python
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import loguniform, randint, uniform
dist = {
    "model__learning_rate": loguniform(1e-3, 0.3),
    "model__max_leaf_nodes": randint(8, 128),
    "model__min_samples_leaf": randint(5, 200),
    "model__l2_regularization": loguniform(1e-4, 10),
}
rs = RandomizedSearchCV(pipe_hgb, dist, n_iter=60, cv=5, scoring="roc_auc",
                        n_jobs=-1, random_state=0).fit(X_train, y_train)
```

**Why it beats grid search (Bergstra & Bengio, 2012).** Usually only a few hyperparameters really matter. With the same budget, random search tries **many more distinct values** of each important hyperparameter, whereas a grid repeats the same few values.

**Successive halving** (`HalvingRandomSearchCV`) starts many configurations on a small budget (little data or few iterations) and promotes only the best. This is far more efficient. Hyperband generalises the idea.

**Check yourself.** Given a budget of 25 trials and two hyperparameters, one of which doesn't matter, how many distinct values of the important one does a 5×5 grid test compared with random search? (5 vs about 25.)

---

## 17. Bayesian Optimisation

**Idea.** Treat validation score = f(hyperparameters) as an **expensive black-box function**. Build a cheap **surrogate model** of f from the trials so far, and use it to choose the most promising next trial.

**Loop.**
1. Evaluate a few random configurations.
2. Fit the surrogate: a **Gaussian process** or a **Tree-structured Parzen Estimator (TPE)**.
3. Choose the next configuration by maximising an **acquisition function** that balances:
   - **Exploitation:** try where the surrogate predicts a good score.
   - **Exploration:** try where it is uncertain.
   Common choices: Expected Improvement (EI), Upper Confidence Bound (UCB).
4. Evaluate it, update the surrogate, and repeat.

**Optuna example (TPE plus pruning).**
```python
import optuna, lightgbm as lgb
from sklearn.model_selection import cross_val_score

def objective(trial):
    params = {
        "learning_rate": trial.suggest_float("learning_rate", 1e-3, 0.2, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 15, 255, log=True),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 200, log=True),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "subsample_freq": 1,
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.4, 1.0),
        "reg_lambda": trial.suggest_float("reg_lambda", 1e-3, 10, log=True),
        "n_estimators": 600, "random_state": 0, "verbose": -1,
    }
    return cross_val_score(lgb.LGBMClassifier(**params), X_train, y_train,
                           cv=5, scoring="roc_auc").mean()

study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=0))
study.optimize(objective, n_trials=100)
study.best_params
```

**When it is worth it.** For expensive models (gradient boosting on big data, neural networks), it typically finds good configurations in far fewer trials than random search.

**Check yourself.** Why must the acquisition function balance exploration and exploitation? What happens if it only exploits?

---

## 18. Automated Hyperparameter Tuning

**Tools.**
| Tool | Strengths |
|---|---|
| **Optuna** | Define-by-run search spaces, TPE, pruning of bad trials, dashboards; the most popular |
| Ray Tune | Distributed tuning across many machines and GPUs; ASHA, PBT |
| Hyperopt | TPE (an older but common library) |
| scikit-optimize | GP-based `BayesSearchCV` |
| Weights & Biases Sweeps | Tuning plus experiment tracking |
| Cloud (SageMaker, Vertex AI) | Managed tuning jobs |

**Beyond tuning: AutoML.** Tools such as **AutoGluon**, FLAML, H2O AutoML and auto-sklearn search over preprocessing, models, hyperparameters *and* ensembles. They make strong baselines quickly. Engineers still own the problem framing, leakage checks, features and deployment.

**Early stopping and pruning.** Stop unpromising trials early: Optuna's `MedianPruner`, Hyperband/ASHA, and early-stopping rounds in boosting.

**Good practice.**
- Fix the CV splits and seeds so trials are comparable.
- Log every trial (MLflow, Module 19).
- Set a **budget** (time or number of trials). Returns diminish quickly.
- Check that the best configuration is not at the **edge** of the search space. If it is, widen the space.
- Beware overfitting the validation set with thousands of trials. Confirm on the untouched test set.

**Check yourself.** Your best learning rate is 0.001, which is the lower bound of the search space. What should you do?

---

## 19. Regularisation Techniques

**Definition.** Anything that reduces overfitting by **constraining the model or adding noise**, trading a little bias for a large reduction in variance.

| Technique | Applies to | How it helps |
|---|---|---|
| **L2 (Ridge / weight decay)** | Linear models, neural networks | Shrinks weights; smoother functions |
| **L1 (Lasso)** | Linear models | Sparsity; feature selection |
| Elastic Net | Linear models | L1 + L2 |
| **Tree constraints** | Trees and boosting | max_depth, min_samples_leaf, num_leaves, min_child_weight |
| **Shrinkage (learning rate)** | Boosting | Small steps, more trees |
| **Subsampling** | RF, boosting, SGD | Row and column sampling add randomness |
| **Early stopping** | Boosting, neural networks | Stop when the validation loss stops improving |
| **Dropout** | Neural networks | Randomly zeroes activations so units don't co-adapt |
| **Data augmentation** | Images, text, audio | More varied training data |
| **Batch norm / label smoothing** | Neural networks | Stabilise training and soften overconfident targets |
| Noise injection | Neural networks | Robustness |
| Ensembling | Any | Averages out variance |
| **Simpler model / fewer features** | Any | Less capacity |

**Choose the strength by cross-validation:** α/C, dropout rate, depth and so on.

**Check yourself.** Show that adding the L2 penalty λ‖**w**‖² to a loss produces the weight decay update **w** ← **w**(1 − 2αλ) − α∇L.

---

## 20. Preventing Overfitting

**Diagnose first.** Training score ≫ validation score means overfitting. Use **learning curves** and **validation curves** (score vs a hyperparameter).

```python
from sklearn.model_selection import validation_curve
train_sc, val_sc = validation_curve(DecisionTreeClassifier(random_state=0), X, y,
                                    param_name="max_depth", param_range=range(1, 21), cv=5)
```

**Prevention checklist.**
1. **More, cleaner data.** It is the strongest fix.
2. **A simpler model,** or fewer or better features.
3. **Regularisation** (topic 19), tuned with CV.
4. **Early stopping.**
5. **Cross-validation** for model selection, rather than one lucky split.
6. **Ensembles** (bagging).
7. **Data augmentation** (deep learning).
8. **Avoid leakage.** It looks like amazing generalisation until production.
9. **Don't over-tune.** Thousands of trials can overfit the validation set. Hold out a test set or use nested CV.
10. **Monitor in production.** Real-world drift is the ultimate generalisation test.

**Check yourself.** The training AUC is 0.99 and the validation AUC 0.78 for a gradient-boosting model. List four specific changes you would try, in order.

---

## 21. Building an Optimised ML Pipeline

**End-to-end example: churn classifier with leak-free preprocessing, imbalance handling, tuning and threshold selection.**

```python
import numpy as np, pandas as pd, joblib, optuna
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, TargetEncoder, FunctionTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score, precision_recall_curve

df = pd.read_parquet("data/processed/customers.parquet")
y = df.pop("churned"); X = df

# 1. Split: hold out a test set that is touched once
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

num = ["tenure_months", "monthly_charges", "n_support_calls_90d"]
low_card = ["contract", "payment_method"]
high_card = ["city"]

def add_features(d):
    d = d.copy()
    d["charge_per_tenure"] = d["monthly_charges"] / d["tenure_months"].clip(lower=1)
    return d

prep = ColumnTransformer([
    ("num", SimpleImputer(strategy="median", add_indicator=True), num + ["charge_per_tenure"]),
    ("low", OneHotEncoder(handle_unknown="ignore", min_frequency=0.01), low_card),
    ("high", TargetEncoder(target_type="binary", random_state=0), high_card),
])

def make_pipe(**p):
    return Pipeline([
        ("fe", FunctionTransformer(add_features)),
        ("prep", prep),
        ("model", HistGradientBoostingClassifier(class_weight="balanced", early_stopping=True,
                                                 random_state=0, **p)),
    ])

cv = StratifiedKFold(5, shuffle=True, random_state=0)

# 2. Tune with Optuna on the training data only
def objective(trial):
    p = dict(learning_rate=trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
             max_leaf_nodes=trial.suggest_int("max_leaf_nodes", 8, 128, log=True),
             min_samples_leaf=trial.suggest_int("min_samples_leaf", 10, 300, log=True),
             l2_regularization=trial.suggest_float("l2_regularization", 1e-4, 10, log=True))
    return cross_val_score(make_pipe(**p), X_train, y_train, cv=cv, scoring="average_precision").mean()

study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(seed=0))
study.optimize(objective, n_trials=50)

# 3. Choose the threshold on a validation split carved out of the training data
X_tr, X_val, y_tr, y_val = train_test_split(X_train, y_train, test_size=0.2, stratify=y_train, random_state=1)
pipe = make_pipe(**study.best_params).fit(X_tr, y_tr)
prec, rec, thr = precision_recall_curve(y_val, pipe.predict_proba(X_val)[:, 1])
ok = prec[:-1] >= 0.6                                   # business rule: precision ≥ 60%
threshold = thr[ok][np.argmax(rec[:-1][ok])] if ok.any() else 0.5

# 4. Refit on all the training data, evaluate ONCE on the test set, save
final = make_pipe(**study.best_params).fit(X_train, y_train)
p_test = final.predict_proba(X_test)[:, 1]
print("Test PR-AUC:", round(average_precision_score(y_test, p_test), 3))
joblib.dump({"pipeline": final, "threshold": float(threshold)}, "models/churn_v1.joblib")
```

**Why it is "optimised" and trustworthy.**
- Every learned step (imputation, encoders, model) lives inside the Pipeline, so it is **leak-free in CV and identical in production**.
- Imbalance is handled with class weights and an explicit **business-driven threshold**.
- Hyperparameters are tuned efficiently with Optuna, using **PR-AUC** to match the task.
- The test set is used **once**, and a single artifact holds both the pipeline and the threshold.

**Next steps (Phase 6).** Track this experiment in MLflow, version the data with DVC, and serve the artifact with FastAPI.
