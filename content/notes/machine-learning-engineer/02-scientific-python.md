# Module 02: Scientific Python and Numerical Computing

**Phase 1 · Foundation** · Goal: be fluent in NumPy, pandas, Matplotlib and Seaborn, the tools every ML workflow is built on.

---

## 1. Introduction to Scientific Computing

**In plain English.** Scientific computing means using computers to solve numerical problems: simulations, statistics, optimisation and linear algebra. Machine learning is applied scientific computing. Training a model is mostly multiplying matrices and following gradients.

**How it works.** The Python scientific stack is layered:
```
Your code
  └─ pandas / scikit-learn / PyTorch / SciPy / Matplotlib
       └─ NumPy (n-dimensional arrays + vectorised maths)
            └─ BLAS / LAPACK (optimised C/Fortran linear algebra), SIMD CPU instructions
```
Three ideas run through the whole module:
1. **Arrays, not lists.** Contiguous memory with a single numeric type.
2. **Vectorisation.** Operate on whole arrays at once instead of looping.
3. **Numerical care.** Floats have limited precision, and some formulas are unstable.

**Check yourself.** Name the library layer that actually performs `A @ B` when you call it from NumPy.

---

## 2. Introduction to NumPy

**In plain English.** NumPy provides the `ndarray`: a grid of numbers, all of the same type, stored contiguously in memory. Almost every ML library accepts or returns NumPy arrays (PyTorch tensors are closely related).

```python
import numpy as np
a = np.array([1, 2, 3])
a * 2          # array([2, 4, 6]). A list would give [1,2,3,1,2,3]
a.sum(), a.mean()
```

**Why it is fast:** fixed dtype (no per-element type checks), contiguous memory (cache-friendly) and loops in compiled C.

**Check yourself.** Why can a Python list hold `[1, "a", None]` while a NumPy array of that would become `dtype=object` and lose its speed?

---

## 3. Creating NumPy Arrays

```python
np.array([[1, 2], [3, 4]])          # from nested lists
np.zeros((3, 4)); np.ones(5); np.full((2, 2), 7)
np.eye(3)                           # identity matrix
np.arange(0, 10, 2)                 # [0 2 4 6 8]  (like range)
np.linspace(0, 1, 5)                # [0. 0.25 0.5 0.75 1.]  (n points, inclusive)
np.empty((2, 3))                    # uninitialised: fast but contains garbage
np.zeros_like(X)                    # same shape and dtype as X
rng = np.random.default_rng(42)
rng.normal(0, 1, size=(100, 3))     # random (see topic 13)
```

**Pitfall.** `np.arange(0, 1, 0.1)` can give an unexpected number of elements because of float rounding. Use `linspace` when you need an exact count.

**Check yourself.** Create a 5×5 array with 1s on the border and 0s inside.

---

## 4. Array Dimensions, Shapes and Data Types

```python
X = np.zeros((100, 3), dtype=np.float32)
X.ndim     # 2
X.shape    # (100, 3)   -> 100 samples, 3 features
X.size     # 300
X.dtype    # float32
X.nbytes   # 1200 (300 × 4 bytes)
```

**Common ML shapes.**
| Data | Shape |
|---|---|
| Tabular features | `(n_samples, n_features)` |
| Target vector | `(n_samples,)` |
| Grayscale image batch | `(batch, height, width)` |
| Colour image batch (PyTorch) | `(batch, channels, height, width)` |
| Text token IDs | `(batch, sequence_length)` |

**dtypes.** `float64` is the NumPy default. Deep learning mostly uses `float32` (half the memory) or `float16`/`bfloat16`. Integer labels use `int64`. Convert with `X.astype(np.float32)`.

**Pitfall.** `(n,)` and `(n, 1)` are different. Mixing them causes surprise broadcasting (topic 7). scikit-learn wants `X` 2-D and `y` 1-D.

**Check yourself.** How much memory does a `float32` array of 1 million images, each 224×224×3, need?

---

## 5. Array Indexing and Slicing

