# Module 11: Unsupervised Learning

**Phase 3 · Classical Machine Learning** · Goal: discover structure in unlabelled data through clustering, dimensionality reduction and anomaly detection, and evaluate it honestly.

---

## 1. Introduction to Unsupervised Learning

**In plain English.** There are no answers to learn from. The algorithm looks for **patterns, groups, compact representations or oddities** in the inputs alone.

**Main tasks.**
| Task | Output | Business example |
|---|---|---|
| Clustering | A group ID per item | Customer segments |
| Dimensionality reduction | Fewer, informative features | Visualising 1,000-D embeddings in 2-D |
| Anomaly detection | An "unusualness" score | Fraud, machine faults |
| Density estimation | p(x) | Detecting out-of-distribution inputs |
| Association rules | If-then co-occurrence | Market basket analysis |

**Why it is hard.** There is no ground truth, the results depend heavily on **feature choice and scaling**, and different algorithms find different "valid" structures. Evaluation needs internal metrics, stability checks and **domain review**.

**Check yourself.** Why do two clustering algorithms on the same data often produce different results, and which is "right"?

---

## 2. Clustering vs Classification

| | Classification | Clustering |
|---|---|---|
| Labels | Given in training | None |
| Number of groups | Fixed by the labels | Chosen or discovered |
| Goal | Predict known categories | Discover natural groupings |
| Evaluation | Accuracy, F1 against the truth | Silhouette, stability, usefulness |
| Group meaning | Defined in advance | Interpreted afterwards ("cluster 3 = bargain hunters") |

**They combine well.** Cluster first, label the clusters with domain experts, then train a classifier to assign new items. Or use cluster IDs as features for a supervised model.

**Check yourself.** A marketing team wants "five customer types". Is that a classification or clustering problem? What would change if they had already labelled 2,000 customers?

---

## 3. K-Means Clustering

**In plain English.** Divide the data into **K groups**, each represented by its centre (centroid). Every point belongs to its nearest centroid.

**Objective (inertia, or within-cluster sum of squares):**
J = Σₖ Σ_{x∈Cₖ} ‖**x** − **μ**ₖ‖²

**Assumptions and limitations.**
- Clusters are roughly **spherical**, of **similar size** and with similar density (it uses Euclidean distance to a single centre).
- You must choose K in advance.
- It is sensitive to **scaling**, **outliers** and **initialisation**.
- It fails on elongated, ring-shaped or nested clusters (use DBSCAN, GMM or spectral clustering instead).

```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
Xs = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=4, n_init=10, random_state=0).fit(Xs)
km.labels_, km.cluster_centers_, km.inertia_
```

**Variants.** MiniBatchKMeans (large data), K-medoids (centres are actual points; robust; any distance metric), and bisecting K-means.

**Check yourself.** Why does K-means need feature scaling, while a decision tree doesn't?

---

## 4. The K-Means Algorithm Step by Step

**Lloyd's algorithm.**
1. **Initialise** K centroids (randomly, or better with **k-means++**).
2. **Assign:** each point goes to its nearest centroid.
3. **Update:** move each centroid to the mean of its assigned points.
4. Repeat steps 2-3 until the assignments stop changing (or the centroids move less than a tolerance).

Each step can only decrease J, so it **always converges**, but possibly to a **local minimum**. Hence `n_init`: run it several times and keep the lowest inertia.

**k-means++ initialisation.** Choose the first centroid at random, then choose each next centroid with probability ∝ D(x)², the squared distance to the nearest existing centroid. This spreads the centres out, giving faster convergence and better solutions.

**From scratch.**
```python
import numpy as np

def kmeans(X, k, iters=100, seed=0):
    rng = np.random.default_rng(seed)
    C = X[rng.choice(len(X), k, replace=False)]
    for _ in range(iters):
        d = ((X[:, None, :] - C[None, :, :]) ** 2).sum(-1)   # (n, k) squared distances
        labels = d.argmin(1)
        newC = np.array([X[labels == j].mean(0) if (labels == j).any() else C[j] for j in range(k)])
        if np.allclose(newC, C):
            break
        C = newC
    return labels, C
```

**Complexity.** O(n·K·d) per iteration, which scales well.

