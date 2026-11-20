# Module 04: Linear Algebra for Machine Learning

**Phase 2 · Mathematical Foundations** · Goal: understand *why* ML algorithms work by seeing data as vectors and models as transformations.

---

## 1. Introduction to Linear Algebra

**In plain English.** Linear algebra is the mathematics of lists of numbers (vectors), grids of numbers (matrices), and the "linear" operations that combine them. In ML, **a dataset is a matrix, a data point is a vector, and most models are matrix operations**.

**Where it shows up.**
| ML concept | Linear algebra object |
|---|---|
| One customer's features | Vector **x** ∈ ℝⁿ |
| A dataset | Matrix **X** ∈ ℝ^{m×n} (m rows, n features) |
| A linear model | **ŷ = Xw + b** |
| A neural network layer | **h = σ(XW + b)** |
| A word embedding | A vector in ℝ^{768} |
| PCA | Eigenvectors / SVD |
| Similarity search | Dot products and cosine similarity |
| An image | A tensor (height × width × channels) |

**Check yourself.** In `ŷ = Xw`, what do the rows of X, the entries of w and the entries of ŷ each represent?

---

## 2. Scalars, Vectors and Matrices

- **Scalar:** a single number, e.g. a learning rate α = 0.01.
- **Vector:** an ordered list of numbers, written **v** = [v₁, v₂, …, vₙ]. Geometrically, it is an arrow from the origin or a point in n-dimensional space.
- **Matrix:** a rectangular grid with m rows and n columns. **A**ᵢⱼ is the entry in row *i*, column *j*.
- **Tensor:** the generalisation to any number of axes (a scalar is 0-D, a vector 1-D, a matrix 2-D; an image batch is 4-D).

```python
import numpy as np
s = 3.0
v = np.array([2, -1, 4])            # shape (3,)
A = np.array([[1, 2, 3], [4, 5, 6]])  # shape (2, 3)
T = np.zeros((32, 3, 224, 224))     # a 4-D tensor
```

**Convention.** In maths, vectors are usually **column vectors** (n×1). In NumPy, a 1-D array has no row or column orientation until it is used in an operation.

**Check yourself.** What is the shape of the matrix holding 500 houses, each described by 8 features?

---

## 3. Understanding Vector Dimensions

**In plain English.** The **dimension** of a vector is how many numbers it contains, which is the number of independent directions it can point in. A house with (size, bedrooms, age) is a point in 3-D space. A sentence embedding is a point in 768-D space.

**High-dimensional intuition (and its failures).**
- We can't picture 768 dimensions, but the maths (distances, angles, projections) works exactly as in 2-D and 3-D.
- **The curse of dimensionality:** as the number of dimensions grows, data becomes sparse. The volume grows exponentially, so you need exponentially more data to "fill" the space, and distances between points become similar to each other. This is why KNN struggles in high dimensions and why dimensionality reduction (Module 11) helps.
- Random high-dimensional vectors are almost always nearly **orthogonal**, which is a useful property for embeddings and hashing.

**Check yourself.** Why does doubling the number of features not just double the amount of data you need?

---

## 4. Vector Addition and Subtraction

**Definition.** Add or subtract element-wise; both vectors must have the same dimension.
**a** + **b** = [a₁+b₁, a₂+b₂, …]

**Geometry.** Addition places arrows tip-to-tail. Subtraction **b − a** gives the arrow *from a to b*: the displacement between two points.

**ML meaning.**
- **Gradient descent update:** **w** ← **w** − α**∇L**. You move the weights by subtracting a scaled gradient vector.
- **Distance:** ‖**a** − **b**‖ is the Euclidean distance between two data points (KNN, K-means).
- **Embedding arithmetic:** vec("king") − vec("man") + vec("woman") ≈ vec("queen").
- **Centring data:** **x** − **μ** subtracts the mean vector.

**Check yourself.** Two customers are at **a** = [30, 50] and **b** = [34, 47]. Compute **b** − **a** and the Euclidean distance between them. (Answer: [4, −3], distance 5.)

