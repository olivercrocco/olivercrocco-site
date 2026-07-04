/**
 * reviewerFinder.js — browser port of the peer-reviewer-finder matching engine.
 *
 * Runs entirely client-side. It calls the OpenAlex API directly from the visitor's
 * browser (anonymously, no email attached), so nothing passes through any server:
 * the only manuscript-derived data that leaves the machine is the topic keywords.
 * The title and abstract are never sent. This mirrors the Python tool's confidential
 * mode. Source of truth for the logic: github.com/olivercrocco/peer-reviewer-finder
 */

const OA = "https://api.openalex.org";
const STOPWORDS = new Set(["and","the","of","for","with","in","on","to","a","an","or","by","as","at","is","are"]);
const TIER_WEIGHT = { core: 3.0, secondary: 1.0, method_primary: 2.0, method_generic: 0.8, context: 0.4 };
const TIERS = ["core", "secondary", "method_primary", "method_generic", "context"];
const MAX_WORKS_SCORED = 8;
const W_REQ = 12.0, W_SOFT = 2.0;

export const PANEL_DEFAULTS = {
  size: 9, max_per_institution: 1, min_countries: 4, min_disciplines: 2,
  min_method_experts: 1, min_early_career: 2, min_mid_career: 2, min_senior: 1, max_senior: 3,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const round2 = (x) => Math.round(x * 100) / 100;

async function oaGet(path, params, tries = 4) {
  const url = new URL(path.startsWith("http") ? path : `${OA}/${path.replace(/^\//, "")}`);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const r = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      if (r.ok) return await r.json();
      if (r.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
      throw new Error("OpenAlex HTTP " + r.status);
    } catch (e) {
      if (attempt === tries - 1) throw e;
      await sleep(1000 * (attempt + 1));
    }
  }
  return {};
}

function abstractText(inv) {
  if (!inv) return "";
  const pos = {};
  for (const [w, idxs] of Object.entries(inv)) for (const i of idxs) pos[i] = w;
  return Object.keys(pos).map(Number).sort((a, b) => a - b).map((i) => pos[i]).join(" ");
}

function matchStrength(term, title, abstract) {
  const t = (title || "").toLowerCase(), a = (abstract || "").toLowerCase(), tl = term.toLowerCase();
  if (t.includes(tl)) return 2.0;
  if (a.includes(tl)) return 1.0;
  const toks = tl.split(/\W+/).filter((x) => x.length > 2 && !STOPWORDS.has(x));
  const blob = t + " " + a;
  if (toks.length && toks.every((x) => blob.includes(x))) return 0.5;
  return 0.0;
}

export function allDisciplines(registry) {
  const out = [];
  for (const j of registry) for (const d of (j.disciplines || [])) if (!out.includes(d)) out.push(d);
  return out;
}

function selectSources(registry, disciplines) {
  const disc = disciplines && disciplines.length ? new Set(disciplines) : null;
  const ids = [], meta = {};
  for (const j of registry) {
    if (!j.openalex_id) continue;
    if (disc && !(j.disciplines || []).some((d) => disc.has(d))) continue;
    ids.push(j.openalex_id);
    meta[j.openalex_id] = { name: j.name, disciplines: j.disciplines || [], tier: j.tier };
  }
  return { ids, meta };
}

async function searchTerm(sourceFilter, term, perQuery = 100, minStrength = 0.5) {
  const data = await oaGet("works", {
    search: term,
    filter: `primary_location.source.id:${sourceFilter},is_paratext:false`,
    "per-page": perQuery, sort: "relevance_score:desc",
    select: "id,title,publication_year,primary_location,authorships,abstract_inverted_index,type,cited_by_count",
  });
  const out = [], results = data.results || [];
  for (const w of results) {
    const title = w.title || "";
    const strength = matchStrength(term, title, abstractText(w.abstract_inverted_index));
    if (strength >= minStrength) out.push({ work: w, strength });
  }
  return { matches: out, returned: results.length };
}

