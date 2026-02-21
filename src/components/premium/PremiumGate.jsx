import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PremiumGate({ children, feature = 'cette fonctionnalité', requiredPlan = 'premium', isPremium }) {
  if (isPremium) return children;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl z-10 p-4 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-amber-500" />
        </div>
        <p className="font-semibold text-gray-800 text-sm mb-1">Fonctionnalité Premium</p>
        <p className="text-gray-500 text-xs mb-3">Passez à l'offre {requiredPlan === 'vip' ? 'VIP' : 'Premium'} pour accéder à {feature}.</p>
        <Link to={createPageUrl('SubscriptionPlans')}>
          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Voir les offres
          </Button>
        </Link>
      </div>
    </div>
  );
}