---

## 5. Scalar Multiplication

**Definition.** c**v** = [c·v₁, c·v₂, …]. This stretches the vector (|c| > 1), shrinks it (|c| < 1) or flips its direction (c < 0).

**ML meaning.**
- **Learning rate:** α**∇L** scales the step size without changing its direction.
- **Normalisation:** **v** / ‖**v**‖ produces a **unit vector** that keeps the direction and has length 1. This is used in cosine similarity.
- **Weight decay** shrinks weights each step: **w** ← (1 − αλ)**w**.

**Linear combinations.** c₁**v₁** + c₂**v₂** + … combines vectors using both addition and scaling. A linear model's prediction **x**·**w** is a linear combination of the features. The **span** of a set of vectors is every linear combination they can make.

**Check yourself.** What is the length of 3**v** if ‖**v**‖ = 2? What about −3**v**?

---

## 6. Dot Product and Its Applications

**Definition.** **a**·**b** = Σᵢ aᵢbᵢ = a₁b₁ + a₂b₂ + … + aₙbₙ (the result is a scalar).

**Geometric meaning.** **a**·**b** = ‖**a**‖ ‖**b**‖ cos θ.
| Dot product | Angle | Meaning |
|---|---|---|
| Large positive | Small | Vectors point the same way (similar) |
| 0 | 90° | Orthogonal (unrelated) |
| Negative | > 90° | Opposite directions |

**Norm (length):** ‖**v**‖ = √(**v**·**v**).

**Applications in ML.**
1. **Linear model prediction:** ŷ = **w**·**x** + b, a weighted sum of the features.
2. **A neuron:** z = **w**·**x** + b, then an activation.
3. **Cosine similarity:** cos θ = (**a**·**b**) / (‖**a**‖‖**b**‖). This is the core of semantic search, recommendation and RAG.
4. **Attention in transformers:** a query-key dot product scores how relevant each token is.
5. **Projection:** the component of **a** along a unit vector **u** is (**a**·**u**)**u**. PCA projects data onto principal directions.

```python
a, b = np.array([1, 2, 3]), np.array([4, 5, 6])
a @ b                                                   # 32
cos = a @ b / (np.linalg.norm(a) * np.linalg.norm(b))   # ≈ 0.9746
```

**Check yourself.** Why do search systems often normalise embeddings to length 1 before storing them? (Hint: the dot product then *equals* the cosine similarity.)

---

## 7. Matrix Addition and Multiplication

**Addition:** element-wise, and the shapes must match.

**Multiplication** C = AB, where A is m×n and B is n×p, gives C of size m×p:
Cᵢⱼ = Σₖ Aᵢₖ Bₖⱼ, the dot product of row *i* of A with column *j* of B.

```
(2×3) @ (3×2) → (2×2)        inner dims (3 = 3) must match; outer dims give the result
```

**Properties.**
- **Not commutative:** AB ≠ BA in general, and BA may not even be defined.
- Associative: (AB)C = A(BC). The bracketing affects cost, not the result.
- Distributive: A(B + C) = AB + AC.

**Three ways to see Ax.**
1. **Row view:** each output is a dot product of a row of A with x.
2. **Column view:** Ax is a linear combination of A's columns, weighted by the entries of x.
3. **Transformation view:** A maps the vector x to a new vector (topic 12).

**Cost.** Multiplying (m×n)(n×p) takes about m·n·p multiply-adds. This is why GPUs, which are built for massively parallel matrix multiplication, dominate deep learning.

**Check yourself.** A batch X is (32×784) and W is (784×128). What is the shape of XW, and how many multiply-adds does it take?

---

## 8. Transpose of a Matrix

**Definition.** Aᵀ swaps rows and columns: (Aᵀ)ᵢⱼ = Aⱼᵢ. An m×n matrix becomes n×m.

**Properties.** (Aᵀ)ᵀ = A, (A + B)ᵀ = Aᵀ + Bᵀ, and **(AB)ᵀ = BᵀAᵀ** (the order reverses).

