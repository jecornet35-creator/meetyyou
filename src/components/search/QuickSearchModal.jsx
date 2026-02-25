import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickSearchModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [criteria, setCriteria] = useState(() => {
    try {
      const saved = sessionStorage.getItem('quickFilter');
      return saved ? JSON.parse(saved) : {
        looking_for: '',
        age_min: '25',
        age_max: '35',
        country: '',
        state_province: '',
        city: '',
      };
    } catch {
      return { looking_for: '', age_min: '25', age_max: '35', country: '', state_province: '', city: '' };
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      const existing = await base44.entities.Correspondance.filter({ created_by: user.email });
      if (existing[0]) {
        return base44.entities.Correspondance.update(existing[0].id, data);
      } else {
        return base44.entities.Correspondance.create(data);
      }
    },
    onSuccess: (_, data) => {
      sessionStorage.setItem('quickFilter', JSON.stringify(data));
      window.dispatchEvent(new Event('quickFilterUpdated'));
      queryClient.invalidateQueries({ queryKey: ['myCorrespondance'] });
      queryClient.invalidateQueries({ queryKey: ['correspondance'] });
      onClose();
    },
  });

  const ages = Array.from({ length: 63 }, (_, i) => i + 18);

  const countries = [
    { value: 'all', label: 'Tous Pays' },
    { value: 'france', label: 'France' },
    { value: 'senegal', label: 'Sénégal' },
    { value: 'cote_ivoire', label: "Côte d'Ivoire" },
    { value: 'cameroun', label: 'Cameroun' },
    { value: 'mali', label: 'Mali' },
    { value: 'guinee', label: 'Guinée' },
    { value: 'congo', label: 'Congo' },
    { value: 'gabon', label: 'Gabon' },
    { value: 'benin', label: 'Bénin' },
    { value: 'togo', label: 'Togo' },
    { value: 'burkina_faso', label: 'Burkina Faso' },
    { value: 'niger', label: 'Niger' },
    { value: 'usa', label: 'USA' },
    { value: 'canada', label: 'Canada' },
    { value: 'belgique', label: 'Belgique' },
    { value: 'suisse', label: 'Suisse' },
    { value: 'uk', label: 'Royaume-Uni' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
                Critères de Correspondance
              </h2>

              <div className="space-y-5">
                {/* Je cherche */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Je cherche</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCriteria(prev => ({ ...prev, looking_for: '' }))}
                      className={`flex-1 py-3 px-4 rounded-full border text-sm font-medium transition-colors ${
                        criteria.looking_for === '' 
                          ? 'bg-gray-100 border-gray-300 text-gray-700' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Pas de préférence
                    </button>
                    <button
                      onClick={() => setCriteria(prev => ({ ...prev, looking_for: 'men' }))}
                      className={`flex-1 py-3 px-4 rounded-full border text-sm font-medium transition-colors ${
                        criteria.looking_for === 'men' 
                          ? 'bg-gray-100 border-gray-300 text-gray-700' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Homme
                    </button>
                    <button
                      onClick={() => setCriteria(prev => ({ ...prev, looking_for: 'women' }))}
                      className={`flex-1 py-3 px-4 rounded-full border text-sm font-medium transition-colors ${
                        criteria.looking_for === 'women' 
                          ? 'bg-amber-500 border-amber-500 text-white' 
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      Femme
                    </button>
                  </div>
                </div>

                {/* Age entre */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Age entre</label>
                  <div className="flex gap-3">
                    <Select value={criteria.age_min} onValueChange={(v) => setCriteria(prev => ({ ...prev, age_min: v }))}>
                      <SelectTrigger className="flex-1 h-12 rounded-lg border-gray-200">
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {ages.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={criteria.age_max} onValueChange={(v) => setCriteria(prev => ({ ...prev, age_max: v }))}>
                      <SelectTrigger className="flex-1 h-12 rounded-lg border-gray-200">
                        <SelectValue placeholder="Max" />
                      </SelectTrigger>
                      <SelectContent>
                        {ages.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Vivant en */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Vivant en</label>
                  <Select value={criteria.country} onValueChange={(v) => setCriteria(prev => ({ ...prev, country: v }))}>
                    <SelectTrigger className="w-full h-12 rounded-lg border-gray-200">
                      <SelectValue placeholder="Tous Pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* État */}
                <div>
                  <Select value={criteria.state_province} onValueChange={(v) => setCriteria(prev => ({ ...prev, state_province: v }))}>
                    <SelectTrigger className="w-full h-12 rounded-lg border-gray-200">
                      <SelectValue placeholder="N'importe quel Etat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">N'importe quel Etat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Ville */}
                <div>
                  <label className="text-sm text-gray-600 mb-2 block">Ville</label>
                  <input
                    type="text"
                    value={criteria.city}
                    onChange={e => setCriteria(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="N'importe quelle ville"
                    className="w-full h-12 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-full border-amber-500 text-amber-600 hover:bg-amber-50"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => saveMutation.mutate(criteria)}
                  disabled={saveMutation.isPending}
                  className="flex-1 h-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}