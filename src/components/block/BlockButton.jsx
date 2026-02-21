import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

export default function BlockButton({ targetProfile, currentUserEmail, variant = 'outline', size = 'sm' }) {
  const queryClient = useQueryClient();

  const { data: blockRecord } = useQuery({
    queryKey: ['block', currentUserEmail, targetProfile?.created_by],
    queryFn: async () => {
      const results = await base44.entities.BlockedUser.filter({
        blocker_email: currentUserEmail,
        blocked_email: targetProfile.created_by
      });
      return results[0] || null;
    },
    enabled: !!currentUserEmail && !!targetProfile?.created_by,
  });

  const isBlocked = !!blockRecord;

  const blockMutation = useMutation({
    mutationFn: async () => {
      if (isBlocked) {
        await base44.entities.BlockedUser.delete(blockRecord.id);
      } else {
        await base44.entities.BlockedUser.create({
          blocker_email: currentUserEmail,
          blocked_email: targetProfile.created_by,
          blocked_profile_id: targetProfile.id,
          blocked_display_name: targetProfile.display_name,
          blocked_photo: targetProfile.main_photo || null,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['block', currentUserEmail, targetProfile?.created_by] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
      toast.success(isBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué');
    },
  });

  if (!currentUserEmail || targetProfile?.created_by === currentUserEmail) return null;

  return (
    <Button
      variant={isBlocked ? 'destructive' : variant}
      size={size}
      onClick={() => blockMutation.mutate()}
      disabled={blockMutation.isPending}
      className="gap-2"
    >
      {isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
      {isBlocked ? 'Débloquer' : 'Bloquer'}
    </Button>
  );
}