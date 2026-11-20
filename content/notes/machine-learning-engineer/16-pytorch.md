# Module 16: Deep Learning with PyTorch

**Phase 5 · Neural Networks** · Goal: build, train, debug and save neural networks with PyTorch, the primary framework for research and industry. TensorFlow/Keras is an optional extension.

---

## 1. Introduction to Deep Learning Frameworks

**What frameworks give you.**
1. **Tensors** on CPU, GPU or other accelerators.
2. **Automatic differentiation** (no hand-written backprop).
3. **Building blocks:** layers, losses, optimisers, data loaders.
4. **Performance:** fused GPU kernels, mixed precision, compilation, multi-GPU training.
5. **An ecosystem:** pretrained models, deployment tools.

| Framework | Style | Strengths |
|---|---|---|
| **PyTorch** | Pythonic, dynamic graphs (eager) | Dominant in research and LLMs; easy to debug; Hugging Face is PyTorch-first |
| TensorFlow / Keras | High-level Keras API; graph compilation | Mature production and mobile tooling (TF Lite); Keras 3 is multi-backend |
| JAX | Functional, composable transforms (grad, jit, vmap) | High performance on TPUs; research labs |

**Why PyTorch here.** It is the most common framework in papers and modern LLM work, its code reads like ordinary Python, and errors appear at the line that caused them.

**Check yourself.** What does "dynamic computational graph" mean, and why does it make debugging easier?

---

## 2. Introduction to PyTorch

```bash
pip install torch torchvision   # use the exact command from pytorch.org for your CUDA version
```

```python
import torch
print(torch.__version__)
print(torch.cuda.is_available())            # NVIDIA GPU?
print(torch.backends.mps.is_available())    # Apple Silicon GPU?
device = ("cuda" if torch.cuda.is_available()
          else "mps" if torch.backends.mps.is_available() else "cpu")
```

**Main modules.**
| Module | Purpose |
|---|---|
| `torch` | Tensors and maths |
| `torch.nn` | Layers, losses, `nn.Module` |
| `torch.nn.functional` (F) | Stateless functions (activations, losses) |
| `torch.optim` | Optimisers and LR schedulers |
| `torch.utils.data` | `Dataset`, `DataLoader` |
| `torchvision` / `torchaudio` / `torchtext` | Domain datasets, models and transforms |

**Typical workflow.** Data → Dataset/DataLoader → model (`nn.Module`) → loss + optimiser → training loop → evaluate → save.

**Check yourself.** Write the line that selects the best available device on your machine.

---

## 3. Tensors and Tensor Operations

**A tensor is PyTorch's n-dimensional array.** It is like a NumPy array, plus GPU support and autograd.

```python
x = torch.tensor([[1., 2.], [3., 4.]])
torch.zeros(2, 3); torch.ones(2, 3); torch.rand(2, 3); torch.randn(2, 3)
torch.arange(0, 10, 2); torch.linspace(0, 1, 5); torch.eye(3)
torch.zeros_like(x)

# Maths (mirrors NumPy)
x + 1; x * x; x @ x; x.T; x.sum(); x.mean(dim=0); x.max(dim=1)
torch.exp(x); torch.relu(x); torch.softmax(x, dim=1)

# NumPy interop: shares memory on CPU
import numpy as np
t = torch.from_numpy(np.array([1, 2, 3]))
a = t.numpy()
x_gpu = x.to(device); x_back = x_gpu.cpu()

# In-place operations end with _
x.add_(1); x.zero_()
```

**dtypes.** `float32` is the default for training. `float16`/`bfloat16` are used for mixed precision. Class labels are `int64` (`torch.long`). Mixing dtypes raises errors: use `.float()` or `.long()`.

**Check yourself.** What is the difference between `x * y` and `x @ y` for two 3×3 tensors?

---

## 4. Tensor Shapes and Dimensions

