/**
 * Machine Learning Engineer curriculum: Module 01: Python Programming Fundamentals.
 * Lessons adapted from content/notes/machine-learning-engineer/01-python-fundamentals.md.
 * Every code example's expectedOutput was produced by executing the code.
 */
import type { SeedLesson } from "../types";

export const mlePythonFundamentalsLessons: SeedLesson[] = [
  {
    "slug": "python-for-ml-setup-and-first-program",
    "module": "python-fundamentals-for-ml",
    "order": 1,
    "title": "Python for Machine Learning: Setup and Your First Program",
    "summary": "Why Python runs the machine learning world, how to set up a professional environment with VS Code and Jupyter, and how a Python program actually executes.",
    "difficulty": "beginner",
    "minutes": 20,
    "objectives": [
      "Explain why Python dominates machine learning even though pure Python is slow",
      "Set up Python, a virtual environment, VS Code and Jupyter",
      "Write, run and reason about a first Python program",
      "Choose between notebooks and .py files for a given task"
    ],
    "references": [
      {
        "title": "The Python Tutorial (official)",
        "url": "https://docs.python.org/3/tutorial/"
      },
      {
        "title": "VS Code: Python in Visual Studio Code",
        "url": "https://code.visualstudio.com/docs/languages/python"
      },
      {
        "title": "Project Jupyter documentation",
        "url": "https://docs.jupyter.org/en/latest/"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "Python is not the fastest language. A plain Python loop is roughly 50-100× slower than the same loop in C.\nYet almost every major machine learning system (from scikit-learn models to large language models) is built and trained with Python.\n**How can a slow language power the most compute-hungry software in the world?**"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Explain it simply",
          "markdown": "Python is a **general-purpose programming language designed to be easy to read**. In machine learning it plays the role of a *conductor*:\nyou write short, readable instructions in Python, and the heavy maths is carried out by highly optimised code written in C, C++, Fortran or CUDA underneath.\n\n- `numpy` runs array maths in compiled C.\n- `pytorch` sends matrix multiplications to the GPU.\n- `scikit-learn` wraps optimised numerical libraries.\n\nSo you get the **productivity of Python** and the **speed of compiled code** at the same time."
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "An orchestra conductor",
          "markdown": "The conductor (Python) doesn't play every note. They tell skilled musicians (C/CUDA libraries) what to play and when. The music is fast and precise because the musicians are experts.\n\n*Where it breaks down:* if the conductor tries to play every instrument personally (writing maths in pure Python loops), everything slows to a crawl. That is why ML code uses library calls instead of hand-written loops."
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "The Python ML ecosystem",
          "columns": [
            "Libraries",
            "You'll use it in"
          ],
          "rows": [
            {
              "label": "Data handling",
              "values": [
                "pandas, Polars",
                "Modules 02-03"
              ]
            },
            {
              "label": "Numerical maths",
              "values": [
                "NumPy, SciPy",
                "Modules 02, 04-07"
              ]
            },
            {
              "label": "Classical ML",
              "values": [
                "scikit-learn, XGBoost, LightGBM",
                "Modules 08-14"
              ]
            },
            {
              "label": "Deep learning",
              "values": [
                "PyTorch",
                "Modules 15-17"
              ]
            },
            {
              "label": "Visualisation",
              "values": [
                "Matplotlib, Seaborn",
                "Module 02"
              ]
            },
            {
              "label": "Serving and MLOps",
              "values": [
                "FastAPI, MLflow, DVC, Docker",
                "Modules 18-19"
              ]
            }
          ]
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Setting up a professional environment",
          "markdown": "1. **Install Python 3.11 or newer** from python.org (macOS: `brew install python`). Check it with `python3 --version`.\n2. **Install VS Code** and add Microsoft's *Python* and *Jupyter* extensions.\n3. **Create a project folder with its own virtual environment**, so each project has isolated packages:\n\n```bash\nmkdir ml-course && cd ml-course\npython3 -m venv .venv\nsource .venv/bin/activate        # Windows: .venv\\Scripts\\activate\npip install jupyter numpy pandas matplotlib scikit-learn\n```\n\n4. In VS Code, run **Python: Select Interpreter** and choose `.venv`.\n5. Open or create a `.ipynb` file for notebooks, or run `jupyter lab`."
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "Notebook or script?",
          "columns": [
            "Best for",
            "Watch out for"
          ],
          "rows": [
            {
              "label": "Jupyter notebook",
              "values": [
                "Exploration, EDA, charts, quick experiments",
                "Hidden state when cells run out of order"
              ]
            },
            {
              "label": ".py scripts and modules",
              "values": [
                "Reusable code, training pipelines, APIs, anything deployed",
                "Slower feedback loop for exploration"
              ]
            },
            {
              "label": "Terminal / REPL",
              "values": [
                "One-off checks, installing packages",
                "Nothing is saved"
              ]
            }
          ]
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Technical deep dive: how Python runs your code",
          "markdown": "When you run `python hello.py`, the **CPython interpreter**:\n\n1. Reads the source file from top to bottom.\n2. Compiles it to **bytecode**, a compact set of low-level instructions (cached in `__pycache__/`).\n3. Executes the bytecode in a virtual machine, one instruction at a time.\n\nPython is **dynamically typed**: the type of every value is checked while the program runs. That flexibility is why pure Python loops are slow, because every `+` must first check what kind of objects it is adding. Libraries like NumPy avoid this by storing many numbers of *one* type in a block of memory and looping in C."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Your first program",
          "language": "python",
          "code": "name = \"Ada\"\nhours = 7.5\nminutes = hours * 60\nprint(\"Hello, Machine Learning!\")\nprint(f\"{name} studied for {minutes:.0f} minutes this week.\")",
          "explanation": "`print` writes to the screen. The `f` before the quotes makes an **f-string**: anything inside `{}` is evaluated and inserted, and `:.0f` formats the number with zero decimal places.",
          "expectedOutput": "Hello, Machine Learning!\nAda studied for 450 minutes this week."
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "warning",
          "title": "The hidden-state trap in notebooks",
          "markdown": "Jupyter remembers every variable from every cell you've run, **in the order you ran them**, not the order they appear. A notebook can work for you and fail for a colleague.\nBefore trusting a result, use **Restart Kernel and Run All**."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Predict before you run",
          "task": "Without running it, predict what this program prints. Then run it and check.\n\n```python\nscore = input(\"Score: \")      # imagine you type 40\nprint(score * 2)\n```",
          "hints": [
            "What type of value does `input()` always return?",
            "What does `*` do to a string?"
          ],
          "solution": "It prints **`4040`**, not `80`.\n\n`input()` always returns a **string**, and multiplying a string by 2 repeats it. To do arithmetic, convert first:\n\n```python\nscore = float(input(\"Score: \"))\nprint(score * 2)   # 80.0\n```"
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "ML engineering teams work in exactly this split: **notebooks for exploration**, and **Python packages for anything that gets reused or deployed**.\nA churn model might be explored in a notebook, but its data cleaning, training and prediction code end up in `.py` files that are tested and run automatically on a schedule."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "Python is the readable 'glue' language; the heavy maths runs in compiled C/CUDA libraries.",
            "Use a virtual environment per project, and select it as your VS Code interpreter.",
            "Notebooks are for exploration; .py files are for reusable and deployed code.",
            "`input()` returns a string, so convert it before doing arithmetic.",
            "Restart and run all before trusting a notebook result."
          ],
          "terms": [
            {
              "term": "Interpreter",
              "definition": "The program (CPython) that reads and executes Python code."
            },
            {
              "term": "Bytecode",
              "definition": "The low-level instructions Python compiles your source into before running it."
            },
            {
              "term": "Virtual environment",
              "definition": "An isolated folder containing a project's own Python packages."
            },
            {
              "term": "Jupyter notebook",
              "definition": "An interactive document mixing code cells, output, charts and text."
            }
          ],
          "misconceptions": [
            "“Python is slow, so ML in Python is slow.” The heavy computation runs in optimised compiled libraries.",
            "“Notebooks run top to bottom.” They run in whatever order you execute the cells."
          ]
        }
      }
    ],
    "quiz": {
      "title": "Python and your setup",
      "questions": [
        {
          "type": "single",
          "prompt": "Why can Python-based ML training run at near-hardware speed?",
          "options": [
            "Python is compiled to machine code before running",
            "The heavy maths runs inside optimised C/C++/CUDA libraries",
            "Machine learning doesn't need much computation",
            "Python automatically uses the GPU for every loop"
          ],
          "answer": [
            1
          ],
          "explanation": "Python orchestrates; libraries such as NumPy and PyTorch execute the maths in compiled code."
        },
        {
          "type": "single",
          "prompt": "A notebook works on your machine but raises NameError for a colleague. What's the most likely cause?",
          "options": [
            "Their Python version is too new",
            "You ran cells out of order, so a variable existed only in your session",
            "Jupyter doesn't support variables",
            "The file is corrupted"
          ],
          "answer": [
            1
          ],
          "explanation": "Hidden notebook state is the classic cause. Restart and run all to reproduce what others will see."
        },
        {
          "type": "single",
          "prompt": "Where should the data-cleaning code for a model that runs every night in production live?",
          "options": [
            "In a notebook that someone runs manually",
            "In a tested .py module",
            "In a spreadsheet macro",
            "In a Markdown cell"
          ],
          "answer": [
            1
          ],
          "explanation": "Reusable, scheduled code belongs in modules that can be imported, tested and versioned."
        },
        {
          "type": "true_false",
          "prompt": "`input()` returns an integer when the user types a number.",
          "answer": [
            1
          ],
          "explanation": "`input()` always returns a string. Convert it with int() or float()."
        }
      ]
    }
  },
  {
    "slug": "python-for-ml-variables-types-operators",
    "module": "python-fundamentals-for-ml",
    "order": 2,
    "title": "Variables, Data Types and Operators",
    "summary": "How Python names values, the core data types ML code relies on, converting between types safely, and the operators you will use in every model.",
    "difficulty": "beginner",
    "minutes": 30,
    "prerequisites": [
      "python-for-ml-setup-and-first-program"
    ],
    "objectives": [
      "Explain that variables are names pointing to values, and why that matters for lists",
      "Use int, float, str, bool and None correctly, including float precision issues",
      "Convert and check types safely, and add type hints",
      "Apply arithmetic, comparison, logical, identity and membership operators"
    ],
    "references": [
      {
        "title": "Python docs: Built-in Types",
        "url": "https://docs.python.org/3/library/stdtypes.html"
      },
      {
        "title": "PEP 8: Style Guide for Python Code",
        "url": "https://peps.python.org/pep-0008/"
      },
      {
        "title": "Python docs: Floating-point arithmetic: issues and limitations",
        "url": "https://docs.python.org/3/tutorial/floatingpoint.html"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "Try this in Python: `0.1 + 0.2 == 0.3`. It prints **False**.\nAnd if you write `b = a` for a list and then change `b`, **`a` changes too**.\nTo write correct ML code, you need an accurate mental model of what a variable *is* and how values are stored."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Explain it simply: variables are labels",
          "markdown": "A variable is a **name that points to a value**. `learning_rate = 0.01` creates the value `0.01` and attaches the label `learning_rate` to it.\n\nAssigning one variable to another (`b = a`) attaches a *second label to the same value*. For numbers and strings you rarely notice, because they can't be changed in place. For **lists, dictionaries and arrays** you will notice, because changing the object through one name is visible through every other name."
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "Sticky labels on objects",
          "markdown": "Picture each value as an object on a desk and each variable as a sticky label. `b = a` doesn't photocopy the object; it sticks a second label on the same object.\n\n*Where it breaks down:* real labels can't be on two objects, but Python lets many names share one object. That sharing is exactly what causes surprises with lists."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Names, not boxes",
          "language": "python",
          "code": "a = [1, 2, 3]\nb = a            # same list, second name\nb.append(4)\nprint(\"a:\", a)\nprint(\"same object?\", a is b)\n\nc = a.copy()     # a genuinely separate list\nc.append(99)\nprint(\"a after changing c:\", a)",
          "explanation": "`is` checks whether two names point to the **same object**. `.copy()` creates a new list, so changes to `c` don't affect `a`.",
          "expectedOutput": "a: [1, 2, 3, 4]\nsame object? True\na after changing c: [1, 2, 3, 4]"
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "Naming conventions (PEP 8)",
          "columns": [
            "Style",
            "Example"
          ],
          "rows": [
            {
              "label": "Variables and functions",
              "values": [
                "snake_case",
                "train_loss, load_data()"
              ]
            },
            {
              "label": "Constants",
              "values": [
                "UPPER_SNAKE_CASE",
                "RANDOM_SEED = 42"
              ]
            },
            {
              "label": "Classes",
              "values": [
                "PascalCase",
                "LinearModel"
              ]
            },
            {
              "label": "Internal / private",
              "values": [
                "leading underscore",
                "_cache"
              ]
            },
            {
              "label": "ML convention",
              "values": [
                "X for features, y for target",
                "X_train, y_train"
              ]
            }
          ]
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "The core data types",
          "columns": [
            "Example",
            "Notes for ML work"
          ],
          "rows": [
            {
              "label": "int",
              "values": [
                "42, -7, 10**100",
                "Arbitrary precision, so no overflow in pure Python. Used for counts and class labels"
              ]
            },
            {
              "label": "float",
              "values": [
                "3.14, 1e-3",
                "64-bit, about 15-16 significant digits. Losses, probabilities, learning rates"
              ]
            },
            {
              "label": "str",
              "values": [
                "\"spam\"",
                "Immutable text. Labels, file paths, prompts"
              ]
            },
            {
              "label": "bool",
              "values": [
                "True, False",
                "A subclass of int: True + True == 2. Masks and flags"
              ]
            },
            {
              "label": "None",
              "values": [
                "None",
                "\"No value\". Optional or missing settings"
              ]
            }
          ]
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Floats are approximations",
          "language": "python",
          "code": "import math\n\nprint(0.1 + 0.2)\nprint(0.1 + 0.2 == 0.3)\nprint(math.isclose(0.1 + 0.2, 0.3))\n\ncorrect = [True, False, True, True]\nprint(\"correct predictions:\", sum(correct))",
          "explanation": "Floats are stored in binary, so most decimals can't be represented exactly. **Compare floats with a tolerance** (`math.isclose`), never `==`. Because `bool` is a kind of `int`, `sum()` over booleans counts the `True` values, a handy way to count correct predictions.",
          "expectedOutput": "0.30000000000000004\nFalse\nTrue\ncorrect predictions: 3"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Converting and checking types",
          "markdown": "| Expression | Result | Why |\n|---|---|---|\n| `int(\"42\")` | `42` | Parses the text |\n| `int(3.9)` | `3` | Truncates toward zero; it does **not** round |\n| `round(2.5)` | `2` | \"Banker's rounding\" rounds halves to the even number |\n| `int(\"3.5\")` | `ValueError` | Use `int(float(\"3.5\"))` |\n| `bool(\"False\")` | `True` | Any non-empty string is truthy |\n\nCheck types with `isinstance(x, (int, float))` rather than `type(x) == int`.\n\n**Type hints** document intent and let tools such as mypy, Pyright and VS Code catch bugs before you run anything. They are *not* enforced at runtime:\n\n```python\ndef scale(values: list[float], factor: float = 1.0) -> list[float]:\n    return [v * factor for v in values]\n```"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Technical deep dive: operators",
          "markdown": "| Category | Operators | Notes |\n|---|---|---|\n| Arithmetic | `+ - * / // % **` | `/` always returns a float; `//` floors; `%` is the remainder |\n| Comparison | `== != < <= > >=` | Can be chained: `0 <= p < 1` |\n| Logical | `and or not` | Short-circuit: in `x and f(x)`, `f` isn't called when `x` is falsy |\n| Identity | `is`, `is not` | Same object? Use for `None`: `if x is None` |\n| Membership | `in`, `not in` | `\"cat\" in labels` |\n| Matrix multiply | `@` | Used by NumPy and PyTorch: `X @ W` |\n\n**Precedence, highest first:** `**`, unary `-`, `* / // %`, `+ -`, comparisons, `not`, `and`, `or`. When in doubt, add parentheses."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Operators you will meet constantly",
          "language": "python",
          "code": "print(7 / 2, 7 // 2, 7 % 2, 2 ** 10)\nprint(-7 // 2)                     # floors toward negative infinity\np = 0.73\nprint(0.5 <= p < 1.0)              # chained comparison\nthreshold = None\nprint(threshold is None)\nprint(\"spam\" in [\"ham\", \"spam\"])",
          "explanation": "Note `-7 // 2` is `-4`, not `-3`: floor division always rounds **down**. Use `is` only for `None` (and other singletons). Comparing numbers or strings with `is` gives unreliable results.",
          "expectedOutput": "3.5 3 1 1024\n-4\nTrue\nTrue\nTrue"
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "misconception",
          "title": "Truthiness",
          "markdown": "`0`, `0.0`, `\"\"`, `[]`, `{}` and `None` are all **falsy**; nearly everything else is truthy.\nSo `if accuracy:` is **False when accuracy is exactly 0.0**. When zero is a legitimate value, write `if accuracy is not None:` instead."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Model report card",
          "task": "You have `correct = 912` and `total = 1000` predictions.\n\n1. Compute the accuracy as a float.\n2. Print exactly: `spam-filter: 912/1000 correct (91.2%)`\n3. A form sends the string `\"no\"` for \"use GPU?\". Why is `bool(answer)` wrong, and what should you write?",
          "hints": [
            "`/` always returns a float.",
            "Inside an f-string, `{value:.1%}` formats a fraction as a percentage with one decimal place.",
            "Which strings are falsy?"
          ],
          "solution": "```python\ncorrect, total = 912, 1000\naccuracy = correct / total\nprint(f\"spam-filter: {correct}/{total} correct ({accuracy:.1%})\")\n```\n\n`bool(\"no\")` is `True`, because any non-empty string is truthy. Compare the text explicitly:\n\n```python\nuse_gpu = answer.strip().lower() in {\"yes\", \"y\", \"true\", \"1\"}\n```"
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "These details cause real ML bugs:\n\n- Comparing a validation loss with `==` instead of a tolerance makes early stopping behave unpredictably.\n- A CSV column of IDs like `\"00123\"` silently becomes the integer `123` and stops matching other tables.\n- Two variables pointing at one config dictionary mean one experiment quietly changes the next experiment's settings."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "Variables are names pointing to values; `b = a` shares the object, `.copy()` duplicates it.",
            "Floats are binary approximations, so compare them with `math.isclose`.",
            "`int()` truncates, `round()` rounds halves to even, and `bool(\"False\")` is True.",
            "`/` always gives a float, and `//` floors toward negative infinity.",
            "Use `is` only for `None`; use `==` for values."
          ],
          "terms": [
            {
              "term": "Variable",
              "definition": "A name bound to a value."
            },
            {
              "term": "Mutable",
              "definition": "Can be changed in place (list, dict). Immutable values (int, str, tuple) cannot."
            },
            {
              "term": "Type hint",
              "definition": "An annotation such as `x: float` documenting the expected type; not enforced at runtime."
            },
            {
              "term": "Truthy / falsy",
              "definition": "How a value behaves in an `if` statement or a `bool()` conversion."
            }
          ],
          "misconceptions": [
            "“`b = a` copies the list.” It creates a second name for the same list.",
            "“`0.1 + 0.2 == 0.3` is True.” Floating-point rounding makes it False."
          ]
        }
      }
    ],
    "quiz": {
      "title": "Variables, types and operators",
      "questions": [
        {
          "type": "single",
          "prompt": "After `a = [1, 2]; b = a; b.append(3)`, what is `a`?",
          "options": [
            "[1, 2]",
            "[1, 2, 3]",
            "[3]",
            "An error"
          ],
          "answer": [
            1
          ],
          "explanation": "`b` and `a` are two names for the same list, so appending through `b` changes what `a` shows."
        },
        {
          "type": "single",
          "prompt": "What does `int(3.9)` return?",
          "options": [
            "4",
            "3",
            "3.9",
            "ValueError"
          ],
          "answer": [
            1
          ],
          "explanation": "`int()` truncates toward zero. Use `round()` if you want rounding."
        },
        {
          "type": "single",
          "prompt": "What is the result of `7 // 2` and `7 / 2`?",
          "options": [
            "3 and 3",
            "3 and 3.5",
            "3.5 and 3.5",
            "4 and 3.5"
          ],
          "answer": [
            1
          ],
          "explanation": "`//` is floor division; `/` is true division and always returns a float."
        },
        {
          "type": "multiple",
          "prompt": "Which are falsy in Python? (Choose all that apply.)",
          "options": [
            "0.0",
            "\"False\"",
            "[]",
            "None"
          ],
          "answer": [
            0,
            2,
            3
          ],
          "explanation": "`\"False\"` is a non-empty string, so it is truthy."
        },
        {
          "type": "true_false",
          "prompt": "You should compare two floating-point losses with `==` to check whether training has converged.",
          "answer": [
            1
          ],
          "explanation": "Use a tolerance, e.g. `math.isclose(a, b, rel_tol=1e-6)` or `abs(a - b) < tol`."
        }
      ]
    }
  },
  {
    "slug": "python-for-ml-control-flow",
    "module": "python-fundamentals-for-ml",
    "order": 3,
    "title": "Control Flow: Conditions and Loops",
    "summary": "Make decisions with if/elif/else and match, repeat work with for and while loops, and write the early-stopping logic used in model training.",
    "difficulty": "beginner",
    "minutes": 25,
    "prerequisites": [
      "python-for-ml-variables-types-operators"
    ],
    "objectives": [
      "Write if/elif/else chains whose order is correct",
      "Iterate with for, range, enumerate, zip and dictionary items",
      "Use while loops with a safety cap, plus break, continue and for-else",
      "Implement early stopping as a loop"
    ],
    "references": [
      {
        "title": "Python docs: More Control Flow Tools",
        "url": "https://docs.python.org/3/tutorial/controlflow.html"
      },
      {
        "title": "PEP 636: Structural Pattern Matching tutorial",
        "url": "https://peps.python.org/pep-0636/"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "Training a model is a loop: predict, measure the error, adjust, repeat. But **when should the loop stop?**\nStop too early and the model underfits; too late and it overfits and wastes compute. Answering that takes conditions *and* loops working together."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Explain it simply",
          "markdown": "- **Conditions** (`if`, `elif`, `else`) let a program choose between paths.\n- **Loops** repeat work: `for` goes through each item in a collection; `while` repeats *as long as* a condition holds.\n\nPython uses **indentation** (4 spaces) to show which lines belong to a condition or loop. Indentation is the syntax, not decoration."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Order matters in if/elif chains",
          "language": "python",
          "code": "def risk_band(probability: float) -> str:\n    if probability >= 0.8:\n        return \"high\"\n    elif probability >= 0.5:\n        return \"medium\"\n    else:\n        return \"low\"\n\nfor p in [0.95, 0.6, 0.1]:\n    print(p, \"->\", risk_band(p))",
          "explanation": "Python runs the **first** branch whose condition is true. If `>= 0.5` came first, 0.95 would wrongly be labelled \"medium\". Put the most specific or strictest condition first.",
          "expectedOutput": "0.95 -> high\n0.6 -> medium\n0.1 -> low"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Compact conditions and pattern matching",
          "markdown": "A **conditional expression** fits on one line:\n\n```python\nlabel = \"spam\" if score > 0.5 else \"ham\"\n```\n\n**`match`** (Python 3.10+) is cleaner than long `elif` chains when you are dispatching on a value:\n\n```python\nmatch command:\n    case \"train\":\n        run_training()\n    case \"eval\" | \"evaluate\":\n        run_eval()\n    case _:\n        print(\"unknown command\")\n```"
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "The for-loop toolkit",
          "language": "python",
          "code": "features = [\"age\", \"income\", \"tenure\"]\nweights = [0.4, 1.2, -0.7]\n\nfor i, name in enumerate(features, start=1):\n    print(i, name)\n\nfor name, w in zip(features, weights):\n    print(f\"{name:>7}: {w:+.1f}\")\n\nconfig = {\"lr\": 0.01, \"epochs\": 5}\nfor key, value in config.items():\n    print(key, \"=\", value)",
          "explanation": "`enumerate` gives you a counter alongside each item; `zip` walks several sequences in step; `.items()` gives key-value pairs from a dictionary. These replace error-prone index juggling like `features[i]`.",
          "expectedOutput": "1 age\n2 income\n3 tenure\n    age: +0.4\n income: +1.2\n tenure: -0.7\nlr = 0.01\nepochs = 5"
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "Checking pages of a book",
          "markdown": "A `for` loop is reading every page of a book in order. A `while` loop is reading *until* you find the answer, which could be page 3 or never.\n\n*Where it breaks down:* a real reader eventually gives up. A `while` loop whose condition never becomes false runs forever, so always add a safety cap."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Early stopping with a while loop",
          "language": "python",
          "code": "val_losses = [0.90, 0.71, 0.62, 0.60, 0.61, 0.63, 0.64, 0.59]\nbest, patience, bad, epoch = float(\"inf\"), 3, 0, 0\n\nwhile epoch < len(val_losses):           # safety cap\n    loss = val_losses[epoch]\n    if loss < best - 1e-4:\n        best, bad = loss, 0\n    else:\n        bad += 1\n        if bad >= patience:\n            print(f\"stopping at epoch {epoch}, best loss {best}\")\n            break\n    epoch += 1",
          "explanation": "This is the logic behind every deep learning framework's early stopping: track the best validation loss, count epochs without improvement, and `break` when patience runs out. The small tolerance `1e-4` avoids treating tiny float noise as improvement.",
          "expectedOutput": "stopping at epoch 6, best loss 0.6"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Technical deep dive: break, continue and for-else",
          "markdown": "| Statement | Effect |\n|---|---|\n| `break` | Exit the loop immediately |\n| `continue` | Skip to the next iteration |\n| `for … else` | The `else` block runs **only if the loop did not `break`**. Useful for \"search, and report if not found\" |\n| `pass` | Do nothing (a placeholder) |\n\n**Two loop pitfalls:**\n1. **Modifying a list while iterating over it** skips elements. Build a new list instead: `kept = [x for x in rows if valid(x)]`.\n2. **Looping over large numeric data in pure Python** is slow. In Module 02 you'll replace these loops with vectorised NumPy operations that are around 100× faster."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Find the first good learning rate",
          "task": "Given `results = {0.1: 0.42, 0.03: 0.31, 0.01: 0.29, 0.003: 0.35}` (learning rate → validation loss), write a loop that:\n\n1. Prints the first learning rate whose loss is below 0.30, then stops searching.\n2. Prints `\"none found\"` if no learning rate qualifies, using `for … else`.",
          "hints": [
            "Iterate over `results.items()`.",
            "Put `break` inside the `if`, and the \"none found\" print in the loop's `else`."
          ],
          "solution": "```python\nresults = {0.1: 0.42, 0.03: 0.31, 0.01: 0.29, 0.003: 0.35}\nfor lr, loss in results.items():\n    if loss < 0.30:\n        print(\"first good learning rate:\", lr)   # 0.01\n        break\nelse:\n    print(\"none found\")\n```"
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "Every training script is built from these pieces: a `for epoch in range(...)` loop, an inner `for batch in loader` loop, `if` statements for logging, checkpointing and learning-rate changes, and an early-stopping `break`.\nGetting the order of conditions right is just as important in production code. A fraud rule checked in the wrong order can let a high-risk transaction through."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "if/elif/else runs only the first true branch, so order conditions from strictest to loosest.",
            "Use enumerate, zip and .items() instead of manual indexing.",
            "while loops need a guaranteed exit, such as a maximum number of iterations.",
            "break exits a loop; continue skips one iteration; for-else runs only when the loop didn't break.",
            "Early stopping = track the best score, count bad epochs, break when patience runs out."
          ],
          "terms": [
            {
              "term": "Iterable",
              "definition": "Anything a for loop can walk through: lists, strings, ranges, dicts, files."
            },
            {
              "term": "Early stopping",
              "definition": "Ending training when validation performance stops improving."
            },
            {
              "term": "Patience",
              "definition": "How many non-improving epochs to tolerate before stopping."
            }
          ],
          "misconceptions": [
            "“The else on a for loop runs when the loop condition is false.” It runs only when the loop finishes without `break`."
          ]
        }
      }
    ],
    "quiz": {
      "title": "Conditions and loops",
      "questions": [
        {
          "type": "single",
          "prompt": "With `if p >= 0.5: 'medium' elif p >= 0.8: 'high'`, what label does p = 0.9 get?",
          "options": [
            "high",
            "medium",
            "Both",
            "An error"
          ],
          "answer": [
            1
          ],
          "explanation": "The first true condition wins; 0.9 >= 0.5 is checked first, so 'high' is unreachable."
        },
        {
          "type": "single",
          "prompt": "Which tool walks two lists in step, pairing their items?",
          "options": [
            "enumerate",
            "zip",
            "range",
            "items"
          ],
          "answer": [
            1
          ],
          "explanation": "zip(a, b) yields (a[0], b[0]), (a[1], b[1]), …"
        },
        {
          "type": "single",
          "prompt": "When does the `else` block of a `for` loop run?",
          "options": [
            "Always",
            "When the loop body raises an error",
            "When the loop finishes without hitting break",
            "Never; it's a syntax error"
          ],
          "answer": [
            2
          ],
          "explanation": "for-else is designed for searches: else handles the 'not found' case."
        },
        {
          "type": "true_false",
          "prompt": "A while loop whose condition depends on a converging loss should also have a maximum-iteration cap.",
          "answer": [
            0
          ],
          "explanation": "The loss may never meet the condition (for example if training diverges), so a cap guarantees termination."
        }
      ]
    }
  },
  {
    "slug": "python-for-ml-data-structures-and-strings",
    "module": "python-fundamentals-for-ml",
    "order": 4,
    "title": "Lists, Tuples, Sets, Dictionaries and Strings",
    "summary": "The built-in data structures behind every ML script, when each is the right choice, string formatting, and concise comprehensions.",
    "difficulty": "beginner",
    "minutes": 35,
    "prerequisites": [
      "python-for-ml-control-flow"
    ],
    "objectives": [
      "Choose between list, tuple, set and dict based on order, mutability and lookup speed",
      "Slice, sort and copy lists without aliasing bugs",
      "Clean and format strings with methods and f-strings",
      "Write list, dict and set comprehensions and generator expressions"
    ],
    "references": [
      {
        "title": "Python docs: Data Structures",
        "url": "https://docs.python.org/3/tutorial/datastructures.html"
      },
      {
        "title": "Python docs: Format Specification Mini-Language",
        "url": "https://docs.python.org/3/library/string.html#format-specification-mini-language"
      },
      {
        "title": "Python docs: collections module",
        "url": "https://docs.python.org/3/library/collections.html"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "You have 1 million customer IDs in your training set and 200,000 in your test set. **Does any customer appear in both?** (If so, your evaluation is leaking.)\nWith a list, the check takes minutes; with a set, a fraction of a second. Choosing the right data structure is a performance decision *and* a correctness decision."
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "Choosing a data structure",
          "columns": [
            "Ordered",
            "Mutable",
            "Duplicates",
            "Lookup by value",
            "Typical ML use"
          ],
          "rows": [
            {
              "label": "list",
              "values": [
                "Yes",
                "Yes",
                "Yes",
                "Slow (scans everything)",
                "Batches of records, loss history"
              ]
            },
            {
              "label": "tuple",
              "values": [
                "Yes",
                "No",
                "Yes",
                "Slow",
                "Shapes (1000, 20), returning several values"
              ]
            },
            {
              "label": "set",
              "values": [
                "No",
                "Yes",
                "No",
                "Fast (hashing)",
                "Unique labels, vocabulary, leakage checks"
              ]
            },
            {
              "label": "dict",
              "values": [
                "Yes (insertion)",
                "Yes",
                "Unique keys",
                "Fast by key",
                "Configs, hyperparameters, label ↔ id maps"
              ]
            }
          ]
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Lists: slicing, sorting and copying",
          "language": "python",
          "code": "scores = [88, 92, 79, 95, 61]\nprint(scores[1:4], scores[-2:], scores[::-1])\nprint(sorted(scores, reverse=True))\nscores.append(70)\nprint(len(scores), max(scores), sum(scores) / len(scores))\n\ngrid_bad = [[0] * 3] * 3            # three references to ONE inner list\ngrid_bad[0][0] = 1\nprint(grid_bad)\ngrid_ok = [[0] * 3 for _ in range(3)]\ngrid_ok[0][0] = 1\nprint(grid_ok)",
          "explanation": "Slices are `[start:stop:step]` with `stop` excluded. `sorted()` returns a new list; `.sort()` sorts in place. The `[[0] * 3] * 3` trap repeats the *same* inner list three times; the comprehension builds three separate lists.",
          "expectedOutput": "[92, 79, 95] [95, 61] [61, 95, 79, 92, 88]\n[95, 92, 88, 79, 61]\n6 95 80.83333333333333\n[[1, 0, 0], [1, 0, 0], [1, 0, 0]]\n[[1, 0, 0], [0, 0, 0], [0, 0, 0]]"
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Tuples, sets and dictionaries in practice",
          "language": "python",
          "code": "from collections import Counter\n\nshape = (1000, 20)\nn_samples, n_features = shape                     # tuple unpacking\nprint(n_samples, n_features)\n\ntrain_ids = {\"c1\", \"c2\", \"c3\", \"c4\"}\ntest_ids = {\"c4\", \"c5\"}\nprint(\"leaked into test:\", train_ids & test_ids)  # set intersection\n\nlabels = [\"cat\", \"dog\", \"cat\", \"bird\", \"cat\"]\nlabel_to_id = {lbl: i for i, lbl in enumerate(sorted(set(labels)))}\nprint(label_to_id)\nprint(Counter(labels).most_common(2))\n\nparams = {\"lr\": 0.01, \"epochs\": 10}\nprint(params.get(\"batch_size\", 32))               # default when the key is missing",
          "explanation": "Sets and dictionaries are **hash tables**: Python hashes the key to find its slot directly instead of scanning. Keys must be hashable (immutable), so strings, numbers and tuples work but lists don't. `Counter` counts class frequencies in one line.",
          "expectedOutput": "1000 20\nleaked into test: {'c4'}\n{'bird': 0, 'cat': 1, 'dog': 2}\n[('cat', 3), ('dog', 1)]\n32"
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "A library index versus a pile of books",
          "markdown": "Finding a book in an unsorted pile (a list) means checking every book. A library index (a set or dictionary) tells you exactly which shelf to go to.\n\n*Where it breaks down:* an index needs each book to have a fixed, unique catalogue number. That's why set and dict keys must be immutable."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Strings: cleaning and formatting",
          "markdown": "Strings are **immutable** sequences of Unicode characters. Methods return *new* strings:\n\n```python\ntext = \"  Machine Learning is FUN  \"\ntext.strip().lower()        # 'machine learning is fun'\ntext.split()                # ['Machine', 'Learning', 'is', 'FUN']\n\"-\".join([\"a\", \"b\", \"c\"])   # 'a-b-c'\n\"report.csv\".endswith(\".csv\")\n```\n\n**f-string format specifications** you'll use constantly:\n\n| Spec | Example | Output |\n|---|---|---|\n| `.4f` | `f\"{0.1234567:.4f}\"` | `0.1235` |\n| `.2%` | `f\"{0.93456:.2%}\"` | `93.46%` |\n| `,` | `f\"{12000:,}\"` | `12,000` |\n| `<10` / `>8` | alignment | tables in logs |\n| `=` | `f\"{acc=}\"` | `acc=0.93` (debugging) |\n\nBuilding a long string with `+=` in a loop is slow; collect the pieces in a list and `\"\".join()` them."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Comprehensions",
          "language": "python",
          "code": "nums = [-3, 1, 4, -1, 5]\nsquares = [x ** 2 for x in nums]\npositives = [x for x in nums if x > 0]\nsigns = [\"pos\" if x > 0 else \"neg\" for x in nums]\nmatrix = [[1, 2], [3, 4]]\nflat = [v for row in matrix for v in row]\nword_len = {w: len(w) for w in [\"model\", \"data\", \"loss\"]}\n\nprint(squares, positives, signs, flat, word_len, sep=\"\\n\")\nprint(sum(x * x for x in range(1_000_000)))   # generator: no big list in memory",
          "explanation": "A comprehension builds a collection by transforming and/or filtering another. With nested loops, the **outer loop comes first**, just as in ordinary `for` loops. A **generator expression** (parentheses instead of brackets) produces values lazily, so summing a million squares never stores a million-item list.",
          "expectedOutput": "[9, 1, 16, 1, 25]\n[1, 4, 5]\n['neg', 'pos', 'pos', 'neg', 'pos']\n[1, 2, 3, 4]\n{'model': 5, 'data': 4, 'loss': 4}\n333332833333500000"
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "tip",
          "title": "When not to use a comprehension",
          "markdown": "If the logic needs several conditions, nested branches or side effects (printing, writing files), a normal `for` loop is clearer. Readability beats cleverness."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Clean a messy label column",
          "task": "Raw labels from a survey: `raw = [\" Yes\", \"no \", \"YES\", \"N/A\", \"No\", \"yes\"]`\n\n1. Normalise each label (strip spaces, lower-case).\n2. Drop `\"n/a\"`.\n3. Map `\"yes\"` → 1 and `\"no\"` → 0 in a list called `y`.\n4. Print the class balance with `Counter`.",
          "hints": [
            "Chain `.strip().lower()`.",
            "A dictionary `{\"yes\": 1, \"no\": 0}` makes the mapping explicit."
          ],
          "solution": "```python\nfrom collections import Counter\nraw = [\" Yes\", \"no \", \"YES\", \"N/A\", \"No\", \"yes\"]\nmapping = {\"yes\": 1, \"no\": 0}\nclean = [r.strip().lower() for r in raw]\ny = [mapping[c] for c in clean if c != \"n/a\"]\nprint(y)            # [1, 0, 1, 0, 1]\nprint(Counter(y))   # Counter({1: 3, 0: 2})\n```"
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "- **Leakage checks:** `set(train_ids) & set(test_ids)` should be empty.\n- **Label encoding:** `label_to_id` and `id_to_label` dictionaries convert between class names and model outputs.\n- **Experiment configs:** hyperparameters live in dictionaries, which are logged to MLflow in Module 19.\n- **Text preprocessing:** lower-casing, stripping and splitting are the first steps of every NLP pipeline."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "Lists are ordered and mutable; tuples are fixed; sets are unique and fast for membership; dicts map keys to values.",
            "Sets and dicts use hashing, which gives fast lookup, so their keys must be immutable.",
            "Slices exclude `stop`; `.copy()` avoids aliasing; beware `[[0]*3]*3`.",
            "Strings are immutable; f-string specs like `.2%` and `,` format numbers.",
            "Comprehensions are concise; generator expressions save memory."
          ],
          "terms": [
            {
              "term": "Hashing",
              "definition": "Turning a key into a number that locates its storage slot directly."
            },
            {
              "term": "Slice",
              "definition": "A sub-sequence selected with [start:stop:step]."
            },
            {
              "term": "Comprehension",
              "definition": "An expression that builds a list, set or dict from an iterable."
            },
            {
              "term": "Generator expression",
              "definition": "A lazy comprehension in parentheses that yields one value at a time."
            }
          ],
          "misconceptions": [
            "“`x in my_list` is as fast as `x in my_set`.” A list scans every element; a set jumps straight to the slot.",
            "“String methods change the string.” They return a new string; the original is unchanged."
          ]
        }
      }
    ],
    "quiz": {
      "title": "Data structures and strings",
      "questions": [
        {
          "type": "single",
          "prompt": "Which structure best checks whether any of 1 million customer IDs appears in the test set?",
          "options": [
            "list",
            "tuple",
            "set",
            "str"
          ],
          "answer": [
            2
          ],
          "explanation": "Sets offer average O(1) membership tests through hashing."
        },
        {
          "type": "single",
          "prompt": "What does `[1, 2, 3, 4, 5][1:4]` return?",
          "options": [
            "[1, 2, 3, 4]",
            "[2, 3, 4]",
            "[2, 3, 4, 5]",
            "[1, 2, 3]"
          ],
          "answer": [
            1
          ],
          "explanation": "Index 1 up to but not including index 4."
        },
        {
          "type": "single",
          "prompt": "Why can't a list be a dictionary key?",
          "options": [
            "Lists are too large",
            "Lists are mutable, so they aren't hashable",
            "Dictionary keys must be strings",
            "Lists are unordered"
          ],
          "answer": [
            1
          ],
          "explanation": "If a key could change after insertion, its hash would no longer point to the right slot."
        },
        {
          "type": "single",
          "prompt": "What does `f\"{0.93456:.1%}\"` produce?",
          "options": [
            "0.9%",
            "93.5%",
            "93.4%",
            "0.93%"
          ],
          "answer": [
            1
          ],
          "explanation": "`%` multiplies by 100 and adds a percent sign; `.1` rounds to one decimal place."
        },
        {
          "type": "true_false",
          "prompt": "`sum(x * x for x in range(10**7))` builds a 10-million-element list in memory first.",
          "answer": [
            1
          ],
          "explanation": "That's a generator expression; values are produced one at a time."
        }
      ]
    }
  },
  {
    "slug": "python-for-ml-functions-scope-and-errors",
    "module": "python-fundamentals-for-ml",
    "order": 5,
    "title": "Functions, Lambdas, Scope and Exceptions",
    "summary": "Write reusable functions with clear parameters, use lambdas, map and filter where they help, understand scope and closures, and handle errors without hiding bugs.",
    "difficulty": "beginner",
    "minutes": 35,
    "prerequisites": [
      "python-for-ml-data-structures-and-strings"
    ],
    "objectives": [
      "Define functions with defaults, *args, **kwargs and keyword-only parameters",
      "Avoid the mutable-default-argument bug",
      "Use lambdas as sort keys and know when a named function is clearer",
      "Explain the LEGB scope rule and closures",
      "Raise and handle exceptions with try/except/else/finally"
    ],
    "references": [
      {
        "title": "Python docs: Defining Functions",
        "url": "https://docs.python.org/3/tutorial/controlflow.html#defining-functions"
      },
      {
        "title": "Python docs: Errors and Exceptions",
        "url": "https://docs.python.org/3/tutorial/errors.html"
      },
      {
        "title": "Python docs: Scopes and Namespaces",
        "url": "https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "Your batch prediction job processes a million records and record #734,201 is corrupt.\n**Should the whole job crash?** Should it silently skip the record? Good functions and good error handling are what separate a notebook experiment from a system you can trust overnight."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Explain it simply",
          "markdown": "A **function** packages a piece of logic under a name so you can reuse and test it: inputs go in as **parameters**, a result comes out with **`return`**.\nAn **exception** is Python's way of saying \"something went wrong here\". You can let it stop the program, or **catch** it and respond deliberately."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Parameters that make calls readable",
          "language": "python",
          "code": "def train(data, epochs: int = 10, *, lr: float = 1e-3, verbose: bool = False) -> str:\n    \"\"\"Pretend to train; returns a short report.\"\"\"\n    return f\"{len(data)} rows, {epochs} epochs, lr={lr}, verbose={verbose}\"\n\nprint(train([1, 2, 3]))\nprint(train([1, 2, 3], 5, lr=0.01))\n\ndef log_metrics(step, *values, **tags):\n    print(step, values, tags)\n\nlog_metrics(1, 0.9, 0.8, split=\"val\", model=\"lgbm\")",
          "explanation": "Parameters after `*` are **keyword-only**: callers must write `lr=0.01`, which makes calls self-documenting (scikit-learn uses this everywhere). `*values` collects extra positional arguments into a tuple; `**tags` collects keyword arguments into a dict.",
          "expectedOutput": "3 rows, 10 epochs, lr=0.001, verbose=False\n3 rows, 5 epochs, lr=0.01, verbose=False\n1 (0.9, 0.8) {'split': 'val', 'model': 'lgbm'}"
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "The mutable default trap",
          "language": "python",
          "code": "def add_bad(item, bucket=[]):\n    bucket.append(item)\n    return bucket\n\nprint(add_bad(\"a\"))\nprint(add_bad(\"b\"))        # surprise: the list is shared between calls\n\ndef add_good(item, bucket=None):\n    bucket = [] if bucket is None else bucket\n    bucket.append(item)\n    return bucket\n\nprint(add_good(\"a\"))\nprint(add_good(\"b\"))",
          "explanation": "Default values are created **once**, when the function is defined, not on every call. A mutable default (list or dict) therefore accumulates state across calls. Use `None` as the default and create the object inside.",
          "expectedOutput": "['a']\n['a', 'b']\n['a']\n['b']"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Lambdas, map and filter",
          "markdown": "A **lambda** is a small anonymous function written inline. Its best use in ML code is as a **sort key**:\n\n```python\nruns = [{\"name\": \"a\", \"val_auc\": 0.81}, {\"name\": \"b\", \"val_auc\": 0.86}]\nbest = sorted(runs, key=lambda r: r[\"val_auc\"], reverse=True)[0]\n```\n\n`map` and `filter` apply a function lazily:\n\n```python\nlist(map(lambda x: x * 2, [1, 2, 3]))          # [2, 4, 6]\nlist(filter(lambda x: x > 0, [-1, 2, -3, 4]))  # [2, 4]\n```\n\nIn practice, comprehensions usually read better than `map`/`filter`. And in pandas, `df[\"col\"].apply(lambda ...)` is far slower than a vectorised expression, so reach for it last."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Technical deep dive: scope and closures",
          "markdown": "Python looks up a name in this order, the **LEGB rule**:\n\n1. **L**ocal: inside the current function\n2. **E**nclosing: inside any outer function\n3. **G**lobal: at module level\n4. **B**uilt-in: names like `len`, `sum`, `print`\n\nAssigning to a name inside a function makes it **local** unless you declare `global` (or `nonlocal` for an enclosing function). That's why this fails:\n\n```python\nx = 1\ndef f():\n    print(x)   # UnboundLocalError: x is local because of the next line\n    x = 2\n```\n\nA **closure** is an inner function that remembers variables from the function that created it:\n\n```python\ndef make_scaler(factor):\n    def scale(x):\n        return x * factor\n    return scale\n\ndouble = make_scaler(2)\ndouble(5)   # 10\n```\n\nGlobal mutable state makes experiments hard to reproduce and test. **Pass configuration in as arguments.**"
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "A function is a kitchen appliance",
          "markdown": "A blender takes ingredients (arguments), does one job, and gives you a result (the return value). You don't need to know how its motor works.\n\n*Where it breaks down:* a blender doesn't remember yesterday's smoothie, but a function with a mutable default argument does. That's the bug you just saw."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Handling errors deliberately",
          "language": "python",
          "code": "import json\n\ndef parse_record(line: str) -> dict:\n    try:\n        record = json.loads(line)\n    except json.JSONDecodeError as e:\n        raise ValueError(f\"bad JSON at char {e.pos}\") from e\n    if record.get(\"amount\", 0) < 0:\n        raise ValueError(\"amount cannot be negative\")\n    return record\n\nlines = ['{\"id\": 1, \"amount\": 20}', '{\"id\": 2, \"amount\": ', '{\"id\": 3, \"amount\": -5}']\nok, failed = [], []\nfor n, line in enumerate(lines, start=1):\n    try:\n        ok.append(parse_record(line))\n    except ValueError as err:\n        failed.append((n, str(err)))\n    else:\n        print(f\"line {n}: ok\")\n    finally:\n        pass  # cleanup (closing files, releasing locks) would go here\n\nprint(\"parsed:\", len(ok), \"| failed:\", failed)",
          "explanation": "Catch **specific** exceptions you expect, convert them into clear errors with `raise … from e` (which keeps the original cause), and decide at the *caller* what to do. Here bad records are quarantined and reported instead of crashing the whole batch or vanishing silently.",
          "expectedOutput": "line 1: ok\nparsed: 1 | failed: [(2, 'bad JSON at char 20'), (3, 'amount cannot be negative')]"
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "try / except / else / finally",
          "columns": [
            "Runs when",
            "Typical use"
          ],
          "rows": [
            {
              "label": "try",
              "values": [
                "Always",
                "The code that might fail"
              ]
            },
            {
              "label": "except SomeError",
              "values": [
                "That error (or a subclass) is raised",
                "Recover, quarantine the record, or re-raise with context"
              ]
            },
            {
              "label": "else",
              "values": [
                "No exception was raised",
                "Work that should only happen on success"
              ]
            },
            {
              "label": "finally",
              "values": [
                "Always, even after return or an unhandled error",
                "Cleanup: close files, release locks"
              ]
            }
          ]
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "warning",
          "title": "Never swallow errors",
          "markdown": "`except Exception: pass` (or a bare `except:`) hides real bugs. A typo then looks like \"no data\", and a bare `except:` even catches Ctrl+C.\nCatch the narrowest exception you can, and **log** anything you skip."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Validate model inputs",
          "task": "Write `check_xy(X, y)` that raises a `ValueError` with a helpful message when:\n\n1. `X` and `y` have different lengths, or\n2. `y` contains a value other than 0 or 1.\n\nThen call it inside `try/except` and print the message.",
          "hints": [
            "Compare `len(X)` and `len(y)` first; it's the cheaper check.",
            "`set(y) - {0, 1}` gives you any invalid labels."
          ],
          "solution": "```python\ndef check_xy(X, y):\n    if len(X) != len(y):\n        raise ValueError(f\"X has {len(X)} rows but y has {len(y)}\")\n    bad = set(y) - {0, 1}\n    if bad:\n        raise ValueError(f\"y must be 0/1, found {sorted(bad)}\")\n\ntry:\n    check_xy([[1], [2], [3]], [0, 1, 2])\nexcept ValueError as e:\n    print(\"invalid input:\", e)   # invalid input: y must be 0/1, found [2]\n```"
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "- scikit-learn's `train_test_split(X, y, *, test_size=..., random_state=...)` uses keyword-only arguments, so calls read clearly.\n- Data pipelines validate their inputs at function boundaries and raise clear errors (\"fail fast\"), rather than producing a silently wrong model.\n- Batch prediction jobs quarantine bad records and alert on the failure rate, instead of crashing or silently dropping data."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "Functions take parameters and return results; keyword-only parameters (after *) make calls readable.",
            "Never use a mutable default; use None and create the object inside.",
            "Lambdas are best as short sort keys; prefer comprehensions to map/filter.",
            "Names resolve Local → Enclosing → Global → Built-in; closures remember enclosing variables.",
            "Catch specific exceptions, re-raise with context using `from`, and never silently pass."
          ],
          "terms": [
            {
              "term": "Parameter / argument",
              "definition": "The name in the definition / the value passed in the call."
            },
            {
              "term": "Keyword-only argument",
              "definition": "A parameter that must be passed by name."
            },
            {
              "term": "Closure",
              "definition": "An inner function that keeps access to variables of its enclosing function."
            },
            {
              "term": "Exception",
              "definition": "An object signalling an error, which propagates up until something handles it."
            }
          ],
          "misconceptions": [
            "“A default argument is re-created on every call.” It is evaluated once, at definition time.",
            "“Catching all exceptions makes code robust.” It makes bugs invisible."
          ]
        }
      }
    ],
    "quiz": {
      "title": "Functions and errors",
      "questions": [
        {
          "type": "single",
          "prompt": "Calling `add_bad('a')` then `add_bad('b')` (with `bucket=[]` as the default) returns what on the second call?",
          "options": [
            "['b']",
            "['a', 'b']",
            "[]",
            "An error"
          ],
          "answer": [
            1
          ],
          "explanation": "The default list is created once and shared across calls."
        },
        {
          "type": "single",
          "prompt": "In `def f(a, *, b): ...`, how must `b` be passed?",
          "options": [
            "Positionally",
            "By keyword, e.g. f(1, b=2)",
            "It can't be passed",
            "Either way"
          ],
          "answer": [
            1
          ],
          "explanation": "Parameters after a bare * are keyword-only."
        },
        {
          "type": "single",
          "prompt": "When does a `finally` block run?",
          "options": [
            "Only when no error occurs",
            "Only when an error occurs",
            "Always",
            "Only after return"
          ],
          "answer": [
            2
          ],
          "explanation": "finally always runs, which is why it's used for cleanup."
        },
        {
          "type": "single",
          "prompt": "What's the problem with `except Exception: pass`?",
          "options": [
            "It's a syntax error",
            "It hides genuine bugs as if nothing happened",
            "It makes code slower",
            "It only works in notebooks"
          ],
          "answer": [
            1
          ],
          "explanation": "Errors vanish silently, so you get wrong results instead of a clear failure."
        },
        {
          "type": "true_false",
          "prompt": "Assigning to a variable inside a function makes it local to that function unless declared global or nonlocal.",
          "answer": [
            0
          ],
          "explanation": "That's why reading it before assignment raises UnboundLocalError."
        }
      ]
    }
  },
  {
    "slug": "python-for-ml-files-modules-and-environments",
    "module": "python-fundamentals-for-ml",
    "order": 6,
    "title": "Files, Modules, Packages and Virtual Environments",
    "summary": "Read and write text, JSON and CSV files safely, organise code into modules and packages, and manage dependencies with virtual environments and pip.",
    "difficulty": "beginner",
    "minutes": 30,
    "prerequisites": [
      "python-for-ml-functions-scope-and-errors"
    ],
    "objectives": [
      "Read and write files with context managers and pathlib",
      "Stream large files line by line instead of loading them whole",
      "Structure a project as modules and a package, using `if __name__ == \"__main__\"`",
      "Create virtual environments and pin dependencies for reproducibility"
    ],
    "references": [
      {
        "title": "Python docs: pathlib",
        "url": "https://docs.python.org/3/library/pathlib.html"
      },
      {
        "title": "Python docs: Modules",
        "url": "https://docs.python.org/3/tutorial/modules.html"
      },
      {
        "title": "Python Packaging User Guide: virtual environments",
        "url": "https://packaging.python.org/en/latest/guides/installing-using-pip-and-virtual-environments/"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "Your model trained perfectly on your laptop. On the server it crashes with `FileNotFoundError`, and when that's fixed, `ImportError`, and when *that's* fixed, it gives different predictions.\n**Paths, project structure and dependency versions** cause more failed deployments than model bugs do."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Explain it simply",
          "markdown": "- **Files** let programs keep data after they finish: datasets, configs, logs, saved models.\n- **Modules and packages** split code into files and folders you can `import`, so the same code serves notebooks, training jobs and APIs.\n- **Virtual environments** give each project its own installed packages and versions, so projects can't break each other."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Files with pathlib and context managers",
          "language": "python",
          "code": "import csv, json, tempfile\nfrom pathlib import Path\n\ndata_dir = Path(tempfile.mkdtemp()) / \"data\"\ndata_dir.mkdir(parents=True, exist_ok=True)\n\n(data_dir / \"config.json\").write_text(json.dumps({\"lr\": 0.01, \"epochs\": 5}, indent=2), encoding=\"utf-8\")\ncfg = json.loads((data_dir / \"config.json\").read_text(encoding=\"utf-8\"))\nprint(\"config:\", cfg)\n\nwith open(data_dir / \"scores.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    writer = csv.writer(f)\n    writer.writerow([\"model\", \"auc\"])\n    writer.writerows([[\"logreg\", 0.84], [\"lgbm\", 0.88]])\n\nwith open(data_dir / \"scores.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    for row in csv.DictReader(f):          # streams one row at a time\n        print(row[\"model\"], float(row[\"auc\"]))",
          "explanation": "`with open(...)` is a **context manager**: the file is closed automatically, even if an error occurs. `pathlib.Path` joins paths with `/` and works on every operating system. Iterating over a file object reads **one line at a time**, so it can handle files far larger than memory.",
          "expectedOutput": "config: {'lr': 0.01, 'epochs': 5}\nlogreg 0.84\nlgbm 0.88"
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "File modes",
          "columns": [
            "Meaning",
            "Careful"
          ],
          "rows": [
            {
              "label": "\"r\"",
              "values": [
                "Read (the default)",
                "Fails if the file is missing"
              ]
            },
            {
              "label": "\"w\"",
              "values": [
                "Write",
                "Truncates (empties) an existing file"
              ]
            },
            {
              "label": "\"a\"",
              "values": [
                "Append",
                "Adds to the end"
              ]
            },
            {
              "label": "\"x\"",
              "values": [
                "Create only",
                "Fails if the file exists, which is safe for outputs"
              ]
            },
            {
              "label": "\"b\" suffix",
              "values": [
                "Binary: images, pickles, parquet",
                "No encoding argument"
              ]
            }
          ]
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "warning",
          "title": "Hard-coded absolute paths",
          "markdown": "`open(\"/Users/me/Desktop/data.csv\")` works on exactly one computer. Use paths relative to the project root (`Path(__file__).parent / \"data\"`) or configuration, and always pass `encoding=\"utf-8\"` for text."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Modules and packages",
          "markdown": "A **module** is a `.py` file; a **package** is a folder of modules (traditionally with an `__init__.py`). A typical ML project:\n\n```\nchurn-ml/\n├── pyproject.toml\n├── src/churn/\n│   ├── __init__.py\n│   ├── data.py        # load_data(), clean()\n│   ├── features.py    # build_features()\n│   └── train.py       # main() training entry point\n├── notebooks/         # exploration only\n└── tests/test_features.py\n```\n\n```python\nfrom churn.features import build_features\nimport numpy as np          # aliases by convention: np, pd, plt\n```\n\nCode under `if __name__ == \"__main__\":` runs only when the file is executed directly (`python -m churn.train`), **not** when it is imported:\n\n```python\ndef main():\n    ...\nif __name__ == \"__main__\":\n    main()\n```\n\n**Pitfalls:** naming your own file `random.py`, `json.py` or `numpy.py` shadows the real library. `from module import *` hides where names come from."
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "Folders in a filing cabinet",
          "markdown": "A package is a drawer, modules are folders, and functions are the documents. `from churn.features import build_features` is \"open the churn drawer, take the features folder, pull out that document\".\n\n*Where it breaks down:* Python searches several cabinets (the current folder first, then installed packages), so a local file can accidentally hide a library with the same name."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Technical deep dive: virtual environments and pip",
          "markdown": "```bash\npython3 -m venv .venv\nsource .venv/bin/activate          # Windows: .venv\\Scripts\\activate\npip install --upgrade pip\npip install numpy pandas scikit-learn\npip freeze > requirements.txt      # pin exact versions\npip install -r requirements.txt    # recreate the environment elsewhere\n```\n\n| Tool | What it adds |\n|---|---|\n| **uv** | A very fast pip/venv replacement with lockfiles (`uv venv`, `uv pip install`, `uv sync`) |\n| poetry / pdm | Dependency resolution and packaging via `pyproject.toml` |\n| conda / mamba | Also manages non-Python binaries (CUDA, MKL) |\n\n**Rules:** never commit `.venv/` (add it to `.gitignore`); commit the requirements or lock file instead. Pin versions for anything you deploy, because an upgraded library can change a model's behaviour. GPU builds of PyTorch need the exact install command from pytorch.org."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Turn a notebook into a module",
          "task": "A notebook contains one huge cell that loads `customers.csv`, cleans it, trains a model and prints the accuracy.\n\n1. Sketch the package layout you would create.\n2. Name the functions you would extract and what each returns.\n3. What goes in `requirements.txt`, and what goes in `.gitignore`?",
          "hints": [
            "One responsibility per function: load, clean, split, train, evaluate.",
            "Data and environments are big and machine-specific; code and pinned requirements are not."
          ],
          "solution": "- `src/churn/data.py`: `load_data(path) -> DataFrame`, `clean(df) -> DataFrame`\n- `src/churn/train.py`: `split(df) -> X_train, X_test, y_train, y_test`, `train(X, y) -> model`, `evaluate(model, X, y) -> dict`, and `main()` under `if __name__ == \"__main__\":`\n- `tests/test_data.py`: tests for `clean`\n\n`requirements.txt` holds the pinned versions (`pandas==2.2.3`, `scikit-learn==1.6.1`, …). `.gitignore` lists `.venv/`, `data/`, `__pycache__/`, `.ipynb_checkpoints/` and `.env`."
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "Production ML repositories follow this structure so that the **same code** runs in a notebook, a scheduled training job, a CI test and a FastAPI service.\nPinned environments, and later Docker images (Module 19), are what make \"it worked on my machine\" reproducible on every machine."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "Use `with open(...)` and pathlib; always set encoding; iterate over files to stream them.",
            "Mode \"w\" erases existing content; \"x\" refuses to overwrite.",
            "Modules are .py files; packages are folders of modules; guard scripts with `if __name__ == \"__main__\"`.",
            "One virtual environment per project; pin dependencies; never commit .venv.",
            "Don't name files after libraries you import."
          ],
          "terms": [
            {
              "term": "Context manager",
              "definition": "An object used with `with` that guarantees setup and cleanup, such as closing a file."
            },
            {
              "term": "Module / package",
              "definition": "A Python file / a folder of Python files that can be imported."
            },
            {
              "term": "Virtual environment",
              "definition": "An isolated set of installed packages for one project."
            },
            {
              "term": "Pinning",
              "definition": "Recording exact package versions so the environment can be recreated."
            }
          ],
          "misconceptions": [
            "“Opening with \"w\" adds to the file.” It wipes it first; use \"a\" to append.",
            "“`pip install` without a virtual environment is fine.” It mixes every project's dependencies together."
          ]
        }
      }
    ],
    "quiz": {
      "title": "Files, modules and environments",
      "questions": [
        {
          "type": "single",
          "prompt": "Why use `with open(path) as f:` instead of `f = open(path)`?",
          "options": [
            "It reads faster",
            "It closes the file automatically, even on errors",
            "It's required for CSV files",
            "It compresses the file"
          ],
          "answer": [
            1
          ],
          "explanation": "The context manager guarantees cleanup."
        },
        {
          "type": "single",
          "prompt": "Which approach can process a 20 GB log file on a laptop with 8 GB of RAM?",
          "options": [
            "f.read().splitlines()",
            "for line in f:",
            "json.load(f)",
            "list(f)"
          ],
          "answer": [
            1
          ],
          "explanation": "Iterating streams one line at a time."
        },
        {
          "type": "single",
          "prompt": "What does code under `if __name__ == \"__main__\":` do when the module is imported?",
          "options": [
            "Runs first",
            "Runs last",
            "Doesn't run",
            "Raises an error"
          ],
          "answer": [
            2
          ],
          "explanation": "It only runs when the file is executed directly."
        },
        {
          "type": "multiple",
          "prompt": "What should you commit to Git? (Choose all that apply.)",
          "options": [
            "requirements.txt or a lock file",
            ".venv/",
            "src/ code",
            ".env with API keys"
          ],
          "answer": [
            0,
            2
          ],
          "explanation": "Environments are recreated from pinned requirements; secrets must never be committed."
        },
        {
          "type": "true_false",
          "prompt": "Naming your own script `random.py` can break `import random` in that project.",
          "answer": [
            0
          ],
          "explanation": "Python finds your local file first, shadowing the standard library module."
        }
      ]
    }
  },
  {
    "slug": "python-for-ml-oop-and-clean-code",
    "module": "python-fundamentals-for-ml",
    "order": 7,
    "title": "Object-Oriented Python and Maintainable Code",
    "summary": "Classes, objects, inheritance and encapsulation, the same design scikit-learn and PyTorch use, plus the habits that keep ML code testable and maintainable.",
    "difficulty": "intermediate",
    "minutes": 40,
    "prerequisites": [
      "python-for-ml-files-modules-and-environments"
    ],
    "objectives": [
      "Explain encapsulation, abstraction, inheritance and polymorphism with ML examples",
      "Write a class with __init__, methods, learned attributes and __repr__",
      "Use inheritance, dataclasses and magic methods appropriately",
      "Apply maintainability practices: small pure functions, config, logging, type hints and tests"
    ],
    "references": [
      {
        "title": "Python docs: Classes",
        "url": "https://docs.python.org/3/tutorial/classes.html"
      },
      {
        "title": "scikit-learn: Developing scikit-learn estimators",
        "url": "https://scikit-learn.org/stable/developers/develop.html"
      },
      {
        "title": "pytest: Get started",
        "url": "https://docs.pytest.org/en/stable/getting-started.html"
      }
    ],
    "blocks": [
      {
        "type": "rich_text",
        "content": {
          "title": "The big question",
          "markdown": "`cross_val_score(model, X, y)` works whether `model` is a random forest, a logistic regression or a class *you* wrote yesterday.\n**How can one function work with models it has never heard of?** The answer is object-oriented design, the backbone of every major ML library."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Explain it simply",
          "markdown": "**Object-oriented programming (OOP)** bundles **data** (attributes) and **behaviour** (methods) into objects.\nA scikit-learn model is an object that *stores* learned numbers (`coef_`) and *knows how to* `fit` and `predict`.\nA **class** is the blueprint; each **object** (instance) is one thing built from it."
        }
      },
      {
        "type": "comparison",
        "content": {
          "title": "The four OOP ideas, in ML terms",
          "columns": [
            "Meaning",
            "ML example"
          ],
          "rows": [
            {
              "label": "Encapsulation",
              "values": [
                "Keep internal state behind methods",
                "Weights are set by fit(), not edited by hand"
              ]
            },
            {
              "label": "Abstraction",
              "values": [
                "Expose a simple interface",
                "model.predict(X) hides the maths"
              ]
            },
            {
              "label": "Inheritance",
              "values": [
                "Reuse and specialise a parent class",
                "class MyNet(nn.Module)"
              ]
            },
            {
              "label": "Polymorphism",
              "values": [
                "Different classes, same interface",
                "Any estimator works inside a Pipeline"
              ]
            }
          ]
        }
      },
      {
        "type": "callout",
        "content": {
          "variant": "analogy",
          "title": "Appliances with a standard plug",
          "markdown": "Every appliance has a different inside, but they all fit the same wall socket. Because every scikit-learn estimator has `fit` and `predict`, any of them plugs into `Pipeline`, `GridSearchCV` or `cross_val_score`.\n\n*Where it breaks down:* Python doesn't enforce the socket shape. If your class forgets `predict`, you only find out when the call fails, which is why tests matter."
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Writing a scikit-learn-style transformer",
          "language": "python",
          "code": "class StandardScaler:\n    \"\"\"Scales columns to zero mean and unit variance.\"\"\"\n\n    def __init__(self, eps: float = 1e-12):\n        self.eps = eps            # hyperparameter: set by the user\n        self.mean_ = None         # learned attributes end with _\n        self.std_ = None\n\n    def fit(self, X):\n        n = len(X)\n        cols = list(zip(*X))\n        self.mean_ = [sum(c) / n for c in cols]\n        self.std_ = [(sum((v - m) ** 2 for v in c) / n) ** 0.5 for c, m in zip(cols, self.mean_)]\n        return self               # returning self enables chaining\n\n    def transform(self, X):\n        if self.mean_ is None:\n            raise RuntimeError(\"Call fit() before transform()\")\n        return [[round((v - m) / (s + self.eps), 3) for v, m, s in zip(row, self.mean_, self.std_)]\n                for row in X]\n\n    def fit_transform(self, X):\n        return self.fit(X).transform(X)\n\n    def __repr__(self):\n        return f\"StandardScaler(eps={self.eps})\"\n\nX_train = [[1.0, 100.0], [2.0, 200.0], [3.0, 300.0]]\nscaler = StandardScaler()\nprint(scaler)\nprint(scaler.fit_transform(X_train))\nprint(scaler.transform([[4.0, 400.0]]))   # uses the TRAINING mean and std",
          "explanation": "This mirrors scikit-learn's conventions: hyperparameters in `__init__`, learned state in attributes ending in `_`, `fit` returning `self`, and `transform` refusing to run before `fit`. Note that new data is transformed with the statistics learned from the **training** data. That rule prevents data leakage (Module 03).",
          "expectedOutput": "StandardScaler(eps=1e-12)\n[[-1.225, -1.225], [0.0, 0.0], [1.225, 1.225]]\n[[2.449, 2.449]]"
        }
      },
      {
        "type": "code_example",
        "content": {
          "title": "Inheritance: specialise one behaviour",
          "language": "python",
          "code": "import statistics\n\nclass Scaler:\n    def fit(self, values):\n        self.center_ = statistics.fmean(values)\n        self.scale_ = statistics.pstdev(values)\n        return self\n\n    def transform(self, values):\n        return [round((v - self.center_) / self.scale_, 2) for v in values]\n\nclass RobustScaler(Scaler):              # inherits transform()\n    def fit(self, values):                # overrides fit()\n        q1, _, q3 = statistics.quantiles(values, n=4)\n        self.center_ = statistics.median(values)\n        self.scale_ = q3 - q1\n        return self\n\nincomes = [30, 32, 35, 36, 38, 40, 41, 43, 45, 1000]   # one extreme outlier\nfor cls in (Scaler, RobustScaler):        # polymorphism: same calls, different behaviour\n    print(cls.__name__, cls().fit(incomes).transform(incomes))",
          "explanation": "`RobustScaler` reuses `transform` from its parent and overrides only `fit`, using the median and interquartile range. Look at the output: with the standard scaler, the outlier inflates the standard deviation, so the nine typical incomes are squashed into −0.36…−0.31 and become almost indistinguishable. The robust scaler keeps them spread out (−0.97…0.65) and pushes only the outlier far away. The loop calls the same methods on both classes; that's polymorphism.",
          "expectedOutput": "Scaler [-0.36, -0.35, -0.34, -0.34, -0.33, -0.33, -0.32, -0.32, -0.31, 3.0]\nRobustScaler [-0.97, -0.76, -0.43, -0.32, -0.11, 0.11, 0.22, 0.43, 0.65, 103.89]"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Technical deep dive: the class toolkit",
          "markdown": "- `self` is the instance; `__init__` initialises it. **Instance attributes** (`self.x`) belong to one object; **class attributes** are shared by all instances.\n- `super().__init__(...)` calls the parent's constructor. PyTorch modules must do this: `super().__init__()`.\n- **Encapsulation in Python is by convention**: `_name` means \"internal\", and `@property` exposes a computed, read-only attribute.\n- **Magic methods** make objects behave like built-ins. A PyTorch `Dataset` needs `__len__` and `__getitem__`; `__call__` makes an object callable like a function (which is how `model(x)` works).\n- **`@dataclass`** removes the boilerplate for classes that mainly hold data:\n\n```python\nfrom dataclasses import dataclass\n\n@dataclass\nclass TrainConfig:\n    lr: float = 1e-3\n    epochs: int = 10\n    batch_size: int = 32\n\ncfg = TrainConfig(lr=3e-4)   # TrainConfig(lr=0.0003, epochs=10, batch_size=32)\n```\n\n**Prefer composition over deep inheritance.** A `Pipeline` *has* steps; it isn't a subclass of each step."
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Writing reusable and maintainable code",
          "markdown": "1. **Small, pure functions:** the same input always gives the same output, with no hidden side effects, so they are easy to test.\n2. **DRY:** if you've copied code twice, make it a function.\n3. **Configuration, not hard-coding:** paths, hyperparameters and seeds live in a config file or dataclass.\n4. **Type hints and docstrings** on every public function.\n5. **Logging, not print,** for anything that runs unattended:\n\n```python\nimport logging\nlogging.basicConfig(level=logging.INFO, format=\"%(asctime)s %(levelname)s %(message)s\")\nlog = logging.getLogger(__name__)\nlog.info(\"Loaded %d rows\", 1200)\n```\n\n6. **Tests** with `pytest`:\n\n```python\n# tests/test_scaler.py\ndef test_scaler_centres_data():\n    Xs = StandardScaler().fit_transform([[1.0], [2.0], [3.0]])\n    assert abs(sum(r[0] for r in Xs)) < 1e-9\n```\n\n7. **Automatic formatting and linting** with `ruff` (run via `pre-commit`).\n8. **Fail fast:** validate inputs at function boundaries with clear error messages."
        }
      },
      {
        "type": "practice",
        "content": {
          "title": "Build a minimal classifier class",
          "task": "Write a `MajorityClassifier` with the scikit-learn interface:\n\n- `fit(X, y)` stores the most common label in `self.majority_` and returns `self`\n- `predict(X)` returns that label for every row\n- `score(X, y)` returns the accuracy\n\nTest it on `y = [0, 0, 1, 0, 1]`. This is the **baseline** every real model must beat.",
          "hints": [
            "`collections.Counter(y).most_common(1)[0][0]` gives the most frequent label.",
            "Accuracy = number of matches / number of rows."
          ],
          "solution": "```python\nfrom collections import Counter\n\nclass MajorityClassifier:\n    def fit(self, X, y):\n        self.majority_ = Counter(y).most_common(1)[0][0]\n        return self\n\n    def predict(self, X):\n        return [self.majority_ for _ in X]\n\n    def score(self, X, y):\n        preds = self.predict(X)\n        return sum(p == t for p, t in zip(preds, y)) / len(y)\n\nX, y = [[0]] * 5, [0, 0, 1, 0, 1]\nprint(MajorityClassifier().fit(X, y).score(X, y))   # 0.6\n```\n\nscikit-learn ships this as `DummyClassifier(strategy=\"most_frequent\")`."
        }
      },
      {
        "type": "quiz",
        "content": {
          "quizId": "$QUIZ"
        }
      },
      {
        "type": "rich_text",
        "content": {
          "title": "Real-world application",
          "markdown": "- **scikit-learn:** every estimator follows the `fit` / `predict` / `transform` contract, so you can swap models inside the same pipeline and tuning code.\n- **PyTorch:** you build networks by subclassing `nn.Module`, calling `super().__init__()` and defining `forward` (Module 16).\n- **Production teams** rely on tests, type hints, logging and configuration so that models can be retrained by someone other than their original author, months later."
        }
      },
      {
        "type": "summary",
        "content": {
          "takeaways": [
            "Objects bundle data and behaviour; classes are blueprints.",
            "Follow library conventions: hyperparameters in __init__, learned state ending in _, fit returns self.",
            "Inheritance reuses and overrides behaviour; polymorphism lets different classes share one interface.",
            "Use dataclasses for configs and magic methods for built-in behaviour; prefer composition.",
            "Maintainable ML code = small pure functions, config, type hints, logging and tests."
          ],
          "terms": [
            {
              "term": "Class / instance",
              "definition": "A blueprint / one object built from it."
            },
            {
              "term": "Encapsulation",
              "definition": "Hiding internal state behind a controlled interface."
            },
            {
              "term": "Polymorphism",
              "definition": "Different classes responding to the same method calls."
            },
            {
              "term": "Dataclass",
              "definition": "A class whose __init__ and __repr__ are generated from type-annotated fields."
            },
            {
              "term": "Magic (dunder) method",
              "definition": "A special method such as __len__ or __call__ that hooks into Python syntax."
            }
          ],
          "misconceptions": [
            "“Python enforces private attributes.” Underscores are conventions; nothing stops access.",
            "“Deep inheritance hierarchies make code reusable.” Composition is usually simpler and more flexible."
          ]
        }
      }
    ],
    "quiz": {
      "title": "OOP and maintainable code",
      "questions": [
        {
          "type": "single",
          "prompt": "In scikit-learn's convention, what does a trailing underscore (e.g. `coef_`) indicate?",
          "options": [
            "A private attribute",
            "A value learned during fit",
            "A deprecated attribute",
            "A hyperparameter"
          ],
          "answer": [
            1
          ],
          "explanation": "Learned state is stored in attributes ending with _ ; hyperparameters are set in __init__."
        },
        {
          "type": "single",
          "prompt": "Why does `fit` return `self`?",
          "options": [
            "It's required by Python",
            "So calls can be chained, e.g. scaler.fit(X).transform(X)",
            "To save memory",
            "To make the object immutable"
          ],
          "answer": [
            1
          ],
          "explanation": "Returning self enables fluent chaining."
        },
        {
          "type": "single",
          "prompt": "Why can `cross_val_score` accept any scikit-learn estimator?",
          "options": [
            "It checks each model's class name",
            "All estimators share the same fit/predict interface (polymorphism)",
            "It converts every model into a random forest",
            "Because of type hints"
          ],
          "answer": [
            1
          ],
          "explanation": "A shared interface lets generic code work with any conforming object."
        },
        {
          "type": "multiple",
          "prompt": "Which magic methods does a PyTorch Dataset need for indexing and length? (Choose all that apply.)",
          "options": [
            "__len__",
            "__getitem__",
            "__repr__",
            "__add__"
          ],
          "answer": [
            0,
            1
          ],
          "explanation": "DataLoader uses len() and indexing."
        },
        {
          "type": "true_false",
          "prompt": "Transforming test data should reuse the mean and standard deviation learned from the training data.",
          "answer": [
            0
          ],
          "explanation": "Refitting on test data leaks information and makes the scales inconsistent."
        }
      ]
    }
  }
];