```python
A = np.arange(12).reshape(3, 4)
# [[ 0  1  2  3]
#  [ 4  5  6  7]
#  [ 8  9 10 11]]
A[1, 2]        # 6
A[0]           # first row  [0 1 2 3]
A[:, 1]        # second column [1 5 9]
A[:2, 1:3]     # [[1 2] [5 6]]
A[-1, ::-1]    # last row reversed

# Boolean masks: filtering
A[A > 5]                 # [ 6  7  8  9 10 11]
A[A % 2 == 0] = 0        # set evens to zero

# Fancy (integer-array) indexing
A[[0, 2]]                # rows 0 and 2
A[[0, 1, 2], [3, 2, 1]]  # elements (0,3), (1,2), (2,1)
```

**Views vs copies.** Basic slices return **views** that share memory with the original. Boolean and fancy indexing return **copies**.
```python
row = A[0]; row[0] = 99   # also changes A!
safe = A[0].copy()
```

**Check yourself.** Given labels `y` and predictions `p`, write one expression for accuracy using a boolean comparison.

---

## 6. Array Reshaping and Flattening

```python
a = np.arange(12)
a.reshape(3, 4)          # the total size must match
a.reshape(-1, 6)         # -1 = "work this out" -> (2, 6)
a.reshape(-1, 1)         # column vector (12, 1). Common for sklearn
X.ravel()                # flatten, returns a view when possible
X.flatten()              # flatten, always a copy
X.T                      # transpose
x[:, np.newaxis]         # add an axis: (n,) -> (n, 1)
np.expand_dims(x, 0); np.squeeze(x)
np.concatenate([A, B], axis=0)   # stack rows
np.stack([a, b], axis=1)         # new axis
```

**Mental model.** Reshape does not move data. It changes how the same flat buffer is interpreted (row-major or "C" order by default).

**Pitfall.** `reshape` is not `transpose`. Reshaping a `(2, 3)` array to `(3, 2)` does **not** give its transpose.

**Check yourself.** A batch of 32 grayscale 28×28 images is shaped `(32, 28, 28)`. Reshape it for a model that wants flat vectors.

---

## 7. Array Broadcasting

**In plain English.** Broadcasting lets NumPy combine arrays of different shapes by virtually "stretching" the smaller one without copying memory.

**The rule.** Compare shapes from the **right**. Two dimensions are compatible if they are equal or one of them is 1. Missing leading dimensions count as 1.

```python
X = np.random.rand(100, 3)       # (100, 3)
mu = X.mean(axis=0)              # (3,)
X_centered = X - mu              # (100,3) - (3,) -> works, row-wise

col = np.array([[1], [2], [3]])  # (3, 1)
row = np.array([10, 20])         # (2,)
col + row                        # (3, 2) outer sum

# Pairwise squared distances between points A (m,d) and B (n,d)
D = ((A[:, None, :] - B[None, :, :]) ** 2).sum(-1)   # (m, n)
```

**Pitfall.** Silent wrong answers. `y_true` with shape `(n,)` minus `y_pred` with shape `(n, 1)` broadcasts to an `(n, n)` matrix, and your "MSE" is computed over n² numbers. Always check `.shape`.

**Check yourself.** Standardise every **row** (not column) of `X` to zero mean.

---

## 8. Vectorisation and Vectorised Operations

**In plain English.** Vectorisation means expressing a computation as operations on whole arrays rather than element-by-element Python loops.

```python
# Loop version
out = []
for xi in x:
    out.append(1 / (1 + math.exp(-xi)))

# Vectorised version
out = 1 / (1 + np.exp(-x))
```

**Universal functions (ufuncs)** are element-wise and fast: `np.exp, np.log, np.sqrt, np.abs, np.maximum, np.where`.
```python
relu = np.maximum(0, x)
labels = np.where(probs > 0.5, 1, 0)
np.clip(x, 0, 1)
```

**Technique.** Look for the pattern "for every element, do the same maths" and replace the loop with array maths. For "for every pair", use broadcasting. For "sum over something", use `axis=` reductions or `@`.

