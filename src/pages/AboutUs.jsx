import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, ShieldCheck, TrendingUp, DollarSign, Users, ArrowLeft, Mail } from 'lucide-react';

const VALUES = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-green-500" />,
    title: 'Authenticité garantie',
    description:
      'Chaque profil sur Meetyyou représente une vraie personne. Nous refusons catégoriquement le recours aux faux comptes ou aux bots pour simuler une activité. Ce que vous voyez est réel — des célibataires sincères qui cherchent, comme vous, une rencontre authentique.',
  },
  {
    icon: <DollarSign className="w-8 h-8 text-amber-500" />,
    title: 'Des tarifs honnêtes',
    description:
      "Trouver l'amour ne devrait pas vider votre portefeuille. Notre équipe est basée à Madagascar, où le coût de la vie est bien inférieur à l'Europe. Nous vous répercutons ces économies directement : toutes les fonctionnalités premium à un prix accessible. Un tarif bas n'est pas synonyme de basse qualité — c'est notre engagement.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
    title: 'Sécurité et confidentialité',
    description:
      "La protection de vos données est une priorité. Notre plateforme est sécurisée, vos informations personnelles sont traitées avec le plus grand respect, et notre système de modération veille en permanence à maintenir un environnement sain et respectueux pour tous les membres.",
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
    title: 'Une plateforme en évolution',
    description:
      'Meetyyou est vivant et grandit grâce à vous. Vos retours, suggestions et signalements de bugs nous permettent d\'améliorer l\'expérience chaque semaine. Vous n\'êtes pas de simples utilisateurs — vous êtes les co-constructeurs de la plateforme.',
  },
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Heart className="w-8 h-8 fill-white" />
            <span className="text-2xl font-bold">Meetyyou</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Qui sommes-nous ?</h1>
          <p className="text-amber-100 text-sm max-w-xl mx-auto">
            Une plateforme de rencontres francophones née d'une conviction simple : les rencontres authentiques méritent une plateforme honnête.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to={createPageUrl('Landing')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium mb-8">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {/* Intro */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Notre mission</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            <strong>Meetyyou</strong> est un site de rencontres sérieux destiné aux francophones du monde entier — en France, en Belgique, en Suisse, au Canada, au Maroc, et à travers toute l'Afrique francophone. Notre ambition : créer un espace de rencontre sincère, accessible et sécurisé, où chaque profil compte vraiment.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Nous sommes une équipe passionnée basée à <strong>Antsiranana (Diègo Suarez), Madagascar</strong>. Depuis le début, nous avons fait le choix de la transparence et de l'honnêteté comme fondements de notre plateforme.
          </p>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ce qui nous distingue</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {VALUES.map((v, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                {v.icon}
                <h3 className="font-bold text-gray-800 text-lg">{v.title}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Team / Pioneer */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-8 mb-10 text-center">
          <Users className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-amber-800 mb-2">Rejoignez les pionniers</h2>
          <p className="text-amber-700 text-sm leading-relaxed max-w-xl mx-auto">
            Meetyyou est encore jeune — et c'est une chance unique. Les <strong>500 premiers inscrits</strong> bénéficient de <strong>3 mois Premium gratuits</strong> et reçoivent le badge exclusif <strong>🥇 Pionnier</strong>. En rejoignant maintenant, vous contribuez directement à façonner l'avenir de la plateforme.
          </p>
        </div>

        {/* Contact */}
        <div className="text-center text-gray-500 text-sm space-y-2">
          <div className="flex justify-center items-center gap-2">
            <Mail className="w-4 h-4 text-amber-500" />
            <a href="mailto:contact@meetyyou.com" className="text-amber-600 hover:underline">contact@meetyyou.com</a>
          </div>
          <p>SPHERE Sarl — Lot 0422 Bis ML 201, Antsiranana Diègo Suarez, Madagascar</p>
        </div>
      </div>
    </div>
  );
}