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
import { ChevronDown, ArrowLeft, SlidersHorizontal } from 'lucide-react';

const Section = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex items-center justify-between w-full mb-4 text-left"
        onClick={() => setIsOpen(o => !o)}
      >
        <h3 className="text-amber-700 font-medium flex items-center gap-2">
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          {title}
        </h3>
      </button>
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

const DEFAULT = {
  looking_for: 'women',
  age_min: '',
  age_max: '',
  country: '',
  state: '',
  city: '',
  body_type: ['no_preference'],
  ethnicity: ['no_preference'],
  appearance: ['no_preference'],
  smoking: ['no_preference'],
  drinking: ['no_preference'],
  ready_to_move: ['no_preference'],
  has_children: '',
  annual_income_min: 'no_preference',
  education_level: 'no_preference',
  languages_spoken: [],
  english_proficiency: 'no_preference',
  french_proficiency: 'no_preference',
  religion: ['no_preference'],
  astrological_sign: ['no_preference'],
  relationship_looking_for: ['no_preference'],
};

export default function AdvancedFilter() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState(DEFAULT);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: existing } = useQuery({
    queryKey: ['advancedFilter', currentUser?.email],
    queryFn: async () => {
      const results = await base44.entities.AdvancedFilter.filter({ created_by: currentUser.email });
      return results[0] || null;
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (existing) setFilter(prev => ({ ...prev, ...existing }));
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existing?.id) return base44.entities.AdvancedFilter.update(existing.id, data);
      return base44.entities.AdvancedFilter.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedFilter'] });
      window.location.href = createPageUrl('Home');
    },
  });

  const handleArr = (field, value) => {
    setFilter(prev => {
      const current = prev[field] || [];
      if (value === 'no_preference') return { ...prev, [field]: ['no_preference'] };
      const without = current.filter(v => v !== 'no_preference');
      if (without.includes(value)) {
        const next = without.filter(v => v !== value);
        return { ...prev, [field]: next.length === 0 ? ['no_preference'] : next };
      }
      return { ...prev, [field]: [...without, value] };
    });
  };

  const isChecked = (field, value) => (filter[field] || []).includes(value);
  const ages = Array.from({ length: 63 }, (_, i) => i + 18);

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile', currentUser?.email],
    queryFn: async () => {
      const r = await base44.entities.Profile.filter({ created_by: currentUser.email });
      return r[0] || null;
    },
    enabled: !!currentUser,
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <Header user={myProfile} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Home')}>
                <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-6 h-6 text-amber-600" />
                  Filtre avancé
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Ces critères filtrent les profils affichés sur la page d'accueil. Ils sont sauvegardés en permanence.
                </p>
              </div>
            </div>
            <Button
              onClick={() => { setFilter(DEFAULT); }}
              variant="outline"
              size="sm"
              className="text-gray-500"
            >
              Réinitialiser
            </Button>
          </div>

          {/* Looking for + Age */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Je cherche</label>
              <Select value={filter.looking_for} onValueChange={v => setFilter(p => ({ ...p, looking_for: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="women">Femmes</SelectItem>
                  <SelectItem value="men">Hommes</SelectItem>
                  <SelectItem value="both">Les deux</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Âge min</label>
              <Select value={String(filter.age_min)} onValueChange={v => setFilter(p => ({ ...p, age_min: v }))}>
                <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                <SelectContent>
                  {ages.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Âge max</label>
              <Select value={String(filter.age_max)} onValueChange={v => setFilter(p => ({ ...p, age_max: v }))}>
                <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                <SelectContent>
                  {ages.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <Section title="Localisation">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Pays</label>
                <Input placeholder="Tous les pays" value={filter.country} onChange={e => setFilter(p => ({ ...p, country: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">État / Province</label>
                <Input placeholder="Tous" value={filter.state} onChange={e => setFilter(p => ({ ...p, state: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Ville</label>
                <Input placeholder="Toutes" value={filter.city} onChange={e => setFilter(p => ({ ...p, city: e.target.value }))} />
              </div>
            </div>
          </Section>

          {/* Apparence */}
          <Section title="Apparence" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Type de corps :</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['little','Petit(e)'],['thin','Mince'],['sporty','Sportif(ve)'],['average','Moyen(ne)'],['few_extra_kilos','Quelques kilos en plus'],['round','Rond(e)'],['large_magnificent','Grand(e) et magnifique']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('body_type', v)} onChange={() => handleArr('body_type', v)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Ethnicité :</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['african','Africain(e)'],['african_american','Afro-Américain(e)'],['afro_caribbean','Afro-Caribéen(ne)'],['arabic','Arabe'],['asian','Asiatique'],['caucasian','Caucasien(ne)'],['hispanic_latino','Hispanique / Latino'],['indian','Indien(ne)'],['metis','Métis(se)'],['pacific_islander','Insulaire du Pacifique'],['other','Autre'],['prefer_not_comment','Préfère ne pas commenter']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('ethnicity', v)} onChange={() => handleArr('ethnicity', v)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Apparence :</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['below_average','En dessous de la moyenne'],['average','Moyenne'],['attractive','Attrayant(e)'],['very_attractive','Très attrayant(e)']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('appearance', v)} onChange={() => handleArr('appearance', v)} />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Mode de vie */}
          <Section title="Mode de vie" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Fume-t-il/elle ?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['smoke','Fume'],['dont_smoke','Ne fume pas'],['smoke_occasionally','Fume occasionnellement']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('smoking', v)} onChange={() => handleArr('smoking', v)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Boit-il/elle ?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['drink','Boit'],['dont_drink','Ne boit pas'],['drink_occasionally','Boit occasionnellement']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('drinking', v)} onChange={() => handleArr('drinking', v)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Prêt(e) à déménager :</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['only_within_country','Dans son pays'],['to_another_country','Dans un autre pays'],['do_not_wish_to_move','Ne souhaite pas déménager'],['not_sure','Pas sûr(e)']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('ready_to_move', v)} onChange={() => handleArr('ready_to_move', v)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">A des enfants :</label>
                <Select value={filter.has_children} onValueChange={v => setFilter(p => ({ ...p, has_children: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pas de préférence" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Pas de préférence</SelectItem>
                    <SelectItem value="yes_live_home">Oui, vivent à la maison</SelectItem>
                    <SelectItem value="yes_not_home">Oui, ne vivent pas à la maison</SelectItem>
                    <SelectItem value="no">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Revenu annuel minimum :</label>
                <Select value={filter.annual_income_min} onValueChange={v => setFilter(p => ({ ...p, annual_income_min: v }))}>
                  <SelectTrigger><SelectValue placeholder="Pas de préférence" /></SelectTrigger>
                  <SelectContent>
                    {[['no_preference','Pas de préférence'],['0-25k','0 - 25k'],['25-50k','25k - 50k'],['50-75k','50k - 75k'],['75-100k','75k - 100k'],['100k+','100k+']].map(([v,l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Origines / Valeurs */}
          <Section title="Origines & Valeurs culturelles" defaultOpen={false}>
            <div className="space-y-4">
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Niveau d'éducation minimum :</label>
                <div className="flex flex-wrap gap-3">
                  {[['no_preference','Pas de préférence'],['primary_elementary','Primaire'],['college','Collège'],['high_school','Lycée'],['vocational_education','Formation professionnelle'],['license','Licence'],['mastery','Master'],['doctorate','Doctorat']].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="edu" checked={filter.education_level === v} onChange={() => setFilter(p => ({ ...p, education_level: v }))} className="accent-amber-500" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Niveau d'anglais minimum :</label>
                <div className="flex flex-wrap gap-3">
                  {[['no_preference','Pas de préférence'],['dont_speak','Ne parle pas'],['average','Moyen'],['good','Bien'],['very_good','Très bien'],['good_command','Maîtrise']].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="eng" checked={filter.english_proficiency === v} onChange={() => setFilter(p => ({ ...p, english_proficiency: v }))} className="accent-amber-500" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Niveau de français minimum :</label>
                <div className="flex flex-wrap gap-3">
                  {[['no_preference','Pas de préférence'],['dont_speak','Ne parle pas'],['average','Moyen'],['good','Bien'],['very_good','Très bien'],['good_command','Maîtrise']].map(([v,l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="fre" checked={filter.french_proficiency === v} onChange={() => setFilter(p => ({ ...p, french_proficiency: v }))} className="accent-amber-500" />
                      <span className="text-sm">{l}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Religion :</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['baptist','Baptiste'],['buddhist','Bouddhiste'],['christian','Chrétien(ne)'],['hindu','Hindou'],['islam','Islam'],['jainism','Jaïnisme'],['jewish','Juif/Juive'],['parsi','Parsi'],['shintoism','Shintoïsme'],['sikhism','Sikhisme'],['taoism','Taoïsme'],['atheist','Athée'],['other','Autre'],['prefer_not_comment','Préfère ne pas commenter']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('religion', v)} onChange={() => handleArr('religion', v)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-amber-700 text-sm mb-2 block">Signe astrologique :</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['no_preference','Pas de préférence'],['aquarius','Verseau'],['aries','Bélier'],['cancer','Cancer'],['capricorn','Capricorne'],['gemini','Gémeaux'],['leo','Lion'],['libra','Balance'],['pisces','Poissons'],['sagittarius','Sagittaire'],['scorpio','Scorpion'],['taurus','Taureau'],['virgo','Vierge'],['dont_know','Ne sait pas']].map(([v,l]) => (
                    <CheckboxField key={v} label={l} checked={isChecked('astrological_sign', v)} onChange={() => handleArr('astrological_sign', v)} />
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Type de relation */}
          <Section title="Type de relation recherché" defaultOpen={false}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[['no_preference','Pas de préférence'],['corresponding','Correspondance'],['friendship','Amitié'],['love_dating','Rencontres / Amour'],['long_term_relationship','Relation long terme']].map(([v,l]) => (
                <CheckboxField key={v} label={l} checked={isChecked('relationship_looking_for', v)} onChange={() => handleArr('relationship_looking_for', v)} />
              ))}
            </div>
          </Section>

          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => window.location.href = createPageUrl('Home')}
            >
              Annuler
            </Button>
            <Button
              onClick={() => saveMutation.mutate(filter)}
              className="bg-amber-600 hover:bg-amber-700 px-12"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer le filtre'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}