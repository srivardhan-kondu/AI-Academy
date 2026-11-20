# Module 10: Supervised Learning: Classification

**Phase 3 · Classical Machine Learning** · Goal: understand the major classification algorithms from first principles, and know when to use each one.

---

## 1. Introduction to Classification

**In plain English.** Classification assigns an input to one of a fixed set of **categories**: spam or ham, fraud or legitimate, cat, dog or bird.

**Two kinds of output.**
- **Hard label:** "spam".
- **Score or probability:** P(spam) = 0.83. This is more useful because you can choose the **decision threshold** to match business costs (Module 13).

**Two families of classifier.**
| Discriminative | Generative |
|---|---|
| Model P(y \| x) or the boundary directly | Model P(x \| y) and P(y), then use Bayes' theorem |
| Logistic regression, SVM, trees, neural networks | Naive Bayes, Gaussian discriminant analysis |
| Usually more accurate with plenty of data | Works with little data; can generate samples |

**Check yourself.** Why is a probability output more useful than a hard label for a loan-approval system?

---

## 2. Binary and Multiclass Classification

| Type | Classes per example | Example | Output layer / strategy |
|---|---|---|---|
| **Binary** | 1 of 2 | Churn yes/no | One sigmoid probability |
| **Multiclass** | 1 of K (K > 2) | Digit 0-9 | Softmax over K classes |
| **Multi-label** | Any subset of K | Movie genres | K independent sigmoids |
| **Ordinal** | 1 of K, ordered | Severity: low < medium < high | Ordinal regression, or treat as regression |

**Softmax** turns K scores (logits) into probabilities that sum to 1:
P(y = k | **x**) = e^{z_k} / Σⱼ e^{z_j}

**Check yourself.** A photo can contain both a dog and a cat. Is this multiclass or multi-label, and how does the output layer differ?

---

## 3. Logistic Regression

**In plain English.** Despite its name, it is a **classification** model. It computes a linear score, then squashes it into a probability.

z = **w**·**x** + b,  p̂ = σ(z) = 1/(1 + e^{−z}),  predict 1 if p̂ ≥ threshold (default 0.5)

**Log-odds interpretation.** log(p/(1 − p)) = **w**·**x** + b. The model is **linear in the log-odds**.
- Increasing xⱼ by 1 multiplies the odds by **e^{wⱼ}** (the odds ratio). For example, w = 0.7 means the odds are about 2× higher.

**Training.** Minimise binary cross-entropy (equivalent to maximising the likelihood). The problem is **convex**, so there is one global optimum, solved with L-BFGS, Newton or SGD.

```python
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, max_iter=1000))
clf.fit(X_train, y_train)
proba = clf.predict_proba(X_test)[:, 1]
```

**Regularisation.** In scikit-learn, `C` is the **inverse** regularisation strength: a small C means strong regularisation. `penalty="l1"` with `solver="liblinear"` or `"saga"` gives sparse models.

**Strengths:** fast, interpretable, well-calibrated probabilities, an excellent baseline. **Weakness:** a linear boundary, unless you engineer features.

**Check yourself.** A coefficient is −1.2 for "has a support contract". Interpret its effect on the odds of churn. (e^{−1.2} ≈ 0.30, so the odds fall by about 70%.)

---

## 4. Sigmoid Function

σ(z) = 1/(1 + e^{−z})

| Property | Value |
|---|---|
| Range | (0, 1), so it can be read as a probability |
| σ(0) | 0.5 |
| Symmetry | σ(−z) = 1 − σ(z) |
| Derivative | σ′(z) = σ(z)(1 − σ(z)), with a maximum of 0.25 at z = 0 |
| Saturation | For \|z\| > ~5, σ is ≈ 0 or 1 and the gradient is ≈ 0 |
| Inverse | The logit: z = log(p/(1 − p)) |

**Numerical stability.** For large negative z, e^{−z} overflows. Libraries compute the loss directly from the logits (`BCEWithLogitsLoss` in PyTorch) using the log-sum-exp trick.

**Check yourself.** Compute σ(2) and σ(−2). (≈ 0.881 and 0.119.)

---

## 5. Decision Boundaries

**Definition.** The surface in feature space where the classifier switches its prediction.

