"""Recompute the statistics in Python: Krippendorff's alpha (nominal, ordinal,
interval) with the `krippendorff` package, and, when IRR_ANALYSIS_PY points at
the classroom script irr_analysis.py, its alpha, Fleiss, Cohen, mean pairwise
agreement, one-against-all alpha, and a bootstrap with numpy's generator.

Run: python3 scripts/irr-verify/verify.py <outdir>
"""
import importlib.util
import json
import math
import os
import sys

import numpy as np
import krippendorff

out = sys.argv[1] if len(sys.argv) > 1 else "scripts/irr-verify/out"
ds = json.load(open(os.path.join(out, "datasets.json")))

oz = None
ap = os.environ.get("IRR_ANALYSIS_PY")
if ap and os.path.exists(ap):
    spec = importlib.util.spec_from_file_location("irr_analysis", ap)
    oz = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(oz)


def nz(v):
    if v is None:
        return None
    v = float(v)
    return None if (math.isnan(v) or math.isinf(v)) else v


res = []
for d in ds:
    K, R, N = d["K"], d["R"], d["N"]
    arr = np.full((R, N), np.nan)
    for r in range(R):
        for i in range(N):
            v = d["cells"][r][i]
            if v is not None:
                arr[r, i] = v + 1

    def ka(level):
        try:
            return nz(krippendorff.alpha(reliability_data=arr, level_of_measurement=level))
        except Exception:
            return None

    rec = {"id": d["id"], "alphaNominal": ka("nominal"), "alphaOrdinal": ka("ordinal"), "alphaInterval": ka("interval")}

    if oz is not None:
        codes = tuple(str(k + 1) for k in range(K))
        oz.CODES = codes
        cols = [[str(int(arr[r, i])) for r in range(R) if not np.isnan(arr[r, i])] for i in range(N)]
        rows = [[(str(int(arr[r, i])) if not np.isnan(arr[r, i]) else None) for i in range(N)] for r in range(R)]
        rec["ozAlphaNominal"] = nz(oz.krippendorff_alpha(cols))
        fk, note = oz.fleiss_kappa(cols)
        rec["ozFleiss"] = nz(fk)
        rec["ozFleissIncomplete"] = bool(note and "varies" in note)
        rec["ozMeanPairwise"] = nz(oz.mean_pairwise(cols))
        pairs = []
        for a in range(R):
            for b in range(a + 1, R):
                ck = oz.cohen_kappa(rows[a], rows[b])
                pairs.append({"a": a, "b": b, "kappa": nz(ck["kappa"]) if ck else None,
                              "po": nz(ck["po"]) if ck else None, "n": ck["n"] if ck else 0})
        rec["ozPairs"] = pairs
        rec["ozPerCode"] = [nz(oz.alpha_binary(cols, codes[k])) for k in range(K)]
        if d["id"] < 9:
            usable = [c for c in cols if len(c) >= 2]
            rng = np.random.default_rng(7)
            vals = []
            for _ in range(6000):
                idx = rng.integers(0, len(usable), len(usable))
                a = oz.krippendorff_alpha([usable[j] for j in idx])
                if a is not None:
                    vals.append(a)
            vals.sort()
            rec["ozBoot"] = {"lo": vals[int(0.025 * len(vals))], "hi": vals[int(0.975 * len(vals))]}
    res.append(rec)

json.dump(res, open(os.path.join(out, "py.json"), "w"))
print(f"wrote Python results for {len(res)} datasets to {out}/py.json" + ("" if oz else " (classroom script not loaded)"))
