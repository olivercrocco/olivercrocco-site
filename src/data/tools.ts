/** The research tools listed on /tools. Shared with the site search index. */

export const tools = [
  {
    name: "claim-verifier",
    audience: "For authors, reviewers, and editors",
    tagline:
      "Check whether the sources you cite actually say what you claim they say.",
    body: "It reads a manuscript, finds every sentence that carries a citation, and pulls the passages from that source's full text that bear on the sentence. A language model then compares the two and returns a graded assessment, from consistent to possibly conflicting, with the passage it relied on quoted underneath. The report is ranked so the citations worth your attention come first. Quotation-error studies in medicine put source misstatement at roughly one in six citations, and few of us check, because checking one citation by hand means finding the source and reading enough of it to be sure. This makes that check cheap. It renders no verdicts: a claim marked as not found means only that support was not found in the passages retrieved, and you are sent to the source to judge.",
    features: [
      "Extracts every citation-bearing sentence and matches it to the cited work's full text",
      "Grades each pairing from consistent to possibly conflicting, quoting the passage behind the call",
      "Runs on a local model by default, so a manuscript under review never leaves your machine",
      "Flags rather than judges: what it cannot confirm is a citation to check, not one to fix",
    ],
    repo: "https://github.com/WarderHouse/claim-verifier",
    version: "0.2.0",
    doi: "10.5281/zenodo.21985256",
    stack: "Python · Ollama · MIT",
    proof: `claimverify — synthetic example, local model

### zarestky-2024
> Zarestky (2024) found that women's participation in employer
  training lagged men's by ten percentage points.

Verdict: partially consistent (check the shift)
The manuscript states a ten percentage point gap, while the source
reports a nine percentage point gap.

Evidence from the source: "We found that women's participation in
employer-provided training lagged men's by nine percentage points,
and the gap was concentrated in manufacturing."`,
  },
  {
    name: "cross-tool-statistical-verification",
    audience: "For quantitative researchers",
    tagline:
      "Check whether a statistical result reproduces in a second program, or is an artifact of the one you ran it in.",
    body: "You write your analysis twice, once in Python and once in R, and the tool reconciles them. It runs a six-phase protocol that inspects the data, checks every reported number for internal consistency, re-runs the analysis to confirm it reproduces, and compares the two implementations statistic by statistic. It then writes the evidence: a verification log, a side-by-side comparison table, and a methodology paragraph you can adapt for a manuscript. Agreement across the two shows a result is independent of one library's defaults — strong evidence it is reproducible, though not on its own proof the analysis is correct.",
    features: [
      "Compares Python and R statistic by statistic, within tolerance",
      "Checks internal consistency and re-run reproducibility",
      "Produces a verification log and a comparison table as evidence",
      "Drafts a methodology paragraph for your paper",
    ],
    repo: "https://github.com/WarderHouse/cross-tool-statistical-verification",
    demo: "https://olivercrocco.shinyapps.io/ctsv-demo/",
    version: "0.1.0",
    doi: "10.5281/zenodo.20448660",
    stack: "Python · R · MIT",
    proof: `crossverify — OLS regression: mpg ~ wt + hp (mtcars)
  Phase 3  consistency       8 pass
  Phase 4  reproducibility   11 pass
  Phase 5  triangulation     11 pass
  Cross-tool: 11/11 statistics matched within tolerance.

Result: PASS`,
  },
  {
    name: "citation-verifier",
    audience: "For researchers and graduate students",
    tagline:
      "Check whether the references in your bibliography actually exist, before you cite them.",
    body: "Paste a reference list and it checks each one against CrossRef and OpenAlex. A resolved DOI, or a title match in either database, confirms that a reference exists in one of those places. A reference with no scholarly match is flagged as likely grey literature, a book, report, or website to verify yourself, and a DOI that resolves nowhere is flagged as possibly fabricated or mistyped. It reads the title and DOI out of each line and shows you what it looked up, so you can see exactly what was checked. It confirms whether a work exists in CrossRef or OpenAlex, not that it says what you claim.",
    features: [
      "Cross-checks CrossRef and OpenAlex; one confirming source gets a green light",
      "Treats a resolved DOI as confirmation, but flags a DOI that resolves to a different title",
      "Flags non-indexed books, reports, and websites as grey literature, not necessarily fabrication or hallucination",
      "Runs from the command line or in the browser; queries public databases only, no AI",
    ],
    repo: "https://github.com/WarderHouse/citation-verifier",
    version: "0.1.0",
    doi: "10.5281/zenodo.20508955",
    demo: "https://warderhouse.github.io/citation-verifier/",
    demoLabel: "Try it in your browser →",
    stack: "Python · JavaScript · CrossRef · OpenAlex · MIT",
    proof: null,
  },
  {
    name: "peer-reviewer-finder",
    audience: "For HRD & adjacent-field editors",
    tagline:
      "Find well-matched, conflict-free, and diverse peer reviewers for a manuscript in human resource development and adjacent fields.",
    body: "Given a manuscript's title, abstract, and a few keywords, along with the submitting authors' institutions, it searches a registry of 97 journals spanning human resource development and six adjacent disciplines — adult and continuing education, management and organizational behavior, industrial-organizational psychology, higher education, career and workforce development, and international and comparative education — on OpenAlex for scholars whose published work genuinely matches. It screens out conflicts of interest, then returns a relevance-ranked panel with institutional and national diversity built in. The editor still decides; the tool supplies the evidence and a defensible shortlist.",
    features: [
      "Searches 97 journals across HRD and six adjacent disciplines via OpenAlex",
      "Screens conflicts of interest by shared institution and co-authorship",
      "Proposes a diverse, relevance-ranked shortlist with alternates",
      "Runs locally or in your browser — sends no manuscript text to any AI",
    ],
    repo: "https://github.com/olivercrocco/peer-reviewer-finder",
    version: "0.2.0",
    doi: "10.5281/zenodo.20448662",
    demo: "/reviewer-finder",
    demoLabel: "Try it in your browser →",
    stack: "Python · JavaScript · OpenAlex · MIT",
    proof: null,
  },
  {
    name: "Inter-Rater Reliability Calculator",
    citeTitle: "Inter-rater reliability calculator",
    audience: "For coding teams and research methods classes",
    tagline:
      "Krippendorff's alpha, Fleiss's kappa, Cohen's kappa, and percent agreement for any number of raters, items, and codes, computed in your browser as you type.",
    body: "List your codes, then type or paste a rater-by-item grid, and every statistic updates at once: Krippendorff's alpha at the nominal, ordinal, or interval level with a bootstrap confidence interval, Fleiss's kappa where the design allows it, Cohen's kappa for every pair of raters, and a per-code alpha that shows which distinction carries the disagreement. Blank cells are handled. An optional reference row compares each rater, and the most common code across raters, against an existing coding or an answer key. The items are then sorted by agreement into an adjudication queue so a team can discuss the hardest cases first, and the results export as Markdown or CSV. The estimators reproduce hand-derived cases and Krippendorff's published example, and they match the R packages irr and irrCAC and the Python package krippendorff cell by cell on 240 random grids with missing values.",
    features: [
      "Any team size, item count, and code set; blank cells tolerated",
      "Alpha at the nominal, ordinal, or interval level, with a bootstrap 95% confidence interval",
      "Pairwise Cohen's kappa, per-code alpha, and a reference-row comparison",
      "Adjudication queue sorted by agreement; results export as Markdown and CSV",
    ],
    demo: "/irr-calculator",
    demoLabel: "Open the calculator →",
    repo: "https://github.com/olivercrocco/irr-calculator",
    version: "1.0.0",
    citeUrl: "https://olivercrocco.com/irr-calculator",
    stack: "JavaScript · Runs in the browser · Verified against R and Python",
    proof: null,
  },
  {
    name: "Scholarly Voice and Identity Interviewer",
    citeTitle: "Scholarly voice and identity interviewer",
    audience: "For scholars who write with AI",
    tagline:
      "Interview yourself once and get two reference documents that give an AI assistant your scholarly voice and intellectual perspectives, in place of the flat, generic default.",
    body: "Paste it into Claude and it reads your CV and a spread of your published work, reports what your writing already reveals, then interviews you where the corpus leaves gaps. It produces a Researcher Identity Profile (your animating questions, distinctive position, theoretical toolkit, and quality filters) and a Scholarly Voice Profile (your sentence mechanics, a genre-by-genre reading of your prose, and a register guide). Keep both and paste them into any later chat to draft, revise, or copy-edit as yourself. It is the academic descendant of Ruben Hassid's Taste Interviewer prompt.",
    features: [
      "Reads your real published work across genres before it asks a single question",
      "Captures the intellectual perspectives under your prose, the questions and positions that make it yours",
      "Calibrates your voice from journal article to keynote to grant",
      "Records the common AI writing practices you want to avoid, as a check on later drafts",
    ],
    demo: "/voice-profile",
    demoLabel: "Open the prompt →",
    version: "1.0",
    kind: "Large language model prompt",
    doi: "10.5281/zenodo.20932766",
    repo: "https://github.com/olivercrocco/scholarly-voice-profile",
    citeUrl: "https://olivercrocco.com/voice-profile",
    stack: "Prompt · Markdown · CC BY 4.0",
    proof: null,
  },
];

/** URL fragment for a tool's section on /tools. */
export const toolAnchor = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
