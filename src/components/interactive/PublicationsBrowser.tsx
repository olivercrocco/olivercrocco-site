/**
 * Selected publications with stream tabs and a copy-citation button.
 *
 * Adapted from two Watermelon UI components (MIT, ui.watermelon.sh): the sliding
 * indicator from Fluid Tabs and the copy-to-check morph from Reveal Copy. Restyled
 * to the site's tokens, given tab semantics and arrow-key movement, and set to
 * follow the visitor's reduced-motion setting.
 *
 * Rendered to HTML at build time (so the list is in the page for readers and
 * search engines) and hydrated by src/scripts/publications.ts.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import type { SelectedPub } from "../../data/selectedPublications";

export interface Stream {
  id: string;
  title: string;
  short: string;
  pubs: (SelectedPub & { apaText: string; apaHtml: string })[];
}

interface Props {
  streams: Stream[];
}

const ALL = "all";

export default function PublicationsBrowser({ streams }: Props) {
  const [active, setActive] = useState<string>(ALL);
  // Bumped when the stream comes from the link, so the list switches at once
  // instead of animating the other streams out.
  const [epoch, setEpoch] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Fixed ids, not useId(): the build-time HTML and the hydrated tree must agree,
  // and there is only ever one of these on a page.
  const uid = "pubs";
  const total = streams.reduce((n, s) => n + s.pubs.length, 0);

  const tabs = [
    { id: ALL, label: "All", count: total },
    ...streams.map((s) => ({ id: s.id, label: s.short, count: s.pubs.length })),
  ];

  // Read ?stream= after hydration so the build-time HTML (always "All") matches.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("stream");
    if (fromUrl && fromUrl !== ALL && tabs.some((t) => t.id === fromUrl)) {
      setActive(fromUrl);
      setEpoch(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (id: string) => {
    setActive(id);
    const url = new URL(window.location.href);
    if (id === ALL) url.searchParams.delete("stream");
    else url.searchParams.set("stream", id);
    window.history.replaceState(null, "", url);
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  const shown = active === ALL ? streams : streams.filter((s) => s.id === active);

  return (
    <MotionConfig reducedMotion="user">
      <div className="border-b border-[var(--color-border-strong)] mb-12 -mx-6 px-6 md:mx-0 md:px-0">
      <div
        role="tablist"
        aria-label="Filter publications by research stream"
        className="flex gap-x-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] md:flex-wrap md:overflow-visible"
      >
        {tabs.map((t, i) => {
          const selected = active === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${uid}-tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`relative shrink-0 whitespace-nowrap px-3 py-3 text-[0.9375rem] tracking-tight transition-colors ${
                selected
                  ? "text-[var(--color-ink)] font-medium"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[var(--color-text-soft)] tabular-nums">{t.count}</span>
              {selected && (
                <motion.span
                  layoutId={`${uid}-indicator`}
                  className="absolute left-2 right-2 bottom-0 h-[2px] bg-[var(--color-gold)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`}>
        <AnimatePresence key={epoch} mode="popLayout" initial={false}>
          {shown.map((s) => (
            <motion.section
              key={s.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mb-16"
              aria-labelledby={`${uid}-h-${s.id}`}
            >
              <h2
                id={`${uid}-h-${s.id}`}
                className="font-display text-2xl md:text-3xl font-semibold tracking-tight pb-4 mb-2 border-b border-[var(--color-border-strong)] leading-tight"
              >
                {s.title}
              </h2>
              <ol className="divide-y divide-[var(--color-border)]">
                {s.pubs.map((p) => (
                  <li key={p.url} className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8">
                      <p className="font-display text-[1.0625rem] leading-snug text-[var(--color-text)] mb-2">
                        {p.citation}
                      </p>
                      <p className="text-sm italic text-[var(--color-text-muted)] mb-3">{p.venue}</p>
                      {p.award && (
                        <p className="text-xs uppercase tracking-wider text-[var(--color-gold-text)] font-medium mb-3">
                          ★ {p.awardUrl ? <a href={p.awardUrl}>{p.award}</a> : p.award}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <a
                          href={p.url}
                          className="text-sm text-[var(--color-ink)] tracking-tight font-mono break-all"
                        >
                          {p.url.replace(/^https?:\/\//, "")}
                        </a>
                        <CopyCitation text={p.apaText} html={p.apaHtml} />
                      </div>
                    </div>
                    {p.note && (
                      <div className="md:col-span-4 md:border-l md:border-[var(--color-border-strong)] md:pl-6">
                        <p className="text-[var(--color-text-muted)] text-[0.9375rem] leading-relaxed">{p.note}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

function legacyCopy(html: string): boolean {
  const holder = document.createElement("div");
  holder.innerHTML = html;
  holder.setAttribute("aria-hidden", "true");
  Object.assign(holder.style, { position: "fixed", left: "-9999px", top: "0", whiteSpace: "pre-wrap" });
  document.body.appendChild(holder);
  const range = document.createRange();
  range.selectNodeContents(holder);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  sel?.removeAllRanges();
  holder.remove();
  return ok;
}

/** Copies the APA reference; the icon morphs to a check, as in Watermelon's Reveal Copy. */
function CopyCitation({ text, html }: { text: string; html: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(t);
  }, [state]);

  const copy = async () => {
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/plain": new Blob([text], { type: "text/plain" }),
            "text/html": new Blob([html], { type: "text/html" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setState("copied");
    } catch {
      // Some browsers and embedded views refuse the async clipboard. Fall back to
      // selecting a hidden copy and the older copy command, which keeps the italics.
      setState(legacyCopy(html) ? "copied" : "failed");
    }
  };

  const label = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : "Copy APA citation";

  return (
    <button
      type="button"
      onClick={copy}
      className="copy-cite inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors"
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "copied" ? (
            <motion.svg
              key="check"
              viewBox="0 0 16 16"
              className="h-4 w-4 text-[var(--color-gold-text)]"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <path d="M3 8.5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              viewBox="0 0 16 16"
              className="h-4 w-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28 }}
            >
              <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 3.5V3A1.5 1.5 0 0 0 9 1.5H3A1.5 1.5 0 0 0 1.5 3v6A1.5 1.5 0 0 0 3 10.5h.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span aria-live="polite">{label}</span>
    </button>
  );
}