```python
x = torch.randn(32, 3, 224, 224)       # (batch, channels, height, width): NCHW
x.shape, x.ndim, x.numel()
x.view(32, -1)                         # reshape (needs contiguous memory)
x.reshape(32, -1)                      # reshape (copies if necessary)
x.flatten(start_dim=1)                 # (32, 150528)
x.permute(0, 2, 3, 1)                  # NCHW → NHWC
x.unsqueeze(0); x.squeeze()            # add or remove size-1 dimensions
torch.cat([a, b], dim=0); torch.stack([a, b], dim=0)
```

**Conventions to memorise.**
| Data | Shape |
|---|---|
| Tabular batch | (B, features) |
| Images | (B, C, H, W) |
| Sequences (batch_first) | (B, T, features) |
| Token IDs | (B, T) |
| Classification logits | (B, num_classes) |
| Class targets for `CrossEntropyLoss` | (B,), dtype long |

**Broadcasting** follows NumPy's rules (Module 02).

**Most deep learning bugs are shape bugs.** Print shapes generously, and add assertions such as `assert x.shape == (B, C, H, W)`.

**Check yourself.** You have logits of shape (64, 10) and targets of shape (64, 1). What will `CrossEntropyLoss` complain about, and how do you fix it? (Targets must be shape (64,): use `targets.squeeze(1).long()`.)

---

## 5. Autograd and Automatic Differentiation

**How it works.** Operations on tensors with `requires_grad=True` are recorded in a dynamic graph. Calling `.backward()` computes the gradients by reverse-mode autodiff and **accumulates** them into each leaf tensor's `.grad`.

```python
w = torch.tensor(2.0, requires_grad=True)
b = torch.tensor(1.0, requires_grad=True)
x, y = torch.tensor(3.0), torch.tensor(5.0)

loss = (w * x + b - y) ** 2       # forward: (6 + 1 - 5)² = 4
loss.backward()                   # backward
print(w.grad, b.grad)             # tensor(12.) tensor(4.)  → 2e·x, 2e
```

**Key behaviours.**
- **Gradients accumulate.** Call `optimizer.zero_grad()` (or `w.grad = None`) before each backward pass.
- `with torch.no_grad():` or `@torch.inference_mode()` turns off graph building during evaluation. This is faster and saves memory.
- `tensor.detach()` returns a tensor cut off from the graph (for logging, or to stop gradients flowing).
- `loss.item()` gives a Python number. Use it for logging so you don't keep graphs alive.
- `backward()` frees the graph by default. Use `retain_graph=True` only if you really need a second backward pass.

**Check yourself.** Why does forgetting `optimizer.zero_grad()` make training behave as if the learning rate keeps growing?

---

## 6. Building Neural Networks with nn.Module

```python
import torch.nn as nn

class MLP(nn.Module):
    def __init__(self, in_features: int, hidden: int, n_classes: int, p_drop: float = 0.2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_features, hidden),
            nn.ReLU(),
            nn.Dropout(p_drop),
            nn.Linear(hidden, hidden // 2),
            nn.ReLU(),
            nn.Linear(hidden // 2, n_classes),       # raw logits, no softmax
        )

    def forward(self, x):
        return self.net(x)

model = MLP(20, 128, 3).to(device)
print(model)
print(sum(p.numel() for p in model.parameters() if p.requires_grad), "trainable params")
```

**What `nn.Module` gives you.**
- Automatic registration of sub-modules and `nn.Parameter`s, so `model.parameters()` finds them all.
- `.to(device)`, `.train()` / `.eval()` mode switching, and `state_dict()` for saving.
- Composability: modules can contain modules.

**Common layers.** `nn.Linear`, `nn.Conv2d`, `nn.LSTM`, `nn.Embedding`, `nn.BatchNorm1d/2d`, `nn.LayerNorm`, `nn.Dropout`, `nn.MultiheadAttention`, `nn.TransformerEncoderLayer`.

