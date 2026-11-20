import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/academy/cards";

export const metadata: Metadata = { title: "About", description: `Why ${site.name} exists and how we teach.` };

const PRINCIPLES = [
  "Beginner-friendly does not mean technically shallow.",
  "Explain the intuition before introducing dense terminology.",
  "Use visualizations when they genuinely improve comprehension.",
  "Let learners manipulate concepts rather than only watch them.",
  "Connect theory to implementation and real-world applications.",
  "Make foundational learning genuinely useful in the free tier.",
  "Keep content current, referenced and reviewable.",
  "Make accessibility and responsive design standard requirements.",
  "Do not use gamification as a substitute for learning.",
  "Prioritize learning outcomes over content volume.",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title={`About ${site.name}`} description={site.description} />
      <div className="container-page grid max-w-5xl gap-10 py-12 md:grid-cols-2">
        <section>
          <h2 className="text-2xl font-bold">Why this exists</h2>
          <div className="prose-lesson mt-4">
            <p>AI is changing how people study, work and build software, but most learning resources are either too shallow to be useful or too dense to be approachable.</p>
            <p>This platform combines structured education, visual learning, practical coding and career guidance so that students, developers and working professionals can genuinely understand AI and build with it.</p>
            <p>Every lesson is reviewed for technical accuracy, dated, and referenced. Fast-moving topics such as model APIs and pricing are re-verified on a schedule.</p>
          </div>
          <h2 className="mt-10 text-2xl font-bold">The creator</h2>
          <div className="prose-lesson mt-4">
            <p>{site.name} is built and curated by an AI educator and engineer who believes difficult ideas become approachable when you can see them, play with them and build with them.</p>
            <p>Have feedback, found an error, or want to bring a workshop to your institution? <Link href="/contact">Get in touch</Link>.</p>
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-xl font-bold">Our teaching principles</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">{PRINCIPLES.map((p) => <li key={p}>{p}</li>)}</ol>
        </section>
      </div>
    </>
  );
}
