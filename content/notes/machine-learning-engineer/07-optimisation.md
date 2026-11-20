# Module 07: Optimisation for Machine Learning

**Phase 2 · Mathematical Foundations** · Goal: understand exactly how models find good parameters, and why training sometimes fails.

---

## 1. What Is Optimisation?

**In plain English.** Optimisation means finding the input that makes a function as small (or large) as possible. In ML, **training is optimisation**: find the parameters **θ** that minimise the loss on the training data.

θ* = argmin_θ L(θ),  L(θ) = (1/n) Σᵢ ℓ(f_θ(**x**ᵢ), yᵢ) + λ·R(θ)

(the average loss over the data, plus an optional regularisation term)

**Families of methods.**
| Family | Uses | Examples |
|---|---|---|
| Closed form | Solve ∇L = 0 analytically | OLS normal equations |
| First-order | Gradients | GD, SGD, Momentum, Adam |
| Second-order | Gradients + curvature | Newton, L-BFGS (used by `LogisticRegression(solver="lbfgs")`) |
| Gradient-free | Function values only | Grid/random search, Bayesian optimisation, evolutionary methods |

**Key distinction.** We optimise the *training* loss, but we care about performance on *unseen* data. The best optimum on the training set is not always the best model (overfitting).

**Check yourself.** Why can't we train a neural network with the closed-form approach used for linear regression?

---

## 2. Understanding Objective and Loss Functions

**Terms.**
- **Loss function ℓ(ŷ, y):** the error on one example.
- **Cost / objective J(θ):** the average loss over the dataset, plus regularisation.

**Common losses.**
| Task | Loss | Formula | Notes |
|---|---|---|---|
| Regression | MSE | (ŷ − y)² | Punishes big errors heavily; Gaussian MLE |
| Regression | MAE | \|ŷ − y\| | Robust to outliers; non-smooth at 0 |
| Regression | Huber | Quadratic when small, linear when large | Best of both |
| Binary classification | Binary cross-entropy | −[y log p + (1−y) log(1−p)] | Bernoulli MLE |
| Multiclass | Categorical cross-entropy | −Σ yₖ log pₖ | With softmax |
| SVM | Hinge | max(0, 1 − y·f(x)) | Margin-based |
| Ranking / embeddings | Contrastive / triplet | n/a | Similarity learning |

**Choosing a loss.** It must (1) reflect what you actually care about, (2) be differentiable (or sub-differentiable) for gradient methods, and (3) match the noise model of your data.

**Surrogate losses.** Accuracy is not differentiable (it is a step function of the parameters), so we optimise cross-entropy as a smooth *surrogate* and *evaluate* accuracy.

**Check yourself.** Why do we train classifiers with cross-entropy instead of directly maximising accuracy?

---

## 3. Convex and Non-Convex Functions

**Convex function.** The line segment between any two points on the graph lies on or above the graph:
f(tx + (1−t)y) ≤ t·f(x) + (1−t)·f(y), for t ∈ [0, 1].
Equivalently (for twice-differentiable functions), f″ ≥ 0, or the Hessian is positive semi-definite.

**Why convexity is wonderful.** **Every local minimum is a global minimum.** Gradient descent with a suitable learning rate is guaranteed to reach the optimum.

| Convex problems | Non-convex problems |
|---|---|
| Linear regression (MSE) | Neural networks |
| Logistic regression | Matrix factorisation |
| Ridge, Lasso | K-means objective |
| Linear SVM | Most deep learning |

**Non-convex** landscapes have many local minima, saddle points and plateaus. Yet in large neural networks, most local minima turn out to have similar, good loss values. **Saddle points and poor conditioning** are the bigger practical obstacles.

**Check yourself.** Is f(x) = x⁴ convex? Is f(x) = sin(x)? Is the sum of two convex functions convex?

---

## 4. Local Minima and Global Minima

- **Global minimum:** the lowest value anywhere.
- **Local minimum:** lower than every nearby point, but not necessarily the lowest overall.
- **Saddle point:** a minimum in some directions and a maximum in others (∇ = 0). In high dimensions, most critical points are saddles.

**Tests at a critical point (∇f = 0).**
| Hessian eigenvalues | Point |
|---|---|
| All > 0 | Local minimum |
| All < 0 | Local maximum |
| Mixed signs | Saddle point |

