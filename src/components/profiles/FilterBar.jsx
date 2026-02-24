import React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Heart, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {/* Filtre button with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="shrink-0 gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Trier
                <ChevronDown className="w-3 h-3" />
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

          <div className="h-6 w-px bg-gray-200 mx-2" />

          {/* Correspondances button (no dropdown) */}
          <Button
            variant={activeFilter === 'correspondences' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('correspondences')}
            className={`shrink-0 gap-2 ${activeFilter === 'correspondences' ? 'bg-amber-500 hover:bg-amber-600 border-amber-500' : 'hover:border-amber-300'}`}
          >
            <Heart className="w-4 h-4" />
            Correspondances
          </Button>
        </div>
      </div>
    </div>
  );
}