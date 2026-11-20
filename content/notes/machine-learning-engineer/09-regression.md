# Module 09: Supervised Learning: Regression

**Phase 3 · Classical Machine Learning** · Goal: predict continuous values, understand the maths of linear regression completely, and control overfitting with regularisation.

---

## 1. Introduction to Regression

**In plain English.** Regression predicts a **number**: a house price, delivery time, energy demand or a patient's blood pressure.

**Formal goal.** Learn f such that ŷ = f(**x**) ≈ y, usually by minimising squared error. Statistically, this estimates the **conditional mean** E[y | **x**].

**Regression algorithms (not only linear).**
| Algorithm | Captures non-linearity? | Interpretable? |
|---|---|---|
| Linear / polynomial regression | Polynomial only | High |
| Ridge / Lasso / Elastic Net | Same as linear | High |
| Decision tree regressor | Yes | Medium |
| Random forest / gradient boosting | Yes | Low-medium |
| KNN regressor | Yes | Low |
| SVR | With kernels | Low |
| Neural networks | Yes | Low |

**Check yourself.** Is predicting "the probability of default" regression? (Usually it is treated as *classification* with probability outputs.)

---

## 2. Understanding Linear Regression

**Model.**
ŷ = w₁x₁ + w₂x₂ + … + wₙxₙ + b = **w**·**x** + b

- **Weights (coefficients) wⱼ:** the change in ŷ for a one-unit increase in xⱼ, *holding the other features fixed*.
- **Bias (intercept) b:** the prediction when all features are 0.

**"Linear" means linear in the parameters**, not necessarily in the inputs. ŷ = w₁x + w₂x² + b is still linear regression (topic 10).

**Strengths:** fast, interpretable, a strong baseline, and it extrapolates predictably. **Weaknesses:** it assumes additive linear effects, is sensitive to outliers (with MSE), and struggles with interactions unless you engineer them.

**Check yourself.** A model predicts salary = 2,000 × years_experience + 25,000. Interpret both numbers.

---

## 3. Simple Linear Regression

**One feature:** ŷ = wx + b

**Closed-form solution** (from minimising MSE):
w = Σ(xᵢ − x̄)(yᵢ − ȳ) / Σ(xᵢ − x̄)² = Cov(x, y) / Var(x)
b = ȳ − w·x̄

So the best line always passes through (x̄, ȳ), and its slope is the correlation scaled by the ratio of standard deviations: w = ρ·(σ_y/σ_x).

**Worked example.** x = [1, 2, 3, 4], y = [2, 4, 5, 8]. x̄ = 2.5, ȳ = 4.75.
Σ(x−x̄)(y−ȳ) = (−1.5)(−2.75) + (−0.5)(−0.75) + (0.5)(0.25) + (1.5)(3.25) = 9.5
Σ(x−x̄)² = 5, so w = 1.9 and b = 4.75 − 1.9·2.5 = 0.0.
Model: **ŷ = 1.9x**.

**Check yourself.** What happens to the slope if you convert x from metres to centimetres?

---

## 4. The Mathematics Behind Linear Regression

**Matrix form.** Add a column of 1s to X for the bias:
**ŷ = X w**, where X is n × (d+1) and **w** is (d+1)-dimensional.

**Probabilistic view.** Assume y = X**w** + ε with ε ~ N(0, σ²). Then maximising the likelihood is *exactly* minimising the sum of squared residuals. **MSE is the MLE under Gaussian noise.**

**Geometric view.** X**w** can only reach points in the **column space** of X. The least-squares solution is the **orthogonal projection** of **y** onto that space, so the residual vector **y** − X**ŵ** is perpendicular to every column of X:
Xᵀ(**y** − X**ŵ**) = 0. These are the normal equations.

**Check yourself.** Why is the residual vector orthogonal to the column of 1s, and what does that imply about the average residual? (It is zero.)

---

## 5. Cost Functions: Mean Squared Error

J(**w**) = (1/n) Σᵢ (yᵢ − ŷᵢ)² = (1/n)‖**y** − X**w**‖²

