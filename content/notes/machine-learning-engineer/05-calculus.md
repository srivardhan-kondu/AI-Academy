# Module 05: Calculus for Machine Learning

**Phase 2 · Mathematical Foundations** · Goal: understand how models *learn*, by following the slope of the loss downhill.

---

## 1. Introduction to Calculus

**In plain English.** Calculus is the mathematics of **change**. It has two halves:
- **Differential calculus:** how fast is something changing right now? (slopes, derivatives)
- **Integral calculus:** how much has accumulated? (areas, totals)

**Why ML needs it.** Training a model means adjusting millions of parameters to reduce a loss. The derivative tells you, for each parameter, **which direction reduces the loss and how sensitive the loss is to it**. Every optimiser in Module 07 and every backpropagation step in Module 15 is calculus.

**Check yourself.** In one sentence, what question does a derivative answer about a loss function?

---

## 2. Understanding Functions and Graphs

**In plain English.** A function maps inputs to outputs: f(x) = x². Its graph is the set of points (x, f(x)).

**Functions you will meet constantly.**
| Function | Formula | Where in ML |
|---|---|---|
| Linear | f(x) = wx + b | Linear models |
| Quadratic | f(x) = x² | Squared-error loss |
| Exponential | f(x) = eˣ | Softmax, growth |
| Logarithm | f(x) = ln x | Log-loss, log-likelihood |
| Sigmoid | σ(x) = 1/(1 + e⁻ˣ) | Logistic regression, gates |
| ReLU | max(0, x) | Neural network activations |

**Reading graphs.** Look at where the function increases or decreases, where it is flat (candidate minima and maxima), its curvature (bowl-shaped vs dome-shaped) and its asymptotes (sigmoid flattens towards 0 and 1).

**A model is a function, and the loss is a function of the parameters.** The **loss landscape** L(**w**) is the graph we want to find the lowest point of.

```python
import numpy as np, matplotlib.pyplot as plt
x = np.linspace(-6, 6, 400)
plt.plot(x, 1/(1+np.exp(-x)), label="sigmoid"); plt.plot(x, np.maximum(0, x), label="ReLU")
plt.legend(); plt.grid(alpha=.3)
```

**Check yourself.** Sketch ln(x). Why does the log-loss −ln(p) blow up as the predicted probability p → 0?

---

## 3. Limits and Continuity

**Limit.** lim_{x→a} f(x) = L means f(x) gets arbitrarily close to L as x approaches a. Example: lim_{x→0} sin(x)/x = 1, even though the expression is undefined at 0.

**Continuity.** f is continuous at a if the limit exists and equals f(a), so there are no jumps or holes. Informally, you can draw it without lifting the pen.

**Why it matters.**
- The derivative is *defined* as a limit (topic 4).
- **Differentiability** (a smooth graph with no corners) is stronger than continuity. ReLU is continuous but has a corner at 0, so it is not differentiable there. Frameworks simply use a **subgradient** (0 or 1) at that point, which works fine in practice.
- Step functions (the original perceptron) have zero derivative almost everywhere, which is why gradient-based learning needed smooth activations like the sigmoid.

**Check yourself.** Is f(x) = |x| continuous at 0? Is it differentiable there?

---

## 4. Derivatives and Their Meaning

**Definition.**
f′(x) = lim_{h→0} [f(x + h) − f(x)] / h

This is the slope of the tangent line, or the **instantaneous rate of change**.

**Interpretations.**
- f′(x) > 0: f increases as x increases. To reduce f, **decrease** x.
- f′(x) < 0: f decreases as x increases. To reduce f, **increase** x.
- f′(x) = 0: a flat point (a minimum, maximum or saddle).
- |f′(x)| is large: f is very sensitive to x here.

**Second derivative f″(x).** This is the curvature. f″ > 0 means the graph is shaped like a bowl (a minimum at a flat point). f″ < 0 means it is a dome (a maximum).

**Numerical check (finite differences):** the standard way to verify gradient code.
```python
def numerical_derivative(f, x, h=1e-5):
    return (f(x + h) - f(x - h)) / (2 * h)       # central difference: more accurate

f = lambda x: x**3
numerical_derivative(f, 2.0)   # ≈ 12.0  (exact: 3·2² = 12)
```

**Check yourself.** The loss L(w) has L′(w) = −4 at the current w. Should you increase or decrease w, and roughly how much does L change if w increases by 0.01?

---

## 5. Understanding Slopes and Rates of Change

**Average vs instantaneous.**
- **Average rate** over [a, b]: [f(b) − f(a)] / (b − a), the slope of the secant line.
- **Instantaneous rate:** the derivative, the slope of the tangent line.

**Linear approximation (first-order Taylor).** Near a point, every smooth function looks like a straight line:
f(x + Δx) ≈ f(x) + f′(x)·Δx

This single idea is **why gradient descent works**. If you step Δx = −α·f′(x), then f changes by about −α·f′(x)², which is negative, so f goes down (as long as α is small enough for the approximation to hold).

