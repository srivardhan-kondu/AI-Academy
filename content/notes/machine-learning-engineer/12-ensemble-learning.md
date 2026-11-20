# Module 12: Ensemble Learning and Advanced ML Algorithms

**Phase 3 · Classical Machine Learning** · Goal: master the models that win on tabular data (random forests and gradient boosting) and know how to choose an algorithm.

---

## 1. Introduction to Ensemble Learning

**In plain English.** An ensemble combines several models so that the group predicts better than any single member. It works like asking a panel of experts instead of one person.

**Main families.**
| Family | How the models are built | How they are combined | Main effect |
|---|---|---|---|
| **Bagging** | In parallel, on bootstrap samples | Vote / average | ↓ variance |
| **Boosting** | Sequentially, each fixing the previous ones' errors | Weighted sum | ↓ bias (and variance) |
| **Stacking** | Different model types in parallel | A meta-model learns how to combine them | Exploits complementary strengths |
| **Voting** | Different model types | Majority or average | Simple robustness |

Gradient-boosted trees (XGBoost, LightGBM, CatBoost) are the **state of the art for most tabular data problems** and often beat deep learning there.

**Check yourself.** Why does an ensemble of 100 identical models perform no better than one?

---

## 2. Why Ensemble Methods Work

**1. Error averaging (the statistical reason).** Suppose B models each have error variance σ² and pairwise correlation ρ. Their average has variance:
**Var = ρσ² + (1 − ρ)σ²/B**
As B grows, the second term vanishes, but the first term remains. **Diversity (low ρ) is what matters.**

**2. Majority-vote maths (Condorcet).** Take 21 independent classifiers, each 60% accurate. The majority vote is correct about 82% of the time (Binomial(21, 0.6) ≥ 11). This only holds if the errors are **independent**. Real models' errors are correlated, so the gains are smaller.

**3. Representation.** Combining many simple boundaries (stumps, small trees) can represent complex boundaries that no single member can.

**4. Optimisation.** Different random starts or data samples explore different local optima. Averaging smooths out bad ones.

**How to create diversity.** Different data subsets (bagging), different feature subsets (random forest), different algorithms (stacking), different hyperparameters and seeds, and sequential focus on errors (boosting).

**Check yourself.** Using the variance formula, what happens to ensemble variance as B → ∞ when ρ = 0.3?

---

## 3. Bagging vs Boosting

| | **Bagging** | **Boosting** |
|---|---|---|
| Training | Parallel, independent | Sequential, dependent |
| Data | Bootstrap samples | The full data, reweighted or fitted to residuals |
| Base learners | Strong, high-variance (deep trees) | Weak, high-bias (shallow trees or stumps) |
| Reduces | **Variance** | **Bias** (and variance, with regularisation) |
| Overfitting risk | Low (more trees never hurts) | Can overfit with too many rounds; needs a learning rate and early stopping |
| Sensitivity to noisy labels | Robust | More sensitive (keeps chasing hard, possibly mislabelled points) |
| Examples | Random Forest, Extra Trees, BaggingClassifier | AdaBoost, GBM, XGBoost, LightGBM, CatBoost |
| Tuning effort | Low | Medium-high |

**Check yourself.** Your training data has 10% label noise. Which family is more robust, and why?

---

## 4. Random Forest in Depth

**Recap.** Bagged decision trees **plus a random subset of features at each split** (Module 10, topic 13).

**Key hyperparameters.**
| Parameter | Effect | Typical value |
|---|---|---|
| `n_estimators` | More trees give more stable results (with diminishing returns) and never overfit | 300-1000 |
| `max_features` | Lower values give more diverse, less correlated trees; higher values give stronger individual trees | `"sqrt"` (classification), 1.0 or ~0.33 (regression) |
| `max_depth`, `min_samples_leaf` | Control individual tree complexity | None / 1-5 |
| `max_samples` | Bootstrap sample size | Smaller is faster and more diverse |
| `class_weight` | Handle imbalance | `"balanced"` or `"balanced_subsample"` |

