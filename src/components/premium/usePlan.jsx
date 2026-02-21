import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function usePlan() {
  const { data, isLoading } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const subs = await base44.entities.Subscription.filter({ user_email: user.email, status: 'active' });
      return subs[0] || null;
    },
  });

  const plan = data?.plan || 'free';

  return {
    plan,
    isPremium: plan === 'premium' || plan === 'vip',
    isVip: plan === 'vip',
    isFree: plan === 'free',
    isLoading,
    subscription: data,
    // Limits
    canMessage: plan !== 'free',
    canSeeWhoLiked: plan !== 'free',
    canBoostProfile: plan === 'vip',
    canUseAdvancedFilters: plan !== 'free',
    likesPerDay: plan === 'free' ? 5 : plan === 'premium' ? 50 : 999,
  };
}