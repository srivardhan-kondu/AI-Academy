export const PROJECTS = [
  {
    slug: "ai-assisted-study-workflow", order: 1, title: "Build an AI-Assisted Study Workflow", difficulty: "beginner", hours: 3, tier: "free",
    description: "Design a repeatable workflow that uses an AI assistant to help you learn — while verifying what it tells you.",
    prerequisites: ["AI vs ML vs Deep Learning", "Limitations of AI: Hallucinations, Bias and Privacy", "Anatomy of an Effective Prompt"],
    outcomes: ["A written workflow with 3–5 reusable prompts", "Evidence of verifying AI output against reliable sources", "A short reflection on where AI helped and where it didn't"],
    instructions: `## Goal

Create a study workflow for one real course or topic that uses AI to **explain, quiz and plan** — with a built-in verification step.

## Milestones

1. **Pick a topic** you are studying now and a trusted source (textbook chapter, lecture notes).
2. **Write an "explain it simply" prompt** that gives the AI your source excerpt as context and asks for an explanation at your level. Constrain it to the source.
3. **Write a quiz prompt** that generates 5 questions *with answers and explanations* from the same excerpt. Answer them yourself before reading the answers.
4. **Verify**: pick 3 claims from the AI's output and check them against your source. Record any errors.
5. **Write a planning prompt** that turns your remaining syllabus into a two-week revision plan.
6. **Reflect** (150–300 words): what was useful, what was wrong, and what you will change.

## Definition of done

- A document (Google Doc, Notion page or GitHub README) containing your prompts, example outputs, verification table and reflection.
- No personal data about other people in any prompt.

## Submit

Share a public link to your document.`,
  },
  {
    slug: "explore-a-dataset-with-numpy", order: 2, title: "Explore a Real Dataset with NumPy", difficulty: "beginner", hours: 4, tier: "free",
    description: "Load a public dataset, compute statistics with NumPy, and write up three findings.",
    prerequisites: ["Your First Python Program: Variables and Data Types", "NumPy Fundamentals: Arrays for AI"],
    outcomes: ["A Python notebook or script that loads and analyses data", "Use of vectorised operations and boolean masks", "Three clearly explained findings"],
    instructions: `## Goal

Answer three questions about a real dataset using only Python and NumPy.

## Suggested data

Any small public CSV — for example a city's open-data portal, a sports statistics table, or a weather history file. Keep it under 50 MB.

## Milestones

1. Load the numeric columns with \`np.genfromtxt\` or \`np.loadtxt\` (handle missing values).
2. Print the shape, and the mean/min/max of each column.
3. Use **boolean masks** to compare two groups (e.g. weekdays vs weekends).
4. Normalise at least one column with min–max scaling.
5. Write three findings, each backed by a number you computed.

## Definition of done

- Code runs top to bottom without errors.
- No Python \`for\` loops over rows for the calculations (use vectorised NumPy).
- A README explaining the dataset source and licence.`,
  },
  {
    slug: "predict-exam-scores", order: 3, title: "Train and Evaluate a Prediction Model", difficulty: "intermediate", hours: 6, tier: "free",
    description: "Train a regression or classification model on a public dataset, evaluate it honestly on held-out data, and document its limits.",
    prerequisites: ["Linear Regression", "Decision Trees", "Precision, Recall and the Confusion Matrix"],
    outcomes: ["A trained model with a train/test split", "A baseline comparison", "A model card documenting metrics, intended use and limitations"],
    instructions: `## Goal

Train, evaluate and document a model the way a professional would.

## Milestones

1. **Choose a dataset** with a clear target (e.g. a UCI Machine Learning Repository dataset).
2. **Split** into training and test sets *before* exploring too much. Never tune on the test set.
3. **Baseline:** predict the mean (regression) or the majority class (classification). Record its score.
4. **Train** a linear model and a decision tree. Compare against the baseline.
5. **Evaluate** with appropriate metrics (MSE/MAE for regression; precision, recall and a confusion matrix for classification). Justify your choice.
6. **Model card:** intended use, data source, metrics, known failure cases, and who might be harmed by errors.

## Definition of done

- Reproducible notebook (fixed random seeds).
- Model beats the baseline — or you explain why it doesn't.
- A model card in the README.`,
  },
  {
    slug: "tested-prompt-library", order: 4, title: "Create a Tested Prompt Library", difficulty: "beginner", hours: 4, tier: "free",
    description: "Build a small library of prompts for a real workflow and test each one on several realistic inputs.",
    prerequisites: ["Anatomy of an Effective Prompt", "Temperature and Sampling"],
    outcomes: ["5 prompt templates for one workflow", "A test set of at least 5 inputs per prompt", "A results table showing what worked and what you changed"],
    instructions: `## Goal

Turn ad-hoc prompting into a small, tested toolkit.

## Milestones

1. **Pick a workflow** you actually do (e.g. summarising meeting notes, drafting replies, extracting data from invoices).
2. **Write 5 prompt templates** with context placeholders, a clear task, an output format and constraints.
3. **Create test inputs**: at least 5 realistic, varied examples per prompt — include one tricky edge case.
4. **Define success** for each prompt (e.g. "all four fields present", "under 100 words", "no invented facts").
5. **Run, score and iterate.** Record each version's pass rate.

## Definition of done

- A repository or document with templates, test inputs, results table and change log.
- At least one prompt improved measurably between versions.`,
  },
  {
    slug: "grounded-knowledge-assistant", order: 5, title: "Build a Grounded Document Q&A Assistant", difficulty: "advanced", hours: 12, tier: "premium",
    description: "Build a RAG application that answers questions about a document collection and cites its sources.",
    prerequisites: ["Embeddings", "What Is Retrieval-Augmented Generation (RAG)?", "Python basics and calling a web API"],
    outcomes: ["An ingestion pipeline with chunking and embeddings", "A retrieval step with inspectable top-k results", "Answers that cite source chunks and say 'I don't know' when appropriate", "A small evaluation set with retrieval and answer accuracy"],
    instructions: `## Goal

Build a question-answering assistant over a document set you are allowed to use, with citations and an evaluation.

## Milestones

1. **Corpus:** choose 10–50 documents (your own notes, public policy documents, open-licence manuals).
2. **Ingest:** extract text, chunk by headings/paragraphs with modest overlap, and store chunk metadata (source, section).
3. **Index:** embed chunks with an embedding model and store vectors (a simple NumPy array is fine to start; a vector database later).
4. **Retrieve:** embed the question, return top-k chunks, and *log them* so you can inspect failures.
5. **Generate:** prompt the model to answer only from the provided chunks, cite chunk IDs, and say when the answer is not present.
6. **Evaluate:** write 20 questions with known answers (including 3 that the corpus *cannot* answer). Measure retrieval hit rate and answer correctness separately.
7. **Secure:** keep API keys in environment variables, never in code; treat retrieved text as untrusted.

## Definition of done

- Working app (CLI or simple web UI) and README with setup steps.
- Evaluation table with retrieval hit-rate and answer accuracy.
- At least one documented failure and how you fixed it.`,
  },
] as const;