**Escaping bad points in practice.** Noise from SGD, momentum, random restarts, good initialisation, and over-parameterised networks (which have smoother landscapes).

**Flat vs sharp minima.** Flat minima (where the loss changes little nearby) are believed to generalise better than sharp ones. This is one explanation for why small-batch SGD often generalises well.

**Check yourself.** Find the critical points of f(x) = x³ − 3x and classify them. (x = 1 is a local min; x = −1 is a local max.)

---

## 5. Understanding Optimisation Landscapes

**In plain English.** Picture the loss as a mountainous terrain over the parameter space. Training is a hiker in fog who can only feel the slope under their feet and must reach the lowest valley.

**Landscape features and their effect.**
| Feature | What the optimiser experiences | Remedy |
|---|---|---|
| Elongated valley (ill-conditioned) | Zig-zags across the valley, slow progress along it | Feature scaling, momentum, Adam, batch norm |
| Plateau | Tiny gradients, progress stalls | Momentum, adaptive learning rates, better initialisation |
| Saddle point | Gradient ≈ 0 but not a minimum | SGD noise, momentum |
| Cliff / exploding region | Huge step throws the parameters away | Gradient clipping, a lower learning rate |
| Noisy surface (mini-batch) | The direction jitters | Larger batches, momentum, learning-rate decay |

**Visualising.** Plot the loss along the line between two parameter vectors, or on a 2-D slice, or use contour plots of toy 2-D functions (Rosenbrock, Himmelblau) to test optimisers.

**Check yourself.** The Rosenbrock function f(x, y) = (1 − x)² + 100(y − x²)² has a curved, narrow valley. Predict how plain gradient descent will behave on it.

---

## 6. Introduction to Gradient Descent

**Algorithm.**
```
initialise θ
repeat until converged:
    g = ∇L(θ)            # compute the gradient
    θ = θ − α · g        # step downhill
```
α is the **learning rate** (step size).

**Why it works.** By the first-order Taylor approximation, L(θ − αg) ≈ L(θ) − α‖g‖². For small enough α, the loss decreases.

```python
import numpy as np

def gradient_descent(grad, theta0, lr=0.1, steps=100, tol=1e-8):
    theta = np.asarray(theta0, dtype=float)
    history = [theta.copy()]
    for _ in range(steps):
        g = grad(theta)
        theta = theta - lr * g
        history.append(theta.copy())
        if np.linalg.norm(g) < tol:
            break
    return theta, np.array(history)

# Minimise f(x, y) = x² + 3y², gradient = [2x, 6y]
theta, hist = gradient_descent(lambda t: np.array([2*t[0], 6*t[1]]), [4.0, 2.0], lr=0.1)
print(theta)   # very close to [0, 0]
```

**Stopping criteria:** a maximum number of iterations, a gradient norm below a tolerance, a loss change below a tolerance, or **early stopping** on the validation loss (the most common in ML).

**Check yourself.** For f(x) = x² starting at x = 5 with α = 0.1, compute the first three steps. (5 → 4 → 3.2 → 2.56: each step multiplies x by 0.8.)

---

## 7. Learning Rate and Its Importance

**The single most important hyperparameter.**

| Learning rate | Behaviour |
|---|---|
| Too small | Converges very slowly; may get stuck on plateaus |
| Just right | Steady decrease that settles near the minimum |
| Too large | Oscillates around the minimum |
| Far too large | **Diverges**: the loss explodes to `inf` or `NaN` |

**The quadratic case makes it exact.** For f(x) = (a/2)x², the update is x ← (1 − αa)x. It converges only if |1 − αa| < 1, i.e. **0 < α < 2/a**. In many dimensions, a is the *largest* Hessian eigenvalue, so the steepest direction limits the learning rate while the flattest direction determines the speed. That is the conditioning problem again.

**Practical tips.**
- Search on a log scale: 1e-1, 3e-2, 1e-2, 3e-3, 1e-3, …
- **LR range test:** increase the LR exponentially during one short run and pick a value a bit below where the loss starts rising fastest.
- Typical starting points: Adam around 1e-3 (3e-4 for transformers); SGD with momentum around 0.1 (for vision with batch norm).
- If the loss becomes NaN, lower the LR first.

**Check yourself.** With f(x) = 5x², what is the largest learning rate that still converges? (a = 10, so α < 0.2.)

