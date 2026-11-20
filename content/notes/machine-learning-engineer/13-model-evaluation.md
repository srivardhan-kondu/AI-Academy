# Module 13: Model Evaluation and Validation

**Phase 4 · Model Quality** · Goal: measure model quality honestly, and choose metrics that reflect the real cost of mistakes.

---

## 1. Why Model Evaluation Matters

**In plain English.** A model is only useful if it works on **data it has never seen**. Evaluation answers three questions: *How good is it? Is it better than the alternatives? Is it good enough to deploy?*

**What goes wrong without careful evaluation.**
- **Overfitting hidden by training accuracy:** 99% on training data, 70% in production.
- **The wrong metric:** 99% accuracy on fraud that is 1% of transactions, by predicting "not fraud" every time.
- **Leakage:** offline results that are impossible to reproduce online.
- **Averages hiding failures:** good overall, but terrible for one region, language or demographic group.
- **Ignored uncertainty:** "Model B is better" based on a 0.2% difference on 500 examples.

**Evaluation is a design decision.** Choose the metric and the validation scheme to reflect how the model will actually be used.

**Check yourself.** Name three things besides a single accuracy number that you would report before deploying a classifier.

---

## 2. Training, Validation and Test Sets

| Set | Used for | Rule |
|---|---|---|
| Training | Fitting the parameters | n/a |
| Validation | Model selection, hyperparameters, thresholds, early stopping | Can be used many times (and so gets "used up") |
| Test | A final unbiased estimate | **Touch once.** Never use it for decisions |

**Splitting strategies must match deployment.**
| Situation | Split |
|---|---|
| i.i.d. tabular | Random, **stratified** for classification |
| Time series / forecasting | **Chronological**: train on the past, validate on the future; `TimeSeriesSplit` |
| Several rows per entity | **Group-based**: `GroupKFold`, `GroupShuffleSplit` |
| Distribution shift expected | Validate on the most recent or out-of-domain slice |

**Pitfall.** If you tune hyperparameters on the test set even once, your test score is no longer unbiased.

**Check yourself.** You are predicting next week's sales. Why is a shuffled K-fold split misleading?

---

## 3. Holdout Validation

**Method.** One split, for example 80% training and 20% validation.
```python
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
```

| Pros | Cons |
|---|---|
| Simple and fast; one training run | **High variance**: the score depends on which rows land in the validation set |
| Natural for large datasets and deep learning | Wastes data on small datasets |
| Mirrors the train → deploy flow | One unlucky split can mislead |

**When to use it.** Large datasets (100k+ rows), expensive models (deep learning), and time-based validation.

**Check yourself.** Run a holdout split with five different seeds and the validation accuracy ranges from 0.81 to 0.87. What does that tell you, and what should you do?

---

## 4. K-Fold Cross-Validation

**Method.**
1. Split the data into K equal folds.
2. For each fold k: train on the other K−1 folds and validate on fold k.
3. Report the **mean ± std** of the K scores.

```
Fold 1: [VAL][trn][trn][trn][trn]
Fold 2: [trn][VAL][trn][trn][trn]
...
```

```python
from sklearn.model_selection import KFold, cross_val_score, cross_validate
cv = KFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipeline, X, y, cv=cv, scoring="neg_root_mean_squared_error")
print(f"RMSE {-scores.mean():.3f} ± {scores.std():.3f}")
```

**Choosing K.** 5 or 10 is standard. A larger K means less pessimistic bias (more training data per fold) but more computation and more correlated estimates.

**Rules.**
- **All preprocessing must happen inside the folds** (use a Pipeline). Otherwise you leak.
- After CV has picked the model, **refit on all the training data** for the final model.
- **Nested CV** gives an unbiased estimate when tuning: an inner loop tunes the hyperparameters and an outer loop estimates performance.

**Check yourself.** Why does cross-validation give a more reliable estimate than a single holdout split on a 2,000-row dataset?

---

## 5. Stratified K-Fold Cross-Validation

**Problem.** With imbalanced classes (say 5% positive), random folds may contain very different positive rates, or even none at all.

**Solution.** **Stratification** keeps each fold's class proportions equal to the overall proportions.

