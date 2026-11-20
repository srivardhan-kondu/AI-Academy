# Module 17: Advanced Neural Network Architectures

**Phase 5 · Neural Networks** · Goal: understand the architectures behind modern AI (CNNs, RNNs, attention and Transformers) and use pretrained models effectively.

---

## 1. Introduction to Convolutional Neural Networks

**In plain English.** A CNN looks at images through small sliding windows (filters) that detect local patterns, such as edges or textures, wherever they appear. Deeper layers combine these into larger patterns: eyes, wheels, faces.

**Why not an MLP on raw pixels?**
| Problem with MLPs | CNN solution |
|---|---|
| A 224×224×3 image with 1,000 hidden units needs about 150M weights in the first layer | **Local connectivity:** each unit sees only a small patch |
| A cat in the top-left and a cat in the bottom-right need separate weights | **Weight sharing:** the same filter slides over the whole image (translation equivariance) |
| Flattening ignores the 2-D structure | Convolutions preserve the spatial layout |

**Inductive biases.** Locality and translation equivariance. These assumptions match natural images, which is why CNNs learn efficiently from less data than fully connected networks.

**History.** LeNet-5 (1998, digits), **AlexNet** (2012, the deep learning breakthrough on ImageNet), VGG (2014), **ResNet** (2015, residual connections, 152 layers), EfficientNet (2019), ConvNeXt (2022). Vision Transformers (ViT, 2020) now compete with CNNs.

**Check yourself.** How many weights does a 3×3 convolution with 3 input and 64 output channels have, compared with a dense layer from a 224×224×3 image to 64 units? (3·3·3·64 + 64 = 1,792, vs about 9.6M.)

---

## 2. Understanding Images as Tensors

- **Grayscale image:** H × W, each pixel 0-255 (brightness).
- **Colour image:** H × W × 3 (RGB channels). PyTorch uses **C × H × W**.
- **Batch:** B × C × H × W.

```python
from PIL import Image
import torchvision.transforms as T
img = Image.open("cat.jpg").convert("RGB")
x = T.ToTensor()(img)           # (3, H, W), floats in [0, 1]
x = T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])(x)  # ImageNet statistics
x = x.unsqueeze(0)              # (1, 3, H, W) batch of one
```

**Preprocessing.** Resize or crop to a fixed size, scale to [0, 1], normalise per channel (with the **same statistics the pretrained model was trained with**), and augment the training images (flips, crops, colour jitter, rotation).

**Check yourself.** Why does a pretrained ImageNet model perform badly if you forget to apply its normalisation?

---

## 3. Convolution Operations

**The operation (2-D, single channel).** Slide a k×k **kernel** over the image. At each position, multiply element-wise and sum, giving one output value. The result is a **feature map**.

```
Input (4×4)          Kernel (2×2)      Output (3×3), stride 1
1 2 0 1              1 0               1·1+2·0+0·0+1·1 = 2   ...
0 1 3 1              0 1
2 1 0 2
1 0 1 3
```

