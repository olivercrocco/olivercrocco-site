#!/usr/bin/env bash
# Cross-tool verification of src/lib/irr.js against R (irr) and Python.
#   IRR_VERIFY_OUT   output folder (default scripts/irr-verify/out, git-ignored)
#   IRR_PY           python interpreter with numpy and krippendorff installed
#   IRR_RLIB         extra R library path holding the irr package
#   IRR_ANALYSIS_PY  path to the classroom irr_analysis.py (optional)
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT="${IRR_VERIFY_OUT:-scripts/irr-verify/out}"
PY="${IRR_PY:-python3}"
node scripts/irr-verify/test.mjs
node scripts/irr-verify/gen.mjs "$OUT"
Rscript scripts/irr-verify/verify.R "$OUT"
"$PY" scripts/irr-verify/verify.py "$OUT"
node scripts/irr-verify/compare.mjs "$OUT"
