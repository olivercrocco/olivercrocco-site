// Hydrates the publications list that Astro rendered at build time. A bundled
// module script, so it passes the site's script-src 'self' CSP.
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import PublicationsBrowser from "../components/interactive/PublicationsBrowser";
import { buildStreams } from "../data/selectedPublications";

const root = document.getElementById("pubs-root");
if (root) hydrateRoot(root, createElement(PublicationsBrowser, { streams: buildStreams() }));
