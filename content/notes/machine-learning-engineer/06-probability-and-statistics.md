# Module 06: Probability and Statistics

**Phase 2 · Mathematical Foundations** · Goal: reason about uncertainty, describe data correctly, and judge whether a result is real or noise.

---

## 1. Introduction to Probability

**In plain English.** Probability is a number between 0 and 1 that measures how likely something is. ML models are probabilistic at heart: a classifier outputs P(spam | email), a language model outputs P(next token | context), and every dataset is a *sample* from an unknown distribution.

**Two interpretations.**
- **Frequentist:** probability is the long-run frequency in repeated trials.
- **Bayesian:** probability is a degree of belief that is updated with evidence.
ML uses both: frequentist ideas for testing and confidence intervals, Bayesian ideas for priors, regularisation and Naive Bayes.

**Check yourself.** A weather model says "70% chance of rain". How would a frequentist and a Bayesian each interpret that?

---

## 2. Random Experiments and Events

- **Random experiment:** a process with an uncertain outcome (a coin flip, a user clicking an ad).
- **Outcome:** one possible result.
- **Event:** a set of outcomes (for example "the die shows an even number" = {2, 4, 6}).

**Event operations (set notation).**
| Notation | Meaning |
|---|---|
| A ∪ B | A **or** B (or both) |
| A ∩ B | A **and** B |
| Aᶜ | **not** A |
| A ∩ B = ∅ | A and B are **mutually exclusive** |

**Check yourself.** Roll a die. Let A = "even" and B = "greater than 3". List A ∩ B and A ∪ B. ({4, 6}; {2, 4, 5, 6}.)

---

## 3. Sample Spaces and Probability Rules

**Sample space Ω:** the set of all possible outcomes.

**Kolmogorov axioms.**
1. P(A) ≥ 0
2. P(Ω) = 1
3. If A and B are mutually exclusive, P(A ∪ B) = P(A) + P(B)

**Derived rules.**
- **Complement:** P(Aᶜ) = 1 − P(A)
- **Addition (general):** P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
- **Equally likely outcomes:** P(A) = |A| / |Ω|