---

## 8. Batch Gradient Descent

**Definition.** Compute the gradient using **all n training examples** for every update:
θ ← θ − α · (1/n) Σᵢ ∇ℓᵢ(θ)

| Pros | Cons |
|---|---|
| Exact gradient, smooth convergence | One update needs a full pass over the data, which is slow for large n |
| Deterministic and easy to analyse | The whole dataset must be processed (memory) |
| Guaranteed convergence on convex problems (suitable α) | No noise to help escape saddles |

**Example: linear regression with batch GD.**
```python
def fit_linreg_gd(X, y, lr=0.1, epochs=500):
    Xb = np.c_[np.ones(len(X)), X]          # bias column
    w = np.zeros(Xb.shape[1])
    for _ in range(epochs):
        grad = 2 / len(y) * Xb.T @ (Xb @ w - y)
        w -= lr * grad
    return w
```

**Check yourself.** With 10 million examples, how many examples does batch GD process for each parameter update?

---

## 9. Stochastic Gradient Descent

**Definition.** Update using **one randomly chosen example** at a time:
θ ← θ − α · ∇ℓᵢ(θ), with i drawn at random. Shuffle the data each epoch.

**Why it works.** The single-example gradient is an **unbiased estimate** of the full gradient (its expectation equals the true gradient). It is noisy, but cheap, so you make many more updates per second.

| Pros | Cons |
|---|---|
| Very cheap updates; starts making progress immediately | Noisy, zig-zagging path |
| Noise helps escape saddles and sharp minima | Doesn't settle exactly; needs LR decay |
| Supports online learning (streaming data) | Poor hardware utilisation (no parallelism) |

**Convergence.** With a constant LR, SGD bounces around the minimum within a "noise ball". Decaying the LR (for example α_t ∝ 1/t) makes it converge.

**Note.** In deep learning frameworks, "SGD" usually means **mini-batch** SGD (topic 10).

**Check yourself.** Why is it important to shuffle the data each epoch when using SGD?

---

## 10. Mini-Batch Gradient Descent

**Definition.** The middle ground: estimate the gradient from a **mini-batch** of B examples (typically 32-512):
θ ← θ − α · (1/B) Σ_{i∈batch} ∇ℓᵢ(θ)

**Vocabulary.**
- **Iteration / step:** one parameter update (one batch).
- **Epoch:** one full pass through the training data = n/B steps.

**Why it is the default.**
- **Vectorised:** a batch is one matrix operation, which uses GPUs efficiently.
- The gradient noise scales like 1/√B, so you get less noise than SGD while keeping some regularising effect.
- Memory is bounded by the batch size, not the dataset size.

**Choosing B.**
| Smaller batches | Larger batches |
|---|---|
| More noise (often better generalisation) | Smoother, more stable gradients |
| Less memory | Better GPU utilisation, faster epochs |
| More updates per epoch | May need a higher LR plus warm-up |

**Linear scaling rule** (heuristic): if you multiply the batch size by k, multiply the LR by about k, with warm-up.

```python
def minibatches(X, y, batch_size, rng):
    idx = rng.permutation(len(X))
    for start in range(0, len(X), batch_size):
        b = idx[start:start + batch_size]
        yield X[b], y[b]
```

**Check yourself.** A dataset of 50,000 examples with a batch size of 128 gives how many steps per epoch? (391, with a partial last batch.)

---

## 11. Momentum-Based Optimisation

**Intuition.** A heavy ball rolling downhill builds up velocity. It keeps moving through flat regions and its oscillations across narrow valleys cancel out.

**Update (classical momentum).**
v ← β·v + ∇L(θ)
θ ← θ − α·v
β (typically 0.9) controls how much past gradients persist. The effective step in a consistent direction becomes about α/(1 − β), i.e. 10× for β = 0.9.

**Nesterov accelerated gradient (NAG).** Compute the gradient at the "look-ahead" position θ − αβv. It corrects course earlier and often converges a little faster.

```python
v = np.zeros_like(theta)
for _ in range(steps):
    g = grad(theta)
    v = beta * v + g
    theta -= lr * v
```

**Effect.** It damps zig-zagging in ravines (opposite-sign gradients cancel), accelerates along consistent directions, and helps get past small bumps and saddles.

