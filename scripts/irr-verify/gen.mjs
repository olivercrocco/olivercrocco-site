// Generate random rater-by-item grids (with and without missing values) and
// record what src/lib/irr.js computes for each. R and Python then recompute
// the same statistics independently; compare.mjs checks them cell by cell.
// Run: node scripts/irr-verify/gen.mjs <outdir>
import { writeFileSync, mkdirSync } from "node:fs";
import { alpha, alphaBinary, fleiss, cohen, meanPairwise, toCols, bootstrapCI, mulberry32 } from "../../src/lib/irr.js";

const out = process.argv[2] || "scripts/irr-verify/out";
mkdirSync(out, { recursive: true });
const rnd = mulberry32(20260909);
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const designs = ["complete", "random", "balanced"];
const datasets = [];

for (let d = 0; d < 240; d++) {
  const K = ri(2, 7);
  const R = ri(2, 8);
  const N = ri(4, 60);
  const design = designs[d % 3];
  const missP = design === "random" ? 0.05 + rnd() * 0.4 : 0;
  const agreeP = rnd();
  const w = Array.from({ length: K }, () => 0.2 + rnd());
  const W = w.reduce((a, b) => a + b, 0);
  const pick = () => { let u = rnd() * W; for (let k = 0; k < K; k++) { u -= w[k]; if (u <= 0) return k; } return K - 1; };
  const cells = Array.from({ length: R }, () => new Array(N).fill(null));
  const m = design === "balanced" ? ri(2, R) : R;
  for (let i = 0; i < N; i++) {
    const t = pick();
    let raters = [...Array(R).keys()];
    if (design === "balanced") {
      for (let j = raters.length - 1; j > 0; j--) { const k = Math.floor(rnd() * (j + 1)); [raters[j], raters[k]] = [raters[k], raters[j]]; }
      raters = raters.slice(0, m);
    }
    for (const r of raters) {
      if (design === "random" && rnd() < missP) continue;
      let v;
      if (rnd() < agreeP) v = t;
      else if (rnd() < 0.5) v = Math.max(0, Math.min(K - 1, t + (rnd() < 0.5 ? -1 : 1)));
      else v = pick();
      cells[r][i] = v;
    }
    if (cells.every((row) => row[i] === null)) cells[0][i] = t; // at least one code per item
  }
  datasets.push({ id: d, K, R, N, design, cells });
}

const results = datasets.map((ds) => {
  const rows = ds.cells;
  const cols = toCols(rows, ds.N);
  const values = Array.from({ length: ds.K }, (_, i) => i + 1);
  const f = fleiss(cols, ds.K);
  const pairs = [];
  for (let a = 0; a < ds.R; a++) for (let b = a + 1; b < ds.R; b++) {
    const c = cohen(rows[a], rows[b], ds.K);
    pairs.push({ a, b, kappa: c ? c.kappa : null, po: c ? c.po : null, n: c ? c.n : 0 });
  }
  return {
    id: ds.id,
    alphaNominal: alpha(cols, ds.K, "nominal"),
    alphaOrdinal: alpha(cols, ds.K, "ordinal"),
    alphaInterval: alpha(cols, ds.K, "interval", values),
    fleiss: f ? f.value : null,
    fleissIncomplete: !!(f && f.incomplete),
    meanPairwise: meanPairwise(cols),
    pairs,
    perCode: Array.from({ length: ds.K }, (_, k) => alphaBinary(cols, k)),
    boot: ds.id < 9 ? bootstrapCI(cols, ds.K, "nominal", values, { draws: 6000, seed: 421 }) : null,
  };
});

writeFileSync(`${out}/datasets.json`, JSON.stringify(datasets));
writeFileSync(`${out}/js.json`, JSON.stringify(results));
console.log(`wrote ${datasets.length} datasets and JS results to ${out}`);
