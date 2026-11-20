# Interactive Learning Engine

## 1. Purpose

Build a reusable lesson renderer and interactive component system. Individual lessons should be assembled from approved content blocks rather than custom-coded pages.

## 2. Core architecture

- **Lesson data:** Structured content stored in the database.
- **Block registry:** Maps each approved block type to a React component.
- **Lesson renderer:** Reads ordered blocks and renders the matching component.
- **Interactive state:** Manages local experiment state and reset behavior.
- **Progress service:** Records lesson completion and assessment outcomes.
- **Admin preview:** Shows how a lesson will appear before publication.

## 3. Supported content block types

### Editorial blocks
- Rich text
- Callout or key idea
- Glossary term
- Image
- Video
- External reference
- Downloadable resource

### Visual blocks
- Static diagram
- SVG diagram
- Animated sequence
- Flowchart
- Timeline
- Comparison view

### Interactive blocks
- Parameter controls
- Step-by-step simulation
- Classification activity
- Drag-and-drop exercise
- Matching activity
- Scenario challenge
- Interactive chart

### Coding blocks
- Read-only code example
- Editable code exercise
- Code runner
- Expected-output comparison
- Guided coding challenge

### Assessment blocks
- Multiple-choice quiz
- Multiple-select quiz
- True/false
- Short answer
- Ordering exercise
- Scenario-based assessment

## 4. Initial interactive labs

| Lab | Concept | Learner interaction |
|---|---|---|
| AI vs ML vs DL explorer | AI terminology | Explore relationships |
| Neuron playground | Artificial neuron | Change weights and bias |
| Perceptron simulator | Classification | Adjust inputs and weights |
| Gradient descent playground | Optimization | Change learning rate |
| Linear regression explorer | Regression | Adjust line parameters |
| Decision tree explorer | Classification | Change split conditions |
| K-means simulator | Clustering | Move points and centroids |
| Confusion matrix explorer | Evaluation | Change prediction outcomes |
| Tokenization explorer | LLM input | Change text and inspect tokens |
| Attention explorer | Transformers | Inspect attention relationships |
| Temperature playground | Text generation | Compare sampling behavior |
| RAG pipeline explorer | Retrieval | Change chunks and inspect results |
| Agent workflow simulator | Tool use | Follow a task through tools |
| Object detection playground | Computer vision | Inspect bounding boxes |
| Embedding explorer | Semantic similarity | Compare vector relationships |

## 5. Interaction requirements

Every interactive visualization should provide:
- A clear learning objective
- A short instruction
- A useful default state
- Controls with understandable labels
- Immediate feedback
- Reset functionality
- An explanation of what changed
- A guided challenge where appropriate
- Keyboard accessibility
- Mobile-friendly behavior
- A fallback explanation if the interactive element cannot load

## 6. Visualization engineering

Use the simplest suitable technology:
- SVG for diagrams and node-based visualizations.
- React and CSS for straightforward interactions.
- D3.js for complex data-driven visualizations.
- Canvas for high-volume drawing or performance-sensitive simulations.
- WebGL only when genuinely necessary.

Do not use animation merely for decoration. Every animation should explain a process, relationship or change.

## 7. Code playground

Start with Python.

Requirements:
- Isolated execution environment
- Per-execution time limit
- Memory and CPU limits
- Restricted network access
- Temporary filesystem
- No access to application secrets
- No access to the main database credentials
- Output and error capture
- Abuse and rate limiting
- Clear reset behavior

Never run arbitrary learner code inside the main Next.js server process.

Possible implementation options include a dedicated container-based execution service or a specialist code-execution provider. Evaluate isolation, pricing, quotas, data handling and operational complexity before choosing.

## 8. Lesson data example

A lesson can be stored as structured JSON. Example:

```json
{
  "title": "Understanding Gradient Descent",
  "slug": "understanding-gradient-descent",
  "difficulty": "beginner",
  "blocks": [
    {
      "type": "rich_text",
      "title": "The intuition",
      "content": "Imagine walking downhill..."
    },
    {
      "type": "visualization",
      "component": "gradient_descent",
      "config": {
        "function": "quadratic",
        "showGradient": true
      }
    },
    {
      "type": "quiz",
      "question": "What does the learning rate control?",
      "options": [
        "Step size",
        "Dataset size",
        "Number of labels"
      ]
    }
  ]
}
```

This is an illustrative content format. Validate every block against a strict schema before saving or publishing.

## 9. Component registry

Use an explicit registry such as:

```ts
const lessonBlockRegistry = {
  rich_text: RichTextBlock,
  image: ImageBlock,
  video: VideoBlock,
  diagram: DiagramBlock,
  visualization: VisualizationBlock,
  code_example: CodeExampleBlock,
  code_exercise: CodeExerciseBlock,
  quiz: QuizBlock,
  challenge: ChallengeBlock,
  resource: ResourceBlock,
};
```

The renderer should reject unknown block types safely and report them to the content administrator.

## 10. Performance and accessibility

- Lazy-load heavy visualizations.
- Load code execution tools only when needed.
- Provide static alternatives for complex visualizations.
- Respect reduced-motion preferences.
- Ensure keyboard navigation.
- Provide text descriptions for diagrams.
- Avoid color as the only signal.
- Test on mobile and slower connections.
- Track errors and performance by block type.

## 11. Success metrics

Measure:
- Visualization load success
- Interaction completion
- Reset and replay usage
- Exercise completion
- Quiz improvement
- Lesson completion
- Learner-reported clarity
- Errors and abandonment

Do not interpret interaction count alone as proof of learning.