**Check yourself.** Points at 1, 2, 9, 10 with K = 2 and initial centroids at 1 and 2: trace the first two iterations. (Assign {1}, {2, 9, 10} → centroids 1 and 7 → assign {1, 2}, {9, 10} → centroids 1.5 and 9.5. Converged.)

---

## 5. Choosing the Optimal Number of Clusters

There is rarely one "true" K. Combine several sources of evidence:
| Method | Idea |
|---|---|
| **Elbow method** | Inertia vs K; look for the bend (topic 6) |
| **Silhouette score** | Cohesion vs separation; maximise it (topic 7) |
| Gap statistic | Compare inertia with that of uniform random data |
| Davies-Bouldin index | Lower is better |
| Calinski-Harabasz index | Higher is better |
| BIC / AIC | For GMMs: a likelihood penalised by complexity |
| **Stability** | Do the clusters persist across bootstrap samples and seeds? |
| **Business usefulness** | Can the teams act on K segments? Are they distinct and big enough? |

**Check yourself.** The silhouette score peaks at K = 2, but marketing needs 4-6 actionable segments. How do you reconcile these?

---

## 6. Elbow Method

**Procedure.** Fit K-means for K = 1…10 and plot the inertia (WCSS) against K. The inertia always decreases as K grows (with K = n it is 0). Look for the "elbow" where adding clusters stops giving large improvements.

```python
inertias = [KMeans(k, n_init=10, random_state=0).fit(Xs).inertia_ for k in range(1, 11)]
plt.plot(range(1, 11), inertias, "o-"); plt.xlabel("K"); plt.ylabel("inertia")
```

**Limitation.** The elbow is often ambiguous (a smooth curve). Treat it as a hint and confirm with the silhouette score and domain sense. The `kneed` package can locate the knee automatically.

**Check yourself.** Why can't you simply choose the K with the lowest inertia?

---

## 7. Silhouette Score

**For each point i:**
- a(i) = the mean distance to the other points in **its own** cluster (cohesion)
- b(i) = the mean distance to the points in the **nearest other** cluster (separation)
- **s(i) = (b − a) / max(a, b)**, which lies in [−1, 1]

| s(i) | Meaning |
|---|---|
| ≈ 1 | Well clustered |
| ≈ 0 | On the boundary between clusters |
| < 0 | Probably in the wrong cluster |

The overall score is the mean of s(i). As a rough guide: above 0.5 is reasonable structure; below 0.25 there is little structure.

```python
from sklearn.metrics import silhouette_score, silhouette_samples
for k in range(2, 9):
    labels = KMeans(k, n_init=10, random_state=0).fit_predict(Xs)
    print(k, round(silhouette_score(Xs, labels), 3))
```

**Silhouette plots** (per-cluster distributions of s) reveal thin or poorly separated clusters. The cost is O(n²), so subsample large datasets (`sample_size=`).

**Caveat.** It favours convex, well-separated clusters, so it may underrate valid DBSCAN clusters with odd shapes.

**Check yourself.** A point has a = 2 and b = 6. Compute its silhouette. (≈ 0.67.)

---

## 8. Hierarchical Clustering

**In plain English.** Build a **tree of clusters** (a hierarchy) rather than one flat partition. You can cut the tree at any level to get the number of clusters you want.

**Two directions.** **Agglomerative** (bottom-up, the common one) and **divisive** (top-down). See topic 9.

**Pros.** No need to choose K in advance, a visual dendrogram (topic 10), any distance metric works, and it reveals nested structure (species → genus → family).
**Cons.** O(n²) memory and O(n²) to O(n³) time, which is impractical beyond tens of thousands of points. Merges are greedy and cannot be undone.

**Check yourself.** Why is hierarchical clustering a poor choice for 2 million customer records?

---

## 9. Agglomerative and Divisive Clustering

**Agglomerative (bottom-up).**
1. Start with every point as its own cluster.
2. Merge the two **closest** clusters.
3. Repeat until one cluster remains (or K remain).

**Linkage: how to measure the distance between clusters.**
| Linkage | Distance between clusters | Behaviour |
|---|---|---|
| Single | The closest pair of points | Finds elongated shapes; prone to "chaining" |
| Complete | The farthest pair | Compact clusters of similar diameter |
| Average | The mean of all pairwise distances | A compromise |
| **Ward** | The increase in total within-cluster variance | Compact, balanced clusters; the default; Euclidean only |