function fold(matches, term, bucket, idMeta, candidates) {
  for (const m of matches) {
    const w = m.work, strength = m.strength, wid = w.id.split("/").pop();
    const sid = ((w.primary_location && w.primary_location.source && w.primary_location.source.id) || "").split("/").pop();
    const meta = idMeta[sid] || {};
    const auths = w.authorships || [], n = auths.length;
    auths.forEach((a, idx) => {
      const au = a.author || {}, aid = (au.id || "").split("/").pop();
      if (!aid) return;
      let c = candidates[aid];
      if (!c) { c = { id: aid, name: "", orcid: "", works: {}, prof: {} }; candidates[aid] = c; }
      c.name = au.display_name || c.name;
      c.orcid = au.orcid || c.orcid;
      let wi = c.works[wid];
      if (!wi) { wi = { title: "", year: null, journal: "", discipline: "", lead: false, terms: {}, inst_id: "", inst_name: "", country: "" }; c.works[wid] = wi; }
      wi.title = w.title || ""; wi.year = w.publication_year;
      wi.journal = meta.name || (w.primary_location && w.primary_location.source && w.primary_location.source.display_name) || "";
      wi.discipline = (meta.disciplines || [""])[0];
      wi.lead = wi.lead || idx === 0 || idx === n - 1;
      const insts = a.institutions || [];
      if (insts.length) { wi.inst_id = (insts[0].id || "").split("/").pop(); wi.inst_name = insts[0].display_name || wi.inst_name; wi.country = insts[0].country_code || wi.country; }
      const prev = wi.terms[term];
      if (!prev || strength > prev.strength) wi.terms[term] = { strength, bucket };
    });
  }
}

// ---- scoring -------------------------------------------------------------
function workHasRealCore(w) { return Object.values(w.terms).some((i) => i.bucket === "core" && i.strength >= 1.0); }

function scoreCandidate(c, currentYear) {
  const credit = { core: 0, secondary: 0, method_primary: 0, method_generic: 0, context: 0 };
  const breadth = { core: new Set(), secondary: new Set(), method_primary: new Set(), method_generic: new Set() };
  const n = { core: 0, secondary: 0, method_primary: 0, method_generic: 0, context: 0 };
  const years = []; let coreLead = 0; const contribs = [];
  for (const w of Object.values(c.works)) {
    const pos = w.lead ? 1.0 : 0.6; let workBest = 0, real = false;
    for (const [term, info] of Object.entries(w.terms)) {
      const s = info.strength, b = info.bucket, cc = TIER_WEIGHT[b] * s * pos;
      credit[b] += cc; n[b]++; if (cc > workBest) workBest = cc;
      if (s >= 1.0) { if (breadth[b]) breadth[b].add(term); real = true; }
    }
    if (real && w.year) years.push(w.year);
    if (w.lead && workHasRealCore(w)) coreLead++;
    contribs.push(workBest);
  }
  contribs.sort((a, b) => b - a);
  const overflow = contribs.slice(MAX_WORKS_SCORED).reduce((a, b) => a + b, 0);
  const coreC = credit.core, secC = credit.secondary, methodC = credit.method_primary + credit.method_generic, ctxC = credit.context;
  const recency = years.length ? Math.max(...years) : null;
  const recencyBonus = recency && recency >= currentYear - 3 ? 2 : (recency && recency >= currentYear - 6 ? 1 : 0);
  const wc = (c.prof && c.prof.works_count) || 0;
  // Flat track-record floor (not an escalating output bonus): distinguishes an
  // established scholar from a one-off author without rewarding sheer productivity,
  // which was a thumb on the scale for senior scholars. Fit ranks reviewers, not volume.
  const trackRecord = wc >= 5 ? 0.6 : wc >= 2 ? 0.3 : 0.0;
  const total = coreC + secC + methodC + ctxC - 0.5 * overflow + 1.0 * breadth.core.size + recencyBonus + trackRecord;
  return {
    score: round2(total),
    core_credit: round2(coreC), secondary_credit: round2(secC), method_credit: round2(methodC),
    core_breadth: breadth.core.size, secondary_breadth: breadth.secondary.size,
    method_primary_breadth: breadth.method_primary.size, method_generic_breadth: breadth.method_generic.size,
    n_core_works: n.core, n_method_works: n.method_primary + n.method_generic,
    core_lead_works: coreLead, recency,
  };
}

