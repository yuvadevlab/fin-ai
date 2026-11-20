import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasOverflow: boolean;
  firstVisible: number;
  lastVisible: number;
}

/**
 * Hook providing deterministic card-by-card scrolling and boundary detection
 * for the AI Advisor transaction confirmation carousel.
 */
export function useCarouselScroll(itemCount: number) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [scrollState, setScrollState] = useState<CarouselScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
    hasOverflow: false,
    firstVisible: 0,
    lastVisible: Math.max(0, itemCount - 1),
  });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const hasOverflow = maxScroll > 4;
    const canScrollLeft = hasOverflow && scrollLeft > 4;
    const canScrollRight = hasOverflow && scrollLeft < maxScroll - 4;

    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) {
      setScrollState({
        canScrollLeft: false,
        canScrollRight: false,
        hasOverflow: false,
        firstVisible: 0,
        lastVisible: 0,
      });
      return;
    }

    const containerLeft = el.getBoundingClientRect().left;
    const containerRight = el.getBoundingClientRect().right;

    let first = 0;
    let last = children.length - 1;
    let foundFirst = false;

    children.forEach((child, idx) => {
      const rect = child.getBoundingClientRect();
      const isVisible = rect.right > containerLeft + 16 && rect.left < containerRight - 16;
      if (isVisible) {
        if (!foundFirst) {
          first = idx;
          foundFirst = true;
        }
        last = idx;
      }
    });

    setScrollState({
      canScrollLeft,
      canScrollRight,
      hasOverflow,
      firstVisible: first,
      lastVisible: last,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);
    Array.from(el.children).forEach((c) => ro.observe(c));

    let scrollTimeout: NodeJS.Timeout;
    const onScrollHandler = () => {
      updateScrollState();
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateScrollState, 150);
    };

    el.addEventListener("scroll", onScrollHandler, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScrollHandler);
      clearTimeout(scrollTimeout);
    };
  }, [updateScrollState, itemCount]);

  /** Scrolls precisely to the next card aligned to container edge */
  const handleNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    const containerLeft = el.getBoundingClientRect().left;
    const nextCard = children.find((c) => {
      const rect = c.getBoundingClientRect();
      return rect.left > containerLeft + 16;
    });

    if (nextCard) {
      const offset = nextCard.getBoundingClientRect().left - containerLeft;
      el.scrollBy({ left: offset, behavior: "smooth" });
    } else {
      el.scrollBy({ left: el.clientWidth, behavior: "smooth" });
    }
  };

  /** Scrolls precisely to the previous card aligned to container edge */
  const handlePrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;

    const containerLeft = el.getBoundingClientRect().left;
    const prevCards = children.filter((c) => {
      const rect = c.getBoundingClientRect();
      return rect.left < containerLeft - 16;
    });
    const targetCard = prevCards[prevCards.length - 1];

    if (targetCard) {
      const offset = targetCard.getBoundingClientRect().left - containerLeft;
      el.scrollBy({ left: offset, behavior: "smooth" });
    } else {
      el.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  return { scrollRef, scrollState, updateScrollState, handlePrev, handleNext };
}
