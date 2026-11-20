import type { SeedLesson } from "../types";

export const mlLessons: SeedLesson[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "linear-regression",
    module: "supervised-learning",
    order: 1,
    title: "Linear Regression: Fitting a Line to Data",
    summary: "The simplest useful model: predict a number by drawing the best straight line through your data. Fit one by hand, then with scikit-learn.",
    difficulty: "beginner",
    minutes: 25,
    objectives: [
      "Explain what slope and intercept mean in a prediction",
      "Describe residuals and mean squared error",
      "Fit and use a linear regression model in scikit-learn",
    ],
    prerequisites: ["gradient-descent"],
    references: [
      { title: "scikit-learn — Linear Models", url: "https://scikit-learn.org/stable/modules/linear_model.html" },
      { title: "James et al. — An Introduction to Statistical Learning (free)", url: "https://www.statlearning.com/" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "If a student studies for 5 hours, what exam score should we expect? We have data from past students. **How do we turn that data into a prediction rule?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "Linear regression assumes the output changes by a roughly constant amount for each unit of input — a straight line:\n\n`predicted score = slope × hours + intercept`\n\n- **Slope:** how many extra points each hour of study is worth.\n- **Intercept:** the predicted score at 0 hours.\n\n“Learning” means choosing the slope and intercept that make the line fit the data best. “Best” means the **smallest average squared error**.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Stretching a rubber band", markdown: "Imagine each data point pulls on a stiff rod with a spring. The rod settles where the total pull is smallest — that is roughly the best-fit line.\n\n*Where it breaks down:* squared error means far-away points pull *much* harder than a spring would, which is why outliers can drag the line a lot." } },
      {
        type: "visualization",
        content: {
          component: "linear_regression",
          title: "Fit the line yourself",
          objective: "Build intuition for slope, intercept, residuals and mean squared error.",
          instructions: "Adjust the slope and intercept to make the dashed residual lines as short as possible. Watch your MSE. Reveal the best-fit line when you're done.",
          fallback: "The plot shows ten students' study hours and exam scores. A line is drawn with an adjustable slope and intercept. Dashed vertical lines (residuals) show the gap between each actual score and the line's prediction. Mean squared error (MSE) is the average of the squared residuals. The best-fit line for this data has a slope of about 5.1 points per hour and an intercept of about 45.8 — no other straight line has a lower MSE.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "With inputs `x` and targets `y`, the model is `ŷ = w·x + b`. The **residual** for example *i* is `yᵢ − ŷᵢ`. The loss is the **mean squared error**:\n\n```\nMSE = (1/n) · Σ (yᵢ − ŷᵢ)²\n```\n\nFor linear regression there is a closed-form solution (*ordinary least squares*), but the same loss can also be minimised with gradient descent — which is how the idea scales to neural networks.\n\nWith several input features, the model becomes `ŷ = w₁x₁ + w₂x₂ + … + b`. Each weight tells you how the prediction changes when that feature increases by one unit **while the others stay fixed**.\n\n**Assumptions to check:** the relationship is roughly linear, errors are not wildly different across the range, and there are no extreme outliers dominating the fit. Correlation in your data is **not** proof of causation.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Linear regression with scikit-learn",
          language: "python",
          code: "import numpy as np\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error\n\nhours = np.array([1, 2, 2.5, 3, 4, 4.5, 5, 6, 7, 8]).reshape(-1, 1)\nscores = np.array([52, 55, 61, 58, 67, 70, 68, 78, 80, 88])\n\nmodel = LinearRegression()\nmodel.fit(hours, scores)\n\nprint(f\"slope = {model.coef_[0]:.2f}, intercept = {model.intercept_:.2f}\")\nprint(f\"MSE = {mean_squared_error(scores, model.predict(hours)):.2f}\")\nprint(f\"Prediction for 5.5 hours: {model.predict([[5.5]])[0]:.1f}\")",
          expectedOutput: "slope = 5.10, intercept = 45.79\nMSE = 3.77\nPrediction for 5.5 hours: 73.8",
          explanation: "`reshape(-1, 1)` turns the 1-D array into a column, because scikit-learn expects a 2-D table of features (rows = examples, columns = features). `fit` finds the slope and intercept; `predict` uses them.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Interpret the model",
          task: "Using the fitted model above (slope ≈ 5.10, intercept ≈ 45.8):\n\n1. In plain English, what does the slope mean?\n2. Should we trust the prediction for a student who studies **20 hours**? Why or why not?",
          hints: ["Slope = change in prediction per one-unit change in input.", "What range of hours did we see in the training data?"],
          solution: "1. Each extra hour of study is associated with about **5.1 more exam points**, on average, in this data.\n2. **No.** 20 hours is far outside the training range (1–8 hours) — this is *extrapolation*. The line predicts about 148 points, which is impossible on a 100-point exam. Linear models don't know about real-world limits.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      { type: "rich_text", content: { title: "Real-world application", markdown: "Linear regression is still everywhere: forecasting demand, estimating house prices, measuring the effect of marketing spend. Its biggest strength is **interpretability** — you can read the weights. It's also the standard **baseline**: before using a complex model, check whether it actually beats linear regression." } },
      {
        type: "summary",
        content: {
          takeaways: ["Linear regression predicts a number with a weighted sum plus intercept.", "Residuals are prediction errors; MSE averages their squares.", "Fitting = choosing weights that minimise MSE.", "Beware extrapolation and outliers."],
          terms: [
            { term: "Residual", definition: "Actual value minus predicted value." },
            { term: "MSE", definition: "Mean squared error — the average squared residual." },
            { term: "Extrapolation", definition: "Predicting outside the range of the training data." },
          ],
          misconceptions: ["A strong fit proves that X causes Y — it only shows association."],
        },
      },
    ],
    quiz: {
      title: "Linear regression",
      questions: [
        { type: "single", prompt: "In `score = 5 × hours + 40`, what does 40 represent?", options: ["Points gained per hour", "The predicted score at 0 hours", "The maximum possible score", "The error of the model"], answer: [1], explanation: "The intercept is the prediction when the input is 0." },
        { type: "single", prompt: "Why does MSE square the residuals?", options: ["To make all errors positive and penalise large errors more", "To make the numbers smaller", "Because squares are faster to compute", "To ignore outliers"], answer: [0], explanation: "Squaring removes signs (so errors don't cancel) and gives large errors more weight." },
        { type: "true_false", prompt: "A linear regression trained on 1–8 hours of study can safely predict scores for 20 hours.", answer: [1], explanation: "False — that is extrapolation far outside the training data, where the linear assumption may not hold." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "decision-trees",
    module: "supervised-learning",
    order: 2,
    title: "Decision Trees: Learning by Asking Questions",
    summary: "A decision tree classifies by asking a sequence of yes/no questions. Build one by hand and learn how algorithms choose good questions.",
    difficulty: "beginner",
    minutes: 25,
    objectives: [
      "Read a decision tree and trace a prediction",
      "Explain how Gini impurity guides the choice of splits",
      "Recognise how depth leads to overfitting",
    ],
    prerequisites: ["linear-regression"],
    references: [
      { title: "scikit-learn — Decision Trees", url: "https://scikit-learn.org/stable/modules/tree.html" },
      { title: "Breiman et al. — Classification and Regression Trees (1984)", url: "https://doi.org/10.1201/9781315139470" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "A doctor might reason: “Is the temperature above 38°C? If yes, is there a rash?…” **Can a machine learn a set of questions like that from data?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "A **decision tree** is a flowchart of yes/no questions about the input's features.\n\n- Each **internal node** asks a question, like *hours slept < 5?*\n- Each **branch** is an answer.\n- Each **leaf** gives a prediction — the most common class of the training examples that ended up there.\n\nTraining picks the questions that best **separate** the classes. A good question produces groups that are as “pure” as possible (mostly one class).",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Twenty questions", markdown: "Like the game *Twenty Questions*, good early questions split the possibilities roughly in half and quickly narrow things down.\n\n*Where it breaks down:* in the game you can ask anything; a decision tree only asks threshold questions about the features it's given." } },
      {
        type: "visualization",
        content: {
          component: "decision_tree",
          title: "Build a tree by hand",
          objective: "See how split choices carve the feature space into regions and change accuracy.",
          instructions: "Change the root question's feature and threshold. Then enable a second split on one branch. Look at the Gini impurity of each leaf to decide where to split next.",
          fallback: "Twenty-two students are plotted by hours studied and hours slept, marked as passed or failed. A first split on 'hours slept < 5' puts all low-sleep students in a leaf that predicts fail (pure, Gini 0). The other branch is mixed (Gini around 0.46). Splitting that branch again on 'hours studied < 4' separates it perfectly, giving 100% training accuracy with a depth-2 tree.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "For a node containing a fraction `p` of class A and `1 − p` of class B, **Gini impurity** is:\n\n```\nGini = 1 − p² − (1 − p)²\n```\n\nIt is 0 for a pure node and 0.5 for a 50/50 binary mix. To choose a split, the algorithm tries every feature and candidate threshold, computes the **weighted average impurity** of the two children, and picks the split with the largest decrease. It then repeats on each child — a *greedy* procedure.\n\n**Overfitting:** a tree allowed to grow without limit can keep splitting until every leaf holds a single training example — 100% training accuracy, but it has memorised noise. Controls include `max_depth`, `min_samples_leaf`, and pruning. Ensembles such as **random forests** and **gradient-boosted trees** combine many trees to reduce this variance and are among the strongest methods for tabular data.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Training a tree with scikit-learn",
          language: "python",
          code: "from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier, export_text\n\nX, y = load_iris(return_X_y=True, as_frame=True)\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)\n\ntree = DecisionTreeClassifier(max_depth=2, random_state=0)\ntree.fit(X_train, y_train)\n\nprint(export_text(tree, feature_names=list(X.columns)))\nprint(f\"Test accuracy: {tree.score(X_test, y_test):.2f}\")",
          expectedOutput: "|--- petal width (cm) <= 0.75\n|   |--- class: 0\n|--- petal width (cm) >  0.75\n|   |--- petal length (cm) <= 4.95\n|   |   |--- class: 1\n|   |--- petal length (cm) >  4.95\n|   |   |--- class: 2\n\nTest accuracy: 0.91",
          explanation: "`max_depth=2` limits the tree to two levels of questions. `export_text` prints the learned rules — one of the main advantages of trees is that you can read them. Exact thresholds can vary slightly between scikit-learn versions.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Calculate impurity",
          task: "A leaf contains 8 students who passed and 2 who failed. Calculate its Gini impurity. Is this leaf more or less pure than one with 5 passed and 5 failed?",
          hints: ["p = 8/10 = 0.8.", "Gini = 1 − 0.8² − 0.2²."],
          solution: "Gini = 1 − 0.64 − 0.04 = **0.32**. A 5/5 leaf has Gini = 1 − 0.25 − 0.25 = 0.5, so the 8/2 leaf is **purer** (lower impurity).",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["Trees predict by following yes/no questions to a leaf.", "Splits are chosen greedily to reduce impurity (e.g. Gini).", "Deep trees overfit; limit depth or use ensembles.", "Trees are easy to read and explain."],
          terms: [
            { term: "Leaf", definition: "A final node that outputs a prediction." },
            { term: "Gini impurity", definition: "A measure of how mixed the classes in a node are (0 = pure)." },
            { term: "Overfitting", definition: "Fitting the training data so closely that performance on new data suffers." },
          ],
          misconceptions: ["100% training accuracy means a great model — it often means overfitting. Always check on held-out test data."],
        },
      },
    ],
    quiz: {
      title: "Decision trees",
      questions: [
        { type: "single", prompt: "What is the Gini impurity of a perfectly pure node?", options: ["0", "0.5", "1", "It depends on the number of samples"], answer: [0], explanation: "If every example in the node has the same class, Gini = 1 − 1² = 0." },
        { type: "single", prompt: "A tree reaches 100% training accuracy but 65% on test data. What is most likely happening?", options: ["Underfitting", "Overfitting", "Data leakage is impossible", "The test set is too large"], answer: [1], explanation: "A large gap between training and test performance is the classic sign of overfitting." },
        { type: "multiple", prompt: "Which settings help limit overfitting in a decision tree? (Select all that apply)", options: ["max_depth", "min_samples_leaf", "Removing the test set", "Pruning"], answer: [0, 1, 3], explanation: "Limiting depth, requiring a minimum number of samples per leaf, and pruning all restrict complexity." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "k-means-clustering",
    module: "unsupervised-learning",
    order: 1,
    title: "K-Means Clustering: Finding Groups Without Labels",
    summary: "No labels? K-means can still discover groups in your data. Step through the algorithm and learn why initialisation matters.",
    difficulty: "beginner",
    minutes: 20,
    objectives: [
      "Describe the difference between supervised and unsupervised learning",
      "Explain the assignment and update steps of K-means",
      "Recognise sensitivity to initialisation and the choice of k",
    ],
    prerequisites: ["numpy-fundamentals"],
    references: [
      { title: "scikit-learn — Clustering: K-means", url: "https://scikit-learn.org/stable/modules/clustering.html#k-means" },
      { title: "Arthur & Vassilvitskii (2007) — k-means++", url: "https://dl.acm.org/doi/10.5555/1283383.1283494" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "A shop has data on thousands of customers but no labels saying which “type” each customer is. **Can an algorithm discover natural groups by itself?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "In **unsupervised learning** there are no correct answers to learn from — only the data. Clustering finds groups of points that are close together.\n\n**K-means** works like this:\n\n1. Choose **k**, the number of groups, and place k **centroids** (group centres) somewhere.\n2. **Assign:** each point joins its nearest centroid.\n3. **Update:** move each centroid to the average position of its points.\n4. Repeat 2–3 until nothing changes.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Placing ice-cream vans", markdown: "Put k ice-cream vans on a beach. Each person walks to the nearest van. Then each van moves to the middle of its crowd. Repeat — the vans settle in the busiest areas.\n\n*Where it breaks down:* real people have preferences; K-means only uses straight-line distance, so it struggles with long, curved or very unequal-sized groups." } },
      {
        type: "diagram",
        content: { title: "The K-means loop", layout: "cycle", description: "A repeating cycle of two steps: assign each point to its nearest centroid, then move each centroid to the mean of its assigned points. The loop stops when assignments stop changing.", nodes: [{ label: "Assign points", detail: "Each point → nearest centroid" }, { label: "Update centroids", detail: "Each centroid → mean of its points" }] },
      },
      {
        type: "visualization",
        content: {
          component: "kmeans",
          title: "K-means simulator",
          objective: "Watch K-means converge step by step and see how starting positions and k affect the result.",
          instructions: "Press Assign, then Move centroids, a few times. Then try 'New random start' several times and compare the final inertia. Try k = 2 and k = 5 too.",
          fallback: "Fifty-four points form three visible groups. Centroids start at random positions. Each assignment step colours every point by its nearest centroid; each update step moves centroids to the centre of their points. After a few iterations the centroids stop moving. Some random starts converge to the three natural groups (low inertia); others get stuck with two centroids sharing one group (higher inertia). Choosing k = 2 merges groups; k = 5 splits natural groups apart.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "K-means minimises **inertia** — the sum of squared distances from each point to its assigned centroid. Both steps can only decrease (or keep) inertia, so the algorithm always converges — but only to a **local** minimum.\n\nPractical fixes:\n\n- **k-means++ initialisation** spreads starting centroids out (scikit-learn's default).\n- **Multiple restarts** (`n_init`) keep the run with the lowest inertia.\n- **Scale your features** first — otherwise a feature measured in thousands dominates distance.\n\n**Choosing k:** inertia always decreases as k grows, so look for an *elbow* in the inertia curve, or use the *silhouette score*. Domain knowledge matters most: clusters are only useful if they mean something.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "K-means in scikit-learn",
          language: "python",
          code: "import numpy as np\nfrom sklearn.cluster import KMeans\n\nrng = np.random.default_rng(0)\nX = np.vstack([\n    rng.normal([2, 2], 0.8, size=(50, 2)),\n    rng.normal([7, 3], 0.8, size=(50, 2)),\n    rng.normal([5, 8], 0.8, size=(50, 2)),\n])\n\nkmeans = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)\nprint(np.round(kmeans.cluster_centers_, 1))\nprint(\"inertia:\", round(kmeans.inertia_, 1))",
          expectedOutput: "[[6.9 3. ]\n [4.7 8.1]\n [2.  2.1]]\ninertia: 193.5",
          explanation: "The learned centroids land close to the true centres we used to generate the data. Cluster numbering is arbitrary — cluster 0 has no special meaning.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Spot the scaling problem",
          task: "You cluster customers using two features: **annual spend** (€100–€50,000) and **visits per month** (1–20). The clusters only seem to depend on spend. Why, and how would you fix it?",
          hints: ["K-means uses Euclidean distance.", "Which feature has the larger numeric range?"],
          solution: "Distances are dominated by annual spend because its numbers are thousands of times larger, so visits barely affect which centroid is nearest. **Standardise** both features (e.g. with `StandardScaler`, giving each mean 0 and standard deviation 1) before clustering.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["Unsupervised learning finds structure without labels.", "K-means alternates assignment and centroid update.", "It converges to a local minimum — use k-means++ and restarts.", "Scale features and choose k thoughtfully."],
          terms: [
            { term: "Centroid", definition: "The centre (mean) of a cluster." },
            { term: "Inertia", definition: "Sum of squared distances from points to their centroid." },
            { term: "Unsupervised learning", definition: "Learning patterns from data without target labels." },
          ],
          misconceptions: ["K-means discovers the “true” number of groups — you choose k, and the algorithm will always return k clusters."],
        },
      },
    ],
    quiz: {
      title: "K-means",
      questions: [
        { type: "single", prompt: "In the update step, each centroid moves to…", options: ["The nearest data point", "The mean of the points assigned to it", "A random location", "The origin"], answer: [1], explanation: "The update step sets each centroid to the average of its assigned points." },
        { type: "true_false", prompt: "K-means always finds the best possible clustering.", answer: [1], explanation: "False. It converges to a local minimum that depends on initialisation, which is why restarts and k-means++ are used." },
        { type: "single", prompt: "Why should features usually be scaled before K-means?", options: ["To make the algorithm run on GPUs", "Because distance is dominated by features with large numeric ranges", "Because K-means requires values between 0 and 1", "To increase k"], answer: [1], explanation: "Unscaled features with large ranges dominate Euclidean distance." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "precision-recall-and-the-confusion-matrix",
    module: "model-evaluation",
    order: 1,
    title: "Precision, Recall and the Confusion Matrix",
    summary: "“95% accurate” can describe a useless model. Learn the metrics that reveal what kind of mistakes a classifier makes.",
    difficulty: "intermediate",
    minutes: 25,
    objectives: [
      "Build and read a confusion matrix",
      "Calculate accuracy, precision, recall and F1",
      "Choose a decision threshold based on the real-world cost of errors",
    ],
    prerequisites: ["decision-trees"],
    references: [
      { title: "Google ML Crash Course — Classification: Accuracy, recall, precision", url: "https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall" },
      { title: "scikit-learn — Classification metrics", url: "https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "A disease affects 1 in 100 people. A model that **always** says “healthy” is 99% accurate. **Is it a good model?**\n\nObviously not — it never finds a single sick patient. We need better ways to measure classifiers." } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "For a yes/no classifier, every prediction lands in one of four boxes — the **confusion matrix**:\n\n| | Predicted positive | Predicted negative |\n|---|---|---|\n| **Actually positive** | True positive (TP) | False negative (FN) — *missed* |\n| **Actually negative** | False positive (FP) — *false alarm* | True negative (TN) |\n\nFrom these:\n\n- **Precision** = TP / (TP + FP): *when the model says yes, how often is it right?*\n- **Recall** = TP / (TP + FN): *of all the real yeses, how many did it find?*",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Fishing with a net", markdown: "**Recall** is how many of the fish in the lake you caught. **Precision** is how much of what's in your net is actually fish (not boots and weeds). A huge net catches more fish (recall ↑) but also more junk (precision ↓).\n\n*Where it breaks down:* in real problems the cost of “junk” and “missed fish” can be very different — which is the whole point." } },
      {
        type: "visualization",
        content: {
          component: "confusion_matrix",
          title: "Move the threshold",
          objective: "See how one decision threshold trades precision against recall.",
          instructions: "Slide the threshold from high to low and watch the four boxes and the metrics change. Then solve the screening challenge.",
          fallback: "Twenty patients have model risk scores between 0 and 1; ten have the condition. Cases at or above the threshold are flagged. At a high threshold (0.8) only four sick patients are flagged with no false alarms: precision 100%, recall 40%. At 0.5, recall and precision are both 70%. At 0.34, recall reaches 90% while precision is 75%. At 0.1, recall is 100% but precision falls to about 56%. Accuracy changes much less dramatically and hides this trade-off.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "Most classifiers output a **score** or probability; a threshold turns it into a yes/no. Lowering the threshold increases recall and usually decreases precision.\n\n- **Accuracy** = (TP + TN) / total — misleading with imbalanced classes.\n- **F1 score** = 2 · precision · recall / (precision + recall) — the harmonic mean, high only if both are high.\n- **Precision–recall curves** and **ROC curves** show performance across *all* thresholds; the area under them (PR-AUC, ROC-AUC) summarises it.\n\n**Choosing the threshold is a product decision, not a purely technical one.** Cancer screening favours recall (missing a case is very costly; follow-up tests catch false alarms). A spam filter favours precision (sending a real email to spam is worse than letting one spam through).\n\nAlways compute these metrics on a **held-out test set**, never on training data.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Metrics in scikit-learn",
          language: "python",
          code: "from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score\n\ny_true = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]\ny_pred = [1, 1, 1, 0, 1, 0, 0, 0, 0, 0]\n\nprint(confusion_matrix(y_true, y_pred))   # rows: actual 0,1  cols: predicted 0,1\nprint(\"precision\", precision_score(y_true, y_pred))\nprint(\"recall   \", recall_score(y_true, y_pred))\nprint(\"f1       \", round(f1_score(y_true, y_pred), 2))",
          expectedOutput: "[[5 1]\n [1 3]]\nprecision 0.75\nrecall    0.75\nf1        0.75",
          explanation: "Note scikit-learn orders the matrix by label value: the first row is actual class 0. So `[[TN, FP], [FN, TP]]` — easy to misread, so always check the layout.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Pick the metric",
          task: "For each system, which matters more — precision or recall? Justify in one sentence.\n\n1. Flagging possibly fraudulent card payments for a human to review.\n2. Automatically deleting comments as hate speech with no human review.",
          hints: ["What happens after a false positive in each case?", "What happens after a false negative?"],
          solution: "1. **Recall** — a human reviews flags, so false alarms are cheap, but missed fraud costs money.\n2. **Precision** — wrongly deleting legitimate speech with no review is harmful, so be confident before acting (and ideally add human review).",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["Accuracy can hide failure on imbalanced data.", "Precision: how trustworthy a positive prediction is. Recall: how many real positives are found.", "The threshold trades one for the other.", "Choose based on the real-world cost of each kind of error."],
          terms: [
            { term: "False positive", definition: "Predicted positive, actually negative (false alarm)." },
            { term: "False negative", definition: "Predicted negative, actually positive (missed case)." },
            { term: "F1 score", definition: "Harmonic mean of precision and recall." },
          ],
          misconceptions: ["“Higher accuracy is always better.” A 99%-accurate model can find zero positive cases."],
        },
      },
    ],
    quiz: {
      title: "Classification metrics",
      questions: [
        { type: "single", prompt: "A model has 40 TP, 10 FP and 40 FN. What is its recall?", options: ["0.8", "0.5", "0.4", "0.25"], answer: [1], explanation: "Recall = TP / (TP + FN) = 40 / 80 = 0.5." },
        { type: "single", prompt: "Same model (40 TP, 10 FP, 40 FN). What is its precision?", options: ["0.8", "0.5", "0.4", "0.2"], answer: [0], explanation: "Precision = TP / (TP + FP) = 40 / 50 = 0.8." },
        { type: "single", prompt: "Lowering the decision threshold usually…", options: ["Increases recall and decreases precision", "Increases precision and decreases recall", "Increases both", "Changes neither"], answer: [0], explanation: "More cases are flagged positive, so more real positives are found but more false alarms appear." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "the-artificial-neuron",
    module: "neural-network-foundations",
    order: 1,
    title: "The Artificial Neuron",
    summary: "Every neural network — up to the largest language models — is built from one simple unit. Build one yourself and make it compute logic.",
    difficulty: "beginner",
    minutes: 20,
    objectives: [
      "Compute a neuron's output from inputs, weights and bias",
      "Compare step, sigmoid and ReLU activation functions",
      "Explain why networks need many neurons and non-linear activations",
    ],
    references: [
      { title: "Nielsen — Neural Networks and Deep Learning, Chapter 1 (free)", url: "http://neuralnetworksanddeeplearning.com/chap1.html" },
      { title: "Goodfellow et al. — Deep Learning, Chapter 6", url: "https://www.deeplearningbook.org/contents/mlp.html" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "Large language models have billions of parameters. That sounds impossibly complex — but they are built from a very simple repeated unit. **What does a single artificial neuron actually do?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "An artificial neuron does three things:\n\n1. **Weigh** each input — multiply it by a weight that says how important it is (and whether it pushes up or down).\n2. **Add** them up, plus a **bias** that shifts the result.\n3. **Activate** — pass the total through a simple function that decides the output.\n\nLearning means adjusting the weights and bias (with gradient descent!) so the outputs become useful.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Deciding whether to go out", markdown: "Inputs: *is it sunny?*, *are friends going?* Weights: how much you care about each. Bias: how much you like going out in general. If the weighted total passes your threshold, you go.\n\n*Where it breaks down:* biological neurons are far more complex — the artificial neuron is a loose mathematical inspiration, not a model of the brain." } },
      {
        type: "diagram",
        content: { title: "Inside a neuron", layout: "flow", description: "Inputs x1 and x2 are each multiplied by weights w1 and w2, summed together with a bias b to give z, and z is passed through an activation function to produce the output y.", nodes: [{ label: "Inputs x₁, x₂" }, { label: "× weights w₁, w₂" }, { label: "Sum + bias b → z" }, { label: "Activation f(z)" }, { label: "Output y" }] },
      },
      {
        type: "visualization",
        content: {
          component: "neuron_playground",
          title: "Neuron playground",
          objective: "Understand how weights, bias and activation shape a neuron's output.",
          instructions: "Move each slider and watch the weighted sum and output. Switch activation functions. Then find weights and a bias that make the truth table match an AND gate.",
          fallback: "A neuron computes z = w1·x1 + w2·x2 + b and applies an activation. With step activation it outputs 1 when z ≥ 0. Setting w1 = 1, w2 = 1 and b = −1.5 makes it an AND gate: only when both inputs are 1 does z (= 0.5) reach zero or above. Sigmoid gives a smooth value between 0 and 1; ReLU outputs z when positive and 0 otherwise.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "In vector form, a neuron computes `y = f(w · x + b)`.\n\nCommon activations:\n\n- **Step:** 1 if z ≥ 0, else 0. Historical (the *perceptron*), but its gradient is zero almost everywhere, so it can't be trained with gradient descent.\n- **Sigmoid:** `1 / (1 + e^(−z))`, smooth between 0 and 1. Useful for probabilities in the output layer.\n- **ReLU:** `max(0, z)`. Simple, fast, and the default in hidden layers of modern networks.\n\n**Why activations must be non-linear:** stacking layers of purely linear neurons collapses into one big linear function — no more powerful than a single layer. Non-linear activations let deep networks represent curved, complex relationships.\n\n**Why one neuron isn't enough:** a single neuron draws one straight boundary. It can do AND and OR, but famously **not XOR** (output 1 when inputs differ). Two layers of neurons can — the start of *deep* learning.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "A neuron in Python",
          language: "python",
          code: "import numpy as np\n\ndef neuron(x, w, b, activation=\"relu\"):\n    z = np.dot(w, x) + b\n    if activation == \"step\":\n        return 1 if z >= 0 else 0\n    if activation == \"sigmoid\":\n        return 1 / (1 + np.exp(-z))\n    return max(0.0, z)  # ReLU\n\nw, b = np.array([1.0, 1.0]), -1.5\nfor x in [(0, 0), (0, 1), (1, 0), (1, 1)]:\n    print(x, neuron(np.array(x), w, b, \"step\"))",
          expectedOutput: "(0, 0) 0\n(0, 1) 0\n(1, 0) 0\n(1, 1) 1",
          explanation: "With these weights and bias the neuron implements AND. `np.dot(w, x)` is the weighted sum w₁x₁ + w₂x₂.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Make an OR gate",
          task: "Using step activation, find weights and a bias so the neuron outputs 1 if **either** input is 1 (OR gate). Test it in the playground.",
          hints: ["Keep w₁ = w₂ = 1.", "You want z ≥ 0 when the sum of inputs is 1 or 2, and z < 0 when it is 0."],
          solution: "w₁ = 1, w₂ = 1, **b = −0.5**. Then (0,0) → z = −0.5 → 0; (0,1) or (1,0) → z = 0.5 → 1; (1,1) → z = 1.5 → 1.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["A neuron computes a weighted sum plus bias, then applies an activation.", "Weights set importance and direction; bias shifts the threshold.", "Non-linear activations are what make deep networks powerful.", "A single neuron can't solve XOR — layers can."],
          terms: [
            { term: "Weight", definition: "A learned number that scales an input's influence." },
            { term: "Bias", definition: "A learned offset added before activation." },
            { term: "Activation function", definition: "A function applied to the weighted sum, such as ReLU or sigmoid." },
          ],
          misconceptions: ["Artificial neurons work like brain cells — they are a loose, simplified mathematical inspiration."],
        },
      },
    ],
    quiz: {
      title: "The artificial neuron",
      questions: [
        { type: "single", prompt: "Inputs (1, 0), weights (2, 3), bias −1. What is z?", options: ["1", "2", "4", "5"], answer: [0], explanation: "z = 2×1 + 3×0 + (−1) = 1." },
        { type: "single", prompt: "ReLU applied to z = −3 gives…", options: ["−3", "0", "3", "0.05"], answer: [1], explanation: "ReLU(z) = max(0, z), so negative values become 0." },
        { type: "single", prompt: "Why do neural networks need non-linear activation functions?", options: ["To make training faster", "Without them, stacked layers collapse into a single linear function", "To reduce the number of weights", "They are only needed for images"], answer: [1], explanation: "A composition of linear functions is still linear, so depth would add no expressive power." },
      ],
    },
  },
];