**Pitfall.** Storing layers in a plain Python list hides them from `parameters()`. Use `nn.ModuleList` or `nn.ModuleDict`.

**Check yourself.** Why does the model output raw logits instead of applying softmax in `forward`?

---

## 7. Understanding the Forward Method

- `forward(self, x)` defines the computation. **Call the model as `model(x)`, not `model.forward(x)`.** `__call__` runs hooks and other machinery around `forward`.
- You can use **any Python control flow** in `forward` (if statements, loops), because the graph is built dynamically.
- Return whatever the training loop needs: logits, or a tuple (logits, embeddings).

```python
class ResidualBlock(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.fc1, self.fc2 = nn.Linear(dim, dim), nn.Linear(dim, dim)
        self.norm = nn.LayerNorm(dim)

    def forward(self, x):
        h = torch.relu(self.fc1(self.norm(x)))
        return x + self.fc2(h)            # skip connection: gradient highway
```

**Check yourself.** What would break if you called `model.forward(x)` while using forward hooks for feature extraction?

---

## 8. Loss Functions in PyTorch

| Task | Loss | Input | Target |
|---|---|---|---|
| Regression | `nn.MSELoss()`, `nn.L1Loss()`, `nn.HuberLoss()` | (B,) or (B, k) floats | Same shape, floats |
| Binary / multi-label | `nn.BCEWithLogitsLoss(pos_weight=…)` | Logits (B,) or (B, K) | Floats 0/1, same shape |
| Multiclass | `nn.CrossEntropyLoss(weight=…, label_smoothing=…)` | Logits (B, K) | Class indices (B,) long |
| Sequences (per token) | `CrossEntropyLoss(ignore_index=pad_id)` | (B·T, V) | (B·T,) |

```python
criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
loss = criterion(logits, targets)          # logits: (B, K), targets: (B,)
```

**Pitfalls.**
- Applying `softmax` or `sigmoid` before `CrossEntropyLoss` / `BCEWithLogitsLoss` applies the function twice, which gives wrong, poorly scaled gradients.
- Using `BCELoss` on raw logits.
- Float targets for `CrossEntropyLoss` are interpreted as *class probabilities*, not indices.

**Check yourself.** For a 5% positive rate, what `pos_weight` would roughly balance `BCEWithLogitsLoss`? (About 95/5 = 19.)

---

## 9. Optimisers in PyTorch

```python
import torch.optim as optim
optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.01)
# or optim.SGD(model.parameters(), lr=0.1, momentum=0.9, nesterov=True, weight_decay=5e-4)

# Parameter groups: different settings for different parts of the model
optimizer = optim.AdamW([
    {"params": model.backbone.parameters(), "lr": 1e-5},
    {"params": model.head.parameters(),     "lr": 1e-3},
], weight_decay=0.01)
```

**The three-step update**, every iteration:
```python
optimizer.zero_grad(set_to_none=True)
loss.backward()
optimizer.step()
```

**Good practice.** Don't apply weight decay to biases and normalisation parameters (use separate parameter groups). AdamW is the safe default. SGD with momentum is still common in vision.

**Check yourself.** Why would you give a pretrained backbone a lower learning rate than a newly initialised head?

---

## 10. Training Loops

```python
def train_one_epoch(model, loader, criterion, optimizer, device, scheduler=None, clip=1.0):
    model.train()
    total_loss, correct, n = 0.0, 0, 0
    for X, y in loader:
        X, y = X.to(device, non_blocking=True), y.to(device, non_blocking=True)
        logits = model(X)
        loss = criterion(logits, y)

        optimizer.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), clip)
        optimizer.step()
        if scheduler is not None:
            scheduler.step()          # for per-step schedulers (OneCycle, warm-up)

        total_loss += loss.item() * len(y)
        correct += (logits.argmax(1) == y).sum().item()
        n += len(y)
    return total_loss / n, correct / n


@torch.inference_mode()
def evaluate(model, loader, criterion, device):
    model.eval()
    total_loss, correct, n = 0.0, 0, 0
    for X, y in loader:
        X, y = X.to(device), y.to(device)
        logits = model(X)
        total_loss += criterion(logits, y).item() * len(y)
        correct += (logits.argmax(1) == y).sum().item()
        n += len(y)
    return total_loss / n, correct / n
```