function classify(sc) {
  const core = sc.core_credit > 0, method = sc.method_credit > 0;
  if (core && method) return "Topic + Method";
  if (core) return "Topic";
  if (sc.method_primary_breadth > 0) return "Method (primary)";
  if (method) return "Method (review)";
  return "Adjacent";
}
function prelimValue(c) {
  let v = 0;
  for (const w of Object.values(c.works)) { const pos = w.lead ? 1.0 : 0.6; for (const info of Object.values(w.terms)) v += TIER_WEIGHT[info.bucket] * info.strength * pos; }
  return v;
}
// Years since first publication, from counts_by_year (no extra API call). Reaches
// back ~20 years, deep enough to place early- and mid-career scholars; saturates for
// long careers, which still reads as senior. Returns null if there's no year data.
export function academicAge(prof, currentYear) {
  const cby = (prof && prof.counts_by_year) || [];
  const years = cby.filter((c) => c.year && (c.works_count || 0) > 0).map((c) => c.year);
  return years.length ? Math.max(0, currentYear - Math.min(...years)) : null;
}

// Career stage keyed off academic age (time in the field), refined by h-index —
// not lifetime output, which over-labels prolific-but-recent scholars "senior".
// Senior needs a long career AND an established record, so the count doesn't re-inflate.
export function careerStage(prof, currentYear) {
  const cy = currentYear || new Date().getFullYear();
  const h = (prof && prof.h_index) || 0, wc = (prof && prof.works_count) || 0;
  const age = academicAge(prof, cy);
  if (age !== null) {
    if (age <= 7 && h < 20) return "early-career";
    if ((age >= 16 && h >= 20) || h >= 40) return "senior";
    return "mid-career";
  }
  if (h >= 30 || wc >= 120) return "senior";
  if (h <= 10 && wc <= 30) return "early-career";
  return "mid-career";
}
export function isActive(prof, currentYear, window = 3) {
  const cby = (prof && prof.counts_by_year) || [];
  return cby.filter((c) => (c.year || 0) >= currentYear - window + 1).reduce((a, c) => a + (c.works_count || 0), 0) > 0;
}
function isMethodExpert(sc) { return sc.method_credit > 0 && (sc.method_primary_breadth + sc.method_generic_breadth) >= 1; }
function isPrimaryMethodExpert(sc) { return sc.method_primary_breadth >= 1; }

// ---- conflicts of interest (local matching only) -------------------------
const INST_STOP = new Set(["university","univ","of","the","college","school","institute","for","and","at","de","la","el","center","centre","department"]);
function normalizeInst(name) {
  return new Set((name || "").toLowerCase().split(/\W+/).filter((t) => t && !INST_STOP.has(t) && t.length > 1));
}
export function currentAffiliation(c) {
  const dated = Object.values(c.works).filter((w) => w.inst_name && w.year);
  if (dated.length) { const w = dated.reduce((a, b) => (b.year > a.year ? b : a)); return [w.inst_name, w.country || ""]; }
  const p = c.prof || {};
  if (p.last_inst) return [p.last_inst, p.last_country || ""];
  return ["", ""];
}
function currentCountry(c) { return currentAffiliation(c)[1]; }
function institutionKey(c) {
  const dated = Object.values(c.works).filter((w) => w.inst_id && w.year);
  if (dated.length) return dated.reduce((a, b) => (b.year > a.year ? b : a)).inst_id;
  const p = c.prof || {};
  if (p.last_inst_id) return p.last_inst_id;
  if (p.last_inst) return p.last_inst;
  for (const w of Object.values(c.works)) { if (w.inst_id) return w.inst_id; if (w.inst_name) return w.inst_name; }
  return c.id;
}
export function disciplinesOf(c) {
  const out = [];
  for (const w of Object.values(c.works)) { const d = w.discipline; if (d && !out.includes(d)) out.push(d); }
  return out;
}
function candidateInstitutions(c) {
  const seen = {};
  for (const w of Object.values(c.works)) if (w.inst_id || w.inst_name) seen[w.inst_id || w.inst_name] = w.inst_name || "";
  const p = c.prof || {};
  if ((p.last_inst_id || p.last_inst) && !((p.last_inst_id || p.last_inst) in seen)) seen[p.last_inst_id || p.last_inst] = p.last_inst || "";
  return Object.values(seen);
}
function subset(a, b) { for (const x of a) if (!b.has(x)) return false; return true; }
function jaccard(a, b) { if (!a.size || !b.size) return 0; let i = 0; for (const x of a) if (b.has(x)) i++; return i / new Set([...a, ...b]).size; }
function sameInstitution(c, authorTokenSets, jac = 0.6) {
  for (const instName of candidateInstitutions(c)) {
    const cset = normalizeInst(instName); if (!cset.size) continue;
    for (const aset of authorTokenSets) {
      if (!aset.size) continue;
      if (subset(cset, aset) || subset(aset, cset) || jaccard(cset, aset) >= jac) return true;
    }
  }
  return false;
}
function coauthorGraph(cands) {
  const workToAuthors = {};
  for (const c of cands) for (const wid of Object.keys(c.works)) (workToAuthors[wid] = workToAuthors[wid] || new Set()).add(c.id);
  const graph = {}; for (const c of cands) graph[c.id] = new Set();
  for (const authors of Object.values(workToAuthors)) if (authors.size > 1) for (const a of authors) for (const b of authors) if (a !== b) graph[a].add(b);
  return graph;
}

