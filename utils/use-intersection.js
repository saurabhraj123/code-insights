import { useEffect, useState, useRef } from "react";

export default function useIntersection({
  rootMargin = "200px",
  threshold = 0,
  root = null,
}) {
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
      },
      {
        rootMargin,
        threshold,
        root,
      }
    );

    const currentElement = elementRef.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [rootMargin, threshold, root]);

  return [elementRef, entry?.isIntersecting];
}