**Check yourself.** Vectorise: `total = 0; for i in range(n): total += w[i] * x[i]`.

---

## 9. Mathematical Operations with NumPy

```python
np.sum(X, axis=0)    # column sums (collapse rows)
np.sum(X, axis=1)    # row sums (collapse columns)
np.cumsum(x); np.prod(x); np.diff(x)
np.exp(x); np.log(x); np.log1p(x)   # log1p is accurate for small x
np.round(x, 2); np.floor(x); np.ceil(x)
np.argmax(probs, axis=1)            # predicted class per row
np.sort(x); np.argsort(x)           # argsort gives the indices that sort
```

**Axis intuition.** `axis=0` means "go down the rows", so the result has one value per **column**. `keepdims=True` keeps the reduced axis as size 1, which makes later broadcasting safe.

**Numerically stable softmax.** A classic interview question:
```python
def softmax(z):
    z = z - z.max(axis=-1, keepdims=True)   # prevents overflow in exp
    e = np.exp(z)
    return e / e.sum(axis=-1, keepdims=True)
```

**Check yourself.** Why does subtracting the maximum not change the softmax output?

---

## 10. Statistical Operations: Mean, Median and Standard Deviation

```python
x = np.array([2, 4, 4, 4, 5, 5, 7, 9])
x.mean()            # 5.0
np.median(x)        # 4.5
x.std()             # 2.0  (population, ddof=0)
x.std(ddof=1)       # 2.138 (sample, divides by n-1)
x.var(); np.percentile(x, [25, 50, 75]); x.min(); x.max()
np.corrcoef(a, b)   # correlation matrix
np.nanmean(arr)     # ignores NaNs
```

| Statistic | Measures | Sensitive to outliers? |
|---|---|---|
| Mean | Centre (balance point) | Yes |
| Median | Centre (middle value) | No |
| Std / variance | Spread around the mean | Yes |
| IQR (Q3 − Q1) | Spread of the middle 50% | No |

**Pitfall.** NumPy's default `std` uses `ddof=0`, but pandas' `.std()` defaults to `ddof=1`. The same data can give different numbers.

**Check yourself.** House prices in an area are mostly £300k, with one £20M mansion. Which centre statistic should a summary report use?

---

## 11. Matrix Operations

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])
A * B                # element-wise (Hadamard) product
A @ B                # matrix product
A.T                  # transpose
np.linalg.inv(A)     # inverse
np.linalg.det(A)     # determinant: -2.0
np.linalg.solve(A, b)        # solve Ax = b. Better than inv(A) @ b
np.linalg.eig(A); np.linalg.svd(A); np.linalg.norm(v)
```

**Pitfall.** Never compute `inv(A) @ b` to solve a linear system. `solve` is faster and more numerically stable. The theory is in Module 04.

**Check yourself.** What is the difference between `A * B` and `A @ B`, and when do they give the same result?

---

## 12. Dot Products and Matrix Multiplication

**Dot product** of two vectors: multiply pairwise and sum.
`a · b = Σ aᵢbᵢ`. Geometrically, `|a||b|cos θ`, which measures how aligned they are.

**Matrix multiplication** `C = A @ B`, where `A` is (m×n) and `B` is (n×p), gives `C` (m×p). Each `Cᵢⱼ` is the dot product of row *i* of A with column *j* of B. **The inner dimensions must match.**

**Why ML cares.** A linear model on a whole dataset at once is one matrix product:
```python
X = rng.normal(size=(1000, 5))   # 1000 samples, 5 features
w = rng.normal(size=5)
b = 0.3
y_hat = X @ w + b                # (1000,) predictions in one line
```
A dense neural-network layer is `X @ W + b` followed by an activation.

**Check yourself.** `X` is (64, 784) and the first layer has 128 neurons. What shape must `W` be, and what shape is the output?

---

## 13. Random Number Generation

```python
rng = np.random.default_rng(seed=42)       # modern API: use this
rng.random(3)                     # uniform [0, 1)
rng.integers(0, 10, size=5)       # integers in [0, 10)
rng.normal(loc=0, scale=1, size=(2, 3))
rng.choice(["a", "b", "c"], size=5, p=[0.5, 0.3, 0.2])
rng.permutation(10)               # shuffled indices
rng.shuffle(arr)                  # in place
```

**Seeds.** Computers produce *pseudo*-random numbers from a deterministic generator. The same seed gives the same sequence, which makes experiments reproducible (Module 03, topic 14).

**ML uses:** weight initialisation, shuffling data, train/test splits, dropout, bootstrap sampling and data augmentation.

**Pitfall.** The legacy `np.random.seed()` sets **global** state that any library can disturb. Create a `Generator` and pass it around.

**Check yourself.** Shuffle `X` and `y` together so that rows stay aligned.

---

## 14. NumPy Performance vs Python Loops

```python
import numpy as np, time
x = np.random.rand(10_000_000)