- **Logistic regression:** p̂ = 0.5 ⟺ z = 0 ⟺ **w**·**x** + b = 0. This is a **hyperplane** (a line in 2-D). The vector **w** is perpendicular to it.
- Changing the **threshold** shifts the boundary in parallel.
- **Non-linear boundaries** come from: polynomial features + logistic regression, kernel SVMs, trees (axis-aligned rectangles), KNN (irregular shapes), and neural networks (arbitrary shapes).

**Visualising a boundary in 2-D.**
```python
from sklearn.inspection import DecisionBoundaryDisplay
DecisionBoundaryDisplay.from_estimator(clf, X2d, response_method="predict_proba", alpha=.5)
plt.scatter(X2d[:, 0], X2d[:, 1], c=y, edgecolor="k")
```

**Check yourself.** With w = [2, −1] and b = 1, write the equation of the decision boundary and say which side is class 1. (2x₁ − x₂ + 1 = 0; class 1 where 2x₁ − x₂ + 1 > 0.)

---

## 6. Binary Cross-Entropy Loss

L = −(1/n) Σᵢ [yᵢ log p̂ᵢ + (1 − yᵢ) log(1 − p̂ᵢ)]

**Intuition.** It is the negative log of the probability the model gave to the **true** class.
| True y | Predicted p̂ | Loss |
|---|---|---|
| 1 | 0.9 | −log 0.9 = 0.105 |
| 1 | 0.5 | 0.693 |
| 1 | 0.1 | 2.303 |
| 1 | 0.001 | 6.9, a huge penalty for being confidently wrong |

**Why not MSE for classification?** MSE combined with a sigmoid gives a **non-convex** loss with tiny gradients when the model is confidently wrong. Cross-entropy is convex for logistic regression, and its gradient (p̂ − y)·**x** is large exactly when the model is badly wrong.

**Multiclass version (categorical cross-entropy):** L = −Σₖ yₖ log p̂ₖ = −log p̂_true.

**Pitfall.** log(0) = −∞. Clip the probabilities to [ε, 1 − ε] or compute the loss from the logits.

**Check yourself.** A model predicts 0.5 for every example. What is its average BCE? (log 2 ≈ 0.693. This is a useful sanity-check value at the start of training.)

---

## 7. Implementing Logistic Regression from Scratch

```python
import numpy as np

class LogisticRegressionScratch:
    def __init__(self, lr=0.1, epochs=2000, l2=0.0):
        self.lr, self.epochs, self.l2 = lr, epochs, l2

    @staticmethod
    def _sigmoid(z):
        return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

    def fit(self, X, y):
        n, d = X.shape
        self.w_, self.b_, self.loss_ = np.zeros(d), 0.0, []
        for _ in range(self.epochs):
            p = self._sigmoid(X @ self.w_ + self.b_)
            err = p - y                                   # dL/dz
            self.w_ -= self.lr * (X.T @ err / n + self.l2 * self.w_)
            self.b_ -= self.lr * err.mean()
            eps = 1e-12
            self.loss_.append(-np.mean(y*np.log(p+eps) + (1-y)*np.log(1-p+eps)))
        return self

    def predict_proba(self, X):
        return self._sigmoid(X @ self.w_ + self.b_)

    def predict(self, X, threshold=0.5):
        return (self.predict_proba(X) >= threshold).astype(int)

# Test
from sklearn.datasets import make_classification
from sklearn.preprocessing import StandardScaler
X, y = make_classification(n_samples=1000, n_features=5, random_state=0)
X = StandardScaler().fit_transform(X)
m = LogisticRegressionScratch().fit(X, y)
print("train accuracy:", (m.predict(X) == y).mean())
```

**Exercise.** Compare `m.w_` with `sklearn.linear_model.LogisticRegression(C=1e6).fit(X, y).coef_`. They should be close (a large C means almost no regularisation).

---

## 8. K-Nearest Neighbours (KNN)

**Algorithm.** To classify a new point, find the **k closest training points** and take a **majority vote** (for regression, average their values). There is no training step: it is a "lazy learner" that memorises the data.

**Choosing k.**
- **k = 1:** a jagged boundary that fits noise (high variance).
- **Large k:** a smooth boundary that may wash out minority classes (high bias).
- Use an odd k for binary problems to avoid ties, and tune with CV. `weights="distance"` gives closer neighbours more say.

```python
from sklearn.neighbors import KNeighborsClassifier
knn = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7, weights="distance"))
```

