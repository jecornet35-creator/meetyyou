import { 
  ArrowLeft, 
  Check, 
  X, 
  Zap, 
  Crown, 
  Star, 
  MessageSquare, 
  Eye, 
  Search, 
  Shield, 
  Rocket,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const iconMap = {
  Rocket: <Rocket className="w-8 h-8" />,
  Zap: <Zap className="w-8 h-8" />,
  Crown: <Crown className="w-8 h-8" />,
  Star: <Star className="w-8 h-8" />,
};

export default function SubscriptionPage({ onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await api.get('subscription_plans');
        setPlans(data || []);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const benefits = [
    { icon: <MessageSquare className="w-5 h-5" />, title: "Messages illimités", badge: "Premium", desc: "Communiquez sans restriction avec tous les profils", color: "text-amber-500", bgColor: "bg-amber-50" },
    { icon: <Eye className="w-5 h-5" />, title: "Qui vous a liké", badge: "Premium", desc: "Découvrez tous les profils qui ont aimé le vôtre", color: "text-amber-500", bgColor: "bg-amber-50" },
    { icon: <Search className="w-5 h-5" />, title: "Filtres avancés", badge: "Premium", desc: "Affinez votre recherche avec des critères précis", color: "text-amber-500", bgColor: "bg-amber-50" },
    { icon: <Rocket className="w-5 h-5" />, title: "Boost de profil", badge: "VIP", desc: "Apparaissez en tête des résultats pendant 24h", color: "text-purple-500", bgColor: "bg-purple-50" },
    { icon: <Crown className="w-5 h-5" />, title: "Badge VIP", badge: "VIP", desc: "Un badge exclusif qui vous distingue", color: "text-purple-500", bgColor: "bg-purple-50" },
    { icon: <Shield className="w-5 h-5" />, title: "Profil prioritaire", badge: "Premium", desc: "Votre profil est mis en avant dans les résultats", color: "text-amber-500", bgColor: "bg-amber-50" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 sm:pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-orange-500 font-medium hover:gap-3 transition-all mb-8 sm:mb-12"
        >
          <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
          Retour
        </button>

        <div className="text-center mb-10 sm:mb-16">
          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 mb-2 sm:mb-4 px-4">Choisissez votre offre</h1>
          <p className="text-neutral-500 text-sm sm:text-lg px-6">Trouvez l'amour plus facilement avec nos fonctionnalités premium</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {plans.map((plan) => (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -8 }}
              className={`bg-white rounded-[32px] shadow-xl overflow-hidden border-2 ${plan.popular ? 'border-amber-400' : 'border-transparent'}`}
            >
              <div className={`bg-gradient-to-br ${plan.color} p-8 text-white text-center relative`}>
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {plan.badge}
                  </div>
                )}
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {iconMap[plan.iconName] || <Zap className="w-8 h-8" />}
                </div>
                <h2 className="text-2xl font-black mb-1">{plan.name}</h2>
                <p className="text-white/80 text-sm mb-6">{plan.subtitle}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black">{plan.price}{plan.currency}</span>
                  <span className="text-white/70 text-sm">{plan.period}</span>
                </div>
                {plan.economy && (
                  <div className="mt-2 text-xs font-bold text-white/90">
                    {plan.economy}
                  </div>
                )}
              </div>
              
              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      {feature.included ? (
                        <Check className="w-[18px] h-[18px] text-emerald-500 shrink-0" />
                      ) : (
                        <X className="w-[18px] h-[18px] text-neutral-300 shrink-0" />
                      )}
                      <span className={feature.included ? 'text-neutral-700' : 'text-neutral-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full ${plan.btnColor} text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2`}>
                  {plan.id === 'booster' && <Rocket className="w-[18px] h-[18px]" />}
                  {plan.btnText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-16 sm:mb-24 text-center">
          <h2 className="text-xl sm:text-3xl font-black text-neutral-900 mb-8 sm:mb-12 px-4">Ce qui vous attend avec Premium & VIP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-start gap-4 text-left">
                <div className={`${benefit.bgColor} ${benefit.color} p-3 rounded-xl`}>
                  {benefit.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-neutral-800">{benefit.title}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${benefit.badge === 'VIP' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}>
                      {benefit.badge}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-neutral-100 p-6 sm:p-12">
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mb-8 sm:mb-12 text-center">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 sm:gap-y-8">
            <div>
              <h3 className="font-bold text-neutral-800 mb-2">Y a-t-il un renouvellement automatique ?</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Non, il n'y a pas de renouvellement automatique. À la fin de votre abonnement, vous devrez vous réabonner si vous souhaitez continuer.</p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-2">Comment fonctionne le boost de profil ?</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Votre profil apparaît en tête des résultats de recherche pendant 24h, vous offrant une visibilité maximale.</p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-2">Mes données sont-elles sécurisées ?</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Oui, toutes vos données sont chiffrées et sécurisées conformément au RGPD.</p>
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 mb-2">Y a-t-il une période d'essai ?</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Actuellement nous n'offrons pas de période d'essai, mais vous pouvez commencer gratuitement.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
