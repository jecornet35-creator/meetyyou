import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Lock } from 'lucide-react';

// Uses RestCountries + GeoDB Cities (public APIs, no key needed)

export default function LocationSelector({ country, state, city, onChange, countryLocked = false }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [countrySearch, setCountrySearch] = useState(country || '');
  const [stateSearch, setStateSearch] = useState(state || '');
  const [citySearch, setCitySearch] = useState(city || '');

  const [showCountryList, setShowCountryList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [showCityList, setShowCityList] = useState(false);

  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  // Sync external values
  useEffect(() => { setCountrySearch(country || ''); }, [country]);
  useEffect(() => { setStateSearch(state || ''); }, [state]);
  useEffect(() => { setCitySearch(city || ''); }, [city]);

  // Load countries on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
      .then(r => r.json())
      .then(data => {
        const sorted = data
          .map(c => ({ name: c.name.common, code: c.cca2 }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCountries(sorted);
      })
      .catch(() => {});
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountryCode) return;
    setLoadingStates(true);
    setStates([]);
    setStateSearch('');
    setCities([]);
    setCitySearch('');
    fetch(`https://countriesnow.space/api/v0.1/countries/states`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countrySearch }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.data?.states) {
          setStates(data.data.states.map(s => s.name));
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStates(false));
  }, [selectedCountryCode]);

  // Load cities when state changes
  const loadCities = (countryName, stateName) => {
    if (!stateName) return;
    setLoadingCities(true);
    setCities([]);
    fetch(`https://countriesnow.space/api/v0.1/countries/state/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: countryName, state: stateName }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.data) setCities(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingCities(false));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) setShowCountryList(false);
      if (stateRef.current && !stateRef.current.contains(e.target)) setShowStateList(false);
      if (cityRef.current && !cityRef.current.contains(e.target)) setShowCityList(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  ).slice(0, 50);

  const filteredStates = states.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  ).slice(0, 50);

  const filteredCities = cities.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  ).slice(0, 50);

  const handleSelectCountry = (c) => {
    setCountrySearch(c.name);
    setSelectedCountryCode(c.code);
    setShowCountryList(false);
    onChange({ country: c.name, state: '', city: '' });
  };

  const handleSelectState = (s) => {
    setStateSearch(s);
    setShowStateList(false);
    loadCities(countrySearch, s);
    onChange({ country: countrySearch, state: s, city: '' });
    setCitySearch('');
  };

  const handleSelectCity = (c) => {
    setCitySearch(c);
    setShowCityList(false);
    onChange({ country: countrySearch, state: stateSearch, city: c });
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400 bg-white";
  const dropdownClass = "absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto";

  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      {/* Country */}
      <div ref={countryRef} className="relative">
        <label className="block text-sm text-gray-600 mb-2 flex items-center gap-1">
          Country
          {countryLocked && <Lock className="w-3 h-3 text-amber-500" title="Détecté automatiquement" />}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className={`${inputClass} pl-9 ${countryLocked ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
            value={countrySearch}
            onChange={e => { setCountrySearch(e.target.value); setShowCountryList(true); }}
            onFocus={() => !countryLocked && setShowCountryList(true)}
            placeholder="Pays"
            readOnly={countryLocked}
          />
        </div>
        {showCountryList && !countryLocked && filteredCountries.length > 0 && (
          <div className={dropdownClass}>
            {filteredCountries.map(c => (
              <button
                key={c.code}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition-colors"
                onMouseDown={() => handleSelectCountry(c)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* State */}
      <div ref={stateRef} className="relative">
        <label className="block text-sm text-gray-600 mb-2">État / Province</label>
        <input
          className={inputClass}
          value={stateSearch}
          onChange={e => { setStateSearch(e.target.value); setShowStateList(true); }}
          onFocus={() => setShowStateList(true)}
          placeholder={loadingStates ? 'Chargement...' : 'État / Province'}
          disabled={!countrySearch}
        />
        {showStateList && filteredStates.length > 0 && (
          <div className={dropdownClass}>
            {filteredStates.map(s => (
              <button
                key={s}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition-colors"
                onMouseDown={() => handleSelectState(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City */}
      <div ref={cityRef} className="relative">
        <label className="block text-sm text-gray-600 mb-2">Ville</label>
        <input
          className={inputClass}
          value={citySearch}
          onChange={e => { setCitySearch(e.target.value); setShowCityList(true); }}
          onFocus={() => setShowCityList(true)}
          placeholder={loadingCities ? 'Chargement...' : 'Ville'}
          disabled={!stateSearch && !countrySearch}
        />
        {showCityList && filteredCities.length > 0 && (
          <div className={dropdownClass}>
            {filteredCities.map(c => (
              <button
                key={c}
                type="button"
                className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 transition-colors"
                onMouseDown={() => handleSelectCity(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}