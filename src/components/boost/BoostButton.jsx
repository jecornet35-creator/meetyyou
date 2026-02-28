import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Rocket, Crown, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BoostButton({ profile, currentUser, plan }) {
  const queryClient = useQueryClient();

  // Count boosts used this month
  const { data: monthlyBoosts = [] } = useQuery({
    queryKey: ['myMonthlyBoosts', currentUser?.email],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const boosts = await base44.entities.ProfileBoost.filter({ user_email: currentUser.email });
      return boosts.filter(b => new Date(b.created_date) >= startOfMonth);
    },
    enabled: !!currentUser,
  });

  // Check if currently boosted
  const { data: activeBoost } = useQuery({
    queryKey: ['activeBoost', profile?.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      const boosts = await base44.entities.ProfileBoost.filter({ user_email: currentUser.email, profile_id: profile.id, is_active: true });
      return boosts.find(b => b.expires_at > now) || null;
    },
    enabled: !!currentUser && !!profile?.id,
  });

  // Booster pack (purchased boosts)
  const { data: boosterPack } = useQuery({
    queryKey: ['boosterPack', currentUser?.email],
    queryFn: async () => {
      const packs = await base44.entities.BoosterPack.filter({ user_email: currentUser.email });
      return packs[0] || null;
    },
    enabled: !!currentUser,
  });

  const boostMutation = useMutation({
    mutationFn: async (source) => {
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);

      if (source === 'purchased' && boosterPack) {
        await base44.entities.BoosterPack.update(boosterPack.id, {
          boosts_remaining: boosterPack.boosts_remaining - 1
        });
      }

      return base44.entities.ProfileBoost.create({
        user_email: currentUser.email,
        profile_id: profile.id,
        expires_at: expires.toISOString(),
        is_active: true,
        source,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myMonthlyBoosts'] });
      queryClient.invalidateQueries({ queryKey: ['activeBoost'] });
      queryClient.invalidateQueries({ queryKey: ['boosterPack'] });
      queryClient.invalidateQueries({ queryKey: ['featuredProfiles'] });
      toast.success('Profil boosté pendant 24h ! Vous apparaissez maintenant en tête des résultats.');
    },
  });

  // VIP: 2 boosts/month limit
  const vipUsed = monthlyBoosts.filter(b => b.source === 'vip_monthly').length;
  const vipLimit = 2;
  const vipRemaining = vipLimit - vipUsed;

  const purchasedRemaining = boosterPack?.boosts_remaining || 0;

  const isCurrentlyBoosted = !!activeBoost;
  const hoursLeft = activeBoost ? Math.ceil((new Date(activeBoost.expires_at) - new Date()) / 3600000) : 0;

  // Not premium/vip
  if (plan === 'free') {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-amber-600" />
          <span className="font-semibold text-gray-800">Boost de profil</span>
        </div>
        <p className="text-sm text-gray-500">Apparaissez en tête des résultats pendant 24h.</p>
        <Link to={createPageUrl('SubscriptionPlans')}>
          <Button className="w-full bg-amber-500 hover:bg-amber-600 gap-2">
            <ShoppingBag className="w-4 h-4" />
            Acheter des boosts (5€ / 10 boosts)
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-amber-600" />
          <span className="font-semibold text-gray-800">Boost de profil</span>
        </div>
        {isCurrentlyBoosted && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
            🚀 Actif — {hoursLeft}h restantes
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500">Apparaissez en tête des résultats pendant 24h.</p>

      {/* VIP monthly boosts */}
      {plan === 'vip' && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-purple-500" />
            <span className="text-gray-700">Boosts VIP ce mois</span>
          </div>
          <div className="flex gap-1">
            {[1, 2].map(i => (
              <div key={i} className={`w-5 h-5 rounded-full border-2 ${i <= vipRemaining ? 'bg-purple-500 border-purple-500' : 'bg-gray-100 border-gray-300'}`} />
            ))}
            <span className="text-xs text-gray-500 ml-1">{vipRemaining}/2 restants</span>
          </div>
        </div>
      )}

      {/* Purchased boosts */}
      {purchasedRemaining > 0 && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            <span className="text-gray-700">Boosts achetés</span>
          </div>
          <span className="font-bold text-amber-700">{purchasedRemaining} restants</span>
        </div>
      )}

      <div className="flex gap-2 flex-col">
        {/* VIP boost button */}
        {plan === 'vip' && vipRemaining > 0 && !isCurrentlyBoosted && (
          <Button
            onClick={() => boostMutation.mutate('vip_monthly')}
            disabled={boostMutation.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
          >
            <Crown className="w-4 h-4" />
            Booster (VIP mensuel)
          </Button>
        )}

        {/* Purchased boost button */}
        {purchasedRemaining > 0 && !isCurrentlyBoosted && (
          <Button
            onClick={() => boostMutation.mutate('purchased')}
            disabled={boostMutation.isPending}
            className="w-full bg-amber-500 hover:bg-amber-600 gap-2"
          >
            <Rocket className="w-4 h-4" />
            Booster (utiliser 1 boost)
          </Button>
        )}

        {/* Buy more */}
        {purchasedRemaining === 0 && (plan === 'free' || !isCurrentlyBoosted) && (
          <Link to={createPageUrl('SubscriptionPlans')}>
            <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 gap-2">
              <ShoppingBag className="w-4 h-4" />
              Acheter des boosts (5€ / 10)
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}