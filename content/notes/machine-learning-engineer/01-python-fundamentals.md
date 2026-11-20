# Module 01: Python Programming Fundamentals

**Phase 1 · Foundation** · Goal: write clean, reusable Python that you can build ML systems on.

---

## 1. Introduction to Python and Its Role in Machine Learning

**In plain English.** Python is a general-purpose programming language that is easy to read. It became the language of machine learning because almost every important ML library (NumPy, pandas, scikit-learn, PyTorch, TensorFlow, Hugging Face) uses Python as its front door.

**How it works.**
- Python itself is relatively slow, because it is interpreted and dynamically typed. ML code is still fast because the heavy maths runs in **compiled C, C++, CUDA or Fortran** underneath. Python is the "glue" that tells those fast kernels what to do.
- The ecosystem covers the whole ML lifecycle: data (pandas, Polars), maths (NumPy, SciPy), classical ML (scikit-learn, XGBoost), deep learning (PyTorch), visualisation (Matplotlib, Seaborn), serving (FastAPI) and MLOps (MLflow, DVC).
- Python's readability matters in research and engineering teams, where code is read far more often than it is written.

**Pitfalls.**
- Believing "Python is slow, so ML in Python is slow." Python loops over millions of numbers are slow; vectorised library calls are not (see Module 02, topic 14).
- Treating Python as notebook-only. Production ML engineers write packages, tests and APIs in Python too.

**Check yourself.** Why can a Python program train a neural network on a GPU at near-hardware speed when a plain Python `for` loop is roughly 50-100× slower than C?

---

## 2. Setting Up Python, VS Code and Jupyter Notebook

**In plain English.** You need three things: a Python interpreter, an editor for writing files (VS Code), and a notebook (Jupyter) for interactive exploration.

**How it works.**
1. **Install Python 3.11+** from python.org. On macOS you can also use `brew install python`. Check it with `python3 --version`.
2. **Install VS Code** and add the *Python* and *Jupyter* extensions from Microsoft.
3. **Create a project folder and a virtual environment** (topic 22):
   ```bash
   mkdir ml-course && cd ml-course
   python3 -m venv .venv
   source .venv/bin/activate        # Windows: .venv\Scripts\activate
   pip install jupyter numpy pandas matplotlib scikit-learn
   ```
4. In VS Code, run *Python: Select Interpreter* and choose `.venv`.
5. Start notebooks with `jupyter lab` or open a `.ipynb` file directly in VS Code.

**When to use what.**
| Tool | Best for |
|---|---|
| Jupyter notebook | Exploration, EDA, plots, quick experiments |
| `.py` scripts / modules | Reusable code, pipelines, anything you import or deploy |
| Terminal / REPL | One-off checks, installing packages |

**Pitfalls.**
- Running cells out of order in Jupyter. The notebook's *hidden state* stops matching the code you see. Use *Restart & Run All* before you trust a result.
- Installing packages into the system Python instead of a virtual environment.

**Check yourself.** A notebook works on your machine but fails for a colleague with `NameError`. What is the most likely cause?

---

## 3. Your First Python Program

```python
print("Hello, Machine Learning!")
```

**How it works.** Save this as `hello.py` and run `python hello.py`. The interpreter reads the file from top to bottom, compiles it to bytecode, and executes each statement. `print` is a built-in function that writes to standard output.

A slightly more useful first program reads input, computes something and formats the result:

```python
name = input("Your name: ")
hours = float(input("Hours studied this week: "))
print(f"{name}, that's {hours * 60:.0f} minutes of learning.")
```

**Pitfalls.** `input()` always returns a **string**. Converting to a number is your job (topic 6).

**Check yourself.** What does `print("2" + "3")` output, and why is it not `5`?

---

## 4. Variables, Constants and Naming Conventions

**In plain English.** A variable is a **name that points to a value**. It is not a box that holds the value. This difference matters later with lists.

**How it works.**
```python
learning_rate = 0.01        # variable
MAX_EPOCHS = 100            # constant by convention (Python does not enforce it)
a = [1, 2, 3]
b = a                       # b points to the SAME list
b.append(4)
print(a)                    # [1, 2, 3, 4]
```

**PEP 8 naming conventions.**
| Kind | Style | Example |
|---|---|---|
| Variables, functions | `snake_case` | `train_loss`, `load_data()` |
| Constants | `UPPER_SNAKE_CASE` | `RANDOM_SEED = 42` |
| Classes | `PascalCase` | `LinearModel` |
| "Private" (internal) | leading underscore | `_cache` |

