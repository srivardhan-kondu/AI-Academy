"use client";

import { useMemo, useRef, useState } from "react";
import { LabShell, Slider, Stat, Marker, mulberry32, SERIES } from "../lab-kit";

type P = { x: number; y: number };
const W = 360, H = 300;
const sx = (x: number) => (x / 10) * W;
const sy = (y: number) => H - (y / 10) * H;

function makePoints(): P[] {
  const rnd = mulberry32(7);
  const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
  const centers = [[2.2, 2.5], [7.2, 3], [4.8, 7.6]];
  return centers.flatMap(([cx, cy]) =>
    Array.from({ length: 18 }, () => ({ x: Math.min(9.7, Math.max(0.3, cx + gauss() * 0.9)), y: Math.min(9.7, Math.max(0.3, cy + gauss() * 0.9)) })),
  );
}
const POINTS = makePoints();
const d2 = (a: P, b: P) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const assign = (cs: P[]) => POINTS.map((p) => cs.reduce((best, c, i) => (d2(p, c) < d2(p, cs[best]) ? i : best), 0));
const update = (cs: P[], a: number[]) =>
  cs.map((c, i) => {
    const mine = POINTS.filter((_, j) => a[j] === i);
    return mine.length ? { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length } : c;
  });
const inertia = (cs: P[], a: number[]) => POINTS.reduce((s, p, j) => s + d2(p, cs[a[j]]), 0);
function randomCentroids(k: number, seed: number): P[] {
  const r = mulberry32(seed);
  return Array.from({ length: k }, () => ({ x: 0.5 + r() * 9, y: 0.5 + r() * 9 }));
}
function converge(cs: P[]) {
  let c = cs;
  for (let i = 0; i < 50; i++) c = update(c, assign(c));
  return c;
}

export default function KMeans() {
  const [k, setK] = useState(3);
  const [seed, setSeed] = useState(3);
  const [cents, setCents] = useState<P[]>(() => randomCentroids(3, 3));
  const [labels, setLabels] = useState<number[] | null>(null);
  const [iter, setIter] = useState(0);
  const [lastMsg, setLastMsg] = useState("Centroids (large outlined markers) start in random places. Press “Assign points”.");
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<number | null>(null);

  const target = useMemo(() => {
    const c = converge([{ x: 2.2, y: 2.5 }, { x: 7.2, y: 3 }, { x: 4.8, y: 7.6 }]);
    return inertia(c, assign(c));
  }, []);
  const curInertia = labels ? inertia(cents, labels) : null;
  const stable = labels ? assign(update(cents, labels)).every((v, i) => v === labels[i]) && update(cents, labels).every((c, i) => d2(c, cents[i]) < 1e-6) : false;

  const reset = (nk = k, ns = seed) => {
    setCents(randomCentroids(nk, ns));
    setLabels(null);
    setIter(0);
    setLastMsg("Centroids start in random places. Press “Assign points”.");
  };
  const doAssign = () => {
    setLabels(assign(cents));
    setLastMsg("Assignment step: every point joined its nearest centroid.");
  };
  const doUpdate = () => {
    if (!labels) return;
    setCents(update(cents, labels));
    setIter((i) => i + 1);
    setLastMsg("Update step: each centroid moved to the average position of its points.");
  };
  const runAll = () => {
    const c = converge(cents);
    setCents(c);
    setLabels(assign(c));
    setIter((i) => i + 1);
    setLastMsg("Ran assign/update repeatedly until nothing changed (convergence).");
  };

  const moveTo = (i: number, p: P) => {
    setCents((cs) => cs.map((c, j) => (j === i ? { x: Math.min(10, Math.max(0, p.x)), y: Math.min(10, Math.max(0, p.y)) } : c)));
    setLabels(null);
    setLastMsg("You moved a centroid. Assign points again to see the effect.");
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current === null || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const loc = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    moveTo(dragging.current, { x: (loc.x / W) * 10, y: ((H - loc.y) / H) * 10 });
  };

  return (
    <LabShell
      onReset={() => { setK(3); setSeed(3); reset(3, 3); }}
      challenge={{ text: `With k = 3, reach convergence with inertia below ${(target * 1.05).toFixed(0)}. (Tip: bad starting centroids can trap you — try new ones or drag them.)`, done: k === 3 && stable && (curInertia ?? Infinity) < target * 1.05 }}
      explanation={
        <>
          <p>{lastMsg}</p>
          <p className="mt-1">
            K-means repeats two steps: <strong>assign</strong> each point to the nearest centroid, then <strong>update</strong> each centroid to the mean of its points. Inertia (total squared distance from points to their centroid) can only go down — but it can get stuck in a poor solution depending on where centroids start.
          </p>
          {stable && <p className="mt-1 font-medium">Converged — another iteration would not change anything.</p>}
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none rounded-xl border border-slate-200 bg-white"
            onPointerMove={onPointerMove}
            onPointerUp={() => (dragging.current = null)}
            onPointerLeave={() => (dragging.current = null)}
            role="group"
            aria-label={`Scatter of ${POINTS.length} points with ${k} centroids`}
          >
            {labels && POINTS.map((p, i) => <line key={`l${i}`} x1={sx(p.x)} y1={sy(p.y)} x2={sx(cents[labels[i]].x)} y2={sy(cents[labels[i]].y)} stroke={SERIES[labels[i]].color} strokeOpacity={0.15} />)}
            {POINTS.map((p, i) =>
              labels ? <Marker key={i} x={sx(p.x)} y={sy(p.y)} series={labels[i]} size={4} /> : <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#9EA397" />,
            )}
            {cents.map((c, i) => (
              <g
                key={`c${i}`}
                tabIndex={0}
                role="button"
                aria-label={`Centroid ${i + 1} (${SERIES[i].name}) at ${c.x.toFixed(1)}, ${c.y.toFixed(1)}. Use arrow keys to move.`}
                className="cursor-grab focus:outline-none"
                onPointerDown={(e) => { dragging.current = i; (e.target as Element).setPointerCapture?.(e.pointerId); }}
                onKeyDown={(e) => {
                  const step = 0.3;
                  const delta: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
                  if (delta[e.key]) { e.preventDefault(); moveTo(i, { x: c.x + delta[e.key][0], y: c.y + delta[e.key][1] }); }
                }}
              >
                <circle cx={sx(c.x)} cy={sy(c.y)} r={14} fill="white" stroke="#1C241F" strokeWidth={2} />
                <Marker x={sx(c.x)} y={sy(c.y)} series={i} size={7} />
              </g>
            ))}
          </svg>
          <p className="mt-1 text-xs text-slate-600">Drag a centroid, or focus it with Tab and use the arrow keys.</p>
        </div>
        <div className="space-y-3">
          <Slider id="km-k" label="Number of clusters (k)" value={k} min={2} max={5} step={1} onChange={(v) => { setK(v); reset(v, seed); }} />
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary btn-sm" onClick={doAssign}>1. Assign points</button>
            <button type="button" className="btn-primary btn-sm" onClick={doUpdate} disabled={!labels}>2. Move centroids</button>
            <button type="button" className="btn-secondary btn-sm" onClick={runAll}>Run to convergence</button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => { const ns = seed + 1; setSeed(ns); reset(k, ns); }}>New random start</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Iterations" value={iter} />
            <Stat label="Inertia" value={curInertia === null ? "—" : curInertia.toFixed(1)} hint="lower = tighter clusters" />
          </div>
        </div>
      </div>
    </LabShell>
  );
}