In PyTorch: `torch.optim.SGD(params, lr=0.1, momentum=0.9, nesterov=True)`.

**Check yourself.** Explain in terms of a moving average why momentum reduces oscillation across a narrow valley.

---

## 12. AdaGrad and RMSProp

**The problem they solve.** One global learning rate doesn't suit every parameter. Some see large, frequent gradients; others (for example rare-word embeddings) see small, rare ones.

**AdaGrad.** Accumulate the sum of squared gradients per parameter and divide by its square root:
G ← G + g²
θ ← θ − α·g / (√G + ε)
- Parameters with large past gradients get smaller steps, and rare features get relatively larger steps. This is great for sparse data (NLP, recommendations).
- **Flaw:** G only ever grows, so the effective LR shrinks towards zero and learning stops too early in long training runs.

**RMSProp** (Hinton). Use an **exponential moving average** instead of a sum, so old gradients are forgotten:
s ← ρ·s + (1 − ρ)·g²   (ρ ≈ 0.9 or 0.99)
θ ← θ − α·g / (√s + ε)
- The effective LR adapts but doesn't decay to zero. It works well for RNNs and non-stationary objectives.

**Check yourself.** Why does dividing by √s make steps larger for parameters with consistently small gradients?

---

## 13. Adam Optimiser

**Adam = Momentum + RMSProp + bias correction.** It is the default optimiser for most deep learning.

```
m ← β₁·m + (1 − β₁)·g          # 1st moment (mean of gradients), like momentum
v ← β₂·v + (1 − β₂)·g²         # 2nd moment (uncentred variance), like RMSProp
m̂ = m / (1 − β₁ᵗ)              # bias correction (m and v start at 0)
v̂ = v / (1 − β₂ᵗ)
θ ← θ − α · m̂ / (√v̂ + ε)
```
Defaults: α = 1e-3, β₁ = 0.9, β₂ = 0.999, ε = 1e-8.

**Why bias correction?** m and v are initialised to 0, so they are biased towards 0 in the first few steps. Dividing by (1 − βᵗ) fixes this.

**AdamW.** Plain Adam implements L2 regularisation by adding λθ to the gradient, which then gets rescaled by √v̂ and weakened. **AdamW decouples weight decay**, θ ← θ − α·λ·θ, applied directly. AdamW is the standard for transformers and most modern training.

```python
import torch
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
```

**Adam vs SGD with momentum.** Adam converges quickly and needs little tuning. Well-tuned SGD with momentum sometimes generalises slightly better on vision tasks. Try Adam/AdamW first.

**Check yourself.** In step 1 with β₁ = 0.9, m = 0.1·g. What does bias correction turn m̂ into? (m̂ = 0.1g / 0.1 = g.)

---

## 14. Learning Rate Scheduling

**Why.** A high LR early on makes fast progress and explores. A low LR later settles into a minimum precisely.

| Schedule | Shape | Notes |
|---|---|---|
| Step decay | Drop by ×0.1 every k epochs | Classic for ResNets |
| Exponential decay | α_t = α₀·γᵗ | Smooth |
| **Cosine annealing** | Follows half a cosine from α₀ down to ≈0 | Very popular; few hyperparameters |
| **Linear warm-up** | Ramp from ≈0 to α₀ over the first steps | Essential for transformers and large batches; stabilises Adam's early estimates |
| Warm-up + cosine / linear decay | Ramp up, then decay | The standard LLM recipe |
| One-cycle | Up then down within one run | Fast convergence (fast.ai) |
| ReduceLROnPlateau | Lower the LR when the validation loss stalls | Adaptive, needs no schedule design |

```python
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=num_epochs)
for epoch in range(num_epochs):
    train_one_epoch(...)
    sched.step()
```

**Check yourself.** Why does training a transformer with Adam at full LR from step 0 (no warm-up) sometimes diverge?

---

## 15. Vanishing and Exploding Gradients

**The cause.** Backpropagation multiplies many local derivatives (the chain rule through L layers):
∂L/∂θ₁ ∝ Π_{l} (W_l · σ′(z_l))
- If the factors are typically **< 1**, the product shrinks exponentially, so the gradients **vanish** and early layers stop learning.
- If the factors are typically **> 1**, it grows exponentially, so the gradients **explode**, producing NaNs and wild updates.

