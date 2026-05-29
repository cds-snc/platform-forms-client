import { useEffect, useRef, RefObject } from "react";
import { INFINITE_SCROLL_ROOT_MARGIN } from "../constants";

interface UseInfiniteScrollProps {
  displayedCount: number;
  totalCount: number;
  onLoadMore: () => void;
}

/**
 * Custom hook to handle infinite scroll with Intersection Observer
 * @returns ref to attach to the sentinel element
 */
export function useInfiniteScroll({
  displayedCount,
  totalCount,
  onLoadMore,
}: UseInfiniteScrollProps): RefObject<HTMLDivElement | null> {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && displayedCount < totalCount) {
          onLoadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: INFINITE_SCROLL_ROOT_MARGIN,
        threshold: 0,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [displayedCount, totalCount, onLoadMore]);

  return loadMoreRef;
}
