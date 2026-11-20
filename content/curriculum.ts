/** The 19-school curriculum from docs/02-curriculum.md. */
export const SCHOOLS = [
  { n: 1, level: 1, slug: "ai-fundamentals", title: "AI Fundamentals", description: "What AI is, how it works, where it is used, and where it falls short — the foundation for everything else.", outline: ["Introduction to Artificial Intelligence", "History and evolution of AI", "Types of AI: narrow AI, general AI and superintelligence", "AI vs Machine Learning vs Deep Learning", "How AI systems work", "Applications of AI across industries", "Limitations of AI", "Hallucinations, bias and privacy", "Essential AI terminology"] },
  { n: 2, level: 1, slug: "mathematics-for-ai", title: "Mathematics for AI", description: "The algebra, linear algebra, probability, statistics and calculus that AI relies on — built from intuition first.", outline: ["Mathematical foundations and notation", "Algebra essentials", "Scalars, vectors and matrices", "Vector operations", "Matrix operations and multiplication", "Probability fundamentals", "Descriptive statistics", "Probability distributions", "Derivatives and calculus intuition", "Gradient descent", "Optimization and loss functions"] },
  { n: 3, level: 1, slug: "python-programming", title: "Python Programming", description: "Python from your first program to NumPy, Pandas and Matplotlib — the working language of AI.", outline: ["Python setup and first program", "Variables and data types", "Operators and expressions", "Conditional statements", "Loops", "Functions", "Strings", "Lists, tuples, sets and dictionaries", "Modules and packages", "Object-oriented programming", "File handling", "Exceptions and debugging", "NumPy fundamentals", "Pandas fundamentals", "Data visualization with Matplotlib"] },
  { n: 4, level: 1, slug: "data-science-and-analytics", title: "Data Science and Analytics", description: "Collect, clean, explore, query and communicate data — the raw material of every AI system.", outline: ["Introduction to data science", "Data types and data sources", "Data collection", "Data cleaning", "Data preprocessing", "Exploratory data analysis", "Descriptive statistics", "Data visualization", "SQL fundamentals", "Feature engineering", "Data storytelling", "Big data concepts"] },
  { n: 5, level: 2, slug: "machine-learning", title: "Machine Learning", description: "Supervised, unsupervised and reinforcement learning; the core algorithms; and how to evaluate models honestly.", outline: ["What is machine learning?", "The machine learning workflow", "Supervised learning", "Unsupervised learning", "Reinforcement learning", "Linear regression", "Logistic regression", "Decision trees", "Random forests", "K-nearest neighbors", "Support vector machines", "Naive Bayes", "Clustering and K-means", "Dimensionality reduction and PCA", "Training, validation and test sets", "Model evaluation metrics", "Overfitting and underfitting", "Feature engineering", "Hyperparameter tuning", "Model selection and interpretation"] },
  { n: 6, level: 2, slug: "deep-learning", title: "Deep Learning", description: "Neurons, layers, backpropagation and the architectures — CNNs, RNNs and transformers — behind modern AI.", outline: ["Deep learning fundamentals", "Biological and artificial neurons", "Perceptrons", "Neural network layers", "Activation functions", "Forward propagation", "Loss functions", "Backpropagation", "Gradient descent optimizers", "Multilayer neural networks", "Convolutional neural networks", "Recurrent neural networks", "LSTM and GRU", "Transformers overview", "Regularization and optimization"] },
  { n: 7, level: 2, slug: "natural-language-processing", title: "Natural Language Processing", description: "How computers process text: tokenization, representations, embeddings and classic NLP tasks.", outline: ["Introduction to NLP", "Text normalization and preprocessing", "Tokenization", "Stemming and lemmatization", "Stop words and n-grams", "Bag of Words and TF-IDF", "Word embeddings", "Word2Vec concepts", "Sentiment analysis", "Text classification", "Named Entity Recognition", "Language modeling", "Machine translation", "Text summarization"] },
  { n: 12, level: 2, slug: "computer-vision", title: "Computer Vision", description: "From pixels and filters to classification, detection, segmentation and vision transformers.", outline: ["Computer vision fundamentals", "Pixels, color spaces and image formats", "Image preprocessing", "Convolution and filters", "Image classification", "Object detection", "Image segmentation", "Face detection and recognition concepts", "Optical Character Recognition", "CNN architectures", "YOLO and real-time detection", "Image captioning", "Video analysis", "Vision Transformers"] },
  { n: 13, level: 2, slug: "speech-and-audio-ai", title: "Speech and Audio AI", description: "Audio fundamentals, speech recognition and synthesis, and the responsible use of synthetic voice.", outline: ["Audio fundamentals", "Speech recognition", "Speech-to-text", "Text-to-speech", "Automatic Speech Recognition", "Audio classification", "Speaker identification concepts", "Voice assistants", "Real-time voice AI", "Audio-language models", "Responsible use of synthetic voice"] },
  { n: 8, level: 3, slug: "generative-ai-and-llms", title: "Generative AI and Large Language Models", description: "How generative models and LLMs work: tokens, embeddings, attention, context windows and sampling.", outline: ["Generative AI fundamentals", "Generative AI vs traditional AI", "Generative model families", "Large Language Models", "Transformer architecture", "Tokens and tokenization", "Context windows", "Embeddings", "Attention mechanisms", "How ChatGPT-style systems work", "Multimodal AI", "Image generation", "Video generation", "Audio generation", "Open-source and proprietary models", "Model selection and evaluation", "Fine-tuning fundamentals"] },
  { n: 9, level: 3, slug: "prompt-engineering", title: "Prompt Engineering", description: "Write, structure, evaluate and secure prompts that produce reliable results.", outline: ["Prompt engineering fundamentals", "Anatomy of an effective prompt", "Zero-shot prompting", "Few-shot prompting", "Role and context prompting", "Structured output prompting", "Prompt templates", "System and user instructions", "Prompt chaining", "Prompt evaluation", "Prompt injection and defenses", "Building reusable prompt workflows"] },
  { n: 10, level: 3, slug: "ai-agents", title: "AI Agents and Agentic AI", description: "Agents that plan, use tools and remember — and how to evaluate, guard and oversee them.", outline: ["What is an AI agent?", "Assistants vs agents", "Agent architecture", "Planning and task decomposition", "Tool use and function calling", "Agent memory", "Single-agent systems", "Multi-agent systems", "Agent orchestration", "Workflow automation", "Agent evaluation", "Guardrails and security", "Human approval and oversight"] },
  { n: 11, level: 3, slug: "retrieval-augmented-generation", title: "Retrieval-Augmented Generation", description: "Ground model answers in your own documents: ingestion, chunking, embeddings, retrieval and evaluation.", outline: ["What is RAG?", "Why RAG is useful", "RAG architecture", "Document ingestion", "Text extraction and chunking", "Embeddings", "Vector databases", "Similarity search", "Semantic search", "Retrieval strategies", "Reranking", "Context construction", "RAG evaluation", "Advanced RAG patterns", "Agentic RAG"] },
  { n: 14, level: 3, slug: "ai-frameworks-and-apis", title: "AI Development Frameworks and APIs", description: "Call model APIs securely and build with the major frameworks. Provider-specific lessons are reviewed as APIs change.", outline: ["AI API fundamentals", "API keys and secure configuration", "Calling AI model APIs", "OpenAI API", "Gemini API", "Anthropic API", "Hugging Face ecosystem", "LangChain fundamentals", "LangGraph fundamentals", "LlamaIndex fundamentals", "Ollama and local models", "Function calling", "Structured outputs", "Model Context Protocol", "AI application architecture"] },
  { n: 15, level: 4, slug: "mlops-and-ai-infrastructure", title: "MLOps and AI Infrastructure", description: "Deploy, serve, monitor, version and scale models — and understand what it all costs.", outline: ["MLOps fundamentals", "Model deployment concepts", "Flask and FastAPI", "REST APIs", "Docker fundamentals", "Cloud computing concepts", "GPU computing", "Model serving", "Model monitoring", "Model versioning", "CI/CD for ML", "ML pipelines", "Model optimization", "Production scaling", "AI infrastructure costs"] },
  { n: 16, level: 4, slug: "responsible-ai-and-security", title: "Responsible AI and Security", description: "Ethics, bias, privacy, explainability, security, governance and regulation for AI systems.", outline: ["AI ethics", "Responsible AI principles", "Algorithmic bias", "Data privacy", "Hallucination management", "Explainable AI", "AI security fundamentals", "Prompt injection", "Data and model governance", "Copyright and intellectual property", "AI regulation concepts", "Human oversight"] },
  { n: 17, level: 4, slug: "ai-research-and-emerging-tech", title: "AI Research and Emerging Technologies", description: "Foundation models, fine-tuning, quantization, diffusion, RLHF — and how to read and judge research.", outline: ["Foundation models", "Small Language Models", "Fine-tuning methods", "Quantization", "Model distillation", "Diffusion models", "Vision-language models", "Robotics and embodied AI", "Reinforcement learning from human feedback", "Reading research papers", "Evaluating research claims", "Emerging AI architectures"] },
  { n: 18, level: 4, slug: "ai-for-everyday-life-and-business", title: "AI for Everyday Life and Business", description: "Practical, responsible AI for students, educators, entrepreneurs and professionals across functions.", outline: ["AI for students", "AI for educators", "AI for entrepreneurs", "AI for marketing", "AI for content creation", "AI for finance", "AI for healthcare workflows", "AI for HR", "Business process automation", "No-code AI", "AI productivity workflows", "Responsible workplace adoption"] },
  { n: 19, level: 4, slug: "ai-careers", title: "AI Careers", description: "Roadmaps, interview preparation and portfolio building for AI roles.", outline: ["AI career landscape", "AI engineer roadmap", "Machine learning engineer roadmap", "Data scientist roadmap", "Generative AI engineer roadmap", "AI automation specialist roadmap", "Technical interview preparation", "Python interview questions", "ML interview questions", "Generative AI interview questions", "Resume and portfolio development", "GitHub portfolio", "Internship preparation", "Certifications and continuing education"] },
] as const;

