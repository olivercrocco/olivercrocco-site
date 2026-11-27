// Mounts the header search box. A bundled module script, so it passes the
// site's script-src 'self' CSP (Astro's own island loader would be inline).
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import SiteSearch from "../components/interactive/SiteSearch";

const el = document.getElementById("site-search");
if (el) createRoot(el).render(createElement(SiteSearch));
