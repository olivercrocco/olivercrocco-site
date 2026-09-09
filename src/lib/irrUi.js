// Browser controller for the inter-rater reliability calculator. Every
// statistic comes from ./irr.js; this file only reads the grid, renders the
// results, and handles import, export, and local storage.
import { LIMITS, METRICS, parseCodes, codeLookup, matchCode, codeValues, ambiguousPrefixes, analyze, bootstrapCI, parseDelimited, guessLayout, tableToData, distinctValues, isReferenceLabel, toCsv, mulberry32 } from "./irr.js";

const TOOL_URL = "https://olivercrocco.com/irr-calculator";
const STORAGE_KEY = "irr-calculator-v1";
const byId = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const md = (s) => String(s ?? "").replace(/\|/g, "\\|");
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const f3 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? "n/a" : (v < 0 ? "−" : "") + Math.abs(v).toFixed(3));
const pct = (v) => (v === null || v === undefined || !Number.isFinite(v) ? "n/a" : Math.round(v * 100) + "%");
const grade = (v) => (v === null || v === undefined || !Number.isFinite(v) ? "" : v >= 0.8 ? "good" : v >= 0.667 ? "warn" : "bad");

const state = {
  codes: ["A", "B", "C"],
  metric: "nominal",
  nRaters: 3,
  nItems: 20,
  names: [],
  itemLabels: [],
  cells: [],
  refEnabled: false,
  ref: [],
};
let lookup = codeLookup(state.codes);
let noAdvance = new Set(); // codes that are a prefix of another code
let lastResult = null;
let lastCI = null;
let renderTimer = 0;
let bootToken = 0;
const grid = byId("irr-grid");

/* ------------------------------------------------------------- state */

function ensureShape() {
  const R = state.nRaters;
  const N = state.nItems;
  state.names = Array.from({ length: R }, (_, r) => (state.names[r] && String(state.names[r]).trim()) || `R${r + 1}`);
  state.itemLabels = Array.from({ length: N }, (_, i) => state.itemLabels[i] || "");
  state.cells = Array.from({ length: R }, (_, r) => Array.from({ length: N }, (_, i) => (state.cells[r] && state.cells[r][i]) || ""));
  state.ref = Array.from({ length: N }, (_, i) => state.ref[i] || "");
}

function setCodes(codes) {
  state.codes = codes;
  lookup = codeLookup(codes);
  noAdvance = new Set(ambiguousPrefixes(codes).map((c) => lookup.get(c.toUpperCase())));
  injectCodeStyles();
}

function injectCodeStyles() {
  let st = byId("irr-dyn");
  if (!st) {
    st = document.createElement("style");
    st.id = "irr-dyn";
    document.head.appendChild(st);
  }
  const K = state.codes.length;
  let css = "";
  for (let k = 0; k < K; k++) {
    const h = (Math.round((k * 360) / K) + 205) % 360;
    css += `.irr-grid td.irr-k${k}{background:hsl(${h} 42% 87%)} .irr-swatch-${k}{background:hsl(${h} 42% 80%)}\n`;
  }
  const w = Math.max(2.6, Math.max(...state.codes.map((c) => c.length)) + 1.4);
  css += `.irr-grid{--irr-cell-w:${w}em}`;
  st.textContent = css;
}

function setCell(r, i, v) {
  if (r === "ref") state.ref[i] = v;
  else state.cells[+r][i] = v;
}
function getCell(r, i) {
  return r === "ref" ? state.ref[i] : state.cells[+r][i];
}
function itemName(i) {
  return state.itemLabels[i] || String(i + 1);
}
/** "Item 3" for default labels, the label itself when the item has a name. */
function itemRef(i) {
  return state.itemLabels[i] ? state.itemLabels[i] : `Item ${i + 1}`;
}
function itemList(indices) {
  const named = indices.some((i) => state.itemLabels[i]);
  return (named ? "" : (indices.length > 1 ? "items " : "item ")) + indices.map(itemName).join(", ");
}
function note(msg) {
  byId("irr-grid-note").textContent = msg;
}