/** Modules that currently have authored lessons. */
export const MODULES = [
  { slug: "what-is-ai", school: "ai-fundamentals", order: 1, title: "What Is AI?", difficulty: "beginner", description: "Build an accurate mental model of AI: what it is, how its subfields relate, and what it cannot do." },
  { slug: "calculus-and-optimization", school: "mathematics-for-ai", order: 3, title: "Calculus and Optimization", difficulty: "beginner", description: "Slopes, derivatives and gradient descent — how models improve by going downhill." },
  { slug: "python-basics", school: "python-programming", order: 1, title: "Python Basics", difficulty: "beginner", description: "Your first programs: values, variables, types and printing results." },
  { slug: "scientific-python", school: "python-programming", order: 3, title: "Scientific Python", difficulty: "beginner", description: "NumPy arrays — the data structure underneath almost every AI library." },
  { slug: "supervised-learning", school: "machine-learning", order: 2, title: "Supervised Learning", difficulty: "beginner", description: "Learning from labelled examples: regression and classification." },
  { slug: "unsupervised-learning", school: "machine-learning", order: 3, title: "Unsupervised Learning", difficulty: "beginner", description: "Finding structure in data without labels." },
  { slug: "model-evaluation", school: "machine-learning", order: 4, title: "Model Evaluation", difficulty: "intermediate", description: "Measuring whether a model is actually good — and good at what." },
  { slug: "neural-network-foundations", school: "deep-learning", order: 1, title: "Neural Network Foundations", difficulty: "beginner", description: "The artificial neuron and how networks of them compute." },
  { slug: "how-llms-work", school: "generative-ai-and-llms", order: 2, title: "How LLMs Work", difficulty: "beginner", description: "Tokens, embeddings, attention and sampling — the machinery behind large language models." },
  { slug: "prompt-fundamentals", school: "prompt-engineering", order: 1, title: "Prompt Fundamentals", difficulty: "beginner", description: "The components of an effective prompt and why each one matters." },
  { slug: "rag-foundations", school: "retrieval-augmented-generation", order: 1, title: "RAG Foundations", difficulty: "intermediate", description: "Why and how to ground model answers in your own documents." },
] as const;

