// Compare the JavaScript results with R and Python, statistic by statistic.
// Run: node scripts/irr-verify/compare.mjs <outdir>
import { readFileSync } from "node:fs";

const out = process.argv[2] || "scripts/irr-verify/out";
const load = (f) => JSON.parse(readFileSync(`${out}/${f}`, "utf8"));
const js = load("js.json");
const r = load("r.json");
const py = load("py.json");
const byId = (arr) => Object.fromEntries(arr.map((x) => [x.id, x]));
const R = byId(r);
const PY = byId(py);
const TOL = 1e-9;
let failed = false;

// Each row: [statistic, tool, extractor(jsRec) -> [{label, a, b}]]
function run(name, tool, pairsFor, tol = TOL, conventionOne = false, soft = false) {
  let n = 0, max = 0, bothNull = 0, convention = 0;
  const fails = [];
  for (const rec of js) {
    const other = tool === "R" ? R[rec.id] : PY[rec.id];
    if (!other) continue;
    for (const { label, a, b } of pairsFor(rec, other)) {
      const an = a === null || a === undefined, bn = b === null || b === undefined;
      if (an && bn) { bothNull++; continue; }
      if (an !== bn) {
        // JS reports undefined (null) where the classroom script returns 1.0 by convention.
        if (conventionOne && an && b === 1) { convention++; continue; }
        fails.push(`${label}: js=${a} ${tool}=${b}`);
        continue;
      }
      n++;
      const diff = Math.abs(a - b);
      if (diff > max) max = diff;
      if (diff > tol) fails.push(`${label}: js=${a} ${tool}=${b} diff=${diff.toExponential(2)}`);
    }
  }
  const status = fails.length ? (soft ? "note" : "FAIL") : "pass";
  if (fails.length && !soft) failed = true;
  console.log(`  ${status}  ${name.padEnd(38)} vs ${tool.padEnd(7)} compared=${String(n).padStart(5)}  max|diff|=${max.toExponential(2)}` +
    (bothNull ? `  undefined-in-both=${bothNull}` : "") + (convention ? `  js-null-vs-1.0=${convention}` : ""));
  for (const f of fails.slice(0, 8)) console.log("         " + f);
  if (fails.length > 8) console.log(`         ... ${fails.length - 8} more`);
}

const one = (key, okey = key) => (rec, o) => [{ label: `#${rec.id}`, a: rec[key], b: o[okey] }];
const pairs = (okey) => (rec, o) => rec.pairs.map((p, i) => ({ label: `#${rec.id} R${p.a}-R${p.b}`, a: p.kappa, b: o[okey][i].kappa }));
const pairsPo = (okey) => (rec, o) => rec.pairs.map((p, i) => ({ label: `#${rec.id} R${p.a}-R${p.b}`, a: p.po, b: o[okey][i].po }));
const perCode = (okey) => (rec, o) => rec.perCode.map((v, k) => ({ label: `#${rec.id} code${k + 1}`, a: v, b: o[okey][k] }));

console.log(`Datasets: ${js.length} (${js.filter((x) => x.fleissIncomplete).length} with unequal rater counts per item)`);
console.log("Krippendorff's alpha");
run("alpha nominal", "R", one("alphaNominal"));
run("alpha ordinal", "R", one("alphaOrdinal"));
run("alpha interval", "R", one("alphaInterval"));
// irrCAC rounds coeff.val to five decimals, so its tolerance is half a unit in the fifth place.
const CAC = 5.1e-6;
run("alpha nominal (irrCAC, 5 dp)", "R", one("alphaNominal", "cacNominal"), CAC);
run("alpha nominal", "Python", one("alphaNominal"));
run("alpha ordinal", "Python", one("alphaOrdinal"));
run("alpha interval", "Python", one("alphaInterval"));
if (py[0] && "ozAlphaNominal" in py[0]) run("alpha nominal", "Python", (rec, o) => [{ label: `#${rec.id}`, a: rec.alphaNominal, b: o.ozAlphaNominal }], TOL, true);
run("alpha interval (irrCAC quadratic, 5 dp)", "R", one("alphaInterval", "cacQuadratic"), CAC);
{
  // Document irr::kripp.alpha's complete-matrix shortcut: which grids does the unpatched value miss on?
  const ds = load("datasets.json");
  const D = byId(ds);
  let off = 0, offComplete3 = 0, offOther = 0, complete3 = 0;
  for (const rec of js) {
    const o = R[rec.id]; if (!o || rec.alphaNominal === null || o.alphaNominalRaw === null) continue;
    const isComplete3 = o.complete && D[rec.id].R >= 3;
    if (isComplete3) complete3++;
    if (Math.abs(rec.alphaNominal - o.alphaNominalRaw) > TOL) { off++; if (isComplete3) offComplete3++; else offOther++; }
  }
  console.log(`  note  unpatched irr::kripp.alpha (nominal) differs on ${off} grids: ${offComplete3} of the ${complete3} complete grids with 3+ raters, ${offOther} others`);
}
console.log("Fleiss's kappa (balanced designs only)");
run("Fleiss kappa", "R", one("fleiss"));
run("Fleiss kappa (irrCAC, 5 dp)", "R", one("fleiss", "cacFleiss"), CAC);
if (py[0] && "ozFleiss" in py[0]) run("Fleiss kappa", "Python", one("fleiss", "ozFleiss"), TOL, true);
console.log("Cohen's kappa between every pair of raters");
run("Cohen kappa", "R", pairs("pairs"));
run("raw agreement of pairs", "R", pairsPo("pairs"));
if (py[0] && "ozPairs" in py[0]) { run("Cohen kappa", "Python", pairs("ozPairs"), TOL, true); run("raw agreement of pairs", "Python", pairsPo("ozPairs")); }
console.log("Other");
run("mean pairwise agreement", "R", one("meanPairwise"));
if (py[0] && "ozMeanPairwise" in py[0]) run("mean pairwise agreement", "Python", one("meanPairwise", "ozMeanPairwise"));
// irr::kripp.alpha returns 1 when the recoded data hold a single level; the calculator reports undefined.
run("one-against-all alpha per code", "R", perCode("perCode"), TOL, true);
if (py[0] && "ozPerCode" in py[0]) run("one-against-all alpha per code", "Python", perCode("ozPerCode"), TOL, true);
if (py[0] && "ozBoot" in py[0]) {
  console.log("Bootstrap 95% CI (different generators, 6,000 draws each; tolerance .03)");
  run("bootstrap CI bounds", "Python", (rec, o) => rec.boot && o.ozBoot ? [
    { label: `#${rec.id} lo`, a: rec.boot.lo, b: o.ozBoot.lo }, { label: `#${rec.id} hi`, a: rec.boot.hi, b: o.ozBoot.hi }] : [], 0.03);
}
console.log("\n" + (failed ? "CROSS-TOOL VERIFICATION FAILED" : "cross-tool verification passed"));
process.exit(failed ? 1 : 0);