function save() {
  try {
    const { codes, metric, nRaters, nItems, names, itemLabels, cells, refEnabled, ref } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ codes, metric, nRaters, nItems, names, itemLabels, cells, refEnabled, ref }));
  } catch {
    /* storage unavailable: the page still works for this session */
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.codes) || s.codes.length < 2) return false;
    state.codes = s.codes.map(String).slice(0, LIMITS.codes[1]);
    state.metric = METRICS.includes(s.metric) ? s.metric : "nominal";
    state.nRaters = clamp(+s.nRaters || 3, LIMITS.raters[0], LIMITS.raters[1]);
    state.nItems = clamp(+s.nItems || 20, LIMITS.items[0], LIMITS.items[1]);
    state.names = Array.isArray(s.names) ? s.names.map(String) : [];
    state.itemLabels = Array.isArray(s.itemLabels) ? s.itemLabels.map(String) : [];
    state.cells = Array.isArray(s.cells) ? s.cells.map((r) => (Array.isArray(r) ? r.map(String) : [])) : [];
    state.refEnabled = !!s.refEnabled;
    state.ref = Array.isArray(s.ref) ? s.ref.map(String) : [];
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------- grid */

function cellClass(v) {
  const idx = matchCode(v, lookup);
  if (idx !== null) return `irr-k${idx}`;
  return String(v ?? "").trim() ? "irr-invalid" : "";
}

function cellHtml(r, i, v, maxLen) {
  const who = r === "ref" ? "Reference" : `Rater ${+r + 1}`;
  return `<td class="${cellClass(v)}"><input class="irr-cell" data-r="${r}" data-i="${i}" value="${esc(v)}" maxlength="${maxLen}" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-label="${who}, item ${i + 1}"></td>`;
}

function buildGrid() {
  ensureShape();
  const R = state.nRaters;
  const N = state.nItems;
  const maxLen = Math.max(1, ...state.codes.map((c) => c.length));
  let h = `<thead><tr><th class="irr-corner">Rater</th>`;
  for (let i = 0; i < N; i++) {
    const lab = state.itemLabels[i];
    h += `<th title="${esc(lab || i + 1)}">${esc(lab ? (lab.length > 8 ? lab.slice(0, 7) + "…" : lab) : i + 1)}</th>`;
  }
  h += `</tr></thead><tbody>`;
  for (let r = 0; r < R; r++) {
    h += `<tr><th><input class="irr-name" data-r="${r}" value="${esc(state.names[r])}" aria-label="Name of rater ${r + 1}"></th>`;
    for (let i = 0; i < N; i++) h += cellHtml(r, i, state.cells[r][i], maxLen);
    h += `</tr>`;
  }
  if (state.refEnabled) {
    h += `<tr class="irr-refrow"><th>Reference</th>`;
    for (let i = 0; i < N; i++) h += cellHtml("ref", i, state.ref[i], maxLen);
    h += `</tr>`;
  }
  grid.innerHTML = h + `</tbody>`;
  scheduleRender(0);
}

function refreshCells() {
  grid.querySelectorAll("input.irr-cell").forEach((el) => {
    const v = getCell(el.dataset.r, +el.dataset.i);
    if (el.value !== v) el.value = v;
    el.parentElement.className = cellClass(v);
  });
}

function rowOrder() {
  const rows = Array.from({ length: state.nRaters }, (_, r) => String(r));
  if (state.refEnabled) rows.push("ref");
  return rows;
}

function moveFrom(el, dr, di) {
  const rows = rowOrder();
  let ri = rows.indexOf(el.dataset.r) + dr;
  let ii = +el.dataset.i + di;
  if (ri >= rows.length) { ri = 0; ii += 1; }
  if (ri < 0) { ri = rows.length - 1; ii -= 1; }
  if (ii < 0 || ii >= state.nItems) return;
  const next = grid.querySelector(`input.irr-cell[data-r="${rows[ri]}"][data-i="${ii}"]`);
  if (next) {
    next.focus();
    next.select();
  }
}

/** Complete a typed prefix when exactly one code starts with it. */
function completeCell(el) {
  const raw = el.value.trim();
  if (!raw || matchCode(raw, lookup) !== null) return;
  const up = raw.toUpperCase();
  const cands = state.codes.filter((c) => c.toUpperCase().startsWith(up));
  if (cands.length === 1) {
    el.value = cands[0];
    setCell(el.dataset.r, +el.dataset.i, el.value);
    el.parentElement.className = cellClass(el.value);
    scheduleRender();
  }
}