Choose names that reveal intent: `n_samples` beats `n`, and `X_train` / `y_train` are the accepted ML conventions (capital `X` for a 2-D feature matrix, lowercase `y` for a 1-D target).

**Pitfalls.** Shadowing built-ins (`list = [1, 2]`, `sum = 0`) breaks those functions for the rest of your session.

**Check yourself.** After `x = 5; y = x; y += 1`, what is `x`? Why does this behave differently from the list example?

---

## 5. Python Data Types: Integers, Floats, Strings and Booleans

**How it works.**
| Type | Example | Notes |
|---|---|---|
| `int` | `42`, `-7`, `10**100` | Arbitrary precision. No overflow in pure Python. |
| `float` | `3.14`, `1e-3` | 64-bit IEEE 754. About 15-16 significant digits. |
| `str` | `"hello"` | Immutable sequence of Unicode characters. |
| `bool` | `True`, `False` | A subclass of `int` (`True + True == 2`). |
| `NoneType` | `None` | "No value". Often used for missing or optional values. |

**Floating-point reality.** Floats are binary approximations:
```python
0.1 + 0.2 == 0.3              # False
import math
math.isclose(0.1 + 0.2, 0.3)  # True. Always compare floats with a tolerance.
```
This is why ML code compares losses with tolerances and why `float32` and `float64` give slightly different results.

**Truthiness.** `0`, `0.0`, `""`, `[]`, `{}` and `None` are all "falsy". Everything else is "truthy".

**Check yourself.** Why does `sum([True, False, True, True])` return `3`, and how is that useful for counting correct predictions?

---

## 6. Type Conversion and Type Checking

**How it works.**
```python
int("42")        # 42
float("3.5")     # 3.5
str(10)          # "10"
int(3.9)         # 3  (truncates toward zero, does not round)
round(3.5), round(2.5)   # (4, 2): banker's rounding to even
bool("False")    # True! Any non-empty string is truthy
```

**Checking types.**
```python
isinstance(3, int)              # True. Prefer this over type(x) == int
isinstance(True, int)           # True. bool is a subclass of int
isinstance(3.0, (int, float))   # accepts a tuple of types
```

**Type hints** document intent and let tools such as mypy and Pyright catch bugs. They are not enforced at runtime:
```python
def scale(values: list[float], factor: float = 1.0) -> list[float]:
    return [v * factor for v in values]
```

**Pitfalls.** `int("3.5")` raises `ValueError`. You need `int(float("3.5"))`. Reading CSV columns as strings and forgetting to convert is a classic data bug.

**Check yourself.** A form sends `"yes"` and `"no"`. Why is `bool(answer)` wrong, and what should you write instead?

---

## 7. Operators and Expressions

| Category | Operators | Notes |
|---|---|---|
| Arithmetic | `+ - * / // % **` | `/` always gives a float; `//` floors; `%` is remainder |
| Comparison | `== != < <= > >=` | Can be chained: `0 <= x < 10` |
| Logical | `and or not` | Short-circuit: `x and f(x)` skips `f` if `x` is falsy |
| Identity | `is`, `is not` | Same object? Use for `None`: `if x is None` |
| Membership | `in`, `not in` | `"a" in "cat"`, `3 in [1, 2, 3]` |
| Matrix multiply | `@` | Used by NumPy and PyTorch: `A @ B` |

**Precedence (high to low):** `**`, unary `-`, `* / // %`, `+ -`, comparisons, `not`, `and`, `or`. When in doubt, add parentheses.

```python
-7 // 2      # -4 (floors toward negative infinity)
-7 % 2       # 1
2 ** -1      # 0.5
```

**Check yourself.** Why should you write `if x is None` rather than `if x == None`, and why must you **not** use `is` to compare numbers or strings?

---

## 8. Conditional Statements: If, Else and Elif

```python
def risk_band(probability: float) -> str:
    if probability >= 0.8:
        return "high"
    elif probability >= 0.5:
        return "medium"
    else:
        return "low"
```

**How it works.** Python checks conditions from top to bottom and runs the **first** branch that is true. Order matters: if you put `>= 0.5` first, `0.9` would be labelled "medium".

**Conditional expression (ternary):** `label = "spam" if score > 0.5 else "ham"`

**`match` (3.10+)** for structural pattern matching:
```python
match command:
    case "train": run_training()
    case "eval":  run_eval()
    case _:       print("unknown command")
```