// ---- scorecard panel selection -------------------------------------------
function selectPanel(ranked, coauthors, reqs, currentYear) {
  const { size, max_per_institution: maxinst, min_countries: minC, min_disciplines: minD,
    min_method_experts: minM, min_early_career: minE, min_senior: minS } = reqs;
  const minMid = reqs.min_mid_career || 0;
  const maxS = reqs.max_senior === undefined ? null : reqs.max_senior;   // null => no cap
  const items = ranked.map(([c, sc, kind]) => ({
    c, sc, kind, inst: institutionKey(c), country: currentCountry(c), discs: new Set(disciplinesOf(c)),
    method: isMethodExpert(sc), primary: isPrimaryMethodExpert(sc), stage: careerStage(c.prof, currentYear),
  }));
  const chosen = [], instCounts = {}, countries = new Set(), disciplines = new Set(), picked = new Set();
  let nMethod = 0, nEarly = 0, nMid = 0, nSenior = 0;
  while (chosen.length < size && items.length) {
    let best = null, bestVal = null, bestIdx = null;
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if ((instCounts[it.inst] || 0) >= maxinst) continue;
      if (maxS !== null && it.stage === "senior" && nSenior >= maxS) continue;   // senior cap
      let conflict = false;
      for (const p of picked) if (coauthors[it.c.id] && coauthors[it.c.id].has(p)) { conflict = true; break; }
      if (conflict) continue;
      let val = it.sc.score;
      const newCountry = it.country && !countries.has(it.country);
      const newDiscs = [...it.discs].some((d) => !disciplines.has(d));
      if (it.method && nMethod < minM) val += W_REQ + (it.primary ? W_REQ * 0.4 : 0);
      if (it.stage === "early-career" && nEarly < minE) val += W_REQ;
      if (it.stage === "mid-career" && nMid < minMid) val += W_REQ;
      if (it.stage === "senior" && nSenior < minS) val += W_REQ;
      if (newCountry && countries.size < minC) val += W_REQ * 0.8;
      if (newDiscs && disciplines.size < minD) val += W_REQ * 0.8;
      if (newCountry) val += W_SOFT;
      if (newDiscs) val += W_SOFT * 0.5;
      if (bestVal === null || val > bestVal) { best = it; bestVal = val; bestIdx = idx; }
    }
    if (best === null) break;
    const it = best, why = [];
    if (it.method && nMethod < minM) why.push("method" + (it.primary ? " (primary)" : ""));
    if (it.stage === "early-career" && nEarly < minE) why.push("early-career");
    if (it.stage === "mid-career" && nMid < minMid) why.push("mid-career");
    if (it.stage === "senior" && nSenior < minS) why.push("senior anchor");
    if (it.country && !countries.has(it.country)) why.push("+" + it.country);
    const nd = [...it.discs].filter((d) => !disciplines.has(d)).sort();
    if (nd.length) why.push("+" + nd[0]);
    chosen.push([it.c, it.sc, it.kind, why.join(", ") || "high relevance"]);
    instCounts[it.inst] = (instCounts[it.inst] || 0) + 1;
    if (it.country) countries.add(it.country);
    for (const d of it.discs) disciplines.add(d);
    picked.add(it.c.id);
    nMethod += it.method ? 1 : 0; nEarly += it.stage === "early-career" ? 1 : 0;
    nMid += it.stage === "mid-career" ? 1 : 0; nSenior += it.stage === "senior" ? 1 : 0;
    items.splice(bestIdx, 1);
  }
  return {
    panel: chosen,
    scorecard: {
      size: [chosen.length, size], institutions: [Object.values(instCounts).filter((v) => v).length, null],
      countries: [countries.size, minC], disciplines: [disciplines.size, minD],
      method_experts: [nMethod, minM], early_career: [nEarly, minE],
      mid_career: [nMid, minMid], senior: [nSenior, minS],
    },
  };
}