**Symmetric matrices** satisfy A = Aᵀ. Covariance matrices and XᵀX are always symmetric, which gives them useful properties (real eigenvalues and orthogonal eigenvectors).

**In ML.**
- The dot product as a matrix product: **a**·**b** = **a**ᵀ**b**.
- **XᵀX** (n×n) appears in the linear regression normal equation. **Xᵀ(y − ŷ)** is the gradient of the squared error.
- Backpropagation through a layer y = Wx sends gradients back through **W**ᵀ.

**Check yourself.** If X is (100×5), what are the shapes of XᵀX and XXᵀ? Which one is a feature-feature matrix?

---

## 9. Identity and Inverse Matrices

**Identity I.** 1s on the diagonal and 0s elsewhere. AI = IA = A. It is "the number 1" for matrices.

**Inverse A⁻¹.** It satisfies AA⁻¹ = A⁻¹A = I and "undoes" A. It exists only for **square, non-singular** matrices (determinant ≠ 0, full rank).

For a 2×2 matrix:
```
A = [[a, b],      A⁻¹ = 1/(ad − bc) · [[ d, −b],
     [c, d]]                           [−c,  a]]
```

**Why ML engineers rarely compute inverses.**
- It is expensive (O(n³)) and **numerically unstable** when A is close to singular (ill-conditioned).
- Use `np.linalg.solve(A, b)` or least-squares solvers instead.
- In linear regression, XᵀX becomes nearly singular when features are highly correlated (**multicollinearity**). **Ridge regression** adds λI so the matrix becomes (XᵀX + λI), which is always invertible for λ > 0.

**Pseudo-inverse A⁺** (computed via SVD) gives the best least-squares solution even for non-square or singular matrices: `np.linalg.pinv`.

**Check yourself.** Why does adding λI to XᵀX guarantee that it is invertible?

---

## 10. Determinants

**In plain English.** The determinant det(A) of a square matrix is the factor by which the transformation A **scales area (2-D) or volume (n-D)**.

- det(A) = 2: shapes double in area.
- det(A) = 0: space is squashed onto a lower dimension (a plane onto a line). Information is lost, so A is **not invertible**.
- det(A) < 0: orientation flips (a mirror image).

For a 2×2 matrix: det([[a, b], [c, d]]) = ad − bc.

**Properties.** det(AB) = det(A)·det(B), det(Aᵀ) = det(A), det(A⁻¹) = 1/det(A), and the determinant equals the product of the eigenvalues.

**In ML.** Multivariate Gaussian densities contain det(Σ) (Gaussian Mixture Models, Module 11). Normalising flows track log|det J| to transform probability densities. In practice, use `np.linalg.slogdet` for numerical stability.

**Check yourself.** The columns of a 3×3 matrix are [1,0,0], [0,1,0] and [1,1,0]. What is its determinant, and why?

---

## 11. Systems of Linear Equations

**Form.** A**x** = **b**: find **x** given the matrix A and the vector **b**.
```
2x + y = 5         [[2, 1],  [x,   [5,
 x − y = 1    →     [1,−1]]   y] =  1]     → x = 2, y = 1
```

**Possible outcomes.**
| Case | Geometry (2-D) | Solutions |
|---|---|---|
| Full-rank square A | Lines cross at one point | Exactly one |
| Singular A, consistent | Same line | Infinitely many |
| Singular A, inconsistent | Parallel lines | None |
| **Overdetermined** (more equations than unknowns) | Many lines, no common point | None exactly, so find the **best fit** |

**Rank** is the number of linearly independent rows or columns, i.e. how many "real" dimensions the data spans.

**Linear regression is an overdetermined system.** With 1,000 houses and 5 features, there is no **w** that fits every equation exactly. **Least squares** finds the **w** that minimises ‖X**w** − **y**‖², and its solution satisfies the **normal equations**: XᵀX**w** = Xᵀ**y**.

```python
w, residuals, rank, sv = np.linalg.lstsq(X, y, rcond=None)
```