**Pitfalls.** Indentation *is* the syntax. Mixing tabs and spaces causes errors. Use 4 spaces.

**Check yourself.** Rewrite `risk_band` so that the order of the `if` branches doesn't matter.

---

## 9. Loops: For and While

**For loops iterate over any iterable** (list, string, range, file, dictionary):
```python
for epoch in range(1, 6):
    print(f"epoch {epoch}")

for i, name in enumerate(["a", "b"]):          # index and value
    ...
for x, y in zip(features, labels):              # walk two sequences together
    ...
for key, value in config.items():               # dictionary pairs
    ...
```

**While loops** run until a condition becomes false. They suit "repeat until converged":
```python
loss, step = 10.0, 0
while loss > 0.01 and step < 1000:   # always add a safety cap
    loss *= 0.9
    step += 1
```

**Control flow:** `break` exits the loop, `continue` skips to the next iteration, and `for ... else` runs the `else` only if the loop did not `break`.

**Pitfalls.**
- Modifying a list while iterating over it skips elements. Iterate over a copy or build a new list instead.
- Writing Python loops over large numeric data. Use NumPy instead (Module 02).

**Check yourself.** Write a loop that stops training early when the validation loss has not improved for 3 consecutive epochs.

---

## 10. Lists and List Operations

**In plain English.** A list is an **ordered, mutable** collection that can hold mixed types.

```python
scores = [88, 92, 79]
scores.append(95)            # add to the end, O(1)
scores.insert(0, 70)         # insert at a position, O(n)
scores.extend([60, 61])      # add many items
scores.pop()                 # remove and return the last item
scores.remove(79)            # remove the first matching value
scores.sort()                # in place
sorted(scores, reverse=True) # returns a new list
len(scores), max(scores), sum(scores) / len(scores)
```

**Slicing** with `list[start:stop:step]`. `stop` is exclusive:
```python
x = [0, 1, 2, 3, 4, 5]
x[1:4]   # [1, 2, 3]
x[-2:]   # [4, 5]
x[::-1]  # reversed copy
x[::2]   # [0, 2, 4]
```

**Copying.** `b = a` creates an alias. `b = a.copy()` or `a[:]` is a *shallow* copy. `copy.deepcopy(a)` copies nested lists as well.

**Pitfalls.** `[[0] * 3] * 3` creates three references to the *same* inner list. Use `[[0] * 3 for _ in range(3)]`.

**Check yourself.** Why is `x in my_list` slow for a list of 1 million items, and which data structure fixes it?

---

## 11. Tuples, Sets and Dictionaries

| Type | Ordered | Mutable | Duplicates | Lookup | Typical ML use |
|---|---|---|---|---|---|
| `tuple` | ✓ | ✗ | ✓ | O(n) | Shapes `(n_samples, n_features)`, returning several values |
| `set` | ✗ | ✓ | ✗ | O(1) avg | Unique labels, vocabulary, fast membership |
| `dict` | ✓ (insertion order) | ✓ | keys unique | O(1) avg | Configs, hyperparameters, label↔id maps |

```python
shape = (1000, 20)
n_samples, n_features = shape                  # tuple unpacking

labels = {"cat", "dog", "cat"}                 # {'cat', 'dog'}
train_ids & test_ids                           # intersection: detects data leakage!

params = {"lr": 0.01, "epochs": 10}
params.get("batch_size", 32)                   # default if missing
label_to_id = {lbl: i for i, lbl in enumerate(sorted(labels))}
id_to_label = {i: lbl for lbl, i in label_to_id.items()}
```

**How sets and dicts are fast.** They are **hash tables**. Keys are hashed to a slot, so lookup does not scan everything. Keys must be *hashable* (immutable): strings, numbers and tuples work; lists do not.

`collections` gives useful extras: `Counter` (class counts), `defaultdict`, `deque` and `namedtuple`.

**Check yourself.** How would you use a set to check, in one line, whether any customer ID appears in both the training and test sets?

---

## 12. String Manipulation and Formatting

```python
text = "  Machine Learning is FUN  "
text.strip().lower()                 # 'machine learning is fun'
text.split()                         # ['Machine', 'Learning', 'is', 'FUN']
"-".join(["a", "b", "c"])            # 'a-b-c'
"learning" in text.lower()           # True
text.replace("FUN", "powerful")
"report.csv".endswith(".csv")
```

