import React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Heart, RefreshCcw, Wifi, Flame, Sparkles, Camera, MapPin } from 'lucide-react';

const filters = [
  { id: 'correspondences', label: 'Correspondances', icon: Heart, active: true },
  { id: 'mutual', label: 'Mutuelles', icon: RefreshCcw },
  { id: 'reverse', label: 'Inverses', icon: RefreshCcw },
  { id: 'online', label: 'En ligne', icon: Wifi },
  { id: 'popular', label: 'Populaire', icon: Flame },
  { id: 'new', label: 'Nouveau', icon: Sparkles },
  { id: 'photos', label: 'Photos récentes', icon: Camera },
  { id: 'region', label: 'Ma région', icon: MapPin },
];

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          <Button variant="outline" size="sm" className="shrink-0 gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Trier
          </Button>
          
          <div className="h-6 w-px bg-gray-200 mx-2" />
          
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <Button
                key={filter.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(filter.id)}
                className={`shrink-0 gap-2 ${isActive ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' : 'hover:border-amber-300'}`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}