**The outer loop with early stopping.**
```python
best_val, patience, bad_epochs = float("inf"), 5, 0
for epoch in range(1, 101):
    tr_loss, tr_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
    va_loss, va_acc = evaluate(model, val_loader, criterion, device)
    print(f"{epoch:03d} train {tr_loss:.4f}/{tr_acc:.3f}  val {va_loss:.4f}/{va_acc:.3f}")
    if va_loss < best_val - 1e-4:
        best_val, bad_epochs = va_loss, 0
        torch.save(model.state_dict(), "best.pt")
    else:
        bad_epochs += 1
        if bad_epochs >= patience:
            break
```

**Higher-level options.** PyTorch Lightning, Hugging Face `Trainer` and Accelerate remove this boilerplate. Learn the raw loop first.

**Check yourself.** What two things go wrong if you forget `model.eval()` during validation?

---

## 11. Backpropagation Using PyTorch

`loss.backward()` runs reverse-mode autodiff through every operation recorded since the tensors were created. Each parameter's `.grad` then holds ∂loss/∂param.

**Inspecting gradients (a debugging superpower).**
```python
loss.backward()
for name, p in model.named_parameters():
    if p.grad is not None:
        print(f"{name:30s} grad-norm {p.grad.norm():.2e}  weight-norm {p.data.norm():.2e}")
```
- Norms ≈ 0 in early layers: **vanishing gradients**.
- Huge norms or NaN: **exploding gradients**, so lower the LR or clip.
- `grad is None`: the parameter is not connected to the loss (a bug), or it is frozen.

**Verifying against manual backprop (Module 15).**
```python
torch.autograd.gradcheck(lambda x: (x ** 3).sum(), torch.randn(3, dtype=torch.double, requires_grad=True))
```

**Freezing parameters:** `p.requires_grad_(False)`. Used in transfer learning (Module 17).

**Check yourself.** After `loss.backward()`, a layer's `weight.grad` is `None`. List two possible causes.

---

## 12. Dataset and DataLoader

**Dataset:** how to get **one** sample. **DataLoader:** batching, shuffling and parallel loading.

```python
from torch.utils.data import Dataset, DataLoader, random_split

class TabularDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.as_tensor(X, dtype=torch.float32)
        self.y = torch.as_tensor(y, dtype=torch.long)
    def __len__(self):
        return len(self.y)
    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

ds = TabularDataset(X_np, y_np)
train_ds, val_ds = random_split(ds, [0.8, 0.2], generator=torch.Generator().manual_seed(42))
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True,
                          num_workers=4, pin_memory=True, drop_last=True)
val_loader = DataLoader(val_ds, batch_size=256, shuffle=False, num_workers=4)
```

**Image datasets with transforms.**
```python
from torchvision import datasets, transforms
train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224), transforms.RandomHorizontalFlip(),
    transforms.ToTensor(), transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])
train_ds = datasets.ImageFolder("data/train", transform=train_tf)   # one folder per class
```

**Tips.**
- `shuffle=True` for training only.
- `num_workers > 0` loads data in parallel. If the GPU sits idle, data loading is the bottleneck.
- A custom `collate_fn` handles variable-length sequences (padding).
- Use `WeightedRandomSampler` for imbalanced classes.
- Augment the **training** data only. Validation and test use deterministic transforms.

**Check yourself.** Why should data augmentation be applied in `__getitem__` (on the fly) rather than once in advance?

---

## 13. GPU Acceleration with CUDA