**Costs.** Training is O(1). Prediction is O(n·d) per query with brute force. KD-trees and ball trees help in low dimensions, and approximate nearest-neighbour libraries (FAISS, HNSW) help at scale. This is the same machinery as vector databases in RAG.

**Weaknesses.** It **requires feature scaling**, suffers from the **curse of dimensionality**, is slow at prediction time with large datasets, and is sensitive to irrelevant features.

**Check yourself.** Why does KNN become unreliable with 500 features even if you have 100,000 rows?

---

## 9. Distance Metrics: Euclidean and Manhattan

| Metric | Formula | Notes |
|---|---|---|
| **Euclidean (L2)** | √Σ(xᵢ − yᵢ)² | Straight-line distance; the default |
| **Manhattan (L1)** | Σ\|xᵢ − yᵢ\| | "City-block" distance; more robust to outliers in single dimensions |
| **Minkowski (Lp)** | (Σ\|xᵢ − yᵢ\|ᵖ)^{1/p} | p = 1 is Manhattan, p = 2 is Euclidean |
| **Chebyshev (L∞)** | maxᵢ \|xᵢ − yᵢ\| | The largest single difference |
| **Cosine distance** | 1 − cos θ | Ignores magnitude; for text and embeddings |
| **Hamming** | # positions that differ | Binary or categorical vectors |

**Example.** a = (1, 2), b = (4, 6): Euclidean = 5, Manhattan = 7, Chebyshev = 4.

**Scale matters.** Without scaling, a feature measured in thousands (income) swamps one measured in units (number of children).

**Check yourself.** For TF-IDF document vectors of very different lengths, why is cosine distance better than Euclidean?

---

## 10. Decision Trees

**In plain English.** A flowchart of yes/no questions learned from the data: "Is tenure < 6 months? → Is the contract monthly? → Predict churn".

**How a tree is built (CART: greedy, top-down, recursive).**
1. For every feature and every candidate threshold, measure how much a split would increase **purity** (topics 11-12).
2. Choose the best split and divide the data.
3. Repeat on each child until a stopping rule is met: maximum depth, minimum samples per leaf, or a pure node.
4. Each leaf predicts the majority class (or the mean value, for regression).

**Strengths.**
- Interpretable (you can print the rules), handles mixed feature types, **needs no scaling**, and captures non-linearities and interactions automatically.

**Weaknesses.**
- **Overfits easily** (a fully grown tree memorises the training data) → limit depth, set `min_samples_leaf`, or use cost-complexity pruning (`ccp_alpha`).
- **Unstable:** a small change in the data can produce a completely different tree.
- Axis-aligned splits approximate diagonal boundaries with staircases.
→ Ensembles fix most of these (topic 13, Module 12).

```python
from sklearn.tree import DecisionTreeClassifier, export_text, plot_tree
tree = DecisionTreeClassifier(max_depth=4, min_samples_leaf=20, random_state=0).fit(X_train, y_train)
print(export_text(tree, feature_names=list(X_train.columns)))
```

**Check yourself.** A tree with no depth limit has 100% training accuracy and 71% test accuracy. Name two hyperparameters you would change.

---

## 11. Gini Impurity

**Definition.** The probability of misclassifying a randomly chosen sample if it were labelled at random according to the node's class distribution:
**Gini = 1 − Σₖ pₖ²**

| Node class mix | Gini |
|---|---|
| 100% / 0% (pure) | 0 |
| 50% / 50% | 0.5 (the maximum for 2 classes) |
| 80% / 20% | 1 − (0.64 + 0.04) = 0.32 |

**Choosing a split.** Minimise the **weighted** impurity of the children:
Gini_split = (n_L/n)·Gini_L + (n_R/n)·Gini_R

**Worked example.** A parent node has 10 samples (5 yes, 5 no), so Gini = 0.5.
The split gives Left = 4 yes, 1 no (Gini = 1 − 0.64 − 0.04 = 0.32) and Right = 1 yes, 4 no (Gini = 0.32).
Weighted = 0.5·0.32 + 0.5·0.32 = 0.32, so the impurity decrease is 0.18.

Gini is the default in scikit-learn because it is slightly faster than entropy (no logarithm), and the two usually produce very similar trees.

**Check yourself.** Compute the Gini impurity for a node with class proportions [0.5, 0.25, 0.25]. (1 − 0.25 − 0.0625 − 0.0625 = 0.625.)

---

## 12. Entropy and Information Gain