```python
from sklearn.model_selection import StratifiedKFold, StratifiedGroupKFold, RepeatedStratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
cv_rep = RepeatedStratifiedKFold(n_splits=5, n_repeats=3, random_state=0)   # even more stable estimate
```

scikit-learn uses stratified K-fold **by default** for classifiers when you pass `cv=5`. For grouped *and* imbalanced data, use `StratifiedGroupKFold`.

**Regression variant.** Bin the target into quantiles and stratify on the bins.

**Check yourself.** A dataset has 1,000 rows and 30 positives. With 10-fold non-stratified CV, what could go wrong in some folds?

---

## 6. Leave-One-Out Cross-Validation

**Method.** K = n. Train on n − 1 rows and test on the single remaining row, n times.

| Pros | Cons |
|---|---|
| Uses almost all the data for training (low bias) | n model fits, which is very expensive |
| Deterministic (no randomness in the split) | **High variance** of the estimate (the training sets are nearly identical, so the errors are highly correlated) |
| Useful for tiny datasets | Per-fold metrics such as AUC are undefined with one test point |

**Special case.** For linear regression (and some other models), the LOOCV error has a **closed form** that needs only one fit: the PRESS statistic, using the hat-matrix diagonal. `RidgeCV` uses this, which is why it is fast.

```python
from sklearn.model_selection import LeaveOneOut
cross_val_score(model, X, y, cv=LeaveOneOut(), scoring="neg_mean_absolute_error")
```

**Check yourself.** For a dataset of 40 patients, would you choose LOOCV or repeated 5-fold CV? Discuss the trade-offs.

---

## 7. Confusion Matrix

**For binary classification:**
| | **Predicted positive** | **Predicted negative** |
|---|---|---|
| **Actually positive** | **TP** (true positive) | **FN** (false negative, a miss) |
| **Actually negative** | **FP** (false positive, a false alarm) | **TN** (true negative) |

Every classification metric is built from these four counts.

```python
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
cm = confusion_matrix(y_test, y_pred)                 # rows = actual, columns = predicted
ConfusionMatrixDisplay.from_predictions(y_test, y_pred, normalize="true")
```

**Multiclass.** A K×K matrix. The off-diagonal cells show *which* classes get confused with each other (for example 3 vs 8 in digit recognition). That points you to targeted fixes: more data for those classes, better features, or merging classes.

**Running example** (used in the next topics): 1,000 transactions, 100 frauds. The model flags 120: TP = 80, FP = 40, FN = 20, TN = 860.

**Check yourself.** In a cancer-screening model, which cell of the confusion matrix is the most dangerous?

---

## 8. Accuracy

**Accuracy = (TP + TN) / (TP + TN + FP + FN)**

Running example: (80 + 860)/1000 = **0.94**.

**The accuracy paradox.** A model that predicts "not fraud" for everything scores 900/1000 = **0.90** accuracy and catches zero fraud. On imbalanced data, accuracy rewards ignoring the minority class.

**When accuracy is fine.** Classes are roughly balanced *and* all errors cost about the same.

**Balanced accuracy** is the mean of the per-class recalls, (TPR + TNR)/2. It is robust to imbalance. In the example: (0.8 + 0.956)/2 = 0.878.

**Check yourself.** Accuracy on a dataset is 0.97. What is the first thing you check?

---

## 9. Precision

**Precision = TP / (TP + FP)**: "Of everything I flagged, how much was really positive?"

Running example: 80/(80 + 40) = **0.667**. One in three alerts is a false alarm.

**Optimise for precision when false positives are expensive.**
- A spam filter (a legitimate email lost in the spam folder is very costly).
- Recommending a costly intervention.
- Alerts that analysts must investigate (alert fatigue).

**Precision@k:** the precision among the top-k scored items. Used when capacity is limited ("we can review only 50 cases a day").

**Check yourself.** A model flags only its single most confident case, and it is correct. What is the precision? Why is that model still useless?

---

## 10. Recall

**Recall (sensitivity, true positive rate) = TP / (TP + FN)**: "Of all the real positives, how many did I catch?"

Running example: 80/(80 + 20) = **0.80**. We miss 20% of fraud.