**Why squared error?**
- It is smooth and convex, with a unique minimum (if X has full rank).
- It has a closed-form solution.
- It is the Gaussian MLE.
- It penalises large errors heavily (an error of 10 costs 100). That is good if big errors are very bad, and bad if outliers are just noise.

**Gradient.** ∇J = −(2/n) Xᵀ(**y** − X**w**)

**Alternatives.** MAE (robust, predicts the median), Huber (robust and smooth), quantile loss (predicts a percentile, useful for prediction intervals), and Poisson deviance (for counts).

**Check yourself.** Errors of [1, 1, 1, 1, 10]: compute MSE and MAE. Which one is dominated by the outlier? (MSE = 20.8; MAE = 2.8.)

---

## 6. Ordinary Least Squares

**OLS solution (normal equation):**
**ŵ = (XᵀX)⁻¹ Xᵀ y**

**Derivation.** Set the gradient to zero: −2Xᵀ(**y** − X**w**) = 0 ⇒ XᵀX**w** = Xᵀ**y**.

**Computational notes.**
- Cost is O(nd² + d³). That is fine for d up to a few thousand, but too expensive for huge d (use gradient descent instead).
- Never form the inverse explicitly. Libraries use **QR or SVD** (`np.linalg.lstsq`).
- If XᵀX is singular (d > n, perfectly collinear features, duplicated columns), there is no unique solution. Use the pseudo-inverse or regularisation (Ridge).

**Gauss-Markov theorem.** Under the assumptions (linearity, uncorrelated errors with equal variance, no perfect collinearity), OLS is the **Best Linear Unbiased Estimator (BLUE)**: it has the lowest variance among unbiased linear estimators. Regularisation deliberately adds bias to reduce variance further.

**Check yourself.** Why does OLS fail when you one-hot encode a categorical variable with *all* its categories *and* keep an intercept? (The dummy variable trap: the columns sum to the intercept column.)

---

## 7. Implementing Linear Regression from Scratch

```python
import numpy as np

class LinearRegressionScratch:
    def __init__(self, method="normal", lr=0.01, epochs=1000):
        self.method, self.lr, self.epochs = method, lr, epochs

    @staticmethod
    def _add_bias(X):
        return np.c_[np.ones(len(X)), X]

    def fit(self, X, y):
        Xb = self._add_bias(np.asarray(X, float)); y = np.asarray(y, float)
        if self.method == "normal":
            self.w_ = np.linalg.lstsq(Xb, y, rcond=None)[0]
        else:                                           # batch gradient descent
            self.w_ = np.zeros(Xb.shape[1]); self.loss_ = []
            for _ in range(self.epochs):
                err = Xb @ self.w_ - y
                self.w_ -= self.lr * (2 / len(y)) * Xb.T @ err
                self.loss_.append(np.mean(err ** 2))
        self.intercept_, self.coef_ = self.w_[0], self.w_[1:]
        return self

    def predict(self, X):
        return self._add_bias(np.asarray(X, float)) @ self.w_

# Test on synthetic data
rng = np.random.default_rng(0)
X = rng.normal(size=(200, 3))
y = 4 + X @ np.array([2.0, -1.0, 0.5]) + rng.normal(scale=0.3, size=200)
m1 = LinearRegressionScratch("normal").fit(X, y)
m2 = LinearRegressionScratch("gd", lr=0.1, epochs=500).fit(X, y)
print(m1.intercept_, m1.coef_)   # ≈ 4, [2, -1, 0.5]
print(m2.intercept_, m2.coef_)   # ≈ the same
```

**Exercise.** Plot `m2.loss_`, then try `lr=1.0` and watch it diverge. Then rescale one feature by ×100 and see how gradient descent slows down.

---

## 8. Linear Regression Using Scikit-learn

```python
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

X, y = fetch_california_housing(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

lr = LinearRegression().fit(X_train, y_train)
pred = lr.predict(X_test)
print(f"MAE  {mean_absolute_error(y_test, pred):.3f}")
print(f"RMSE {root_mean_squared_error(y_test, pred):.3f}")
print(f"R²   {r2_score(y_test, pred):.3f}")         # ≈ 0.58
print(dict(zip(X.columns, lr.coef_.round(3))))
```

