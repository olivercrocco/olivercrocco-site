// Build a single-file, offline copy of the inter-rater reliability calculator
// from the same sources the site page uses (irr.js, irrUi.js, irr.css, and
// the markup fragment). The result runs from a local file with no network.
// Usage: node scripts/build-irr-standalone.mjs <output.html>
import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");
const css = read("src/styles/irr.css");
const app = read("src/components/irr-app.html");
const lib = read("src/lib/irr.js").replace(/^export\s+(const|function)\b/gm, "$1");
const ui = read("src/lib/irrUi.js").replace(/^import\s*\{[^}]*\}\s*from\s*"\.\/irr\.js";\s*/m, "");
for (const src of [lib, ui]) if (/<\/script/i.test(src)) throw new Error("script source contains a closing script tag");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inter-Rater Reliability Calculator</title>
<style>
:root{--color-paper:#F3EFEA;--color-paper-warm:#E9E2DA;--color-paper-deep:#DCD3C8;--color-ink:#34243A;--color-ink-light:#4A3550;--color-text:#2A2230;--color-text-muted:#645A63;--color-text-soft:#948A93;--color-gold:#B0613C;--color-rust:#8B3A1F;--color-border:rgba(52,36,58,.11);--color-border-strong:rgba(52,36,58,.2);--font-display:"Source Serif 4","Iowan Old Style",Georgia,serif;--font-sans:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;--font-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace}
html{background:var(--color-paper)}
body{margin:0;color:var(--color-text);font-family:var(--font-sans);line-height:1.55}
.irr-page{max-width:1400px;margin:0 auto;padding:1.5rem 1.25rem 4rem}
.irr-masthead{border-bottom:1px solid var(--color-border);margin-bottom:2rem;padding-bottom:1.25rem}
.irr-masthead h1{font-family:var(--font-display);font-size:2rem;font-weight:600;margin:0 0 .35rem;letter-spacing:-.01em}
.irr-masthead p{color:var(--color-text-muted);margin:0;max-width:72ch;font-size:.95rem}
.irr-masthead a{color:var(--color-gold)}
${css}
</style>
</head>
<body>
<div class="irr-page">
<header class="irr-masthead">
<h1>Inter-Rater Reliability Calculator</h1>
<p>Offline copy of the calculator at <a href="https://olivercrocco.com/irr-calculator">olivercrocco.com/irr-calculator</a>. Everything runs inside this file; nothing you enter leaves your computer.</p>
</header>
${app}
</div>
<script>
"use strict";
${lib}
${ui}
</script>
</body>
</html>
`;
const out = process.argv[2] || "irr-calculator-offline.html";
writeFileSync(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