**Check yourself.** A dataset has 10 rows and 50 features. How many solutions does least squares have, and how does regularisation help?

---

## 12. Linear Transformations

**In plain English.** A matrix *is* a function that moves vectors. A transformation T is **linear** if T(**a** + **b**) = T(**a**) + T(**b**) and T(c**a**) = cT(**a**). Grid lines stay straight, parallel and evenly spaced, and the origin stays fixed.

**Read a matrix by its columns.** The columns of A show where the basis vectors land: the first column is where [1,0] goes, and the second is where [0,1] goes.

| Matrix | Effect |
|---|---|
| `[[2,0],[0,2]]` | Scale everything by 2 |
| `[[2,0],[0,0.5]]` | Stretch x, squash y |
| `[[cos θ, −sin θ],[sin θ, cos θ]]` | Rotate by θ |
| `[[1,1],[0,1]]` | Shear |
| `[[1,0],[0,0]]` | Project onto the x-axis (det = 0) |

**Composition.** Applying B and then A is the single matrix AB. Order matters.

**Why neural networks need non-linearities.** Stacking linear layers W₃W₂W₁**x** is still just one linear transformation. Without activation functions (ReLU and others), a deep network is no more powerful than linear regression (Module 15).

**Affine maps.** A**x** + **b** (linear plus a shift) is what a neural network layer computes before its activation.

**Check yourself.** Show that two stacked layers without an activation, W₂(W₁**x**), equal a single layer. What is its weight matrix?

---

## 13. Eigenvalues and Eigenvectors

**In plain English.** Most vectors change direction when a matrix acts on them. **Eigenvectors** are the special directions that only get **stretched or shrunk**. The stretch factor is the **eigenvalue**.

A**v** = λ**v**   (**v** ≠ 0)

**Finding them.** Solve det(A − λI) = 0 for λ, then (A − λI)**v** = 0 for **v**.

Example: A = [[2, 1], [1, 2]] gives λ₁ = 3 with **v**₁ = [1, 1] and λ₂ = 1 with **v**₂ = [1, −1].

```python
vals, vecs = np.linalg.eigh(np.array([[2., 1.], [1., 2.]]))   # eigh for symmetric
# vals = [1., 3.]; vecs columns ∝ [1,-1] and [1,1]
```

**Key facts.**
- Symmetric matrices (such as covariance matrices) have **real eigenvalues** and **orthogonal eigenvectors**.
- Trace = sum of the eigenvalues; determinant = product of the eigenvalues.
- **Positive (semi-)definite** means all λ > 0 (≥ 0). Covariance matrices are PSD, and a convex quadratic loss has a PSD Hessian.

**In ML.**
- **PCA:** the eigenvectors of the covariance matrix are the principal directions, and the eigenvalues are the variance along each one.
- **Optimisation:** the eigenvalues of the Hessian describe the curvature. A large ratio between the biggest and smallest (a large **condition number**) creates elongated valleys where gradient descent zig-zags (Module 07).
- **PageRank, spectral clustering and the stability of RNNs** (repeatedly multiplying by W makes gradients explode or vanish depending on whether |λ| > 1 or |λ| < 1).

**Check yourself.** Verify that [1, 1] is an eigenvector of [[2,1],[1,2]] by computing A**v**.

---

## 14. Matrix Decomposition

**In plain English.** Decomposition factors a matrix into simpler pieces, much as 12 = 2 × 2 × 3. This makes computation cheaper, more stable and easier to interpret.

| Decomposition | Form | Requirements | Used for |
|---|---|---|---|
| **LU** | A = LU (lower × upper triangular) | Square | Solving A**x** = **b** efficiently |
| **QR** | A = QR (orthogonal × upper triangular) | Any | Stable least squares |
| **Cholesky** | A = LLᵀ | Symmetric positive definite | Fast solves, sampling from Gaussians, Gaussian processes |
| **Eigendecomposition** | A = QΛQᵀ | Symmetric (for this form) | PCA, analysing dynamics |
| **SVD** | A = UΣVᵀ | **Any** matrix | PCA, low-rank approximation, pseudo-inverse |

