import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 *
 * Automatically resets the browser window scroll position to the top
 * whenever the route pathname changes in React Router.
 *
 * Uses `behavior: 'instant'` to immediately jump to (0, 0) without
 * animating or conflicting with CSS `scroll-behavior: smooth`.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant',
        });
      } catch {
        // Fallback for browsers without ScrollToOptions support
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  return null;
}
