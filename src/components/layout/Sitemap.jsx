import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { createPageUrl } from '@/utils';

const LINK_MAP = {
  "Conditions d'utilisation": createPageUrl('TermsOfService'),
  "Centre d'aide": createPageUrl('Help'),
  "Contacter nous": createPageUrl('Help'),
  "Plans & tarifs": createPageUrl('SubscriptionPlans'),
  "Premium": createPageUrl('SubscriptionPlans'),
  "VIP": createPageUrl('SubscriptionPlans'),
};

const SITEMAP = [
  {
    title: 'Découvrir',
    links: ['Accueil', 'Recherche avancée', 'Profils en vedette', 'Nouvelles rencontres', 'Profils vérifiés'],
  },
  {
    title: 'Mon compte',
    links: ['Mon profil', 'Mes photos', 'Mes favoris', 'Mes messages', 'Mes likes', 'Paramètres'],
  },
  {
    title: 'Abonnements',
    links: ['Plans & tarifs', 'Premium', 'VIP', 'Pack Booster', 'Politique de remboursement'],
  },
  {
    title: 'Aide & Légal',
    links: ['Centre d\'aide', 'Contacter nous', 'Conditions d\'utilisation', 'Confidentialité', 'Politique de cookies', 'Sécurité', 'Règles de communauté'],
  },
  {
    title: 'À propos',
    links: ['Qui sommes-nous', 'Notre histoire', 'Témoignages', 'Affiliés', 'Autres sites', 'Compagnie'],
  },
];

export default function Sitemap() {
  return (
    <div className="bg-gray-950 text-gray-400 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Heart className="w-6 h-6 fill-amber-500 text-amber-500" />
          <span className="font-bold text-white text-lg">Meetyyou</span>
          <span className="text-gray-600 text-sm ml-2">— Plan du site</span>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-8">
          {SITEMAP.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    {LINK_MAP[link] ? (
                      <Link to={LINK_MAP[link]} className="text-xs text-gray-500 hover:text-amber-400 transition-colors">
                        {link}
                      </Link>
                    ) : (
                      <a href="#" className="text-xs text-gray-500 hover:text-amber-400 transition-colors">
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} Meetyyou — SDL Networks Limited, 71 Tower Road, SLM 1609, Sliema, Malta, reg. C70898
        </div>
      </div>
    </div>
  );
}