**Entropy** (from information theory) measures uncertainty in bits:
**H = −Σₖ pₖ log₂ pₖ**
- A pure node has H = 0. A 50/50 node has H = 1 bit (the maximum for 2 classes).

**Information gain** is the reduction in entropy achieved by a split:
**IG = H(parent) − Σ (n_child/n)·H(child)**

**Same example as above.** H(parent) = 1.0. Each child (4:1) has H = −0.8 log₂ 0.8 − 0.2 log₂ 0.2 ≈ 0.722.
IG = 1.0 − 0.722 = **0.278 bits**.

**Bias towards many-valued features.** Information gain favours features with many unique values (such as an ID column). C4.5 uses the **gain ratio** to correct for this.

**Connections.** Cross-entropy loss, KL divergence and mutual information (used in feature selection) all come from the same theory.

`DecisionTreeClassifier(criterion="entropy")` or `criterion="log_loss"`.

**Check yourself.** Why would a "customer_id" column achieve maximum information gain, and why is it useless?

---

## 13. Random Forest

**In plain English.** Build many decorrelated decision trees and let them **vote**. This is the "wisdom of crowds" for trees.

**Algorithm.**
1. For each of B trees: draw a **bootstrap sample** of the training data (topic 14).
2. Grow a deep tree, but at **each split consider only a random subset of features** (`max_features`, for example √d for classification).
3. Predict by majority vote, or by averaging the probabilities.

**Why it works.** Averaging B trees with variance σ² and pairwise correlation ρ gives variance ρσ² + (1 − ρ)σ²/B. Bootstrapping and feature subsampling **reduce ρ**, so averaging cuts variance dramatically while keeping each tree's low bias.

**Out-of-bag (OOB) evaluation.** Each tree never sees about 37% of the rows, so predicting those rows gives a free validation estimate (`oob_score=True`).

```python
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=500, max_features="sqrt", min_samples_leaf=2,
                            n_jobs=-1, oob_score=True, random_state=42).fit(X_train, y_train)
rf.oob_score_
```

**Strengths:** strong out-of-the-box accuracy, robust to overfitting as the number of trees grows, little tuning needed, handles non-linearity, gives feature importances. **Weaknesses:** large models, slower prediction, less interpretable, and impurity-based importance is biased towards high-cardinality features (prefer permutation importance).

**Check yourself.** Does adding more trees to a random forest cause overfitting? Explain.

---

## 14. Bagging and Bootstrap Sampling

**Bootstrap sampling.** Draw n samples **with replacement** from a dataset of size n. Each bootstrap sample contains about **63.2%** of the unique rows (1 − (1 − 1/n)ⁿ → 1 − 1/e), with some rows repeated.

**Bagging (Bootstrap AGGregatING).**
1. Create B bootstrap samples.
2. Train one model per sample, in parallel.
3. Aggregate by voting (classification) or averaging (regression).

**When bagging helps.** With **high-variance, low-bias** base models (deep trees, KNN with small k). It does little for stable models like linear regression.

```python
from sklearn.ensemble import BaggingClassifier
from sklearn.tree import DecisionTreeClassifier
bag = BaggingClassifier(DecisionTreeClassifier(), n_estimators=200, oob_score=True, n_jobs=-1, random_state=0)
```

**Random Forest = bagging + random feature subsets at each split.**

**Check yourself.** Show that the probability a specific row is *not* in a bootstrap sample of size n is (1 − 1/n)ⁿ, and evaluate it for n = 1000. (≈ 0.368.)

---

## 15. Support Vector Machines (SVM)

**In plain English.** Among all the lines (hyperplanes) that separate the classes, choose the one with the **widest margin**, the largest gap to the nearest points of either class. Those nearest points are the **support vectors**. They alone determine the boundary.

**Hard-margin SVM** (perfectly separable data):
minimise ½‖**w**‖²  subject to  yᵢ(**w**·**x**ᵢ + b) ≥ 1 for all i  (with yᵢ ∈ {−1, +1})
The margin width is 2/‖**w**‖, so minimising ‖**w**‖ maximises the margin.

**Soft-margin SVM** (real, overlapping data): allow violations with slack variables ξᵢ:
minimise ½‖**w**‖² + **C** Σ ξᵢ
Equivalently, it minimises the **hinge loss** Σ max(0, 1 − yᵢf(**x**ᵢ)) plus L2 regularisation.

