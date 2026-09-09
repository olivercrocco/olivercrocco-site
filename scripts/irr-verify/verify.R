# Recompute every statistic in R with the irr package (kripp.alpha,
# kappam.fleiss, kappa2) plus a from-scratch mean pairwise agreement.
# Run: Rscript scripts/irr-verify/verify.R <outdir>   (IRR_RLIB adds a library path)
args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args)) args[1] else "scripts/irr-verify/out"
rlib <- Sys.getenv("IRR_RLIB")
if (nzchar(rlib)) .libPaths(c(rlib, .libPaths()))
suppressPackageStartupMessages({ library(irr); library(irrCAC); library(jsonlite) })

# irr::kripp.alpha weights each unit's pairs by 1/(m - 1) only when the matrix
# holds an NA; with no NA at all it uses a weight of 1 (`mc <- rep(1, ...)`),
# which is right for two raters and wrong for three or more. Appending a rater
# who coded nothing forces the general branch without adding a single pair, so
# the function's own arithmetic then gives Krippendorff's value. The unpatched
# result is kept as *Raw so the comparison can document the discrepancy.
force_general <- function(m) if (any(is.na(m))) m else rbind(m, NA_real_)

ds <- fromJSON(file.path(out, "datasets.json"), simplifyVector = FALSE)

mean_pairwise <- function(m) {
  agree <- 0; pairs <- 0
  for (i in seq_len(ncol(m))) {
    v <- m[, i]; v <- v[!is.na(v)]
    if (length(v) < 2) next
    cb <- combn(v, 2)
    pairs <- pairs + ncol(cb)
    agree <- agree + sum(cb[1, ] == cb[2, ])
  }
  if (pairs == 0) NA else agree / pairs
}
num <- function(x) if (is.null(x) || length(x) == 0 || is.na(x) || !is.finite(x)) NA else as.numeric(x)

res <- lapply(ds, function(d) {
  m <- matrix(NA_real_, nrow = d$R, ncol = d$N)
  for (r in seq_len(d$R)) for (i in seq_len(d$N)) {
    v <- d$cells[[r]][[i]]
    if (!is.null(v)) m[r, i] <- v + 1
  }
  ka <- function(method) num(tryCatch(kripp.alpha(force_general(m), method)$value, error = function(e) NA))
  kaRaw <- function(method) num(tryCatch(kripp.alpha(m, method)$value, error = function(e) NA))
  # Gwet's irrCAC: subjects x raters, NA for missing. "unweighted" is nominal alpha;
  # "quadratic" weights are compared against the interval metric as a soft check.
  cac <- function(w) num(tryCatch(krippen.alpha.raw(t(m), weights = w)$est$coeff.val, error = function(e) NA))
  counts <- colSums(!is.na(m)); use <- counts >= 2
  fl <- NA; flCac <- NA
  if (any(use) && length(unique(counts[use])) == 1) {
    mm <- unique(counts[use])
    subj <- do.call(rbind, lapply(which(use), function(i) { v <- m[, i]; v[!is.na(v)] }))
    fl <- num(tryCatch(kappam.fleiss(subj)$value, error = function(e) NA))
    flCac <- num(tryCatch(fleiss.kappa.raw(subj)$est$coeff.val, error = function(e) NA))
  } else flCac <- NA
  pairs <- list()
  for (a in seq_len(d$R - 1)) for (b in (a + 1):d$R) {
    x <- cbind(m[a, ], m[b, ]); x <- x[complete.cases(x), , drop = FALSE]
    k <- if (nrow(x) >= 2) num(tryCatch(kappa2(x)$value, error = function(e) NA)) else NA
    po <- if (nrow(x) >= 2) mean(x[, 1] == x[, 2]) else NA
    pairs[[length(pairs) + 1]] <- list(a = a - 1, b = b - 1, kappa = k, po = po, n = nrow(x))
  }
  perCode <- lapply(seq_len(d$K), function(k) {
    b <- ifelse(is.na(m), NA, ifelse(m == k, 1, 2))
    num(tryCatch(kripp.alpha(force_general(b), "nominal")$value, error = function(e) NA))
  })
  list(id = d$id, complete = !any(is.na(m)),
       alphaNominal = ka("nominal"), alphaOrdinal = ka("ordinal"), alphaInterval = ka("interval"),
       alphaNominalRaw = kaRaw("nominal"), alphaOrdinalRaw = kaRaw("ordinal"), alphaIntervalRaw = kaRaw("interval"),
       cacNominal = cac("unweighted"), cacQuadratic = cac("quadratic"), cacFleiss = flCac,
       fleiss = fl, meanPairwise = num(mean_pairwise(m)), pairs = pairs, perCode = perCode)
})
write_json(res, file.path(out, "r.json"), auto_unbox = TRUE, digits = NA, na = "null")
cat("wrote R results for", length(res), "datasets to", file.path(out, "r.json"), "\n")