```python
from sklearn.cluster import AgglomerativeClustering
labels = AgglomerativeClustering(n_clusters=4, linkage="ward").fit_predict(Xs)
```

**Divisive (top-down).** Start with everything in one cluster and recursively split it (for example with bisecting K-means). It can be better at finding large top-level structure but is more expensive.

**Check yourself.** Which linkage would you choose to find two long, curved, parallel bands of points?

---

## 10. Dendrograms

**What it is.** A tree diagram that records each merge. The **height** of a join is the distance at which the two clusters merged.

**Reading it.**
- Long vertical lines (big gaps before the next merge) indicate well-separated clusters.
- **Cut horizontally** at a height. The number of vertical lines you cross is the number of clusters.

```python
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
Z = linkage(Xs, method="ward")
dendrogram(Z, truncate_mode="lastp", p=30); plt.ylabel("merge distance")
labels = fcluster(Z, t=4, criterion="maxclust")
```

**Uses.** Choosing the number of clusters, gene-expression heatmaps (clustered rows and columns), and taxonomy building.

**Check yourself.** In a dendrogram, the last two merges happen at heights 12 and 40, while all earlier merges are below 5. How many natural clusters are there? (Cutting between 5 and 12 gives 3.)

---

## 11. DBSCAN Clustering

**Density-Based Spatial Clustering of Applications with Noise.**

**Parameters.**
- **eps (ε):** the neighbourhood radius.
- **min_samples:** the minimum number of points within ε for a point to be a "core" point.

**Point types.**
| Type | Definition |
|---|---|
| Core | Has ≥ min_samples neighbours within ε |
| Border | Within ε of a core point, but not itself a core point |
| Noise | Neither, labelled **−1** |

**Algorithm.** Connect core points that are within ε of each other into clusters, then attach border points.

**Strengths.** **Arbitrary shapes** (rings, moons), **no need to choose K**, and explicit **outlier detection**.
**Weaknesses.** It struggles when clusters have **very different densities**, ε is hard to choose in high dimensions, and the features must be scaled.

**Choosing ε: the k-distance plot.** Sort every point's distance to its k-th nearest neighbour (k = min_samples) and look for the knee.
```python
from sklearn.neighbors import NearestNeighbors
from sklearn.cluster import DBSCAN
d, _ = NearestNeighbors(n_neighbors=5).fit(Xs).kneighbors(Xs)
plt.plot(np.sort(d[:, -1]))                   # knee ≈ a good eps
labels = DBSCAN(eps=0.3, min_samples=5).fit_predict(Xs)
```
**HDBSCAN** (`sklearn.cluster.HDBSCAN`) removes the need to choose ε and handles varying densities. It is often the better default.

**Check yourself.** On the `make_moons` dataset, why does DBSCAN succeed where K-means fails?

---

## 12. Density-Based Clustering

**Core idea.** Clusters are **dense regions separated by sparse regions**. Unlike centroid methods, there is no assumption about shape or the number of clusters.

**Algorithms in this family.**
| Algorithm | Key feature |
|---|---|
| DBSCAN | A fixed density threshold (ε, min_samples) |
| **HDBSCAN** | Builds a hierarchy over densities and extracts stable clusters; handles varying densities |
| OPTICS | Orders points by reachability distance; handles varying densities |
| Mean-shift | Moves points towards density peaks (modes); finds the number of clusters automatically; slow |

**When to use density-based clustering.** Spatial and geographic data (GPS hotspots), anomaly-heavy data, non-convex shapes, and clustering embeddings (HDBSCAN on UMAP-reduced embeddings is a popular recipe for topic modelling, as in BERTopic).

**Check yourself.** Why is "noise" a feature of density-based clustering rather than a bug?

---

## 13. Gaussian Mixture Models

**In plain English.** Assume the data comes from a mixture of K Gaussian "blobs", each with its own mean, covariance (shape and orientation) and weight. GMMs give **soft assignments**: the probability that each point belongs to each cluster.