**f-strings** are the modern way to format:
```python
acc, loss = 0.93456, 0.1234567
print(f"accuracy={acc:.2%}  loss={loss:.4f}  n={12000:,}")
# accuracy=93.46%  loss=0.1235  n=12,000
print(f"{'model':<10}|{'score':>8}")  # alignment for tables
print(f"{acc=}")                      # debugging: prints acc=0.93456
```

**Regular expressions** (`re`) for patterns:
```python
import re
re.findall(r"\d+", "order 12 of 345")  # ['12', '345']
```

**Pitfalls.** Strings are immutable. Building a big string with `+=` in a loop is quadratic. Collect the pieces in a list and `"".join()` them.

**Check yourself.** Write an f-string that prints `Epoch 03/10, loss 0.0421`.

---

## 13. List Comprehensions

**In plain English.** A compact way to build a list by transforming and/or filtering another iterable.

```python
squares = [x ** 2 for x in range(10)]
evens   = [x for x in range(20) if x % 2 == 0]
labels  = ["pos" if s > 0 else "neg" for s in scores]
flat    = [v for row in matrix for v in row]          # nested: outer loop first

# Dictionary and set comprehensions
word_len = {w: len(w) for w in words}
vocab    = {w.lower() for w in words}

# Generator expression: lazy, memory-efficient
total = sum(x ** 2 for x in range(10_000_000))
```

**When not to use them.** If the logic needs more than one `if` or nested conditions, a normal loop is clearer. Readability wins.

**Check yourself.** What is the memory difference between `sum([x*x for x in big])` and `sum(x*x for x in big)`?

---

## 14. Functions and Parameters

```python
def train(model, data, epochs: int = 10, *, lr: float = 1e-3, verbose: bool = False):
    """Train `model` on `data`. Returns the final loss."""
    ...
    return final_loss
```

**Parameter kinds.**
| Syntax | Meaning |
|---|---|
| `def f(a, b)` | Positional or keyword |
| `def f(a, b=2)` | Default value |
| `def f(*args)` | Any number of extra positional args (a tuple) |
| `def f(**kwargs)` | Any number of extra keyword args (a dict) |
| `def f(a, *, b)` | `b` is **keyword-only** (forces readable calls) |
| `def f(a, /, b)` | `a` is **positional-only** |

**The mutable default trap.**
```python
def add(item, bucket=[]):      # BUG: the same list is shared across calls
    bucket.append(item); return bucket

def add(item, bucket=None):    # FIX
    bucket = [] if bucket is None else bucket
    bucket.append(item); return bucket
```

**Good function design:** do one thing, have a descriptive name, take explicit inputs, return outputs rather than mutating globals, and include a docstring.

**Check yourself.** Why do scikit-learn functions such as `train_test_split(X, y, *, test_size=..., random_state=...)` make most arguments keyword-only?

---

## 15. Lambda Functions, Map and Filter

```python
square = lambda x: x ** 2                     # small anonymous function
list(map(square, [1, 2, 3]))                  # [1, 4, 9]
list(filter(lambda x: x > 0, [-1, 2, -3, 4])) # [2, 4]
sorted(models, key=lambda m: m["val_acc"], reverse=True)
from functools import reduce
reduce(lambda a, b: a * b, [1, 2, 3, 4])      # 24
```

**Where they appear in ML:** sort keys, `df["col"].apply(lambda v: ...)` in pandas, and simple transforms.

**Pitfall.** `map` and `filter` return lazy iterators in Python 3, so wrap them in `list()` to see the values. For anything non-trivial, a comprehension or a named function is clearer. `df.apply(lambda ...)` is also much slower than vectorised pandas operations.

**Check yourself.** Rewrite `list(map(lambda x: x*2, filter(lambda x: x>0, nums)))` as a comprehension.

---

## 16. Scope, Global and Local Variables

**LEGB rule.** Python looks up names in this order: **L**ocal → **E**nclosing function → **G**lobal (module) → **B**uilt-in.

```python
counter = 0
def increment():
    global counter      # needed to *rebind* a global
    counter += 1

def make_scaler(factor):
    def scale(x):       # closure: remembers `factor` from the enclosing scope
        return x * factor
    return scale

double = make_scaler(2); double(5)   # 10
```

`nonlocal` rebinds a variable in the enclosing function's scope.

**Pitfall.** Global mutable state makes ML experiments non-reproducible and hard to test. Pass configuration in explicitly.