**Why GPUs.** Thousands of cores run matrix multiplications in parallel, often making training 10-100× faster than on a CPU.

**Rules.**
1. Move the **model and every batch** to the same device: `model.to(device)` and `X.to(device)`.
2. Keep data on the GPU during the loop. Avoid `.item()` or `.cpu()` inside hot loops, because they force synchronisation.
3. `pin_memory=True` together with `non_blocking=True` speeds up host-to-device copies.

**Mixed precision (AMP).** Computing in float16/bfloat16 roughly halves memory use and speeds up tensor-core GPUs:
```python
scaler = torch.amp.GradScaler("cuda")       # needed for float16, not bfloat16
for X, y in loader:
    X, y = X.to(device), y.to(device)
    optimizer.zero_grad(set_to_none=True)
    with torch.autocast(device_type="cuda", dtype=torch.float16):
        loss = criterion(model(X), y)
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

**Other tools.** `torch.compile(model)` fuses kernels for speed. **DDP** (`DistributedDataParallel`) trains on several GPUs. FSDP and DeepSpeed handle models too large for one GPU.

**Out of memory?** Reduce the batch size, use AMP, use **gradient accumulation** (several small batches per optimiser step), use gradient checkpointing, or use a smaller model.

**Monitor** with `nvidia-smi` and `torch.cuda.max_memory_allocated()`.

**Check yourself.** You get "Expected all tensors to be on the same device". What happened, and how do you fix it?

---

## 14. Saving and Loading Model Checkpoints

**Recommended: save the `state_dict`** (the parameters), not the whole pickled model.

```python
# Saving a full training checkpoint
torch.save({
    "epoch": epoch,
    "model_state": model.state_dict(),
    "optimizer_state": optimizer.state_dict(),
    "scheduler_state": scheduler.state_dict(),
    "best_val_loss": best_val,
    "config": {"in_features": 20, "hidden": 128, "n_classes": 3},
}, "checkpoints/epoch_012.pt")

# Resuming
ckpt = torch.load("checkpoints/epoch_012.pt", map_location=device, weights_only=False)
model = MLP(**ckpt["config"]).to(device)
model.load_state_dict(ckpt["model_state"])
optimizer.load_state_dict(ckpt["optimizer_state"])
start_epoch = ckpt["epoch"] + 1

# Inference-only weights
torch.save(model.state_dict(), "model_weights.pt")
model.load_state_dict(torch.load("model_weights.pt", map_location="cpu", weights_only=True))
```

**Why the state_dict and not the whole model?** Pickling the whole model ties the file to your exact class definitions and file paths. It breaks after refactoring and is a **security risk**: unpickling untrusted files can run arbitrary code. That is why `weights_only=True` is the default in recent PyTorch.

**Export formats for deployment.** **ONNX** (`torch.onnx.export`) for cross-framework runtimes, TorchScript or `torch.export` for Python-free serving, and **safetensors** (safe, fast weight files; the Hugging Face standard).

**Check yourself.** What must you save, besides the model weights, to resume training exactly where you left off?

---

## 15. Model Evaluation and Inference

```python
@torch.inference_mode()
def predict_proba(model, loader, device):
    model.eval()
    probs = []
    for X, _ in loader:
        probs.append(torch.softmax(model(X.to(device)), dim=1).cpu())
    return torch.cat(probs).numpy()