**Built-in extras.**
- **OOB score:** a free validation estimate.
- **Feature importances:** mean decrease in impurity (MDI). This is fast but **biased towards high-cardinality and continuous features**, and computed on training data. Prefer **permutation importance** on validation data.
- **Proximities:** how often two samples land in the same leaf. Used for similarity, imputation and outlier detection.

**Random forest regression** averages the leaf means. It **cannot extrapolate** beyond the range of the training targets.

**Check yourself.** Why does lowering `max_features` usually *improve* the forest even though each tree gets weaker?

---

## 5. Extra Trees Classifier

**Extremely Randomised Trees.** Like a random forest, but with **even more randomness**:
1. By default it uses the **whole training set** (no bootstrap).
2. At each split, for each candidate feature it draws **one random threshold** instead of searching for the best one, then picks the best of those random splits.

**Effects.**
- Faster training (no threshold search).
- Lower variance (more decorrelated trees), at the cost of slightly higher bias.
- Often performs on par with random forests, and sometimes better on noisy data.

```python
from sklearn.ensemble import ExtraTreesClassifier
et = ExtraTreesClassifier(n_estimators=500, max_features="sqrt", n_jobs=-1, random_state=0)
```

**Check yourself.** Why is Extra Trees training faster than random forest training?

---

## 6. AdaBoost

**Adaptive Boosting** (Freund & Schapire, 1995), the first practical boosting algorithm.

**Algorithm (binary, y ∈ {−1, +1}).**
1. Start with equal sample weights wᵢ = 1/n.
2. For t = 1…T:
   a. Train a weak learner hₜ (often a **decision stump**, a depth-1 tree) on the weighted data.
   b. Compute its weighted error εₜ.
   c. Its vote weight is **αₜ = ½ ln((1 − εₜ)/εₜ)**. More accurate learners get a bigger say.
   d. **Increase the weights of misclassified samples** (wᵢ ← wᵢ·e^{−αₜyᵢhₜ(xᵢ)}) and renormalise.
3. Final prediction: **sign(Σ αₜ hₜ(x))**.

**Intuition.** Each new learner concentrates on the examples the ensemble currently gets wrong.

**Theory.** AdaBoost minimises the **exponential loss** e^{−y·f(x)}. This makes it sensitive to outliers and label noise, because misclassified points get exponentially large weights.

```python
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=300, learning_rate=0.5)
```

**Check yourself.** A weak learner has a weighted error of 0.5. What is its α, and why does that make sense? (α = 0: it is no better than chance, so it gets no vote.)

---

## 7. Gradient Boosting Machines

**Key idea (Friedman, 2001).** Boosting is **gradient descent in function space**. Each new tree is fitted to the **negative gradient of the loss** with respect to the current predictions.

**Algorithm.**
1. Start with a constant: F₀(x) = argmin_c Σ L(yᵢ, c) (for example the mean of y, for MSE).
2. For m = 1…M:
   a. Compute the **pseudo-residuals**: rᵢ = −∂L(yᵢ, F(xᵢ))/∂F(xᵢ).
      For MSE, rᵢ = yᵢ − F(xᵢ): literally **the residuals**.
   b. Fit a small regression tree hₘ to the rᵢ.
   c. Update: **Fₘ(x) = Fₘ₋₁(x) + η · hₘ(x)**, where η is the **learning rate (shrinkage)**.
3. Predict with F_M(x).

Because it works with any differentiable loss, the same algorithm handles regression (MSE, MAE, Huber, quantile), classification (log-loss) and ranking.

**Key hyperparameters and their interplay.**
| Parameter | Role |
|---|---|
| `n_estimators` (M) | The number of trees. Too many overfits, so use **early stopping** |
| `learning_rate` (η) | A smaller η needs more trees but generalises better (typically 0.01-0.1) |
| `max_depth` / `num_leaves` | Tree complexity, i.e. the order of interactions captured (3-8 is typical) |
| `subsample` | Row sampling per tree (**stochastic gradient boosting**): regularises and speeds things up |
| `colsample_bytree` | Feature sampling |
| `min_child_weight` / `min_samples_leaf` | Minimum data per leaf |