**Check yourself.** Why does `x = 1; def f(): print(x); x = 2` raise `UnboundLocalError` when `f()` is called?

---

## 17. Exception Handling

```python
def load_config(path: str) -> dict:
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        logger.warning("No config at %s, using defaults", path)
        return {}
    except json.JSONDecodeError as e:
        raise ValueError(f"Config {path} is not valid JSON: {e}") from e
    finally:
        logger.debug("load_config finished")
```

| Clause | Runs when |
|---|---|
| `try` | Always (the risky code) |
| `except X` | An exception of type X occurs |
| `else` | No exception occurred |
| `finally` | Always, even after `return` (use it for cleanup) |

**Raising your own errors** to validate inputs early:
```python
if X.shape[0] != y.shape[0]:
    raise ValueError(f"X has {X.shape[0]} rows but y has {y.shape[0]}")
```

**Pitfalls.** A bare `except:` or `except Exception: pass` swallows real bugs, including `KeyboardInterrupt` in the bare case. Catch the specific exceptions you expect.

**Check yourself.** A batch prediction job hits one corrupt record out of a million. Should it crash? Design the exception handling.

---

## 18. File Handling: Reading and Writing Files

```python
from pathlib import Path

data_dir = Path("data")
data_dir.mkdir(exist_ok=True)

# Text, with a context manager so the file always closes
with open(data_dir / "notes.txt", "w", encoding="utf-8") as f:
    f.write("first line\n")

with open(data_dir / "notes.txt", encoding="utf-8") as f:
    for line in f:                       # streams line by line: memory-safe
        print(line.rstrip())

# JSON
import json
(data_dir / "config.json").write_text(json.dumps({"lr": 0.01}, indent=2))
cfg = json.loads((data_dir / "config.json").read_text())

# CSV (pandas is usually easier; see Module 02)
import csv
with open(data_dir / "rows.csv", newline="") as f:
    rows = list(csv.DictReader(f))
```

**Modes:** `r` read, `w` write (truncates!), `a` append, `x` create-only, and `b` for binary (images, pickles).

**Pitfalls.** Hard-coding absolute paths such as `/Users/me/...` breaks on every other machine. Use `pathlib` and paths relative to the project. Always specify `encoding="utf-8"`.

**Check yourself.** Why is `for line in f` preferable to `f.read().splitlines()` for a 20 GB log file?

---

## 19. Python Modules and Packages

- A **module** is a single `.py` file.
- A **package** is a directory of modules, traditionally with an `__init__.py`.

```
my_ml_project/
├── pyproject.toml
├── src/churn/
│   ├── __init__.py
│   ├── data.py          # load_data(), clean()
│   ├── features.py
│   └── train.py
└── tests/test_features.py
```

```python
from churn.data import load_data
import numpy as np                    # alias by convention
```

**`if __name__ == "__main__":`** runs code only when the file is executed directly, not when it is imported:
```python
def main(): ...
if __name__ == "__main__":
    main()
```

**Pitfalls.** Naming your own file `random.py`, `numpy.py` or `json.py` shadows the real library. Avoid `from module import *`, because it hides where names come from.

**Check yourself.** Why should notebook code that works be moved into a module before it is used in a training pipeline?

---

## 20. Object-Oriented Programming

**In plain English.** OOP bundles **data (attributes)** and **behaviour (methods)** into objects. ML libraries are built around this. A scikit-learn model is an object that stores learned parameters (`coef_`) and exposes behaviour (`fit`, `predict`).

**The four ideas.**
| Idea | Meaning | ML example |
|---|---|---|
| Encapsulation | Hide internal state behind methods | Model weights set only via `fit` |
| Abstraction | Expose a simple interface | `model.predict(X)` hides the maths |
| Inheritance | Reuse and specialise a parent class | `class MyNet(nn.Module)` |
| Polymorphism | Different classes, same interface | Any estimator works in a `Pipeline` |

**Check yourself.** Why can `cross_val_score` accept a `RandomForestClassifier`, a `LogisticRegression` or your own class without knowing which one it gets?

---

## 21. Classes, Objects, Inheritance and Encapsulation