grid.addEventListener("input", (e) => {
  const el = e.target;
  if (el.classList.contains("irr-name")) {
    state.names[+el.dataset.r] = el.value;
    scheduleRender();
    return;
  }
  if (!el.classList.contains("irr-cell")) return;
  const idx = matchCode(el.value, lookup);
  let advance = false;
  if (idx !== null) {
    const canon = state.codes[idx];
    if (el.value !== canon) el.value = canon;
    advance = !noAdvance.has(idx);
  }
  setCell(el.dataset.r, +el.dataset.i, el.value);
  el.parentElement.className = cellClass(el.value);
  scheduleRender();
  if (advance) moveFrom(el, 1, 0);
});

grid.addEventListener("keydown", (e) => {
  const el = e.target;
  if (!el.classList.contains("irr-cell")) return;
  const atEnd = el.selectionStart === el.value.length;
  const atStart = el.selectionEnd === 0;
  if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); completeCell(el); moveFrom(el, 1, 0); }
  else if (e.key === "ArrowUp") { e.preventDefault(); completeCell(el); moveFrom(el, -1, 0); }
  else if (e.key === "ArrowRight" && atEnd) { e.preventDefault(); completeCell(el); moveFrom(el, 0, 1); }
  else if (e.key === "ArrowLeft" && atStart) { e.preventDefault(); completeCell(el); moveFrom(el, 0, -1); }
});

grid.addEventListener("focusin", (e) => {
  if (e.target.classList.contains("irr-cell")) e.target.select();
});
grid.addEventListener("focusout", (e) => {
  if (e.target.classList.contains("irr-cell")) completeCell(e.target);
});

grid.addEventListener("paste", (e) => {
  const el = e.target;
  if (!el.classList.contains("irr-cell")) return;
  const text = (e.clipboardData || window.clipboardData)?.getData("text") || "";
  if (!/[\t\n\r,;]/.test(text)) return; // a single value pastes normally
  e.preventDefault();
  const rows = parseDelimited(text);
  if (rows.length) fillBlock(el.dataset.r, +el.dataset.i, rows);
});

function fillBlock(r0, i0, rows) {
  if (r0 === "ref") rows = [rows[0]];
  const width = Math.max(...rows.map((r) => r.length));
  const needR = r0 === "ref" ? state.nRaters : +r0 + rows.length;
  const R = clamp(needR, state.nRaters, LIMITS.raters[1]);
  const N = clamp(i0 + width, state.nItems, LIMITS.items[1]);
  const grew = R !== state.nRaters || N !== state.nItems;
  if (grew) {
    state.nRaters = R;
    state.nItems = N;
    applySetupToInputs();
    ensureShape();
  }
  rows.forEach((row, dr) => {
    const r = r0 === "ref" ? "ref" : +r0 + dr;
    if (r !== "ref" && r >= state.nRaters) return;
    row.forEach((v, di) => {
      const i = i0 + di;
      if (i < state.nItems) setCell(r, i, String(v).trim());
    });
  });
  if (grew) buildGrid();
  else {
    refreshCells();
    scheduleRender();
  }
  note(`Pasted a ${rows.length} by ${width} block${grew ? "; the grid was enlarged to fit" : ""}.`);
}

/* ------------------------------------------------------------- setup */

function codesNote() {
  const parts = [];
  const amb = ambiguousPrefixes(state.codes);
  if (amb.length) parts.push(`${amb.join(", ")} ${amb.length > 1 ? "are prefixes" : "is a prefix"} of another code, so press Enter or Tab after typing ${amb.length > 1 ? "them" : "it"}.`);
  if (state.metric === "interval" && !codeValues(state.codes).numeric) parts.push("The codes are not all numbers, so the interval metric uses their positions in the list (1, 2, 3, and so on).");
  if (state.metric === "ordinal") parts.push("Ordinal distances follow the order of the codes as listed.");
  byId("irr-codes-note").textContent = parts.join(" ");
}

function applySetupToInputs() {
  byId("irr-codes").value = state.codes.join(", ");
  byId("irr-metric").value = state.metric;
  byId("irr-nraters").value = state.nRaters;
  byId("irr-nitems").value = state.nItems;
  byId("irr-ref").checked = state.refEnabled;
  codesNote();
}