**Optimise for recall when false negatives are expensive.**
- Disease screening (a missed cancer is very costly).
- Fraud or safety-critical defect detection.
- Search or retrieval stages where later stages filter the results.

**The precision-recall trade-off.** Lowering the decision threshold flags more cases, so recall goes up and precision usually goes down. Raising it does the opposite. **The model is the same. The threshold is a business decision.**

**Check yourself.** How can you get 100% recall trivially, and what happens to precision?

---

## 11. Specificity

**Specificity (true negative rate) = TN / (TN + FP)**: "Of all the real negatives, how many did I correctly leave alone?"

Running example: 860/(860 + 40) = **0.956**.

**False positive rate (FPR) = 1 − specificity = FP/(FP + TN)** = 0.044. This is the x-axis of the ROC curve.

**Where it is reported.** Medical testing reports **sensitivity and specificity** together. A test with high sensitivity rules a condition *out* when the result is negative; a test with high specificity rules it *in* when the result is positive.

**Watch out.** On heavily imbalanced data, specificity can look excellent (0.99) while the absolute number of false positives (1% of 1 million = 10,000) still overwhelms the true positives. Precision exposes this; specificity does not.

**Check yourself.** Why can a model with 99% specificity still produce mostly false alarms?

---

## 12. F1 Score

**F1 = 2 · (Precision · Recall)/(Precision + Recall)**: the **harmonic mean** of precision and recall.

Running example: 2·0.667·0.8/(0.667 + 0.8) = **0.727**.

**Why the harmonic mean?** It is dominated by the smaller value. Precision 1.0 with recall 0.01 gives F1 ≈ 0.02 (an arithmetic mean would give 0.505). You can't get a good F1 by ignoring one of the two.

**F-beta** weights recall β times as much as precision:
F_β = (1 + β²)·P·R/(β²·P + R). **F2** favours recall (screening); **F0.5** favours precision.

**Multiclass averaging.**
| Average | How | When |
|---|---|---|
| Macro | Unweighted mean of the per-class F1 scores | Every class matters equally (rare classes count) |
| Weighted | Mean weighted by class frequency | Reflects the overall distribution |
| Micro | F1 computed from global TP, FP and FN totals | Equals accuracy in single-label multiclass |

**Limitation.** F1 ignores true negatives and depends on the threshold. Report it alongside a threshold-free metric (PR-AUC).

```python
from sklearn.metrics import classification_report, f1_score, fbeta_score
print(classification_report(y_test, y_pred, digits=3))
```

**Check yourself.** Compute F1 for P = 0.9 and R = 0.3. (0.45.)

---

## 13. ROC Curve

**Receiver Operating Characteristic.** Plot the **TPR (recall)** on the y-axis against the **FPR** on the x-axis as the decision threshold sweeps from 1 down to 0.

- (0, 0): threshold = 1, so nothing is flagged.
- (1, 1): threshold = 0, so everything is flagged.
- **The diagonal** is random guessing.
- The top-left corner (0, 1) is a perfect classifier.

```python
from sklearn.metrics import roc_curve, RocCurveDisplay
fpr, tpr, thresholds = roc_curve(y_test, proba)
RocCurveDisplay.from_predictions(y_test, proba)
```

**Choosing an operating point.** Pick the threshold that meets a business constraint ("FPR ≤ 2%") or that maximises Youden's J = TPR − FPR, or (best of all) **minimise the expected cost**: cost_FP·FP + cost_FN·FN.

**Property.** It is insensitive to class balance, because both axes are rates within a single class. This is both a strength and a weakness (topic 15).

**Check yourself.** Two ROC curves cross. What does that mean for choosing between the two models?

---

## 14. Area Under the Curve (AUC)

**ROC-AUC** is the area under the ROC curve, between 0 and 1.

**Probabilistic meaning.** AUC = **the probability that a randomly chosen positive is scored higher than a randomly chosen negative.** It measures **ranking quality**, independently of any threshold.

| AUC | Interpretation |
|---|---|
| 0.5 | Random ranking |
| 0.7-0.8 | Acceptable |
| 0.8-0.9 | Good |
| > 0.9 | Excellent, so check for leakage |
| < 0.5 | Worse than random (your labels or score direction may be flipped) |

