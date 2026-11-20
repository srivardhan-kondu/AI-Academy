# Module 08: Introduction to Machine Learning

**Phase 3 · Classical Machine Learning** · Goal: a precise mental model of what learning from data means and the failure modes every ML engineer must guard against.

---

## 1. What Is Machine Learning?

**In plain English.** Machine learning is building systems that **improve at a task by learning patterns from data**, instead of following rules a human wrote by hand.

**Tom Mitchell's definition (1997).** "A program learns from experience **E** with respect to task **T** and performance measure **P**, if its performance at T, as measured by P, improves with E."
- Spam filter: T = classify emails, E = labelled emails, P = accuracy or recall on new emails.

**Where ML sits.** AI ⊃ Machine Learning ⊃ Deep Learning. Generative AI and LLMs are deep learning models trained on very large datasets.

**When ML is the right tool.**
✓ The rules are too complex to write down (vision, language); ✓ the patterns change over time (fraud); ✓ you have enough representative data; ✓ some errors are acceptable.
✗ A simple rule works; ✗ you need perfect, explainable guarantees; ✗ there is no data or labels.

**Check yourself.** Define T, E and P for a model that recommends films.

---

## 2. How Machines Learn from Data

**The three ingredients of every learning algorithm.**
1. **Model (hypothesis class):** a family of functions f_θ that the algorithm can choose from (lines, trees, neural networks).
2. **Loss function:** how wrong a given f_θ is on the data.
3. **Optimiser:** how to search for the θ with the lowest loss (gradient descent, greedy tree splits, closed form).

```
data (x, y) ──► model f_θ ──► prediction ŷ ──► loss L(ŷ, y)
                     ▲                              │
                     └────── optimiser updates θ ◄──┘
```

**What "learning" really means.** The goal is not to memorise the training data but to capture the underlying pattern so that predictions are good on **new, unseen data** from the same distribution (generalisation, topic 15).

**Inductive bias.** Every model makes assumptions. Linear models assume additive linear effects. CNNs assume local patterns that repeat across an image. With no assumptions at all, learning is impossible (the "no free lunch" theorem).

**Check yourself.** For a decision tree, what are the model, the loss and the optimiser?

---

## 3. Traditional Programming vs Machine Learning

```
Traditional programming:   Rules + Data  ──►  Answers
Machine learning:          Data + Answers ──►  Rules (a model)
```

| Aspect | Traditional software | ML system |
|---|---|---|
| Logic | Written by people | Learned from data |
| Behaviour | Deterministic and specified | Statistical; it will sometimes be wrong |
| Testing | Unit tests on exact outputs | Evaluation metrics on held-out data, plus unit tests on the code |
| Failure mode | Crashes or bugs | Silent degradation (drift, bias) |
| Changing it | Edit the code | Change the data or features and retrain |
| Dependencies | Code | Code **+ data + model** |

**Software 2.0** (a phrase from Andrej Karpathy): part of the program is "written" by optimisation in the form of learned weights.

**Check yourself.** Why can't you write a unit test that guarantees an image classifier is correct?

---

## 4. Types of Machine Learning

| Type | Data | Goal | Examples |
|---|---|---|---|
| Supervised | Inputs **with** labels | Predict labels | Spam detection, price prediction |
| Unsupervised | Inputs **without** labels | Find structure | Customer segments, anomaly detection |
| Semi-supervised | Few labels, many unlabelled examples | Use both | Medical imaging with limited expert labels |
| Self-supervised | Labels generated from the data itself | Learn representations | LLM pre-training (predict the next token) |
| Reinforcement | Rewards from interaction | Learn a policy | Games, robotics, RLHF |

Also: **online vs batch learning** (update continuously or retrain periodically) and **instance-based vs model-based learning** (KNN memorises examples; linear regression learns parameters).

**Check yourself.** Classify each case: (a) grouping news articles by topic with no labels, (b) predicting tomorrow's temperature, (c) teaching a robot to walk through trial and error.

---

## 5. Supervised Learning

**Definition.** Learn a mapping f: **x** → y from labelled pairs (**x**ᵢ, yᵢ).