byId("irr-codes").addEventListener("change", () => {
  const codes = parseCodes(byId("irr-codes").value).slice(0, LIMITS.codes[1]);
  if (codes.length < LIMITS.codes[0]) {
    byId("irr-codes-note").textContent = "List at least two codes.";
    byId("irr-codes").value = state.codes.join(", ");
    return;
  }
  setCodes(codes);
  byId("irr-codes").value = codes.join(", ");
  codesNote();
  buildGrid();
});
byId("irr-metric").addEventListener("change", () => {
  state.metric = byId("irr-metric").value;
  codesNote();
  scheduleRender(0);
});
for (const [id, key, lim] of [["irr-nraters", "nRaters", LIMITS.raters], ["irr-nitems", "nItems", LIMITS.items]]) {
  byId(id).addEventListener("change", () => {
    const v = clamp(parseInt(byId(id).value, 10) || lim[0], lim[0], lim[1]);
    byId(id).value = v;
    state[key] = v;
    buildGrid();
  });
}
byId("irr-ref").addEventListener("change", () => {
  state.refEnabled = byId("irr-ref").checked;
  buildGrid();
});

/* ------------------------------------------------------------ import */

byId("irr-import-toggle").addEventListener("click", () => {
  const p = byId("irr-import");
  p.hidden = !p.hidden;
  if (!p.hidden) byId("irr-paste").focus();
});
byId("irr-import-run").addEventListener("click", () => runImport(byId("irr-paste").value));
byId("irr-file").addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    byId("irr-paste").value = String(rd.result || "");
    runImport(byId("irr-paste").value);
  };
  rd.readAsText(f);
});

function runImport(text) {
  const msg = byId("irr-import-msg");
  const rows = parseDelimited(text);
  if (!rows.length) { msg.textContent = "Nothing to import."; return; }
  const auto = guessLayout(rows, state.codes);
  const pick = (id, guess) => { const v = byId(id).value; return v === "auto" ? guess : v === "yes"; };
  const layout = {
    header: pick("irr-header", auto.header),
    labels: pick("irr-labels", auto.labels),
    rowsAre: byId("irr-rowsare").value === "auto" ? auto.rowsAre : byId("irr-rowsare").value,
  };
  const data = tableToData(rows, layout);
  let ref = null;
  if (data.names) {
    const k = data.names.findIndex(isReferenceLabel);
    if (k >= 0) {
      ref = data.cells[k];
      data.cells.splice(k, 1);
      data.names.splice(k, 1);
    }
  }
  let R = data.cells.length;
  let N = Math.max(0, ...data.cells.map((r) => r.length));
  if (R < LIMITS.raters[0] || N < LIMITS.items[0]) {
    msg.textContent = `Found ${R} rater${R === 1 ? "" : "s"} and ${N} item${N === 1 ? "" : "s"}; at least two raters and one item are needed. Check whether rows are raters or items.`;
    return;
  }
  const notes = [];
  if (R > LIMITS.raters[1]) { notes.push(`only the first ${LIMITS.raters[1]} raters were kept`); R = LIMITS.raters[1]; }
  if (N > LIMITS.items[1]) { notes.push(`only the first ${LIMITS.items[1]} items were kept`); N = LIMITS.items[1]; }
  const found = distinctValues(ref ? [...data.cells, ref] : data.cells);
  const uncovered = found.filter((v) => matchCode(v, lookup) === null);
  if (uncovered.length) {
    if (found.length < LIMITS.codes[0]) { msg.textContent = `Only one distinct value (${found[0]}) was found, so there is nothing to compare.`; return; }
    setCodes(found.slice(0, LIMITS.codes[1]));
    notes.push(`codes set to ${state.codes.join(", ")}`);
  }
  state.nRaters = R;
  state.nItems = N;
  state.cells = data.cells.slice(0, R).map((r) => r.slice(0, N));
  state.names = (data.names || []).slice(0, R);
  state.itemLabels = (data.itemLabels || []).slice(0, N);
  if (ref) { state.refEnabled = true; state.ref = ref.slice(0, N); }
  applySetupToInputs();
  buildGrid();
  const how = [`${layout.rowsAre} as rows`];
  if (layout.header) how.push("first row read as item names");
  if (layout.labels) how.push("first column read as names");
  if (ref) how.push("reference row found");
  msg.textContent = `Imported ${R} raters and ${N} items (${how.join(", ")})${notes.length ? "; " + notes.join("; ") : ""}.`;
}