**The C hyperparameter.**
| Large C | Small C |
|---|---|
| Few margin violations allowed → narrow margin → risk of overfitting | Wide margin, more violations → smoother, more regularised |

**Why a large margin?** It makes the boundary robust to small perturbations, and theory links a larger margin to better generalisation.

**Check yourself.** If you delete a training point that is *not* a support vector and retrain, does the boundary change?

---

## 16. Linear and Non-Linear SVM

- **Linear SVM:** the boundary is a hyperplane. It is fast (`LinearSVC`, or `SGDClassifier(loss="hinge")`) and excellent for **high-dimensional sparse data such as text**, where classes are often linearly separable.
- **Non-linear SVM:** when no hyperplane separates the classes (for example concentric circles), map the data to a higher-dimensional space where a hyperplane *does* separate them. The boundary is non-linear in the original space.

```python
from sklearn.svm import SVC, LinearSVC
from sklearn.datasets import make_circles
X, y = make_circles(500, noise=.1, factor=.4, random_state=0)
SVC(kernel="linear").fit(X, y).score(X, y)   # ≈ 0.59 (no straight line separates the rings)
SVC(kernel="rbf").fit(X, y).score(X, y)      # ≈ 1.0
```

**Practicalities.** **Always scale the features.** Kernel SVM training is roughly O(n²) to O(n³), so it is impractical beyond about 100k samples. SVMs don't output probabilities natively: `probability=True` uses Platt scaling, which is slower.

**Check yourself.** For 2 million short text documents with 100k TF-IDF features, would you use `SVC(kernel="rbf")` or `LinearSVC`? Why?

---

## 17. Kernel Trick

**The problem.** Explicitly mapping **x** into a very high (or infinite) dimensional feature space φ(**x**) is too expensive.

**The trick.** The SVM's optimisation and predictions depend on the data **only through dot products** φ(**x**)·φ(**z**). A **kernel function** computes that dot product directly, without ever forming φ:
K(**x**, **z**) = φ(**x**)·φ(**z**)

**Example.** For **x** = (x₁, x₂), the polynomial kernel K(**x**, **z**) = (**x**·**z**)² equals the dot product of φ(**x**) = (x₁², √2x₁x₂, x₂²) with φ(**z**). That is a 3-D feature space for the price of a 2-D dot product.

**Common kernels.**
| Kernel | Formula | Notes |
|---|---|---|
| Linear | **x**·**z** | Plain linear SVM |
| Polynomial | (γ**x**·**z** + r)^d | Feature interactions up to degree d |
| **RBF (Gaussian)** | exp(−γ‖**x** − **z**‖²) | Infinite-dimensional; the default choice |
| Sigmoid | tanh(γ**x**·**z** + r) | Rarely used |

**RBF's γ.** A large γ means each point has a tiny radius of influence, giving a wiggly boundary (overfitting). A small γ gives a smooth boundary. Tune **C and γ together** on a log grid.

Kernels also power kernel ridge regression, kernel PCA and Gaussian processes.

**Check yourself.** Why can the RBF kernel correspond to an *infinite*-dimensional feature space yet still be cheap to compute?

---

## 18. Naive Bayes Classification

**Idea.** Apply Bayes' theorem with the **"naive" assumption that features are conditionally independent given the class**:
P(y | x₁,…,x_d) ∝ P(y) · Πⱼ P(xⱼ | y)
Predict the class with the highest posterior. In practice, sum the **logs** to avoid underflow.

**Why it works despite being "naive".** Even when the independence assumption is wrong, the *ranking* of classes is often still right. It is extremely fast (one pass to count), needs very little data, and handles thousands of features.

**Worked mini example (spam).** P(spam) = 0.3. P("free" | spam) = 0.4 and P("free" | ham) = 0.05.
Email contains "free": score(spam) = 0.3·0.4 = 0.12; score(ham) = 0.7·0.05 = 0.035.
P(spam | "free") = 0.12/(0.12 + 0.035) ≈ **0.77**.

**Laplace (additive) smoothing.** If a word never appeared in spam during training, P(word | spam) = 0, which wipes out the whole product. Add α (usually 1) to every count.

**Weakness.** Its probabilities are poorly calibrated (overconfident), so use it for ranking and classification, not for trusted probabilities.

**Check yourself.** What goes wrong without Laplace smoothing when a test email contains a word never seen in spam training emails?

---

## 19. Gaussian, Multinomial and Bernoulli Naive Bayes

