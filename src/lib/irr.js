/**
 * Inter-rater reliability estimators for the browser calculator at
 * /irr-calculator and for its offline copy. Pure functions, no DOM, no
 * dependencies, so the same file runs under Node for verification.
 *
 * Conventions
 *   codes   array of category labels; their order is the rank order for the
 *           ordinal metric
 *   rows    one array per rater, length nItems, holding a category index
 *           (0..K-1) or null for a blank cell
 *   cols    one array per item, holding the indices the raters actually
 *           assigned; blanks are simply absent
 *
 * Estimators
 *   alpha            Krippendorff's alpha from the coincidence matrix
 *                    (Krippendorff, 2011), nominal, ordinal, or interval
 *   alphaBinary      alpha for one code against all others
 *   fleiss           Fleiss's kappa (Fleiss, 1971), balanced designs only
 *   cohen            Cohen's kappa (Cohen, 1960) for two vectors
 *   meanPairwise     mean pairwise percent agreement, not chance-corrected
 *   bootstrapCI      percentile bootstrap over items for alpha
 */

export const METRICS = ["nominal", "ordinal", "interval"];
export const LIMITS = { raters: [2, 50], items: [1, 500], codes: [2, 40] };

/* ------------------------------------------------------------ codes */

export function parseCodes(text) {
  const out = [];
  const seen = new Set();
  for (const part of String(text ?? "").split(/[,;\n]/)) {
    const c = part.trim();
    if (!c) continue;
    const key = c.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

export function codeLookup(codes) {
  const m = new Map();
  codes.forEach((c, i) => m.set(c.toUpperCase(), i));
  return m;
}

export function matchCode(raw, lookup) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const i = lookup.get(s.toUpperCase());
  return i === undefined ? null : i;
}

/** Numeric values for the interval metric: the codes themselves when every
 *  code parses as a number, otherwise their positions 1..K. */
export function codeValues(codes) {
  const nums = codes.map((c) => Number(c));
  const numeric = codes.length > 0 && nums.every((v) => Number.isFinite(v));
  return { values: numeric ? nums : codes.map((_, i) => i + 1), numeric };
}

/** Codes that are a prefix of another code cannot auto-advance on entry. */
export function ambiguousPrefixes(codes) {
  const up = codes.map((c) => c.toUpperCase());
  return codes.filter((c, i) => up.some((o, j) => j !== i && o.startsWith(up[i])));
}

/* ------------------------------------------------------------- shape */

export function toRows(cells, nRows, nItems, codes) {
  const lookup = codeLookup(codes);
  const rows = [];
  for (let r = 0; r < nRows; r++) {
    const src = cells[r] || [];
    const row = new Array(nItems);
    for (let i = 0; i < nItems; i++) row[i] = matchCode(src[i], lookup);
    rows.push(row);
  }
  return rows;
}

export function toCols(rows, nItems) {
  const cols = [];
  for (let i = 0; i < nItems; i++) {
    const c = [];
    for (const row of rows) {
      const v = row[i];
      if (v !== null && v !== undefined) c.push(v);
    }
    cols.push(c);
  }
  return cols;
}

/* -------------------------------------------------- Krippendorff's alpha */

/** Coincidence matrix o[c][k] over items with two or more codes, each item
 *  contributing its ordered pairs weighted by 1/(m-1). nc are the row sums
 *  (the number of pairable values in each category) and n their total. */
export function coincidence(cols, K) {
  const o = new Float64Array(K * K);
  const cnt = new Int32Array(K);
  let n = 0;
  let units = 0;
  for (const col of cols) {
    const m = col.length;
    if (m < 2) continue;
    cnt.fill(0);
    for (const v of col) cnt[v]++;
    const w = 1 / (m - 1);
    for (let a = 0; a < K; a++) {
      const ca = cnt[a];
      if (!ca) continue;
      for (let b = 0; b < K; b++) {
        const cb = cnt[b];
        if (!cb) continue;
        o[a * K + b] += (a === b ? ca * (ca - 1) : ca * cb) * w;
      }
    }
    n += m;
    units++;
  }
  const nc = new Float64Array(K);
  for (let a = 0; a < K; a++) {
    let s = 0;
    for (let b = 0; b < K; b++) s += o[a * K + b];
    nc[a] = s;
  }
  return { o, nc, n, units };
}

/** Squared difference functions from Krippendorff (2011). The ordinal metric
 *  depends on the marginals nc; the interval metric on the codes' values. */
export function deltas(K, metric, nc, values) {
  const d = new Float64Array(K * K);
  for (let a = 0; a < K; a++) {
    for (let b = a + 1; b < K; b++) {
      let v;
      if (metric === "ordinal") {
        let s = 0;
        for (let g = a; g <= b; g++) s += nc[g];
        v = s - (nc[a] + nc[b]) / 2;
        v = v * v;
      } else if (metric === "interval") {
        v = values[a] - values[b];
        v = v * v;
      } else {
        v = 1;
      }
      d[a * K + b] = v;
      d[b * K + a] = v;
    }
  }
  return d;
}

/** Krippendorff's alpha. Returns null when fewer than two pairable values
 *  exist or when every pairable value falls in one category (De = 0), in
 *  which case alpha is undefined rather than 1. */
export function alpha(cols, K, metric = "nominal", values = null) {
  const { o, nc, n } = coincidence(cols, K);
  if (n < 2) return null;
  const vals = values || codeValues(Array.from({ length: K }, (_, i) => String(i + 1))).values;
  const d = deltas(K, metric, nc, vals);
  let Do = 0;
  let De = 0;
  for (let a = 0; a < K; a++) {
    for (let b = 0; b < K; b++) {
      if (a === b) continue;
      const dd = d[a * K + b];
      Do += o[a * K + b] * dd;
      De += nc[a] * nc[b] * dd;
    }
  }
  if (De === 0) return null;
  return 1 - ((n - 1) * Do) / De;
}

/** Alpha for one code against all the others (nominal, two categories). */
export function alphaBinary(cols, target) {
  const recoded = cols.map((col) => col.map((v) => (v === target ? 0 : 1)));
  return alpha(recoded, 2, "nominal");
}

/* ------------------------------------------------------- Fleiss's kappa */

export function fleiss(cols, K) {
  const use = cols.filter((c) => c.length >= 2);
  if (!use.length) return null;
  const m = use[0].length;
  if (use.some((c) => c.length !== m)) return { value: null, incomplete: true };
  const N = use.length;
  const marg = new Float64Array(K);
  const cnt = new Int32Array(K);
  let Pbar = 0;
  for (const col of use) {
    cnt.fill(0);
    for (const v of col) cnt[v]++;
    let s = 0;
    for (let k = 0; k < K; k++) {
      s += cnt[k] * (cnt[k] - 1);
      marg[k] += cnt[k];
    }
    Pbar += s / (m * (m - 1));
  }
  Pbar /= N;
  let Pe = 0;
  for (let k = 0; k < K; k++) {
    const p = marg[k] / (N * m);
    Pe += p * p;
  }
  if (Pe >= 1) return { value: null, undefinedValue: true, m, N };
  return { value: (Pbar - Pe) / (1 - Pe), m, N };
}

/* -------------------------------------------------------- Cohen's kappa */

/** Cohen's kappa between two index vectors, using only the positions where
 *  both hold a code. kappa is null when both raters used a single category. */
export function cohen(x, y, K) {
  const n = Math.min(x.length, y.length);
  const mx = new Float64Array(K);
  const my = new Float64Array(K);
  let used = 0;
  let agree = 0;
  for (let i = 0; i < n; i++) {
    const a = x[i];
    const b = y[i];
    if (a === null || a === undefined || b === null || b === undefined) continue;
    used++;
    if (a === b) agree++;
    mx[a]++;
    my[b]++;
  }
  if (used < 2) return null;
  const po = agree / used;
  let pe = 0;
  for (let k = 0; k < K; k++) pe += (mx[k] / used) * (my[k] / used);
  return { po, kappa: pe >= 1 ? null : (po - pe) / (1 - pe), n: used };
}

export function pairwiseKappa(rows, K) {
  const R = rows.length;
  const out = Array.from({ length: R }, () => new Array(R).fill(null));
  for (let a = 0; a < R; a++) {
    for (let b = a + 1; b < R; b++) {
      const c = cohen(rows[a], rows[b], K);
      out[a][b] = c;
      out[b][a] = c;
    }
  }
  return out;
}

/* ------------------------------------------------------- agreement */

export function meanPairwise(cols) {
  let agree = 0;
  let pairs = 0;
  for (const col of cols) {
    const m = col.length;
    if (m < 2) continue;
    for (let a = 0; a < m; a++) {
      for (let b = a + 1; b < m; b++) {
        pairs++;
        if (col[a] === col[b]) agree++;
      }
    }
  }
  return pairs ? agree / pairs : null;
}

/** Per item: number of codes, share of rater pairs that agreed, the count of
 *  each code, and the majority code (null on a tie or when empty). */
export function itemSummary(cols, K) {
  return cols.map((col) => {
    const n = col.length;
    const counts = new Array(K).fill(0);
    for (const v of col) counts[v]++;
    let agreement = null;
    if (n >= 2) {
      let a = 0;
      for (let k = 0; k < K; k++) a += (counts[k] * (counts[k] - 1)) / 2;
      agreement = a / ((n * (n - 1)) / 2);
    }
    let modal = null;
    let best = 0;
    let tie = false;
    for (let k = 0; k < K; k++) {
      if (counts[k] > best) {
        best = counts[k];
        modal = k;
        tie = false;
      } else if (counts[k] === best && best > 0) {
        tie = true;
      }
    }
    return { n, agreement, counts, modal: tie ? null : modal };
  });
}

/* --------------------------------------------------------- bootstrap */

/** Small deterministic PRNG so the interval reproduces run to run. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Percentile bootstrap for alpha, resampling items with replacement. */
export function bootstrapCI(cols, K, metric = "nominal", values = null, { draws = 2000, seed = 421 } = {}) {
  const usable = cols.filter((c) => c.length >= 2);
  const N = usable.length;
  if (N < 3) return null;
  const rnd = mulberry32(seed);
  const samp = new Array(N);
  const vals = [];
  for (let b = 0; b < draws; b++) {
    for (let i = 0; i < N; i++) samp[i] = usable[Math.floor(rnd() * N)];
    const a = alpha(samp, K, metric, values);
    if (a !== null && Number.isFinite(a)) vals.push(a);
  }
  if (vals.length < draws / 10) return null;
  vals.sort((p, q) => p - q);
  return {
    lo: vals[Math.floor(0.025 * vals.length)],
    hi: vals[Math.floor(0.975 * vals.length)],
    draws: vals.length,
  };
}

/* ---------------------------------------------------------- analysis */

/** Everything the page reports, from raw cell strings. `cells[r][i]` and
 *  `ref[i]` are whatever the user typed; matching is case-insensitive. */
export function analyze({ cells, ref = null, nRaters, nItems, codes, metric = "nominal" }) {
  const K = codes.length;
  const lookup = codeLookup(codes);
  const { values, numeric } = codeValues(codes);
  const rows = toRows(cells, nRaters, nItems, codes);
  const cols = toCols(rows, nItems);
  const refRow = ref ? Array.from({ length: nItems }, (_, i) => matchCode(ref[i], lookup)) : null;

  let coded = 0;
  let pairable = 0;
  for (const c of cols) {
    coded += c.length;
    if (c.length >= 2) pairable++;
  }
  const items = itemSummary(cols, K);
  const modal = items.map((it) => it.modal);

  const perCode = codes.map((code, k) => ({
    code,
    alpha: pairable ? alphaBinary(cols, k) : null,
    used: cols.reduce((s, c) => s + c.filter((v) => v === k).length, 0),
  }));

  let reference = null;
  if (refRow) {
    const perRater = rows.map((row) => cohen(row, refRow, K));
    const consensus = cohen(modal, refRow, K);
    const disagreements = [];
    for (let i = 0; i < nItems; i++) {
      if (modal[i] !== null && refRow[i] !== null && modal[i] !== refRow[i]) disagreements.push(i);
    }
    reference = { perRater, consensus, disagreements };
  }

  return {
    K,
    values,
    numeric,
    rows,
    cols,
    refRow,
    coded,
    pairable,
    alpha: pairable ? alpha(cols, K, metric, values) : null,
    fleiss: pairable ? fleiss(cols, K) : null,
    pairwise: pairable ? meanPairwise(cols) : null,
    perCode,
    kappaMatrix: pairwiseKappa(rows, K),
    reference,
    items,
    modal,
  };
}

/* ------------------------------------------------------------ tables */

/** Parse pasted or uploaded text. Tab, comma, or semicolon delimited, with
 *  double-quoted fields; falls back to runs of whitespace. */
export function parseDelimited(text) {
  const t = String(text ?? "").replace(/\r\n?/g, "\n");
  const firstLine = t.split("\n").find((l) => l.trim()) || "";
  let delim = null;
  if (firstLine.includes("\t")) delim = "\t";
  else if (firstLine.includes(",")) delim = ",";
  else if (firstLine.includes(";")) delim = ";";
  if (!delim) {
    return t
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => l.trim().split(/\s+/));
  }
  const rows = [];
  let row = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (inQ) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const REFERENCE_LABEL = /^(ref(erence)?|criterion|analyst|gold|standard|key|answer(s|\s*key)?|truth|expert)\b/i;

export function isReferenceLabel(s) {
  return REFERENCE_LABEL.test(String(s ?? "").trim());
}

/** Guess whether a pasted table has a header row, a label column, and
 *  whether its rows are raters or items. All three can be overridden. */
const RATERISH = /rater|coder|judge|reviewer|annotator|^r\s*\d+$/i;
const ITEMISH = /item|unit|case|segment|document|excerpt|^u\s*\d+$/i;

export function guessLayout(rows, codes) {
  const lookup = codeLookup(codes);
  const blank = (v) => String(v ?? "").trim() === "";
  const isCode = (v) => matchCode(v, lookup) !== null;
  const first = rows[0] || [];
  const rest = first.slice(1);
  const header = rest.length > 0 && rest.some((v) => !blank(v)) && !rest.some((v) => isCode(v));
  const body = header ? rows.slice(1) : rows;
  const labels = body.length > 0 && body.some((r) => !blank(r[0])) && !body.some((r) => isCode(r[0]));
  const width = Math.max(0, ...body.map((r) => r.length)) - (labels ? 1 : 0);
  const height = body.length;
  // Evidence that rows are raters (positive) or items (negative).
  let score = width >= height ? 1 : -1;
  const weigh = (cells, weight) => {
    for (const c of cells) {
      const s = String(c ?? "").trim();
      if (RATERISH.test(s)) score += weight;
      else if (ITEMISH.test(s)) score -= weight;
    }
  };
  if (header && labels) weigh([first[0]], 3); // the corner cell names the rows
  if (header) weigh(labels ? first.slice(1) : first, -2); // column headings name the columns
  if (labels) weigh(body.map((r) => r[0]), 2); // row labels name the rows
  return { header, labels, rowsAre: score >= 0 ? "raters" : "items" };
}

/** Turn a parsed table into rater-major cells plus names and item labels. */
export function tableToData(rows, layout) {
  let body = rows.map((r) => r.map((v) => String(v ?? "").trim()));
  let headerRow = null;
  if (layout.header) {
    headerRow = body[0] || [];
    body = body.slice(1);
  }
  const rowLabels = layout.labels ? body.map((r) => r[0] || "") : null;
  const data = body.map((r) => (layout.labels ? r.slice(1) : r));
  const colLabels = headerRow ? (layout.labels ? headerRow.slice(1) : headerRow) : null;
  const width = Math.max(0, ...data.map((r) => r.length));
  for (const r of data) while (r.length < width) r.push("");
  if (colLabels) while (colLabels.length < width) colLabels.push("");
  if (layout.rowsAre === "raters") return { names: rowLabels, itemLabels: colLabels, cells: data };
  const cells = [];
  for (let c = 0; c < width; c++) cells.push(data.map((r) => r[c]));
  return { names: colLabels, itemLabels: rowLabels, cells };
}

/** Distinct non-blank values in first-appearance order, naturally sorted. */
export function distinctValues(cells) {
  const seen = new Map();
  for (const row of cells) {
    for (const v of row) {
      const s = String(v ?? "").trim();
      if (!s) continue;
      const key = s.toUpperCase();
      if (!seen.has(key)) seen.set(key, s);
    }
  }
  const out = Array.from(seen.values());
  const allNumeric = out.every((v) => Number.isFinite(Number(v)));
  return allNumeric ? out.sort((a, b) => Number(a) - Number(b)) : out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

export function toCsv(rowsOfFields) {
  const q = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rowsOfFields.map((r) => r.map(q).join(",")).join("\n") + "\n";
}