/* ----------------------------------------------------------- actions */

byId("irr-example").addEventListener("click", () => {
  ensureShape();
  const rnd = mulberry32(7);
  const K = state.codes.length;
  const truth = Array.from({ length: state.nItems }, () => Math.floor(rnd() * K));
  for (let r = 0; r < state.nRaters; r++) {
    for (let i = 0; i < state.nItems; i++) state.cells[r][i] = state.codes[rnd() < 0.78 ? truth[i] : Math.floor(rnd() * K)];
  }
  for (let i = 0; i < state.nItems; i++) state.ref[i] = state.codes[truth[i]];
  buildGrid();
  note("Example data: each rater agrees with a hidden true code on roughly 78% of items, and the reference row holds those true codes when it is switched on.");
});

byId("irr-clear").addEventListener("click", () => {
  if (!window.confirm("Clear every code in the grid? The setup and the rater names stay.")) return;
  state.cells = [];
  state.ref = [];
  ensureShape();
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  buildGrid();
  note("");
});

function download(name, text, type) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

byId("irr-csv").addEventListener("click", () => {
  ensureShape();
  const head = ["rater", ...state.itemLabels.map((l, i) => l || `item${i + 1}`)];
  const rows = [head, ...state.cells.map((row, r) => [state.names[r], ...row])];
  if (state.refEnabled) rows.push(["Reference", ...state.ref]);
  download("irr-codes.csv", toCsv(rows), "text/csv");
});

byId("irr-copy").addEventListener("click", async () => {
  const text = buildReport();
  const out = byId("irr-copy-msg");
  try {
    await navigator.clipboard.writeText(text);
    out.textContent = "Copied.";
  } catch {
    out.textContent = "Copying was blocked; use the download instead.";
  }
  setTimeout(() => { out.textContent = ""; }, 2500);
});
byId("irr-download-md").addEventListener("click", () => download("irr-results.md", buildReport(), "text/markdown"));

/* ------------------------------------------------------------ render */

function scheduleRender(delay = 150) {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, delay);
}

function render() {
  ensureShape();
  const res = analyze({
    cells: state.cells,
    ref: state.refEnabled ? state.ref : null,
    nRaters: state.nRaters,
    nItems: state.nItems,
    codes: state.codes,
    metric: state.metric,
  });
  lastResult = res;
  lastCI = null;
  renderSummary(res);
  byId("irr-verdict").textContent = verdictText(res);
  renderCodes(res);
  renderPairwise(res);
  renderReference(res);
  renderItems(res);
  save();
  scheduleBootstrap(res);
}

function renderSummary(res) {
  const blank = state.nRaters * state.nItems - res.coded;
  const alphaSub = res.alpha === null
    ? (res.pairable ? "undefined: every paired value falls in one code" : "needs at least one item coded by two raters")
    : (res.pairable >= 3 ? "computing the 95% confidence interval" : "a confidence interval needs 3 or more items with 2+ raters");
  const fk = res.fleiss;
  const fkOk = fk && !fk.incomplete && fk.value !== null;
  const fkSub = !fk ? "needs coded items"
    : fk.incomplete ? "not computable: the number of raters differs across items"
    : fk.value === null ? "undefined: only one code in use"
    : `${fk.m} raters on each of ${fk.N} items; codes treated as nominal`;
  byId("irr-summary").innerHTML = `
    <div class="irr-stat"><div class="lab">Krippendorff's alpha (${esc(state.metric)})</div><div class="n ${grade(res.alpha)}">${f3(res.alpha)}</div><div class="sub" id="irr-alpha-sub">${esc(alphaSub)}</div></div>
    <div class="irr-stat"><div class="lab">Fleiss's kappa</div><div class="n ${fkOk ? grade(fk.value) : ""}">${fkOk ? f3(fk.value) : "n/a"}</div><div class="sub">${esc(fkSub)}</div></div>
    <div class="irr-stat"><div class="lab">Mean pairwise agreement</div><div class="n">${pct(res.pairwise)}</div><div class="sub">share of rater pairs that agreed; not chance-corrected</div></div>
    <div class="irr-stat"><div class="lab">Coverage</div><div class="n">${res.coded}</div><div class="sub">codes entered; ${res.pairable} of ${state.nItems} items have 2+ raters; ${blank} blank cell${blank === 1 ? "" : "s"}</div></div>`;
}