proba = predict_proba(model, test_loader, device)
y_pred = proba.argmax(1)
from sklearn.metrics import classification_report
print(classification_report(y_test, y_pred, digits=3))
```

**Checklist.**
- `model.eval()`: dropout off, and batch norm uses its running statistics.
- `torch.inference_mode()`: no graph is built, so it is faster and lighter.
- **Apply exactly the same preprocessing** (normalisation, tokenisation) as in training.
- Batch your inference for throughput. Measure latency at batch size 1 if serving in real time.
- Evaluate with the metrics from Module 13, not just accuracy, and check calibration.

**Check yourself.** Predictions differ every time you run inference on the same input. What did you probably forget?

---

## 16. Preventing Overfitting in Neural Networks

**Signs.** The training loss keeps falling while the validation loss starts rising, and the gap widens.

**Toolbox.**
| Technique | Notes |
|---|---|
| **More data / data augmentation** | Most effective. Images: flips, crops, colour jitter, MixUp/CutMix. Text: back-translation, token masking |
| **Weight decay** | AdamW `weight_decay=0.01-0.1` |
| **Dropout** | Topic 17 |
| **Early stopping** | Keep the best validation checkpoint |
| **Smaller model** | Fewer layers or units |
| **Batch normalisation** | Mild regularising effect |
| **Label smoothing** | Reduces overconfidence |
| **Transfer learning** | Start from pretrained weights, so far less data is needed |
| **Ensembles / SWA** | Average several models or checkpoints |

**Debugging order.** First make sure the model **can** overfit a tiny subset (this proves the pipeline works). Then add regularisation until the validation loss stops diverging.

**Check yourself.** Why is "overfit one batch first" a useful sanity check rather than a mistake?

---

## 17. Dropout and Batch Normalisation

**Dropout (Srivastava et al., 2014).**
- During **training**, each activation is zeroed with probability p, and the survivors are scaled by 1/(1 − p) ("inverted dropout"), so the expected value is unchanged.
- During **evaluation**, dropout does nothing.
- **Why it works.** Neurons can't rely on specific partners (it prevents co-adaptation). It is like training an ensemble of many thinned networks that share weights.
- Typical p: 0.1-0.5. It is usually applied after the activations in fully connected layers.

**Batch normalisation (Ioffe & Szegedy, 2015).**
For each feature over the batch:
x̂ = (x − μ_batch)/√(σ²_batch + ε),  y = γx̂ + β  (γ and β are learned)
- **Training** uses the batch statistics and updates running averages. **Evaluation** uses the running averages, which is one reason `model.eval()` is essential.
- **Benefits:** it allows higher learning rates, speeds up convergence, reduces sensitivity to initialisation, and regularises mildly.
- **Caveats:** it behaves badly with very small batches. **Layer normalisation** (which normalises across the features of each sample) is used in transformers and RNNs instead.

```python
nn.Sequential(nn.Linear(256, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.3))
```

**Check yourself.** Why does batch norm behave differently in train and eval mode, and what bug appears if you forget to switch?

---

## 18. Weight Initialisation

**Why it matters.** If the weights are too small, the activations and gradients shrink layer by layer (vanishing). If they are too large, they blow up (exploding). If they are all equal, every neuron learns the same thing (symmetry).

**The goal.** Keep the **variance of the activations and gradients roughly constant** across layers.

| Scheme | Variance of W | Use with |
|---|---|---|
| **Xavier/Glorot** | 2/(n_in + n_out) | tanh, sigmoid |
| **He/Kaiming** | 2/n_in | **ReLU** family |
| LeCun | 1/n_in | SELU |
| Orthogonal | Orthogonal matrix | RNNs |

```python
def init_weights(m):
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")
        nn.init.zeros_(m.bias)
model.apply(init_weights)
```

PyTorch's default `nn.Linear` initialisation is Kaiming-uniform-based and reasonable. Custom initialisation matters most in very deep or unusual architectures. Transformers often use small normal initialisation (std ≈ 0.02) with scaled residual branches.

**Check yourself.** Why does He initialisation use 2/n_in rather than 1/n_in? (ReLU zeroes about half the activations, which halves the variance.)

---

## 19. Learning Rate Scheduling

```python
from torch.optim.lr_scheduler import OneCycleLR, CosineAnnealingLR, ReduceLROnPlateau, LambdaLR