export const PATHS = [
  {
    slug: "ai-for-absolute-beginners", order: 1, title: "AI for Absolute Beginners", tier: "free", difficulty: "beginner", minutes: 360,
    description: "Understand what AI is, how it learns, how generative AI works and how to use it responsibly — no maths or coding required.",
    audience: "Students and non-technical learners",
    prerequisites: ["None — curiosity is enough"],
    outcomes: ["Explain the difference between AI, machine learning and deep learning", "Describe in plain English how a model learns from data", "Explain what tokens and temperature mean when using a chatbot", "Write clear, structured prompts", "Recognise hallucination, bias and privacy risks"],
    capstone: "Create a useful AI-assisted study or productivity workflow, documenting where you verify the AI's output.",
    modules: ["what-is-ai", "neural-network-foundations", "how-llms-work", "prompt-fundamentals"],
  },
  {
    slug: "python-for-ai", order: 2, title: "Python for AI", tier: "free", difficulty: "beginner", minutes: 600,
    description: "A programming foundation focused on what AI and data work actually need: Python fundamentals and NumPy.",
    audience: "Learners who want a programming foundation",
    prerequisites: ["A computer where you can install Python (or a browser notebook)"],
    outcomes: ["Write and run Python programs", "Use variables, types and f-strings confidently", "Create and manipulate NumPy arrays", "Explain why vectorised code is faster than loops"],
    capstone: "Analyse a small dataset and build a short Python application that reports what you found.",
    modules: ["python-basics", "scientific-python"],
  },
  {
    slug: "machine-learning-engineer", order: 3, title: "Machine Learning Engineer", tier: "free", difficulty: "intermediate", minutes: 1800,
    description: "From Python and the maths of optimisation to supervised and unsupervised learning, evaluation and neural networks.",
    audience: "Learners targeting ML engineering roles",
    prerequisites: ["Comfort with basic algebra", "Python basics (or take Python for AI first)"],
    outcomes: ["Explain and visualise gradient descent", "Fit and interpret a linear regression", "Build and evaluate decision trees", "Cluster data with K-means", "Choose evaluation metrics that match the real-world cost of errors"],
    capstone: "Train, evaluate and document a prediction model, explaining your metric choice and its limitations.",
    modules: ["python-basics", "scientific-python", "calculus-and-optimization", "supervised-learning", "unsupervised-learning", "model-evaluation", "neural-network-foundations"],
  },
  {
    slug: "generative-ai-developer", order: 4, title: "Generative AI Developer", tier: "premium", difficulty: "intermediate", minutes: 1500,
    description: "Understand LLM internals — tokens, embeddings, attention, sampling — then build grounded applications with prompting and RAG.",
    audience: "Developers building AI-powered applications",
    prerequisites: ["Python basics", "Comfort calling a web API"],
    outcomes: ["Estimate and manage token usage", "Use embeddings for semantic similarity", "Explain attention at a conceptual level", "Control output variability with sampling parameters", "Design a basic RAG pipeline and diagnose retrieval failures"],
    capstone: "Build and deploy a grounded AI knowledge assistant that cites its sources.",
    modules: ["python-basics", "how-llms-work", "prompt-fundamentals", "rag-foundations"],
  },
  {
    slug: "prompt-engineering-specialist", order: 5, title: "Prompt Engineering Specialist", tier: "free", difficulty: "beginner", minutes: 480,
    description: "Learn how LLMs read prompts and how to write, structure and evaluate prompts that work reliably.",
    audience: "Professionals who use AI tools daily, and aspiring prompt engineers",
    prerequisites: ["None"],
    outcomes: ["Explain how tokens and sampling affect model output", "Write prompts with role, context, task, format and constraints", "Evaluate prompts systematically instead of by feel", "Recognise the limits of prompting"],
    capstone: "Create a tested prompt library for a real workflow, with examples of good and bad outputs.",
    modules: ["what-is-ai", "how-llms-work", "prompt-fundamentals"],
  },
] as const;

