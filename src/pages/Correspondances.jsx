import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Country, State, City } from 'country-state-city';

const Section = ({ title, children, defaultOpen = true, showMore = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-amber-700 font-medium flex items-center gap-2">
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          {title}
        </h3>
        {showMore && (
          <Button variant="outline" size="sm" className="text-xs">
            Show More
          </Button>
        )}
      </div>
      {isOpen && children}
    </div>
  );
};

const CheckboxField = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <Checkbox
      checked={checked}
      onCheckedChange={onChange}
      className="border-amber-500 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
    />
    <span className="text-sm text-gray-700">{label}</span>
  </label>
);

export default function Correspondances() {
  const urlParams = new URLSearchParams(window.location.search);
  const filterType = urlParams.get('type') || 'simple';
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [criteria, setCriteria] = useState({
    profile_title: '',
    about_yourself: '',
    looking_for_in_partner: '',
    looking_for: 'women',
    age_min: '',
    age_max: '',
    country: '',
    state_province: '',
    city: '',
    distance_km: '',
    height_min: '',
    height_max: '',
    weight_min: '',
    weight_max: '',
    body_type: ['no_preference'],
    ethnicity: ['no_preference'],
    appearance: ['no_preference'],
    hair_color: ['no_preference'],
    eye_color: ['no_preference'],
    body_art: ['no_preference'],
    smoking: ['no_preference'],
    drinking: ['no_preference'],
    ready_to_move: ['no_preference'],
    family_situation: ['no_preference'],
    has_children: '',
    number_of_children_max: '',
    youngest_child_age: '',
    oldest_child_age: '',
    want_children: ['no_preference'],
    occupation: ['no_preference'],
    professional_status: ['no_preference'],
    annual_income_min: '',
    living_situation: ['no_preference'],
    nationality: [],
    education_level: 'no_preference',
    english_proficiency: 'no_preference',
    french_proficiency: 'no_preference',
    languages_spoken: [],
    religion: ['no_preference'],
    religious_values: ['no_preference'],
    polygamy: ['no_preference'],
    astrological_sign: ['no_preference'],
  });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: existingCriteria } = useQuery({
    queryKey: ['correspondance', currentUser?.email],
    queryFn: async () => {
      const results = await base44.entities.Correspondance.filter({ created_by: currentUser.email });
      return results[0];
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (existingCriteria) {
      setCriteria(prev => ({ ...prev, ...existingCriteria }));
    }
  }, [existingCriteria]);

  // Load states when country changes
  useEffect(() => {
    if (criteria.country) {
      const country = Country.getAllCountries().find(c => c.name === criteria.country);
      if (country) {
        setStates(State.getStatesOfCountry(country.isoCode));
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [criteria.country]);

  // Load cities when state changes
  useEffect(() => {
    if (criteria.country && criteria.state_province) {
      const country = Country.getAllCountries().find(c => c.name === criteria.country);
      const state = states.find(s => s.name === criteria.state_province);
      if (country && state) {
        setCities(City.getCitiesOfState(country.isoCode, state.isoCode));
      }
    } else {
      setCities([]);
    }
  }, [criteria.state_province, criteria.country, states]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingCriteria?.id) {
        return base44.entities.Correspondance.update(existingCriteria.id, data);
      } else {
        return base44.entities.Correspondance.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['correspondance'] });
    },
  });

  const handleCheckboxArray = (field, value) => {
    setCriteria(prev => {
      const current = prev[field] || [];
      if (value === 'no_preference') {
        return { ...prev, [field]: ['no_preference'] };
      }
      const withoutNoPreference = current.filter(v => v !== 'no_preference');
      if (withoutNoPreference.includes(value)) {
        const newArray = withoutNoPreference.filter(v => v !== value);
        return { ...prev, [field]: newArray.length === 0 ? ['no_preference'] : newArray };
      }
      return { ...prev, [field]: [...withoutNoPreference, value] };
    });
  };

  const isChecked = (field, value) => {
    return (criteria[field] || []).includes(value);
  };

  const ages = Array.from({ length: 63 }, (_, i) => i + 18);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-light text-gray-800">Modify the matching criteria</h1>
              <p className="text-gray-500 mt-2">
                Help us find you the perfect match by telling us what's important to you in a partner. 
                Answer the questions below and tell us what you're looking for.
              </p>
            </div>
            <Link to={createPageUrl('Home')}>
              <Button variant="outline" className="gap-2">
                View My Correspondence
              </Button>
            </Link>
          </div>

          {/* Basic filters */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Looking</label>
              <Select value={criteria.looking_for} onValueChange={(v) => setCriteria(prev => ({ ...prev, looking_for: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Age</label>
              <div className="flex gap-2">
                <Select value={criteria.age_min} onValueChange={(v) => setCriteria(prev => ({ ...prev, age_min: v }))}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    {ages.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={criteria.age_max} onValueChange={(v) => setCriteria(prev => ({ ...prev, age_max: v }))}>
                  <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                  <SelectContent>
                    {ages.map(a => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Living in */}
          <Section title="Living in">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Country</label>
                <Select 
                  value={criteria.country} 
                  onValueChange={(v) => setCriteria(prev => ({ ...prev, country: v, state_province: '', city: '' }))}
                >
                  <SelectTrigger><SelectValue placeholder="All Countries" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {Country.getAllCountries().map(country => (
                      <SelectItem key={country.isoCode} value={country.name}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">State/Province</label>
                <Select 
                  value={criteria.state_province} 
                  onValueChange={(v) => setCriteria(prev => ({ ...prev, state_province: v, city: '' }))}
                  disabled={!criteria.country || criteria.country === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={criteria.country && criteria.country !== 'all' ? "Select state" : "Select country first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state.isoCode} value={state.name}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">City</label>
                <Select 
                  value={criteria.city} 
                  onValueChange={(v) => setCriteria(prev => ({ ...prev, city: v }))}
                  disabled={!criteria.state_province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={criteria.state_province ? "Select city" : "Select state first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">between</label>
                <div className="flex items-center gap-2">
                  <Input placeholder="-" className="w-16" value={criteria.distance_km} onChange={(e) => setCriteria(prev => ({ ...prev, distance_km: e.target.value }))} />
                  <span className="text-gray-500">kms</span>
                </div>
              </div>
            </div>
          </Section>

          {/* Their appearance */}
          <Section title="Their appearance" showMore>
            <div className="space-y-4">
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Size:</label>
                <p className="text-amber-600 text-sm mb-2">Between No preference and No preference</p>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={criteria.height_min} onValueChange={(v) => setCriteria(prev => ({ ...prev, height_min: v }))}>
                    <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="150">150 cm</SelectItem>
                      <SelectItem value="160">160 cm</SelectItem>
                      <SelectItem value="170">170 cm</SelectItem>
                      <SelectItem value="180">180 cm</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={criteria.height_max} onValueChange={(v) => setCriteria(prev => ({ ...prev, height_max: v }))}>
                    <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="160">160 cm</SelectItem>
                      <SelectItem value="170">170 cm</SelectItem>
                      <SelectItem value="180">180 cm</SelectItem>
                      <SelectItem value="190">190 cm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-amber-700 text-sm mb-2 block">Weight:</label>
                <p className="text-amber-600 text-sm mb-2">Between No preference and No preference</p>
                <div className="grid grid-cols-2 gap-4">
                  <Select value={criteria.weight_min} onValueChange={(v) => setCriteria(prev => ({ ...prev, weight_min: v }))}>
                    <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="50">50 kg</SelectItem>
                      <SelectItem value="60">60 kg</SelectItem>
                      <SelectItem value="70">70 kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={criteria.weight_max} onValueChange={(v) => setCriteria(prev => ({ ...prev, weight_max: v }))}>
                    <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_preference">No preference</SelectItem>
                      <SelectItem value="60">60 kg</SelectItem>
                      <SelectItem value="70">70 kg</SelectItem>
                      <SelectItem value="80">80 kg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-amber-700 text-sm mb-2 block">Body:</label>
                <p className="text-amber-600 text-sm mb-2">No preference</p>
                <div className="grid grid-cols-5 gap-3">
                  <CheckboxField label="No preference" checked={isChecked('body_type', 'no_preference')} onChange={() => handleCheckboxArray('body_type', 'no_preference')} />
                  <CheckboxField label="Little" checked={isChecked('body_type', 'little')} onChange={() => handleCheckboxArray('body_type', 'little')} />
                  <CheckboxField label="Thin" checked={isChecked('body_type', 'thin')} onChange={() => handleCheckboxArray('body_type', 'thin')} />
                  <CheckboxField label="Sporty" checked={isChecked('body_type', 'sporty')} onChange={() => handleCheckboxArray('body_type', 'sporty')} />
                  <CheckboxField label="AVERAGE" checked={isChecked('body_type', 'average')} onChange={() => handleCheckboxArray('body_type', 'average')} />
                  <CheckboxField label="A few extra kilos" checked={isChecked('body_type', 'few_extra_kilos')} onChange={() => handleCheckboxArray('body_type', 'few_extra_kilos')} />
                  <CheckboxField label="Round" checked={isChecked('body_type', 'round')} onChange={() => handleCheckboxArray('body_type', 'round')} />
                  <CheckboxField label="Large & magnificent" checked={isChecked('body_type', 'large_magnificent')} onChange={() => handleCheckboxArray('body_type', 'large_magnificent')} />
                </div>
              </div>

              <div>
                <label className="text-amber-700 text-sm mb-2 block">Their ethnicity is primarily:</label>
                <p className="text-amber-600 text-sm mb-2">No preference</p>
                <div className="grid grid-cols-5 gap-3">
                  <CheckboxField label="No preference" checked={isChecked('ethnicity', 'no_preference')} onChange={() => handleCheckboxArray('ethnicity', 'no_preference')} />
                  <CheckboxField label="African" checked={isChecked('ethnicity', 'african')} onChange={() => handleCheckboxArray('ethnicity', 'african')} />
                  <CheckboxField label="African American" checked={isChecked('ethnicity', 'african_american')} onChange={() => handleCheckboxArray('ethnicity', 'african_american')} />
                  <CheckboxField label="Afro-Caribbean" checked={isChecked('ethnicity', 'afro_caribbean')} onChange={() => handleCheckboxArray('ethnicity', 'afro_caribbean')} />
                  <CheckboxField label="Arabic (from the Middle East)" checked={isChecked('ethnicity', 'arabic')} onChange={() => handleCheckboxArray('ethnicity', 'arabic')} />
                  <CheckboxField label="Asian" checked={isChecked('ethnicity', 'asian')} onChange={() => handleCheckboxArray('ethnicity', 'asian')} />
                  <CheckboxField label="Caucasian (White)" checked={isChecked('ethnicity', 'caucasian')} onChange={() => handleCheckboxArray('ethnicity', 'caucasian')} />
                  <CheckboxField label="Hispanic / Latino" checked={isChecked('ethnicity', 'hispanic_latino')} onChange={() => handleCheckboxArray('ethnicity', 'hispanic_latino')} />
                  <CheckboxField label="Indian" checked={isChecked('ethnicity', 'indian')} onChange={() => handleCheckboxArray('ethnicity', 'indian')} />
                  <CheckboxField label="Metis" checked={isChecked('ethnicity', 'metis')} onChange={() => handleCheckboxArray('ethnicity', 'metis')} />
                  <CheckboxField label="Pacific Islander" checked={isChecked('ethnicity', 'pacific_islander')} onChange={() => handleCheckboxArray('ethnicity', 'pacific_islander')} />
                  <CheckboxField label="Other" checked={isChecked('ethnicity', 'other')} onChange={() => handleCheckboxArray('ethnicity', 'other')} />
                  <CheckboxField label="I prefer not to comment." checked={isChecked('ethnicity', 'prefer_not_comment')} onChange={() => handleCheckboxArray('ethnicity', 'prefer_not_comment')} />
                </div>
              </div>

              <div>
                <label className="text-amber-700 text-sm mb-2 block">Hair color:</label>
                <p className="text-amber-600 text-sm mb-2">No preference</p>
                <div className="grid grid-cols-5 gap-3">
                  <CheckboxField label="No preference" checked={isChecked('hair_color', 'no_preference')} onChange={() => handleCheckboxArray('hair_color', 'no_preference')} />
                  <CheckboxField label="Bald / Shaved" checked={isChecked('hair_color', 'bald_shaved')} onChange={() => handleCheckboxArray('hair_color', 'bald_shaved')} />
                  <CheckboxField label="Black" checked={isChecked('hair_color', 'black')} onChange={() => handleCheckboxArray('hair_color', 'black')} />
                  <CheckboxField label="Blond" checked={isChecked('hair_color', 'blond')} onChange={() => handleCheckboxArray('hair_color', 'blond')} />
                  <CheckboxField label="Brown" checked={isChecked('hair_color', 'brown')} onChange={() => handleCheckboxArray('hair_color', 'brown')} />
                  <CheckboxField label="Grey / White" checked={isChecked('hair_color', 'grey_white')} onChange={() => handleCheckboxArray('hair_color', 'grey_white')} />
                  <CheckboxField label="Chestnut" checked={isChecked('hair_color', 'chestnut')} onChange={() => handleCheckboxArray('hair_color', 'chestnut')} />
                  <CheckboxField label="Redhead" checked={isChecked('hair_color', 'redhead')} onChange={() => handleCheckboxArray('hair_color', 'redhead')} />
                  <CheckboxField label="I change often" checked={isChecked('hair_color', 'change_often')} onChange={() => handleCheckboxArray('hair_color', 'change_often')} />
                  <CheckboxField label="Other" checked={isChecked('hair_color', 'other')} onChange={() => handleCheckboxArray('hair_color', 'other')} />
                </div>
              </div>

              <div>
                <label className="text-amber-700 text-sm mb-2 block">Eye color:</label>
                <p className="text-amber-600 text-sm mb-2">No preference</p>
                <div className="grid grid-cols-5 gap-3">
                  <CheckboxField label="No preference" checked={isChecked('eye_color', 'no_preference')} onChange={() => handleCheckboxArray('eye_color', 'no_preference')} />
                  <CheckboxField label="Black" checked={isChecked('eye_color', 'black')} onChange={() => handleCheckboxArray('eye_color', 'black')} />
                  <CheckboxField label="Blue" checked={isChecked('eye_color', 'blue')} onChange={() => handleCheckboxArray('eye_color', 'blue')} />
                  <CheckboxField label="Brown" checked={isChecked('eye_color', 'brown')} onChange={() => handleCheckboxArray('eye_color', 'brown')} />
                  <CheckboxField label="Green" checked={isChecked('eye_color', 'green')} onChange={() => handleCheckboxArray('eye_color', 'green')} />
                  <CheckboxField label="Gray" checked={isChecked('eye_color', 'gray')} onChange={() => handleCheckboxArray('eye_color', 'gray')} />
                  <CheckboxField label="Hazelnut" checked={isChecked('eye_color', 'hazelnut')} onChange={() => handleCheckboxArray('eye_color', 'hazelnut')} />
                  <CheckboxField label="Other" checked={isChecked('eye_color', 'other')} onChange={() => handleCheckboxArray('eye_color', 'other')} />
                </div>
              </div>
            </div>
          </Section>

          {/* Body art */}
          <Section title="Body art" defaultOpen={false}>
            <div className="grid grid-cols-5 gap-3">
              <CheckboxField label="No preference" checked={isChecked('body_art', 'no_preference')} onChange={() => handleCheckboxArray('body_art', 'no_preference')} />
              <CheckboxField label="Brand" checked={isChecked('body_art', 'brand')} onChange={() => handleCheckboxArray('body_art', 'brand')} />
              <CheckboxField label="Earrings" checked={isChecked('body_art', 'earrings')} onChange={() => handleCheckboxArray('body_art', 'earrings')} />
              <CheckboxField label="Piercing" checked={isChecked('body_art', 'piercing')} onChange={() => handleCheckboxArray('body_art', 'piercing')} />
              <CheckboxField label="Tattoo" checked={isChecked('body_art', 'tattoo')} onChange={() => handleCheckboxArray('body_art', 'tattoo')} />
              <CheckboxField label="None" checked={isChecked('body_art', 'none')} onChange={() => handleCheckboxArray('body_art', 'none')} />
              <CheckboxField label="Other" checked={isChecked('body_art', 'other')} onChange={() => handleCheckboxArray('body_art', 'other')} />
              <CheckboxField label="I prefer not to comment." checked={isChecked('body_art', 'prefer_not_comment')} onChange={() => handleCheckboxArray('body_art', 'prefer_not_comment')} />
            </div>
          </Section>

          {/* Appearance */}
          <Section title="Appearance" defaultOpen={false}>
            <div className="grid grid-cols-4 gap-3">
              <CheckboxField label="No preference" checked={isChecked('appearance', 'no_preference')} onChange={() => handleCheckboxArray('appearance', 'no_preference')} />
              <CheckboxField label="Below average" checked={isChecked('appearance', 'below_average')} onChange={() => handleCheckboxArray('appearance', 'below_average')} />
              <CheckboxField label="Average" checked={isChecked('appearance', 'average')} onChange={() => handleCheckboxArray('appearance', 'average')} />
              <CheckboxField label="Attractive" checked={isChecked('appearance', 'attractive')} onChange={() => handleCheckboxArray('appearance', 'attractive')} />
              <CheckboxField label="Very attractive" checked={isChecked('appearance', 'very_attractive')} onChange={() => handleCheckboxArray('appearance', 'very_attractive')} />
            </div>
          </Section>

          {/* Their lifestyle */}
          <Section title="Their lifestyle" showMore defaultOpen={false}>
                <div className="space-y-4">
                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Do they smoke?</label>
                    <div className="grid grid-cols-4 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('smoking', 'no_preference')} onChange={() => handleCheckboxArray('smoking', 'no_preference')} />
                      <CheckboxField label="I smoke" checked={isChecked('smoking', 'smoke')} onChange={() => handleCheckboxArray('smoking', 'smoke')} />
                      <CheckboxField label="I don't smoke" checked={isChecked('smoking', 'dont_smoke')} onChange={() => handleCheckboxArray('smoking', 'dont_smoke')} />
                      <CheckboxField label="I smoke occasionally" checked={isChecked('smoking', 'smoke_occasionally')} onChange={() => handleCheckboxArray('smoking', 'smoke_occasionally')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Do they drink?</label>
                    <div className="grid grid-cols-4 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('drinking', 'no_preference')} onChange={() => handleCheckboxArray('drinking', 'no_preference')} />
                      <CheckboxField label="Drink" checked={isChecked('drinking', 'drink')} onChange={() => handleCheckboxArray('drinking', 'drink')} />
                      <CheckboxField label="Don't drink" checked={isChecked('drinking', 'dont_drink')} onChange={() => handleCheckboxArray('drinking', 'dont_drink')} />
                      <CheckboxField label="Wood on occasion" checked={isChecked('drinking', 'drink_occasionally')} onChange={() => handleCheckboxArray('drinking', 'drink_occasionally')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Ready to move:</label>
                    <div className="grid grid-cols-4 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('ready_to_move', 'no_preference')} onChange={() => handleCheckboxArray('ready_to_move', 'no_preference')} />
                      <CheckboxField label="I would only move within my own country." checked={isChecked('ready_to_move', 'only_within_country')} onChange={() => handleCheckboxArray('ready_to_move', 'only_within_country')} />
                      <CheckboxField label="I would move to another country" checked={isChecked('ready_to_move', 'to_another_country')} onChange={() => handleCheckboxArray('ready_to_move', 'to_another_country')} />
                      <CheckboxField label="I do not wish to move" checked={isChecked('ready_to_move', 'do_not_wish_to_move')} onChange={() => handleCheckboxArray('ready_to_move', 'do_not_wish_to_move')} />
                      <CheckboxField label="I'm not sure about moving" checked={isChecked('ready_to_move', 'not_sure')} onChange={() => handleCheckboxArray('ready_to_move', 'not_sure')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Family situation:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('family_situation', 'no_preference')} onChange={() => handleCheckboxArray('family_situation', 'no_preference')} />
                      <CheckboxField label="Bachelor" checked={isChecked('family_situation', 'bachelor')} onChange={() => handleCheckboxArray('family_situation', 'bachelor')} />
                      <CheckboxField label="Separated" checked={isChecked('family_situation', 'separated')} onChange={() => handleCheckboxArray('family_situation', 'separated')} />
                      <CheckboxField label="Widower" checked={isChecked('family_situation', 'widower')} onChange={() => handleCheckboxArray('family_situation', 'widower')} />
                      <CheckboxField label="Divorce" checked={isChecked('family_situation', 'divorce')} onChange={() => handleCheckboxArray('family_situation', 'divorce')} />
                      <CheckboxField label="Other" checked={isChecked('family_situation', 'other')} onChange={() => handleCheckboxArray('family_situation', 'other')} />
                      <CheckboxField label="I prefer not to comment." checked={isChecked('family_situation', 'prefer_not_comment')} onChange={() => handleCheckboxArray('family_situation', 'prefer_not_comment')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Do they have children?</label>
                    <Select value={criteria.has_children} onValueChange={(v) => setCriteria(prev => ({ ...prev, has_children: v }))}>
                      <SelectTrigger><SelectValue placeholder="Yes, and they live at home." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes_live_home">Yes, and they live at home.</SelectItem>
                        <SelectItem value="yes_not_home">Yes, they don't live at home.</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Number of children (or fewer):</label>
                    <Select value={criteria.number_of_children_max} onValueChange={(v) => setCriteria(prev => ({ ...prev, number_of_children_max: v }))}>
                      <SelectTrigger><SelectValue placeholder="2" /></SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Youngest child (or above):</label>
                    <Select value={criteria.youngest_child_age} onValueChange={(v) => setCriteria(prev => ({ ...prev, youngest_child_age: v }))}>
                      <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_preference">No preference</SelectItem>
                        <SelectItem value="0-5">0-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="16+">16+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Oldest child (or younger):</label>
                    <Select value={criteria.oldest_child_age} onValueChange={(v) => setCriteria(prev => ({ ...prev, oldest_child_age: v }))}>
                      <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_preference">No preference</SelectItem>
                        <SelectItem value="0-5">0-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="16+">16+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Do they want children (more children)?</label>
                    <div className="grid grid-cols-4 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('want_children', 'no_preference')} onChange={() => handleCheckboxArray('want_children', 'no_preference')} />
                      <CheckboxField label="Yes" checked={isChecked('want_children', 'yes')} onChange={() => handleCheckboxArray('want_children', 'yes')} />
                      <CheckboxField label="I'm not sure" checked={isChecked('want_children', 'not_sure')} onChange={() => handleCheckboxArray('want_children', 'not_sure')} />
                      <CheckboxField label="No" checked={isChecked('want_children', 'no')} onChange={() => handleCheckboxArray('want_children', 'no')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Occupation:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('occupation', 'no_preference')} onChange={() => handleCheckboxArray('occupation', 'no_preference')} />
                      <CheckboxField label="Entertainment / Media" checked={isChecked('occupation', 'entertainment_media')} onChange={() => handleCheckboxArray('occupation', 'entertainment_media')} />
                      <CheckboxField label="Hairdresser / Personal beauty treatments" checked={isChecked('occupation', 'hairdresser_beauty')} onChange={() => handleCheckboxArray('occupation', 'hairdresser_beauty')} />
                      <CheckboxField label="Independent" checked={isChecked('occupation', 'independent')} onChange={() => handleCheckboxArray('occupation', 'independent')} />
                      <CheckboxField label="Transportation" checked={isChecked('occupation', 'transportation')} onChange={() => handleCheckboxArray('occupation', 'transportation')} />
                      <CheckboxField label="Administrative/Secretarial/Office Job" checked={isChecked('occupation', 'administrative_office')} onChange={() => handleCheckboxArray('occupation', 'administrative_office')} />
                      <CheckboxField label="Advertising / Media" checked={isChecked('occupation', 'advertising_media')} onChange={() => handleCheckboxArray('occupation', 'advertising_media')} />
                      <CheckboxField label="Artistic/creative/performance jobs" checked={isChecked('occupation', 'artistic_creative')} onChange={() => handleCheckboxArray('occupation', 'artistic_creative')} />
                      <CheckboxField label="Building / Commerce" checked={isChecked('occupation', 'building_commerce')} onChange={() => handleCheckboxArray('occupation', 'building_commerce')} />
                      <CheckboxField label="Home help" checked={isChecked('occupation', 'home_help')} onChange={() => handleCheckboxArray('occupation', 'home_help')} />
                      <CheckboxField label="Teaching / University" checked={isChecked('occupation', 'teaching_university')} onChange={() => handleCheckboxArray('occupation', 'teaching_university')} />
                      <CheckboxField label="Executive / Management / HR" checked={isChecked('occupation', 'executive_management')} onChange={() => handleCheckboxArray('occupation', 'executive_management')} />
                      <CheckboxField label="Livestock farming / Agriculture" checked={isChecked('occupation', 'livestock_farming')} onChange={() => handleCheckboxArray('occupation', 'livestock_farming')} />
                      <CheckboxField label="Finance / Banking / Real Estate" checked={isChecked('occupation', 'finance_banking')} onChange={() => handleCheckboxArray('occupation', 'finance_banking')} />
                      <CheckboxField label="Firefighters / Police / Security" checked={isChecked('occupation', 'firefighters_police')} onChange={() => handleCheckboxArray('occupation', 'firefighters_police')} />
                      <CheckboxField label="Information Technology / Communications" checked={isChecked('occupation', 'information_technology')} onChange={() => handleCheckboxArray('occupation', 'information_technology')} />
                      <CheckboxField label="Farm worker / Industrial worker" checked={isChecked('occupation', 'farm_worker')} onChange={() => handleCheckboxArray('occupation', 'farm_worker')} />
                      <CheckboxField label="Legal" checked={isChecked('occupation', 'legal')} onChange={() => handleCheckboxArray('occupation', 'legal')} />
                      <CheckboxField label="Medical / Dental / Veterinary" checked={isChecked('occupation', 'medical_dental')} onChange={() => handleCheckboxArray('occupation', 'medical_dental')} />
                      <CheckboxField label="Military" checked={isChecked('occupation', 'military')} onChange={() => handleCheckboxArray('occupation', 'military')} />
                      <CheckboxField label="Nanny / Babysitter" checked={isChecked('occupation', 'nanny_babysitter')} onChange={() => handleCheckboxArray('occupation', 'nanny_babysitter')} />
                      <CheckboxField label="Unemployed / Homemaker" checked={isChecked('occupation', 'unemployed_homemaker')} onChange={() => handleCheckboxArray('occupation', 'unemployed_homemaker')} />
                      <CheckboxField label="Non-profit / Clergy / Social Services" checked={isChecked('occupation', 'nonprofit_clergy')} onChange={() => handleCheckboxArray('occupation', 'nonprofit_clergy')} />
                      <CheckboxField label="Politics / Government / Civil Service" checked={isChecked('occupation', 'politics_government')} onChange={() => handleCheckboxArray('occupation', 'politics_government')} />
                      <CheckboxField label="Retail / Food Services" checked={isChecked('occupation', 'retail_food')} onChange={() => handleCheckboxArray('occupation', 'retail_food')} />
                      <CheckboxField label="Retirement" checked={isChecked('occupation', 'retirement')} onChange={() => handleCheckboxArray('occupation', 'retirement')} />
                      <CheckboxField label="Sales / Marketing" checked={isChecked('occupation', 'sales_marketing')} onChange={() => handleCheckboxArray('occupation', 'sales_marketing')} />
                      <CheckboxField label="Sports / Leisure" checked={isChecked('occupation', 'sports_leisure')} onChange={() => handleCheckboxArray('occupation', 'sports_leisure')} />
                      <CheckboxField label="Student" checked={isChecked('occupation', 'student')} onChange={() => handleCheckboxArray('occupation', 'student')} />
                      <CheckboxField label="Technology / Science / Engineering" checked={isChecked('occupation', 'technology_science')} onChange={() => handleCheckboxArray('occupation', 'technology_science')} />
                      <CheckboxField label="Tourism / Hospitality" checked={isChecked('occupation', 'tourism_hospitality')} onChange={() => handleCheckboxArray('occupation', 'tourism_hospitality')} />
                      <CheckboxField label="Unemployed" checked={isChecked('occupation', 'unemployed')} onChange={() => handleCheckboxArray('occupation', 'unemployed')} />
                      <CheckboxField label="Other" checked={isChecked('occupation', 'other')} onChange={() => handleCheckboxArray('occupation', 'other')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Professional status:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('professional_status', 'no_preference')} onChange={() => handleCheckboxArray('professional_status', 'no_preference')} />
                      <CheckboxField label="Student" checked={isChecked('professional_status', 'student')} onChange={() => handleCheckboxArray('professional_status', 'student')} />
                      <CheckboxField label="Part-time work" checked={isChecked('professional_status', 'part_time')} onChange={() => handleCheckboxArray('professional_status', 'part_time')} />
                      <CheckboxField label="Full time" checked={isChecked('professional_status', 'full_time')} onChange={() => handleCheckboxArray('professional_status', 'full_time')} />
                      <CheckboxField label="Homemaker" checked={isChecked('professional_status', 'homemaker')} onChange={() => handleCheckboxArray('professional_status', 'homemaker')} />
                      <CheckboxField label="Retirement" checked={isChecked('professional_status', 'retirement')} onChange={() => handleCheckboxArray('professional_status', 'retirement')} />
                      <CheckboxField label="Unemployed" checked={isChecked('professional_status', 'unemployed')} onChange={() => handleCheckboxArray('professional_status', 'unemployed')} />
                      <CheckboxField label="Other" checked={isChecked('professional_status', 'other')} onChange={() => handleCheckboxArray('professional_status', 'other')} />
                      <CheckboxField label="I prefer not to comment." checked={isChecked('professional_status', 'prefer_not_comment')} onChange={() => handleCheckboxArray('professional_status', 'prefer_not_comment')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Income (or above):</label>
                    <Select value={criteria.annual_income_min} onValueChange={(v) => setCriteria(prev => ({ ...prev, annual_income_min: v }))}>
                      <SelectTrigger><SelectValue placeholder="No preference" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_preference">No preference</SelectItem>
                        <SelectItem value="0-25k">0-25k</SelectItem>
                        <SelectItem value="25-50k">25-50k</SelectItem>
                        <SelectItem value="50-75k">50-75k</SelectItem>
                        <SelectItem value="75-100k">75-100k</SelectItem>
                        <SelectItem value="100k+">100k+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Living situation:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('living_situation', 'no_preference')} onChange={() => handleCheckboxArray('living_situation', 'no_preference')} />
                      <CheckboxField label="I live alone" checked={isChecked('living_situation', 'live_alone')} onChange={() => handleCheckboxArray('living_situation', 'live_alone')} />
                      <CheckboxField label="I live with friends" checked={isChecked('living_situation', 'live_with_friends')} onChange={() => handleCheckboxArray('living_situation', 'live_with_friends')} />
                      <CheckboxField label="I live with my family" checked={isChecked('living_situation', 'live_with_family')} onChange={() => handleCheckboxArray('living_situation', 'live_with_family')} />
                      <CheckboxField label="I live with my children" checked={isChecked('living_situation', 'live_with_children')} onChange={() => handleCheckboxArray('living_situation', 'live_with_children')} />
                      <CheckboxField label="I live with my partner." checked={isChecked('living_situation', 'live_with_partner')} onChange={() => handleCheckboxArray('living_situation', 'live_with_partner')} />
                      <CheckboxField label="Other" checked={isChecked('living_situation', 'other')} onChange={() => handleCheckboxArray('living_situation', 'other')} />
                      <CheckboxField label="I prefer not to comment." checked={isChecked('living_situation', 'prefer_not_comment')} onChange={() => handleCheckboxArray('living_situation', 'prefer_not_comment')} />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Their cultural origins/values */}
              <Section title="Their cultural origins/values" showMore>
                <div className="space-y-4">
                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Nationality:</label>
                    <Input placeholder="No preference" value={criteria.nationality.join(', ')} onChange={(e) => setCriteria(prev => ({ ...prev, nationality: e.target.value.split(',').map(v => v.trim()) }))} />
                    <p className="text-xs text-gray-500 mt-1">* Use the Ctrl key for multiple selections</p>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Studies (or above):</label>
                    <div className="flex flex-wrap gap-2">
                      {['no_preference', 'primary_elementary', 'college', 'high_school', 'vocational_education', 'license', 'mastery', 'doctorate'].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="education"
                            checked={criteria.education_level === level}
                            onChange={() => setCriteria(prev => ({ ...prev, education_level: level }))}
                            className="text-amber-500"
                          />
                          <span className="text-sm">
                            {level === 'no_preference' && 'No preference'}
                            {level === 'primary_elementary' && 'Primary (elementary) school'}
                            {level === 'college' && 'College'}
                            {level === 'high_school' && 'High school'}
                            {level === 'vocational_education' && 'College of general and vocational education'}
                            {level === 'license' && 'License'}
                            {level === 'mastery' && 'Mastery'}
                            {level === 'doctorate' && 'Doctorate'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">English language proficiency (or mastery):</label>
                    <div className="flex flex-wrap gap-2">
                      {['no_preference', 'dont_speak', 'average', 'good', 'very_good', 'good_command'].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="english"
                            checked={criteria.english_proficiency === level}
                            onChange={() => setCriteria(prev => ({ ...prev, english_proficiency: level }))}
                            className="text-amber-500"
                          />
                          <span className="text-sm">
                            {level === 'no_preference' && 'No preference'}
                            {level === 'dont_speak' && "Don't speak"}
                            {level === 'average' && 'AVERAGE'}
                            {level === 'good' && 'Good'}
                            {level === 'very_good' && 'Very good'}
                            {level === 'good_command' && 'Good command'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">French language proficiency (or mastery):</label>
                    <div className="flex flex-wrap gap-2">
                      {['no_preference', 'dont_speak', 'average', 'good', 'very_good', 'good_command'].map((level) => (
                        <label key={level} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="french"
                            checked={criteria.french_proficiency === level}
                            onChange={() => setCriteria(prev => ({ ...prev, french_proficiency: level }))}
                            className="text-amber-500"
                          />
                          <span className="text-sm">
                            {level === 'no_preference' && 'No preference'}
                            {level === 'dont_speak' && "Don't speak"}
                            {level === 'average' && 'AVERAGE'}
                            {level === 'good' && 'Good'}
                            {level === 'very_good' && 'Very good'}
                            {level === 'good_command' && 'Good command'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Languages spoken:</label>
                    <Input placeholder="Any language" value={criteria.languages_spoken.join(', ')} onChange={(e) => setCriteria(prev => ({ ...prev, languages_spoken: e.target.value.split(',').map(v => v.trim()) }))} />
                    <p className="text-xs text-gray-500 mt-1">* Use the Ctrl key for multiple selections</p>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Religion:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('religion', 'no_preference')} onChange={() => handleCheckboxArray('religion', 'no_preference')} />
                      <CheckboxField label="Basiste" checked={isChecked('religion', 'baptist')} onChange={() => handleCheckboxArray('religion', 'baptist')} />
                      <CheckboxField label="Buddhist" checked={isChecked('religion', 'buddhist')} onChange={() => handleCheckboxArray('religion', 'buddhist')} />
                      <CheckboxField label="Christian" checked={isChecked('religion', 'christian')} onChange={() => handleCheckboxArray('religion', 'christian')} />
                      <CheckboxField label="Hindu" checked={isChecked('religion', 'hindu')} onChange={() => handleCheckboxArray('religion', 'hindu')} />
                      <CheckboxField label="Islam" checked={isChecked('religion', 'islam')} onChange={() => handleCheckboxArray('religion', 'islam')} />
                      <CheckboxField label="Jainism" checked={isChecked('religion', 'jainism')} onChange={() => handleCheckboxArray('religion', 'jainism')} />
                      <CheckboxField label="Jewish" checked={isChecked('religion', 'jewish')} onChange={() => handleCheckboxArray('religion', 'jewish')} />
                      <CheckboxField label="Parsi" checked={isChecked('religion', 'parsi')} onChange={() => handleCheckboxArray('religion', 'parsi')} />
                      <CheckboxField label="Shintoism" checked={isChecked('religion', 'shintoism')} onChange={() => handleCheckboxArray('religion', 'shintoism')} />
                      <CheckboxField label="Sikhism" checked={isChecked('religion', 'sikhism')} onChange={() => handleCheckboxArray('religion', 'sikhism')} />
                      <CheckboxField label="Taoism" checked={isChecked('religion', 'taoism')} onChange={() => handleCheckboxArray('religion', 'taoism')} />
                      <CheckboxField label="Other" checked={isChecked('religion', 'other')} onChange={() => handleCheckboxArray('religion', 'other')} />
                      <CheckboxField label="Atheist" checked={isChecked('religion', 'atheist')} onChange={() => handleCheckboxArray('religion', 'atheist')} />
                      <CheckboxField label="I prefer not to comment." checked={isChecked('religion', 'prefer_not_comment')} onChange={() => handleCheckboxArray('religion', 'prefer_not_comment')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Religious values:</label>
                    <div className="grid grid-cols-4 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('religious_values', 'no_preference')} onChange={() => handleCheckboxArray('religious_values', 'no_preference')} />
                      <CheckboxField label="I'm not that religious." checked={isChecked('religious_values', 'not_religious')} onChange={() => handleCheckboxArray('religious_values', 'not_religious')} />
                      <CheckboxField label="Average" checked={isChecked('religious_values', 'average')} onChange={() => handleCheckboxArray('religious_values', 'average')} />
                      <CheckboxField label="Very religious" checked={isChecked('religious_values', 'very_religious')} onChange={() => handleCheckboxArray('religious_values', 'very_religious')} />
                      <CheckboxField label="I prefer not to comment." checked={isChecked('religious_values', 'prefer_not_comment')} onChange={() => handleCheckboxArray('religious_values', 'prefer_not_comment')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Polygamy:</label>
                    <div className="grid grid-cols-4 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('polygamy', 'no_preference')} onChange={() => handleCheckboxArray('polygamy', 'no_preference')} />
                      <CheckboxField label="I accept polygamy" checked={isChecked('polygamy', 'accept')} onChange={() => handleCheckboxArray('polygamy', 'accept')} />
                      <CheckboxField label="I am against polygamy" checked={isChecked('polygamy', 'against')} onChange={() => handleCheckboxArray('polygamy', 'against')} />
                      <CheckboxField label="I might accept polygamy" checked={isChecked('polygamy', 'might_accept')} onChange={() => handleCheckboxArray('polygamy', 'might_accept')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Astrological sign:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('astrological_sign', 'no_preference')} onChange={() => handleCheckboxArray('astrological_sign', 'no_preference')} />
                      <CheckboxField label="Aquarius" checked={isChecked('astrological_sign', 'aquarius')} onChange={() => handleCheckboxArray('astrological_sign', 'aquarius')} />
                      <CheckboxField label="Gemini" checked={isChecked('astrological_sign', 'gemini')} onChange={() => handleCheckboxArray('astrological_sign', 'gemini')} />
                      <CheckboxField label="Scorpio" checked={isChecked('astrological_sign', 'scorpio')} onChange={() => handleCheckboxArray('astrological_sign', 'scorpio')} />
                      <CheckboxField label="Ram" checked={isChecked('astrological_sign', 'aries')} onChange={() => handleCheckboxArray('astrological_sign', 'aries')} />
                      <CheckboxField label="Lion" checked={isChecked('astrological_sign', 'leo')} onChange={() => handleCheckboxArray('astrological_sign', 'leo')} />
                      <CheckboxField label="Bull" checked={isChecked('astrological_sign', 'taurus')} onChange={() => handleCheckboxArray('astrological_sign', 'taurus')} />
                      <CheckboxField label="Cancer" checked={isChecked('astrological_sign', 'cancer')} onChange={() => handleCheckboxArray('astrological_sign', 'cancer')} />
                      <CheckboxField label="Balance" checked={isChecked('astrological_sign', 'libra')} onChange={() => handleCheckboxArray('astrological_sign', 'libra')} />
                      <CheckboxField label="Virgin" checked={isChecked('astrological_sign', 'virgo')} onChange={() => handleCheckboxArray('astrological_sign', 'virgo')} />
                      <CheckboxField label="Capricorn" checked={isChecked('astrological_sign', 'capricorn')} onChange={() => handleCheckboxArray('astrological_sign', 'capricorn')} />
                      <CheckboxField label="Pisces" checked={isChecked('astrological_sign', 'pisces')} onChange={() => handleCheckboxArray('astrological_sign', 'pisces')} />
                      <CheckboxField label="Sagittarius" checked={isChecked('astrological_sign', 'sagittarius')} onChange={() => handleCheckboxArray('astrological_sign', 'sagittarius')} />
                      <CheckboxField label="I don't know" checked={isChecked('astrological_sign', 'dont_know')} onChange={() => handleCheckboxArray('astrological_sign', 'dont_know')} />
                    </div>
                  </div>
                </div>
              </Section>

          {/* In your own words */}
          <Section title="In your own words">
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-sm mb-2 block flex items-center gap-2">
                  Your profile title:
                  <span className="bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">i</span>
                </label>
                <Input 
                  value={criteria.profile_title} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, profile_title: e.target.value }))} 
                  placeholder="Your profile title"
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm mb-2 block">A glimpse of yourself:</label>
                <Textarea 
                  value={criteria.about_yourself} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, about_yourself: e.target.value }))} 
                  placeholder="A glimpse of yourself"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm mb-2 block">What you are looking for in a partner:</label>
                <Textarea 
                  value={criteria.looking_for_in_partner} 
                  onChange={(e) => setCriteria(prev => ({ ...prev, looking_for_in_partner: e.target.value }))} 
                  placeholder="What you are looking for in a partner"
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </Section>

          {/* Submit button */}
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => saveMutation.mutate(criteria)}
              className="bg-amber-600 hover:bg-amber-700 px-12"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : 'SEND'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}