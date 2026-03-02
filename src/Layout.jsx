import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

const SEO_CONFIG = {
  default: {
    title: 'Meetyyou – Site de rencontre sérieux pour francophones',
    description: 'Rencontrez des célibataires francophones vérifiés en France, Belgique, Suisse, Canada, Maroc et Afrique. Messagerie sécurisée, profils authentiques.',
    keywords: 'site de rencontre, rencontre sérieuse, célibataires, rencontre france, rencontre belgique, rencontre suisse, rencontre québec, rencontre maroc, dating francophone',
  },
  Landing: {
    title: 'Meetyyou – Trouvez l\'amour parmi des célibataires francophones',
    description: 'Rejoignez Meetyyou gratuitement. Des milliers de célibataires en France, Belgique, Suisse, Canada, Maroc et Afrique vous attendent. Rencontres sérieuses et authentiques.',
    keywords: 'site de rencontre gratuit, inscription rencontre, célibataires france belgique suisse canada maroc',
  },
  Home: {
    title: 'Meetyyou – Découvrez des profils près de chez vous',
    description: 'Parcourez des profils vérifiés de célibataires francophones. Likez, chattez et trouvez votre âme sœur sur Meetyyou.',
    keywords: 'profils célibataires, rencontre en ligne, trouver l\'amour, chat rencontre',
  },
  TermsOfService: {
    title: 'Conditions d\'utilisation – Meetyyou',
    description: 'Lisez les conditions générales d\'utilisation de Meetyyou. Conformité RGPD, DSA, CCPA et protection des données.',
    keywords: 'conditions utilisation meetyyou, rgpd, politique confidentialité',
  },
};

function injectSEO(pageName) {
  const config = SEO_CONFIG[pageName] || SEO_CONFIG.default;

  document.title = config.title;

  const setMeta = (name, content, property = false) => {
    const attr = property ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('description', config.description);
  setMeta('keywords', config.keywords);
  setMeta('robots', 'index, follow');
  setMeta('author', 'Meetyyou');
  setMeta('og:title', config.title, true);
  setMeta('og:description', config.description, true);
  setMeta('og:type', 'website', true);
  setMeta('og:site_name', 'Meetyyou', true);
  setMeta('og:locale', 'fr_FR', true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', config.title);
  setMeta('twitter:description', config.description);

  // Lang attribute
  document.documentElement.setAttribute('lang', 'fr');

  // Hreflang links
  const hreflangs = [
    { lang: 'fr', href: 'https://meetyyou.com/' },
    { lang: 'fr-FR', href: 'https://meetyyou.com/' },
    { lang: 'fr-BE', href: 'https://meetyyou.com/' },
    { lang: 'fr-CH', href: 'https://meetyyou.com/' },
    { lang: 'fr-CA', href: 'https://meetyyou.com/' },
    { lang: 'fr-MA', href: 'https://meetyyou.com/' },
    { lang: 'fr-CI', href: 'https://meetyyou.com/' },
    { lang: 'x-default', href: 'https://meetyyou.com/' },
  ];
  // Remove old hreflang links then re-add
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  hreflangs.forEach(({ lang, href }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.setAttribute('hreflang', lang);
    link.href = href;
    document.head.appendChild(link);
  });
}

export default function Layout({ children, currentPageName }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(auth => {
      setIsAuthenticated(auth);
      setAuthChecked(true);

      // Pages accessibles sans connexion
      const publicPages = ['Landing', 'TermsOfService'];

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