function verdictText(res) {
  const a = res.alpha;
  if (a === null) return "";
  if (a >= 0.8) return "Alpha is at or above .800, the level Krippendorff suggests for coded data that will carry conclusions. Whether that is enough depends on what the codes are being asked to support.";
  if (a >= 0.667) return "Alpha is between .667 and .800, the range Krippendorff describes as adequate only for tentative conclusions. Report the value, name the codes that carry the disagreement (see the per-code table), and keep the claims that rest on them modest.";
  return "Alpha is below .667, the level under which Krippendorff advises against drawing conclusions from the coded data. The usual remedy is the codebook rather than the coders: sharpen the definitions the per-code table shows to be unstable, retrain, and code a fresh sample.";
}

function renderCodes(res) {
  const total = res.coded || 1;
  byId("irr-codes-table").innerHTML = `<table class="irr-table"><thead><tr><th>Code</th><th class="num">Alpha, this code vs all others</th><th class="num">Times used</th><th class="num">Share</th></tr></thead><tbody>` +
    res.perCode.map((p, k) => `<tr><td><span class="irr-swatch irr-swatch-${k}"></span>${esc(p.code)}</td><td class="num ${grade(p.alpha)}">${f3(p.alpha)}</td><td class="num">${p.used}</td><td class="num">${res.coded ? Math.round((100 * p.used) / total) + "%" : "n/a"}</td></tr>`).join("") +
    `</tbody></table>`;
}

function pairMeans(res) {
  const R = state.nRaters;
  const M = res.kappaMatrix;
  return Array.from({ length: R }, (_, a) => {
    const vals = [];
    for (let b = 0; b < R; b++) if (a !== b && M[a][b] && M[a][b].kappa !== null) vals.push(M[a][b].kappa);
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  });
}

function renderPairwise(res) {
  const R = state.nRaters;
  const M = res.kappaMatrix;
  const means = pairMeans(res);
  if (R > 30) {
    byId("irr-pairwise").innerHTML = `<p class="irr-help">Too many raters for a matrix, so each rater's mean kappa with the others is listed.</p><table class="irr-table"><thead><tr><th>Rater</th><th class="num">Mean kappa</th></tr></thead><tbody>` +
      means.map((m, a) => `<tr><td>${esc(state.names[a])}</td><td class="num ${grade(m)}">${f3(m)}</td></tr>`).join("") + `</tbody></table>`;
    return;
  }
  let h = `<table class="irr-table matrix"><thead><tr><th></th>${state.names.map((n) => `<th>${esc(n)}</th>`).join("")}<th>Mean</th></tr></thead><tbody>`;
  for (let a = 0; a < R; a++) {
    h += `<tr><td>${esc(state.names[a])}</td>`;
    for (let b = 0; b < R; b++) {
      if (a === b) { h += `<td>·</td>`; continue; }
      const c = M[a][b];
      h += `<td class="${c ? grade(c.kappa) : ""}" title="${c ? `raw agreement ${pct(c.po)} on ${c.n} items` : "no items coded by both"}">${c ? f3(c.kappa) : "n/a"}</td>`;
    }
    h += `<td class="${grade(means[a])}">${f3(means[a])}</td></tr>`;
  }
  byId("irr-pairwise").innerHTML = h + `</tbody></table>`;
}

function renderReference(res) {
  const sec = byId("irr-refsec");
  sec.hidden = !res.reference;
  if (!res.reference) return;
  const ref = res.reference;
  const card = (lab, c) => `<div class="irr-stat"><div class="lab">${esc(lab)}</div><div class="n ${c ? grade(c.kappa) : ""}">${c ? f3(c.kappa) : "n/a"}</div><div class="sub">${c ? `${pct(c.po)} raw agreement on ${c.n} items` : "no items coded by both"}</div></div>`;
  byId("irr-refstats").innerHTML = card("Most common code vs reference", ref.consensus) + ref.perRater.map((c, r) => card(`${state.names[r]} vs reference`, c)).join("");
  const d = ref.disagreements;
  byId("irr-refnote").textContent = d.length
    ? `The most common code differs from the reference on ${itemList(d)}.`
    : (ref.consensus ? "No item's most common code differs from the reference." : "");
}