| Sub-type | Target | Example | Typical metrics |
|---|---|---|---|
| **Regression** | Continuous number | House price, demand | MAE, RMSE, R² |
| **Classification** | Discrete category | Spam / not spam, digit 0-9 | Accuracy, precision, recall, F1, AUC |

Other variants: multi-label classification (several tags per item), ranking, structured prediction (sequences), and forecasting.

**The labels are the bottleneck.** Labelling is expensive, slow and noisy. Label quality often limits performance more than model choice does. Measure inter-annotator agreement and audit samples.

**Check yourself.** Is predicting a star rating from 1 to 5 regression or classification? Argue both sides.

---

## 6. Unsupervised Learning

**Definition.** Find structure in data **without labels**.

| Task | Question | Algorithms (Module 11) |
|---|---|---|
| Clustering | Which items naturally group together? | K-means, DBSCAN, hierarchical, GMM |
| Dimensionality reduction | Can we describe the data with fewer variables? | PCA, t-SNE, UMAP, autoencoders |
| Anomaly detection | Which items are unusual? | Isolation Forest, One-Class SVM |
| Density estimation | How is the data distributed? | GMM, KDE |
| Association rules | What occurs together? | Apriori ("people who buy X buy Y") |

**The challenge.** There is no ground truth to score against, so evaluation relies on internal metrics (silhouette), stability and, above all, **usefulness to the business**.

**Check yourself.** How would you judge whether a customer segmentation is "good" when no labels exist?

---

## 7. Semi-Supervised Learning

**In plain English.** Use a small labelled set *plus* a large unlabelled set. Unlabelled data shows the shape of the input distribution, which helps place decision boundaries in low-density regions.

**Techniques.**
- **Self-training / pseudo-labelling:** train on the labelled data, predict on unlabelled data, add the confident predictions as labels, and retrain (`sklearn.semi_supervised.SelfTrainingClassifier`).
- **Label propagation:** spread labels through a similarity graph.
- **Consistency regularisation:** the model should give the same prediction for an input and its augmented version (FixMatch).

**Assumptions:** smoothness (nearby points share labels), clustering (points in a cluster share a label), and the manifold assumption.

**Risk.** Confident but wrong pseudo-labels reinforce themselves (confirmation bias).

**Check yourself.** You have 500 labelled and 100,000 unlabelled X-rays. Sketch a pseudo-labelling workflow and a safeguard against error reinforcement.

---

## 8. Self-Supervised Learning

**In plain English.** Create the labels automatically from the data's own structure. The model learns by solving a **pretext task**, and the representations it learns transfer to real tasks.

**Examples.**
| Domain | Pretext task |
|---|---|
| Language (GPT) | Predict the next token |
| Language (BERT) | Predict masked words |
| Vision (SimCLR, DINO) | Make two augmented views of the same image have similar embeddings (contrastive learning) |
| Vision (MAE) | Reconstruct masked image patches |
| Audio | Predict masked audio segments |

**Why it matters.** This is the engine behind **foundation models**: pre-train on huge amounts of unlabelled data, then fine-tune on a little labelled data. It removes the labelling bottleneck.

**Self-supervised vs unsupervised.** Both use unlabelled data, but self-supervised learning frames the problem as *supervised* prediction with automatically generated targets.

**Check yourself.** Why is "predict the next word" a powerful task for learning grammar, facts and reasoning?

---

## 9. Reinforcement Learning Overview

**In plain English.** An **agent** takes **actions** in an **environment**, receives **rewards**, and learns a **policy** (a strategy) that maximises the total reward over time. Nobody provides the correct action; the agent finds it by trial and error.

```
agent ──action──► environment
  ▲                    │
  └── state, reward ◄──┘
```

**Key concepts.**
- **State s, action a, reward r, policy π(a | s).**
- **Return:** discounted future reward Σ γᵗ rₜ, with γ ∈ [0, 1).
- **Value function V(s) / Q(s, a):** the expected return from a state or state-action pair.
- **Exploration vs exploitation:** try new actions or use the best one known so far (for example ε-greedy).
- **Credit assignment:** which past action caused today's reward?

**Algorithms.** Q-learning and DQN (value-based), policy gradients and **PPO** (policy-based), actor-critic, and multi-armed bandits (the simplest case, used for A/B testing and recommendations).