async function fetchAuthors(ids) {
  const out = {};
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    let data = {};
    try {
      data = await oaGet("authors", { filter: "openalex_id:" + chunk.join("|"), "per-page": 50, select: "id,display_name,orcid,works_count,cited_by_count,summary_stats,last_known_institutions,topics,counts_by_year" });
    } catch (e) { /* keep going */ }
    for (const a of (data.results || [])) {
      const aid = a.id.split("/").pop(), insts = a.last_known_institutions || [];
      out[aid] = {
        works_count: a.works_count, cited_by_count: a.cited_by_count, h_index: a.summary_stats && a.summary_stats.h_index,
        last_inst: insts[0] ? insts[0].display_name : "", last_inst_id: insts[0] ? (insts[0].id || "").split("/").pop() : "",
        last_country: insts[0] ? insts[0].country_code : "", topics: (a.topics || []).slice(0, 4).map((t) => t.display_name),
        counts_by_year: a.counts_by_year || [],
      };
    }
  }
  return out;
}

export function evidence(c, limit = 4) {
  return Object.values(c.works)
    .map((w) => ({ ...w, _s: Math.max(0, ...Object.values(w.terms).map((i) => i.strength)) }))
    .sort((a, b) => (b._s - a._s) || ((b.year || 0) - (a.year || 0)))
    .slice(0, limit);
}

// ---- contact lookup via the public ORCID API -----------------------------
// Opt-in, run only for the suggested panel. Sends only the reviewers' own public
// ORCID iDs to pub.orcid.org (never the manuscript or authors) to fetch a public
// email, if the researcher published one, and their current employer. Mirrors the
// Python tool's --contacts. pub.orcid.org must be in the CSP connect-src.
const ORCID_BASE = "https://pub.orcid.org/v3.0";
const ORCID_RE = /^(?:https?:\/\/orcid\.org\/)?(\d{4}-\d{4}-\d{4}-\d{3}[\dX])$/;
function bareOrcid(s) { const m = ORCID_RE.exec((s || "").trim()); return m ? m[1] : null; }

async function orcidGet(path, tries = 3) {
  const url = `${ORCID_BASE}/${path.replace(/^\//, "")}`;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const r = await fetch(url, { headers: { Accept: "application/json" } });
      if (r.ok) return await r.json();
      if (r.status === 404 || r.status === 409 || r.status === 410) return {};
      if (r.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
      throw new Error("ORCID HTTP " + r.status);
    } catch (e) {
      if (attempt === tries - 1) return {};
      await sleep(1000 * (attempt + 1));
    }
  }
  return {};
}

async function orcidContact(orcid) {
  const oid = bareOrcid(orcid);
  if (!oid) return null;
  const [emailData, empData] = await Promise.all([orcidGet(`${oid}/email`), orcidGet(`${oid}/employments`)]);
  let email = "";
  for (const e of ((emailData && emailData.email) || [])) if (e.email) { email = e.email; break; }
  // most-current employment: a post with no end-date wins; else the latest end year.
  const lt = (a, b) => (a[0] !== b[0] ? a[0] < b[0] : a[1] < b[1]);
  let best = null, bestKey = null;
  for (const g of ((empData && empData["affiliation-group"]) || [])) {
    for (const s of (g.summaries || [])) {
      const emp = s["employment-summary"] || {};
      const end = emp["end-date"];
      const key = !end ? [0, 0] : [1, -(parseInt((end.year || {}).value, 10) || 0)];
      if (bestKey === null || lt(key, bestKey)) { bestKey = key; best = emp; }
    }
  }
  let affiliation = "", role = "", country = "";
  if (best) {
    const o = best.organization || {};
    affiliation = o.name || ""; role = best["role-title"] || ""; country = (o.address || {}).country || "";
  }
  return { orcid: oid, email, affiliation, role, country };
}

