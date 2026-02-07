import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Heart, Wifi, Flame, Sparkles, Camera, MapPin, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const filters = [
  { id: 'correspondences', label: 'Correspondances', icon: Heart, active: true, hasDropdown: true },
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
            
            if (filter.hasDropdown) {
              return (
                <DropdownMenu key={filter.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={`shrink-0 gap-2 ${isActive ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' : 'hover:border-amber-300'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {filter.label}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem className="cursor-pointer py-3" onClick={() => window.dispatchEvent(new CustomEvent('openQuickSearch'))}>
                      Filtres simples
                    </DropdownMenuItem>
                    <Link to={createPageUrl('Correspondances')}>
                      <DropdownMenuItem className="cursor-pointer py-3">
                        Filtres avancés
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
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