**Model.**
p(**x**) = Σₖ πₖ · N(**x** | **μ**ₖ, Σₖ),  with Σπₖ = 1

**Compared with K-means.**
| K-means | GMM |
|---|---|
| Hard assignments | Soft probabilities |
| Spherical clusters of equal spread | **Elliptical** clusters of any orientation and size |
| Distance-based | Likelihood-based (a generative model) |
| A special case of GMM | (equal spherical covariances, with variance → 0) |

```python
from sklearn.mixture import GaussianMixture
bics = [GaussianMixture(k, covariance_type="full", random_state=0).fit(Xs).bic(Xs) for k in range(1, 9)]
gmm = GaussianMixture(n_components=int(np.argmin(bics)) + 1, covariance_type="full", random_state=0).fit(Xs)
probs = gmm.predict_proba(Xs)          # soft memberships
log_density = gmm.score_samples(Xs)    # low values = anomalies
```

**Covariance types:** `full` (most flexible), `tied`, `diag` and `spherical` (fewest parameters). Choose with **BIC**.

**Check yourself.** A customer has GMM probabilities [0.48, 0.47, 0.05]. What does this tell you that K-means could not?

---

## 14. Expectation-Maximisation Algorithm

**The problem.** To fit a GMM, we would need to know which component generated each point (a **latent variable**), but we don't. If we knew the assignments, fitting the Gaussians would be easy. If we knew the Gaussians, computing the assignments would be easy. EM alternates between the two.

**Algorithm.**
1. **Initialise** the parameters (πₖ, **μ**ₖ, Σₖ), often from K-means.
2. **E-step:** compute the **responsibilities**, the posterior probability that point i belongs to component k:
   γᵢₖ = πₖ N(**x**ᵢ | **μ**ₖ, Σₖ) / Σⱼ πⱼ N(**x**ᵢ | **μ**ⱼ, Σⱼ)
3. **M-step:** re-estimate the parameters using the responsibilities as weights:
   Nₖ = Σᵢ γᵢₖ,  πₖ = Nₖ/n,  **μ**ₖ = (1/Nₖ) Σᵢ γᵢₖ**x**ᵢ,  Σₖ = (1/Nₖ) Σᵢ γᵢₖ(**x**ᵢ − **μ**ₖ)(**x**ᵢ − **μ**ₖ)ᵀ
4. Repeat until the log-likelihood stops improving.

**Guarantees.** Each iteration **never decreases** the likelihood, so it converges, but to a local optimum. Use several initialisations.

**Generality.** EM is a general recipe for latent-variable models: hidden Markov models, missing-data imputation, and topic models. K-means is "hard EM".

**Check yourself.** Explain how the K-means assign and update steps correspond to the E and M steps.

---

## 15. Principal Component Analysis (PCA)

**In plain English.** Find new axes (**principal components**) that capture the most **variance** in the data. Keep the first few and discard the rest. You compress the data while losing as little information as possible.

**Algorithm.**
1. **Centre** the data (subtract the mean). Usually also **standardise** it if the features have different units.
2. Compute the covariance matrix Σ = XᵀX/(n − 1), or use the SVD of X directly (more stable).
3. The eigenvectors of Σ are the principal directions. The eigenvalues are the variance along each one.
4. Sort by eigenvalue and keep the top k. Project: **Z = X W_k**.

**Explained variance ratio** = λᵢ/Σλ. Choose k to keep, say, 95% of the variance (or use a scree plot).

```python
from sklearn.decomposition import PCA
pca = PCA(n_components=0.95).fit(Xs)       # keep 95% of the variance
Z = pca.transform(Xs)
print(pca.n_components_, pca.explained_variance_ratio_.cumsum())
X_back = pca.inverse_transform(Z)          # reconstruction
```

**Properties.** The components are **orthogonal** (uncorrelated). PCA is **linear**, so it can't unfold curved structure. The components are linear combinations of the features, so they are harder to interpret ("PC1 = 0.6·income + 0.5·spend − …").

**Uses.** Compression, speeding up models, removing multicollinearity, noise reduction, visualisation, and eigenfaces.

**Check yourself.** Why must you standardise before PCA when one feature is in metres and another in millimetres?

---

## 16. Dimensionality Reduction