| Variant | Feature type | P(xⱼ \| y) model | Typical use |
|---|---|---|---|
| **GaussianNB** | Continuous | Normal with a per-class mean and variance | Numeric sensor or medical data |
| **MultinomialNB** | Counts | Multinomial over word counts | Text classification with word counts or TF-IDF |
| **BernoulliNB** | Binary (present/absent) | Bernoulli per feature; *absence* also counts as evidence | Short texts, binary features |
| ComplementNB | Counts | Learns from the complement of each class | Imbalanced text classification |
| CategoricalNB | Categorical | Categorical distribution | Categorical tabular features |

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
spam_clf = make_pipeline(CountVectorizer(ngram_range=(1, 2), min_df=2), MultinomialNB(alpha=1.0))
spam_clf.fit(train_texts, train_labels)
```

**Check yourself.** For a tweet classifier using word presence/absence, which variant fits best, and why does BernoulliNB treat a *missing* word differently from MultinomialNB?

---

## 20. Multiclass Classification Strategies

**Natively multiclass:** trees, forests, gradient boosting, KNN, Naive Bayes, neural networks (softmax), and multinomial logistic regression (softmax regression).

**Reducing multiclass to binary.**
| Strategy | How | # classifiers | Notes |
|---|---|---|---|
| **One-vs-Rest (OvR)** | Class k vs all others; predict the highest score | K | Simple; each problem is imbalanced |
| **One-vs-One (OvO)** | One classifier per pair; majority vote | K(K−1)/2 | Each problem is small; used by `SVC` |
| Error-correcting output codes | Binary codes per class | Configurable | Robust to errors in individual classifiers |

```python
from sklearn.multiclass import OneVsRestClassifier, OneVsOneClassifier
from sklearn.svm import LinearSVC
OneVsRestClassifier(LinearSVC()).fit(X, y)
```

**Evaluating multiclass models.** Use a K×K confusion matrix and **macro** averaging (average per class, treating every class equally) vs **weighted/micro** averaging (dominated by the frequent classes). See Module 13.

**Check yourself.** How many binary classifiers does OvO need for 10 digit classes? (45.)

---

## 21. Comparing Classification Algorithms

| Algorithm | Boundary | Needs scaling | Interpretability | Training speed | Large n | High-d sparse | Probabilities |
|---|---|---|---|---|---|---|---|
| Logistic regression | Linear | Yes | High | Fast | ✓ | ✓ | Good |
| KNN | Very flexible | **Yes** | Medium | None (lazy) | Slow prediction | ✗ | Rough |
| Decision tree | Axis-aligned | No | High (if shallow) | Fast | ✓ | ✗ | Poor |
| Random forest | Flexible | No | Medium | Medium | ✓ | Moderate | OK |
| Gradient boosting (XGBoost, LightGBM) | Flexible | No | Medium (SHAP) | Medium | ✓ | ✓ | Good |
| SVM (RBF) | Flexible | **Yes** | Low | Slow (n²) | ✗ | n/a | Needs Platt |
| Linear SVM | Linear | Yes | High | Fast | ✓ | **✓✓** | Needs calibration |
| Naive Bayes | Linear-ish | No | High | Very fast | ✓ | **✓✓** | Poorly calibrated |
| Neural network | Arbitrary | **Yes** | Low | Slow | ✓ | ✓ | Often overconfident |

**Practical defaults.**
1. **Tabular data:** start with logistic regression as a baseline, then gradient boosting (it usually wins).
2. **Text:** TF-IDF with logistic regression or a linear SVM, or Naive Bayes, as baselines. Then fine-tuned transformers.
3. **Images, audio, raw sequences:** deep learning (Modules 15-17).
4. **Small data:** simpler models with strong regularisation, and cross-validate carefully.

**Fair comparison protocol.**
```python
from sklearn.model_selection import cross_validate, StratifiedKFold
cv = StratifiedKFold(5, shuffle=True, random_state=0)
for name, model in candidates.items():
    res = cross_validate(model, X, y, cv=cv, scoring=["roc_auc", "f1"], n_jobs=-1)
    print(name, res["test_roc_auc"].mean().round(3), res["test_f1"].mean().round(3))
```
Use the same folds and the same preprocessing inside pipelines, tune each model fairly, and report mean ± std.

**Check yourself.** A logistic regression scores AUC 0.86 and gradient boosting scores 0.87 for a regulated credit decision. Which would you choose and why?
