import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  hasOverflow: boolean;
  firstVisible: number;
  lastVisible: number;
}

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
    const hasOverflow = maxScroll > 8;
    const canScrollLeft = hasOverflow && scrollLeft > 8;
    const canScrollRight = hasOverflow && scrollLeft < maxScroll - 8;

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
      const isVisible = rect.right > containerLeft + 20 && rect.left < containerRight - 20;
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
    return () => ro.disconnect();
  }, [updateScrollState, itemCount]);

  const handlePrev = () => {
    scrollRef.current?.scrollBy({
      left: -Math.max(260, Math.floor((scrollRef.current?.clientWidth || 300) * 0.6)),
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    scrollRef.current?.scrollBy({
      left: Math.max(260, Math.floor((scrollRef.current?.clientWidth || 300) * 0.6)),
      behavior: "smooth",
    });
  };

  return { scrollRef, scrollState, updateScrollState, handlePrev, handleNext };
}