# Per-step: warm-up followed by cosine decay (the transformer standard)
import math
total_steps, warmup = epochs * len(train_loader), 500
def lr_lambda(step):
    if step < warmup:
        return step / warmup
    progress = (step - warmup) / max(1, total_steps - warmup)
    return 0.5 * (1 + math.cos(math.pi * progress))
scheduler = LambdaLR(optimizer, lr_lambda)       # call scheduler.step() after each optimizer.step()

# Per-step OneCycle
scheduler = OneCycleLR(optimizer, max_lr=1e-3, total_steps=total_steps)

# Per-epoch, driven by the validation loss
scheduler = ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=3)
scheduler.step(val_loss)
```

**Rules.** Know whether your scheduler steps **per batch** or **per epoch**. Log the LR every epoch. Save the scheduler state in checkpoints.

**Check yourself.** Why do warm-up schedules help Adam-based training of large models?

---

## 20. Building an End-to-End Neural Network

**Project: classify Fashion-MNIST clothing images with an MLP, end to end.**

```python
import torch, torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms

torch.manual_seed(42)
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"

# 1. Data
tf = transforms.Compose([transforms.ToTensor(), transforms.Normalize((0.2860,), (0.3530,))])
full = datasets.FashionMNIST("data", train=True, download=True, transform=tf)
test_ds = datasets.FashionMNIST("data", train=False, download=True, transform=tf)
train_ds, val_ds = random_split(full, [54_000, 6_000], generator=torch.Generator().manual_seed(42))
train_loader = DataLoader(train_ds, batch_size=128, shuffle=True, num_workers=2)
val_loader = DataLoader(val_ds, batch_size=512, num_workers=2)
test_loader = DataLoader(test_ds, batch_size=512, num_workers=2)

# 2. Model
model = nn.Sequential(
    nn.Flatten(),
    nn.Linear(28 * 28, 512), nn.BatchNorm1d(512), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(512, 256), nn.BatchNorm1d(256), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(256, 10),
).to(device)

# 3. Loss, optimiser, scheduler
criterion = nn.CrossEntropyLoss(label_smoothing=0.05)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
epochs = 20
scheduler = torch.optim.lr_scheduler.OneCycleLR(optimizer, max_lr=3e-3,
                                                total_steps=epochs * len(train_loader))

# 4. Train with early stopping (train_one_epoch / evaluate from topic 10)
best = float("inf")
for epoch in range(1, epochs + 1):
    tr = train_one_epoch(model, train_loader, criterion, optimizer, device, scheduler)
    va = evaluate(model, val_loader, criterion, device)
    print(f"epoch {epoch:02d}  train loss {tr[0]:.3f} acc {tr[1]:.3f}  val loss {va[0]:.3f} acc {va[1]:.3f}")
    if va[0] < best:
        best = va[0]; torch.save(model.state_dict(), "fashion_mlp_best.pt")

# 5. Final test evaluation, done once
model.load_state_dict(torch.load("fashion_mlp_best.pt", map_location=device, weights_only=True))
print("test:", evaluate(model, test_loader, criterion, device))     # ≈ 0.89-0.90 accuracy
```

**Extensions.**
1. Plot the learning curves and a confusion matrix. Which classes get confused? (Shirt vs T-shirt vs pullover.)
2. Replace the MLP with a small CNN (Module 17). Expect about 92-93%.
3. Track runs in MLflow or Weights & Biases (Module 19).
4. Export to ONNX and serve with FastAPI (Module 18).

**Optional: the same model in Keras (TensorFlow).**
```python
import keras
model = keras.Sequential([keras.layers.Flatten(input_shape=(28, 28)),
                          keras.layers.Dense(512, activation="relu"), keras.layers.Dropout(0.3),
                          keras.layers.Dense(10)])
model.compile(optimizer="adam", loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
              metrics=["accuracy"])
model.fit(x_train, y_train, validation_split=0.1, epochs=20, batch_size=128,
          callbacks=[keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True)])
```
