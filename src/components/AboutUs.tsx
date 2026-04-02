import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ShieldCheck, DollarSign, Shield, TrendingUp, Users, Mail } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

export default function AboutUs({ onBack }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans text-neutral-900">
      {/* Header Section */}
      <header className="bg-[#E88B00] text-white pt-16 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Heart className="fill-white text-white w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">Meetyyou</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Qui sommes-nous ?</h1>
          <p className="text-white/90 max-w-2xl mx-auto leading-relaxed text-lg">
            Une plateforme de rencontres francophones née d'une conviction simple : les rencontres
            authentiques méritent une plateforme honnête.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-8 pb-24 relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#E88B00] font-medium hover:text-[#CC7A00] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        {/* Mission Card */}
        <div className="bg-white rounded-xl p-8 md:p-12 mb-12 shadow-sm border border-neutral-100">
          <h2 className="text-2xl font-bold text-[#001F3F] mb-6">Notre mission</h2>
          <div className="space-y-6 text-neutral-600 leading-relaxed">
            <p>
              <span className="font-bold text-neutral-900">Meetyyou</span> est un site de rencontres sérieux destiné aux francophones du monde entier — en France, en Belgique, en Suisse, au Canada, au Maroc, et à travers toute l'Afrique francophone. Notre ambition : créer un espace de rencontre sincère, accessible et sécurisé, où chaque profil compte vraiment.
            </p>
            <p>
              Nous sommes une équipe passionnée basée à <span className="font-bold text-neutral-900">Antsiranana (Diégo Suarez), Madagascar</span>. Depuis le début, nous avons fait le choix de la transparence et de l'honnêteté comme fondements de notre plateforme.
            </p>
          </div>
        </div>

        {/* What sets us apart */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#001F3F] text-center mb-8">Ce qui nous distingue</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Authenticity */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-emerald-500 w-6 h-6" />
                <h3 className="text-lg font-bold text-neutral-900">Authenticité garantie</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Chaque profil sur Meetyyou représente une vraie personne. Nous refusons catégoriquement le recours aux faux comptes ou aux bots pour simuler une activité. Ce que vous voyez est réel — des célibataires sincères qui cherchent, comme vous, une rencontre authentique.
              </p>
            </div>

            {/* Honest Pricing */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="text-[#E88B00] w-6 h-6" />
                <h3 className="text-lg font-bold text-neutral-900">Des tarifs honnêtes</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Trouver l'amour ne devrait pas vider votre portefeuille. Notre équipe est basée à Madagascar, où le coût de la vie est bien inférieur à l'Europe. Nous vous répercutons ces économies directement : toutes les fonctionnalités premium à un prix accessible. Un tarif bas n'est pas synonyme de basse qualité — c'est notre engagement.
              </p>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-blue-500 w-6 h-6" />
                <h3 className="text-lg font-bold text-neutral-900">Sécurité et confidentialité</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed text-sm">
                La protection de vos données est une priorité. Notre plateforme est sécurisée, vos informations personnelles sont traitées avec le plus grand respect, et notre système de modération veille en permanence à maintenir un environnement sain et respectueux pour tous les membres.
              </p>
            </div>

            {/* Evolution */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-100">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="text-purple-500 w-6 h-6" />
                <h3 className="text-lg font-bold text-neutral-900">Une plateforme en évolution</h3>
              </div>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Meetyyou est vivant et grandit grâce à vous. Vos retours, suggestions et signalements de bugs nous permettent d'améliorer l'expérience chaque semaine. Vous n'êtes pas de simples utilisateurs — vous êtes les co-constructeurs de la plateforme.
              </p>
            </div>
          </div>
        </div>

        {/* Pioneers Banner */}
        <div className="bg-[#FFF8E7] border border-[#F2D7A5] rounded-xl p-8 text-center mb-12">
          <Users className="text-[#E88B00] mx-auto mb-4 w-8 h-8" />
          <h2 className="text-xl font-bold text-[#8B5A2B] mb-4">Rejoignez les pionniers</h2>
          <p className="text-[#5C4033] leading-relaxed max-w-2xl mx-auto">
            Meetyyou est encore jeune — et c'est une chance unique. Les <span className="font-bold">500 premiers inscrits</span> bénéficient de <span className="font-bold">3 mois Premium gratuits</span> et reçoivent le badge exclusif 🥇 <span className="font-bold">Pionnier</span>. En rejoignant maintenant, vous contribuez directement à façonner l'avenir de la plateforme.
          </p>
        </div>

        {/* Contact Footer */}
        <div className="text-center text-sm text-neutral-500 space-y-2">
          <div className="flex items-center justify-center gap-2 text-[#E88B00]">
            <Mail className="w-4 h-4" />
            <a href="mailto:contact@meetyyou.com" className="hover:underline">contact@meetyyou.com</a>
          </div>
          <p>SPHERE Sarl — Lot 0422 Bis ML 201, Antsiranana Diégo Suarez, Madagascar</p>
        </div>
      </main>
    </div>
  );
}
