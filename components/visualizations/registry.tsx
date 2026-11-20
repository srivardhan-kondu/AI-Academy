"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LabKey } from "@/lib/lesson/labs";

export type LabProps = { config?: Record<string, unknown> };

const loading = () => (
  <div className="grid h-64 place-items-center rounded-xl bg-slate-50 text-sm text-slate-500" role="status">
    Loading interactive lab…
  </div>
);

/** Lazy-loaded lab registry — each lab's code is only downloaded when used. */
const labRegistry: Record<LabKey, ComponentType<LabProps>> = {
  ai_ml_dl_explorer: dynamic(() => import("./labs/ai-ml-dl"), { loading }),
  neuron_playground: dynamic(() => import("./labs/neuron"), { loading }),
  gradient_descent: dynamic(() => import("./labs/gradient-descent"), { loading }),
  linear_regression: dynamic(() => import("./labs/linear-regression"), { loading }),
  decision_tree: dynamic(() => import("./labs/decision-tree"), { loading }),
  kmeans: dynamic(() => import("./labs/kmeans"), { loading }),
  confusion_matrix: dynamic(() => import("./labs/confusion-matrix"), { loading }),
  tokenizer: dynamic(() => import("./labs/tokenizer"), { loading }),
  embedding_explorer: dynamic(() => import("./labs/embeddings"), { loading }),
  attention: dynamic(() => import("./labs/attention"), { loading }),
  temperature: dynamic(() => import("./labs/temperature"), { loading }),
  prompt_playground: dynamic(() => import("./labs/prompt-playground"), { loading }),
  rag_pipeline: dynamic(() => import("./labs/rag-pipeline"), { loading }),
};

export function LabLoader({ component, config }: { component: LabKey; config?: Record<string, unknown> }) {
  const Lab = labRegistry[component];
  if (!Lab) throw new Error(`Unknown lab: ${component}`);
  return <Lab config={config} />;
}