**Inference-style output (p-values, confidence intervals)** comes from `statsmodels`:
```python
import statsmodels.api as sm
print(sm.OLS(y_train, sm.add_constant(X_train)).fit().summary())
```

**Check yourself.** scikit-learn gives coefficients but no p-values. When would you need statsmodels instead?

---

## 9. Multiple Linear Regression

**Model.** ŷ = b + w₁x₁ + … + w_dx_d

**Interpreting coefficients.** wⱼ is the effect of xⱼ **holding all the other features constant**. That is why a coefficient can change sign when you add or remove other features (confounding).

**Comparing feature importance.** Raw coefficients depend on units. Standardise the features first, then compare |wⱼ| (each is then the effect of one standard deviation).

**Multicollinearity.** When features are highly correlated, the individual coefficients become unstable (they have large variance and may flip sign), although predictions can still be fine.
- **Detect:** the correlation matrix, or the **Variance Inflation Factor**, VIF = 1/(1 − R²ⱼ), where R²ⱼ comes from regressing xⱼ on the other features. VIF > 5-10 is a warning sign.
- **Fix:** drop or combine features, use PCA, or use **Ridge**.

**Interactions.** Add x₁·x₂ when the effect of one feature depends on another (for example, the effect of advertising depends on the season).

**Check yourself.** In a house-price model, the coefficient for "number of rooms" is negative when "square metres" is also included. Is that plausible? Explain.

---

## 10. Polynomial Regression

**Idea.** Create new features from powers and products of the originals, then fit a *linear* model on them:
ŷ = b + w₁x + w₂x² + w₃x³ + …

```python
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import Ridge

model = make_pipeline(PolynomialFeatures(degree=3, include_bias=False),
                      StandardScaler(),
                      Ridge(alpha=1.0))
model.fit(X_train, y_train)
```