**Why it matters.** Libraries call these internally. `LinearRegression` uses least-squares routines based on SVD/QR, and `np.linalg.solve` uses LU. Knowing them explains warnings like "ill-conditioned matrix".

**Check yourself.** Why is Cholesky well suited to covariance matrices but not to arbitrary matrices?

---

## 15. Singular Value Decomposition (SVD)

**Definition.** Every m×n matrix can be written as **A = UΣVᵀ**, where:
- **V** (n×n): orthonormal "input" directions (right singular vectors)
- **Σ** (m×n): diagonal, with **singular values** σ₁ ≥ σ₂ ≥ … ≥ 0 (the importance of each direction)
- **U** (m×m): orthonormal "output" directions (left singular vectors)

**Geometric meaning.** Any linear map is a **rotation (Vᵀ) → scaling along axes (Σ) → rotation (U)**.

**Low-rank approximation (Eckart-Young).** Keeping the top k singular values gives the *best* rank-k approximation of A:
```python
U, S, Vt = np.linalg.svd(A, full_matrices=False)
k = 20
A_k = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
```

**Applications.**
- **PCA:** SVD of the centred data matrix X gives the principal components (the rows of Vᵀ). Variance explained = σᵢ² / Σσ².
- **Image compression:** keep k singular values.
- **Recommender systems:** factorise the user × item ratings matrix into latent factors.
- **Latent semantic analysis:** SVD of a term-document matrix.
- **LoRA** (parameter-efficient fine-tuning of LLMs) learns low-rank weight updates ΔW = BA, based on the same idea that the important changes live in few dimensions.
- **Pseudo-inverse and least squares:** A⁺ = VΣ⁺Uᵀ.

**Relation to eigendecomposition.** The singular values of A are the square roots of the eigenvalues of AᵀA, and V contains the eigenvectors of AᵀA.

**Check yourself.** A 1000×1000 grayscale image is approximated with k = 50. How many numbers do you store, compared with 1,000,000? (Answer: 50 × (1000 + 1000 + 1) = 100,050.)

---

## 16. Applications of Linear Algebra in Machine Learning

| Application | Linear algebra at work |
|---|---|
| Linear regression | Least squares, normal equations XᵀX**w** = Xᵀ**y**, QR/SVD solvers |
| Logistic regression and neurons | Dot products **w**·**x** + b |
| Neural networks | Matrix multiplications XW, gradients via transposes, tensors on GPUs |
| PCA and dimensionality reduction | Eigenvectors of covariance, SVD |
| Recommender systems | Matrix factorisation |
| Embeddings and semantic search | Vector spaces, cosine similarity, nearest neighbours |
| Transformers / attention | softmax(QKᵀ/√d)V: three matrix multiplications and a softmax |
| SVM | Dot products and kernel (Gram) matrices |
| Computer vision | Images as tensors; convolution as structured matrix multiplication |
| Optimisation | Hessian eigenvalues, conditioning |
| Graph ML | Adjacency matrices, Laplacian eigenvectors |

**Mini-exercise: linear regression three ways.**
```python
rng = np.random.default_rng(0)
X = np.c_[np.ones(100), rng.normal(size=(100, 2))]   # add a bias column
true_w = np.array([1.0, 2.0, -3.0])
y = X @ true_w + rng.normal(scale=0.1, size=100)

w_normal = np.linalg.solve(X.T @ X, X.T @ y)          # normal equations
w_lstsq  = np.linalg.lstsq(X, y, rcond=None)[0]       # QR/SVD based
w_pinv   = np.linalg.pinv(X) @ y                      # pseudo-inverse
# all ≈ [1, 2, -3]
```

**Recommended resources.** 3Blue1Brown, *Essence of Linear Algebra* (visual intuition); Gilbert Strang, *MIT 18.06*; *Mathematics for Machine Learning* (Deisenroth, Faisal & Ong, free PDF).
