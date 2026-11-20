import Link from "next/link";
import { Eye, Lightbulb, FlaskConical, Code2, PenLine, Rocket, ArrowRight } from "lucide-react";
import { listPaths, listLabs, listSchools } from "@/lib/content/queries";
import { PathCard } from "@/components/academy/cards";
import { site } from "@/lib/site";

const LOOP = [
  { icon: Lightbulb, title: "Understand", text: "Plain-English explanations and honest analogies — including where they break down." },
  { icon: Eye, title: "Visualize", text: "Diagrams that show relationships and processes, not decoration." },
  { icon: FlaskConical, title: "Experiment", text: "Interactive labs where you change the inputs and see what happens." },
  { icon: Code2, title: "Implement", text: "Worked code examples with expected output and line-by-line reasoning." },
  { icon: PenLine, title: "Practice", text: "Guided exercises with hints, and knowledge checks that test understanding." },
  { icon: Rocket, title: "Apply", text: "Real-world use cases and projects you can put in a portfolio." },
];

export default async function Home() {
  const paths = (await listPaths()).slice(0, 3);
  const labs = (await listLabs()).slice(0, 6);
  const schools = await listSchools();
  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="eyebrow">Interactive AI education</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{site.tagline}</h1>
            <p className="mt-4 text-xl text-slate-700">{site.promise}</p>
            <p className="mt-4 max-w-xl text-slate-600">
              From your first “what is AI?” to transformers, RAG and production deployment — taught with visual explanations, hands-on labs and practical projects. Beginner-friendly never means shallow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/get-started" className="btn-primary px-5 py-3 text-base">Find your learning path</Link>
              <Link href="/academy" className="btn-secondary px-5 py-3 text-base">Explore the Academy</Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">Foundational lessons are free — no card required.</p>
          </div>
          <div className="card self-center p-6">
            <p className="text-sm font-semibold text-slate-700">Try it now: how does a model learn?</p>
            <p className="mt-1 text-sm text-slate-600">Gradient descent is how most AI models improve. Adjust the learning rate and watch the ball roll downhill.</p>
            <Link href="/labs/gradient-descent" className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white hover:bg-slate-800">
              <span>
                <span className="block text-xs text-brand-200">Interactive lab</span>
                <span className="text-lg font-semibold">Gradient descent playground</span>
              </span>
              <ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
            <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div><dt className="text-xs text-slate-500">Schools</dt><dd className="text-2xl font-bold">{schools.length}</dd></div>
              <div><dt className="text-xs text-slate-500">Paths</dt><dd className="text-2xl font-bold">{(await listPaths()).length}</dd></div>
              <div><dt className="text-xs text-slate-500">Labs</dt><dd className="text-2xl font-bold">{(await listLabs()).length}</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="loop-h">
        <h2 id="loop-h" className="text-center text-3xl font-bold text-slate-900">One learning loop, every lesson</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">We optimise for whether you can explain a concept, use it correctly and apply it — not for how many lessons you click through.</p>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOOP.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card p-5">
              <span className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><Icon aria-hidden className="h-5 w-5" /></span>
                <span className="text-lg font-semibold">{i + 1}. {title}</span>
              </span>
              <p className="mt-3 text-sm text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-slate-200 bg-white py-16" aria-labelledby="paths-h">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Learning paths</p>
              <h2 id="paths-h" className="text-3xl font-bold text-slate-900">Start with a goal</h2>
            </div>
            <Link href="/academy/paths" className="font-semibold text-brand-700">See all paths →</Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{paths.map((p) => <PathCard key={p.id} path={p} />)}</div>
        </div>
      </section>

      <section className="container-page py-16" aria-labelledby="labs-h">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Interactive labs</p>
            <h2 id="labs-h" className="text-3xl font-bold text-slate-900">Learn by changing things</h2>
          </div>
          <Link href="/labs" className="font-semibold text-brand-700">All labs →</Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((l) => (
            <Link key={l.id} href={`/labs/${l.slug}`} className="card flex items-center gap-3 p-4 hover:border-brand-300">
              <FlaskConical aria-hidden className="h-5 w-5 shrink-0 text-brand-600" />
              <span><span className="block font-semibold">{l.title}</span><span className="text-sm text-slate-600">{l.concept}</span></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page">
        <div className="rounded-3xl bg-slate-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold">Ready to understand AI properly?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">Create a free account to track progress, save bookmarks and pick up exactly where you left off.</p>
          <Link href="/signup" className="btn mt-6 bg-white px-5 py-3 text-base text-slate-900 hover:bg-slate-100">Start learning free</Link>
        </div>
      </section>
    </>
  );
}
