import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const el = document.getElementById('main-scroll-container');
    if (el) el.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