function renderItems(res) {
  let h = "";
  const q = [];
  res.items.forEach((it, i) => {
    const mix = it.counts.map((c, k) => (c ? `${esc(state.codes[k])}${c}` : "")).filter(Boolean).join(" ");
    const flag = it.agreement !== null && it.agreement < 0.6;
    const diff = res.refRow && it.modal !== null && res.refRow[i] !== null && it.modal !== res.refRow[i];
    h += `<div class="irr-item${flag ? " flag" : ""}${diff ? " diff" : ""}" title="${esc(itemName(i))}${diff ? ", most common code differs from the reference" : ""}"><div class="id">${esc(itemName(i))}</div><div class="pc">${it.agreement === null ? "·" : Math.round(it.agreement * 100)}</div><div class="mix">${mix || "·"}</div></div>`;
    if (it.agreement !== null && it.agreement < 1) q.push({ i, ag: it.agreement, mix });
  });
  byId("irr-items").innerHTML = h;
  q.sort((a, b) => a.ag - b.ag || a.i - b.i);
  const shown = q.slice(0, 60);
  byId("irr-queue").innerHTML = (shown.map((x) => `<li>${esc(itemRef(x.i))}: ${Math.round(x.ag * 100)}% agreement <span class="mix">(${x.mix})</span>${res.refRow && res.refRow[x.i] !== null ? `; reference ${esc(state.codes[res.refRow[x.i]])}` : ""}</li>`).join("") +
    (q.length > shown.length ? `<li>and ${q.length - shown.length} more items with some disagreement</li>` : "")) || "<li>No disagreements yet.</li>";
}

function scheduleBootstrap(res) {
  const token = ++bootToken;
  if (res.alpha === null || res.pairable < 3) return;
  setTimeout(() => {
    if (token !== bootToken) return;
    const draws = res.pairable * res.K * res.K > 200000 ? 1000 : 2000;
    const ci = bootstrapCI(res.cols, res.K, state.metric, res.values, { draws });
    if (token !== bootToken) return;
    lastCI = ci ? { ...ci, draws } : null;
    const sub = byId("irr-alpha-sub");
    if (sub) sub.textContent = ci ? `95% CI [${f3(ci.lo)}, ${f3(ci.hi)}], ${draws.toLocaleString("en-US")} bootstrap draws over items` : "confidence interval not available";
  }, 30);
}

/* ------------------------------------------------------------ report */

