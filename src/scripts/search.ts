// Site search, loaded on first use. The header holds a plain button; the React
// search panel and its code load only when someone clicks it or presses "/" or
// Cmd/Ctrl+K. A bundled module script, so it passes the site's script-src 'self' CSP.

const host = document.getElementById("site-search");
const trigger = document.getElementById("site-search-trigger");
const kbd = document.getElementById("site-search-kbd");

if (kbd && !/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) kbd.textContent = "Ctrl K";

let loading: Promise<void> | null = null;

// Start fetching early when a pointer or focus lands on the button.
const prefetch = () => {
  void import("../components/interactive/SiteSearch");
};

function load(): Promise<void> {
  if (loading) return loading;
  window.removeEventListener("keydown", onKey);
  loading = Promise.all([
    import("react"),
    import("react-dom/client"),
    import("../components/interactive/SiteSearch"),
  ]).then(([React, ReactDOM, mod]) => {
    if (!host) return;
    ReactDOM.createRoot(host).render(React.createElement(mod.default, { initialOpen: true }));
  });
  return loading;
}

function onKey(e: KeyboardEvent) {
  const el = document.activeElement as HTMLElement | null;
  const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    void load();
  }
}

if (host && trigger) {
  trigger.addEventListener("click", () => void load());
  trigger.addEventListener("pointerenter", prefetch, { once: true });
  trigger.addEventListener("focus", prefetch, { once: true });
  window.addEventListener("keydown", onKey);
}
