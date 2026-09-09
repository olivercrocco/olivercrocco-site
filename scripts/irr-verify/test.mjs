// Hand-derived checks for src/lib/irr.js. Run: node scripts/irr-verify/test.mjs
import { alpha, alphaBinary, fleiss, cohen, meanPairwise, coincidence, toCols, toRows, parseDelimited, guessLayout, tableToData, parseCodes, bootstrapCI, itemSummary } from "../../src/lib/irr.js";

let ok = true;
function check(label, got, want, tol = 1e-9) {
  const good = got !== null && got !== undefined && Math.abs(got - want) < tol;
  ok &&= good;
  console.log(`  ${good ? "pass" : "FAIL"}  ${label}: ${got === null ? "null" : got.toFixed(6)} (expected ${want})`);
}
function checkTrue(label, cond) {
  ok &&= !!cond;
  console.log(`  ${cond ? "pass" : "FAIL"}  ${label}`);
}
// Helpers: build cols from letter strings, codes D,S,Y -> 0,1,2
const idx = { D: 0, S: 1, Y: 2 };
const C = (...units) => units.map((u) => [...u].map((ch) => idx[ch]));

console.log("Krippendorff's alpha, nominal");
// 1. Perfect agreement.
check("perfect agreement", alpha(C("DDD", "SSS", "YYY"), 3), 1.0);
// 2. Three units, two coders, every unit split: coincidence has zero diagonal
//    and 1 in each of six off-diagonal cells; n = 6, Do = 6, De = 24, alpha = 1 - 5*6/24.
check("every unit split", alpha(C("DS", "SY", "YD"), 3), -0.25);
// 3. Four units, two coders, two agreeing and two split: o(DD)=o(SS)=o(DS)=o(SD)=2,
//    n = 8, Do = 4, De = 32, alpha = 1 - 7*4/32.
check("half the units split", alpha(C("DD", "DS", "SS", "SD"), 3), 0.125);
// 4. Krippendorff (2011) worked example, 3 coders, 15 units (units 2 and 14 empty).
//    Published: nominal .691, interval .811.
const KA = [null, null, null, null, null, 3, 4, 1, 2, 1, 1, 3, 3, null, 3];
const KB = [1, null, 2, 1, 3, 3, 4, 3, null, null, null, null, null, null, null];
const KC = [null, null, 2, 1, 3, 4, 4, null, 2, 1, 1, 3, 3, null, 4];
const kRows = [KA, KB, KC].map((r) => r.map((v) => (v === null ? null : v - 1)));
const kCols = toCols(kRows, 15);
check("Krippendorff 2011 example, nominal", alpha(kCols, 4, "nominal"), 0.691, 0.0005);
check("Krippendorff 2011 example, interval", alpha(kCols, 4, "interval", [1, 2, 3, 4]), 0.811, 0.0005);
console.log(`        (ordinal on the same example: ${alpha(kCols, 4, "ordinal").toFixed(4)})`);
// 5. Single-coded and empty units are ignored.
check("units with fewer than two codes ignored", alpha(C("DD", "DS", "SS", "SD", "D", ""), 3), 0.125);
// 6. Only one category in use: alpha undefined, returned as null.
checkTrue("one category only returns null (undefined), not 1", alpha(C("DD", "DD", "DD"), 3) === null);
// 7. Brute-force derivation: enumerate ordered pairs instead of using counts.
function alphaBrute(cols, K) {
  const o = new Map();
  let n = 0;
  for (const col of cols) {
    const m = col.length;
    if (m < 2) continue;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) if (i !== j) o.set(col[i] + "," + col[j], (o.get(col[i] + "," + col[j]) || 0) + 1 / (m - 1));
    n += m;
  }
  if (n < 2) return null;
  const nc = new Array(K).fill(0);
  for (const [key, v] of o) nc[+key.split(",")[0]] += v;
  let Do = 0, De = 0;
  for (const [key, v] of o) { const [a, b] = key.split(",").map(Number); if (a !== b) Do += v; }
  for (let a = 0; a < K; a++) for (let b = 0; b < K; b++) if (a !== b) De += nc[a] * nc[b];
  return De === 0 ? null : 1 - (n - 1) * Do / De;
}
let worst = 0, seed = 99;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
for (let t = 0; t < 300; t++) {
  const K = 2 + Math.floor(rnd() * 4);
  const cols = [];
  const nU = 5 + Math.floor(rnd() * 26);
  for (let u = 0; u < nU; u++) { const m = Math.floor(rnd() * 7); const col = []; for (let j = 0; j < m; j++) col.push(Math.floor(rnd() * K)); cols.push(col); }
  const a = alpha(cols, K), b = alphaBrute(cols, K);
  if (a === null || b === null) continue;
  worst = Math.max(worst, Math.abs(a - b));
}
check("agrees with pair-enumeration derivation over 300 random grids", worst, 0, 1e-9);

