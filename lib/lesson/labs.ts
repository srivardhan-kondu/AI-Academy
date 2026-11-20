/** Registered interactive lab keys. Shared by server validation and the client registry. */
export const LAB_KEYS = [
  "ai_ml_dl_explorer",
  "neuron_playground",
  "gradient_descent",
  "linear_regression",
  "decision_tree",
  "kmeans",
  "confusion_matrix",
  "tokenizer",
  "embedding_explorer",
  "attention",
  "temperature",
  "prompt_playground",
  "rag_pipeline",
] as const;

export type LabKey = (typeof LAB_KEYS)[number];

export const isLabKey = (k: string): k is LabKey => (LAB_KEYS as readonly string[]).includes(k);
