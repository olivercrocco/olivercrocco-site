/**
 * Site search in the header: a small trigger that grows into a search panel.
 *
 * Adapted from Watermelon UI's Command Search (MIT, ui.watermelon.sh): the
 * shared-layout morph from button to panel and the sectioned, keyboard-driven
 * results. Changes: real site content from /search-index.json (fetched on first
 * open), results are links, "/" or Cmd/Ctrl+K opens it (the original "F" key
 * fired while typing anywhere), combobox and listbox semantics, focus returns to
 * the trigger on close, the site's colors, and reduced motion respected.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";

interface SearchItem {
  section: string;
  title: string;
  detail: string;
  url: string;
  terms?: string;
  external?: boolean;
}

const SECTION_ORDER = ["Pages", "Publications", "Books", "Notes", "Tools", "Poems"];
const MAX_PER_SECTION = 5;
const quick = { type: "tween" as const, ease: "easeOut" as const, duration: 0.16 };

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
    <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12.6 12.6L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

function score(item: SearchItem, words: string[]): number {
  const title = item.title.toLowerCase();
  const all = `${title} ${item.detail.toLowerCase()} ${(item.terms ?? "").toLowerCase()}`;
  let s = 0;
  for (const w of words) {
    if (!all.includes(w)) return 0;
    s += title.startsWith(w) ? 4 : title.includes(w) ? 3 : 1;
  }
  return s;
}

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    setQuery("");
    if (returnFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  // Load the index the first time the panel opens.
  useEffect(() => {
    if (!open || items || failed) return;
    fetch("/search-index.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: SearchItem[]) => setItems(data))
      .catch(() => setFailed(true));
  }, [open, items, failed]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  // "/" or Cmd/Ctrl+K opens; Escape closes.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing = !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (!open && ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) {
        e.preventDefault();
        setOpen(true);
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const results = useMemo(() => {
    if (!items) return [];
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      // Before typing: the main pages and the newest notes.
      return [...items.filter((i) => i.section === "Pages").slice(0, 5), ...items.filter((i) => i.section === "Notes").slice(0, 3)];
    }
    const scored = items
      .map((item) => ({ item, s: score(item, words) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s);
    const out: SearchItem[] = [];
    for (const section of SECTION_ORDER) {
      out.push(...scored.filter((r) => r.item.section === section).slice(0, MAX_PER_SECTION).map((r) => r.item));
    }
    return out;
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (!r) return;
      if (r.external) {
        window.open(r.url, "_blank", "noopener");
        close();
      } else window.location.href = r.url;
    } else if (e.key === "Tab") {
      // Keep focus in the panel: results are reached with the arrow keys.
      e.preventDefault();
    }
  };

  const sections = SECTION_ORDER.map((name) => ({
    name,
    rows: results.map((item, index) => ({ item, index })).filter((r) => r.item.section === name),
  })).filter((s) => s.rows.length > 0);

  const listId = "site-search-results";
  const optionId = (i: number) => `site-search-opt-${i}`;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-[rgb(42_34_48_/_0.18)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quick}
            onClick={() => close()}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 h-9">
        <AnimatePresence mode="popLayout" initial={false}>
          {!open ? (
            <motion.button
              key="trigger"
              ref={triggerRef}
              type="button"
              layoutId="site-search"
              transition={quick}
              onClick={() => setOpen(true)}
              aria-label="Search the site"
              aria-keyshortcuts="/ Meta+K Control+K"
              className="flex h-9 items-center gap-2 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-paper)] px-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink-soft)] transition-colors md:w-44"
            >
              <motion.span layoutId="site-search-icon" transition={quick} className="flex">
                <SearchIcon className="h-4 w-4" />
              </motion.span>
              <span className="hidden md:inline text-[0.875rem]">Search</span>
              <kbd className="hidden md:inline ml-auto rounded border border-[var(--color-border-strong)] px-1.5 text-[0.7rem] leading-5 font-sans text-[var(--color-text-soft)]">
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              layoutId="site-search"
              transition={quick}
              role="dialog"
              aria-modal="true"
              aria-label="Search the site"
              className="fixed left-3 right-3 top-3 md:absolute md:left-auto md:-top-2 md:right-[-0.5rem] md:w-[30rem] flex flex-col overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-paper)] shadow-[0_24px_60px_-20px_rgb(42_34_48_/_0.35)]"
            >
              <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
                <motion.span layoutId="site-search-icon" transition={quick} className="flex text-[var(--color-text-muted)]">
                  <SearchIcon className="h-[1.1rem] w-[1.1rem]" />
                </motion.span>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={onInputKey}
                  placeholder="Search publications, books, notes, tools…"
                  aria-label="Search the site"
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls={listId}
                  aria-activedescendant={results.length ? optionId(active) : undefined}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-[1rem] text-[var(--color-text)] placeholder:text-[var(--color-text-soft)] outline-none"
                />
                <button
                  type="button"
                  onClick={() => close()}
                  className="rounded border border-[var(--color-border-strong)] px-1.5 text-[0.7rem] leading-5 text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
                >
                  Esc
                </button>
              </div>

              <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain p-1.5">
                {failed ? (
                  <p className="px-3 py-10 text-center text-sm text-[var(--color-text-muted)]">
                    Search could not load. Try reloading the page.
                  </p>
                ) : !items ? (
                  <p className="px-3 py-10 text-center text-sm text-[var(--color-text-muted)]">Loading…</p>
                ) : results.length === 0 ? (
                  <p className="px-3 py-10 text-center text-sm text-[var(--color-text-muted)]">
                    Nothing matches &ldquo;{query}&rdquo;. Try fewer words, or browse{" "}
                    <a href="/publications/">all publications</a>.
                  </p>
                ) : (
                  sections.map((section) => (
                    <div key={section.name} role="group" aria-label={section.name} className="py-1">
                      <p className="px-3 pt-2 pb-1 text-[0.75rem] font-medium text-[var(--color-text-muted)]">{section.name}</p>
                      {section.rows.map(({ item, index }) => {
                        const isActive = index === active;
                        return (
                          <a
                            key={`${item.url}-${item.title}`}
                            id={optionId(index)}
                            data-index={index}
                            role="option"
                            aria-selected={isActive}
                            href={item.url}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            onMouseMove={() => setActive(index)}
                            onClick={() => close(false)}
                            // Inline because the site's base link rule outranks utility classes.
                            style={{ textDecoration: "none" }}
                            className={`block rounded-md px-3 py-2 ${
                              isActive ? "bg-[var(--color-paper-warm)]" : ""
                            }`}
                          >
                            <span className="block text-[0.9375rem] leading-snug text-[var(--color-text)]">
                              {item.title}
                              {item.external && <span className="sr-only"> (opens the publisher's page)</span>}
                            </span>
                            <span className="block truncate text-[0.8125rem] text-[var(--color-text-muted)]">{item.detail}</span>
                          </a>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
