# Cross-tool verification of the inter-rater reliability calculator

The calculator at `/irr-calculator` computes everything in `src/lib/irr.js`. These scripts
check that file three ways.

1. `test.mjs` runs hand-derived cases (coincidence matrices worked out by hand, Fleiss and
   Cohen from their definitions, the worked example in Krippendorff, 2011, an independent
   pair-enumeration derivation of alpha over 300 random grids).
2. `gen.mjs` builds 240 random rater-by-item grids (2 to 8 raters, 4 to 60 items, 2 to 7
   codes; complete, randomly missing, and balanced-but-missing designs) and records what
   `irr.js` computes.
3. `verify.R` and `verify.py` recompute the same statistics in R (packages `irr` and
   `irrCAC`) and Python (package `krippendorff`, plus the classroom script `irr_analysis.py`
   when `IRR_ANALYSIS_PY` points at it). `compare.mjs` then compares every value.

Run everything with `scripts/irr-verify/run.sh`. Environment variables: `IRR_VERIFY_OUT`
(output folder, git-ignored), `IRR_PY` (a Python with numpy and krippendorff), `IRR_RLIB`
(an R library path holding irr and irrCAC), `IRR_ANALYSIS_PY` (optional).

## What the run on 9 September 2026 showed

Alpha at the nominal, ordinal, and interval levels, Fleiss's kappa, Cohen's kappa for every
pair of raters, raw agreement, mean pairwise agreement, and the per-code alpha all matched R
and Python to at least 1e-14 on every grid. irrCAC rounds its output to five decimals and
matched to that precision, including its quadratic-weighted alpha against the interval
metric. Two bootstrap implementations with different generators agreed on the interval
bounds to within .007 at 6,000 draws.

## A defect in `irr::kripp.alpha` (irr 0.84.1)

The function weights each unit's pairs by 1/(m - 1) only when the matrix holds an NA. With
no NA at all it uses a weight of 1:

```r
if (any(is.na(x)))
    mc <- apply(x, 2, vn) - 1
else mc <- rep(1, dimx[2])
```

That shortcut is right for two raters and wrong for three or more. It inflates the
coincidence totals by (m - 1), which moves the small-sample term from (n - 1) to
(n(m - 1) - 1). On the 240 grids the unpatched value differed from Krippendorff's on
exactly the 95 complete grids with three or more raters and on nothing else. `verify.R`
appends a rater who coded nothing, which forces the general branch without adding a pair;
the function's own arithmetic then returns the correct value. Anyone reporting alpha from
`irr` for a complete design with three or more raters should be aware of this.

## Conventions that differ between tools

When every paired value falls in one category, alpha is 0/0. The calculator reports it as
undefined; `irr::kripp.alpha` returns 1 when the data hold a single level, and the classroom
script returns 1.0. Cohen's kappa when both raters used one category is likewise undefined
here and in R's `kappa2`; the classroom script returns 1.0. The comparison treats these as
convention differences and lists them separately.
