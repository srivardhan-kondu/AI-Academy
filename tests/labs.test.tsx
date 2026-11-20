/** Renders every lab's initial state to catch render-time errors. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToString } from "react-dom/server";
import { createElement, type ComponentType } from "react";
import { LAB_KEYS } from "../lib/lesson/labs";

const files: Record<string, string> = {
  ai_ml_dl_explorer: "ai-ml-dl",
  neuron_playground: "neuron",
  gradient_descent: "gradient-descent",
  linear_regression: "linear-regression",
  decision_tree: "decision-tree",
  kmeans: "kmeans",
  confusion_matrix: "confusion-matrix",
  tokenizer: "tokenizer",
  embedding_explorer: "embeddings",
  attention: "attention",
  temperature: "temperature",
  prompt_playground: "prompt-playground",
  rag_pipeline: "rag-pipeline",
};

for (const key of LAB_KEYS) {
  test(`lab ${key} renders with a reset button and explanation`, async () => {
    const mod = (await import(`../components/visualizations/labs/${files[key]}.tsx`)) as { default: ComponentType<{ config?: Record<string, unknown> }> };
    const html = renderToString(createElement(mod.default, {}));
    assert.ok(html.includes("Reset"), "has reset");
    assert.ok(html.includes("What&#x27;s happening") || html.includes("What's happening"), "has explanation");
  });
}