**Applications.** Game playing (AlphaGo), robotics, recommendation, resource scheduling, and **RLHF** for aligning LLMs with human preferences.

**Check yourself.** What makes RL harder than supervised learning? Name two difficulties.

---

## 10. Features, Labels and Targets

- **Features (X, inputs, predictors, independent variables):** the information the model uses. Each column is a feature, and each row is an example or sample.
- **Label / target (y, output, dependent variable):** what we want to predict. "Label" is common for classification and "target" for regression.
- **Instance / sample / observation:** one row.

```
            features (X)                 target (y)
customer  age  tenure  monthly_spend  │  churned
   001     34      12          45.0   │     0
   002     51       2          80.5   │     1
```

**Feature types.** Numeric (continuous or discrete), categorical (nominal or ordinal), boolean, text, date/time, image, and geospatial.

**Golden rule.** A feature must be **available at prediction time**, with the value it would have had *at that moment*. Otherwise you have leakage (topic 16).

**Check yourself.** In predicting hospital readmission at discharge, is "length of the readmission stay" a valid feature?

---

## 11. Training, Validation and Testing Data

| Split | Purpose | Touched how often? |
|---|---|---|
| **Training** | Fit the model's parameters | Constantly |
| **Validation** | Choose hyperparameters, features and models; early stopping | Many times |
| **Test** | A final, unbiased estimate of real-world performance | **Once, at the end** |

**Typical ratios.** 60/20/20 or 70/15/15 for medium data, 98/1/1 for millions of rows. **Cross-validation** (Module 13) replaces a single validation split when data is limited.

```python
from sklearn.model_selection import train_test_split
X_tmp, X_test, y_tmp, y_test = train_test_split(X, y, test_size=0.15, stratify=y, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_tmp, y_tmp, test_size=0.1765, stratify=y_tmp, random_state=42)
# ≈ 70 / 15 / 15
```

**Split strategy must match reality.**
- **Time series:** train on the past, validate and test on the future (no shuffling).
- **Grouped data:** keep all rows from a user or patient in one split.
- **Imbalanced data:** stratify.

**Pitfall.** Using the test set repeatedly to make decisions turns it into a validation set, and your reported score becomes optimistic.

**Check yourself.** You tried 200 configurations and picked the best by test score. Why is that score now misleading?

---

## 12. The Machine Learning Pipeline

**End to end.**
```
1. Problem definition  →  2. Data collection  →  3. EDA  →  4. Cleaning
→  5. Feature engineering  →  6. Split  →  7. Baseline model  →  8. Model training
→  9. Hyperparameter tuning  →  10. Evaluation and error analysis  →  11. Deployment
→  12. Monitoring and retraining  ──► (back to 2)
```

**Engineering principles.**
- **Baseline first:** a trivial model (predict the mean or majority class) and a simple model (linear or logistic) set the bar every complex model must clear.
- **The same transformations in training and serving:** package preprocessing and model together (scikit-learn `Pipeline`) to avoid *training-serving skew*.
- **Error analysis:** look at the examples the model gets wrong. They tell you whether to get more data, fix labels, or add features.
- **Iterate quickly:** small experiments with tracked results (MLflow, Module 19).

**Check yourself.** Why should you build a `DummyClassifier` baseline even when you are sure a gradient-boosted model will win?

---

## 13. Underfitting and Overfitting

| | Underfitting | Good fit | Overfitting |
|---|---|---|---|
| Training error | High | Low | **Very low** |
| Validation error | High | Low | **High** |
| Cause | Model too simple, too little training, weak features | n/a | Model too complex for the data; memorises noise |
| Analogy | A student who didn't study | Understands the concepts | Memorised past papers but can't handle new questions |

**Diagnose with learning curves** (error versus training set size or versus epochs):
- Both errors high and close together → **underfitting** (high bias).
- Large gap between training and validation error → **overfitting** (high variance).

**Fixes.**
| Underfitting | Overfitting |
|---|---|
| A more complex model | More data or data augmentation |
| Better features | Regularisation (L1/L2, dropout) |
| Train longer | Simpler model, fewer features |
| Less regularisation | Early stopping, ensembling, cross-validation |

```python
from sklearn.model_selection import learning_curve
sizes, train_sc, val_sc = learning_curve(model, X, y, cv=5, train_sizes=np.linspace(.1, 1, 8))
```