export const LABS = [
  { key: "ai_ml_dl_explorer", slug: "ai-ml-dl-explorer", title: "AI vs ML vs DL explorer", concept: "AI terminology", description: "Explore how AI, machine learning and deep learning nest inside each other, then classify real systems." },
  { key: "neuron_playground", slug: "neuron-playground", title: "Neuron playground", concept: "Artificial neuron", description: "Change weights, bias and activation function and watch a single neuron compute — then turn it into an AND gate." },
  { key: "gradient_descent", slug: "gradient-descent", title: "Gradient descent playground", concept: "Optimization", description: "Change the learning rate and starting point and watch optimisation converge, oscillate or diverge." },
  { key: "linear_regression", slug: "linear-regression", title: "Linear regression explorer", concept: "Regression", description: "Fit a line by hand, see the residuals, and compare your error with the best possible line." },
  { key: "decision_tree", slug: "decision-tree", title: "Decision tree explorer", concept: "Classification", description: "Choose split features and thresholds and see how a tree carves the data into regions." },
  { key: "kmeans", slug: "kmeans", title: "K-means simulator", concept: "Clustering", description: "Step through assignment and update, drag centroids, and see how initialisation affects the result." },
  { key: "confusion_matrix", slug: "confusion-matrix", title: "Confusion matrix explorer", concept: "Evaluation", description: "Move a decision threshold and watch precision, recall and accuracy trade off." },
  { key: "tokenizer", slug: "tokenizer", title: "Tokenization explorer", concept: "LLM input", description: "Type any text and see how it is split into tokens and token IDs." },
  { key: "embedding_explorer", slug: "embedding-explorer", title: "Embedding explorer", concept: "Semantic similarity", description: "Find nearest neighbours in embedding space and try vector arithmetic like king − man + woman." },
  { key: "attention", slug: "attention", title: "Attention explorer", concept: "Transformers", description: "Click a word to see which other words it attends to — and how context changes it." },
  { key: "temperature", slug: "temperature", title: "Temperature playground", concept: "Text generation", description: "Reshape next-token probabilities with temperature and top-k, then sample." },
  { key: "prompt_playground", slug: "prompt-playground", title: "Prompt playground", concept: "Prompt engineering", description: "Add and remove prompt components and compare the (simulated) results." },
  { key: "rag_pipeline", slug: "rag-pipeline", title: "RAG pipeline explorer", concept: "Retrieval", description: "Change chunk size, overlap and top-k and see whether the answer makes it into the model's context." },
] as const;

export const ACHIEVEMENTS = [
  { key: "first-lesson", title: "First lesson complete", description: "Completed your first lesson, including its knowledge check.", criteria: { type: "lessons_completed", count: 1 } },
  { key: "five-lessons", title: "Building momentum", description: "Completed five lessons.", criteria: { type: "lessons_completed", count: 5 } },
  { key: "ten-lessons", title: "Solid foundations", description: "Completed ten lessons.", criteria: { type: "lessons_completed", count: 10 } },
  { key: "first-quiz", title: "Checked your understanding", description: "Passed your first knowledge check.", criteria: { type: "quizzes_passed", count: 1 } },
  { key: "path-complete", title: "Path finisher", description: "Completed every available lesson in a learning path.", criteria: { type: "path_completed" } },
] as const;
