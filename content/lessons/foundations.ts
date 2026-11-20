import type { SeedLesson } from "../types";

export const foundationLessons: SeedLesson[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "ai-vs-ml-vs-deep-learning",
    module: "what-is-ai",
    order: 1,
    title: "AI vs Machine Learning vs Deep Learning",
    summary: "Three terms that are often used interchangeably, but they are not the same thing. Learn how they fit together and why it matters.",
    difficulty: "beginner",
    minutes: 15,
    objectives: [
      "Define artificial intelligence, machine learning and deep learning in plain English",
      "Explain how the three relate to each other",
      "Classify real systems as rule-based AI, machine learning or deep learning",
    ],
    references: [
      { title: "Stanford Encyclopedia of Philosophy: Artificial Intelligence", url: "https://plato.stanford.edu/entries/artificial-intelligence/" },
      { title: "Google: Machine Learning Glossary", url: "https://developers.google.com/machine-learning/glossary" },
      { title: "Goodfellow, Bengio & Courville: Deep Learning (free online book)", url: "https://www.deeplearningbook.org/" },
    ],
    blocks: [
      {
        type: "rich_text",
        content: {
          title: "The big question",
          markdown:
            "Your phone recognises your face. Your email hides spam. A chatbot writes a poem. A route planner finds the fastest way home.\n\nPeople call **all** of these “AI”. But under the hood they work in very different ways, and knowing the difference helps you understand what a system can do, what it needs, and how it might fail.\n\nIn this lesson you will learn the three nested terms that everyone uses (and many people mix up).",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown:
            "- **Artificial Intelligence (AI)** is the broad goal: getting computers to do tasks we associate with human intelligence: recognising things, making decisions, understanding language, planning.\n- **Machine Learning (ML)** is one *way* to build AI. Instead of a programmer writing every rule, the system **learns patterns from examples** (data).\n- **Deep Learning (DL)** is one *kind* of machine learning. It uses **neural networks with many layers** that can learn directly from raw data like pixels, sound waves or text.\n\nSo: all deep learning is machine learning, and all machine learning is AI, but not the other way round. A chess program that follows rules written by programmers is AI, but it is not machine learning.",
        },
      },
      {
        type: "callout",
        content: {
          variant: "analogy",
          title: "Cooking",
          markdown:
            "**AI** is “making dinner”. **Rule-based AI** is following a recipe exactly. **Machine learning** is learning to cook by tasting many dishes and adjusting. **Deep learning** is a particular learning style that can work from raw ingredients without anyone telling you which flavours to pay attention to.\n\n*Where the analogy stops working:* a model does not “taste” or understand food. It adjusts numbers to reduce a measurable error: nothing more.",
        },
      },
      {
        type: "diagram",
        content: {
          title: "Nested, not separate",
          layout: "nested",
          description:
            "Three nested boxes. The outer box is Artificial Intelligence. Inside it is Machine Learning. Inside that is Deep Learning. Generative AI models such as large language models sit inside Deep Learning.",
          nodes: [
            { label: "Artificial Intelligence", detail: "Any technique for intelligent behaviour, including hand-written rules and search." },
            { label: "Machine Learning", detail: "Systems that learn patterns from data." },
            { label: "Deep Learning", detail: "Machine learning with many-layered neural networks." },
            { label: "Generative AI / LLMs", detail: "Deep learning models that generate text, images or audio." },
          ],
        },
      },
      {
        type: "visualization",
        content: {
          component: "ai_ml_dl_explorer",
          title: "Explore and classify",
          objective: "Understand how the three terms nest, then practise classifying real systems.",
          instructions: "Select each circle to read its definition. Then classify the six systems on the right and check your answers.",
          fallback:
            "AI is the outer circle and includes rule-based systems and search algorithms (for example, a route planner using A* search). Machine learning sits inside AI and covers systems that learn from data (for example, a spam filter trained on labelled emails). Deep learning sits inside machine learning and uses multi-layer neural networks (for example, face unlock or a large-language-model chatbot).",
        },
      },
      {
        type: "comparison",
        content: {
          title: "Side by side",
          columns: ["Rule-based AI", "Machine learning", "Deep learning"],
          rows: [
            { label: "Where knowledge comes from", values: ["Rules written by people", "Patterns learned from data", "Patterns learned from large amounts of data"] },
            { label: "Typical data needs", values: ["None (but needs experts)", "Hundreds to millions of examples", "Often millions of examples"] },
            { label: "Feature design", values: ["Fully manual", "Often hand-crafted features", "Learns features from raw data"] },
            { label: "Explainability", values: ["High: you can read the rules", "Medium", "Low: hard to inspect"] },
            { label: "Example", values: ["Tax-rule checker", "Credit-risk scoring", "Speech recognition"] },
          ],
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown:
            "In traditional programming you write a function `f` by hand: inputs go in, your rules produce outputs.\n\nIn machine learning you supply **inputs and the desired outputs** (training data), choose a **model family** (for example, a line, a tree or a neural network) and a **loss function** that measures error. A training algorithm then searches for the model **parameters** that make the loss small.\n\nDeep learning uses model families built from layers of simple units (neurons). Stacking layers lets the network build up its own **representations**: edges → shapes → faces, instead of relying on features a human designed.\n\n> Modern AI products usually combine all three: a deep model for perception or language, classic ML for ranking or scoring, and hand-written rules for safety checks and business logic.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Classify three systems",
          task: "For each system, decide whether it is best described as rule-based AI, (classic) machine learning, or deep learning, and write one sentence explaining why:\n\n1. A bank flags transactions over €10,000 sent to a new country.\n2. A shop predicts next month's sales from past sales using linear regression.\n3. An app turns a photo of handwriting into typed text.",
          hints: ["Ask: did a person write the decision rule, or was it learned from examples?", "Is the input raw pixels/audio/text? That usually points to deep learning."],
          solution:
            "1. **Rule-based AI**: a person wrote the threshold rule.\n2. **Machine learning**: the relationship is learned from historical data, with a classic algorithm.\n3. **Deep learning**: reading handwriting from raw pixels is typically done with neural networks.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "rich_text",
        content: {
          title: "Real-world application",
          markdown:
            "When someone says a product “uses AI”, ask three questions:\n\n1. **What does it learn from?** (rules, data, or both)\n2. **What happens when the data changes?** ML systems can quietly get worse when the world changes. This is called *data drift*.\n3. **Can its decisions be explained?** Important in hiring, lending and healthcare.\n\nThese questions come straight from the distinctions you learned today.",
        },
      },
      {
        type: "summary",
        content: {
          takeaways: [
            "AI is the broad goal of intelligent behaviour; ML and DL are approaches inside it.",
            "Machine learning learns patterns from data instead of following hand-written rules.",
            "Deep learning is machine learning with many-layered neural networks that learn features from raw data.",
            "Real products often combine rules, classic ML and deep learning.",
          ],
          terms: [
            { term: "Model", definition: "A mathematical function with adjustable parameters that maps inputs to outputs." },
            { term: "Training", definition: "Adjusting a model's parameters so its outputs match examples." },
            { term: "Neural network", definition: "A model made of layers of simple connected units (neurons)." },
          ],
          misconceptions: ["“AI” always means machine learning. Rule-based and search systems are AI too.", "Deep learning is always better. For small, structured datasets classic ML often wins."],
        },
      },
    ],
    quiz: {
      title: "AI, ML and DL",
      questions: [
        { type: "single", prompt: "Which statement is correct?", options: ["All AI is deep learning", "All deep learning is machine learning", "Machine learning and AI are unrelated", "Deep learning does not use data"], answer: [1], explanation: "Deep learning is a subset of machine learning, which is a subset of AI." },
        { type: "single", prompt: "A route planner uses the A* search algorithm with no training data. It is best described as…", options: ["Rule-based / classical AI", "Machine learning", "Deep learning", "Not AI at all"], answer: [0], explanation: "Search algorithms are classical AI techniques. They don't learn from data." },
        { type: "multiple", prompt: "Which are typical characteristics of deep learning? (Select all that apply)", options: ["Uses many-layered neural networks", "Can learn features from raw data such as pixels", "Requires programmers to write every decision rule", "Often needs large amounts of data"], answer: [0, 1, 3], explanation: "Deep learning learns its own features from raw data with multi-layer networks, usually from large datasets. Hand-written rules describe rule-based AI." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "hallucinations-bias-and-privacy",
    module: "what-is-ai",
    order: 2,
    title: "Limitations of AI: Hallucinations, Bias and Privacy",
    summary: "AI systems can be confidently wrong, unfair and leaky. Learn why these failures happen and what you can do about them.",
    difficulty: "beginner",
    minutes: 15,
    objectives: [
      "Explain what a hallucination is and why language models produce them",
      "Describe how bias enters an AI system through data and design",
      "Apply practical habits to reduce privacy and accuracy risks when using AI tools",
    ],
    prerequisites: ["ai-vs-ml-vs-deep-learning"],
    references: [
      { title: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
      { title: "Buolamwini & Gebru (2018): Gender Shades", url: "https://proceedings.mlr.press/v81/buolamwini18a.html" },
      { title: "OECD AI Principles", url: "https://oecd.ai/en/ai-principles" },
    ],
    blocks: [
      {
        type: "rich_text",
        content: {
          title: "The big question",
          markdown: "A chatbot gives you a perfectly formatted citation for a research paper. You search for it. **It doesn't exist.**\n\nHow can a system be so fluent and so wrong at the same time? And if it can be wrong about facts, what else might it get wrong?",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown:
            "AI systems learn patterns from data. That gives them three built-in weak spots:\n\n1. **Hallucinations**: a language model generates text that *sounds* plausible, because it predicts likely next words. Sounding plausible and being true are different things.\n2. **Bias**: if the training data under-represents some groups, or reflects past unfair decisions, the model learns those patterns too.\n3. **Privacy**: anything you type into an AI tool may be stored, reviewed, or used for training, depending on the provider and settings. Models can also memorise rare training data.",
        },
      },
      {
        type: "callout",
        content: {
          variant: "analogy",
          title: "The confident autocomplete",
          markdown: "A language model is a bit like an extremely well-read autocomplete. If you start typing “The capital of Australia is…”, it continues with the most likely words. Usually that is right, but if the most likely-*sounding* continuation is wrong, it will write that just as confidently.\n\n*Where it breaks down:* modern models do much more than simple autocomplete. They can reason through steps and use tools. But they still have no built-in guarantee of truth.",
        },
      },
      {
        type: "diagram",
        content: {
          title: "Where bias can enter",
          layout: "flow",
          description: "A five-step pipeline: data collection, labelling, model training, evaluation, deployment. Bias can enter at every step. For example unrepresentative data, inconsistent labels, objectives that ignore fairness, tests that only use one group, and use in contexts the model wasn't designed for.",
          nodes: [
            { label: "Collect data", detail: "Who is missing?" },
            { label: "Label data", detail: "Whose judgement?" },
            { label: "Train model", detail: "What is optimised?" },
            { label: "Evaluate", detail: "Tested on whom?" },
            { label: "Deploy", detail: "Used how, and where?" },
          ],
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown:
            "**Why hallucinations happen.** A language model is trained to predict the next token given previous tokens. It produces a *probability distribution* over possible continuations and samples from it. Nothing in that objective directly checks facts. Hallucinations become more likely when:\n\n- the question is about rare or recent information the model saw little of,\n- the prompt pressures the model to answer rather than say “I don't know”,\n- the answer needs exact details (numbers, citations, names).\n\n**Mitigations** include grounding answers in retrieved documents (RAG, covered later), asking for sources and verifying them, and designing systems that allow “I don't know”.\n\n**Bias** is measured by comparing error rates across groups. The *Gender Shades* study found commercial face-analysis systems had much higher error rates for darker-skinned women than lighter-skinned men: a direct result of unbalanced training and test data.\n\n**Privacy.** Treat prompts like emails to a third party. Check the provider's data-retention and training settings, and never paste secrets, passwords or other people's personal data without permission.",
        },
      },
      {
        type: "callout",
        content: { variant: "warning", title: "A rule of thumb", markdown: "The more an answer matters (health, money, law, grades, someone's reputation), the more you must **verify it with a reliable source**. Fluency is not evidence." },
      },
      {
        type: "practice",
        content: {
          title: "Spot the risk",
          task: "A student pastes a classmate's full essay (with the classmate's name) into a free chatbot and asks it to “find the citations for each claim”. List **two** risks in this situation and **one** safer way to do it.",
          hints: ["Think about whose data is being shared.", "What might the chatbot do when asked to find citations?"],
          solution: "**Risks:** (1) privacy: sharing someone else's work and name without permission with a third party that may retain it; (2) hallucination: the chatbot may invent citations that look real.\n\n**Safer approach:** remove personal details, get permission, and use the chatbot only to suggest *search terms*, then find and verify sources in a library database yourself.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: [
            "Language models predict likely text; plausibility is not truth, so they can hallucinate.",
            "Bias can enter at every stage: data, labels, objectives, evaluation and deployment.",
            "Treat anything you send to an AI tool as shared with a third party.",
            "Verify important outputs against reliable sources.",
          ],
          terms: [
            { term: "Hallucination", definition: "Fluent output that is false or unsupported by the input or sources." },
            { term: "Algorithmic bias", definition: "Systematic differences in a model's errors or outcomes across groups." },
            { term: "Grounding", definition: "Constraining a model's answer to provided, verifiable sources." },
          ],
          misconceptions: ["“If the AI sounds confident it is probably right.” Confidence in tone is not a measure of accuracy.", "“Removing the gender column removes gender bias.” Other features can act as proxies."],
        },
      },
    ],
    quiz: {
      title: "AI limitations",
      questions: [
        { type: "single", prompt: "Why do language models hallucinate?", options: ["They are programmed to lie", "They generate likely-sounding text, which is not guaranteed to be true", "They only hallucinate when the internet is down", "Hallucinations only happen in image models"], answer: [1], explanation: "The training objective rewards plausible continuations; nothing in it directly checks factual accuracy." },
        { type: "true_false", prompt: "Removing a sensitive column (like gender) from the data guarantees the model cannot be biased.", answer: [1], explanation: "False. Other features (such as name, job title or postcode) can act as proxies, so bias must be measured, not assumed away." },
        { type: "multiple", prompt: "Which habits reduce risk when using AI tools? (Select all that apply)", options: ["Verifying important facts with reliable sources", "Pasting passwords to get help debugging", "Checking the provider's data-retention settings", "Asking the model to say when it is unsure"], answer: [0, 2, 3], explanation: "Never paste secrets. Verification, understanding data handling, and allowing uncertainty all reduce risk." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "gradient-descent",
    module: "calculus-and-optimization",
    order: 1,
    title: "Gradient Descent: How Models Learn",
    summary: "Almost every modern AI model learns by repeatedly taking small steps downhill on an error landscape. See it, then control it.",
    difficulty: "beginner",
    minutes: 20,
    objectives: [
      "Explain gradient descent using the idea of slope",
      "Predict the effect of a learning rate that is too small or too large",
      "Implement one-dimensional gradient descent in Python",
    ],
    references: [
      { title: "Google ML Crash Course, Reducing Loss: Gradient Descent", url: "https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent" },
      { title: "Ruder (2016): An overview of gradient descent optimization algorithms", url: "https://arxiv.org/abs/1609.04747" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "A model starts with random parameters and makes terrible predictions. A few minutes later it's good. **What actually changes, and how does it know which way to change?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "We measure how wrong a model is with a number called the **loss**. Small loss = good predictions.\n\nImagine the loss as a landscape: every possible setting of the model's parameters is a location, and the height is the loss. Training means **finding a low point**.\n\nGradient descent does this one step at a time:\n\n1. Look at the **slope** (the gradient) where you are standing.\n2. Take a small step **downhill**: opposite to the slope.\n3. Repeat until the ground is flat.\n\nThe size of each step is controlled by the **learning rate**.",
        },
      },
      {
        type: "callout",
        content: { variant: "analogy", title: "Walking down a hill in fog", markdown: "You can't see the valley, but you can feel which way the ground tilts under your feet. Step downhill, feel again, step again.\n\n*Where it breaks down:* real models have millions of parameters, so the “hill” has millions of dimensions, and the ground can have many separate valleys." },
      },
      {
        type: "visualization",
        content: {
          component: "gradient_descent",
          title: "Gradient descent playground",
          objective: "Discover how the learning rate controls whether optimisation converges, oscillates or diverges.",
          instructions: "Take single steps and watch the orange point. Then try learning rates of 0.05, 0.4, 0.9 and 1.05. Finally switch to the bumpy function and try different starting points.",
          fallback: "On f(x) = x², the slope is 2x. Each step moves x to x − learning_rate × 2x. With a small learning rate (e.g. 0.05) steps are tiny and progress is slow. Around 0.1-0.4 the point moves smoothly to the minimum at x = 0. Between 0.5 and 1 it overshoots and bounces from side to side but still converges. Above 1 every step overshoots further and the value explodes (divergence). On a bumpy function with several valleys, gradient descent stops in whichever valley it starts near: a local minimum, not necessarily the lowest point.",
          config: { function: "quadratic" },
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "For a single parameter `x` and loss `f(x)` the update rule is:\n\n```\nx_new = x − η · f′(x)\n```\n\n- `f′(x)` is the **derivative**: the slope of the loss at the current point. Positive slope means “uphill is to the right”, so we move left.\n- `η` (eta) is the **learning rate**, a small positive number you choose.\n\nWith many parameters, the derivative becomes the **gradient** ∇f (a vector of slopes, one per parameter), and every parameter is updated at once.\n\nIn practice, models compute the gradient on a small random **batch** of training examples rather than the whole dataset. This is **stochastic gradient descent (SGD)**. Variants such as Momentum and Adam adapt the step size automatically.\n\nThe gradient is zero at any flat point (a minimum, a maximum or a saddle), so gradient descent can stall in a **local minimum**. In very high-dimensional neural networks this turns out to be less of a problem than in our 1-D picture.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Gradient descent in 10 lines of Python",
          language: "python",
          code: "def f(x):\n    return x ** 2          # the loss\n\ndef df(x):\n    return 2 * x           # its derivative (slope)\n\nx = 3.0                    # starting guess\nlearning_rate = 0.1\n\nfor step in range(1, 26):\n    x = x - learning_rate * df(x)\n    if step % 5 == 0:\n        print(f\"step {step:2d}: x = {x:.4f}, loss = {f(x):.6f}\")",
          expectedOutput: "step  5: x = 0.9830, loss = 0.966368\nstep 10: x = 0.3221, loss = 0.103763\nstep 15: x = 0.1056, loss = 0.011141\nstep 20: x = 0.0346, loss = 0.001196\nstep 25: x = 0.0113, loss = 0.000128",
          explanation: "Each update multiplies x by (1 − 0.1 × 2) = 0.8, so x shrinks by 20% per step and the loss heads towards 0. Change `learning_rate` to `1.1` and you'll see x grow instead: the same divergence you saw in the lab.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Predict before you run",
          task: "Using the code above with `f(x) = x²` starting at `x = 3`, predict what happens after one step for learning rates **0.5** and **1.0**. Then explain why.",
          hints: ["Work out x − η × 2x for each value.", "Simplify: x_new = x × (1 − 2η)."],
          solution: "With η = 0.5: x_new = 3 × (1 − 1) = **0**: it lands exactly on the minimum in one step.\n\nWith η = 1.0: x_new = 3 × (1 − 2) = **−3**: it jumps to the mirror position and will bounce between 3 and −3 forever, never converging.\n\nThis shows why the learning rate must match the curvature of the loss.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      { type: "rich_text", content: { title: "Real-world application", markdown: "Training a large language model is gradient descent at enormous scale: billions of parameters, updated over many steps, each step using a batch of text. Engineers spend a lot of effort on **learning-rate schedules** (starting small, warming up, then slowly decaying) because the wrong learning rate can waste days of expensive compute or make training diverge." } },
      {
        type: "summary",
        content: {
          takeaways: ["Training minimises a loss function.", "Gradient descent repeatedly steps opposite to the slope.", "Too small a learning rate is slow; too large oscillates or diverges.", "Gradient descent can stop in a local minimum."],
          terms: [
            { term: "Loss", definition: "A number measuring how wrong the model's predictions are." },
            { term: "Gradient", definition: "The vector of slopes of the loss with respect to each parameter." },
            { term: "Learning rate (η)", definition: "How large each update step is." },
          ],
          misconceptions: ["“A bigger learning rate always trains faster.” Beyond a point it causes divergence."],
        },
      },
    ],
    quiz: {
      title: "Gradient descent",
      questions: [
        { type: "single", prompt: "What does the learning rate control?", options: ["The size of each update step", "The size of the dataset", "The number of labels", "The number of layers"], answer: [0], explanation: "The learning rate scales the gradient to decide how far each update moves the parameters." },
        { type: "single", prompt: "The slope of the loss at the current point is positive. Gradient descent will…", options: ["Increase the parameter", "Decrease the parameter", "Stop training", "Double the learning rate"], answer: [1], explanation: "It steps opposite to the slope: a positive slope means downhill is towards smaller values." },
        { type: "single", prompt: "Your loss keeps growing and becomes enormous after a few steps. The most likely cause is…", options: ["The learning rate is too small", "The learning rate is too large", "The model is too accurate", "There is not enough data"], answer: [1], explanation: "A learning rate that is too large overshoots further each step, causing divergence." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "python-variables-and-data-types",
    module: "python-basics",
    order: 1,
    title: "Your First Python Program: Variables and Data Types",
    summary: "Write and run your first Python code, store values in variables, and understand the core data types you'll use in every AI project.",
    difficulty: "beginner",
    minutes: 20,
    objectives: [
      "Run a Python program and print output",
      "Create variables and explain what assignment does",
      "Identify int, float, str and bool values and convert between them",
      "Format output with f-strings",
    ],
    references: [
      { title: "The Python Tutorial: An Informal Introduction", url: "https://docs.python.org/3/tutorial/introduction.html" },
      { title: "Python docs: Built-in Types", url: "https://docs.python.org/3/library/stdtypes.html" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "Every AI system, from a spreadsheet model to a large language model, is ultimately data being stored, transformed and printed by code. Python is the language most AI work is done in. **Let's write your first lines.**" } },
      {
        type: "rich_text",
        content: {
          title: "Getting set up",
          markdown: "You can follow along in any of these:\n\n- **In the browser:** a notebook service such as Google Colab (no installation).\n- **On your computer:** install Python 3 from [python.org](https://www.python.org/downloads/), then run `python3` in a terminal.\n\nType the examples yourself rather than copying: it builds muscle memory.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Hello, world",
          language: "python",
          code: 'print("Hello, AI world!")',
          expectedOutput: "Hello, AI world!",
          explanation: "`print` is a **function** that displays whatever you give it. Text in quotes is a **string**.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply: variables",
          markdown: "A **variable** is a name that refers to a value, so you can use it later.\n\n```python\nmodel_name = \"spam-filter\"\naccuracy = 0.93\n```\n\nThe `=` sign means **assign** (“let `accuracy` refer to 0.93”), not “is equal to”. You can reassign a variable at any time.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Labels, not boxes", markdown: "Think of a variable as a **sticky label** attached to a value, rather than a box that contains it. Reassigning moves the label to a new value.\n\n*Where it breaks down:* for simple numbers and strings the difference rarely matters. It becomes important later with lists, where two labels can point at the same list." } },
      {
        type: "comparison",
        content: {
          title: "The four core data types",
          columns: ["Type", "Example", "Used for"],
          rows: [
            { label: "Integer", values: ["int", "42, -7", "Counts: epochs, number of samples"] },
            { label: "Float", values: ["float", "0.93, 3.0", "Measurements: accuracy, loss, learning rate"] },
            { label: "String", values: ["str", "\"cat\"", "Text: labels, prompts, file names"] },
            { label: "Boolean", values: ["bool", "True, False", "Yes/no: is_trained, passed"] },
          ],
        },
      },
      {
        type: "code_example",
        content: {
          title: "Types and conversions",
          language: "python",
          code: 'epochs = 10\nlearning_rate = 0.01\nlabel = "cat"\nis_trained = False\n\nprint(type(epochs), type(learning_rate), type(label), type(is_trained))\n\n# Converting between types\nscore_text = "87"\nscore = int(score_text)      # str -> int\nprint(score + 3)\n\nprint(f"Training {label} classifier for {epochs} epochs at lr={learning_rate}")',
          expectedOutput: "<class 'int'> <class 'float'> <class 'str'> <class 'bool'>\n90\nTraining cat classifier for 10 epochs at lr=0.01",
          explanation: "`type()` tells you a value's type. `int(\"87\")` converts text to a number; without it, `\"87\" + 3` would raise a `TypeError`. An **f-string** (`f\"...\"`) inserts variables inside `{}`.",
        },
      },
      {
        type: "callout",
        content: { variant: "misconception", markdown: "`0.1 + 0.2` prints `0.30000000000000004`, not `0.3`. That's not a Python bug: computers store most decimals as binary approximations. Use `round()` for display, and never compare floats with `==` when precision matters." },
      },
      {
        type: "practice",
        content: {
          title: "Model report card",
          task: "Create variables for a model's `name` (str), `correct` predictions (int) and `total` predictions (int). Compute `accuracy` as a float and print a line like:\n\n`spam-filter: 912/1000 correct (91.2%)`",
          hints: ["Accuracy = correct / total. Division with / always gives a float.", "Inside an f-string, `{accuracy:.1%}` formats a fraction as a percentage."],
          solution: "```python\nname = \"spam-filter\"\ncorrect = 912\ntotal = 1000\naccuracy = correct / total\nprint(f\"{name}: {correct}/{total} correct ({accuracy:.1%})\")\n```",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["`print()` displays values; `=` assigns a value to a name.", "Core types: int, float, str, bool. Use `type()` to check.", "Convert with int(), float(), str().", "f-strings make readable output."],
          terms: [
            { term: "Variable", definition: "A name that refers to a value." },
            { term: "Data type", definition: "The kind of value, which determines what you can do with it." },
            { term: "f-string", definition: "A string prefixed with f that can embed expressions in {}." },
          ],
          misconceptions: ["`=` means equality. In Python it means assignment; equality is `==`."],
        },
      },
    ],
    quiz: {
      title: "Variables and types",
      questions: [
        { type: "single", prompt: "What is the type of the value 0.01?", options: ["int", "float", "str", "bool"], answer: [1], explanation: "Numbers with a decimal point are floats." },
        { type: "single", prompt: 'What happens when you run `"5" + 3`?', options: ["It prints 8", "It prints 53", "It raises a TypeError", "It prints 5 3"], answer: [2], explanation: "Python won't add a string and an integer. Convert first: int(\"5\") + 3." },
        { type: "single", prompt: "What does `x = 10` do?", options: ["Checks whether x equals 10", "Makes the name x refer to the value 10", "Prints 10", "Creates a list containing 10"], answer: [1], explanation: "A single = is assignment. Comparison uses ==." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "numpy-fundamentals",
    module: "scientific-python",
    order: 1,
    title: "NumPy Fundamentals: Arrays for AI",
    summary: "NumPy arrays are the data structure underneath almost every AI library. Learn to create them, compute with them, and think in vectors.",
    difficulty: "beginner",
    minutes: 25,
    objectives: [
      "Create NumPy arrays and inspect their shape and dtype",
      "Apply vectorised operations instead of Python loops",
      "Use indexing, slicing and boolean masks to select data",
      "Explain broadcasting at a basic level",
    ],
    prerequisites: ["python-variables-and-data-types"],
    references: [
      { title: "NumPy: Absolute beginner's guide", url: "https://numpy.org/doc/stable/user/absolute_beginners.html" },
      { title: "NumPy: Broadcasting", url: "https://numpy.org/doc/stable/user/basics.broadcasting.html" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "An image is a grid of numbers. A sentence becomes a list of numbers. A neural network is mostly multiplying big grids of numbers together. **Python lists are too slow for this, so what do AI libraries actually use?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "**NumPy** gives Python a fast **array**: a grid of numbers that are all the same type, stored efficiently in memory.\n\n- A 1-D array is like a list of numbers (a **vector**).\n- A 2-D array is like a table (a **matrix**).\n- Arrays can have more dimensions. A colour image is height × width × 3.\n\nThe big idea is **vectorisation**: you write `prices * 1.2` and NumPy applies it to every element at once, in fast compiled code, with no Python loop.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Spreadsheet formulas", markdown: "Writing `=A1*1.2` and filling it down a whole column is vectorisation: one instruction, applied to every cell.\n\n*Where it breaks down:* spreadsheets allow mixed types in a column; a NumPy array has a single `dtype` for every element." } },
      {
        type: "code_example",
        content: {
          title: "Creating arrays",
          language: "python",
          code: 'import numpy as np\n\nscores = np.array([72, 85, 90, 64])\nprint(scores, scores.shape, scores.dtype)\n\ngrid = np.array([[1, 2, 3],\n                 [4, 5, 6]])\nprint(grid.shape)       # (rows, columns)\n\nprint(np.zeros(3))\nprint(np.arange(0, 10, 2))',
          expectedOutput: "[72 85 90 64] (4,) int64\n(2, 3)\n[0. 0. 0.]\n[0 2 4 6 8]",
          explanation: "`shape` tells you the size in each dimension. `dtype` is the element type (it may show `int32` on some systems).",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Vectorised maths, masks and broadcasting",
          language: "python",
          code: 'import numpy as np\n\nscores = np.array([72, 85, 90, 64])\n\nprint(scores + 5)            # add to every element\nprint(scores.mean(), scores.max())\n\npassed = scores >= 70        # boolean mask\nprint(passed)\nprint(scores[passed])        # select with the mask\n\n# Broadcasting: a (2,3) grid times a (3,) vector\ngrid = np.array([[1, 2, 3], [4, 5, 6]])\nweights = np.array([10, 1, 0.5])\nprint(grid * weights)',
          expectedOutput: "[77 90 95 69]\n77.75 90\n[ True  True  True False]\n[72 85 90]\n[[10.   2.   1.5]\n [40.   5.   3. ]]",
          explanation: "Comparisons produce **boolean arrays** you can use to filter. In the last example NumPy **broadcasts** the 3-element `weights` across each row of the 2×3 grid: the same weights apply to every row.",
        },
      },
      {
        type: "diagram",
        content: {
          title: "Broadcasting a row vector across a matrix",
          layout: "flow",
          description: "A 2-by-3 matrix and a 3-element vector. The vector is conceptually repeated for each row, then the two are multiplied element by element to produce a 2-by-3 result. No data is actually copied.",
          nodes: [
            { label: "Matrix (2×3)", detail: "[[1,2,3],[4,5,6]]" },
            { label: "Vector (3,)", detail: "[10, 1, 0.5]: stretched to each row" },
            { label: "Result (2×3)", detail: "[[10,2,1.5],[40,5,3]]" },
          ],
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive: why it's fast",
          markdown: "A Python list stores pointers to separate objects scattered in memory; each `+` in a loop goes through the interpreter. A NumPy array stores raw numbers **contiguously** and runs operations in optimised C, often using CPU vector instructions.\n\nFor a million elements, `arr * 2` is typically tens of times faster than an equivalent Python loop, and libraries such as PyTorch and TensorFlow use the same array-programming model (they call them *tensors*), extended to GPUs.\n\n**Broadcasting rule:** compare shapes from the right; dimensions are compatible if they are equal or one of them is 1. Shapes `(2, 3)` and `(3,)` work; `(2, 3)` and `(2,)` do not. You'd need `(2, 1)`.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Normalise exam scores",
          task: "Given `scores = np.array([55, 70, 85, 100])`, rescale them to the range 0-1 using **min-max normalisation**: `(x − min) / (max − min)`. Do it without a loop. (This is a common preprocessing step before training a model.)",
          hints: ["`scores.min()` and `scores.max()` give single numbers.", "Subtracting a single number from an array broadcasts it to every element."],
          solution: "```python\nnormalised = (scores - scores.min()) / (scores.max() - scores.min())\nprint(normalised)   # [0.         0.33333333 0.66666667 1.        ]\n```",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["NumPy arrays are fast, same-type grids of numbers.", "Vectorised operations replace slow Python loops.", "Boolean masks filter data.", "Broadcasting applies smaller arrays across larger ones when shapes are compatible."],
          terms: [
            { term: "Array", definition: "A fixed-type, n-dimensional grid of values." },
            { term: "Shape", definition: "The size of an array along each dimension." },
            { term: "Vectorisation", definition: "Applying an operation to whole arrays at once instead of looping." },
            { term: "Broadcasting", definition: "Automatically stretching compatible smaller arrays to match larger ones." },
          ],
          misconceptions: ["“NumPy arrays are just faster lists.” They have a fixed type and support element-wise maths; `list * 2` repeats a list, `array * 2` doubles every value."],
        },
      },
    ],
    quiz: {
      title: "NumPy basics",
      questions: [
        { type: "single", prompt: "What is the shape of np.array([[1, 2], [3, 4], [5, 6]])?", options: ["(2, 3)", "(3, 2)", "(6,)", "(3,)"], answer: [1], explanation: "Three rows, two columns: (3, 2)." },
        { type: "single", prompt: "Given a = np.array([1, 2, 3]), what is a * 2?", options: ["[1, 2, 3, 1, 2, 3]", "[2, 4, 6]", "An error", "12"], answer: [1], explanation: "Arrays use element-wise arithmetic. (A plain Python list would be repeated instead.)" },
        { type: "true_false", prompt: "Arrays of shape (4, 3) and (3,) can be added together using broadcasting.", answer: [0], explanation: "True. Comparing from the right, 3 matches 3, and the missing dimension is broadcast across the 4 rows." },
      ],
    },
  },
];