**Second-order Taylor** adds curvature: f(x + Δx) ≈ f(x) + f′Δx + ½f″Δx². Newton's method uses this to jump straight towards a minimum.

**Check yourself.** Use linear approximation to estimate √(4.1). (f(x) = √x, f′(4) = 1/4, so the answer is ≈ 2 + 0.1/4 = 2.025.)

---

## 6. Power Rule, Product Rule and Chain Rule

**Core rules.**
| Rule | Formula | Example |
|---|---|---|
| Constant | (c)′ = 0 | (5)′ = 0 |
| Power | (xⁿ)′ = n·xⁿ⁻¹ | (x³)′ = 3x² |
| Constant multiple | (c·f)′ = c·f′ | (4x²)′ = 8x |
| Sum | (f + g)′ = f′ + g′ | |
| Product | (fg)′ = f′g + fg′ | (x·eˣ)′ = eˣ + xeˣ |
| Quotient | (f/g)′ = (f′g − fg′)/g² | |
| Exponential | (eˣ)′ = eˣ | |
| Logarithm | (ln x)′ = 1/x | |

**The chain rule: the most important rule in ML.**
If y = f(g(x)), then dy/dx = f′(g(x)) · g′(x).
In Leibniz notation, with u = g(x): **dy/dx = dy/du · du/dx**. You multiply the local derivatives along the chain.

Example: y = (3x + 1)² gives dy/dx = 2(3x + 1) · 3.

**Sigmoid derivative (worth memorising).**
σ(x) = 1/(1 + e⁻ˣ)  ⇒  **σ′(x) = σ(x)(1 − σ(x))**
Its maximum is 0.25, at x = 0. This is why stacking many sigmoids makes gradients vanish (Module 07, topic 15).

**Backpropagation *is* the chain rule** applied systematically through a computational graph (Module 15): loss → output → hidden layers → weights.

**Check yourself.** Differentiate L(w) = (wx − y)² with respect to w. (Answer: 2(wx − y)·x.)

---

## 7. Partial Derivatives

**In plain English.** When a function has several inputs, a **partial derivative** measures the change with respect to *one* input while all the others are held fixed.

f(x, y) = x²y + 3y
∂f/∂x = 2xy    (treat y as a constant)
∂f/∂y = x² + 3  (treat x as a constant)

**ML example: MSE for a linear model with one feature.**
L(w, b) = (1/n) Σ (w·xᵢ + b − yᵢ)²
∂L/∂w = (2/n) Σ (w·xᵢ + b − yᵢ)·xᵢ
∂L/∂b = (2/n) Σ (w·xᵢ + b − yᵢ)

Each partial derivative says how the loss changes if you nudge **only that parameter**.

**Check yourself.** For f(x, y) = e^{xy}, compute ∂f/∂x and ∂f/∂y.

---

## 8. Multivariable Functions

**In plain English.** Real models have many inputs and parameters: f: ℝⁿ → ℝ. A neural network loss is a function of millions of weights.

**Visualising f(x, y).**
- **Surface plot:** height z = f(x, y), like a landscape.
- **Contour plot:** a top-down map in which each line joins points of equal height (like a hiking map). Lines that are close together mean steep ground.

```python
x, y = np.meshgrid(np.linspace(-3, 3, 200), np.linspace(-3, 3, 200))
z = x**2 + 3*y**2                       # an elongated bowl
plt.contour(x, y, z, levels=20); plt.gca().set_aspect("equal")
```

**Vector-valued functions** f: ℝⁿ → ℝᵐ (such as a network layer) have a **Jacobian** matrix J of all the partial derivatives: Jᵢⱼ = ∂fᵢ/∂xⱼ. Backpropagation multiplies Jacobians (vector-Jacobian products), again via the chain rule.

**The Hessian** H is the matrix of second partial derivatives (Hᵢⱼ = ∂²f/∂xᵢ∂xⱼ). It describes the curvature in every direction.

**Check yourself.** Why do the contours of x² + 3y² form ellipses rather than circles, and which direction is steeper?

---

## 9. Gradients and Gradient Vectors

**Definition.** The gradient collects all the partial derivatives into one vector:
∇f = [∂f/∂x₁, ∂f/∂x₂, …, ∂f/∂xₙ]

**Two key facts.**
1. ∇f points in the direction of **steepest ascent**.
2. **−∇f** points in the direction of **steepest descent**, which is where gradient descent goes.
3. ‖∇f‖ is how steep it is. At a minimum, ∇f = **0**.

It is also always **perpendicular to the contour lines**.

**Vectorised gradient of MSE** (linear regression, ŷ = X**w**):
L(**w**) = (1/n)‖X**w** − **y**‖²  ⇒  **∇L = (2/n) Xᵀ(X**w** − **y**)**

```python
def mse_grad(X, y, w):
    return 2 / len(y) * X.T @ (X @ w - y)

# Gradient check against finite differences
def num_grad(f, w, h=1e-6):
    g = np.zeros_like(w)
    for i in range(len(w)):
        e = np.zeros_like(w); e[i] = h
        g[i] = (f(w + e) - f(w - e)) / (2 * h)
    return g
```