t = time.perf_counter(); s = 0.0
for v in x: s += v * v
print("loop:", time.perf_counter() - t)        # ~1-2 s

t = time.perf_counter(); s = np.dot(x, x)
print("numpy:", time.perf_counter() - t)       # ~5 ms
```

**Why NumPy is roughly 100× faster.**
1. No interpreter overhead per element (no bytecode dispatch, no boxing into Python objects).
2. Contiguous memory makes good use of CPU caches.
3. SIMD instructions process several numbers per CPU instruction.
4. BLAS uses multiple threads for linear algebra.

**When loops are still fine:** small data, logic that depends on the previous step and can't be vectorised (use Numba if it is hot), and orchestration code.

**Check yourself.** Use `%timeit` in Jupyter to compare a list comprehension and a NumPy expression for computing `x**2 + 3*x`.

---

## 15. Introduction to Pandas

**In plain English.** pandas is the spreadsheet of Python: labelled, tabular data with columns of different types, plus tools to load, clean, reshape and summarise it.

```python
import pandas as pd
df = pd.read_csv("customers.csv")
df.head(); df.info(); df.describe(); df.shape
```

**pandas vs NumPy.** NumPy is a homogeneous numeric grid. pandas is heterogeneous columns with labels (index and column names), missing-value handling, joins and group-bys. Each pandas column is backed by a NumPy (or Arrow) array.

**Alternatives.** **Polars** is a faster, multi-threaded DataFrame library with a lazy query engine. It is popular for large data. The concepts carry over.

**Check yourself.** Why do most ML pipelines start in pandas and convert to NumPy (`df.to_numpy()`) before training?

---

## 16. Series and DataFrames

```python
s = pd.Series([0.9, 0.8, 0.7], index=["a", "b", "c"], name="score")   # 1-D, labelled
df = pd.DataFrame({
    "age":    [25, 32, 47],
    "city":   ["Leeds", "York", "Leeds"],
    "income": [32_000, 45_000, 61_000],
})
df["age"]           # a Series
df[["age", "city"]] # a DataFrame
df.dtypes
df["income_k"] = df["income"] / 1000     # new column, vectorised
df.index; df.columns
```

**Index.** Every Series and DataFrame has an index (row labels). Operations **align on the index**, which is powerful but surprising:
```python
pd.Series([1, 2], index=["a", "b"]) + pd.Series([10, 20], index=["b", "c"])
# a NaN, b 12, c NaN
```

**Useful dtypes:** `category` (memory-efficient for repeated strings), `datetime64`, nullable `Int64` and `string`.

**Check yourself.** Why can adding two Series of equal length produce NaNs?

---

## 17. Reading CSV, Excel and JSON Datasets

```python
df = pd.read_csv("data.csv",
                 usecols=["id", "date", "amount"],
                 dtype={"id": "string"},
                 parse_dates=["date"],
                 na_values=["", "NA", "?"])
df = pd.read_excel("report.xlsx", sheet_name="2024")   # needs openpyxl
df = pd.read_json("records.json")                      # or lines=True for JSONL
df = pd.json_normalize(nested_list_of_dicts)            # flatten nested JSON
df = pd.read_parquet("data.parquet")                    # columnar, typed, fast

