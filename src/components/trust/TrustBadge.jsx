import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function TrustBadge({ trustScore, showDetails = false }) {
  if (!trustScore) return null;

  const getConfig = (level) => {
    const configs = {
      excellent: {
        icon: Award,
        color: 'bg-gradient-to-r from-amber-500 to-yellow-500',
        textColor: 'text-white',
        label: 'Excellent',
        emoji: '⭐'
      },
      high: {
        icon: ShieldCheck,
        color: 'bg-green-500',
        textColor: 'text-white',
        label: 'Élevé',
        emoji: '✓'
      },
      medium: {
        icon: Shield,
        color: 'bg-blue-500',
        textColor: 'text-white',
        label: 'Moyen',
        emoji: '●'
      },
      low: {
        icon: ShieldAlert,
        color: 'bg-gray-400',
        textColor: 'text-white',
        label: 'Faible',
        emoji: '!'
      }
    };
    return configs[level] || configs.low;
  };

  const config = getConfig(trustScore.trust_level);
  const Icon = config.icon;

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className={`${config.color} ${config.textColor} flex items-center gap-1`}>
              <Icon className="w-3 h-3" />
              {trustScore.overall_score}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Score de confiance: {config.label} ({trustScore.overall_score}/100)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={`${config.color} ${config.textColor} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span className="font-bold">Score de Confiance</span>
        </div>
        <span className="text-2xl font-bold">{trustScore.overall_score}</span>
      </div>
      <div className="text-sm opacity-90">
        Niveau: {config.label} {config.emoji}
      </div>
    </div>
  );
}