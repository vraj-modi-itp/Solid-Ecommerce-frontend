import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // The timeout forces the browser to wait until the new DOM is fully painted
    const scrollDelay = setTimeout(() => {
      // 'instant' prevents smooth scrolling so the user doesn't see the page fly up
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Fallback for certain mobile browsers (like iOS Safari)
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);

    // Cleanup the timeout if the user clicks incredibly fast
    return () => clearTimeout(scrollDelay);
  }, [pathname]);

  return null;
}