**Why reduce dimensions?** To fight the curse of dimensionality, reduce overfitting, speed up training, visualise data and cut storage.

**Two approaches.**
| Feature selection | Feature extraction |
|---|---|
| Keep a subset of the original features | Create new features from combinations |
| Interpretable | Often more compact |
| Filter, wrapper, embedded methods | PCA, LDA, autoencoders, t-SNE, UMAP |

**Method overview.**
| Method | Linear? | Supervised? | Preserves | Best for |
|---|---|---|---|---|
| PCA | Yes | No | Global variance | Preprocessing, compression |
| Truncated SVD | Yes | No | Variance (no centring) | Sparse text matrices (LSA) |
| LDA (Linear Discriminant Analysis) | Yes | **Yes** | Class separation | Preprocessing for classification |
| Kernel PCA | No | No | Non-linear variance | Curved structure |
| t-SNE | No | No | Local neighbourhoods | 2-D/3-D visualisation only |
| UMAP | No | No | Local + more global structure | Visualisation, preprocessing for clustering |
| Autoencoders | No | No | Whatever reconstructs best | Images, complex data (Module 17) |

**Rule of thumb.** Use PCA for modelling pipelines. Use t-SNE or UMAP for **looking** at data.

**Check yourself.** Why should you not feed t-SNE coordinates into a production classifier?

---

## 17. t-SNE

**t-distributed Stochastic Neighbour Embedding.** A non-linear method designed for **visualising** high-dimensional data in 2-D or 3-D.

**How it works.**
1. In high-D space, convert distances into probabilities that point j is i's neighbour (a Gaussian kernel whose width is set by **perplexity**).
2. In low-D space, define similar probabilities using a heavy-tailed **Student-t** distribution.
3. Minimise the **KL divergence** between the two by gradient descent. Close neighbours stay close.
The heavy tails let dissimilar points move far apart, which solves the "crowding problem".

**Perplexity** (roughly 5-50) is the effective number of neighbours. Results change noticeably with it, so try several values.

**How to read t-SNE plots correctly.**
- ✓ Points that are close probably are similar (local structure is preserved).
- ✗ **Cluster sizes mean nothing.**
- ✗ **Distances between clusters mean little.**
- ✗ It is stochastic: different seeds give different layouts.
- ✗ It has no `transform` for new data.
- It is slow (O(n log n) with Barnes-Hut). Run PCA to about 50 dimensions first.

```python
from sklearn.manifold import TSNE
Z = TSNE(n_components=2, perplexity=30, init="pca", random_state=0).fit_transform(PCA(50).fit_transform(Xs))
```

**Check yourself.** In a t-SNE plot, cluster A looks three times bigger than cluster B. Does A contain more varied data?

---

## 18. UMAP Fundamentals

**Uniform Manifold Approximation and Projection.** A non-linear technique based on manifold learning and topology.

**How it works (intuition).** Build a **weighted k-nearest-neighbour graph** in high-D space (a fuzzy topological representation), then optimise a low-D layout whose graph matches it as closely as possible (using cross-entropy).

**Key parameters.**
| Parameter | Effect |
|---|---|
| `n_neighbors` (5-100) | Small values emphasise local detail; large values show more global structure |
| `min_dist` (0-0.99) | How tightly points can pack; small values give clumpier clusters |
| `metric` | Euclidean, cosine (for embeddings), and others |

**UMAP vs t-SNE.**
| | t-SNE | UMAP |
|---|---|---|
| Speed | Slower | Much faster; scales to millions of points |
| Global structure | Poor | Better (still not reliable for distances) |
| New data | No transform | Has `transform()` |
| Use beyond visualisation | Rarely | Yes: as preprocessing for clustering (UMAP → HDBSCAN) |

```python
import umap                        # pip install umap-learn
Z = umap.UMAP(n_neighbors=15, min_dist=0.1, metric="cosine", random_state=0).fit_transform(embeddings)
```

**Check yourself.** You want to cluster 500k sentence embeddings (768-D) into topics. Outline a UMAP-based pipeline.

---

## 19. Anomaly Detection

**In plain English.** Find data points that **differ significantly** from the majority: fraud, intrusions, defective products, sensor faults or unusual patients.

