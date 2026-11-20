# Module 15: Neural Network Foundations

**Phase 5 · Neural Networks** · Goal: understand neural networks from a single neuron to backpropagation, well enough to build and train one from scratch.

---

## 1. Introduction to Deep Learning

**In plain English.** Deep learning uses **neural networks with many layers** to learn directly from raw data. Each layer learns a slightly more abstract representation. In images: edges → textures → parts → objects.

**Why it took off (around 2012).**
1. **Data:** the internet produced huge labelled and unlabelled datasets (ImageNet, web text).
2. **Compute:** GPUs made massive parallel matrix multiplication cheap.
3. **Algorithms:** ReLU, better initialisation, dropout, batch normalisation, Adam, residual connections and attention.
4. **Software:** frameworks with automatic differentiation (PyTorch, TensorFlow).

**Landmarks.** AlexNet (2012, ImageNet), ResNet (2015, 150+ layers), the Transformer (2017), BERT and GPT (2018+), diffusion models (2020+), and today's large multimodal foundation models.

**Where it excels.** Unstructured data: images, audio, text and video. Also very large datasets and transfer learning. On small tabular datasets, gradient boosting often still wins.

**Check yourself.** Name the three ingredients that made deep learning practical after 2010.

---

## 2. Machine Learning vs Deep Learning

| | Classical ML | Deep learning |
|---|---|---|
| Features | **Hand-engineered** | **Learned** from raw data (representation learning) |
| Data needed | Works with hundreds to thousands of rows | Usually large (or transfer learning) |
| Compute | CPU, minutes | GPUs/TPUs, hours to weeks |
| Best data type | Tabular | Images, text, audio, video |
| Interpretability | Often higher | Lower (needs explainability tools) |
| Performance scaling with data | Plateaus | Keeps improving with more data and compute (scaling laws) |
| Typical models | Linear, trees, boosting, SVM | MLPs, CNNs, RNNs, Transformers |

Deep learning is a **subset** of ML. The same principles apply: generalisation, bias-variance, leakage and evaluation.

**Check yourself.** You have 3,000 rows of customer data with 25 columns. Classical ML or deep learning? Why?

---

## 3. Understanding Artificial Neurons

**A neuron does three things.**
1. Takes inputs x₁…xₙ.
2. Computes a **weighted sum plus a bias**: z = Σwᵢxᵢ + b = **w**·**x** + b.
3. Applies an **activation function**: a = φ(z).

```
x₁ ──w₁──┐
x₂ ──w₂──┼──► Σ + b ──► φ(z) ──► output a
x₃ ──w₃──┘
```

**Interpretation.** The weights say how important each input is (and whether it pushes the output up or down). The bias shifts the threshold. The activation decides how strongly the neuron "fires".

**Logistic regression is a single neuron** with a sigmoid activation. A neural network stacks many neurons into layers.

```python
import numpy as np
x = np.array([0.5, -1.0, 2.0]); w = np.array([0.8, 0.2, -0.5]); b = 0.1
z = w @ x + b                    # 0.4 - 0.2 - 1.0 + 0.1 = -0.7
a = 1 / (1 + np.exp(-z))         # sigmoid(-0.7) ≈ 0.332
```

**Check yourself.** Choose weights and a bias so that a single neuron with a step activation computes logical AND of two binary inputs. (For example w = [1, 1], b = −1.5.)

---

## 4. Biological Neurons vs Artificial Neurons

| Biological neuron | Artificial neuron |
|---|---|
| Dendrites receive signals | Inputs xᵢ |
| Synapse strength | Weights wᵢ |
| Cell body integrates the signals | Weighted sum z |
| Fires a spike if a threshold is exceeded | Activation function φ(z) |
| Axon sends the output on | Output a goes to the next layer |
| Learning by changing synapse strengths (plasticity) | Learning by changing weights (gradient descent) |

**Where the analogy breaks down.**
- Real neurons communicate with **timed spikes**. Artificial neurons pass continuous numbers.
- The brain has about 86 billion neurons with complex, recurrent, chemically modulated wiring.
- The brain almost certainly does **not** learn by backpropagation as implemented in software.
- Artificial networks are **mathematical function approximators** inspired by biology, not models of the brain.