(Strictly, deep learning "convolution" is **cross-correlation**: the kernel is not flipped. Because the kernel is learned, the difference doesn't matter.)

**Multi-channel.** For an input with C_in channels, each filter has shape C_in × k × k and sums over all the channels. A layer with C_out filters produces C_out feature maps.

```python
import torch.nn as nn
conv = nn.Conv2d(in_channels=3, out_channels=64, kernel_size=3, stride=1, padding=1)
y = conv(torch.randn(8, 3, 32, 32))      # → (8, 64, 32, 32)
```

**Receptive field.** The region of the input that affects one output unit. Stacking 3×3 convolutions grows it: two layers see 5×5, three see 7×7. Deep networks therefore "see" the whole image.

**Check yourself.** Compute the full 3×3 output for the example above.

---

## 4. Filters and Kernels

**What filters learn.**
- **Early layers:** edges at various orientations, colour blobs, simple textures (similar to classic hand-designed filters).
- **Middle layers:** corners, patterns, motifs.
- **Deep layers:** object parts and whole objects (faces, wheels, text).

**Classic hand-designed kernels** (for intuition):
| Kernel | Matrix | Detects |
|---|---|---|
| Vertical edge (Sobel-x) | [[−1,0,1],[−2,0,2],[−1,0,1]] | Vertical edges |
| Horizontal edge | Transpose of the above | Horizontal edges |
| Blur (box) | All values 1/9 | Smooths noise |
| Sharpen | [[0,−1,0],[−1,5,−1],[0,−1,0]] | Enhances edges |

In a CNN, **the kernel values are weights learned by backpropagation**. Nobody designs them by hand.

**1×1 convolutions** mix channels at each pixel (a per-pixel dense layer). They are used to cheaply change the number of channels (bottlenecks in ResNet and Inception).

**Check yourself.** Apply the Sobel-x kernel to a 3×3 patch that is dark on the left (0) and bright on the right (1). Is the response large or small?

---

## 5. Stride and Padding

**Output size formula:**
**O = ⌊(I − K + 2P)/S⌋ + 1**  (I = input size, K = kernel size, P = padding, S = stride)

- **Padding (P):** add zeros around the border, so edge pixels are used fully and the spatial size can be preserved. "Same" padding for K = 3 is P = 1.
- **Stride (S):** the step size. S = 2 roughly halves the height and width, so it **downsamples** (an alternative to pooling).

| I | K | P | S | O |
|---|---|---|---|---|
| 32 | 3 | 1 | 1 | 32 |
| 32 | 3 | 0 | 1 | 30 |
| 32 | 3 | 1 | 2 | 16 |
| 224 | 7 | 3 | 2 | 112 (the ResNet stem) |

**Dilation** spreads the kernel out (gaps between its taps), giving a larger receptive field without extra parameters. It is used in segmentation and audio models.

**Check yourself.** A 64×64 input goes through a 5×5 convolution with P = 2 and S = 2. What is the output size? (32×32.)

---

## 6. Pooling Layers

**Purpose.** Downsample the feature maps: fewer computations, a larger receptive field, and some tolerance to small shifts.

| Type | Operation | Notes |
|---|---|---|
| **Max pooling** | The maximum in each window (2×2, stride 2) | Keeps the strongest activation; most common |
| Average pooling | The mean in each window | Smoother |
| **Global average pooling (GAP)** | The mean over the whole H×W, giving one value per channel | Replaces large dense layers before the classifier; works with any input size |

```python
nn.MaxPool2d(kernel_size=2, stride=2)      # (B, C, 32, 32) → (B, C, 16, 16)
nn.AdaptiveAvgPool2d(1)                    # (B, C, H, W) → (B, C, 1, 1)
```

Pooling has **no learnable parameters**. Modern designs often replace max pooling with strided convolutions.

**Check yourself.** Apply 2×2 max pooling with stride 2 to [[1,3,2,4],[5,6,1,2],[7,2,9,0],[1,8,3,4]]. (Result: [[6,4],[8,9]].)

---

## 7. CNN Architecture

**The typical pattern.**
```
Input → [Conv → BatchNorm → ReLU] × n → Pool → … (repeat; channels ↑, spatial size ↓)
      → Global Average Pool → (Dropout) → Linear → logits
```
As you go deeper, the **spatial size shrinks and the channel count grows** (for example 32×32×3 → 16×16×64 → 8×8×128 → 4×4×256).

**A small CNN for CIFAR-10 (32×32 colour images).**
```python
class SmallCNN(nn.Module):
    def __init__(self, n_classes=10):
        super().__init__()
        def block(cin, cout):
            return nn.Sequential(
                nn.Conv2d(cin, cout, 3, padding=1), nn.BatchNorm2d(cout), nn.ReLU(),
                nn.Conv2d(cout, cout, 3, padding=1), nn.BatchNorm2d(cout), nn.ReLU(),
                nn.MaxPool2d(2))
        self.features = nn.Sequential(block(3, 64), block(64, 128), block(128, 256))  # 32→16→8→4
        self.head = nn.Sequential(nn.AdaptiveAvgPool2d(1), nn.Flatten(),
                                  nn.Dropout(0.3), nn.Linear(256, n_classes))
    def forward(self, x):
        return self.head(self.features(x))
```

**Landmark ideas.**
| Architecture | Key idea |
|---|---|
| VGG | Deep stacks of simple 3×3 convolutions |
| GoogLeNet / Inception | Parallel multi-scale convolutions; 1×1 bottlenecks |
| **ResNet** | **Residual connections**, y = x + F(x), which make 100+ layer networks trainable |
| MobileNet | Depthwise-separable convolutions for phones |
| EfficientNet | Scaling depth, width and resolution together |
| ConvNeXt | A CNN modernised with Transformer-era design choices |

**Check yourself.** Why does a residual connection make it easy for a block to learn the identity function, and why does that help very deep networks?

---

## 8. Image Classification Using CNNs

**Workflow.**
1. **Data:** an `ImageFolder` structure (`train/cat/*.jpg`, `train/dog/*.jpg`), a stratified train/val/test split, and checks for class imbalance and near-duplicate images across splits.
2. **Augment** the training images: `RandomResizedCrop`, `RandomHorizontalFlip`, `ColorJitter`, `TrivialAugmentWide`. Use only resize and normalise for validation and test.
3. **Model:** start from a **pretrained** backbone (topic 17). Train from scratch only if you have a lot of data or very unusual images.
4. **Train:** AdamW or SGD with momentum, cosine schedule, label smoothing, mixed precision, early stopping.
5. **Evaluate:** accuracy, top-5 accuracy, per-class F1, the confusion matrix, and **inspect the misclassified images**.
6. **Explain:** **Grad-CAM** heatmaps show which regions drove a prediction. They are useful for catching shortcuts, such as a model that detects "snow" instead of "wolf".

**Common pitfalls.** Training and production images that differ (lighting, camera, resolution), leakage through duplicate images, and shortcut features (watermarks, hospital tags on X-rays).

**Check yourself.** Your dog-vs-wolf classifier is 98% accurate, but Grad-CAM highlights the background. What is going on, and how do you fix it?

---

## 9. Introduction to Recurrent Neural Networks

**In plain English.** RNNs process sequences **one step at a time**, carrying a **hidden state** that summarises everything seen so far, like reading a sentence while keeping its meaning in mind.

**Why sequences need special handling.**
- Variable length.
- **Order matters** ("dog bites man" vs "man bites dog").
- Long-range dependencies ("The keys that I left on the table **are** …").

**Use cases (historically).** Language modelling, translation, speech recognition, time-series forecasting, and handwriting recognition. Transformers have replaced RNNs for most NLP tasks, but recurrent ideas live on in state-space models (Mamba) and remain useful for streaming and small time-series problems.

**Check yourself.** Why can't a standard MLP handle sentences of different lengths naturally?

---

## 10. Understanding Sequential Data

**Types.**
| Data | Example | Shape |
|---|---|---|
| Time series | Sensor readings, prices | (B, T, features) |
| Text | Token IDs → embeddings | (B, T) → (B, T, d) |
| Audio | Waveform or spectrogram frames | (B, T, freq_bins) |
| Event logs | User clickstreams | (B, T, event_features) |
| Video | Frames over time | (B, T, C, H, W) |

**Task patterns.**
| Pattern | Example |
|---|---|
| Many-to-one | Sentiment of a review |
| One-to-many | Image captioning |
| Many-to-many (aligned) | Part-of-speech tagging |
| Many-to-many (seq2seq) | Translation |

**Handling variable lengths.** **Pad** to the batch's maximum length, and **mask** the padding positions in losses and attention (`pack_padded_sequence` for RNNs).

**Time-series cautions.** Split chronologically, compute features without looking ahead, and normalise using training-period statistics only.

**Check yourself.** For predicting the next hour's energy load from the last 48 hours, what are T and the task pattern?

---

## 11. RNN Architecture

**Recurrence.** The same weights are applied at every time step:
**hₜ = tanh(W_xh·xₜ + W_hh·hₜ₋₁ + b)**
**yₜ = W_hy·hₜ**

```
x₁ → [RNN] → h₁ → [RNN] → h₂ → [RNN] → h₃ → output
                 ↑ (same weights at every step)
```

**Training: backpropagation through time (BPTT).** Unroll the network over T steps (it becomes a deep feed-forward network with shared weights) and backpropagate through the unrolled graph. Long sequences are often truncated (truncated BPTT).

**Variants.** **Bidirectional** RNNs (read forwards and backwards, used when the whole sequence is available), **stacked** RNNs (several layers), and **encoder-decoder** (seq2seq) models.

```python
rnn = nn.RNN(input_size=16, hidden_size=64, num_layers=2, batch_first=True)
out, h_n = rnn(torch.randn(8, 50, 16))     # out: (8, 50, 64); h_n: (2, 8, 64)
```

**Check yourself.** Why does reusing the same W_hh at every step let an RNN handle sequences of any length?

---

## 12. Vanishing Gradient Problem in RNNs

**The cause.** The gradient from step T back to step t involves the product Πₖ W_hhᵀ·diag(tanh′(·)) over T − t steps.
- If the largest singular value of W_hh multiplied by the tanh derivatives is **< 1**, the gradient **vanishes exponentially**, and the network can't learn long-range dependencies (more than about 10-20 steps).
- If it is **> 1**, the gradient **explodes**.

**Consequences.** A vanilla RNN "forgets" the beginning of long sentences. Training is unstable.

**Fixes.**
| Issue | Fix |
|---|---|
| Exploding | **Gradient clipping** (`clip_grad_norm_`) |
| Vanishing | **Gated architectures (LSTM, GRU)**; orthogonal initialisation; skip connections; ultimately **attention** |

**Check yourself.** If each backward step multiplies the gradient by 0.9, how much of it is left after 50 steps? (0.9⁵⁰ ≈ 0.005.)

---

## 13. Long Short-Term Memory (LSTM)

**Key idea (Hochreiter & Schmidhuber, 1997).** Add a separate **cell state cₜ**, a "conveyor belt" that carries information across time with only **additive** updates, controlled by learned **gates** (sigmoids in (0, 1) that act as soft switches).

**Equations.**
```
fₜ = σ(W_f·[hₜ₋₁, xₜ] + b_f)        forget gate: what to erase from memory
iₜ = σ(W_i·[hₜ₋₁, xₜ] + b_i)        input gate: what new information to write
c̃ₜ = tanh(W_c·[hₜ₋₁, xₜ] + b_c)     candidate memory
cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ c̃ₜ            cell state update (additive!)
oₜ = σ(W_o·[hₜ₋₁, xₜ] + b_o)        output gate: what to reveal
hₜ = oₜ ⊙ tanh(cₜ)                  hidden state / output
```

**Why it fixes vanishing gradients.** The gradient of cₜ with respect to cₜ₋₁ is fₜ. When the forget gate is ≈ 1, gradients flow back largely unchanged, like a residual connection through time.

```python
lstm = nn.LSTM(input_size=16, hidden_size=128, num_layers=2, batch_first=True,
               dropout=0.2, bidirectional=False)
out, (h_n, c_n) = lstm(x)          # x: (B, T, 16)
logits = head(out[:, -1, :])       # many-to-one: use the last time step
```

**Check yourself.** What happens to the memory when the forget gate outputs 0? When it outputs 1?

---

## 14. Gated Recurrent Units (GRU)

**A simplified LSTM (Cho et al., 2014).** Two gates and no separate cell state:
```
zₜ = σ(W_z·[hₜ₋₁, xₜ])                 update gate (how much to update)
rₜ = σ(W_r·[hₜ₋₁, xₜ])                 reset gate (how much past to use for the candidate)
h̃ₜ = tanh(W·[rₜ ⊙ hₜ₋₁, xₜ])
hₜ = (1 − zₜ) ⊙ hₜ₋₁ + zₜ ⊙ h̃ₜ
```

| | LSTM | GRU |
|---|---|---|
| Gates | 3 (forget, input, output) + cell state | 2 (update, reset) |
| Parameters | More | About 25% fewer |
| Speed | Slower | Faster |
| Performance | Slightly better on some long-dependency tasks | Comparable on most tasks |

**Rule of thumb.** Try a GRU first for speed. Use an LSTM if you need the extra capacity. For most NLP today, use Transformers.

**Check yourself.** In a GRU, which gate value makes the unit copy its previous hidden state unchanged? (zₜ = 0.)

---

## 15. Introduction to Attention Mechanisms

**The problem it solved.** Seq2seq RNNs squeezed a whole input sentence into **one fixed-size vector**, a bottleneck that hurt long sentences. **Attention** (Bahdanau et al., 2014) lets the decoder **look back at every input position** and focus on the most relevant ones at each step.

**Query-Key-Value formulation.**
- **Query (Q):** what am I looking for?
- **Key (K):** what does each position offer?
- **Value (V):** the content each position provides.

**Scaled dot-product attention:**
**Attention(Q, K, V) = softmax(QKᵀ/√d_k)·V**
1. Score each query against all keys (dot products).
2. Scale by √d_k so the softmax doesn't saturate when d_k is large.
3. Softmax turns the scores into weights that sum to 1.
4. The output is the weighted average of the values.

```python
import torch, math
def attention(Q, K, V, mask=None):
    scores = Q @ K.transpose(-2, -1) / math.sqrt(Q.size(-1))   # (B, Tq, Tk)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, float("-inf"))
    weights = torch.softmax(scores, dim=-1)
    return weights @ V, weights
# Built-in, fast (FlashAttention kernels where available):
# torch.nn.functional.scaled_dot_product_attention(Q, K, V, is_causal=True)
```

**Self-attention.** Q, K and V all come from the **same** sequence, so every token can gather information directly from every other token: "it" can attend to "the animal" whatever the distance between them.

**Check yourself.** Why is dividing by √d_k needed? What happens to the softmax if the dot products are very large?

---

## 16. Introduction to Transformers

**"Attention Is All You Need" (Vaswani et al., 2017).** It drops recurrence entirely and uses **self-attention** plus feed-forward layers. Every position is processed **in parallel**, and any two tokens are connected in one step.

**A Transformer block.**
```
x → LayerNorm → Multi-Head Self-Attention → + (residual)
  → LayerNorm → Feed-Forward (MLP, e.g. 4× wider, GELU) → + (residual) → output
```
(This is the "pre-norm" arrangement used in most modern models.)

**Key components.**
| Component | Purpose |
|---|---|
| Token embeddings | Map token IDs to vectors |
| **Positional encoding** | Attention is order-blind, so position must be injected (sinusoidal, learned, or **RoPE** rotary embeddings in modern LLMs) |
| **Multi-head attention** | Several attention "heads" learn different relationships (syntax, coreference, …) in parallel |
| Feed-forward network | Per-token non-linear processing (much of the parameter count) |
| Residual + LayerNorm | Stable training of very deep stacks |
| **Causal mask** | In decoders, a token can't attend to future tokens (needed for next-token prediction) |

**Three families.**
| Type | Attention | Pre-training | Examples | Good for |
|---|---|---|---|---|
| Encoder-only | Bidirectional | Masked language modelling | BERT, RoBERTa | Classification, embeddings, NER |
| Decoder-only | Causal | Next-token prediction | GPT, Llama, Claude-style LLMs | Text generation, chat, reasoning |
| Encoder-decoder | Both, plus cross-attention | Denoising / seq2seq | T5, BART, Whisper | Translation, summarisation, speech-to-text |

**Beyond text.** Vision Transformers (images as sequences of patches), audio Transformers, and multimodal models.

**Cost.** Self-attention is **O(T²)** in sequence length. Long-context work uses FlashAttention, sparse or linear attention, and KV caching at inference time.

```python
layer = nn.TransformerEncoderLayer(d_model=256, nhead=8, dim_feedforward=1024,
                                   dropout=0.1, activation="gelu", batch_first=True, norm_first=True)
encoder = nn.TransformerEncoder(layer, num_layers=4)
out = encoder(torch.randn(8, 100, 256))     # (B, T, d_model)
```

**Check yourself.** Why can Transformers be trained much faster on GPUs than RNNs on the same sequence length?

---

## 17. Transfer Learning

**In plain English.** Reuse a model pretrained on a large dataset (ImageNet, web text) as the starting point for your task. Its learned features (edges, shapes, grammar, semantics) transfer, so you need **far less data and compute**.

**Strategies.**
| Strategy | What you train | When |
|---|---|---|
| **Feature extraction** | Freeze the backbone and train only a new head | Small dataset, similar domain |
| **Fine-tuning (partial)** | Unfreeze the top layers plus the head | Medium dataset |
| **Full fine-tuning** | Everything, with a small learning rate | Larger dataset or a different domain |
| **Parameter-efficient (PEFT)** | Small adapters such as **LoRA** | Large models (LLMs), limited GPU memory |

**Image example: feature extraction.**
```python
from torchvision import models
weights = models.ResNet50_Weights.DEFAULT
model = models.resnet50(weights=weights)
for p in model.parameters():
    p.requires_grad = False                       # freeze the backbone
model.fc = nn.Linear(model.fc.in_features, n_classes)   # new trainable head
preprocess = weights.transforms()                 # the exact preprocessing used in pretraining
optimizer = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)
```

**Text example: Hugging Face.**
```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
tok = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)
```

**Check yourself.** You have 800 labelled X-ray images. Which transfer strategy would you start with, and why?

---

## 18. Fine-Tuning Pretrained Models

**A recipe that works.**
1. **Stage 1:** freeze the backbone and train the new head for a few epochs (so randomly initialised head gradients don't damage the pretrained features).
2. **Stage 2:** unfreeze some or all layers and train with a **much lower learning rate** (for example 1e-5 to 1e-4), often with **discriminative learning rates** (lower for early layers, higher for later ones).
3. Use warm-up plus cosine/linear decay, weight decay, and early stopping on validation data.

```python
for p in model.parameters():
    p.requires_grad = True
optimizer = torch.optim.AdamW([
    {"params": [p for n, p in model.named_parameters() if not n.startswith("fc")], "lr": 1e-5},
    {"params": model.fc.parameters(), "lr": 1e-4},
], weight_decay=0.01)
```

**Hugging Face Trainer (text classification).**
```python
from transformers import TrainingArguments, Trainer
args = TrainingArguments("out", learning_rate=2e-5, per_device_train_batch_size=16,
                         num_train_epochs=3, weight_decay=0.01, warmup_ratio=0.1,
                         eval_strategy="epoch", save_strategy="epoch",
                         load_best_model_at_end=True, metric_for_best_model="f1")
trainer = Trainer(model=model, args=args, train_dataset=train_tok, eval_dataset=val_tok,
                  compute_metrics=compute_metrics)
trainer.train()
```

**LoRA for large models.** Freeze the weights W and learn a low-rank update ΔW = BA (rank r ≈ 8-64). This trains well under 1% of the parameters (the `peft` library).

**Pitfalls.**
- **Catastrophic forgetting:** too high an LR destroys the pretrained knowledge.
- Mismatched preprocessing or tokenizer.
- Batch norm with tiny batches when fine-tuning CNNs: consider freezing the BN statistics.
- Overfitting small datasets: use strong augmentation and early stopping.

**Check yourself.** Why does fine-tuning use a learning rate 10-100× lower than training from scratch?

---

## 19. Introduction to Autoencoders

**Architecture.** **Encoder** → compact **latent code z** (a bottleneck) → **decoder** → reconstruction x̂. The network is trained to minimise the **reconstruction loss** ‖x − x̂‖². It is self-supervised: the target is the input itself.

```python
class AE(nn.Module):
    def __init__(self, d_in=784, d_z=32):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(d_in, 256), nn.ReLU(), nn.Linear(256, d_z))
        self.dec = nn.Sequential(nn.Linear(d_z, 256), nn.ReLU(), nn.Linear(256, d_in), nn.Sigmoid())
    def forward(self, x):
        z = self.enc(x)
        return self.dec(z), z
```

**Why a bottleneck?** It forces the network to keep only the most important structure, which gives non-linear dimensionality reduction (a linear autoencoder with MSE loss learns the same subspace as PCA).

**Variants and uses.**
| Variant | Idea | Use |
|---|---|---|
| Undercomplete AE | Small latent | Compression, feature learning |
| **Denoising AE** | Reconstruct a clean x from a corrupted input | Robust features, denoising |
| Sparse AE | Penalise active latent units | Interpretable features (also used to interpret LLMs) |
| Convolutional AE | Conv encoder, transposed-conv decoder | Images |
| **Variational AE (VAE)** | Latent is a probability distribution | **Generation** (topic 20) |

**Anomaly detection.** Train on normal data only. Anomalies reconstruct poorly, so a high reconstruction error flags them (fraud, defects, sensor faults).

**Check yourself.** Why must the latent dimension be smaller than the input (or otherwise regularised) for an autoencoder to learn anything useful?

---

## 20. Introduction to Generative Models

**Discriminative vs generative.** Discriminative models learn P(y | x), i.e. boundaries. **Generative models learn P(x)**, the data distribution itself, so they can **create new samples**: images, text, audio, molecules.

**Main families.**
| Family | Idea | Strengths | Weaknesses | Examples |
|---|---|---|---|---|
| **VAE** | Encoder outputs μ and σ; sample z = μ + σ·ε (the reparameterisation trick); loss = reconstruction + KL(q(z\|x) ‖ N(0, I)) | Stable training, smooth latent space | Blurry samples | Latent spaces for Stable Diffusion |
| **GAN** | A generator fakes samples and a discriminator tries to tell real from fake, in a min-max game | Sharp, realistic images | Unstable training, mode collapse | StyleGAN |
| **Autoregressive** | Factorise P(x) = Π P(xₜ \| x<ₜ) and generate one token at a time | Exact likelihood; scales very well | Sequential (slow) generation | **GPT-style LLMs**, PixelCNN, WaveNet |
| **Diffusion** | Learn to **reverse a gradual noising process**: start from noise and denoise step by step | State-of-the-art image, video and audio quality; stable | Many sampling steps (getting faster) | Stable Diffusion, Imagen |
| Normalising flows | Invertible transforms with exact likelihood | Exact density | Architecturally constrained | RealNVP, Glow |

**The modern landscape.** **Large language models** are autoregressive Transformers trained on next-token prediction, then aligned with instruction tuning and RLHF or related methods. **Text-to-image models** combine diffusion with text encoders (for example CLIP or T5) in a VAE latent space. **Multimodal foundation models** handle text, images, audio and video together.

**Evaluating generative models.** For images: FID (Fréchet Inception Distance) and human preference. For text: perplexity, benchmark tasks, human or LLM-judge evaluation. Always also evaluate **safety**, bias and factuality.

**Responsible use.** Deepfakes, copyright of training data, hallucinated facts, and harmful content. Watermarking, content provenance (C2PA), safety filters and human review matter (see Module 19, topic 20).

**Check yourself.** Which generative family powers chat assistants, and what does "autoregressive" mean in practice when it generates an answer?

**Recommended resources.** Stanford CS231n (CNNs) and CS224n (NLP/Transformers); Jay Alammar, *The Illustrated Transformer*; Andrej Karpathy, *Let's build GPT* (video); the Hugging Face course (free).
