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
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

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
  const [criteria, setCriteria] = useState({
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
      
      {/* Top navigation bar */}
      <div className="bg-amber-700 text-white">
        <div className="max-w-4xl mx-auto flex">
          <Link to={createPageUrl('EditProfile') + '?tab=photos'} className="px-6 py-3 hover:bg-amber-800">
            Photos
          </Link>
          <Link to={createPageUrl('EditProfile')} className="px-6 py-3 hover:bg-amber-800">
            Profile
          </Link>
          <div className="px-6 py-3 bg-white text-amber-700 font-medium">
            Correspondences
          </div>
          <Link to="#" className="px-6 py-3 hover:bg-amber-800">
            Flash
          </Link>
          <Link to="#" className="px-6 py-3 hover:bg-amber-800">
            Personality
          </Link>
          <Link to="#" className="px-6 py-3 hover:bg-amber-800">
            Verify Profile
          </Link>
        </div>
      </div>

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
                <Select value={criteria.country} onValueChange={(v) => setCriteria(prev => ({ ...prev, country: v }))}>
                  <SelectTrigger><SelectValue placeholder="All Countries" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="france">France</SelectItem>
                    <SelectItem value="usa">USA</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">State/Province</label>
                <Input placeholder="Any state" value={criteria.state_province} onChange={(e) => setCriteria(prev => ({ ...prev, state_province: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">City</label>
                <Input placeholder="Any City" value={criteria.city} onChange={(e) => setCriteria(prev => ({ ...prev, city: e.target.value }))} />
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

          {filterType === 'advanced' && (
            <>
              {/* Their lifestyle */}
              <Section title="Their lifestyle" showMore>
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
                </div>
              </Section>

              {/* Their cultural origins/values */}
              <Section title="Their cultural origins/values" showMore>
                <div className="space-y-4">
                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Religion:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('religion', 'no_preference')} onChange={() => handleCheckboxArray('religion', 'no_preference')} />
                      <CheckboxField label="Baptist" checked={isChecked('religion', 'baptist')} onChange={() => handleCheckboxArray('religion', 'baptist')} />
                      <CheckboxField label="Buddhist" checked={isChecked('religion', 'buddhist')} onChange={() => handleCheckboxArray('religion', 'buddhist')} />
                      <CheckboxField label="Christian" checked={isChecked('religion', 'christian')} onChange={() => handleCheckboxArray('religion', 'christian')} />
                      <CheckboxField label="Hindu" checked={isChecked('religion', 'hindu')} onChange={() => handleCheckboxArray('religion', 'hindu')} />
                      <CheckboxField label="Islam" checked={isChecked('religion', 'islam')} onChange={() => handleCheckboxArray('religion', 'islam')} />
                      <CheckboxField label="Jewish" checked={isChecked('religion', 'jewish')} onChange={() => handleCheckboxArray('religion', 'jewish')} />
                      <CheckboxField label="Other" checked={isChecked('religion', 'other')} onChange={() => handleCheckboxArray('religion', 'other')} />
                      <CheckboxField label="Atheist" checked={isChecked('religion', 'atheist')} onChange={() => handleCheckboxArray('religion', 'atheist')} />
                      <CheckboxField label="I prefer not to comment." checked={isChecked('religion', 'prefer_not_comment')} onChange={() => handleCheckboxArray('religion', 'prefer_not_comment')} />
                    </div>
                  </div>

                  <div>
                    <label className="text-amber-700 text-sm mb-2 block">Astrological sign:</label>
                    <div className="grid grid-cols-5 gap-3">
                      <CheckboxField label="No preference" checked={isChecked('astrological_sign', 'no_preference')} onChange={() => handleCheckboxArray('astrological_sign', 'no_preference')} />
                      <CheckboxField label="Aquarius" checked={isChecked('astrological_sign', 'aquarius')} onChange={() => handleCheckboxArray('astrological_sign', 'aquarius')} />
                      <CheckboxField label="Aries" checked={isChecked('astrological_sign', 'aries')} onChange={() => handleCheckboxArray('astrological_sign', 'aries')} />
                      <CheckboxField label="Cancer" checked={isChecked('astrological_sign', 'cancer')} onChange={() => handleCheckboxArray('astrological_sign', 'cancer')} />
                      <CheckboxField label="Capricorn" checked={isChecked('astrological_sign', 'capricorn')} onChange={() => handleCheckboxArray('astrological_sign', 'capricorn')} />
                      <CheckboxField label="Gemini" checked={isChecked('astrological_sign', 'gemini')} onChange={() => handleCheckboxArray('astrological_sign', 'gemini')} />
                      <CheckboxField label="Leo" checked={isChecked('astrological_sign', 'leo')} onChange={() => handleCheckboxArray('astrological_sign', 'leo')} />
                      <CheckboxField label="Libra" checked={isChecked('astrological_sign', 'libra')} onChange={() => handleCheckboxArray('astrological_sign', 'libra')} />
                      <CheckboxField label="Pisces" checked={isChecked('astrological_sign', 'pisces')} onChange={() => handleCheckboxArray('astrological_sign', 'pisces')} />
                      <CheckboxField label="Sagittarius" checked={isChecked('astrological_sign', 'sagittarius')} onChange={() => handleCheckboxArray('astrological_sign', 'sagittarius')} />
                      <CheckboxField label="Scorpio" checked={isChecked('astrological_sign', 'scorpio')} onChange={() => handleCheckboxArray('astrological_sign', 'scorpio')} />
                      <CheckboxField label="Taurus" checked={isChecked('astrological_sign', 'taurus')} onChange={() => handleCheckboxArray('astrological_sign', 'taurus')} />
                      <CheckboxField label="Virgo" checked={isChecked('astrological_sign', 'virgo')} onChange={() => handleCheckboxArray('astrological_sign', 'virgo')} />
                      <CheckboxField label="I don't know" checked={isChecked('astrological_sign', 'dont_know')} onChange={() => handleCheckboxArray('astrological_sign', 'dont_know')} />
                    </div>
                  </div>
                </div>
              </Section>
            </>
          )}

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