console.log("Ordinal and interval metrics");
// 8. Two categories: ordinal and interval reduce to nominal (delta is a constant).
const two = C("DD", "DS", "SS", "SD", "DS");
check("ordinal equals nominal with two categories", alpha(two, 2, "ordinal"), alpha(two, 2, "nominal"));
check("interval equals nominal with two categories", alpha(two, 2, "interval", [1, 2]), alpha(two, 2, "nominal"));
// 9. Interval alpha is invariant to a linear transform of the values.
const three = C("DSY", "DDS", "SSY", "YYD", "DSS", "SYY");
check("interval alpha invariant to rescaling values", alpha(three, 3, "interval", [10, 20, 30]), alpha(three, 3, "interval", [1, 2, 3]));
// 10. Hand-derived ordinal case. Two coders, units (1,2),(2,3),(1,3),(2,2). Values 1..3.
//     Coincidences: o12=o21=1, o23=o32=1, o13=o31=1, o22=2. n1=2, n2=4, n3=2, n=8.
//     Ordinal deltas: d12=(n1+n2-(n1+n2)/2)^2=(6-3)^2=9; d23=(n2+n3-(n2+n3)/2)^2=9;
//     d13=(n1+n2+n3-(n1+n3)/2)^2=(8-2)^2=36.
//     Do = 2*(9+9+36)=108. De = 2*(n1n2*9 + n2n3*9 + n1n3*36) = 2*(72+72+144)=576.
//     alpha = 1 - 7*108/576 = 1 - 1.3125 = -0.3125.
const ord = [[0, 1], [1, 2], [0, 2], [1, 1]];
check("ordinal, hand-derived", alpha(ord, 3, "ordinal"), -0.3125);
//     Interval on the same data: d12=1,d23=1,d13=4. Do=2*(1+1+4)=12. De=2*(8+8+16)=64. alpha=1-7*12/64=-0.3125.
check("interval, hand-derived", alpha(ord, 3, "interval", [1, 2, 3]), 1 - (7 * 12) / 64);

console.log("Fleiss's kappa");
// 11. Four units, three raters: P_i = 1, 1/3, 1, 1/3 so Pbar = 2/3; marginals 6 D and 6 S of 12 so Pe = .5; kappa = 1/3.
check("hand-derived case", fleiss(C("DDD", "DDS", "SSS", "DSS"), 3).value, 1 / 3);
checkTrue("refuses unequal rater counts", fleiss(C("DDD", "SS"), 3).incomplete === true);
checkTrue("balanced despite missing raters is computable", fleiss(C("DD", "DS", "SS"), 3).value !== null);

console.log("Cohen's kappa");
// 12. po = 4/5; pe = .4*.2 + .4*.6 + .2*.2 = .36; kappa = .44/.64.
const ck = cohen([0, 0, 1, 1, 2], [0, 1, 1, 1, 2], 3);
check("hand-derived case", ck.kappa, 0.44 / 0.64);
check("raw agreement", ck.po, 0.8);
checkTrue("positions where either is blank are dropped", cohen([0, null, 1, 1], [0, 1, null, 1], 3).n === 2);

console.log("Other estimators");
check("mean pairwise agreement", meanPairwise(C("DDD", "DDS", "SSS", "DSS")), 2 / 3);
check("one-against-all alpha equals overall alpha in the binary case", alphaBinary(C("DD", "DS", "SS", "SD"), 0), alpha(C("DD", "DS", "SS", "SD"), 3));
const items = itemSummary(C("DDS", "DS", "DSY", "D"), 3);
check("item pairwise agreement", items[0].agreement, 1 / 3);
checkTrue("modal code and tie handling", items[0].modal === 0 && items[1].modal === null && items[3].modal === 0);
const ci1 = bootstrapCI(three, 3, "nominal", null, { draws: 500 });
const ci2 = bootstrapCI(three, 3, "nominal", null, { draws: 500 });
checkTrue("bootstrap is reproducible with the fixed seed", ci1.lo === ci2.lo && ci1.hi === ci2.hi);
const a3 = alpha(three, 3);
checkTrue("bootstrap interval brackets the point estimate", ci1.lo <= a3 && a3 <= ci1.hi);

console.log("Table parsing");
const tsv = "rater\titem1\titem2\titem3\nR1\tD\tS\tY\nR2\tD\tS\tD\nReference\tD\tS\tY\n";
const rows = parseDelimited(tsv);
const lay = guessLayout(rows, ["D", "S", "Y"]);
checkTrue("detects header, labels, raters as rows", lay.header && lay.labels && lay.rowsAre === "raters");
const data = tableToData(rows, lay);
checkTrue("names and cells parsed", data.names[2] === "Reference" && data.cells[1][2] === "D" && data.itemLabels[0] === "item1");
const csv = 'item,R1,R2\n1,"D",S\n2,S,S\n3,Y,D\n4,D,D\n';
const rows2 = parseDelimited(csv);
const lay2 = guessLayout(rows2, ["D", "S", "Y"]);
checkTrue("items-as-rows layout detected from header", lay2.rowsAre === "items");
const data2 = tableToData(rows2, lay2);
checkTrue("transposed correctly", data2.cells.length === 2 && data2.cells[0].join("") === "DSYD" && data2.names[1] === "R2");
checkTrue("parseCodes dedupes case-insensitively", parseCodes("a, B, A, c").join("|") === "a|B|c");

console.log("\n" + (ok ? "all checks passed" : "SOME CHECKS FAILED"));
process.exit(ok ? 0 : 1);