**Check yourself.** Give one way in which artificial networks are far simpler than biological brains, and one way they outperform them.

---

## 5. Weights, Biases and Inputs

- **Inputs (x):** features or the previous layer's activations. They must be numeric and are usually scaled.
- **Weights (W):** learnable parameters on each connection. A layer with n_in inputs and n_out neurons has a weight matrix of shape **(n_in × n_out)**.
- **Biases (b):** one learnable value per neuron (shape **n_out**). Without a bias, every neuron's decision boundary would have to pass through the origin.

**Parameter count of a dense layer:** n_in × n_out + n_out.
Example: 784 → 128 has 784·128 + 128 = **100,480** parameters.

**Initialisation matters** (Module 16, topic 18). All-zero weights make every neuron in a layer identical (**symmetry**). They all receive the same gradient and never differentiate. Weights are therefore initialised **randomly** with carefully chosen scales.

**Check yourself.** How many parameters does an MLP with layers 20 → 64 → 32 → 1 have? (20·64 + 64 + 64·32 + 32 + 32·1 + 1 = 3,457.)

---

## 6. Weighted Sum and Activation

**Layer computation for a batch** (a vectorised forward step):
**Z = XW + b**  (X: batch × n_in, W: n_in × n_out, b broadcast over the rows)
**A = φ(Z)**

**Why the activation is essential.** Without it, stacking layers collapses into one linear function:
W₂(W₁**x** + b₁) + b₂ = (W₂W₁)**x** + (W₂b₁ + b₂)
However deep the network is, it could only draw straight-line boundaries. The **non-linearity** lets each layer bend and fold the space, so networks can represent curved boundaries and complex functions.

**Universal approximation theorem.** A network with **one hidden layer** and enough neurons (and a non-linear activation) can approximate any continuous function on a bounded domain to any accuracy. In practice, **depth** is far more parameter-efficient than width for real-world functions, because it builds features hierarchically.

**Check yourself.** Prove that a 3-layer network with identity activations is equivalent to linear regression.

---

## 7. Activation Functions

| Function | Formula | Range | Derivative | Typical use |
|---|---|---|---|---|
| Sigmoid | 1/(1 + e^{−z}) | (0, 1) | σ(1 − σ), max 0.25 | Binary output; gates in LSTMs |
| Tanh | (e^z − e^{−z})/(e^z + e^{−z}) | (−1, 1) | 1 − tanh², max 1 | RNNs; zero-centred hidden layers |
| **ReLU** | max(0, z) | [0, ∞) | 0 or 1 | **Default for hidden layers** |
| Leaky ReLU | max(αz, z) | ℝ | α or 1 | Avoids dead neurons |
| ELU / SELU | Smooth negative part | ℝ | n/a | Smoother alternatives |
| **GELU** | z·Φ(z) | ≈ ℝ | Smooth | **Transformers** (BERT, GPT) |
| SiLU / Swish | z·σ(z) | ≈ ℝ | Smooth | Modern CNNs, LLMs (inside SwiGLU) |
| **Softmax** | e^{zₖ}/Σe^{zⱼ} | (0, 1), sums to 1 | n/a | **Multiclass output** |
| Identity | z | ℝ | 1 | Regression output |

**Choosing.**
- **Hidden layers:** ReLU (or GELU/SiLU in modern architectures).
- **Output layer:** depends on the task: identity (regression), sigmoid (binary or multi-label), softmax (multiclass).

**Check yourself.** Why should a house-price regression network *not* use a sigmoid on its output layer?

---

## 8. Sigmoid Activation

σ(z) = 1/(1 + e^{−z})

**Pros.** It outputs a probability-like value in (0, 1), is smooth, and has a nice derivative.

**Cons in hidden layers.**
1. **Vanishing gradients:** σ′ ≤ 0.25, and ≈ 0 when |z| is large (saturation). Through many layers the gradients shrink exponentially.
2. **Not zero-centred:** outputs are always positive, so the gradients on a neuron's weights all share the same sign, which causes zig-zag updates.
3. Computing exp is relatively expensive.

**Where it is still used.** Binary classification outputs (paired with `BCEWithLogitsLoss`), multi-label outputs, and the **gates** in LSTMs and GRUs, where a value in (0, 1) acts as an "open/close" control.