**Classic culprits.** Sigmoid and tanh activations (σ′ ≤ 0.25, and ≈ 0 when saturated), poor weight initialisation, very deep networks, and RNNs over long sequences (the same W multiplied at every time step).

**Remedies.**
| Problem | Fix |
|---|---|
| Vanishing | ReLU-family activations; **He/Xavier initialisation**; **residual (skip) connections**; batch or layer normalisation; LSTM/GRU gating for sequences |
| Exploding | **Gradient clipping**; lower LR; proper initialisation; normalisation |

```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)   # before optimizer.step()
```

**Diagnose** by logging the gradient norms per layer. If early layers' norms are ≈ 0, gradients are vanishing; if they spike, gradients are exploding.

**Check yourself.** A 10-layer network uses sigmoid everywhere. Give a rough upper bound on how much the gradient shrinks from the output to the first layer from the activations alone. (0.25¹⁰ ≈ 10⁻⁶.)

---

## 16. Practical Optimisation Using Python

**Comparing optimisers from scratch on a 2-D function.**
```python
import numpy as np

def f(t):    x, y = t; return x**2 + 10*y**2           # ill-conditioned bowl
def grad(t): x, y = t; return np.array([2*x, 20*y])

def run(update, steps=100, start=(-8.0, 3.0)):
    t, state, path = np.array(start), {}, []
    for i in range(1, steps + 1):
        t = update(t, grad(t), state, i); path.append(f(t))
    return path

def sgd(t, g, s, i, lr=0.09):      return t - lr * g

def momentum(t, g, s, i, lr=0.02, b=0.9):
    s["v"] = b * s.get("v", 0) + g
    return t - lr * s["v"]

def adam(t, g, s, i, lr=0.3, b1=0.9, b2=0.999, eps=1e-8):
    s["m"] = b1 * s.get("m", 0) + (1 - b1) * g
    s["v"] = b2 * s.get("v", 0) + (1 - b2) * g**2
    mh, vh = s["m"] / (1 - b1**i), s["v"] / (1 - b2**i)
    return t - lr * mh / (np.sqrt(vh) + eps)

for name, u in [("GD", sgd), ("Momentum", momentum), ("Adam", adam)]:
    print(name, f"final loss = {run(u)[-1]:.2e}")
```
Plot each path over a contour plot to *see* the differences: zig-zagging GD, overshooting momentum, and Adam's per-coordinate scaling.

**Using library optimisers.**
```python
from scipy.optimize import minimize
res = minimize(lambda t: (1-t[0])**2 + 100*(t[1]-t[0]**2)**2, x0=[-1.2, 1.0], method="L-BFGS-B")
res.x   # ≈ [1, 1]
```

**Practical debugging checklist when training doesn't converge.**
1. Can you **overfit a single small batch**? If not, there is a bug (wrong loss, wrong labels, frozen parameters).
2. Is the loss NaN? Lower the LR, clip gradients, check for log(0) and division by zero.
3. Are the features scaled?
4. Plot training and validation loss every epoch.
5. Check the gradient norms per layer.
6. Try a known-good optimiser setup (AdamW, lr = 1e-3 or 3e-4) before anything exotic.

---

## Practical Project: Implement Gradient Descent from Scratch

**Brief.** Implement and compare optimisers on mathematical functions and on a real regression problem.

1. **Implement** batch GD, SGD, mini-batch GD, Momentum, RMSProp and Adam as functions with the same signature, *without* ML libraries (NumPy only).
2. **Test functions:** (a) the convex bowl x² + 10y²; (b) the Rosenbrock function; (c) a function with several local minima, such as f(x) = x⁴ − 3x² + x.
3. **Visualise:** contour plots with each optimiser's path, and loss-versus-iteration curves on a log scale.
4. **Learning-rate study:** for GD on the bowl, find empirically the LR at which training diverges and compare it with the theoretical bound 2/λ_max (= 0.1 for this function).
5. **Real data:** fit linear regression on `sklearn.datasets.fetch_california_housing` using your mini-batch GD and Adam. Compare the coefficients and MSE with `LinearRegression`. Show the effect of *not* standardising the features.
6. **Verify** your gradients with finite differences (Module 05).
7. **Write-up:** which optimiser was fastest, which was most robust to the LR choice, and why, in terms of conditioning and momentum.
