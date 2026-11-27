// Mounts this week's card deck on /poetry-of-work and hides the plain grid it
// replaces. A bundled module script, so it passes the site's script-src 'self' CSP.
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import CardDeck from "../components/interactive/CardDeck";

const el = document.getElementById("pow-deck");
const grid = document.getElementById("pow-week-grid");
if (el && grid) {
  const cards = JSON.parse(el.dataset.cards ?? "[]") as string[];
  const alts = JSON.parse(el.dataset.alts ?? "[]") as string[];
  if (cards.length > 1) {
    createRoot(el).render(createElement(CardDeck, { cards, alts, group: el.dataset.group ?? "" }));
    grid.hidden = true;
    // With the deck in place, the sources sit beside it on wider screens.
    document
      .getElementById("pow-week")
      ?.classList.add("md:grid", "md:grid-cols-[minmax(0,420px)_minmax(0,1fr)]", "md:gap-14", "md:items-start");
  }
}