**Check yourself.** For z = 10, what are σ(z) and σ′(z) approximately? What does that mean for learning? (≈ 0.99995 and ≈ 4.5×10⁻⁵. Learning almost stops.)

---

## 9. Tanh Activation

tanh(z) = (e^z − e^{−z})/(e^z + e^{−z}) = 2σ(2z) − 1

**Pros over sigmoid.** **Zero-centred** outputs in (−1, 1), and stronger gradients (a maximum derivative of 1 at z = 0).

**Cons.** It still **saturates** for large |z|, so gradients still vanish in deep stacks.

**Uses.** RNN hidden states (vanilla RNNs, and the LSTM cell output), and situations where outputs must be bounded and symmetric (some generative models' output layers for images scaled to [−1, 1]).

**Check yourself.** Why does zero-centring help optimisation compared with the sigmoid?

---

## 10. ReLU and Leaky ReLU

**ReLU:** f(z) = max(0, z), with f′(z) = 1 if z > 0, else 0.

**Why ReLU revolutionised deep learning.**
- **No saturation for positive inputs:** the gradient is exactly 1, so deep networks train much faster.
- **Cheap:** just a threshold.
- **Sparse activations:** many neurons output 0, which gives efficient representations.

**The "dying ReLU" problem.** If a neuron's z is always negative (for example after a large update pushes its bias very negative), its gradient is always 0 and it **never recovers**.

**Fixes.**
| Variant | Formula | Notes |
|---|---|---|
| **Leaky ReLU** | max(0.01z, z) | A small slope for z < 0 keeps the gradient alive |
| PReLU | max(αz, z), with α learned | Learns the slope |
| ELU | z if z > 0, else α(e^z − 1) | Smooth, with negative outputs |
| GELU / SiLU | Smooth ReLU-like curves | The standard in transformers |

Also use proper **He initialisation** and sensible learning rates.

**Check yourself.** What fraction of a ReLU layer's neurons would you expect to be active at initialisation with zero-mean inputs and weights? (About 50%.)

---

## 11. Softmax Activation

**Definition.** It turns a vector of K scores (**logits**) into a probability distribution:
softmax(**z**)ₖ = e^{zₖ}/Σⱼ e^{zⱼ}

**Example.** z = [2.0, 1.0, 0.1] gives e^z ≈ [7.39, 2.72, 1.11] with sum 11.21, so p ≈ **[0.659, 0.242, 0.099]**.

**Properties.**
- The outputs are positive and sum to 1.
- It preserves order (the largest logit gets the largest probability).
- It is invariant to adding a constant to every logit, which gives the **numerical stability trick**: subtract max(z) before exponentiating.
- **Temperature:** softmax(z/T). T < 1 makes the distribution sharper; T > 1 makes it flatter. This is used in LLM sampling and knowledge distillation.

**Paired with cross-entropy:** L = −log pₜᵣᵤₑ. The gradient with respect to the logits is beautifully simple: **∂L/∂z = p − y** (the predicted distribution minus the one-hot target).

**In PyTorch**, `nn.CrossEntropyLoss` takes **raw logits** and applies log-softmax internally. Don't apply softmax yourself first.

**Check yourself.** Compute the softmax of [1, 1, 1]. What happens to softmax([1, 2]) at temperature T = 0.1? (Uniform 1/3 each; ≈ [0.00005, 0.99995], nearly one-hot.)

---

## 12. Perceptrons

**The perceptron (Rosenblatt, 1958).** A single neuron with a **step activation**:
ŷ = 1 if **w**·**x** + b > 0, else 0

**Perceptron learning rule.** For each misclassified example:
**w** ← **w** + η(y − ŷ)**x**,  b ← b + η(y − ŷ)

**The perceptron convergence theorem.** If the data is **linearly separable**, the algorithm finds a separating hyperplane in a finite number of steps.

**The XOR problem.** XOR (output 1 if exactly one input is 1) is **not linearly separable**: no single line separates {(0,1), (1,0)} from {(0,0), (1,1)}. Minsky and Papert's 1969 book highlighted this limitation, which contributed to the first "AI winter". The solution is **hidden layers** (multi-layer perceptrons) trained with backpropagation, which arrived in the 1980s.

```python
def perceptron(X, y, epochs=20, lr=1.0):
    w, b = np.zeros(X.shape[1]), 0.0
    for _ in range(epochs):
        for xi, yi in zip(X, y):
            pred = int(w @ xi + b > 0)
            w += lr * (yi - pred) * xi; b += lr * (yi - pred)
    return w, b

X = np.array([[0,0],[0,1],[1,0],[1,1]])
w, b = perceptron(X, np.array([0,0,0,1]))   # AND: learnable
w, b = perceptron(X, np.array([0,1,1,0]))   # XOR: never converges
```

**Check yourself.** Draw the four XOR points and explain geometrically why one line can't separate them.

---

## 13. Single-Layer Neural Networks

**Definition.** Inputs connect directly to an output layer (no hidden layers).
- With one sigmoid output, it is **logistic regression**.
- With K softmax outputs, it is **multinomial (softmax) regression**.
- With an identity output, it is **linear regression**.

**Capability.** It can only learn **linear decision boundaries** (or linear functions). It is useful as a baseline and as the final layer of deeper networks, which learn features so that the problem *becomes* linearly separable at the last layer.

**Check yourself.** A softmax regression on raw MNIST pixels reaches about 92% accuracy. Why can a network with one hidden layer reach about 98%?

---

## 14. Multi-Layer Perceptrons

**Architecture.** Input layer → one or more **hidden layers** (fully connected, with non-linear activations) → output layer.

```
input (784) → Dense 256 + ReLU → Dense 128 + ReLU → Dense 10 + softmax
```

**What the hidden layers do.** Each layer transforms the representation. In XOR, the hidden layer maps the points into a new space where they *are* linearly separable.

**Solving XOR with 2 hidden neurons (hand-set weights).**
h₁ = ReLU(x₁ + x₂), h₂ = ReLU(x₁ + x₂ − 1), output = h₁ − 2h₂
(0,0)→0, (0,1)→1, (1,0)→1, (1,1)→2 − 2 = 0 ✓

**Design choices.**
| Choice | Guidance |
|---|---|
| Depth | 2-4 hidden layers for tabular data; much deeper needs residual connections |
| Width | Powers of 2 (64-1024); funnel shapes are common |
| Activation | ReLU/GELU in hidden layers |
| Regularisation | Dropout, weight decay, early stopping |
| Inputs | **Standardise**; embed categorical features |

**Check yourself.** Verify the XOR network above for all four inputs.

---

## 15. Forward Propagation

**Definition.** Compute the output by passing the input through the layers in order, keeping the intermediate values (needed later for backpropagation).

For a 2-layer network (batch X):
```
Z¹ = X W¹ + b¹        A¹ = ReLU(Z¹)
Z² = A¹ W² + b²       Ŷ  = softmax(Z²)
L  = CrossEntropy(Ŷ, Y)
```

**Worked numeric example (1 input, 1 hidden unit, 1 output).**
x = 2, w₁ = 0.5, b₁ = 0, w₂ = −1, b₂ = 0.5, target y = 1, sigmoid output, BCE loss:
z₁ = 1.0 → a₁ = ReLU(1) = 1.0
z₂ = −1·1 + 0.5 = −0.5 → ŷ = σ(−0.5) ≈ 0.378
L = −log(0.378) ≈ 0.974

```python
def forward(X, params):
    W1, b1, W2, b2 = params
    Z1 = X @ W1 + b1; A1 = np.maximum(0, Z1)
    Z2 = A1 @ W2 + b2
    Z2 -= Z2.max(1, keepdims=True); P = np.exp(Z2); P /= P.sum(1, keepdims=True)
    return P, (X, Z1, A1)
```

**Check yourself.** For X of shape (64, 784), W¹ of shape (784, 128) and W² of shape (128, 10), give the shapes of Z¹, A¹, Z² and Ŷ.

---

## 16. Loss Functions for Neural Networks

| Task | Output activation | Loss | PyTorch |
|---|---|---|---|
| Regression | Identity | MSE / MAE / Huber | `MSELoss`, `L1Loss`, `HuberLoss` |
| Binary classification | Sigmoid (inside the loss) | Binary cross-entropy | `BCEWithLogitsLoss` |
| Multiclass (one label) | Softmax (inside the loss) | Categorical cross-entropy | `CrossEntropyLoss` |
| Multi-label | Sigmoid per class | BCE per class | `BCEWithLogitsLoss` |
| Imbalanced classification | n/a | Weighted CE, **focal loss** | `weight=`, `pos_weight=` |
| Similarity / embeddings | n/a | Contrastive, triplet, InfoNCE | `TripletMarginLoss` |
| Distribution matching | n/a | KL divergence | `KLDivLoss` |

**Label smoothing** replaces one-hot targets such as [0, 1, 0] with [0.05, 0.9, 0.05]. This reduces overconfidence and often improves generalisation (`CrossEntropyLoss(label_smoothing=0.1)`).

**Sanity check.** At initialisation, the multiclass cross-entropy should be about **ln(K)** (for example 2.30 for 10 classes). If it is much higher, the initialisation or the loss setup is wrong.

**Check yourself.** Why do PyTorch's classification losses take logits rather than probabilities?

---

## 17. Backpropagation

**In plain English.** Backpropagation computes **how much each weight contributed to the loss**, i.e. the gradient ∂L/∂w for every parameter, efficiently, in **one backward pass**. It applies the chain rule from the output back towards the input, reusing intermediate results.

**The algorithm.**
1. **Forward pass:** compute and store all the Z and A values.
2. **Output error:** δᴸ = ∂L/∂Zᴸ. For softmax with cross-entropy, **δᴸ = Ŷ − Y**.
3. **For each layer l, going backwards:**
   - ∂L/∂Wˡ = (Aˡ⁻¹)ᵀ δˡ
   - ∂L/∂bˡ = Σ over the batch of δˡ
   - Propagate: δˡ⁻¹ = (δˡ (Wˡ)ᵀ) ⊙ φ′(Zˡ⁻¹)
4. **Update** with the optimiser: W ← W − η·∂L/∂W.

**Why it is efficient.** Computing all the gradients costs only about **2-3× the forward pass**, whatever the number of parameters. Numerical differentiation would need a separate forward pass for each parameter: millions of passes.

**Worked example, continued from topic 15** (x = 2, a₁ = 1, ŷ = 0.378, y = 1):
- δ₂ = ŷ − y = −0.622
- ∂L/∂w₂ = δ₂·a₁ = −0.622; ∂L/∂b₂ = −0.622
- δ₁ = δ₂·w₂·ReLU′(z₁) = −0.622·(−1)·1 = 0.622
- ∂L/∂w₁ = δ₁·x = 1.244; ∂L/∂b₁ = 0.622
With η = 0.1: w₂ → −0.938 (less negative, so ŷ goes up) and w₁ → 0.376. Both changes reduce the loss.

**Check yourself.** In the example, why does the update make w₂ less negative? Relate it to the output being too low.

---

## 18. Understanding Computational Graphs

**Definition.** A **directed acyclic graph** in which nodes are operations (add, multiply, matmul, ReLU, log) and edges carry tensors. Any model's forward computation can be written as such a graph.

**Example:** L = (wx + b − y)²
```
w ─┐
   (×)── u ──(+)── v ──(−)── e ──(²)── L
x ─┘        b ┘       y ┘
```

**Automatic differentiation (reverse mode).**
1. The forward pass records the graph and stores the intermediate values.
2. The backward pass starts with ∂L/∂L = 1 and walks the graph in reverse. Each node multiplies the incoming gradient by its **local derivative** and passes it on.
3. When a value feeds several nodes, its gradients are **summed** (the multivariate chain rule).

| Node | Local derivative |
|---|---|
| a + b | Passes the gradient unchanged to both inputs |
| a × b | Gradient to a is ×b; to b is ×a |
| ReLU(a) | Passes the gradient if a > 0, otherwise blocks it |
| a² | ×2a |

**Frameworks.** PyTorch builds the graph **dynamically** (define-by-run) as your Python code executes, which is why ordinary `if` statements and loops just work. `loss.backward()` triggers reverse-mode autodiff (Module 16).

**Check yourself.** For L = (wx + b − y)² with w = 2, x = 3, b = 1 and y = 5, compute L and ∂L/∂w by walking the graph. (e = 2, L = 4, ∂L/∂w = 2e·x = 12.)

---

## 19. Chain Rule in Backpropagation

**Scalar chain rule.** If L depends on w through z → a → L:
**∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w**

**Through many layers.**
∂L/∂W¹ = ∂L/∂Aᴸ · ∂Aᴸ/∂Zᴸ · ∂Zᴸ/∂Aᴸ⁻¹ · … · ∂Z¹/∂W¹

This long product explains:
- **Vanishing gradients:** many factors smaller than 1, from saturating activations or small weights.
- **Exploding gradients:** many factors larger than 1.
- Why **residual connections** help: y = x + F(x) gives ∂y/∂x = I + ∂F/∂x, so the identity term gives the gradient a direct "highway" back through the network.

**Vector form.** Each step is a **vector-Jacobian product**. Frameworks never build full Jacobians; they compute these products directly, which is much cheaper.

**Derivation: softmax + cross-entropy gives ∂L/∂z = p − y.**
L = −Σyₖ log pₖ, with pₖ = e^{zₖ}/Σe^{zⱼ}.
∂pₖ/∂zᵢ = pₖ(δₖᵢ − pᵢ), so ∂L/∂zᵢ = −Σₖ yₖ(δₖᵢ − pᵢ) = −yᵢ + pᵢΣyₖ = **pᵢ − yᵢ** (since Σyₖ = 1).

**Check yourself.** Derive ∂L/∂z for sigmoid + BCE and show it is also p − y.

---

## 20. Training a Neural Network from Scratch

**A two-layer network in NumPy that classifies a non-linear dataset.**

```python
import numpy as np
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=2000, noise=0.2, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)
Y_tr = np.eye(2)[y_tr]                                   # one-hot encoding

rng = np.random.default_rng(0)
H = 32
W1 = rng.normal(0, np.sqrt(2 / 2), (2, H)); b1 = np.zeros(H)   # He initialisation
W2 = rng.normal(0, np.sqrt(2 / H), (H, 2)); b2 = np.zeros(2)

def forward(X):
    Z1 = X @ W1 + b1; A1 = np.maximum(0, Z1)
    Z2 = A1 @ W2 + b2
    Z2 = Z2 - Z2.max(1, keepdims=True); P = np.exp(Z2); P /= P.sum(1, keepdims=True)
    return Z1, A1, P

lr, epochs, batch = 0.1, 200, 64
for epoch in range(epochs):
    idx = rng.permutation(len(X_tr))
    for s in range(0, len(idx), batch):
        b = idx[s:s + batch]; xb, yb = X_tr[b], Y_tr[b]
        Z1, A1, P = forward(xb)
        # backward pass
        dZ2 = (P - yb) / len(b)                          # softmax + CE gradient
        dW2 = A1.T @ dZ2;  db2 = dZ2.sum(0)
        dA1 = dZ2 @ W2.T
        dZ1 = dA1 * (Z1 > 0)                             # ReLU derivative
        dW1 = xb.T @ dZ1;  db1 = dZ1.sum(0)
        # SGD update
        W1 -= lr * dW1; b1 -= lr * db1; W2 -= lr * dW2; b2 -= lr * db2
    if epoch % 50 == 0:
        _, _, P = forward(X_tr)
        loss = -np.mean(np.log(P[np.arange(len(y_tr)), y_tr] + 1e-12))
        print(f"epoch {epoch:3d}  loss {loss:.4f}")

_, _, P_te = forward(X_te)
print("test accuracy:", (P_te.argmax(1) == y_te).mean())   # ≈ 0.96
```

**What to try next.**
1. **Gradient check:** compare dW1 with finite differences on a tiny batch (the relative error should be about 1e-6 or smaller).
2. Remove the ReLU (identity activation) and watch the accuracy fall to roughly that of a linear model (about 0.86).
3. Vary H (2, 8, 128) and the learning rate (0.01, 1.0, 5.0), and plot the decision boundaries.
4. Add L2 weight decay and momentum.
5. Then rebuild the same network in PyTorch (Module 16) and notice how much autograd does for you.

**Recommended resources.** 3Blue1Brown, *Neural Networks* series; Andrej Karpathy, *Neural Networks: Zero to Hero* (micrograd); Michael Nielsen, *Neural Networks and Deep Learning* (free); Goodfellow et al., *Deep Learning*, chapter 6.