**Types of anomaly.**
| Type | Example |
|---|---|
| Point | A single £50,000 transaction on a £20/day card |
| Contextual | 30°C is normal in July but anomalous in January |
| Collective | Each login is normal, but 500 from one IP in 1 minute is not |

**Approaches.**
| Approach | Methods |
|---|---|
| Statistical | Z-score, IQR, Gaussian density thresholds |
| Distance / density | KNN distance, **Local Outlier Factor (LOF)** |
| Isolation | **Isolation Forest** (topic 20) |
| Boundary | One-Class SVM |
| Reconstruction | PCA or **autoencoder** reconstruction error |
| Supervised | If labelled anomalies exist, an imbalanced classifier (usually best) |

**Challenges.** Labels are rare or missing, anomalies are diverse and change over time (adversaries adapt), and the threshold choice drives the false-alarm rate. Evaluate with **precision at k** or PR-AUC on whatever labelled incidents you have.

**Check yourself.** Why is accuracy useless for evaluating a fraud detector when 0.1% of transactions are fraud?

---

## 20. Isolation Forest

**Key insight.** Anomalies are **few and different**, so they are **easier to isolate**. If you split the data randomly, an anomaly gets separated in very few cuts, while a normal point buried in a dense cluster needs many.

**Algorithm.**
1. Build many **isolation trees**: at each node, pick a random feature and a random split value between its min and max, and split until each point is isolated (or a depth limit is reached). Each tree is trained on a small subsample (256 points by default).
2. The **path length** h(x) is the number of splits needed to isolate x.
3. **Anomaly score** = 2^{−E[h(x)]/c(n)}, where c(n) normalises by the average path length. A score near 1 means anomalous; well below 0.5 means normal.

```python
from sklearn.ensemble import IsolationForest
iso = IsolationForest(n_estimators=300, contamination=0.01, random_state=0).fit(X_train)
scores = -iso.score_samples(X_test)       # higher = more anomalous
flags = iso.predict(X_test)               # -1 anomaly, 1 normal
```

**Strengths.** Fast (linear time), works in high dimensions, needs no scaling or distance metric, and needs no labels.
**Weaknesses.** `contamination` is a guess that sets the threshold. Axis-parallel splits can miss anomalies that only stand out in combinations of features (Extended Isolation Forest addresses this). It struggles with local anomalies inside dense regions (LOF can do better).

**Check yourself.** Why does Isolation Forest train each tree on a small subsample rather than the full dataset? (It reduces "masking" and "swamping", where dense groups of anomalies hide each other, and it is faster.)

---

## 21. Applications of Unsupervised Learning

| Domain | Application | Typical methods |
|---|---|---|
| Marketing | Customer segmentation, personas | K-means, GMM on RFM features |
| Finance | Fraud and anti-money-laundering detection | Isolation Forest, autoencoders, graph clustering |
| Cybersecurity | Network intrusion detection | Density methods, reconstruction error |
| Manufacturing / IoT | Predictive maintenance, fault detection | PCA-based monitoring, autoencoders |
| Retail | Market basket analysis, store clustering | Association rules, K-means |
| NLP | Topic modelling, document deduplication | LDA (topic model), embeddings + HDBSCAN, MinHash |
| Recommendation | Similar items and users | Matrix factorisation, nearest neighbours |
| Biology / health | Cell types, patient subgroups | Hierarchical clustering, UMAP + clustering |
| Computer vision | Image compression, colour quantisation | K-means on pixel colours, PCA |
| ML engineering | Data exploration, drift detection, feature learning, labelling help | PCA/UMAP, clustering embeddings, self-supervised pre-training |

**Practical workflow for a segmentation project.**
1. Define the business purpose (what will each segment *do* differently?).
2. Engineer meaningful features (for example Recency, Frequency, Monetary value) and **scale** them.
3. Try K-means, GMM and HDBSCAN. Evaluate with silhouette, stability and segment sizes.
4. **Profile** each cluster: feature means compared with the overall population, and size.
5. Name the clusters with stakeholders, validate them with an A/B test (does targeting by segment improve outcomes?), and monitor drift.

**Check yourself.** Design features and an evaluation plan to segment the users of a subscription music app.
