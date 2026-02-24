import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Camera, Eye, Upload, X } from 'lucide-react';
import LocationSelector from '@/components/location/LocationSelector';
import { base44 } from '@/api/base44Client';

const SectionTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-amber-700 mb-4 mt-8 first:mt-0">{children}</h2>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm text-gray-600 mb-2">
    {children}{required && <span className="text-red-500">*</span>}
  </label>
);

const RadioGroup = ({ label, options, value, onChange, columns = 5 }) => (
  <div className="mb-6">
    <FieldLabel>{label}</FieldLabel>
    <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-2`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
          <input
            type="radio"
            name={label}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const CheckboxGroup = ({ label, options, values = [], onChange }) => (
  <div className="mb-6">
    <FieldLabel>{label}</FieldLabel>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
          <Checkbox
            checked={values?.includes(option.value)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...(values || []), option.value]);
              } else {
                onChange((values || []).filter(v => v !== option.value));
              }
            }}
          />
          <span className="text-sm text-gray-700">{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

export default function EditProfile() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState({});
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [countryLocked, setCountryLocked] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab') || 'profile';
    setActiveTab(tab);
  }, []);

  const { data: existingProfile, isLoading } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const currentUser = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ created_by: currentUser.email });
      return profiles[0] || null;
    },
  });

  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
      // Auto-detect country from IP only if empty
      if (!existingProfile.country) {
        base44.functions.invoke('detectCountryFromIP').then(res => {
          if (res.data?.country) {
            setProfile(prev => ({ ...prev, country: res.data.country }));
            setCountryLocked(true);
          }
        }).catch(() => {});
      } else {
        setCountryLocked(true); // Already set, lock it
      }
    }
  }, [existingProfile]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingProfile?.id) {
        return base44.entities.Profile.update(existingProfile.id, data);
      } else {
        return base44.entities.Profile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      toast.success('Profil sauvegardé avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    },
  });

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(profile);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadPromises = files.map(file => base44.integrations.Core.UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const newPhotoUrls = results.map(r => r.file_url);
      
      const updatedPhotos = [...(profile.photos || []), ...newPhotoUrls];
      const updatedProfile = {
        ...profile,
        photos: updatedPhotos,
        main_photo: profile.main_photo || updatedPhotos[0]
      };
      
      setProfile(updatedProfile);
      saveMutation.mutate(updatedProfile);
      toast.success('Photo(s) ajoutée(s) avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (photoUrl) => {
    const updatedPhotos = (profile.photos || []).filter(p => p !== photoUrl);
    const updatedProfile = {
      ...profile,
      photos: updatedPhotos,
      main_photo: profile.main_photo === photoUrl ? updatedPhotos[0] : profile.main_photo
    };
    setProfile(updatedProfile);
    saveMutation.mutate(updatedProfile);
  };

  const handleSetMainPhoto = (photoUrl) => {
    const updatedProfile = { ...profile, main_photo: photoUrl };
    setProfile(updatedProfile);
    saveMutation.mutate(updatedProfile);
    toast.success('Photo principale mise à jour');
  };

  const months = [
    { value: 'january', label: 'Janvier' },
    { value: 'february', label: 'Février' },
    { value: 'march', label: 'Mars' },
    { value: 'april', label: 'Avril' },
    { value: 'may', label: 'Mai' },
    { value: 'june', label: 'Juin' },
    { value: 'july', label: 'Juillet' },
    { value: 'august', label: 'Août' },
    { value: 'september', label: 'Septembre' },
    { value: 'october', label: 'Octobre' },
    { value: 'november', label: 'Novembre' },
    { value: 'december', label: 'Décembre' },
  ];

  const years = Array.from({ length: 80 }, (_, i) => 2006 - i);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      


      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {activeTab === 'photos' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mes Photos</h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Ajoutez des photos pour rendre votre profil plus attractif. La première photo sera votre photo principale.
                  </p>
                </div>
                <Link to={createPageUrl('ProfileDetail') + `?id=${existingProfile?.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Voir mon profil
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">
                      {uploadingPhoto ? 'Upload en cours...' : 'Cliquez pour ajouter des photos'}
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG jusqu'à 10MB</p>
                  </label>
                </div>

                {profile.photos && profile.photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {profile.main_photo === photo && (
                          <Badge className="absolute top-2 left-2 bg-amber-500">
                            Photo principale
                          </Badge>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          {profile.main_photo !== photo && (
                            <Button
                              size="sm"
                              onClick={() => handleSetMainPhoto(photo)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Photo principale
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemovePhoto(photo)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit My Profile</h1>
                  <p className="text-gray-600 text-sm mt-1">
                    Answering these profile questions allows other users to find you in search results and helps us find you more relevant matches.
                    <span className="text-amber-600"> Answer all the questions below to complete this step.</span>
                  </p>
                </div>
                <Link to={createPageUrl('ProfileDetail') + `?id=${existingProfile?.id}`}>
                  <Button variant="outline" className="gap-2">
                    <Eye className="w-4 h-4" />
                    View my profile
                  </Button>
                </Link>
              </div>

              <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <SectionTitle>Your basic information</SectionTitle>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <FieldLabel>First name</FieldLabel>
                <Input
                  value={profile.first_name || ''}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  placeholder="Your first name"
                />
              </div>
              <div>
                <FieldLabel>Display name</FieldLabel>
                <Input
                  value={profile.display_name || ''}
                  onChange={(e) => updateField('display_name', e.target.value)}
                  placeholder="Name shown on your profile"
                />
              </div>
            </div>

            <RadioGroup
              label="I am a:"
              options={[
                { value: 'homme', label: 'Man' },
                { value: 'femme', label: 'Woman' },
                { value: 'autre', label: 'Other' },
              ]}
              value={profile.gender}
              onChange={(v) => updateField('gender', v)}
              columns={3}
            />

            <div className="mb-6">
              <FieldLabel>Date of birth</FieldLabel>
              <p className="text-xs text-amber-600 mb-2">*To protect your privacy, we only keep your month and year of birth.</p>
              <div className="flex gap-4">
                <Select value={profile.birth_month} onValueChange={(v) => updateField('birth_month', v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={profile.birth_year?.toString()} onValueChange={(v) => updateField('birth_year', parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <FieldLabel>Country</FieldLabel>
                <Input
                  value={profile.country || ''}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Country"
                />
              </div>
              <div>
                <FieldLabel>State/Province</FieldLabel>
                <Input
                  value={profile.state || ''}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="State/Province"
                />
              </div>
              <div>
                <FieldLabel>City</FieldLabel>
                <Input
                  value={profile.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="City"
                />
              </div>
            </div>

            {/* Appearance */}
            <SectionTitle>Your appearance</SectionTitle>

            <RadioGroup
              label="Hair color:"
              options={[
                { value: 'bald_shaved', label: 'Bald / Shaved' },
                { value: 'black', label: 'Black' },
                { value: 'blond', label: 'Blond' },
                { value: 'brown', label: 'Brown' },
                { value: 'grey_white', label: 'Grey / White' },
                { value: 'chestnut', label: 'Chestnut' },
                { value: 'redhead', label: 'Redhead' },
                { value: 'change_often', label: 'I change often' },
                { value: 'other', label: 'Other' },
              ]}
              value={profile.hair_color}
              onChange={(v) => updateField('hair_color', v)}
            />

            <RadioGroup
              label="Eye color:"
              options={[
                { value: 'black', label: 'Black' },
                { value: 'blue', label: 'Blue' },
                { value: 'brown', label: 'Brown' },
                { value: 'green', label: 'Green' },
                { value: 'gray', label: 'Gray' },
                { value: 'hazelnut', label: 'Hazelnut' },
                { value: 'other', label: 'Other' },
              ]}
              value={profile.eye_color}
              onChange={(v) => updateField('eye_color', v)}
            />

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <FieldLabel>Height</FieldLabel>
                <Input
                  value={profile.height || ''}
                  onChange={(e) => updateField('height', e.target.value)}
                  placeholder="e.g. 175 cm"
                />
              </div>
              <div>
                <FieldLabel>Weight</FieldLabel>
                <Input
                  value={profile.weight || ''}
                  onChange={(e) => updateField('weight', e.target.value)}
                  placeholder="e.g. 70 kg"
                />
              </div>
            </div>

            <RadioGroup
              label="Body:"
              options={[
                { value: 'little', label: 'Little' },
                { value: 'thin', label: 'Thin' },
                { value: 'sporty', label: 'Sporty' },
                { value: 'average', label: 'Average' },
                { value: 'few_extra_kilos', label: 'A few extra kilos' },
                { value: 'round', label: 'Round' },
                { value: 'large_magnificent', label: 'Large & magnificent' },
              ]}
              value={profile.body_type}
              onChange={(v) => updateField('body_type', v)}
            />

            <RadioGroup
              label="Your ethnicity is primarily:"
              options={[
                { value: 'african', label: 'African' },
                { value: 'african_american', label: 'African American' },
                { value: 'afro_caribbean', label: 'Afro-Caribbean' },
                { value: 'arabic', label: 'Arabic' },
                { value: 'asian', label: 'Asian' },
                { value: 'caucasian', label: 'Caucasian (White)' },
                { value: 'hispanic_latino', label: 'Hispanic / Latino' },
                { value: 'indian', label: 'Indian' },
                { value: 'metis', label: 'Metis' },
                { value: 'pacific_islander', label: 'Pacific Islander' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_comment', label: 'I prefer not to comment' },
              ]}
              value={profile.ethnicity}
              onChange={(v) => updateField('ethnicity', v)}
              columns={4}
            />

            <CheckboxGroup
              label="Body art:"
              options={[
                { value: 'brand', label: 'Brand' },
                { value: 'earrings', label: 'Earrings' },
                { value: 'piercing', label: 'Piercing' },
                { value: 'tattoo', label: 'Tattoo' },
                { value: 'other', label: 'Other' },
                { value: 'none', label: 'None' },
                { value: 'prefer_not_comment', label: 'I prefer not to comment' },
              ]}
              values={profile.body_art}
              onChange={(v) => updateField('body_art', v)}
            />

            <RadioGroup
              label="I consider my appearance to be:"
              options={[
                { value: 'below_average', label: 'Below average' },
                { value: 'average', label: 'Average' },
                { value: 'attractive', label: 'Attractive' },
                { value: 'very_attractive', label: 'Very attractive' },
              ]}
              value={profile.appearance}
              onChange={(v) => updateField('appearance', v)}
              columns={4}
            />

            {/* Lifestyle */}
            <SectionTitle>Your lifestyle</SectionTitle>

            <RadioGroup
              label="Do you drink?"
              options={[
                { value: 'drink', label: 'Drink' },
                { value: 'dont_drink', label: "Don't drink" },
                { value: 'wood_on_occasion', label: 'Wood on occasion' },
              ]}
              value={profile.drinking}
              onChange={(v) => updateField('drinking', v)}
              columns={3}
            />

            <RadioGroup
              label="Do you smoke?"
              options={[
                { value: 'smoke', label: 'I smoke' },
                { value: 'dont_smoke', label: "I don't smoke" },
                { value: 'smoke_occasionally', label: 'I smoke occasionally' },
              ]}
              value={profile.smoking}
              onChange={(v) => updateField('smoking', v)}
              columns={3}
            />

            <RadioGroup
              label="Family situation:"
              options={[
                { value: 'bachelor', label: 'Bachelor' },
                { value: 'separated', label: 'Separated' },
                { value: 'widower', label: 'Widower' },
                { value: 'divorce', label: 'Divorce' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_comment', label: 'I prefer not to comment' },
              ]}
              value={profile.family_situation}
              onChange={(v) => updateField('family_situation', v)}
              columns={3}
            />

            <RadioGroup
              label="Do you want children (more children)?"
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'not_sure', label: "I'm not sure" },
                { value: 'no', label: 'No' },
              ]}
              value={profile.want_children}
              onChange={(v) => updateField('want_children', v)}
              columns={3}
            />

            {/* Occupation */}
            <SectionTitle>Occupation</SectionTitle>

            <RadioGroup
              label="Occupation:"
              options={[
                { value: 'entertainment_media', label: 'Entertainment / Media' },
                { value: 'hairdresser_beauty', label: 'Hairdresser / Personal beauty' },
                { value: 'independent', label: 'Independent' },
                { value: 'transportation', label: 'Transportation' },
                { value: 'administrative_office', label: 'Administrative / Office' },
                { value: 'teaching_university', label: 'Teaching / University' },
                { value: 'finance_banking', label: 'Finance / Banking' },
                { value: 'information_technology', label: 'Information Technology' },
                { value: 'medical_dental', label: 'Medical / Dental' },
                { value: 'sales_marketing', label: 'Sales / Marketing' },
                { value: 'student', label: 'Student' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'other', label: 'Other' },
              ]}
              value={profile.occupation}
              onChange={(v) => updateField('occupation', v)}
              columns={4}
            />

            <RadioGroup
              label="Professional status:"
              options={[
                { value: 'student', label: 'Student' },
                { value: 'part_time', label: 'Part-time work' },
                { value: 'full_time', label: 'Full time' },
                { value: 'homemaker', label: 'Homemaker' },
                { value: 'retirement', label: 'Retirement' },
                { value: 'unemployed', label: 'Unemployed' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_comment', label: 'I prefer not to comment' },
              ]}
              value={profile.professional_status}
              onChange={(v) => updateField('professional_status', v)}
              columns={4}
            />

            {/* Living */}
            <SectionTitle>Living situation</SectionTitle>

            <RadioGroup
              label="Living situation:"
              options={[
                { value: 'live_alone', label: 'I live alone' },
                { value: 'live_with_friends', label: 'I live with friends' },
                { value: 'live_with_family', label: 'I live with my family' },
                { value: 'live_with_children', label: 'I live with my children' },
                { value: 'live_with_partner', label: 'I live with my partner' },
                { value: 'other', label: 'Other' },
                { value: 'prefer_not_comment', label: 'I prefer not to comment' },
              ]}
              value={profile.living_situation}
              onChange={(v) => updateField('living_situation', v)}
              columns={4}
            />

            <RadioGroup
              label="Ready to move:"
              options={[
                { value: 'only_within_country', label: 'I would only move within my own country' },
                { value: 'to_another_country', label: 'I would move to another country' },
                { value: 'do_not_wish_to_move', label: 'I do not wish to move' },
                { value: 'not_sure', label: "I'm not sure about moving" },
              ]}
              value={profile.ready_to_move}
              onChange={(v) => updateField('ready_to_move', v)}
              columns={2}
            />

            <CheckboxGroup
              label="Relationship you are looking for:"
              options={[
                { value: 'corresponding', label: 'Corresponding' },
                { value: 'friendship', label: 'Friendship' },
                { value: 'love_dating', label: 'Love / Dating' },
                { value: 'long_term_relationship', label: 'Long-term relationship' },
              ]}
              values={profile.relationship_looking_for}
              onChange={(v) => updateField('relationship_looking_for', v)}
            />

            {/* Cultural origins */}
            <SectionTitle>Your cultural origins/values</SectionTitle>

            <div className="mb-6">
              <FieldLabel>Nationality</FieldLabel>
              <Input
                value={profile.nationality || ''}
                onChange={(e) => updateField('nationality', e.target.value)}
                placeholder="Your nationality"
              />
            </div>

            <RadioGroup
              label="Education level:"
              options={[
                { value: 'primary_elementary', label: 'Primary (elementary) school' },
                { value: 'college', label: 'College' },
                { value: 'high_school', label: 'High school' },
                { value: 'vocational_education', label: 'Vocational education' },
                { value: 'license', label: 'License' },
                { value: 'mastery', label: 'Mastery' },
                { value: 'doctorate', label: 'Doctorate' },
              ]}
              value={profile.education_level}
              onChange={(v) => updateField('education_level', v)}
              columns={4}
            />

            <RadioGroup
              label="English language proficiency:"
              options={[
                { value: 'dont_speak', label: "Don't speak" },
                { value: 'average', label: 'Average' },
                { value: 'good', label: 'Good' },
                { value: 'very_good', label: 'Very good' },
                { value: 'good_command', label: 'Good command' },
              ]}
              value={profile.english_proficiency}
              onChange={(v) => updateField('english_proficiency', v)}
            />

            <RadioGroup
              label="French language proficiency:"
              options={[
                { value: 'dont_speak', label: "Don't speak" },
                { value: 'average', label: 'Average' },
                { value: 'good', label: 'Good' },
                { value: 'very_good', label: 'Very good' },
                { value: 'good_command', label: 'Good command' },
              ]}
              value={profile.french_proficiency}
              onChange={(v) => updateField('french_proficiency', v)}
            />

            <div className="mb-6">
              <FieldLabel>Religion</FieldLabel>
              <Input
                value={profile.religion || ''}
                onChange={(e) => updateField('religion', e.target.value)}
                placeholder="Your religion"
              />
            </div>

            <RadioGroup
              label="Religious values:"
              options={[
                { value: 'not_religious', label: "I'm not that religious" },
                { value: 'average', label: 'Average' },
                { value: 'very_religious', label: 'Very religious' },
                { value: 'prefer_not_comment', label: 'I prefer not to comment' },
              ]}
              value={profile.religious_values}
              onChange={(v) => updateField('religious_values', v)}
              columns={4}
            />

            <RadioGroup
              label="Polygamy:"
              options={[
                { value: 'accept', label: 'I accept polygamy' },
                { value: 'against', label: 'I am against polygamy' },
                { value: 'might_accept', label: 'I might accept polygamy' },
              ]}
              value={profile.polygamy}
              onChange={(v) => updateField('polygamy', v)}
              columns={3}
            />

            <RadioGroup
              label="Astrological sign:"
              options={[
                { value: 'aquarius', label: 'Aquarius' },
                { value: 'aries', label: 'Aries' },
                { value: 'cancer', label: 'Cancer' },
                { value: 'capricorn', label: 'Capricorn' },
                { value: 'gemini', label: 'Gemini' },
                { value: 'leo', label: 'Leo' },
                { value: 'libra', label: 'Libra' },
                { value: 'pisces', label: 'Pisces' },
                { value: 'sagittarius', label: 'Sagittarius' },
                { value: 'scorpio', label: 'Scorpio' },
                { value: 'taurus', label: 'Taurus' },
                { value: 'virgo', label: 'Virgo' },
                { value: 'dont_know', label: "I don't know" },
              ]}
              value={profile.astrological_sign}
              onChange={(v) => updateField('astrological_sign', v)}
              columns={4}
            />

            {/* In your own words */}
            <SectionTitle>In your own words</SectionTitle>

            <div className="mb-6">
              <FieldLabel>Your profile title</FieldLabel>
              <Input
                value={profile.profile_title || ''}
                onChange={(e) => updateField('profile_title', e.target.value)}
                placeholder="A catchy title for your profile"
                maxLength={50}
              />
            </div>

            <div className="mb-6">
              <FieldLabel>A glimpse of yourself</FieldLabel>
              <Textarea
                value={profile.about_me || ''}
                onChange={(e) => updateField('about_me', e.target.value)}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>

            <div className="mb-6">
              <FieldLabel>What you are looking for in a partner</FieldLabel>
              <Textarea
                value={profile.looking_for_in_partner || ''}
                onChange={(e) => updateField('looking_for_in_partner', e.target.value)}
                placeholder="Describe your ideal partner..."
                rows={4}
              />
            </div>

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 px-12 py-3 text-lg"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? 'Saving...' : 'SEND'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}