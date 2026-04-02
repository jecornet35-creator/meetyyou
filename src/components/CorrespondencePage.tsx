import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Country, State, City } from 'country-state-city';
import { 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  ArrowLeft,
  RotateCcw,
  Send,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CorrespondencePage({ onBack, onViewMatches }) {
  const [sections, setSections] = useState({
    localisation: true,
    apparence: true,
    bodyArt: true,
    appearance: true,
    modeDeVie: true,
    professional: true,
    cultural: true
  });

  const toggleSection = (section: string) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [criteria, setCriteria] = useState({
    looking_for: 'women',
    age_min: '25',
    age_max: '35',
    country: '',
    countryCode: '',
    state_province: '',
    stateCode: '',
    city: '',
    distance_km: '',
    height_min: 'No preference',
    height_max: 'No preference',
    weight_min: 'No preference',
    weight_max: 'No preference',
    body_type: ['No preference'],
    ethnicity: ['No preference'],
    hair_color: ['No preference'],
    eye_color: ['No preference'],
    body_art: ['No preference'],
    appearance: ['No preference'],
    smoking: ['No preference'],
    drinking: ['No preference'],
    ready_to_move: ['No preference'],
    family_situation: ['No preference'],
    has_children: 'No preference',
    number_of_children_max: 'No preference',
    youngest_child_age: 'No preference',
    oldest_child_age: 'No preference',
    want_children: ['No preference'],
    occupation: ['No preference'],
    professional_status: ['No preference'],
    annual_income_min: 'No preference',
    living_situation: ['No preference'],
    education_level: 'No preference',
    english_proficiency: 'No preference',
    french_proficiency: 'No preference',
    religion: ['No preference'],
    religious_values: ['No preference'],
    polygamy: ['No preference']
  });

  const [countries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [isManualCity, setIsManualCity] = useState(false);

  useEffect(() => {
    if (criteria.countryCode) {
      setStates(State.getStatesOfCountry(criteria.countryCode));
    } else {
      setStates([]);
    }
    setCities([]);
    setIsManualCity(false);
  }, [criteria.countryCode]);

  useEffect(() => {
    if (criteria.countryCode && criteria.stateCode) {
      setCities(City.getCitiesOfState(criteria.countryCode, criteria.stateCode));
    } else {
      setCities([]);
    }
    setIsManualCity(false);
  }, [criteria.countryCode, criteria.stateCode]);

  useEffect(() => {
    const fetchCriteria = async () => {
      const data = await api.get('correspondance');
      if (data && data.length > 0) {
        setCriteria(data[data.length - 1]);
      }
    };
    fetchCriteria();
  }, []);

  const handleSend = async () => {
    await api.add('correspondance', criteria);
    if (onViewMatches) onViewMatches(criteria);
  };

  const toggleCheckbox = (field: string, value: string) => {
    setCriteria(prev => {
      const current = prev[field] || [];
      if (value === 'No preference') {
        return { ...prev, [field]: ['No preference'] };
      }
      let next = current.filter(v => v !== 'No preference');
      if (next.includes(value)) {
        next = next.filter(v => v !== value);
        if (next.length === 0) next = ['No preference'];
      } else {
        next = [...next, value];
      }
      return { ...prev, [field]: next };
    });
  };

  const renderCheckboxes = (field: string, options: string[]) => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {options.map(option => (
        <label key={option} className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={(criteria[field] || []).includes(option)}
            onChange={() => toggleCheckbox(field, option)}
            className="rounded border-orange-300 text-orange-500 focus:ring-orange-500" 
          />
          <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
        </label>
      ))}
    </div>
  );

  const renderRadios = (field: string, options: string[]) => (
    <div className="flex flex-wrap gap-4">
      {options.map(option => (
        <label key={option} className="flex items-center gap-2 cursor-pointer group">
          <input 
            type="radio" 
            name={field}
            checked={criteria[field] === option}
            onChange={() => setCriteria({...criteria, [field]: option})}
            className="border-orange-300 text-orange-500 focus:ring-orange-500" 
          />
          <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors">{option}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 sm:pb-20">
      <div className="max-w-4xl mx-auto px-0 sm:px-4 py-0 sm:py-8">
        <div className="bg-white sm:rounded-2xl shadow-sm border-b sm:border border-neutral-200 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={onBack} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200">
                <ArrowLeft className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-neutral-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-neutral-800">Matching criteria</h1>
                <p className="text-[10px] sm:text-sm text-neutral-500 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">Help us find you the perfect match.</p>
              </div>
            </div>
            <button onClick={() => onViewMatches && onViewMatches(criteria)} className="p-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-50 border border-neutral-200 rounded-lg flex items-center gap-2 transition-all">
              <Eye className="w-[14px] h-[14px] sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View My Correspondence</span>
            </button>
          </div>

          <div className="p-4 sm:p-8 space-y-8 sm:space-y-10">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">Looking</label>
                <div className="relative">
                  <select value={criteria.looking_for} onChange={(e) => setCriteria({...criteria, looking_for: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="both">Both</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-1.5 sm:mb-2">Age</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select value={criteria.age_min} onChange={(e) => setCriteria({...criteria, age_min: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                      <option value="">-</option>
                      {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (<option key={age} value={age}>{age}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                  </div>
                  <span className="text-neutral-400">-</span>
                  <div className="relative flex-1">
                    <select value={criteria.age_max} onChange={(e) => setCriteria({...criteria, age_max: e.target.value})} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                      <option value="">-</option>
                      {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (<option key={age} value={age}>{age}</option>))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div className="border-t border-neutral-100 pt-6 sm:pt-8">
              <button onClick={() => toggleSection('localisation')} className="flex items-center gap-2 text-orange-600 font-bold mb-4 sm:mb-6 hover:opacity-80 transition-opacity text-sm sm:text-base">
                {sections.localisation ? <ChevronDown className="w-[18px] h-[18px]" /> : <ChevronUp className="w-[18px] h-[18px]" />}
                Living in
              </button>
              {sections.localisation && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Country</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <select 
                          value={criteria.countryCode}
                          onChange={(e) => {
                            const country = countries.find(c => c.isoCode === e.target.value);
                            setCriteria({
                              ...criteria, 
                              countryCode: e.target.value, 
                              country: country ? country.name : '',
                              state_province: '',
                              stateCode: '',
                              city: ''
                            });
                          }}
                          className="w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        >
                          <option value="">Select Country</option>
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
                          value={criteria.stateCode}
                          disabled={!criteria.countryCode}
                          onChange={(e) => {
                            const state = states.find(s => s.isoCode === e.target.value);
                            setCriteria({
                              ...criteria, 
                              stateCode: e.target.value, 
                              state_province: state ? state.name : '',
                              city: ''
                            });
                          }}
                          className="w-full px-3 sm:px-4 pr-10 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm disabled:bg-neutral-50 disabled:text-neutral-400"
                        >
                          <option value="">Select State</option>
                          {states.map(s => (
                            <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 mb-1.5 sm:mb-2 uppercase tracking-wider">Ville</label>
                      <div className="relative space-y-2">
                        {!isManualCity ? (
                          <div className="relative">
                            <select 
                              value={criteria.city}
                              disabled={!criteria.stateCode}
                              onChange={(e) => {
                                if (e.target.value === 'OTHER') {
                                  setIsManualCity(true);
                                  setCriteria({...criteria, city: ''});
                                } else {
                                  setCriteria({...criteria, city: e.target.value});
                                }
                              }}
                              className="w-full px-3 sm:px-4 pr-10 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none focus:ring-2 focus:ring-orange-500 outline-none text-sm disabled:bg-neutral-50 disabled:text-neutral-400"
                            >
                              <option value="">Select City</option>
                              {cities.map(c => (
                                <option key={c.name} value={c.name}>{c.name}</option>
                              ))}
                              {criteria.stateCode && <option value="OTHER">+ Other (Manual entry)</option>}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
                          </div>
                        ) : (
                          <div className="relative flex gap-2">
                            <input 
                              type="text"
                              placeholder="Enter city name"
                              value={criteria.city}
                              onChange={(e) => setCriteria({...criteria, city: e.target.value})}
                              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                              autoFocus
                            />
                            <button 
                              onClick={() => setIsManualCity(false)}
                              className="px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-orange-600 hover:bg-orange-50 rounded-lg border border-orange-200 whitespace-nowrap"
                            >
                              Back to list
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm text-neutral-600">Dans un rayon de</span>
                    <input type="text" value={criteria.distance_km} onChange={(e) => setCriteria({...criteria, distance_km: e.target.value})} className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-neutral-200 rounded-lg text-center text-xs sm:text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                    <span className="text-xs sm:text-sm text-neutral-600">kms</span>
                  </div>
                </div>
              )}
            </div>

            {/* Apparence */}
            <div className="border-t border-neutral-100 pt-8">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => toggleSection('apparence')} className="flex items-center gap-2 text-orange-600 font-bold hover:opacity-80 transition-opacity">
                  {sections.apparence ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  Their appearance
                </button>
                <button className="text-xs font-bold px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">Show More</button>
              </div>
              {sections.apparence && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-medium text-orange-600 mb-1">Size:</label>
                      <p className="text-xs text-orange-400 mb-3">Between {criteria.height_min} and {criteria.height_max}</p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select value={criteria.height_min} onChange={(e) => setCriteria({...criteria, height_min: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                            <option>No preference</option>
                            {Array.from({ length: 100 }, (_, i) => i + 120).map(h => <option key={h} value={h}>{h} cm</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        </div>
                        <div className="relative flex-1">
                          <select value={criteria.height_max} onChange={(e) => setCriteria({...criteria, height_max: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                            <option>No preference</option>
                            {Array.from({ length: 100 }, (_, i) => i + 120).map(h => <option key={h} value={h}>{h} cm</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-600 mb-1">Weight:</label>
                      <p className="text-xs text-orange-400 mb-3">Between {criteria.weight_min} and {criteria.weight_max}</p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <select value={criteria.weight_min} onChange={(e) => setCriteria({...criteria, weight_min: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                            <option>No preference</option>
                            {Array.from({ length: 150 }, (_, i) => i + 40).map(w => <option key={w} value={w}>{w} kg</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        </div>
                        <div className="relative flex-1">
                          <select value={criteria.weight_max} onChange={(e) => setCriteria({...criteria, weight_max: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                            <option>No preference</option>
                            {Array.from({ length: 150 }, (_, i) => i + 40).map(w => <option key={w} value={w}>{w} kg</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Body:</label>
                    {renderCheckboxes('body_type', ['No preference', 'Little', 'Thin', 'Sporty', 'AVERAGE', 'A few extra kilos', 'Round', 'Large & magnificent'])}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Their ethnicity is primarily:</label>
                    {renderCheckboxes('ethnicity', ['No preference', 'African', 'African American', 'Afro-Caribbean', 'Arabic (from the Middle East)', 'Asian', 'Caucasian (White)', 'Hispanic / Latino', 'Indian', 'Metis', 'Pacific Islander', 'Other', 'I prefer not to comment.'])}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Hair color:</label>
                    {renderCheckboxes('hair_color', ['No preference', 'Bald / Shaved', 'Black', 'Blond', 'Brown', 'Grey / White', 'Chestnut', 'Redhead', 'I change often', 'Other'])}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Eye color:</label>
                    {renderCheckboxes('eye_color', ['No preference', 'Black', 'Blue', 'Brown', 'Green', 'Gray', 'Hazelnut', 'Other'])}
                  </div>

                  <div className="border-t border-neutral-100 pt-8">
                    <button onClick={() => toggleSection('bodyArt')} className="flex items-center gap-2 text-orange-600 font-bold mb-6 hover:opacity-80 transition-opacity">
                      {sections.bodyArt ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                      Body art
                    </button>
                    {sections.bodyArt && renderCheckboxes('body_art', ['No preference', 'Brand', 'Earrings', 'Piercing', 'Tattoo', 'None', 'Other', 'I prefer not to comment.'])}
                  </div>

                  <div className="border-t border-neutral-100 pt-8">
                    <button onClick={() => toggleSection('appearance')} className="flex items-center gap-2 text-orange-600 font-bold mb-6 hover:opacity-80 transition-opacity">
                      {sections.appearance ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                      Appearance
                    </button>
                    {sections.appearance && renderCheckboxes('appearance', ['No preference', 'Below average', 'Average', 'Attractive', 'Very attractive'])}
                  </div>
                </div>
              )}
            </div>

            {/* Mode de vie */}
            <div className="border-t border-neutral-100 pt-8">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => toggleSection('modeDeVie')} className="flex items-center gap-2 text-orange-600 font-bold hover:opacity-80 transition-opacity">
                  {sections.modeDeVie ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  Their lifestyle
                </button>
                <button className="text-xs font-bold px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">Show More</button>
              </div>
              {sections.modeDeVie && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Do they smoke?</label>
                    {renderCheckboxes('smoking', ['No preference', 'I smoke', 'I don\'t smoke', 'I smoke occasionally'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Do they drink?</label>
                    {renderCheckboxes('drinking', ['No preference', 'Drink', 'Don\'t drink', 'Wood on occasion'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Ready to move:</label>
                    {renderCheckboxes('ready_to_move', ['No preference', 'I would only move within my own country.', 'I would move to another country', 'I do not wish to move', 'I\'m not sure about moving'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Family situation:</label>
                    {renderCheckboxes('family_situation', ['No preference', 'Bachelor', 'Separated', 'Widower', 'Divorce', 'Other', 'I prefer not to comment.'])}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-600 mb-2">Do they have children?</label>
                      <div className="relative">
                        <select value={criteria.has_children} onChange={(e) => setCriteria({...criteria, has_children: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                          <option>No preference</option>
                          <option>Yes, and they live at home.</option>
                          <option>Yes, and they don't live at home.</option>
                          <option>No</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-600 mb-2">Number of children (or fewer):</label>
                      <div className="relative">
                        <select value={criteria.number_of_children_max} onChange={(e) => setCriteria({...criteria, number_of_children_max: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                          <option>No preference</option>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-orange-600 mb-2">Youngest child (or above):</label>
                      <div className="relative">
                        <select value={criteria.youngest_child_age} onChange={(e) => setCriteria({...criteria, youngest_child_age: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                          <option>No preference</option>
                          {Array.from({ length: 18 }, (_, i) => i).map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-600 mb-2">Oldest child (or younger):</label>
                      <div className="relative">
                        <select value={criteria.oldest_child_age} onChange={(e) => setCriteria({...criteria, oldest_child_age: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                          <option>No preference</option>
                          {Array.from({ length: 18 }, (_, i) => i).map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Do they want children (more children)?</label>
                    {renderCheckboxes('want_children', ['No preference', 'Yes', 'I\'m not sure', 'No'])}
                  </div>
                </div>
              )}
            </div>

            {/* Professional */}
            <div className="border-t border-neutral-100 pt-8">
              <button onClick={() => toggleSection('professional')} className="flex items-center gap-2 text-orange-600 font-bold mb-6 hover:opacity-80 transition-opacity">
                {sections.professional ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                Professional & Living
              </button>
              {sections.professional && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Occupation:</label>
                    {renderCheckboxes('occupation', ['No preference', 'Entertainment / Media', 'Hairdresser / Personal beauty treatments', 'Independent', 'Transportation', 'Administrative/Secretarial/Office Job', 'Advertising / Media', 'Artistic/creative/performance jobs', 'Building / Commerce', 'Home help', 'Teaching / University', 'Executive / Management / HR', 'Livestock farming / Agriculture', 'Finance / Banking / Real Estate', 'Firefighters / Police / Security', 'Information Technology / Communications', 'Farm worker / Industrial worker', 'Legal', 'Medical / Dental / Veterinary', 'Military', 'Nanny / Babysitter', 'Unemployed / Homemaker', 'Non-profit / Clergy / Social Services', 'Politics / Government / Civil Service', 'Retail / Food Services', 'Retirement', 'Sales / Marketing', 'Sports / Leisure', 'Student', 'Technology / Science / Engineering', 'Tourism / Hospitality', 'Unemployed', 'Other'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Professional status:</label>
                    {renderCheckboxes('professional_status', ['No preference', 'Student', 'Part-time work', 'Full time', 'Homemaker', 'Retirement', 'Unemployed', 'Other', 'I prefer not to comment.'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-2">Income (or above):</label>
                    <div className="relative">
                      <select value={criteria.annual_income_min} onChange={(e) => setCriteria({...criteria, annual_income_min: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl appearance-none text-sm outline-none">
                        <option>No preference</option>
                        <option>$0 - $25,000</option>
                        <option>$25,001 - $50,000</option>
                        <option>$50,001 - $75,000</option>
                        <option>$75,001 - $100,000</option>
                        <option>$100,001+</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Living situation:</label>
                    {renderCheckboxes('living_situation', ['No preference', 'I live alone', 'I live with friends', 'I live with my family', 'I live with my children', 'I live with my partner.', 'Other', 'I prefer not to comment.'])}
                  </div>
                </div>
              )}
            </div>

            {/* Cultural */}
            <div className="border-t border-neutral-100 pt-8">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => toggleSection('cultural')} className="flex items-center gap-2 text-orange-600 font-bold hover:opacity-80 transition-opacity">
                  {sections.cultural ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  Their cultural origins/values
                </button>
                <button className="text-xs font-bold px-3 py-1.5 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">Show More</button>
              </div>
              {sections.cultural && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Studies (or above):</label>
                    {renderRadios('education_level', ['No preference', 'Primary (elementary) school', 'College', 'High school', 'College of general and vocational education', 'License', 'Mastery', 'Doctorate'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">English language proficiency (or mastery):</label>
                    {renderRadios('english_proficiency', ['No preference', 'Don\'t speak', 'AVERAGE', 'Good', 'Very good', 'Good command'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">French language proficiency (or mastery):</label>
                    {renderRadios('french_proficiency', ['No preference', 'Don\'t speak', 'AVERAGE', 'Good', 'Very good', 'Good command'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Religion:</label>
                    {renderCheckboxes('religion', ['No preference', 'Basiste', 'Buddhist', 'Christian', 'Hindu', 'Islam', 'Jainism', 'Jewish', 'Parsi', 'Shintoism', 'Sikhism', 'Taoism', 'Other', 'Atheist', 'I prefer not to comment.'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Religious values:</label>
                    {renderCheckboxes('religious_values', ['No preference', 'I\'m not that religious.', 'Average', 'Very religious', 'I prefer not to comment.'])}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-600 mb-4">Polygamy:</label>
                    {renderCheckboxes('polygamy', ['No preference', 'I accept polygamy', 'I am against polygamy', 'I might accept polygamy'])}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-8 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button onClick={onBack} className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-100 transition-all shadow-sm order-2 sm:order-1">CANCEL</button>
            <button onClick={handleSend} className="w-full sm:w-auto px-8 sm:px-12 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 order-1 sm:order-2">
              <Send className="w-[18px] h-[18px]" />
              SEND
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
