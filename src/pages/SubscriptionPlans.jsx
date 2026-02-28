import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, Zap, Crown, Star, Heart, MessageCircle, Eye, Filter, Rocket, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePlan } from '@/components/premium/usePlan';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'booster',
    name: 'Pack Booster',
    price: 5,
    period: '/ 10 boosts',
    color: 'border-orange-300 shadow-orange-100 shadow-lg',
    headerColor: 'bg-gradient-to-br from-orange-400 to-amber-500',
    badge: 'À la carte',
    icon: Rocket,
    iconColor: 'text-white',
    description: '10 boosts à utiliser à volonté',
    isOneTime: true,
    features: [
      { label: '10 boosts de profil', included: true },
      { label: 'Valable sans abonnement', included: true },
      { label: 'Visibilité 24h par boost', included: true },
      { label: 'Profil "À la une"', included: true },
      { label: 'Messages illimités', included: false },
      { label: 'Voir qui vous a liké', included: false },
      { label: 'Filtres avancés', included: false },
      { label: 'Badge VIP', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 9.99,
    priceAnnual: 7.99,
    period: '/ mois',
    color: 'border-amber-400 shadow-amber-100 shadow-xl',
    headerColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
    badge: 'Plus populaire',
    icon: Zap,
    iconColor: 'text-white',
    description: 'Toutes les fonctionnalités essentielles',
    features: [
      { label: 'Créer un profil', included: true },
      { label: '50 likes par jour', included: true },
      { label: 'Envoyer des messages illimités', included: true },
      { label: 'Voir qui vous a liké', included: true },
      { label: 'Filtres de recherche avancés', included: true },
      { label: 'Profil mis en avant', included: true },
      { label: 'Boost de profil', included: false },
      { label: 'Badge VIP', included: false },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 19.99,
    priceAnnual: 15.99,
    period: '/ mois',
    color: 'border-purple-400 shadow-purple-100 shadow-lg',
    headerColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
    badge: 'Tout inclus',
    icon: Crown,
    iconColor: 'text-yellow-300',
    description: 'L\'expérience ultime',
    features: [
      { label: 'Créer un profil', included: true },
      { label: 'Likes illimités', included: true },
      { label: 'Envoyer des messages illimités', included: true },
      { label: 'Voir qui vous a liké', included: true },
      { label: 'Filtres de recherche avancés', included: true },
      { label: 'Profil mis en avant', included: true },
      { label: '3 boosts de profil / semaine', included: true },
      { label: 'Badge VIP exclusif', included: true },
    ],
  },
];

const FEATURE_HIGHLIGHTS = [
  { icon: MessageCircle, title: 'Messages illimités', desc: 'Communiquez sans restriction avec tous les profils', plan: 'Premium' },
  { icon: Eye, title: 'Qui vous a liké', desc: 'Découvrez tous les profils qui ont aimé le vôtre', plan: 'Premium' },
  { icon: Filter, title: 'Filtres avancés', desc: 'Affinez votre recherche avec des critères précis', plan: 'Premium' },
  { icon: Rocket, title: 'Boost de profil', desc: 'Apparaissez en tête des résultats pendant 24h', plan: 'VIP' },
  { icon: Crown, title: 'Badge VIP', desc: 'Un badge exclusif qui vous distingue', plan: 'VIP' },
  { icon: Shield, title: 'Profil prioritaire', desc: 'Votre profil est mis en avant dans les résultats', plan: 'Premium' },
];

export default function SubscriptionPlans() {
  const [billing, setBilling] = useState('monthly');
  const queryClient = useQueryClient();
  const { plan: currentPlan, subscription } = usePlan();

  const subscribeMutation = useMutation({
    mutationFn: async (planId) => {
      const user = await base44.auth.me();
      // Cancel existing if any
      if (subscription?.id) {
        await base44.entities.Subscription.update(subscription.id, { status: 'cancelled' });
      }
      if (planId === 'free') return null;
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + (billing === 'annual' ? 12 : 1));
      return base44.entities.Subscription.create({
        user_email: user.email,
        plan: planId,
        status: 'active',
        start_date: now.toISOString(),
        end_date: end.toISOString(),
        amount: billing === 'annual'
          ? (planId === 'premium' ? 7.99 : 15.99) * 12
          : (planId === 'premium' ? 9.99 : 19.99),
        currency: 'EUR',
        auto_renew: true,
      });
    },
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] });
      toast.success(planId === 'free' ? 'Retour au plan gratuit' : `Abonnement ${planId} activé avec succès !`);
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choisissez votre offre</h1>
          <p className="text-gray-500 text-lg">Trouvez l'amour plus facilement avec nos fonctionnalités premium</p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 mt-6 bg-white rounded-full px-2 py-2 shadow-sm border border-gray-200">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === 'annual' ? 'bg-amber-500 text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Annuel
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isActive = currentPlan === plan.id;
            const price = billing === 'annual' && plan.priceAnnual ? plan.priceAnnual : plan.price;

            return (
              <div key={plan.id} className={`relative bg-white rounded-2xl border-2 overflow-hidden flex flex-col ${plan.color}`}>
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-white text-amber-600 text-xs font-bold px-3 py-1 rounded-full shadow">
                    {plan.badge}
                  </div>
                )}
                {/* Header */}
                <div className={`${plan.headerColor} p-6 text-center`}>
                  <div className={`w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3`}>
                    <Icon className={`w-7 h-7 ${plan.id === 'free' ? 'text-gray-500' : 'text-white'}`} />
                  </div>
                  <h2 className={`text-2xl font-bold ${plan.id === 'free' ? 'text-gray-800' : 'text-white'}`}>{plan.name}</h2>
                  <p className={`text-sm mt-1 ${plan.id === 'free' ? 'text-gray-500' : 'text-white/80'}`}>{plan.description}</p>
                  <div className="mt-4">
                    {plan.price === 0 ? (
                      <span className={`text-4xl font-bold ${plan.id === 'free' ? 'text-gray-800' : 'text-white'}`}>Gratuit</span>
                    ) : (
                      <div>
                        <span className={`text-4xl font-bold ${plan.id === 'free' ? 'text-gray-800' : 'text-white'}`}>{price}€</span>
                        <span className={`text-sm ${plan.id === 'free' ? 'text-gray-500' : 'text-white/70'}`}>{plan.period}</span>
                        {billing === 'annual' && (
                          <p className="text-xs text-white/70 mt-1">facturé {(price * 12).toFixed(0)}€/an</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="p-6 flex-1 space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                        {feature.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  {isActive ? (
                    <Button disabled className="w-full bg-green-500 text-white cursor-default">
                      <Check className="w-4 h-4 mr-2" /> Plan actuel
                    </Button>
                  ) : (
                    <Button
                      onClick={() => subscribeMutation.mutate(plan.id)}
                      disabled={subscribeMutation.isPending}
                      className={`w-full ${
                        plan.id === 'vip'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : plan.id === 'premium'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {plan.id === 'free' ? 'Rester gratuit' : `Passer à ${plan.name}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature highlights */}
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Ce qui vous attend avec Premium & VIP</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {FEATURE_HIGHLIGHTS.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-5 flex gap-4 items-start shadow-sm border border-gray-100">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${f.plan === 'VIP' ? 'bg-purple-100' : 'bg-amber-100'}`}>
                    <Icon className={`w-5 h-5 ${f.plan === 'VIP' ? 'text-purple-600' : 'text-amber-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800 text-sm">{f.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${f.plan === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                        {f.plan}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Questions fréquentes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { q: 'Puis-je annuler à tout moment ?', r: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel.' },
              { q: 'Comment fonctionne le boost de profil ?', r: 'Votre profil apparaît en tête des résultats de recherche pendant 24h, vous offrant une visibilité maximale.' },
              { q: 'Mes données sont-elles sécurisées ?', r: 'Oui, toutes vos données sont chiffrées et sécurisées conformément au RGPD.' },
              { q: 'Y a-t-il une période d\'essai ?', r: 'Actuellement nous n\'offrons pas de période d\'essai, mais vous pouvez commencer gratuitement.' },
            ].map((item, i) => (
              <div key={i}>
                <p className="font-semibold text-gray-800 text-sm mb-1">{item.q}</p>
                <p className="text-gray-500 text-sm">{item.r}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}