**Counting.** Permutations (order matters): n!/(n−k)!. Combinations (order doesn't matter): C(n, k) = n!/(k!(n−k)!).

**Check yourself.** What is the probability of at least one six in four rolls of a die? (Use the complement: 1 − (5/6)⁴ ≈ 0.518.)

---

## 4. Conditional Probability

**Definition.** The probability of A **given** that B has happened:
P(A | B) = P(A ∩ B) / P(B)

**In plain English.** Conditioning shrinks the world to just the cases where B is true.

**Multiplication rule.** P(A ∩ B) = P(A | B)·P(B).

**Law of total probability.** P(A) = Σᵢ P(A | Bᵢ)P(Bᵢ) over a partition {Bᵢ}.

**ML connection.** A classifier estimates P(y | **x**). Precision is P(actually positive | predicted positive). Recall is P(predicted positive | actually positive). These are *different* conditional probabilities.

**Pitfall.** P(A | B) ≠ P(B | A). "Most people with the disease test positive" is not the same as "most people who test positive have the disease". This is the base-rate fallacy, and Bayes' theorem resolves it.

**Check yourself.** Among 100 emails, 30 are spam. 24 spam emails and 7 non-spam emails contain "free". What is P(spam | contains "free")? (24/31 ≈ 0.77.)

---

## 5. Bayes' Theorem

**Formula.**
P(H | E) = P(E | H)·P(H) / P(E)

| Term | Name | Meaning |
|---|---|---|
| P(H) | Prior | Belief before the evidence |
| P(E \| H) | Likelihood | How probable the evidence is if H is true |
| P(E) | Evidence | Total probability of the evidence (the normaliser) |
| P(H \| E) | Posterior | Updated belief |

**Classic example: medical test.** The disease prevalence is 1%. The test has 99% sensitivity and a 5% false-positive rate. A patient tests positive:
P(D | +) = 0.99·0.01 / (0.99·0.01 + 0.05·0.99) = 0.0099 / 0.0594 ≈ **16.7%**
Even an accurate test gives mostly false alarms when the condition is rare. The same thing happens with fraud or anomaly detectors on imbalanced data.

**In ML.**
- **Naive Bayes classifiers** (Module 10).
- **Bayesian inference:** posterior ∝ likelihood × prior.
- **Regularisation as a prior:** L2 regularisation = a Gaussian prior on the weights; L1 = a Laplace prior (MAP estimation).

**Check yourself.** Recompute the medical example with a prevalence of 20%. What happens to P(D | +)? (≈ 83%.)

---

## 6. Independent and Dependent Events

**Independence.** A and B are independent if P(A ∩ B) = P(A)·P(B), or equivalently P(A | B) = P(A). Knowing B tells you nothing about A.

**Conditional independence.** A and B are independent *given* C: P(A ∩ B | C) = P(A | C)·P(B | C).

**In ML.**
- **i.i.d. assumption:** most theory assumes training examples are **independent and identically distributed**. Time series, grouped data (several rows per patient) and data drift all violate it.
- **Naive Bayes** assumes features are conditionally independent given the class. This is "naive" but often works well.
- Correlated features are dependent, which matters for interpreting linear model coefficients.

**Pitfall.** Mutually exclusive is **not** the same as independent. If A and B are mutually exclusive with non-zero probabilities, then they are *dependent*: knowing A happened tells you B did not.

**Check yourself.** Why does a random train/test split give over-optimistic results on time-series data?

---

## 7. Random Variables

**Definition.** A random variable X maps outcomes to numbers (for example X = the number of heads in 3 flips).

| Type | Values | Described by |
|---|---|---|
| Discrete | Countable (0, 1, 2, …) | **PMF**: P(X = x) |
| Continuous | Any real value in a range | **PDF** p(x), with P(a ≤ X ≤ b) = ∫ₐᵇ p(x)dx |

**CDF** (both types): F(x) = P(X ≤ x). It rises from 0 to 1.

**Pitfall.** A PDF value is a *density*, not a probability. It can exceed 1. For a continuous X, P(X = exactly 3) = 0.

**Check yourself.** Is "time until a customer churns" discrete or continuous? What about "number of support tickets"?

---

## 8. Discrete and Continuous Distributions

**In plain English.** A distribution describes *how* probability is spread over the possible values. Choosing the right distribution means choosing the right model of your data and the right loss.

| Distribution | Type | Models | ML use |
|---|---|---|---|
| Bernoulli | Discrete | One yes/no trial | Binary classification output |
| Binomial | Discrete | # successes in n trials | Conversion counts |
| Categorical / Multinomial | Discrete | One of K classes | Softmax output |
| Poisson | Discrete | Event counts per interval | Count regression |
| Uniform | Either | Equal likelihood | Random initialisation, sampling |
| Normal (Gaussian) | Continuous | Sums of many small effects | Noise models, MSE loss, initialisation |
| Exponential | Continuous | Waiting time | Survival analysis |

**Loss ↔ distribution link.** Minimising **MSE** is equivalent to maximum likelihood under **Gaussian** noise. Minimising **cross-entropy** is maximum likelihood under a **Bernoulli or Categorical** output.

```python
from scipy import stats
stats.norm(0, 1).pdf(0)   # 0.3989
stats.binom(10, 0.5).pmf(5)  # 0.2461
```

**Check yourself.** Which distribution would you use for the number of website visits per minute?

---

## 9. Bernoulli Distribution

**Definition.** A single trial with success probability p: X ∈ {0, 1}.
P(X = 1) = p, P(X = 0) = 1 − p. Compactly, P(X = x) = pˣ(1 − p)¹⁻ˣ.
**Mean** = p, **Variance** = p(1 − p) (largest at p = 0.5).

**ML connection.** A binary classifier predicts the Bernoulli parameter p̂ = σ(z). The **negative log-likelihood** of a Bernoulli outcome is exactly the **binary cross-entropy**:
−log P(y) = −[y log p̂ + (1 − y) log(1 − p̂)]

**Check yourself.** Why is the variance of a Bernoulli largest at p = 0.5? Interpret that for a classifier's uncertainty.

---

## 10. Binomial Distribution

**Definition.** The number of successes in n independent Bernoulli(p) trials:
P(X = k) = C(n, k) pᵏ(1 − p)ⁿ⁻ᵏ
**Mean** = np, **Variance** = np(1 − p)

**Example.** A model is 90% accurate on independent examples. In a batch of 20, the probability that it gets exactly 18 right is C(20,18)·0.9¹⁸·0.1² ≈ 0.285.

**ML use.** Accuracy on a test set of n examples is binomial, which gives an error bar. With n = 1,000 and accuracy 0.9, the SE = √(0.9·0.1/1000) ≈ 0.0095, so the 95% CI is about ±1.9 percentage points. Tiny test sets give noisy accuracy.

**Check yourself.** Two models score 91.0% and 91.5% on a 500-example test set. Is that difference meaningful? (Estimate the standard errors.)

---

## 11. Normal Distribution

**Definition.**
p(x) = (1/(σ√(2π))) exp(−(x − μ)²/(2σ²)),  written X ~ N(μ, σ²)

It is bell-shaped, symmetric and fully described by its mean μ and standard deviation σ.

**68-95-99.7 rule.** About 68% of values lie within ±1σ, 95% within ±2σ (more precisely ±1.96σ) and 99.7% within ±3σ.

**Standard normal.** Z = (X − μ)/σ ~ N(0, 1). This is the z-score used for standardisation and outlier detection.

**Why it is everywhere.** The **Central Limit Theorem** (topic 19): sums and averages of many independent effects tend towards normal. It also makes the maths tractable.

**Multivariate normal** N(**μ**, Σ): its covariance matrix Σ shapes an elliptical cloud. It is used in GMMs, Gaussian processes and VAEs.

**Pitfall.** Many real variables are *not* normal: income (right-skewed), counts, and anything bounded. Check with a histogram or Q-Q plot before assuming normality.

**Check yourself.** Heights are N(170, 10²) cm. What fraction of people are taller than 190 cm? (z = 2, so about 2.3%.)

---

## 12. Poisson Distribution

**Definition.** The number of events in a fixed interval when events occur independently at a constant average rate λ:
P(X = k) = λᵏ e^{−λ} / k!,  **Mean = Variance = λ**

**Examples.** Calls per hour to a support centre, server errors per day, defects per metre of cable.

**ML use.** Poisson regression (`PoissonRegressor` in scikit-learn, or `objective="count:poisson"` in XGBoost) for count targets. Anomaly alerts: "we normally see λ = 4 errors per hour, and we just saw 15. Is that unusual?"

**Overdispersion.** When the variance is much greater than the mean, use a Negative Binomial distribution instead.

**Check yourself.** A site averages 3 errors per hour. What is the probability of zero errors in an hour? (e⁻³ ≈ 0.050.)

---

## 13. Uniform Distribution

**Discrete uniform.** n equally likely outcomes, each with probability 1/n (a fair die).
**Continuous uniform** U(a, b): density 1/(b − a) on [a, b]. Mean = (a + b)/2, variance = (b − a)²/12.

**ML uses.**
- Random number generation: other distributions are often derived from U(0, 1) (inverse-CDF sampling).
- **Xavier/Glorot uniform initialisation:** U(−√(6/(n_in + n_out)), +√(6/(n_in + n_out))).
- **Random search** samples hyperparameters uniformly, often on a *log* scale for learning rates.
- A non-informative prior in Bayesian modelling.

**Check yourself.** Why should a learning rate be sampled uniformly in log-space (e.g. 10^U(−5, −1)) instead of uniformly in [0.00001, 0.1]?

---

## 14. Expected Value and Variance

**Expected value (mean)** is the long-run average:
Discrete: E[X] = Σ x·P(x). Continuous: E[X] = ∫ x·p(x) dx.

**Variance** is the average squared distance from the mean:
Var(X) = E[(X − μ)²] = E[X²] − (E[X])²

**Properties.**
- E[aX + b] = aE[X] + b, and E[X + Y] = E[X] + E[Y] (always).
- Var(aX + b) = a²Var(X).
- Var(X + Y) = Var(X) + Var(Y) + 2Cov(X, Y). The covariance term vanishes if X and Y are independent.
- Averaging n independent copies: **Var(X̄) = σ²/n**. This is why more data and **bagging** (averaging many models) reduce variance (Module 12).

**In ML.** The training objective is an **expected loss**, E[L(f(**x**), y)], estimated by the average over the data. The bias-variance decomposition (Module 08) is built on these definitions.

**Check yourself.** A game pays £10 with probability 0.2 and £0 otherwise. Compute E and Var. (E = 2; Var = 0.2·100 − 4 = 16.)

---

## 15. Mean, Median and Mode

| Measure | Definition | Robust to outliers? | Best for |
|---|---|---|---|
| Mean | Sum / count | No | Symmetric numeric data |
| Median | Middle value when sorted | Yes | Skewed data (income, house prices) |
| Mode | Most frequent value | Yes | Categorical data |

**Skew tells you the order.** In right-skewed data (a long tail to the right), mean > median. In left-skewed data, mean < median.

**Loss connection.** The constant that minimises **MSE** is the **mean**. The constant that minimises **MAE** is the **median**. This is why MAE-trained models are more robust to outliers.

**Check yourself.** A company's salaries are mostly £30-50k, but the CEO earns £5M. Which measure of "typical salary" would be misleading?

---

## 16. Variance and Standard Deviation

**Sample variance** s² = Σ(xᵢ − x̄)² / (n − 1). Dividing by **n − 1** (Bessel's correction) makes it an unbiased estimate of the population variance, because x̄ is itself estimated from the same data.

**Standard deviation** s = √s² is in the **same units** as the data, so it is easier to interpret.

**Coefficient of variation:** CV = s / x̄ compares spread across different scales.

**ML uses.** Standardisation (z = (x − x̄)/s), reporting cross-validation results as mean ± std, measuring model uncertainty, and spotting features with almost no variance (useless) or exploding activations.

**Check yourself.** Cross-validation scores are 0.81, 0.83, 0.80, 0.84, 0.82. Report them as mean ± std. (0.82 ± 0.016.)

---

## 17. Covariance and Correlation

**Covariance:** Cov(X, Y) = E[(X − μ_X)(Y − μ_Y)]. Its sign shows the direction of the relationship, but its size depends on the units.

**Pearson correlation:** ρ = Cov(X, Y) / (σ_X σ_Y) ∈ [−1, 1]. This is unit-free and measures **linear** association.

**Spearman correlation:** Pearson computed on ranks. It captures **monotonic** (not necessarily linear) relationships and is robust to outliers.

```python
df[["age", "income", "tenure"]].corr()                  # Pearson
df[["age", "income", "tenure"]].corr(method="spearman")
np.cov(X, rowvar=False)                                 # covariance matrix (features × features)
```

**Pitfalls.**
- **Correlation ≠ causation.** Ice-cream sales and drownings correlate because both rise in summer (a confounder).
- ρ = 0 does **not** mean independent. Y = X² has zero Pearson correlation on symmetric X, yet Y is fully determined by X.
- **Anscombe's quartet:** four datasets with identical correlations look completely different. Always plot.
- Highly correlated features (multicollinearity) make linear-model coefficients unstable.

**Check yourself.** Two features have ρ = 0.97. What problem does this cause for linear regression, and what are two fixes?

---

## 18. Sampling and Sampling Distributions

**Population vs sample.** We rarely see the whole population. We compute **statistics** (x̄, s) on a sample to estimate **parameters** (μ, σ).

**Sampling methods.**
| Method | Description | ML analogue |
|---|---|---|
| Simple random | Every unit equally likely | Random train/test split |
| Stratified | Sample within subgroups proportionally | `stratify=y` |
| Cluster / group | Sample whole groups | `GroupKFold` |
| Systematic | Every k-th item | Rarely wise with ordered data |
| Bootstrap | Resample *with replacement* from the sample | Bagging, confidence intervals |

**Sampling distribution.** If you repeated the sampling many times, a statistic (such as x̄) would vary. Its distribution is the sampling distribution, and its standard deviation is the **standard error**: **SE(x̄) = σ/√n**.

**Bootstrap confidence interval for any metric.**
```python
rng = np.random.default_rng(0)
scores = []
for _ in range(2000):
    idx = rng.integers(0, len(y_test), len(y_test))
    scores.append((y_test[idx] == y_pred[idx]).mean())
np.percentile(scores, [2.5, 97.5])
```

**Pitfall: sampling bias.** A model trained on a non-representative sample (for example only daytime users) fails on the population it serves.

**Check yourself.** To halve the standard error of your test accuracy, how much larger must the test set be? (4×.)

---

## 19. Central Limit Theorem

**Statement.** For i.i.d. variables with mean μ and finite variance σ², the distribution of the sample mean X̄ approaches **N(μ, σ²/n)** as n grows, *whatever the shape of the original distribution*.

```python
rng = np.random.default_rng(0)
data = rng.exponential(scale=1.0, size=(10_000, 30))  # very skewed
means = data.mean(axis=1)
# The histogram of `means` is close to a bell curve centred at 1 with SD ≈ 1/√30 ≈ 0.18
```

**Why it matters.**
- It justifies normal-based confidence intervals and hypothesis tests for averages (topics 20-21), including averaged metrics like accuracy or mean revenue in A/B tests.
- It explains why mini-batch gradients are roughly normal around the true gradient, with noise that shrinks as 1/√(batch size).

**Caveats.** It needs finite variance (heavy-tailed data such as some financial returns can break it), independence, and a "large enough" n (often ~30, but more for skewed data).

**Check yourself.** Individual purchase amounts are highly skewed. Why can you still use a normal-based confidence interval for the *average* purchase amount from 5,000 orders?

---

## 20. Confidence Intervals

**Definition.** A range computed from the data that, under repeated sampling, would contain the true parameter a stated proportion of the time (for example 95%).

**For a mean (large n):** x̄ ± z*·s/√n, with z* = 1.96 for 95%. Use the t-distribution for small n.
**For a proportion (such as accuracy):** p̂ ± 1.96·√(p̂(1 − p̂)/n). For small n or p near 0 or 1, use the Wilson interval.

```python
from scipy import stats
stats.t.interval(0.95, df=len(x)-1, loc=x.mean(), scale=stats.sem(x))
```

**Correct interpretation.** "95% of intervals built this way contain μ". This is a statement about the *procedure*. It is **not** "there is a 95% probability that μ is in this specific interval" (that is the Bayesian *credible interval*).

**ML use.** Always report metrics with uncertainty: "accuracy 0.874 (95% CI 0.859-0.889)". Two models whose intervals overlap heavily may not really differ.

**Check yourself.** Will a 99% CI be wider or narrower than a 95% CI on the same data? Why?

---

## 21. Hypothesis Testing

**Framework.**
1. **Null hypothesis H₀:** no effect or no difference (for example "the new model has the same conversion rate").
2. **Alternative H₁:** there is an effect.
3. Choose a **significance level α** (often 0.05) *before* you look at the data.
4. Compute a **test statistic** from the data.
5. Compute the **p-value** and reject H₀ if p < α.

**Common tests.**
| Test | Question |
|---|---|
| One/two-sample **t-test** | Do the means differ? |
| **Paired t-test** | Do two models differ on the same CV folds or examples? |
| **Chi-square test** | Are two categorical variables associated? |
| **Mann-Whitney U** | Do distributions differ? (non-parametric) |
| **McNemar's test** | Do two classifiers differ on the same test set? |
| **Two-proportion z-test** | A/B test conversion rates |

```python
from scipy import stats
stats.ttest_rel(scores_model_a, scores_model_b)          # paired across CV folds
stats.chi2_contingency(pd.crosstab(df.plan, df.churned))
```

**ML use.** A/B testing a new model in production, comparing models across folds, and checking whether a feature is associated with the target.

**Check yourself.** Why is a *paired* test more appropriate than an unpaired one when comparing two models on the same 10 CV folds?

---

## 22. P-values and Statistical Significance

**Definition.** The p-value is the probability of seeing data *at least as extreme* as what you observed, **assuming H₀ is true**.

**What it is NOT.**
- ❌ The probability that H₀ is true.
- ❌ The probability that the result is due to chance.
- ❌ A measure of effect size or importance.

**Statistical vs practical significance.** With millions of users, a 0.01% conversion lift can have p < 0.001 and still be worthless. Always report the **effect size and confidence interval** alongside p.

**Multiple comparisons.** Test 20 useless features at α = 0.05 and you expect about one "significant" result by chance. Corrections: Bonferroni (α/m) or Benjamini-Hochberg (controls the false discovery rate). The same issue appears when you try many models or hyperparameters and report the best: this is **overfitting to the validation set**.

**p-hacking.** Stopping an A/B test as soon as p < 0.05, or trying many analyses until one "works", invalidates the p-value. Pre-register the sample size and stopping rule (or use sequential testing methods).

**Check yourself.** An A/B test gives p = 0.03 and a lift of +0.02% with 10 million users. Should you ship it? What else do you need to know?

---

## 23. Type I and Type II Errors

| | H₀ true (no effect) | H₀ false (real effect) |
|---|---|---|
| **Reject H₀** | **Type I error** (false positive), probability α | Correct (power = 1 − β) |
| **Fail to reject** | Correct | **Type II error** (false negative), probability β |

**Power** is the probability of detecting a real effect. It increases with a larger sample size, a larger true effect, lower noise and a higher α.

**Trade-off.** Lowering α (being stricter) reduces false positives but increases false negatives, unless you collect more data. **Power analysis** before an experiment tells you the sample size you need.

**Direct link to classification (Module 13).** A false positive is a Type I error and a false negative is a Type II error. Moving a classifier's threshold trades one for the other, just like changing α. Which error is worse depends on the cost: missing cancer (FN) vs a false alarm (FP).

**Check yourself.** For a spam filter, which is worse: a Type I error (a real email marked as spam) or a Type II error (spam reaches the inbox)? How should that affect the threshold?

---

## 24. Introduction to Statistical Inference

**In plain English.** Statistical inference means drawing conclusions about a population from a sample, *with quantified uncertainty*. It includes estimation (point estimates and intervals), hypothesis testing and prediction.

**Two key estimation principles.**
- **Maximum Likelihood Estimation (MLE):** choose the parameters that make the observed data most probable: θ̂ = argmax_θ Πᵢ p(xᵢ | θ). In practice, maximise the *log*-likelihood (sums are easier than products). **Most ML training is MLE.**
  - Gaussian noise → MLE = minimise MSE (linear regression).
  - Bernoulli → MLE = minimise binary cross-entropy (logistic regression).
- **Maximum A Posteriori (MAP):** argmax_θ p(data | θ)·p(θ). Adding a prior acts as regularisation (Gaussian prior → L2/Ridge; Laplace prior → L1/Lasso).
- **Full Bayesian inference** keeps the whole posterior distribution p(θ | data) rather than one point estimate. This gives uncertainty estimates and is used in Bayesian optimisation (Module 14).

**Inference vs prediction.**
| Statistical inference | ML prediction |
|---|---|
| "Is the effect of X on Y real, and how big is it?" | "What will Y be for this new X?" |
| Interpretable models, p-values, CIs | Accuracy on held-out data |
| Assumptions matter a lot | Validation performance matters most |

Good ML engineers need both: prediction to build the model, and inference to judge whether improvements, A/B tests and data differences are real.

**Check yourself.** Show that, for coin flips with h heads in n tosses, the MLE of p is h/n. (Maximise h·log p + (n − h)·log(1 − p).)

**Recommended resources.** *Think Stats* (Downey, free); *An Introduction to Statistical Learning*; StatQuest (Josh Starmer) videos.
