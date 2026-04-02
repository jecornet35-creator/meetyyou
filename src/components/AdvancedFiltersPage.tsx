import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Country, State, City } from 'country-state-city';
import { 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  User, 
  Heart, 
  ArrowLeft,
  RotateCcw,
  SlidersHorizontal,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AdvancedFiltersPage({ onBack, onSave }) {
  const [sections, setSections] = useState({
    localisation: true,
    apparence: true,
    modeDeVie: true,
    origines: true,
    relation: true
  });

  const [manualCity, setManualCity] = useState(false);

  const countries = useMemo(() => Country.getAllCountries(), []);
  
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const states = useMemo(() => 
    selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : []
  , [selectedCountryCode]);

  const cities = useMemo(() => 
    (selectedCountryCode && selectedStateCode) ? City.getCitiesOfState(selectedCountryCode, selectedStateCode) : []
  , [selectedCountryCode, selectedStateCode]);

  const [filters, setFilters] = useState({
    lookingFor: 'Femmes',
    ageMin: '-',
    ageMax: '-',
    country: '',
    state: '',
    city: '',
    bodyType: ['Pas de préférence'],
    ethnicity: ['Pas de préférence'],
    appearance: ['Pas de préférence'],
    smoking: 'Pas de préférence',
    drinking: 'Pas de préférence',
    relocate: 'Pas de préférence',
    children: 'Pas de préférence',
    income: 'Pas de préférence',
    education: 'Pas de préférence',
    english: 'Pas de préférence',
    french: 'Pas de préférence',
    religion: ['Pas de préférence'],
    zodiac: ['Pas de préférence'],
    relationType: ['Pas de préférence']
  });

  // Load filters from API on mount
  useEffect(() => {
    const fetchFilters = async () => {
      const savedFilters = await api.get('advanced_filters');
      if (savedFilters) {
        setFilters(savedFilters);
        
        // Try to find codes for initial values
        if (savedFilters.country) {
          const country = countries.find(c => c.name === savedFilters.country);
          if (country) {
            setSelectedCountryCode(country.isoCode);
            if (savedFilters.state) {
              const state = State.getStatesOfCountry(country.isoCode).find(s => s.name === savedFilters.state);
              if (state) {
                setSelectedStateCode(state.isoCode);
              }
            }
          }
        }
      }
    };
    fetchFilters();
  }, [countries]);

  const handleSave = async () => {
    await api.save('advanced_filters', filters);
    if (onSave) onSave(filters);
  };

  const resetFilters = async () => {
    const defaultFilters = {
      lookingFor: 'Femmes',
      ageMin: '-',
      ageMax: '-',
      country: '',
      state: '',
      city: '',
      bodyType: ['Pas de préférence'],
      ethnicity: ['Pas de préférence'],
      appearance: ['Pas de préférence'],
      smoking: 'Pas de préférence',
      drinking: 'Pas de préférence',
      relocate: 'Pas de préférence',
      children: 'Pas de préférence',
      income: 'Pas de préférence',
      education: 'Pas de préférence',
      english: 'Pas de préférence',
      french: 'Pas de préférence',
      religion: ['Pas de préférence'],
      zodiac: ['Pas de préférence'],
      relationType: ['Pas de préférence']
    };
    setFilters(defaultFilters);
    setSelectedCountryCode('');
    setSelectedStateCode('');
    setManualCity(false);
    await api.save('advanced_filters', defaultFilters);
  };

  const toggleSection = (section: string) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 sm:pb-20">
      <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
        <div className="bg-white sm:rounded-2xl shadow-sm border-b sm:border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200"
              >
                <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-neutral-600" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                  <h1 className="text-lg sm:text-2xl font-bold text-neutral-800">Filtre avancé</h1>
                </div>
                <p className="text-[10px] sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                  Critères sauvegardés en permanence.
                </p>
              </div>
            </div>
            <button 
              onClick={resetFilters}
              className="p-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-neutral-600 hover:bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-[14px] h-[14px] sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>

          <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">Je cherche</label>
                <div className="relative">
                  <select 
                    value={filters.lookingFor}
                    onChange={(e) => setFilters({...filters, lookingFor: e.target.value})}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  >
                    <option>Femmes</option>
                    <option>Hommes</option>
                    <option>Les deux</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:block">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">Âge min</label>
                  <div className="relative">
                    <select 
                      value={filters.ageMin}
                      onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    >
                      <option>-</option>
                      {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">Âge max</label>
                  <div className="relative">
                    <select 
                      value={filters.ageMax}
                      onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    >
                      <option>-</option>
                      {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                        <option key={age} value={age}>{age}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="border-t border-neutral-100 pt-6 sm:pt-8">
              <button 
                onClick={() => toggleSection('localisation')}
                className="flex items-center gap-2 text-orange-600 font-bold mb-4 sm:mb-6 hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                {sections.localisation ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
                Localisation
              </button>
              
              {sections.localisation && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Pays</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <select 
                        value={selectedCountryCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const name = countries.find(c => c.isoCode === code)?.name || '';
                          setSelectedCountryCode(code);
                          setSelectedStateCode('');
                          setFilters({...filters, country: name, state: '', city: ''});
                        }}
                        className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm appearance-none"
                      >
                        <option value="">Sélectionner un pays</option>
                        {countries.map(c => (
                          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 mb-1.5 sm:mb-2 uppercase tracking-wider">État / Province</label>
                    <div className="relative">
                      <select 
                        value={selectedStateCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const name = states.find(s => s.isoCode === code)?.name || '';
                          setSelectedStateCode(code);
                          setFilters({...filters, state: name, city: ''});
                        }}
                        disabled={!selectedCountryCode}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm appearance-none disabled:bg-neutral-50 disabled:text-neutral-400"
                      >
                        <option value="">Sélectionner un état</option>
                        {states.map(s => (
                          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 uppercase tracking-wider">Ville</label>
                      <button 
                        onClick={() => setManualCity(!manualCity)}
                        className="text-[9px] sm:text-[10px] text-orange-600 font-bold uppercase hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        {manualCity ? "Liste" : "Saisie manuelle"}
                      </button>
                    </div>
                    
                    {manualCity || (selectedCountryCode && selectedStateCode && cities.length === 0) ? (
                      <input 
                        type="text"
                        placeholder="Ville"
                        value={filters.city}
                        onChange={(e) => setFilters({...filters, city: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      />
                    ) : (
                      <div className="relative">
                        <select 
                          value={filters.city}
                          onChange={(e) => setFilters({...filters, city: e.target.value})}
                          disabled={!selectedStateCode}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm appearance-none disabled:bg-neutral-50 disabled:text-neutral-400"
                        >
                          <option value="">Sélectionner une ville</option>
                          {cities.map(c => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Apparence */}
            <div className="border-t border-neutral-100 pt-6 sm:pt-8">
              <button 
                onClick={() => toggleSection('apparence')}
                className="flex items-center gap-2 text-orange-600 font-bold mb-4 sm:mb-6 hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                {sections.apparence ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
                Apparence
              </button>

              {sections.apparence && (
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Type de corps :</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Petit(e)', 'Mince', 'Sportif(ve)', 'Moyen(ne)', 'Quelques kilos en plus', 'Rond(e)', 'Grand(e) et magnifique'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={filters.bodyType.includes(option)}
                            onChange={(e) => {
                              const newTypes = e.target.checked 
                                ? [...filters.bodyType, option]
                                : filters.bodyType.filter(t => t !== option);
                              setFilters({...filters, bodyType: newTypes});
                            }}
                            className="rounded border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Ethnicité :</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Africain(e)', 'Afro-Américain(e)', 'Afro-Caribéen(ne)', 'Arabe', 'Asiatique', 'Caucasien(ne)', 'Hispanique / Latino', 'Indien(ne)', 'Métis(se)', 'Insulaire du Pacifique', 'Autre', 'Préfère ne pas commenter'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={filters.ethnicity.includes(option)}
                            onChange={(e) => {
                              const newTypes = e.target.checked 
                                ? [...filters.ethnicity, option]
                                : filters.ethnicity.filter(t => t !== option);
                              setFilters({...filters, ethnicity: newTypes});
                            }}
                            className="rounded border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Apparence :</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'En dessous de la moyenne', 'Moyenne', 'Attrayant(e)', 'Très attrayant(e)'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={filters.appearance.includes(option)}
                            onChange={(e) => {
                              const newTypes = e.target.checked 
                                ? [...filters.appearance, option]
                                : filters.appearance.filter(t => t !== option);
                              setFilters({...filters, appearance: newTypes});
                            }}
                            className="rounded border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mode de vie */}
            <div className="border-t border-neutral-100 pt-6 sm:pt-8">
              <button 
                onClick={() => toggleSection('modeDeVie')}
                className="flex items-center gap-2 text-orange-600 font-bold mb-4 sm:mb-6 hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                {sections.modeDeVie ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
                Mode de vie
              </button>

              {sections.modeDeVie && (
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Fume-t-il/elle ?</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Fume', 'Ne fume pas', 'Fume occasionnellement'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio"
                            name="smoking"
                            checked={filters.smoking === option}
                            onChange={() => setFilters({...filters, smoking: option})}
                            className="border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Boit-il/elle ?</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Boit', 'Ne boit pas', 'Boit occasionnellement'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio"
                            name="drinking"
                            checked={filters.drinking === option}
                            onChange={() => setFilters({...filters, drinking: option})}
                            className="border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Prêt(e) à déménager :</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Dans son pays', 'Dans un autre pays', 'Ne souhaite pas déménager', 'Pas sûr(e)'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio"
                            name="relocate"
                            checked={filters.relocate === option}
                            onChange={() => setFilters({...filters, relocate: option})}
                            className="border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">A des enfants :</label>
                      <div className="relative">
                        <select 
                          value={filters.children}
                          onChange={(e) => setFilters({...filters, children: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        >
                          <option>Pas de préférence</option>
                          <option>Oui</option>
                          <option>Non</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">Revenu annuel minimum :</label>
                      <div className="relative">
                        <select 
                          value={filters.income}
                          onChange={(e) => setFilters({...filters, income: e.target.value})}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        >
                          <option>Pas de préférence</option>
                          <option>Plus de 20 000 €</option>
                          <option>Plus de 40 000 €</option>
                          <option>Plus de 60 000 €</option>
                          <option>Plus de 100 000 €</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Origines & Valeurs culturelles */}
            <div className="border-t border-neutral-100 pt-6 sm:pt-8">
              <button 
                onClick={() => toggleSection('origines')}
                className="flex items-center gap-2 text-orange-600 font-bold mb-4 sm:mb-6 hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                {sections.origines ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
                Origines & Valeurs culturelles
              </button>

              {sections.origines && (
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Niveau d'éducation minimum :</label>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {['Pas de préférence', 'Primaire', 'Collège', 'Lycée', 'Formation professionnelle', 'Licence', 'Master', 'Doctorat'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio"
                            name="education"
                            checked={filters.education === option}
                            onChange={() => setFilters({...filters, education: option})}
                            className="border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Niveau d'anglais minimum :</label>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {['Pas de préférence', 'Ne parle pas', 'Moyen', 'Bien', 'Très bien', 'Maîtrise'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio"
                            name="english"
                            checked={filters.english === option}
                            onChange={() => setFilters({...filters, english: option})}
                            className="border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Niveau de français minimum :</label>
                    <div className="flex flex-wrap gap-3 sm:gap-4">
                      {['Pas de préférence', 'Ne parle pas', 'Moyen', 'Bien', 'Très bien', 'Maîtrise'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="radio"
                            name="french"
                            checked={filters.french === option}
                            onChange={() => setFilters({...filters, french: option})}
                            className="border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Religion :</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Baptiste', 'Bouddhiste', 'Chrétien(ne)', 'Hindou', 'Islam', 'Jaïnisme', 'Juif/Juive', 'Parsi', 'Shintoïsme', 'Sikhisme', 'Taoïsme', 'Athée', 'Autre', 'Préfère ne pas commenter'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={filters.religion.includes(option)}
                            onChange={(e) => {
                              const newTypes = e.target.checked 
                                ? [...filters.religion, option]
                                : filters.religion.filter(t => t !== option);
                              setFilters({...filters, religion: newTypes});
                            }}
                            className="rounded border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Signe astrologique :</label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      {['Pas de préférence', 'Verseau', 'Bélier', 'Cancer', 'Capricorne', 'Gémeaux', 'Lion', 'Balance', 'Poissons', 'Sagittaire', 'Scorpion', 'Taureau', 'Vierge', 'Ne sait pas'].map(option => (
                        <label key={option} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={filters.zodiac.includes(option)}
                            onChange={(e) => {
                              const newTypes = e.target.checked 
                                ? [...filters.zodiac, option]
                                : filters.zodiac.filter(t => t !== option);
                              setFilters({...filters, zodiac: newTypes});
                            }}
                            className="rounded border-neutral-300 text-orange-500 focus:ring-orange-500" 
                          />
                          <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Type de relation recherché */}
            <div className="border-t border-neutral-100 pt-6 sm:pt-8">
              <button 
                onClick={() => toggleSection('relation')}
                className="flex items-center gap-2 text-orange-600 font-bold mb-4 sm:mb-6 hover:opacity-80 transition-opacity text-sm sm:text-base"
              >
                {sections.relation ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
                Type de relation recherché
              </button>

              {sections.relation && (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {['Pas de préférence', 'Correspondance', 'Amitié', 'Rencontres / Amour', 'Relation long terme'].map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox"
                        checked={filters.relationType.includes(option)}
                        onChange={(e) => {
                          const newTypes = e.target.checked 
                            ? [...filters.relationType, option]
                            : filters.relationType.filter(t => t !== option);
                          setFilters({...filters, relationType: newTypes});
                        }}
                        className="rounded border-neutral-300 text-orange-500 focus:ring-orange-500" 
                      />
                      <span className="text-xs sm:text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-8 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button 
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-100 transition-all shadow-sm order-2 sm:order-1"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 order-1 sm:order-2"
            >
              Enregistrer le filtre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
