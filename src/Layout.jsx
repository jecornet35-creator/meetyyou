import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

export default function Layout({ children, currentPageName }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      setAuthChecked(true);

      // Pages accessibles sans connexion
      const publicPages = ['Landing'];

      if (!auth && !publicPages.includes(currentPageName)) {
        window.location.href = createPageUrl('Landing');
      }

      // Si connecté et sur Landing, rediriger vers Home
      if (auth && currentPageName === 'Landing') {
        window.location.href = createPageUrl('Home');
      }
    });
  }, [currentPageName]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}