```python
from sklearn.metrics import roc_auc_score
roc_auc_score(y_test, proba)                                 # binary
roc_auc_score(y_test, proba_matrix, multi_class="ovr", average="macro")
```

**Limitations.**
- It says nothing about **calibration**. Multiplying all the scores by 0.1 leaves AUC unchanged.
- It covers *all* thresholds, including ones you would never use. A partial AUC focuses on the low-FPR region.
- On heavily imbalanced data it can look optimistic. See PR-AUC.

**Check yourself.** A model's AUC is 0.85. Explain what that means to a non-technical stakeholder in one sentence.

---

## 15. Precision-Recall Curve

**Plot** precision (y-axis) against recall (x-axis) across thresholds. Summarise it with **Average Precision (AP)** or PR-AUC.

**Baseline.** A random classifier's precision equals the **positive rate**. With 1% positives, the baseline PR-AUC is 0.01, compared with 0.5 for ROC.

**Why PR beats ROC for rare positives.** Example: 1,000,000 negatives, 1,000 positives. A model with TPR = 0.9 at FPR = 0.01 looks great on the ROC curve, but it produces 10,000 false positives against 900 true positives, so **precision is 8%**. The PR curve shows this immediately.

```python
from sklearn.metrics import precision_recall_curve, average_precision_score, PrecisionRecallDisplay
prec, rec, thr = precision_recall_curve(y_test, proba)
average_precision_score(y_test, proba)
PrecisionRecallDisplay.from_predictions(y_test, proba)

# Choose the threshold that gives recall ≥ 0.8 with the best precision
mask = rec[:-1] >= 0.8
best_threshold = thr[mask][np.argmax(prec[:-1][mask])]
```

**Rule of thumb.** If the positive class is rare and it is what you care about (fraud, disease, defects), report **PR-AUC**, not only ROC-AUC.

**Check yourself.** Why does the PR curve's baseline depend on the class balance, while the ROC curve's doesn't?

---

## 16. Log Loss

**Log loss (binary cross-entropy)** evaluates the **quality of the probabilities**:
LogLoss = −(1/n) Σ [yᵢ log pᵢ + (1 − yᵢ) log(1 − pᵢ)]

- Lower is better. A perfect model scores 0.
- Predicting the base rate p for everyone gives the "uninformed" baseline: −[p log p + (1 − p) log(1 − p)]. For p = 0.5, that is 0.693.
- It **punishes confident mistakes severely**: predicting 0.99 for a negative costs 4.6.

**When to use it.** When the probabilities themselves drive decisions: pricing, risk scoring, expected-value calculations, and betting or forecasting.

**Calibration.** A calibrated model's "70%" predictions come true about 70% of the time. Check with a **reliability diagram** and the **Brier score** (MSE of the probabilities). Fix with `CalibratedClassifierCV` (Platt/sigmoid or isotonic). Boosted trees, SVMs and Naive Bayes often need calibration. Logistic regression is usually well calibrated.

```python
from sklearn.metrics import log_loss, brier_score_loss
from sklearn.calibration import CalibrationDisplay, CalibratedClassifierCV
CalibrationDisplay.from_predictions(y_test, proba, n_bins=10)
```

**Check yourself.** Two models have the same AUC but different log loss. What differs between them?

---

## 17. Regression Evaluation Metrics

| Metric | Measures | Use when |
|---|---|---|
| MAE | Average absolute error | All errors cost proportionally; outliers shouldn't dominate |
| MSE / RMSE | Squared error (RMSE back in units) | Large errors are disproportionately bad |
| R² / adjusted R² | Variance explained | Comparing against the mean baseline; communicating fit |
| MAPE / sMAPE | Percentage error | Scale-free comparison (beware y ≈ 0) |
| RMSLE | Error in log space | Relative errors matter; targets span orders of magnitude |
| Median absolute error | Typical error | Very robust summary |
| Quantile (pinball) loss | Quantile accuracy | Prediction intervals, asymmetric costs |
| MASE | Error relative to a naive forecast | Time-series forecasting |

**Always also look at** the plot of predicted vs actual values, the residual distribution, and errors **by segment**.

**Check yourself.** For a demand forecast where under-predicting (stock-outs) costs 3× more than over-predicting, which loss or metric would you use?