# Large files
for chunk in pd.read_csv("huge.csv", chunksize=100_000):
    process(chunk)

df.to_csv("out.csv", index=False); df.to_parquet("out.parquet")
```

**Pitfalls.** IDs with leading zeros (`"00123"`) become integers unless you set `dtype`. Dates stay strings unless parsed. CSV loses dtypes, which is why **Parquet** is preferred for ML pipelines.

**Check yourself.** Name two reasons Parquet is better than CSV for storing a training dataset.

---

## 18. Data Selection, Filtering and Sorting

```python
df.loc[0, "age"]                  # by label
df.loc[df["age"] > 30, ["city", "income"]]
df.iloc[0:5, 0:2]                 # by integer position
df[(df["city"] == "Leeds") & (df["income"] > 40_000)]   # use & | ~ and parentheses
df[df["city"].isin(["Leeds", "York"])]
df.query("age > 30 and city == 'Leeds'")
df.sort_values(["city", "income"], ascending=[True, False])
df.nlargest(5, "income")
df["city"].value_counts(normalize=True)
```

**`SettingWithCopyWarning`.** Chained assignment such as `df[df.a > 0]["b"] = 1` may modify a copy. Use `df.loc[df.a > 0, "b"] = 1`. Copy-on-Write is the default from pandas 3.0, which makes this behaviour predictable.

**Check yourself.** Why must you write `(a > 1) & (b < 2)` instead of `a > 1 and b < 2` in pandas?

---

## 19. Handling Missing Values

```python
df.isna().sum()                         # missing count per column
df.isna().mean().sort_values()          # missing fraction
df.dropna(subset=["target"])            # drop rows with a missing target
df["age"] = df["age"].fillna(df["age"].median())
df["city"] = df["city"].fillna("Unknown")
df["temp"] = df["temp"].interpolate()   # time series
df["age_missing"] = df["age"].isna().astype(int)   # missing indicator feature
```

**Why values go missing** (this determines the right fix):
| Type | Meaning | Example |
|---|---|---|
| MCAR | Completely at random | A sensor glitch |
| MAR | Depends on *other observed* columns | Older users skip the "income" field |
| MNAR | Depends on the *missing value itself* | High earners hide their income |

**Pitfall.** Computing the fill value (such as the median) on the **full** dataset before splitting leaks test information into training. Fit imputers on training data only (Module 03, topic 6).

**Check yourself.** When is "missingness" itself a useful predictive feature?

---

## 20. Grouping and Aggregating Data

**Split → apply → combine.**
```python
df.groupby("city")["income"].mean()
df.groupby("city").agg(n=("id", "count"),
                       avg_income=("income", "mean"),
                       max_age=("age", "max"))
df.groupby(["city", "segment"]).size().unstack(fill_value=0)

# transform returns a result aligned to the original rows: great for features
df["city_avg_income"] = df.groupby("city")["income"].transform("mean")
df["income_vs_city"] = df["income"] / df["city_avg_income"]

pd.pivot_table(df, values="income", index="city", columns="segment", aggfunc="mean")
pd.crosstab(df["city"], df["churned"], normalize="index")
```

**Check yourself.** What is the difference between `groupby().agg()` and `groupby().transform()`, and which one do you use to create a feature?

---

## 21. Merging and Joining Datasets

```python
orders.merge(customers, on="customer_id", how="left", validate="many_to_one")
pd.concat([df_2023, df_2024], ignore_index=True)       # stack rows
pd.concat([X_num, X_cat], axis=1)                      # side by side
```

| `how=` | Keeps |
|---|---|
| `inner` | Only keys present in both |
| `left` | All rows of the left table |
| `right` | All rows of the right table |
| `outer` | All keys from both (NaN where missing) |

**Pitfalls.**
- **Row explosion.** Duplicate keys on both sides create a many-to-many join. `validate="one_to_one"` or `"many_to_one"` catches this.
- Check `len()` before and after every merge. Use `indicator=True` to see which side each row came from.
- Key dtype mismatches (`int` vs `str`) silently match nothing.

**Check yourself.** After a left merge, your row count grew from 10,000 to 10,450. What happened, and how do you find the cause?

---

## 22. Introduction to Matplotlib

```python
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(7, 4))          # object-oriented API (preferred)
ax.plot(epochs, train_loss, label="train")
ax.plot(epochs, val_loss, label="validation", linestyle="--")
ax.set(xlabel="Epoch", ylabel="Loss", title="Learning curves")
ax.legend(); ax.grid(alpha=0.3)
fig.tight_layout(); fig.savefig("curves.png", dpi=150)