**The degree controls bias vs variance.** Degree 1 underfits curves. A very high degree overfits wildly, especially at the edges of the data (Runge's phenomenon). Choose the degree by **cross-validation**.

**Feature explosion.** With d features and degree p, the number of terms is C(d + p, p). For 20 features at degree 3 that is 1,771 columns. Regularise.

**Alternatives for non-linearity:** splines (`SplineTransformer`), GAMs, trees and boosting.

**Check yourself.** Why must you scale *after* creating polynomial features, not before? (x³ for x around 100 is about 10⁶.)

---

## 11. Ridge Regression (L2 Regularisation)

**Objective.**
J(**w**) = ‖**y** − X**w**‖² + **α‖w‖²₂** = MSE + α Σ wⱼ²

**Effect.** It shrinks all the coefficients towards zero, but **never exactly to zero**. Correlated features share the weight between them.

**Closed form.** **ŵ = (XᵀX + αI)⁻¹ Xᵀ y**. Adding αI makes the matrix invertible, which fixes multicollinearity and the d > n case.

**Bayesian view.** This is the MAP estimate with a Gaussian prior on the weights, w ~ N(0, σ²/α).

**Practicalities.**
- **Standardise the features first.** The penalty treats all coefficients equally, so their scales must be comparable.
- The intercept is not penalised.
- α → 0 gives OLS; α → ∞ gives all weights → 0.
- Tune α on a log scale: `RidgeCV(alphas=np.logspace(-3, 3, 13))`.

**Check yourself.** Why does Ridge reduce variance, and what does it cost in bias?

---

## 12. Lasso Regression (L1 Regularisation)

**Objective.**
J(**w**) = (1/2n)‖**y** − X**w**‖² + **α‖w‖₁** = … + α Σ |wⱼ|

**Key property: sparsity.** Lasso drives some coefficients to **exactly zero**, so it performs **automatic feature selection**.

**Why L1 gives zeros (geometry).** The constraint region for L1 is a diamond with corners on the axes. The elliptical loss contours usually touch it **at a corner**, where some coordinates are 0. The L2 region is a circle with no corners, so the solution rarely lands on an axis.

**Limitations.**
- With correlated features, Lasso picks one more or less arbitrarily and zeros the others (unstable selection).
- It selects at most n features when d > n.
- There is no closed form (the |w| term is not differentiable at 0), so it is solved by coordinate descent.
- Bayesian view: a Laplace prior on the weights.

```python
from sklearn.linear_model import LassoCV
lasso = make_pipeline(StandardScaler(), LassoCV(cv=5, random_state=0)).fit(X_train, y_train)
coefs = lasso[-1].coef_; print("non-zero:", (coefs != 0).sum())
```

**Check yourself.** You have 500 features and suspect only ~20 matter. Ridge or Lasso? Why?

---

## 13. Elastic Net Regression

**Objective.** A mix of L1 and L2:
J = MSE + α·[ρ·‖**w**‖₁ + (1 − ρ)/2·‖**w**‖²₂]   (`l1_ratio` = ρ)

**Why use it.**
- Sparsity like Lasso, plus the stability of Ridge with **correlated features**: groups of correlated features tend to be selected together (the "grouping effect").
- It works when d ≫ n (genomics, text).

```python
from sklearn.linear_model import ElasticNetCV
enet = make_pipeline(StandardScaler(),
                     ElasticNetCV(l1_ratio=[.1, .5, .7, .9, .95, 1], cv=5)).fit(X_train, y_train)
```

| | Ridge | Lasso | Elastic Net |
|---|---|---|---|
| Penalty | L2 | L1 | L1 + L2 |
| Zero coefficients | No | Yes | Yes |
| Correlated features | Shares weight | Picks one | Groups them |
| Closed form | Yes | No | No |

**Check yourself.** With `l1_ratio=1`, which model is Elastic Net equivalent to? With `l1_ratio=0`?

---

## 14. Feature Selection in Regression

**Why select?** Simpler, more interpretable models, less overfitting, faster training, and cheaper data collection.

| Family | Method | Notes |
|---|---|---|
| **Filter** | Correlation with the target, mutual information, F-test (`SelectKBest(f_regression)`) | Fast; ignores interactions |
| **Wrapper** | Forward/backward selection (`SequentialFeatureSelector`), RFE | Accounts for the model; expensive |
| **Embedded** | Lasso / Elastic Net, tree importances (`SelectFromModel`) | Selection happens during training |
| **Permutation importance** | The drop in score when a feature is shuffled | Model-agnostic; compute it on validation data |

```python
from sklearn.feature_selection import RFECV
selector = RFECV(LinearRegression(), step=1, cv=5, scoring="neg_root_mean_squared_error")
selector.fit(X_train, y_train); X.columns[selector.support_]
```

**Pitfall: selection leakage.** Feature selection must happen **inside** cross-validation (in the Pipeline). Selecting on the full dataset and then cross-validating gives optimistic scores.

**Check yourself.** Why can a feature with almost zero correlation with the target still be important in a model?

---

## 15. Regression Assumptions

For valid **inference** (trustworthy coefficients, p-values and intervals), OLS assumes the following (**L.I.N.E.**):

| Assumption | Meaning | Diagnose | Remedy |
|---|---|---|---|
| **L**inearity | E[y \| x] is linear in the parameters | Residuals vs fitted values show no pattern | Transform features, add polynomial or interaction terms |
| **I**ndependence | Errors are independent | Durbin-Watson; residuals over time | Time-series models; account for groups |
| **N**ormality | Errors are ~ normal | Q-Q plot, histogram of residuals | Transform y (log); robust methods; matters less for large n |
| **E**qual variance (homoscedasticity) | Constant error variance | A "funnel" shape in residuals vs fitted values | Log-transform y, weighted least squares, robust standard errors |
| No perfect multicollinearity | Features are not exact linear combinations | VIF | Drop or combine features; Ridge |

```python
import matplotlib.pyplot as plt, scipy.stats as st
resid = y_test - pred
fig, ax = plt.subplots(1, 2, figsize=(10, 4))
ax[0].scatter(pred, resid, alpha=.3); ax[0].axhline(0, c="r"); ax[0].set(xlabel="fitted", ylabel="residual")
st.probplot(resid, dist="norm", plot=ax[1])
```

**For pure prediction**, violations matter less. Judge the model by validation error. They still hint at how to improve it (a curved residual pattern means a missing non-linearity).

**Check yourself.** The residual plot shows the spread growing with the predicted price. What is this called, and what transform often fixes it?

---

## 16. Evaluating Regression Models

| Metric | Formula | Units | Notes |
|---|---|---|---|
| **MAE** | mean \|y − ŷ\| | Same as y | Robust; easy to explain ("off by £12k on average") |
| **MSE** | mean (y − ŷ)² | y² | Punishes large errors; the optimisation target |
| **RMSE** | √MSE | Same as y | Most common; sensitive to outliers |
| **R²** | 1 − SS_res/SS_tot | Unitless | Fraction of variance explained; can be negative on test data |
| **Adjusted R²** | Penalises extra features | Unitless | For comparing models with different numbers of features |
| **MAPE** | mean \|(y − ŷ)/y\| | % | Intuitive, but undefined at y = 0 and asymmetric |
| **RMSLE** | RMSE on log(1 + y) | n/a | For targets spanning orders of magnitude; penalises relative error |

**Always compare against a baseline** (predict the training mean). R² = 0 means "no better than the mean".

**Beyond one number.**
- Plot predicted against actual values (points should lie along the diagonal).
- Plot residuals against features, and check errors by segment (region, price band). Averages hide subgroups where the model fails.
- **Prediction intervals:** quantile regression or conformal prediction give a range, not just a point estimate.

(Module 13 covers these metrics in more depth.)

**Check yourself.** Model A has a lower RMSE but a higher MAE than model B. What does that tell you about their error distributions?

---

## 17. Practical Regression Case Study

**Problem.** Predict median house values (California Housing) and explain the drivers.

```python
import numpy as np
from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.dummy import DummyRegressor

X, y = fetch_california_housing(return_X_y=True, as_frame=True)
X = X.assign(rooms_per_household=X.AveRooms / X.AveOccup.clip(lower=0.5),
             bedrooms_ratio=X.AveBedrms / X.AveRooms)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

cv = KFold(5, shuffle=True, random_state=42)
models = {
    "baseline (mean)": DummyRegressor(),
    "linear":          make_pipeline(StandardScaler(), LinearRegression()),
    "ridge":           make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13))),
    "lasso":           make_pipeline(StandardScaler(), LassoCV(cv=5)),
    "poly2 + ridge":   make_pipeline(PolynomialFeatures(2, include_bias=False), StandardScaler(),
                                     RidgeCV(alphas=np.logspace(-3, 3, 13))),
    "gradient boosting": HistGradientBoostingRegressor(random_state=42),
}
for name, m in models.items():
    rmse = -cross_val_score(m, X_train, y_train, cv=cv, scoring="neg_root_mean_squared_error")
    print(f"{name:18s} RMSE {rmse.mean():.3f} ± {rmse.std():.3f}")
```

**What you should observe** (scikit-learn 1.8):
| Model | CV RMSE |
|---|---|
| Baseline (mean) | 1.156 ± 0.012 |
| Linear / Ridge / Lasso | ≈ 0.682 ± 0.02 |
| Poly2 + Ridge | **0.755 ± 0.235** (worse and unstable) |
| Gradient boosting | **0.469 ± 0.010** |

- Linear, Ridge and Lasso are almost identical. With 10 features and about 16k rows there is little overfitting for regularisation to fix.
- **Polynomial features backfire.** A few extreme rows (very large `AveOccup` and `AveRooms` values) become huge once squared and multiplied. In one fold, the model extrapolates wildly on them. The ± 0.235 shows it is unstable rather than slightly worse. Fix it by clipping or log-transforming the skewed features *before* `PolynomialFeatures` and comparing again. Expanding features without first checking the distributions is risky.
- **Gradient boosting wins clearly.** Trees capture non-linear effects and interactions (especially between latitude and longitude) and are unaffected by extreme values.
- The linear model shows which features drive the prediction (median income dominates). Boosting has the best accuracy but needs SHAP or permutation importance to explain it.

**Steps to complete the case study.**
1. EDA: the target is capped at 5.0 (censored). Discuss how that affects the model.
2. Residual diagnostics for the best linear model.
3. Error analysis by region (latitude and longitude). Map the residuals.
4. Final evaluation on the test set **once**, with a bootstrap confidence interval for RMSE.
5. Write-up: model choice trade-off (interpretability vs accuracy), limitations, and next steps.