// Look up public contacts for the panel. Returns { candidateId: {email, affiliation, role, country} }.
export async function fetchContacts(panel, opts = {}) {
  const onProgress = opts.onProgress || (() => {});
  const out = {};
  let i = 0;
  for (const [c] of panel) {
    onProgress({ done: i, total: panel.length });
    if (c.orcid) {
      const info = await orcidContact(c.orcid);
      if (info) out[c.id] = info;
    }
    i++;
    await sleep(120);
  }
  onProgress({ done: panel.length, total: panel.length });
  return out;
}

export async function runReviewerFinder(spec, registry, opts = {}) {
  const onProgress = opts.onProgress || (() => {});
  const currentYear = opts.currentYear || new Date().getFullYear();
  const perQuery = opts.perQuery || 100, enrichTop = opts.enrichTop || 150, top = opts.top || 25;

  const queryBucket = {};
  for (const tier of TIERS) for (const t of (spec[tier + "_terms"] || [])) if (t && t.trim()) queryBucket[t.trim()] = tier;
  if (!Object.keys(queryBucket).length) throw new Error("Add at least one search term (start with a couple of Core terms).");

  const { ids, meta } = selectSources(registry, spec.disciplines);
  if (!ids.length) throw new Error("No journals selected — pick at least one discipline.");
  const sourceFilter = ids.join("|");

  const candidates = {};
  const terms = Object.entries(queryBucket); let done = 0;
  for (const [term, bucket] of terms) {
    onProgress({ phase: "search", term, done, total: terms.length });
    try { const { matches } = await searchTerm(sourceFilter, term, perQuery); fold(matches, term, bucket, meta, candidates); }
    catch (e) { /* skip a failed term */ }
    done++;
  }

  const all = Object.values(candidates);
  const rankedPre = all.map((c) => [c, prelimValue(c)]).sort((a, b) => b[1] - a[1]).map((x) => x[0]);
  onProgress({ phase: "enrich", count: Math.min(rankedPre.length, enrichTop), total: terms.length, done: terms.length });
  const prof = await fetchAuthors(rankedPre.slice(0, enrichTop).map((c) => c.id));
  for (const c of rankedPre) if (prof[c.id]) c.prof = prof[c.id];

  const authorTokenSets = (spec.author_institutions || []).map(normalizeInst).filter((s) => s.size);
  const exclNames = new Set((spec.exclude_author_names || []).map((s) => s.toLowerCase().trim()).filter(Boolean));

  const rows = []; let sameInstBlocked = 0;
  for (const c of rankedPre.slice(0, enrichTop)) {
    if (exclNames.has((c.name || "").toLowerCase())) continue;
    const sc = scoreCandidate(c, currentYear);
    if (sc.core_breadth + sc.secondary_breadth + sc.method_primary_breadth + sc.method_generic_breadth === 0) continue;
    if (authorTokenSets.length && sameInstitution(c, authorTokenSets)) { sameInstBlocked++; continue; }
    rows.push([c, sc, classify(sc)]);
  }
  rows.sort((a, b) => b[1].score - a[1].score);

  const reqs = { ...PANEL_DEFAULTS, ...(spec.panel || {}) };
  onProgress({ phase: "panel" });
  const graph = coauthorGraph(rows.map((r) => r[0]));
  const { panel, scorecard } = selectPanel(rows.slice(0, Math.max(60, reqs.size * 8)), graph, reqs, currentYear);
  panel.sort((a, b) => b[1].score - a[1].score);

  return {
    rows: rows.slice(0, top), allRows: rows, panel, scorecard,
    nCandidates: all.length, nJournals: ids.length, sameInstBlocked, currentYear, title: spec.title || "",
    authorInstitutions: spec.author_institutions || [],
  };
}
