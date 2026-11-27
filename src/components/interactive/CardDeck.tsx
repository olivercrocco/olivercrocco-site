/**
 * This week's Poetry of Work cards as a deck you can swipe or drag through.
 *
 * Adapted from Watermelon UI's Card Swipe (MIT, ui.watermelon.sh): the dragged
 * strip with velocity-based paging and the cards turning on their vertical axis
 * as they leave. Changes: the cards are the week's images at a width that fits
 * the screen; Previous and Next buttons, numbered position buttons, and arrow
 * keys do everything the swipe does; selecting a card opens the page's existing
 * full-size viewer; reduced motion respected.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "motion/react";

interface Props {
  cards: string[];
  alts: string[];
  /** The lightbox group these cards belong to (matches data-group on the page). */
  group: string;
}

const GAP = 16;
const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const SPRING = { type: "spring" as const, stiffness: 330, damping: 32 };

export default function CardDeck({ cards, alts, group }: Props) {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState(340);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);

  // Card width follows the space available, up to 420px.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.min(420, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const step = width + GAP;
  const go = (i: number) => setIndex(Math.max(0, Math.min(cards.length - 1, i)));

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -DRAG_BUFFER || info.velocity.x < -VELOCITY_THRESHOLD) go(index + 1);
    else if (info.offset.x > DRAG_BUFFER || info.velocity.x > VELOCITY_THRESHOLD) go(index - 1);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  };

  const openFull = (i: number) => {
    if (dragged.current) return;
    window.dispatchEvent(new CustomEvent("pow:open", { detail: { group, index: i } }));
  };

  return (
    <MotionConfig reducedMotion="user">
      <div ref={wrapRef} className="w-full max-w-[420px]">
        <div
          className="relative overflow-hidden rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-gold)]"
          style={{ width, height: width * 1.25 }}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`This week's poem cards. Card ${index + 1} of ${cards.length}. Use the arrow keys to move.`}
          onKeyDown={onKey}
        >
          <motion.div
            className="flex touch-pan-y"
            drag="x"
            dragConstraints={{ left: -step * (cards.length - 1), right: 0 }}
            dragElastic={0.18}
            style={{ gap: GAP, perspective: 1000, x }}
            onDragStart={() => {
              dragged.current = true;
            }}
            onPointerDown={() => {
              dragged.current = false;
            }}
            onDragEnd={onDragEnd}
            animate={{ x: -index * step }}
            transition={SPRING}
          >
            {cards.map((src, i) => (
              <DeckCard
                key={src}
                src={src}
                alt={alts[i]}
                i={i}
                x={x}
                step={step}
                width={width}
                current={i === index}
                onOpen={() => openFull(i)}
              />
            ))}
          </motion.div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Previous card"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:bg-[var(--color-paper-warm)] disabled:opacity-35 disabled:cursor-default"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="flex items-center gap-1.5" role="group" aria-label="Go to card">
            {cards.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Card ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    i === index ? "w-5 bg-[var(--color-ink)]" : "w-2 bg-[var(--color-border-strong)]"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === cards.length - 1}
            aria-label="Next card"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border-strong)] text-[var(--color-ink)] hover:bg-[var(--color-paper-warm)] disabled:opacity-35 disabled:cursor-default"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <p className="ml-auto text-sm text-[var(--color-text-muted)] tabular-nums" aria-live="polite">
            {index + 1} of {cards.length}
          </p>
        </div>
      </div>
    </MotionConfig>
  );
}

function DeckCard({
  src,
  alt,
  i,
  x,
  step,
  width,
  current,
  onOpen,
}: {
  src: string;
  alt: string;
  i: number;
  x: MotionValue<number>;
  step: number;
  width: number;
  current: boolean;
  onOpen: () => void;
}) {
  // As a card leaves to either side it turns away on its vertical axis.
  const rotateY = useTransform(x, [-(i + 1) * step, -i * step, -(i - 1) * step], [45, 0, -45], { clamp: false });
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      tabIndex={current ? 0 : -1}
      aria-hidden={current ? undefined : true}
      aria-label={`${alt}. Open full size.`}
      style={{ width, height: width * 1.25, rotateY, flexShrink: 0 }}
      className="block cursor-grab active:cursor-grabbing p-0 border-0 bg-transparent"
    >
      <img
        src={src}
        alt=""
        draggable={false}
        width={width}
        height={Math.round(width * 1.25)}
        className="h-full w-full select-none rounded border border-[var(--color-border-strong)] object-cover shadow-sm"
      />
    </motion.button>
  );
}