fig, axes = plt.subplots(1, 3, figsize=(12, 3))  # several panels
axes[0].hist(df["age"], bins=30)
axes[1].scatter(df["age"], df["income"], alpha=0.4)
axes[2].bar(counts.index, counts.values)
```

**Anatomy.** A **Figure** is the canvas. It contains one or more **Axes** (individual plots), which contain lines, markers, labels and legends.

**Choosing a chart.**
| Question | Chart |
|---|---|
| Distribution of one variable | Histogram, box plot, KDE |
| Relationship between two numeric variables | Scatter plot |
| Trend over time or epochs | Line plot |
| Compare categories | Bar chart |
| Correlation of many variables | Heatmap |

**Check yourself.** Why should you always plot training and validation loss on the same axes?

---

## 23. Data Visualisation with Seaborn

**In plain English.** Seaborn is a high-level layer on Matplotlib that understands DataFrames and statistics.

```python
import seaborn as sns
sns.histplot(df, x="income", hue="churned", kde=True)
sns.boxplot(df, x="segment", y="income")
sns.scatterplot(df, x="age", y="income", hue="churned", alpha=0.6)
sns.countplot(df, x="city")
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm", center=0)
sns.pairplot(df, hue="churned", vars=["age", "income", "tenure"])
sns.lineplot(df, x="month", y="revenue", errorbar=("ci", 95))
```

**Pitfall.** `pairplot` on 50 columns or 1 million rows will hang. Sample the rows and pick the columns first.

**Check yourself.** Which Seaborn plot best shows whether churned customers have a different income distribution from retained ones?

---

## 24. Exploratory Data Analysis Using Python

**In plain English.** EDA is interviewing your data before you trust it. Its goals are to understand the structure, find quality problems, spot relationships and form hypotheses.

**A repeatable EDA checklist.**
1. **Shape and types:** `df.shape`, `df.info()`, `df.dtypes`. Are numbers stored as strings?
2. **Target:** distribution and class balance (`value_counts(normalize=True)`).
3. **Missing values:** count and pattern per column.
4. **Duplicates:** `df.duplicated().sum()`, and duplicates on the ID column.
5. **Univariate:** `describe()`, histograms, cardinality of categoricals (`nunique()`).
6. **Outliers and impossible values:** negative ages, dates in the future.
7. **Bivariate with the target:** box plots and grouped means; churn rate by category.
8. **Correlations** among features (multicollinearity) and with the target.
9. **Time:** is there a trend or seasonality? Is the data ordered?
10. **Leakage smells:** a feature that predicts the target suspiciously well (for example `refund_issued` when predicting fraud).
11. **Write down findings** and the cleaning decisions they imply.

```python
def quick_eda(df, target):
    print(df.shape); print(df.dtypes.value_counts())
    print(df.isna().mean().sort_values(ascending=False).head(10))
    print("duplicates:", df.duplicated().sum())
    print(df[target].value_counts(normalize=True))
    print(df.describe(include="all").T)
```

Tools such as `ydata-profiling` produce automatic reports. Treat them as a starting point, not a replacement for thinking.

**Check yourself.** During EDA, a feature has a 0.99 correlation with the target. List three possible explanations, at least one of which is a problem.

---

### Module 02 project idea
Take a public dataset (for example the Titanic or a city bike-share dataset). Load it with pandas, perform the full EDA checklist, produce five charts that each answer a specific question, and write a one-page summary of the data quality issues you found.