---

## 18. MAE, MSE and RMSE

**Definitions** (eᵢ = yᵢ − ŷᵢ):
- **MAE** = (1/n) Σ |eᵢ|
- **MSE** = (1/n) Σ eᵢ²
- **RMSE** = √MSE

**Worked example.** The errors are [2, −3, 1, −2, 10].
MAE = (2 + 3 + 1 + 2 + 10)/5 = **3.6**
MSE = (4 + 9 + 1 + 4 + 100)/5 = **23.6**
RMSE = √23.6 ≈ **4.86**
The single error of 10 inflates RMSE much more than MAE.

**Properties.**
- RMSE ≥ MAE always. A large gap signals large outlier errors.
- MAE is minimised by predicting the **median**; MSE by predicting the **mean**.
- MAE and RMSE are in the target's units, so they are easy to explain. MSE is in squared units.

```python
from sklearn.metrics import mean_absolute_error, mean_squared_error, root_mean_squared_error
```

**Check yourself.** MAE is 5 and RMSE is 20. What does that tell you about the error distribution?

---

## 19. R-Squared and Adjusted R-Squared

**R² (coefficient of determination).**
**R² = 1 − SS_res / SS_tot**, where SS_res = Σ(yᵢ − ŷᵢ)² and SS_tot = Σ(yᵢ − ȳ)².
- 1 means perfect predictions; 0 means no better than predicting the mean.
- **It can be negative on test data:** the model is worse than predicting the mean.
- Interpretation: "the model explains 72% of the variance in the target".

**The problem.** On training data, R² **never decreases** when you add features, even random noise.

**Adjusted R²** penalises extra predictors:
**R²_adj = 1 − (1 − R²)(n − 1)/(n − p − 1)**  (n = samples, p = predictors)
It increases only if a new feature improves the fit more than chance would.

**Example.** R² = 0.80, n = 50, p = 10 gives R²_adj = 1 − 0.2·49/39 ≈ 0.749.

**Caveats.** A high R² doesn't mean the model is correct (check the residuals). R² values aren't comparable across datasets with different target variance. In noisy domains (human behaviour), an R² of 0.3 may be excellent.

**Check yourself.** Why is adjusted R² unnecessary when you evaluate on a held-out test set?

---

## 20. Choosing the Right Evaluation Metric

**Start from the decision and the cost of errors, not from what is conventional.**

| Scenario | Primary metric | Why |
|---|---|---|
| Balanced classes, equal error costs | Accuracy, F1 | Simple and fair |
| Rare positives (fraud, disease) | **PR-AUC**, recall at fixed precision | Focuses on the minority class |
| Ranking or prioritising cases | ROC-AUC, precision@k, NDCG | The order matters, not the threshold |
| FN very costly (screening) | **Recall**, F2 | Don't miss positives |
| FP very costly (spam, legal action) | **Precision**, F0.5 | Avoid false alarms |
| Probabilities used directly (pricing, risk) | **Log loss**, Brier score, calibration | Probability quality |
| Regression with outliers that are noise | MAE | Robust |
| Regression where big misses are disastrous | RMSE | Penalises large errors |
| Relative errors matter | MAPE, RMSLE | Scale-free |
| Business impact | **Expected profit / cost** | What stakeholders actually care about |

**Best practice.**
1. Define **one primary metric** (for model selection) plus **guardrail metrics** (latency, calibration, fairness across groups).
2. Translate to money where possible:
   ```python
   def expected_cost(y, proba, t, c_fp=5, c_fn=200):
       pred = proba >= t
       return c_fp * ((pred == 1) & (y == 0)).sum() + c_fn * ((pred == 0) & (y == 1)).sum()
   best_t = min(np.linspace(0.01, 0.99, 99), key=lambda t: expected_cost(y_val, p_val, t))
   ```
3. Choose the threshold on **validation** data, then report the test performance at that threshold.
4. Report **confidence intervals** (bootstrap) and **per-segment** results.
5. Offline metrics are proxies. Confirm with **online A/B tests** where you can.

**Check yourself.** You are building a model to prioritise which leads a sales team of 10 people calls each day. Which metric fits, and why?
