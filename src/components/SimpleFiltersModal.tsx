import React, { useState } from 'react';
import { X, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filters: any) => void;
  initialFilters?: any;
}

export default function SimpleFiltersModal({ isOpen, onClose, onSave, initialFilters }: SimpleFiltersModalProps) {
  const [lookingFor, setLookingFor] = useState(initialFilters?.lookingFor || 'Pas de préférence');
  const [ageMin, setAgeMin] = useState(initialFilters?.ageMin || '25');
  const [ageMax, setAgeMax] = useState(initialFilters?.ageMax || '35');
  const [country, setCountry] = useState(initialFilters?.country || '');
  const [state, setState] = useState(initialFilters?.state || '');
  const [city, setCity] = useState(initialFilters?.city || '');

  React.useEffect(() => {
    if (isOpen && initialFilters) {
      setLookingFor(initialFilters.lookingFor || 'Pas de préférence');
      setAgeMin(initialFilters.ageMin || '25');
      setAgeMax(initialFilters.ageMax || '35');
      setCountry(initialFilters.country || '');
      setState(initialFilters.state || '');
      setCity(initialFilters.city || '');
    }
  }, [isOpen, initialFilters]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      lookingFor,
      ageMin,
      ageMax,
      country,
      state,
      city
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 pb-4 text-center">
            <h2 className="text-xl font-bold text-neutral-800">Critères de Correspondance</h2>
            <button 
              onClick={onClose}
              className="absolute right-4 top-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 pt-2 space-y-6">
            {/* Je cherche */}
            <div className="space-y-3">
              <label className="text-sm text-neutral-500">Je cherche</label>
              <div className="flex gap-3">
                {['Pas de préférence', 'Homme', 'Femme'].map((option) => (
                  <button
                    key={option}
                    onClick={() => setLookingFor(option)}
                    className={`flex-1 py-3 px-2 rounded-full text-sm font-medium border transition-colors ${
                      lookingFor === option 
                        ? 'border-neutral-300 bg-neutral-50 text-neutral-700' 
                        : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Age entre */}
            <div className="space-y-3">
              <label className="text-sm text-neutral-500">Age entre</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <select 
                    value={ageMin}
                    onChange={(e) => setAgeMin(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border border-neutral-200 bg-white text-neutral-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                </div>
                <div className="relative flex-1">
                  <select 
                    value={ageMax}
                    onChange={(e) => setAgeMax(e.target.value)}
                    className="w-full p-3 pr-10 rounded-xl border border-neutral-200 bg-white text-neutral-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all appearance-none"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 18).map(age => (
                      <option key={age} value={age}>{age}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Vivant en */}
            <div className="space-y-3">
              <label className="text-sm text-neutral-500">Vivant en</label>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Country</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Pays" 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">État / Province</label>
                  <input 
                    type="text" 
                    placeholder="État / Province" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-neutral-500">Ville</label>
                  <input 
                    type="text" 
                    placeholder="Ville" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-2 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-orange-500 text-orange-500 font-bold hover:bg-orange-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="flex-1 py-3 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
            >
              Enregistrer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