```python
from sklearn.ensemble import HistGradientBoostingClassifier
gb = HistGradientBoostingClassifier(learning_rate=0.05, max_iter=1000, max_leaf_nodes=31,
                                    early_stopping=True, validation_fraction=0.1, random_state=0)
```
(`HistGradientBoosting*` is scikit-learn's fast, LightGBM-style implementation, with native NaN and categorical support.)

**Check yourself.** For MSE loss, show that the negative gradient equals the residual.

---

## 8. XGBoost

**eXtreme Gradient Boosting** (Chen & Guestrin, 2016). It made gradient boosting fast and well regularised, and dominated Kaggle for years.

**What it adds to plain gradient boosting.**
- **Regularised objective:** loss + γ·(number of leaves) + ½λ·Σ(leaf weights)² (+ α·L1).
- **Second-order (Newton) optimisation:** it uses both gradients gᵢ and Hessians hᵢ. The optimal leaf weight is w* = −Σg/(Σh + λ), and the split gain formula follows from it.
- **Sparsity-aware splits:** it learns a default direction for missing values.
- **Histogram-based** (`tree_method="hist"`) and GPU training; parallel split finding.
- Built-in cross-validation and early stopping, and monotonic and interaction constraints.

```python
import xgboost as xgb
model = xgb.XGBClassifier(
    n_estimators=2000, learning_rate=0.03, max_depth=6,
    subsample=0.8, colsample_bytree=0.8, reg_lambda=1.0, min_child_weight=1,
    tree_method="hist", eval_metric="auc", early_stopping_rounds=100, random_state=0)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)], verbose=200)
print(model.best_iteration)
```

**Imbalance.** `scale_pos_weight = n_negative / n_positive`.

**Check yourself.** In XGBoost's leaf weight formula w* = −Σg/(Σh + λ), what does increasing λ do?

---

## 9. LightGBM

**Light Gradient Boosting Machine** (Microsoft, 2017). It is built for **speed and large datasets**.

**Key innovations.**
| Technique | What it does |
|---|---|
| **Histogram binning** | Buckets continuous features into about 255 bins, so split finding is much faster and uses less memory |
| **Leaf-wise growth** | Splits the leaf with the largest loss reduction (rather than growing level by level). This gives deeper, asymmetric trees and is more accurate, but can overfit |
| **GOSS** (Gradient-based One-Side Sampling) | Keeps all large-gradient samples and subsamples the small-gradient ones |
| **EFB** (Exclusive Feature Bundling) | Merges sparse features that are rarely non-zero together |
| Native categorical support | Optimal splits on categories without one-hot encoding |

```python
import lightgbm as lgb
model = lgb.LGBMClassifier(n_estimators=5000, learning_rate=0.03, num_leaves=63,
                           min_child_samples=20, subsample=0.8, subsample_freq=1,
                           colsample_bytree=0.8, reg_lambda=1.0, random_state=0)
model.fit(X_train, y_train, eval_set=[(X_val, y_val)],
          callbacks=[lgb.early_stopping(200), lgb.log_evaluation(500)])
```

**Main control knob.** `num_leaves` (not `max_depth`) controls complexity. Keep it below 2^max_depth. Raise `min_child_samples` on small datasets to prevent overfitting.

**Check yourself.** Why does leaf-wise growth overfit more easily on small datasets than level-wise growth?

---

## 10. CatBoost

**Categorical Boosting** (Yandex, 2017). It excels with **categorical features** and works well with defaults.

**Key innovations.**
- **Ordered target statistics:** it encodes categories with target means computed only from rows that come *before* the current row in a random permutation. This prevents **target leakage** in target encoding.
- **Ordered boosting:** it reduces the "prediction shift" bias in standard gradient boosting.
- **Symmetric (oblivious) trees:** the same split is used at every node of a given level. This regularises, and gives very fast prediction.
- **Automatic feature combinations** of categorical features.

```python
from catboost import CatBoostClassifier
model = CatBoostClassifier(iterations=3000, learning_rate=0.05, depth=6,
                           eval_metric="AUC", early_stopping_rounds=200, verbose=500, random_seed=0)
model.fit(X_train, y_train, cat_features=["city", "plan", "device"], eval_set=(X_val, y_val))
```

**When to choose it.** Many high-cardinality categorical features, little time for tuning, or a need for robust defaults. Training can be slower than LightGBM on CPU.

**Check yourself.** Why does naive target encoding (the mean target per category computed on all the training rows) leak, and how does CatBoost's ordered approach prevent it?

---

## 11. Stacking and Blending

**Stacking (stacked generalisation).**
1. **Level-0 (base) models:** diverse models such as logistic regression, a random forest, LightGBM and KNN.
2. Generate **out-of-fold (OOF) predictions** for every training row using K-fold cross-validation, so each prediction comes from a model that did *not* see that row.
3. **Level-1 meta-model:** a simple model (often logistic or ridge regression) trained on the OOF predictions, sometimes together with the original features.
4. At test time, the base models (refitted on all the data) feed the meta-model.

```python
from sklearn.ensemble import StackingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
import lightgbm as lgb

stack = StackingClassifier(
    estimators=[("rf", RandomForestClassifier(500, random_state=0)),
                ("lgb", lgb.LGBMClassifier(random_state=0)),
                ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(25)))],
    final_estimator=LogisticRegression(), cv=5, stack_method="predict_proba", n_jobs=-1)
```

**Blending.** A simpler variant: train the base models on the training set, predict on a **holdout** set, and train the meta-model on those holdout predictions. It is easier and has less leakage risk, but wastes data.

**Pitfall.** Training the meta-model on *in-sample* base predictions leaks: the base models have seen those rows, so the meta-model learns to trust overfitted predictions.

**Trade-off.** Stacking usually gives small accuracy gains (often 0.5-2%) at the cost of complexity, latency and maintenance. It is great for competitions; think twice in production.

**Check yourself.** Why must the meta-model's training inputs be out-of-fold predictions?

---

## 12. Voting Classifiers

**Hard voting.** Majority vote of the predicted labels.
**Soft voting.** Average the predicted probabilities, then take the argmax. This is usually better because it uses each model's confidence. It requires models with reasonably calibrated `predict_proba`.

```python
from sklearn.ensemble import VotingClassifier
vote = VotingClassifier(
    estimators=[("lr", make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))),
                ("rf", RandomForestClassifier(300, random_state=0)),
                ("gb", HistGradientBoostingClassifier(random_state=0))],
    voting="soft", weights=[1, 1, 2])
```

**When it helps.** The models are individually good but **make different errors**. Check the correlation of their predictions. Averaging two nearly identical models gains almost nothing.

**Check yourself.** Three models predict P(class 1) = 0.9, 0.4 and 0.45. What do hard and soft voting each output? (Hard: class 0, two votes to one. Soft: mean 0.583, so class 1.)

---

## 13. Feature Importance

| Method | How | Pros | Cons |
|---|---|---|---|
| **Impurity-based (MDI)** | Total impurity reduction from splits on a feature | Free, fast | Biased towards high-cardinality and continuous features; computed on training data |
| **Gain / split count** (XGBoost, LightGBM) | Total gain or number of splits | Free | The same biases; "gain" and "split" can disagree |
| **Permutation importance** | The drop in validation score when a feature's values are shuffled | Model-agnostic, uses held-out data | Correlated features share or hide importance; slower |
| **Drop-column importance** | Retrain without the feature | The most faithful | Very expensive |
| **SHAP values** | Game-theoretic (Shapley) contribution of each feature to *each prediction* | Local and global explanations, consistent; fast `TreeExplainer` for trees | Correlated features complicate interpretation |

```python
from sklearn.inspection import permutation_importance
r = permutation_importance(model, X_val, y_val, n_repeats=10, scoring="roc_auc", random_state=0)
pd.Series(r.importances_mean, index=X_val.columns).sort_values(ascending=False).head(10)

import shap
explainer = shap.TreeExplainer(lgb_model)
sv = explainer(X_val)
shap.plots.beeswarm(sv)          # global: importance plus direction of effect
shap.plots.waterfall(sv[0])      # local: why this one prediction?
```

**Importance ≠ causation.** It describes what the model **uses**, not what *causes* the outcome. A leaked feature will look extremely important. That is a useful way to detect leakage.

**Check yourself.** Two features are near-duplicates. How does permutation importance treat them, and why can it understate both?

---

## 14. Comparing Ensemble Algorithms

| | Random Forest | Extra Trees | AdaBoost | sklearn HistGB | XGBoost | LightGBM | CatBoost |
|---|---|---|---|---|---|---|---|
| Type | Bagging | Bagging | Boosting | Boosting | Boosting | Boosting | Boosting |
| Typical accuracy (tabular) | Good | Good | Fair | Very good | Excellent | Excellent | Excellent |
| Training speed | Medium | Fast | Fast | Fast | Fast (hist/GPU) | **Fastest** | Medium |
| Tuning needed | Low | Low | Low | Medium | Medium-high | Medium-high | **Low** |
| Missing values | Supported (sklearn ≥ 1.4) | Supported (sklearn ≥ 1.6) | No | Native | Native | Native | Native |
| Categorical features | Encode first | Encode first | Encode first | Native | Native (recent versions) | Native | **Best-in-class** |
| Overfitting risk | Low | Low | Medium (noise) | Medium | Medium | Higher (leaf-wise) | Lower |
| GPU | No | No | No | No | Yes | Yes | Yes |

**Practical recipe for tabular problems.**
1. Baseline: logistic or linear regression.
2. Random forest: a robust, low-effort reference.
3. LightGBM or XGBoost with early stopping and moderate tuning (Optuna, Module 14).
4. CatBoost if there are many categorical features.
5. Optional: a soft-voting or stacked ensemble of the best two or three diverse models.

**Check yourself.** Your dataset has 50M rows and 300 numeric features, and training must finish in under 10 minutes on CPU. Which algorithm would you start with?

---

## 15. Choosing the Right Algorithm for a Problem

**Decision guide.**
```
What is the data?
├── Tabular (rows × columns)
│     ├── Need interpretability or regulation → Logistic/linear regression, shallow tree, GAM / EBM
│     ├── Best accuracy                       → Gradient boosting (LightGBM/XGBoost/CatBoost)
│     ├── Small data (< 1k rows)              → Regularised linear models, RF, SVM; careful CV
│     └── Many categoricals                   → CatBoost
├── Text      → TF-IDF + linear model baseline → fine-tuned transformer
├── Images    → Pretrained CNN / ViT with transfer learning
├── Audio / time series → Gradient boosting with lag features; or 1-D CNN / RNN / transformer
├── Graph     → Graph neural networks / graph features
└── No labels → Clustering / dimensionality reduction / anomaly detection
```

**Factors to weigh.**
| Factor | Questions |
|---|---|
| Data size and shape | Rows, features, sparsity, modality |
| Accuracy vs interpretability | Who needs to understand the predictions? Is there regulation? |
| Latency and cost | Real-time in milliseconds or batch overnight? Memory limits? Edge devices? |
| Training budget | Compute, time to tune |
| Maintenance | Retraining frequency, team skills, monitoring |
| Probability quality | Do you need calibrated probabilities? |
| Robustness | Noise, outliers, missing values, drift |

**No Free Lunch theorem.** No single algorithm is best for every problem. Always **benchmark several candidates** with the same honest cross-validation, starting from a baseline.

**Check yourself.** A hospital wants to predict 30-day readmission from 40 tabular features. Doctors must understand each prediction. Propose a model and an explanation strategy.

**Recommended resources.** *The Elements of Statistical Learning*, chapters 10, 15 and 16; the XGBoost, LightGBM and CatBoost papers; Christoph Molnar, *Interpretable Machine Learning* (free).