**Check yourself.** A degree-15 polynomial fits 20 training points perfectly. Predict its validation error and explain why.

---

## 14. Bias-Variance Trade-off

**Decomposition** (for squared error at a point x):
**Expected error = Bias² + Variance + Irreducible noise**

- **Bias:** error from wrong assumptions. How far the *average* model (over many training sets) is from the truth. High bias means underfitting.
- **Variance:** how much the model changes if you train on a different sample. High variance means overfitting.
- **Irreducible error (σ²):** noise in the data itself. No model can remove it.

**Dartboard analogy.** Low bias with low variance means tightly grouped throws on the bullseye. High bias means grouped but off-centre. High variance means scattered around the centre.

**The trade-off.** Increasing model complexity usually reduces bias and increases variance. The sweet spot minimises their sum.

| Model / setting | Bias | Variance |
|---|---|---|
| Linear regression | High | Low |
| Deep decision tree | Low | High |
| KNN with k = 1 | Low | High |
| KNN with large k | High | Low |
| Stronger regularisation (λ↑) | ↑ | ↓ |
| Bagging (Random Forest) | ≈ | ↓↓ |
| Boosting | ↓↓ | ↑ (controlled) |

**Modern twist: double descent.** Very over-parameterised models (deep networks) can generalise well despite fitting the training data perfectly. As complexity grows past the interpolation point, the test error can fall again. The classic U-curve is not the whole story, but bias and variance remain the core vocabulary.

**Check yourself.** Why does averaging many deep trees trained on bootstrap samples reduce variance without increasing bias much?

---

## 15. Generalisation in Machine Learning

**Definition.** Generalisation is performance on **new data from the same distribution**. The **generalisation gap** is the test error minus the training error.

**What drives good generalisation.**
- **More, and more representative, data**: the strongest lever.
- **The right inductive bias** for the problem (CNNs for images).
- **Regularisation:** penalties, dropout, data augmentation, early stopping.
- **Simplicity (Occam's razor):** among models that fit equally well, prefer the simpler one.
- **Honest evaluation:** held-out tests that mimic deployment.

**Distribution shift breaks generalisation.**
| Shift | What changes | Example |
|---|---|---|
| Covariate shift | P(x) | A new customer demographic |
| Label/prior shift | P(y) | The fraud rate doubles |
| Concept drift | P(y \| x) | Fraudsters change tactics |
(Covered in depth in Module 19.)

**Check yourself.** A model trained on hospital A's X-ray machine fails at hospital B. Which type of shift is this, and how could you detect it early?

---

## 16. Data Leakage and Why It Matters

**Definition.** Leakage happens when information that **would not be available at prediction time** gets into training or evaluation. The model looks brilliant offline and fails in production.

**Common types.**
| Type | Example | Fix |
|---|---|---|
| **Target leakage** | The feature `account_closed_date` when predicting churn; `treatment_given` when predicting diagnosis | Use only features known *before* the prediction moment |
| **Train-test contamination** | Fitting the scaler or imputer on the full dataset before splitting | Split first; use Pipelines |
| **Duplicate leakage** | The same record (or the same patient) in both train and test | Deduplicate; group-aware splits |
| **Temporal leakage** | Random split on time-series data; features computed with future data | Time-based splits; point-in-time feature computation |
| **Feature selection leakage** | Selecting features using all the data before cross-validation | Put selection inside the CV pipeline |
| **Tuning on the test set** | Choosing a model by its test score | Separate validation set or CV |

**Red flags.** Suspiciously high accuracy (99% on a hard problem), a single feature dominating feature importance, and a large gap between offline and online performance.

**Example (subtle).** In a famous case, a pneumonia-risk model learned that asthma patients had *lower* risk, because asthmatics were sent straight to intensive care, so their recorded outcomes were better. The data reflected the treatment, not the underlying risk.

**Check yourself.** You are predicting whether a customer will default next month. Which is leakage: (a) current balance, (b) whether the account was sent to collections, (c) the number of late payments in the last 6 months?

**Recommended resources.** *Hands-On Machine Learning* (Géron), chapters 1-2; *An Introduction to Statistical Learning*, chapter 2; Google's *Rules of Machine Learning*.