function buildReport() {
  const res = lastResult;
  if (!res) return "";
  if (!lastCI && res.alpha !== null && res.pairable >= 3) {
    const ci = bootstrapCI(res.cols, res.K, state.metric, res.values, { draws: 2000 });
    lastCI = ci ? { ...ci, draws: 2000 } : null;
  }
  const L = [];
  const w = (s = "") => L.push(s);
  const codeOf = (k) => (k === null || k === undefined ? "n/a" : md(state.codes[k]));
  w("# Inter-rater reliability results");
  w();
  w(`Generated ${new Date().toISOString().slice(0, 10)} with the calculator at ${TOOL_URL}.`);
  w();
  w(`Raters: ${state.nRaters} (${state.names.join(", ")})  `);
  w(`Items: ${state.nItems}; ${res.pairable} coded by two or more raters; ${res.coded} codes entered  `);
  w(`Codes: ${state.codes.join(", ")} (${state.metric})`);
  w();
  w("## Agreement among raters");
  w();
  w("| Statistic | Value | Note |");
  w("|---|---|---|");
  w(`| Krippendorff's alpha (${state.metric}) | ${f3(res.alpha)} | ${lastCI ? `95% CI [${f3(lastCI.lo)}, ${f3(lastCI.hi)}], ${lastCI.draws.toLocaleString("en-US")} bootstrap draws over items` : "CI not computed"} |`);
  const fk = res.fleiss;
  w(`| Fleiss's kappa | ${fk && !fk.incomplete && fk.value !== null ? f3(fk.value) : "n/a"} | ${fk && fk.incomplete ? "not computable: the number of raters varies across items" : "complete-case; codes treated as nominal"} |`);
  w(`| Mean pairwise percent agreement | ${res.pairwise === null ? "n/a" : (res.pairwise * 100).toFixed(1) + "%"} | not chance-corrected |`);
  w();
  const v = verdictText(res);
  if (v) { w(v); w(); }
  w("### Each code on its own");
  w();
  w("| Code | Alpha (this code vs all others) | Times used |");
  w("|---|---|---|");
  for (const p of res.perCode) w(`| ${md(p.code)} | ${f3(p.alpha)} | ${p.used} |`);
  w();
  w("### Cohen's kappa between pairs of raters");
  w();
  const names = state.names.map(md);
  const means = pairMeans(res);
  if (state.nRaters <= 15) {
    w(`| | ${names.join(" | ")} | Mean |`);
    w(`|---|${names.map(() => "---").join("|")}|---|`);
    for (let a = 0; a < state.nRaters; a++) {
      const cells = [];
      for (let b = 0; b < state.nRaters; b++) {
        const c = res.kappaMatrix[a][b];
        cells.push(a === b ? "" : c ? f3(c.kappa) : "n/a");
      }
      w(`| ${names[a]} | ${cells.join(" | ")} | ${f3(means[a])} |`);
    }
  } else {
    w("| Rater | Mean kappa with the other raters |");
    w("|---|---|");
    names.forEach((n, a) => w(`| ${n} | ${f3(means[a])} |`));
  }
  w();
  if (res.reference) {
    w("## Agreement with the reference row");
    w();
    w("| Rater | Cohen's kappa | Raw agreement | n |");
    w("|---|---|---|---|");
    res.reference.perRater.forEach((c, r) => { if (c) w(`| ${names[r]} | ${f3(c.kappa)} | ${pct(c.po)} | ${c.n} |`); });
    const cc = res.reference.consensus;
    if (cc) w(`| Most common code across raters | ${f3(cc.kappa)} | ${pct(cc.po)} | ${cc.n} |`);
    w();
    const d = res.reference.disagreements;
    w(d.length
      ? `Items where the most common code differs from the reference: ${d.map(itemName).join(", ")}. These are candidates for re-adjudication, and the audit trail should record the outcome either way.`
      : "No item's most common code differs from the reference.");
    w();
  }
  w("## Per-item agreement");
  w();
  w(`| Item | Raters | Distribution | Pairwise agreement |${res.refRow ? " Reference |" : ""} Most common |`);
  w(`|---|---|---|---|${res.refRow ? "---|" : ""}---|`);
  const rows = res.items.map((it, i) => ({ it, i })).filter((x) => x.it.n >= 2).sort((a, b) => a.it.agreement - b.it.agreement || a.i - b.i);
  for (const { it, i } of rows) {
    const dist = it.counts.map((c, k) => (c ? `${md(state.codes[k])}${c}` : "")).filter(Boolean).join(" ");
    w(`| ${md(itemName(i))} | ${it.n} | ${dist} | ${Math.round(it.agreement * 100)}% |${res.refRow ? ` ${codeOf(res.refRow[i])} |` : ""} ${it.modal === null ? "tie" : codeOf(it.modal)} |`);
  }
  w();
  w("Sorted lowest agreement first, which is the order to adjudicate in.");
  w();
  w("## Notes");
  w();
  w("- Krippendorff's alpha is computed from the coincidence matrix (Krippendorff, 2011) over items with two or more codes; blank cells are ignored. The confidence interval is a percentile bootstrap over items with a fixed seed.");
  w("- Fleiss's kappa requires the same number of raters on every item and treats the codes as nominal. Cohen's kappa uses only the items both raters coded.");
  w("- Krippendorff (2019) suggests .800 for coded data that carry conclusions and .667 as a floor for tentative ones. These are conventions; the level your claims need is a judgment for your field.");
  return L.join("\n") + "\n";
}

/* -------------------------------------------------------------- init */

load();
setCodes(state.codes);
applySetupToInputs();
buildGrid();
