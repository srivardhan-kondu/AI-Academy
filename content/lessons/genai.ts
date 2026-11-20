import type { SeedLesson } from "../types";

export const genAiLessons: SeedLesson[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "tokens-and-tokenization",
    module: "how-llms-work",
    order: 1,
    title: "Tokens and Tokenization",
    summary: "Language models don't read words. They read tokens. Learn what tokens are and why they affect cost, limits and model behaviour.",
    difficulty: "beginner",
    minutes: 15,
    objectives: [
      "Explain what a token is and why models use subword tokens",
      "Estimate how text length relates to token count",
      "Describe practical consequences: context limits, pricing and odd behaviours",
    ],
    references: [
      { title: "Sennrich et al. (2016): Neural Machine Translation of Rare Words with Subword Units (BPE)", url: "https://arxiv.org/abs/1508.07909" },
      { title: "Hugging Face: Summary of the tokenizers", url: "https://huggingface.co/docs/transformers/tokenizer_summary" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "Ask some chatbots how many letter r's are in “strawberry” and they may get it wrong. They can write essays, so why do they stumble on spelling? **The answer is tokens.**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "Before a language model sees your text, a **tokenizer** chops it into pieces called **tokens** and turns each piece into a number (a token ID).\n\n- Common words are often a single token: `the`, `model`.\n- Rare or long words are split into pieces: `token` + `ization`.\n- Spaces and punctuation are part of tokens too.\n\nThe model only ever sees the sequence of IDs. It never sees individual letters unless a token happens to be a single letter, which is why letter-counting can be hard.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "LEGO bricks", markdown: "Tokens are like a fixed set of LEGO bricks. Common shapes have their own big brick; unusual shapes are built from several smaller bricks.\n\n*Where it breaks down:* the brick set isn't designed by hand. It's learned from how often character sequences appear in training text." } },
      {
        type: "visualization",
        content: {
          component: "tokenizer",
          title: "Tokenization explorer",
          objective: "See how text splits into tokens and compare token count with word count.",
          instructions: "Type your own sentences. Try common words, rare words, numbers, other languages and code. Toggle token IDs to see what the model actually receives.",
          fallback: "A tokenizer splits text into frequent pieces. 'Tokenization is unbelievably important for language models!' becomes pieces such as 'Token', 'ization', ' is', ' un', 'believ', …: more tokens than words. Common short words map to one token each; rare long words split into several; each token maps to a number ID that the model processes. This simplified teaching tokenizer gives different counts from real model tokenizers.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "Most modern LLMs use **subword tokenization** such as **Byte-Pair Encoding (BPE)**. BPE starts from individual bytes or characters and repeatedly merges the most frequent adjacent pair into a new token, building a vocabulary of typically tens of thousands to a few hundred thousand tokens.\n\nWhy subwords?\n\n- **Whole-word vocabularies** can't handle new words, typos or names.\n- **Character-level** input makes sequences very long and expensive.\n- **Subwords** balance the two: frequent words stay whole, anything else can still be spelled out.\n\nPractical consequences:\n\n- **Context windows** and **API pricing** are measured in tokens, not words. In English, a token is very roughly ¾ of a word, but this varies a lot by language and content.\n- Many non-English languages and code need **more tokens** for the same meaning, which costs more and uses more context.\n- Tasks that depend on characters (spelling, counting letters, rhyming) are harder.\n\nEvery model family has its own tokenizer, so always count tokens with the tokenizer for the model you are using.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "A tiny subword tokenizer",
          language: "python",
          code: "vocab = {\"token\", \"ization\", \"is\", \"un\", \"believ\", \"able\", \"ly\", \"the\", \"model\", \"s\"}\n\ndef tokenize(word):\n    \"\"\"Greedy longest-match: a simplified illustration, not real BPE.\"\"\"\n    pieces, i = [], 0\n    while i < len(word):\n        for j in range(len(word), i, -1):\n            if word[i:j] in vocab or j == i + 1:\n                pieces.append(word[i:j])\n                i = j\n                break\n    return pieces\n\nfor w in [\"tokenization\", \"models\", \"unbelievably\"]:\n    print(w, \"->\", tokenize(w))",
          expectedOutput: "tokenization -> ['token', 'ization']\nmodels -> ['model', 's']\nunbelievably -> ['un', 'believ', 'a', 'b', 'ly']",
          explanation: "The tokenizer uses the longest vocabulary piece it can find, and falls back to single characters. Real tokenizers (for example OpenAI's `tiktoken` or Hugging Face `tokenizers`) use a learned vocabulary and merge rules, but the effect is similar: rare words become several tokens.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Budget your context",
          task: "A model has a context window of 8,000 tokens. You want to include a 5,000-word English report and leave room for a 500-token answer. Using the rough rule of ~0.75 words per token, will it fit?",
          hints: ["Tokens ≈ words ÷ 0.75.", "Add the answer tokens to the input tokens."],
          solution: "5,000 ÷ 0.75 ≈ **6,700 tokens** for the report, plus 500 for the answer ≈ 7,200 tokens: it fits, but only just. Add your instructions and it may not. Measure with the real tokenizer before relying on the estimate, or summarise/chunk the report.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["LLMs process sequences of token IDs, not letters or words.", "Subword tokenizers keep common words whole and split rare ones.", "Limits and pricing are counted in tokens.", "Different languages and models produce different token counts."],
          terms: [
            { term: "Token", definition: "A unit of text (often a subword) mapped to an integer ID." },
            { term: "Tokenizer", definition: "The component that converts text to tokens and back." },
            { term: "Context window", definition: "The maximum number of tokens a model can consider at once." },
          ],
          misconceptions: ["“One token = one word.” Tokens can be parts of words, whole words, or punctuation."],
        },
      },
    ],
    quiz: {
      title: "Tokens",
      questions: [
        { type: "single", prompt: "Why do most LLMs use subword tokens rather than whole words?", options: ["Subwords handle rare and new words while keeping sequences reasonably short", "Subwords are easier for humans to read", "Whole words cannot be stored in computers", "Subwords make models deterministic"], answer: [0], explanation: "Subwords balance vocabulary size and sequence length, and any new word can still be represented." },
        { type: "true_false", prompt: "API usage for most language models is billed per word.", answer: [1], explanation: "False. It is typically billed per token (input and output tokens)." },
        { type: "single", prompt: "Why might a model struggle to count the letters in a word?", options: ["It cannot see the word at all", "It sees tokens, which often group several letters together", "Counting is impossible for computers", "Letters are removed during training"], answer: [1], explanation: "The model receives token IDs for multi-letter pieces, so individual letters aren't directly visible." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "embeddings",
    module: "how-llms-work",
    order: 2,
    title: "Embeddings: Meaning as Numbers",
    summary: "Embeddings turn words and documents into vectors so that similar meanings land close together. They power search, recommendations and RAG.",
    difficulty: "beginner",
    minutes: 20,
    objectives: [
      "Explain what an embedding is",
      "Compute cosine similarity between vectors",
      "Describe uses of embeddings such as semantic search",
    ],
    prerequisites: ["tokens-and-tokenization", "numpy-fundamentals"],
    references: [
      { title: "Mikolov et al. (2013): Efficient Estimation of Word Representations (word2vec)", url: "https://arxiv.org/abs/1301.3781" },
      { title: "Google ML Crash Course: Embeddings", url: "https://developers.google.com/machine-learning/crash-course/embeddings" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "Search for “cheap flights” and a good search engine also finds “budget airfare”, even though the words don't match. **How can a computer know two phrases mean similar things?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "An **embedding** is a list of numbers (a vector) that represents a piece of text: a word, a sentence, or a whole document.\n\nEmbeddings are learned so that **things used in similar contexts get similar vectors**. That turns “similar meaning” into “close together in space”, which computers can measure.\n\nOnce text is a vector you can: find the nearest documents to a question, group similar items, or recommend related content.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Coordinates on a map", markdown: "Imagine every word has GPS coordinates. Cities in the same region are near each other; “Paris” is near “Lyon” and far from “Tokyo”.\n\n*Where it breaks down:* real embeddings have hundreds or thousands of dimensions, and individual dimensions usually don't have human-readable meanings like “north” or “east”." } },
      {
        type: "visualization",
        content: {
          component: "embedding_explorer",
          title: "Embedding explorer",
          objective: "Explore nearest neighbours and vector arithmetic in a small embedding space.",
          instructions: "Click words to see their nearest neighbours and similarity scores. Then try the vector arithmetic: king − man + woman.",
          fallback: "Words from five groups (animals, food, vehicles, royalty/people, emotions) are plotted so related words sit together. Selecting 'cat' shows 'kitten' and 'dog' as nearest neighbours with high cosine similarity, while 'car' scores near zero. Vector arithmetic works because directions encode relationships: king − man + woman gives a vector closest to queen, and prince − man + woman gives princess. These vectors are hand-made for teaching; real embeddings are learned and much larger.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "Similarity between embeddings is usually measured with **cosine similarity**:\n\n```\ncos(a, b) = (a · b) / (‖a‖ · ‖b‖)\n```\n\nIt measures the angle between vectors: 1 means the same direction, 0 means unrelated (perpendicular), −1 opposite. Many embedding models return **normalised** vectors (length 1), in which case cosine similarity equals the simple dot product.\n\n**Where embeddings come from:** early methods such as word2vec learned one vector per word by predicting neighbouring words. Modern **sentence/document embedding models** are transformer networks trained so that related texts (for example a question and its answer) have similar vectors. Inside an LLM, the first layer also maps each token ID to an embedding vector.\n\n**Caveats:** embeddings reflect patterns, including biases, in their training data, and “similar” means “used similarly”, which isn't always the same as “true” or “relevant”.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Cosine similarity with NumPy",
          language: "python",
          code: "import numpy as np\n\ndef cosine(a, b):\n    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))\n\n# Toy 3-D embeddings: [animal, vehicle, cuteness]\ncat    = np.array([0.9, 0.0, 0.8])\nkitten = np.array([0.8, 0.0, 1.0])\ncar    = np.array([0.0, 1.0, 0.1])\n\nprint(f\"cat vs kitten: {cosine(cat, kitten):.2f}\")\nprint(f\"cat vs car:    {cosine(cat, car):.2f}\")",
          expectedOutput: "cat vs kitten: 0.99\ncat vs car:    0.07",
          explanation: "`np.linalg.norm` computes a vector's length. With a real embedding model you would get vectors from an API or library call and compare them in exactly the same way.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Design a semantic FAQ search",
          task: "You have 200 FAQ answers and want users to find the right one even when they use different words. Describe, in 3-4 steps, how you would use embeddings.",
          hints: ["Something happens once, ahead of time.", "Something happens each time a user asks a question."],
          solution: "1. **Ahead of time:** embed every FAQ answer (or question+answer) and store the vectors.\n2. **At query time:** embed the user's question with the *same* embedding model.\n3. Compute cosine similarity between the question vector and every FAQ vector.\n4. Return the top few most similar FAQs (and consider a minimum similarity threshold so you can say “no good match”).",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["Embeddings map text to vectors where similar meanings are close.", "Cosine similarity compares direction, from −1 to 1.", "Embeddings enable semantic search, clustering and recommendations.", "Use the same model to embed queries and documents."],
          terms: [
            { term: "Embedding", definition: "A learned vector representation of text or other data." },
            { term: "Cosine similarity", definition: "The cosine of the angle between two vectors; a measure of directional similarity." },
            { term: "Semantic search", definition: "Finding results by meaning rather than exact keyword matches." },
          ],
          misconceptions: ["Each embedding dimension has a clear meaning. Usually they don't; meaning is spread across many dimensions."],
        },
      },
    ],
    quiz: {
      title: "Embeddings",
      questions: [
        { type: "single", prompt: "Two embeddings have cosine similarity close to 1. This means…", options: ["They point in nearly the same direction, so the texts are likely similar", "They are completely unrelated", "One is twice as long as the other", "The model has made an error"], answer: [0], explanation: "Cosine similarity near 1 means a very small angle: similar representations." },
        { type: "true_false", prompt: "For semantic search, you can embed documents with one model and questions with a different, unrelated model.", answer: [1], explanation: "False. Vectors from different models live in different spaces and can't be meaningfully compared." },
        { type: "multiple", prompt: "Which are common uses of embeddings? (Select all that apply)", options: ["Semantic search", "Clustering similar documents", "Recommendations", "Guaranteeing factual accuracy"], answer: [0, 1, 2], explanation: "Embeddings measure similarity; they don't verify facts." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "attention-mechanisms",
    module: "how-llms-work",
    order: 3,
    title: "Attention: How Transformers Use Context",
    summary: "Attention lets every token gather information from the tokens that matter to it. It's the core idea behind transformers and modern LLMs.",
    difficulty: "intermediate",
    minutes: 25,
    tier: "premium",
    objectives: [
      "Explain the purpose of attention in plain English",
      "Describe queries, keys and values",
      "Compute scaled dot-product attention for a tiny example",
    ],
    prerequisites: ["embeddings"],
    references: [
      { title: "Vaswani et al. (2017): Attention Is All You Need", url: "https://arxiv.org/abs/1706.03762" },
      { title: "Alammar: The Illustrated Transformer", url: "https://jalammar.github.io/illustrated-transformer/" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "“The animal didn't cross the street because **it** was too tired.” You instantly know *it* means the animal. Change *tired* to *wide*, and *it* means the street. **How does a model figure that out?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "Each token starts with its own embedding, but a word's meaning depends on context. **Attention** lets each token look at the other tokens and decide how much each one matters to it, then blend in their information.\n\nFor *it*, a well-trained model gives a lot of weight to *animal* (or *street*) and little to *the* or *because*. The result is a new, **context-aware** representation of *it*.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Highlighting while reading", markdown: "When you reach a confusing word, you glance back and highlight the earlier words that explain it. Attention weights are those highlights: stronger highlight, more influence.\n\n*Where it breaks down:* a transformer runs many attention “heads” in parallel in every layer, each learning different kinds of relationships, and they aren't always this interpretable." } },
      {
        type: "visualization",
        content: {
          component: "attention",
          title: "Attention explorer",
          objective: "See how attention weights connect words and how changing context shifts them.",
          instructions: "Click 'it' and look at where its attention goes. Then switch the ending from 'tired' to 'wide'. Click other words too.",
          fallback: "In 'The animal didn't cross the street because it was too tired', the word 'it' puts most of its attention weight on 'animal'. Changing the last word to 'wide' shifts most of the weight to 'street'. Each word's weights across the sentence sum to 100%. These weights are illustrative, not taken from a real model.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "Each token's vector is projected into three vectors using learned weight matrices:\n\n- **Query (q):** what this token is looking for.\n- **Key (k):** what this token offers to be matched against.\n- **Value (v):** the information it passes on if attended to.\n\nFor all tokens at once (matrices Q, K, V), **scaled dot-product attention** is:\n\n```\nAttention(Q, K, V) = softmax(Q Kᵀ / √d_k) · V\n```\n\n1. `Q Kᵀ` scores every query against every key (dot products: high when vectors align).\n2. Divide by `√d_k` (key dimension) to keep scores in a stable range.\n3. **Softmax** turns each row of scores into weights that sum to 1.\n4. Multiply by V: each output is a weighted average of value vectors.\n\n**Multi-head attention** runs several of these in parallel with different projections. In **decoder** models like GPT-style LLMs, a **causal mask** stops tokens attending to *later* tokens, so the model can be trained to predict the next token.\n\nAttention compares every token with every other, so its cost grows with the **square** of sequence length. A key reason context windows are limited and an active research area.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Scaled dot-product attention in NumPy",
          language: "python",
          code: "import numpy as np\n\ndef softmax(x):\n    e = np.exp(x - x.max(axis=-1, keepdims=True))\n    return e / e.sum(axis=-1, keepdims=True)\n\n# 3 tokens, d_k = 2 (tiny, hand-picked vectors)\nQ = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])\nK = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])\nV = np.array([[10.0, 0.0], [0.0, 10.0], [5.0, 5.0]])\n\nscores = Q @ K.T / np.sqrt(K.shape[1])\nweights = softmax(scores)\noutput = weights @ V\n\nprint(np.round(weights, 2))\nprint(np.round(output, 2))",
          expectedOutput: "[[0.4  0.2  0.4 ]\n [0.2  0.4  0.4 ]\n [0.25 0.25 0.5 ]]\n[[6.02 3.98]\n [3.98 6.02]\n [5.   5.  ]]",
          explanation: "Each row of `weights` sums to 1 and says how much that token attends to each token. Token 1's query matches keys 1 and 3 best, so its output leans towards their values. Real models learn Q, K and V projections from data.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Why the √d_k?",
          task: "Suppose query and key vectors have 1,024 dimensions with values of similar size. What could go wrong if we computed softmax(Q·Kᵀ) **without** dividing by √d_k?",
          hints: ["A dot product sums d_k products. What happens to its typical size as d_k grows?", "What does softmax do when one input is much larger than the others?"],
          solution: "Dot products grow with the number of dimensions, so scores become very large. Softmax of large values becomes nearly one-hot (almost all weight on one token), and its gradients become tiny: training slows or stalls. Dividing by √d_k keeps scores in a range where softmax stays smooth.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["Attention lets each token build a context-aware representation from other tokens.", "Queries are matched against keys; values are blended by the resulting weights.", "Softmax makes weights positive and sum to 1.", "Cost grows quadratically with sequence length."],
          terms: [
            { term: "Self-attention", definition: "Attention where queries, keys and values all come from the same sequence." },
            { term: "Attention head", definition: "One set of Q/K/V projections; transformers use many in parallel." },
            { term: "Causal mask", definition: "Prevents tokens attending to future tokens in next-token prediction." },
          ],
          misconceptions: ["Attention weights fully explain a model's decision. They are one signal among many and can be misleading on their own."],
        },
      },
    ],
    quiz: {
      title: "Attention",
      questions: [
        { type: "single", prompt: "In attention, what do the softmax weights for one query always sum to?", options: ["0", "1", "The number of tokens", "√d_k"], answer: [1], explanation: "Softmax produces a probability-like distribution that sums to 1." },
        { type: "single", prompt: "Which vector carries the information that is passed on when a token is attended to?", options: ["Query", "Key", "Value", "Bias"], answer: [2], explanation: "Queries and keys decide the weights; values are what get blended into the output." },
        { type: "single", prompt: "If the sequence length doubles, the attention score matrix grows by roughly…", options: ["2×", "4×", "The same", "√2×"], answer: [1], explanation: "Every token is compared with every token, so n² entries: doubling n gives 4×." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "temperature-and-sampling",
    module: "how-llms-work",
    order: 4,
    title: "Temperature and Sampling: Why AI Answers Vary",
    summary: "Ask the same question twice, get different answers. Learn how LLMs choose each next token and how temperature and top-k control randomness.",
    difficulty: "beginner",
    minutes: 15,
    objectives: [
      "Explain next-token prediction as choosing from a probability distribution",
      "Describe the effect of temperature and top-k on output",
      "Choose sensible settings for factual versus creative tasks",
    ],
    prerequisites: ["tokens-and-tokenization"],
    references: [
      { title: "Holtzman et al. (2020): The Curious Case of Neural Text Degeneration (nucleus sampling)", url: "https://arxiv.org/abs/1904.09751" },
      { title: "Hugging Face: Generation strategies", url: "https://huggingface.co/docs/transformers/generation_strategies" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "You ask a chatbot for a story title. You regenerate: a different title. **Is the model broken? Changing its mind? Or doing exactly what it's designed to do?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "A language model writes **one token at a time**. At each step it gives every possible next token a probability. For example, after “The weather today is”: *sunny* 40%, *cloudy* 22%, *warm* 13%…\n\nThen it **picks** one. If it always picked the top choice, output would be predictable but often dull and repetitive. So most systems **sample**: they pick randomly, in proportion to the probabilities.\n\n**Temperature** adjusts how adventurous that sampling is:\n\n- **Low temperature** → focus on the most likely tokens (consistent, conservative).\n- **High temperature** → spread probability to unlikely tokens (varied, creative, riskier).",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Choosing from a menu", markdown: "At low temperature you almost always order your favourite dish. At high temperature you're feeling adventurous and might order anything: occasionally something strange.\n\n*Where it breaks down:* the model has no preferences; the “favourite” is just the highest-probability token given the text so far." } },
      {
        type: "visualization",
        content: {
          component: "temperature",
          title: "Temperature playground",
          objective: "See how temperature and top-k reshape next-token probabilities and change sampled outputs.",
          instructions: "Move the temperature slider and watch the bars. Sample 20 tokens at 0.2, 1.0 and 1.8 and compare. Then set top-k to 3 at high temperature.",
          fallback: "For the prompt 'The weather today is', the most likely next token is 'sunny', followed by 'cloudy', 'warm' and 'rainy'; nonsense tokens like 'banana' have tiny probability. At temperature 0.2 'sunny' gets almost all the probability and samples are nearly always 'sunny'. At 1.0 the original probabilities apply. At 1.8 the distribution flattens and even 'purple' or 'banana' appear sometimes. Top-k = 3 removes every token outside the three most likely, preventing nonsense even at high temperature.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "The model outputs a score (**logit**) `zᵢ` for each token in its vocabulary. Probabilities come from a softmax with temperature `T`:\n\n```\npᵢ = exp(zᵢ / T) / Σⱼ exp(zⱼ / T)\n```\n\n- `T < 1` exaggerates differences between logits → sharper distribution.\n- `T > 1` shrinks differences → flatter distribution.\n- `T → 0` approaches **greedy decoding** (always the top token).\n\nTruncation methods limit which tokens can be sampled:\n\n- **Top-k:** keep only the k most likely tokens.\n- **Top-p (nucleus):** keep the smallest set of tokens whose probabilities add up to p (e.g. 0.9).\n\n**Practical guidance:** use low temperature for extraction, classification, code and factual Q&A; moderate-to-higher for brainstorming and creative writing. Even at temperature 0, outputs are not always perfectly identical across runs because of numerical and infrastructure details. Don't build systems that assume exact repeatability.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Softmax with temperature",
          language: "python",
          code: "import numpy as np\n\ntokens = [\"sunny\", \"cloudy\", \"warm\", \"banana\"]\nlogits = np.array([3.2, 2.6, 2.1, -2.5])\n\ndef probs(logits, T):\n    z = logits / T\n    e = np.exp(z - z.max())\n    return e / e.sum()\n\nfor T in [0.2, 1.0, 2.0]:\n    p = probs(logits, T)\n    print(f\"T={T}: \" + \", \".join(f\"{t} {x:.2f}\" for t, x in zip(tokens, p)))",
          expectedOutput: "T=0.2: sunny 0.95, cloudy 0.05, warm 0.00, banana 0.00\nT=1.0: sunny 0.53, cloudy 0.29, warm 0.18, banana 0.00\nT=2.0: sunny 0.42, cloudy 0.31, warm 0.24, banana 0.02",
          explanation: "Same logits, different temperatures. At T=0.2 almost all probability goes to 'sunny'; at T=2.0 even 'banana' has a small chance.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Pick the settings",
          task: "Suggest a temperature (low / medium / high) for each task and explain briefly:\n\n1. Extracting invoice totals into JSON.\n2. Brainstorming 20 names for a bakery.\n3. Answering customer questions from a policy document.",
          hints: ["Is there one correct answer, or many good ones?"],
          solution: "1. **Low**: there is one correct value; randomness only adds errors.\n2. **High**: you want variety and surprise.\n3. **Low**: answers should be consistent and grounded in the document.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["LLMs generate text by repeatedly choosing the next token from a probability distribution.", "Temperature sharpens (low) or flattens (high) that distribution.", "Top-k and top-p remove unlikely tokens.", "Use low temperature for accuracy-critical tasks."],
          terms: [
            { term: "Logit", definition: "A model's raw score for a token before softmax." },
            { term: "Temperature", definition: "A parameter that scales logits to control randomness." },
            { term: "Greedy decoding", definition: "Always choosing the single most likely next token." },
          ],
          misconceptions: ["“Temperature 0 makes a model correct.” It makes it more consistent, not more accurate."],
        },
      },
    ],
    quiz: {
      title: "Temperature and sampling",
      questions: [
        { type: "single", prompt: "Raising the temperature makes the next-token distribution…", options: ["Sharper: the top token gets more probability", "Flatter: unlikely tokens get more probability", "Unchanged", "Shorter"], answer: [1], explanation: "Dividing logits by a larger T shrinks differences between them, flattening the distribution." },
        { type: "single", prompt: "Top-k = 1 is equivalent to…", options: ["Greedy decoding", "Maximum randomness", "Nucleus sampling with p = 1", "Turning the model off"], answer: [0], explanation: "Only the single most likely token can be chosen." },
        { type: "true_false", prompt: "Setting temperature to 0 guarantees factually correct answers.", answer: [1], explanation: "False. It reduces randomness; the most likely answer can still be wrong." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "anatomy-of-an-effective-prompt",
    module: "prompt-fundamentals",
    order: 1,
    title: "Anatomy of an Effective Prompt",
    summary: "Role, context, task, format, constraints and examples: learn what each part of a prompt does and how to combine them.",
    difficulty: "beginner",
    minutes: 20,
    objectives: [
      "Identify the components of an effective prompt",
      "Rewrite a vague prompt into a structured one",
      "Explain why prompts should be tested rather than judged by feel",
    ],
    prerequisites: ["temperature-and-sampling"],
    references: [
      { title: "Anthropic: Prompt engineering overview", url: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" },
      { title: "OpenAI: Prompt engineering guide", url: "https://platform.openai.com/docs/guides/prompt-engineering" },
      { title: "Brown et al. (2020): Language Models are Few-Shot Learners", url: "https://arxiv.org/abs/2005.14165" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "Two people ask the same model for help with the same email. One gets a vague paragraph; the other gets a crisp, structured summary their team can act on. **What did the second person do differently?**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "A model only knows what's in its training and what's in your prompt. A good prompt removes guesswork. The most useful components are:\n\n1. **Context**: the material to work on and relevant background.\n2. **Task**: exactly what you want done, stated clearly.\n3. **Output format**: the structure you need (bullets, table, JSON, word limit).\n4. **Constraints**: rules to follow (“only use the text provided”, “if unsure, say so”).\n5. **Examples**: one or more samples of good output (*few-shot prompting*).\n6. **Role**: a perspective that sets tone and priorities.\n\nYou don't always need all six. Context and a clear task matter most.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Briefing a new colleague", markdown: "Write prompts as if briefing a smart colleague who knows nothing about your situation: give them the documents, say what you need, show what “good” looks like, and tell them what to avoid.\n\n*Where it breaks down:* a colleague would ask clarifying questions. A model usually guesses, so ambiguity becomes inconsistent output." } },
      {
        type: "visualization",
        content: {
          component: "prompt_playground",
          title: "Prompt playground",
          objective: "See how each prompt component changes the kind of response you get.",
          instructions: "Start with only the context. Add a clear task, then an output format, then constraints. Read the notes explaining each change.",
          fallback: "With only a customer email and no task, a model typically replies conversationally and asks what to do. Adding a clear task produces a summary, but it is long and unstructured. Adding an output format produces a scannable four-line summary with issue, urgency, sentiment and next action. Constraints (do not invent details; under 60 words) reduce the risk of fabricated information. A role and an example further steer tone and style. Responses in this lab are pre-written to illustrate typical differences.",
        },
      },
      {
        type: "comparison",
        content: {
          title: "Vague vs structured",
          columns: ["Vague prompt", "Structured prompt"],
          rows: [
            { label: "Prompt", values: ["“Summarise this email.”", "“Summarise the email below for a support agent. Format: Issue / Urgency / Sentiment / Next action. Use only information in the email. Under 60 words.”"] },
            { label: "Typical result", values: ["Paragraph of varying length and focus", "Consistent, scannable structure"] },
            { label: "Easy to automate?", values: ["No", "Yes. Fixed fields can be parsed"] },
          ],
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "- **System vs user messages:** chat APIs separate persistent instructions (*system*) from the request (*user*). Put stable rules and role in the system message.\n- **Delimiters:** wrap supplied material in clear markers (triple quotes, XML-style tags) so the model can tell instructions from data. This also helps against **prompt injection**, where text inside the data tries to issue new instructions, though delimiters alone are not a complete defence.\n- **Few-shot examples** strongly steer format and style. Use varied, correct examples; the model will copy their mistakes too.\n- **Ask for uncertainty:** explicitly permitting “I don't know” reduces pressure to hallucinate.\n- **Structured output:** many APIs can enforce JSON schemas: prefer that over hoping the model follows a format.\n\n**Evaluate, don't eyeball.** Build a small test set of realistic inputs, define what a good output looks like, and compare prompt versions on all of them. A prompt that works on one example often fails on the tenth. Re-test when you change models.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "A reusable prompt template",
          language: "python",
          code: "TEMPLATE = \"\"\"You are an experienced customer-support team lead.\n\nSummarise the customer email between the <email> tags for the agent handling it.\n\nRespond in exactly this format:\nIssue: <one sentence>\nUrgency: <low|medium|high> - <reason>\nNext action: <one sentence>\n\nRules:\n- Use only information in the email. If something is unknown, write \"unknown\".\n- Keep the whole answer under 60 words.\n\n<email>\n{email}\n</email>\"\"\"\n\nemail = \"My desk arrived with a cracked leg and I need it fixed before Friday.\"\nprompt = TEMPLATE.format(email=email)\nprint(prompt.splitlines()[0])\nprint(len(prompt.split()), \"words\")",
          expectedOutput: "You are an experienced customer-support team lead.\n74 words",
          explanation: "Keeping prompts as templates lets you version them, test them on many inputs, and reuse them in code. The final string would be sent to a model API as the user (or system + user) message.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Rewrite the prompt",
          task: "Improve this prompt: **“Write something about our new app for social media.”**\n\nAdd context, a clear task, format and at least one constraint.",
          hints: ["Which platform? Which audience? What should readers do after reading?", "How long should it be? What must it not claim?"],
          solution: "Example:\n\n> Our app *StudyBuddy* helps university students plan revision with spaced repetition. It launches on 1 March and is free.\n>\n> Write **three** alternative LinkedIn posts announcing the launch to university students.\n>\n> Format: each post under 80 words, one emoji maximum, end with a call to action to download from our website.\n>\n> Constraints: don't claim specific grade improvements; don't mention competitors.",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["Context and a clear task are the foundation.", "Output formats and constraints make responses consistent and safer.", "Examples steer style; roles steer perspective.", "Test prompts on many inputs; re-test when the model changes."],
          terms: [
            { term: "Few-shot prompting", definition: "Including examples of desired input-output pairs in the prompt." },
            { term: "System message", definition: "Persistent instructions that set behaviour for a conversation." },
            { term: "Prompt injection", definition: "Malicious instructions hidden in content that try to override the intended prompt." },
          ],
          misconceptions: ["“There's a magic phrase that makes models perfect.” Clear structure and testing beat tricks."],
        },
      },
    ],
    quiz: {
      title: "Prompt anatomy",
      questions: [
        { type: "single", prompt: "Which addition most directly makes a model's output easier to process automatically?", options: ["A friendly greeting", "A specified output format", "A longer role description", "Asking it to be creative"], answer: [1], explanation: "A fixed output format (or enforced schema) produces consistent, parseable results." },
        { type: "single", prompt: "What is few-shot prompting?", options: ["Using a very short prompt", "Including examples of desired outputs in the prompt", "Running the prompt a few times", "Limiting the answer length"], answer: [1], explanation: "Few-shot prompting shows the model examples to imitate." },
        { type: "true_false", prompt: "If a prompt works well on one example, it is safe to use in production.", answer: [1], explanation: "False. Evaluate on a varied set of realistic inputs first, and again after any model change." },
      ],
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "what-is-rag",
    module: "rag-foundations",
    order: 1,
    title: "What Is Retrieval-Augmented Generation (RAG)?",
    summary: "Give a language model the right documents at the right time so it can answer from your knowledge, with sources.",
    difficulty: "intermediate",
    minutes: 25,
    tier: "premium",
    objectives: [
      "Explain why RAG is used and what problems it addresses",
      "Describe the stages of a RAG pipeline",
      "Diagnose retrieval failures caused by chunking and top-k choices",
    ],
    prerequisites: ["embeddings", "anatomy-of-an-effective-prompt"],
    references: [
      { title: "Lewis et al. (2020): Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", url: "https://arxiv.org/abs/2005.11401" },
      { title: "Gao et al. (2023): Retrieval-Augmented Generation for LLMs: A Survey", url: "https://arxiv.org/abs/2312.10997" },
    ],
    blocks: [
      { type: "rich_text", content: { title: "The big question", markdown: "You want an assistant that answers questions about **your** company handbook. The model has never seen it, the handbook changes monthly, and you need answers with sources. **Retrain the model every month? There's a better way.**" } },
      {
        type: "rich_text",
        content: {
          title: "Explain it simply",
          markdown: "**Retrieval-Augmented Generation** splits the job in two:\n\n1. **Retrieve:** search your documents for the passages most relevant to the question.\n2. **Generate:** give those passages to the language model with instructions to answer **using them**, and to cite them.\n\nThe model's general language ability does the writing; your documents supply the facts. Update the documents and the answers update too: no retraining.",
        },
      },
      { type: "callout", content: { variant: "analogy", title: "Open-book exam", markdown: "Without RAG, the model takes a closed-book exam from memory. With RAG, it's an open-book exam: it can look up the relevant pages first.\n\n*Where it breaks down:* in an open-book exam you choose what to read. In RAG, a separate retrieval step chooses, and if it picks the wrong pages, the model can't find the answer." } },
      {
        type: "diagram",
        content: {
          title: "A basic RAG pipeline",
          layout: "flow",
          description: "Offline: documents are split into chunks, embedded, and stored in a vector index. Online: a question is embedded, the most similar chunks are retrieved, inserted into a prompt, and the model generates an answer with citations.",
          nodes: [
            { label: "Chunk documents", detail: "offline" },
            { label: "Embed & index", detail: "offline" },
            { label: "Embed question", detail: "per query" },
            { label: "Retrieve top-k", detail: "similarity search" },
            { label: "Generate answer", detail: "with citations" },
          ],
        },
      },
      {
        type: "visualization",
        content: {
          component: "rag_pipeline",
          title: "RAG pipeline explorer",
          objective: "See how chunk size, overlap and top-k determine whether the answer reaches the model.",
          instructions: "Pick a question and look at which chunks are retrieved. Try very small chunks (8 words), very large chunks (120 words), and different top-k values until all three questions retrieve their answers.",
          fallback: "A five-section employee handbook is split into chunks and each chunk is scored against the question. With moderate chunk sizes (around 30-50 words) and top-k of 2-3, the chunk containing the answer is usually retrieved. Very small chunks can separate the answer from the words that match the question, so the answer is missed. Very large chunks retrieve the answer but add irrelevant text and cost. If the answer isn't in the retrieved context, the model cannot answer correctly and may hallucinate.",
        },
      },
      {
        type: "rich_text",
        content: {
          title: "Technical deep dive",
          markdown: "**Ingestion:** extract text (PDF, HTML, docs), clean it, and split it into **chunks**: often a few hundred tokens with some **overlap** so sentences aren't cut off from their context. Splitting on headings and paragraphs usually beats fixed-size splits.\n\n**Indexing:** embed each chunk and store vectors plus metadata (source, page, date, permissions) in a **vector database** or search index.\n\n**Retrieval:** embed the question and find nearest chunks. Production systems often combine:\n\n- **Hybrid search**: embeddings + keyword (BM25) to catch exact terms like product codes.\n- **Reranking**: a slower, more accurate model re-scores the top candidates.\n- **Metadata filters**: e.g. only documents the user is allowed to see.\n\n**Generation:** the prompt includes the retrieved chunks with IDs and instructions such as *answer only from the sources; cite source IDs; if the answer isn't present, say so*.\n\n**Evaluation:** measure retrieval (did the right chunk appear in top-k?) separately from generation (is the answer correct and faithful to the sources?). Most RAG failures are **retrieval failures**.\n\n**Security:** retrieved documents can contain prompt-injection text: treat them as untrusted data, and enforce access control *before* retrieval.",
        },
      },
      {
        type: "code_example",
        content: {
          title: "Minimal retrieval with TF-IDF",
          language: "python",
          code: "from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\nchunks = [\n    \"Remote employees can claim up to 300 euros per year for home-office equipment.\",\n    \"Full-time employees receive 25 days of paid annual leave.\",\n    \"Report lost devices to the security team within 24 hours.\",\n]\nquestion = \"How much can I claim for home-office equipment?\"\n\nvectorizer = TfidfVectorizer().fit(chunks + [question])\nscores = cosine_similarity(vectorizer.transform([question]), vectorizer.transform(chunks))[0]\n\nbest = scores.argmax()\nprint(f\"Best chunk ({scores[best]:.2f}): {chunks[best]}\")\n\nprompt = f\"Answer using only this source. If it is not there, say you don't know.\\n[1] {chunks[best]}\\nQuestion: {question}\"",
          expectedOutput: "Best chunk (0.47): Remote employees can claim up to 300 euros per year for home-office equipment.",
          explanation: "TF-IDF is a keyword-based stand-in that runs anywhere. In a real system you'd swap it for an embedding model and a vector index. The retrieve-then-prompt structure stays the same.",
        },
      },
      {
        type: "practice",
        content: {
          title: "Diagnose the failure",
          task: "Your RAG assistant answers “I don't know” to *“What is the parental leave policy?”* even though the handbook has a section on it. List three things you would check, in order.",
          hints: ["Start at the beginning of the pipeline.", "Is the right chunk retrieved at all? If yes, what happens next?"],
          solution: "1. **Ingestion:** was the section extracted correctly (e.g. not lost from a table or scanned PDF)?\n2. **Retrieval:** search for the question and inspect the top-k. Is the parental-leave chunk there? If not, try hybrid search, different chunking, a larger k, or query rewriting (the handbook may say “family leave”).\n3. **Generation:** if the chunk *is* retrieved, check the prompt. Are instructions too strict, or is the chunk truncated by the context limit?",
        },
      },
      { type: "quiz", content: { quizId: "$QUIZ" } },
      {
        type: "summary",
        content: {
          takeaways: ["RAG retrieves relevant passages and asks the model to answer from them.", "It keeps knowledge up to date without retraining and enables citations.", "Chunking, retrieval quality and top-k decide what the model can see.", "Evaluate retrieval and generation separately; treat retrieved text as untrusted."],
          terms: [
            { term: "Chunk", definition: "A passage of a document indexed for retrieval." },
            { term: "Top-k", definition: "The number of highest-scoring chunks passed to the model." },
            { term: "Reranking", definition: "Re-scoring retrieved candidates with a more accurate model." },
            { term: "Faithfulness", definition: "Whether an answer is supported by the retrieved sources." },
          ],
          misconceptions: ["“RAG eliminates hallucinations.” It reduces them when retrieval works, but models can still misread or go beyond sources."],
        },
      },
    ],
    quiz: {
      title: "RAG fundamentals",
      questions: [
        { type: "single", prompt: "What is the main advantage of RAG over retraining a model on your documents?", options: ["It makes the model smaller", "Knowledge can be updated by changing documents, and answers can cite sources", "It removes the need for prompts", "It guarantees perfect answers"], answer: [1], explanation: "RAG supplies up-to-date documents at query time and makes citation possible." },
        { type: "single", prompt: "The correct chunk is never in the top-k results. Where is the problem?", options: ["Generation", "Retrieval (or ingestion/chunking)", "The model's temperature", "The user interface"], answer: [1], explanation: "If the right passage isn't retrieved, the model can't use it: fix ingestion, chunking or retrieval first." },
        { type: "multiple", prompt: "Which techniques can improve retrieval quality? (Select all that apply)", options: ["Hybrid keyword + embedding search", "Reranking", "Better chunking on document structure", "Raising the generation temperature"], answer: [0, 1, 2], explanation: "Temperature affects generation randomness, not which chunks are retrieved." },
      ],
    },
  },
];