**Check yourself.** For f(x, y) = x² + 3y² at the point (1, 1), compute ∇f and the direction of steepest descent. (∇f = [2, 6]; descend along [−2, −6].)

---

## 10. Directional Derivatives

**Definition.** The rate of change of f in the direction of a **unit** vector **u**:
D_**u** f = ∇f · **u** = ‖∇f‖ cos θ

**Consequences.**
- It is largest when **u** points along ∇f (θ = 0). This proves the gradient is the direction of steepest ascent.
- It is zero when **u** ⟂ ∇f, i.e. moving along a contour line.
- It is most negative along −∇f.

**ML relevance.** Any direction with ∇f · **u** < 0 is a **descent direction**. Stochastic gradients, momentum and Adam all use directions that are not exactly −∇f but still (on average) go downhill.

**Check yourself.** With ∇f = [3, 4] and **u** = [1, 0], what is D_**u** f? What is the maximum possible directional derivative at this point? (3; 5.)

---

## 11. Understanding Gradient Landscapes

**Features of a landscape.**
| Feature | Gradient | Hessian | Effect on training |
|---|---|---|---|
| Global minimum | 0 | PSD | The goal |
| Local minimum | 0 | PSD | Can trap optimisers (less of a problem in big networks than once feared) |
| **Saddle point** | 0 | Mixed-sign eigenvalues | Common in high dimensions; slows training |
| Plateau | ≈ 0 | ≈ 0 | Very slow progress |
| Narrow valley / ravine | Large across, small along | High condition number | Zig-zagging; momentum helps |
| Cliff | Huge | n/a | Exploding steps; gradient clipping helps |

**Conditioning.** If the curvature is very different in different directions (an elongated bowl), one learning rate can't suit all directions. That is why **feature scaling** (Module 03) speeds up gradient descent, and why adaptive optimisers (RMSProp, Adam) scale each parameter separately.

**Check yourself.** Why does standardising features turn a long, narrow loss valley into a rounder bowl?

---

## 12. Introduction to Integrals

**In plain English.** The integral ∫ₐᵇ f(x) dx is the **accumulated total**, i.e. the signed area under the curve between a and b. Integration is the reverse of differentiation (the **Fundamental Theorem of Calculus**): if F′ = f, then ∫ₐᵇ f dx = F(b) − F(a).

**Example.** ∫₀² x² dx = [x³/3]₀² = 8/3.

**Where ML uses integrals.**
- **Probability:** for a continuous random variable, P(a ≤ X ≤ b) = ∫ₐᵇ p(x) dx, and every density integrates to 1.
- **Expected values:** E[X] = ∫ x·p(x) dx. Expected loss is the true quantity we want to minimise. Training loss is a sample average that **approximates** that integral.
- **AUC (Module 13):** literally the area under the ROC curve.
- **Bayesian inference:** posteriors require normalising integrals, which are often intractable. That is why we use sampling (MCMC) or variational methods.
- **Monte Carlo estimation:** approximate ∫ f(x)p(x)dx ≈ (1/N) Σ f(xᵢ), where xᵢ ~ p.

```python
rng = np.random.default_rng(0)
x = rng.uniform(0, 2, 1_000_000)
2 * np.mean(x**2)                  # ≈ 2.667 = 8/3  (Monte Carlo integral)
```

**Check yourself.** Why is the average training loss over a dataset an *estimate* of an integral?

---

## 13. Applications of Calculus in Machine Learning

| Where | Calculus |
|---|---|
| Gradient descent and all optimisers | Gradients, directional derivatives, Taylor approximation |
| Backpropagation | The chain rule on computational graphs; Jacobians |
| Loss design | Choosing differentiable losses (MSE, cross-entropy) |
| Activation choice | Derivatives of sigmoid, tanh and ReLU control gradient flow |
| Regularisation | The L2 penalty's gradient is 2λ**w** ("weight decay"); L1 uses subgradients |
| Second-order methods | Hessians, Newton's method, L-BFGS |
| Probability and Bayesian ML | Integrals, densities, expectations |
| Evaluation | AUC as an integral |
| Automatic differentiation | PyTorch autograd computes exact derivatives through code (Module 16) |

**Worked example: logistic regression gradient.**
ŷ = σ(**w**·**x**), L = −[y log ŷ + (1 − y) log(1 − ŷ)]
By the chain rule, using σ′ = σ(1 − σ), the terms cancel neatly:
**∂L/∂w = (ŷ − y)·x**
This is the same form as linear regression: the error times the input.

**Check yourself.** Derive ∂L/∂w for logistic regression yourself, showing the chain-rule steps dL/dŷ · dŷ/dz · dz/dw.

**Recommended resources.** 3Blue1Brown, *Essence of Calculus*; *Mathematics for Machine Learning*, chapter 5 (Vector Calculus).