```python
class StandardScaler:
    """Scales features to zero mean and unit variance."""

    def __init__(self, eps: float = 1e-12):
        self.eps = eps            # hyperparameter (set by the user)
        self.mean_ = None         # learned attributes end with _ (sklearn convention)
        self.std_ = None

    def fit(self, X):
        self.mean_ = X.mean(axis=0)
        self.std_ = X.std(axis=0)
        return self               # returning self enables chaining

    def transform(self, X):
        if self.mean_ is None:
            raise RuntimeError("Call fit() before transform()")
        return (X - self.mean_) / (self.std_ + self.eps)

    def fit_transform(self, X):
        return self.fit(X).transform(X)

    def __repr__(self):
        return f"StandardScaler(eps={self.eps})"


class RobustScaler(StandardScaler):          # inheritance
    def fit(self, X):                        # override
        import numpy as np
        self.mean_ = np.median(X, axis=0)
        q75, q25 = np.percentile(X, [75, 25], axis=0)
        self.std_ = q75 - q25
        return self
```

**Key mechanics.**
- `__init__` initialises a new object, and `self` is that instance.
- **Class attributes** are shared by all instances. **Instance attributes** (`self.x`) are per object.
- `super().__init__(...)` calls the parent's constructor.
- **Encapsulation in Python is by convention:** `_name` means "internal" and `__name` triggers name mangling. `@property` exposes computed, read-only attributes.
- `@dataclass` removes boilerplate for classes that mostly hold data:
  ```python
  from dataclasses import dataclass
  @dataclass
  class TrainConfig:
      lr: float = 1e-3
      epochs: int = 10
      batch_size: int = 32
  ```
- **Magic methods** (`__len__`, `__getitem__`, `__call__`, `__repr__`) make objects behave like built-ins. PyTorch `Dataset` relies on `__len__` and `__getitem__`.

**Pitfall.** Prefer **composition** ("has a") over deep inheritance trees ("is a"). A `Pipeline` *has* steps; it is not a subclass of each step.

**Check yourself.** Why does scikit-learn store learned values in attributes ending in `_` and set hyperparameters only in `__init__`?

---

## 22. Working with Virtual Environments and Pip

**In plain English.** A virtual environment is an isolated folder with its own Python and packages, so project A can use `pandas 1.5` while project B uses `pandas 2.2`.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install numpy pandas scikit-learn
pip freeze > requirements.txt        # pin exact versions
pip install -r requirements.txt      # recreate elsewhere
deactivate
```

**Modern options.**
| Tool | What it adds |
|---|---|
| `uv` | Very fast pip/venv replacement with a lockfile (`uv venv`, `uv pip install`, `uv sync`) |
| `poetry` / `pdm` | Dependency resolution plus packaging via `pyproject.toml` |
| `conda` / `mamba` | Also manages non-Python binaries (CUDA, MKL). Popular in data science |

**Pitfalls.**
- Committing `.venv/` to Git. Add it to `.gitignore` and commit the requirements file instead.
- Unpinned dependencies: "it worked last month" usually means an upgraded library changed behaviour.
- GPU wheels: PyTorch needs the CUDA-matched install command from pytorch.org.

**Check yourself.** What is the difference between `requirements.txt` produced by `pip freeze` and a hand-written list of top-level dependencies? When do you want each?

---

## 23. Writing Reusable and Maintainable Python Code

**Principles.**
1. **Small, pure functions.** Same input gives the same output, with no hidden side effects. They are easy to test.
2. **DRY (Don't Repeat Yourself).** If you copy and paste code twice, turn it into a function.
3. **Configuration over hard-coding.** Paths, hyperparameters and seeds belong in a config file or dataclass.
4. **Type hints and docstrings** on every public function.
5. **Logging instead of print** in anything that runs unattended:
   ```python
   import logging
   logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
   log = logging.getLogger(__name__)
   log.info("Loaded %d rows", len(df))
   ```
6. **Tests** with `pytest`:
   ```python
   # tests/test_features.py
   import numpy as np
   from churn.features import StandardScaler

   def test_scaler_zero_mean():
       X = np.array([[1.0], [2.0], [3.0]])
       Xs = StandardScaler().fit_transform(X)
       assert abs(Xs.mean()) < 1e-9
   ```
7. **Formatting and linting** with `ruff` (lint and format) or `black`, run automatically with `pre-commit`.
8. **Fail fast:** validate inputs at function boundaries with clear error messages.

**Check yourself.** Take a 200-line notebook cell that loads data, cleans it, trains and plots. List the functions you would extract and what each would return.

---

### Module 01 project idea
Build a command-line **gradebook analyser**. Read a CSV of students and scores, compute statistics with pure Python (no pandas yet), handle bad rows with exceptions, keep the logic in a `Gradebook` class inside a package, and add at least three `pytest` tests.
