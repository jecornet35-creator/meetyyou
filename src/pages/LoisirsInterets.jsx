import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Heart, Target, Book, X, Plus, Loader2 } from 'lucide-react';

const predefinedInterests = [
  'Voyages', 'Lecture', 'Cuisine', 'Sport', 'Musique', 'Cinéma',
  'Photographie', 'Danse', 'Yoga', 'Randonnée', 'Natation', 'Vélo',
  'Art', 'Théâtre', 'Jardinage', 'Mode', 'Technologies', 'Gaming',
  'Méditation', 'Bénévolat', 'Animaux', 'Nature', 'Astronomie', 'Écriture'
];

const predefinedHobbies = [
  'Course à pied', 'Fitness', 'Football', 'Tennis', 'Basketball',
  'Peinture', 'Dessin', 'Guitare', 'Piano', 'Chant', 'Photographie',
  'Bricolage', 'Décoration', 'Collection', 'Jeux vidéo', 'Échecs',
  'Poker', 'Scrapbooking', 'Tricot', 'Couture', 'Pâtisserie', 'Oenologie'
];

const valuesOptions = [
  { value: 'family', label: '👨‍👩‍👧 Famille' },
  { value: 'career', label: '💼 Carrière' },
  { value: 'health', label: '💪 Santé' },
  { value: 'spirituality', label: '🙏 Spiritualité' },
  { value: 'adventure', label: '🏔️ Aventure' },
  { value: 'creativity', label: '🎨 Créativité' },
  { value: 'honesty', label: '✨ Honnêteté' },
  { value: 'loyalty', label: '🤝 Loyauté' },
  { value: 'independence', label: '🦅 Indépendance' },
  { value: 'generosity', label: '❤️ Générosité' },
  { value: 'humor', label: '😄 Humour' },
  { value: 'ambition', label: '🎯 Ambition' },
  { value: 'compassion', label: '🤗 Compassion' },
  { value: 'respect', label: '🙌 Respect' },
  { value: 'communication', label: '💬 Communication' },
  { value: 'tradition', label: '📜 Tradition' },
  { value: 'innovation', label: '💡 Innovation' },
  { value: 'freedom', label: '🕊️ Liberté' },
  { value: 'security', label: '🛡️ Sécurité' },
  { value: 'romance', label: '💕 Romance' }
];

const relationshipGoalsOptions = [
  { value: 'marriage', label: '💍 Mariage' },
  { value: 'long_term_partner', label: '❤️ Partenaire à long terme' },
  { value: 'companionship', label: '🤝 Compagnie' },
  { value: 'family', label: '👨‍👩‍👧 Fonder une famille' },
  { value: 'shared_adventures', label: '🌍 Aventures partagées' },
  { value: 'emotional_support', label: '💗 Soutien émotionnel' },
  { value: 'personal_growth', label: '🌱 Croissance personnelle' },
  { value: 'fun_connection', label: '😊 Connexion amusante' },
  { value: 'life_partner', label: '💑 Partenaire de vie' },
  { value: 'friendship_first', label: '👫 Amitié d\'abord' }
];

export default function LoisirsInterets() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [customInterest, setCustomInterest] = useState('');
  const [customHobby, setCustomHobby] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ 
        created_by: currentUser.email 
      });
      return profiles[0] || null;
    },
    enabled: !!currentUser,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data) => {
      if (profile?.id) {
        return base44.entities.Profile.update(profile.id, data);
      }
      return base44.entities.Profile.create({ ...data, created_by: currentUser.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profil mis à jour avec succès');
      setSaving(false);
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour');
      setSaving(false);
    }
  });

  const toggleInterest = (interest) => {
    const currentInterests = profile?.interests || [];
    const newInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    updateProfileMutation.mutate({ interests: newInterests });
  };

  const addCustomInterest = () => {
    if (!customInterest.trim()) return;
    const currentInterests = profile?.interests || [];
    if (currentInterests.includes(customInterest.trim())) {
      toast.info('Cet intérêt est déjà ajouté');
      return;
    }
    updateProfileMutation.mutate({ 
      interests: [...currentInterests, customInterest.trim()] 
    });
    setCustomInterest('');
  };

  const toggleHobby = (hobby) => {
    const currentHobbies = profile?.hobbies || [];
    const newHobbies = currentHobbies.includes(hobby)
      ? currentHobbies.filter(h => h !== hobby)
      : [...currentHobbies, hobby];
    
    updateProfileMutation.mutate({ hobbies: newHobbies });
  };

  const addCustomHobby = () => {
    if (!customHobby.trim()) return;
    const currentHobbies = profile?.hobbies || [];
    if (currentHobbies.includes(customHobby.trim())) {
      toast.info('Ce loisir est déjà ajouté');
      return;
    }
    updateProfileMutation.mutate({ 
      hobbies: [...currentHobbies, customHobby.trim()] 
    });
    setCustomHobby('');
  };

  const removeInterest = (interest) => {
    const currentInterests = profile?.interests || [];
    updateProfileMutation.mutate({ 
      interests: currentInterests.filter(i => i !== interest) 
    });
  };

  const removeHobby = (hobby) => {
    const currentHobbies = profile?.hobbies || [];
    updateProfileMutation.mutate({ 
      hobbies: currentHobbies.filter(h => h !== hobby) 
    });
  };

  const toggleValue = (value) => {
    const currentValues = profile?.values || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateProfileMutation.mutate({ values: newValues });
  };

  const toggleRelationshipGoal = (goal) => {
    const currentGoals = profile?.relationship_goals || [];
    const newGoals = currentGoals.includes(goal)
      ? currentGoals.filter(g => g !== goal)
      : [...currentGoals, goal];
    
    updateProfileMutation.mutate({ relationship_goals: newGoals });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-900">Loisirs et Intérêts</h1>
          </div>
          <p className="text-gray-600">
            Partagez vos passions et vos valeurs pour des connexions authentiques
          </p>
        </div>

        {/* Centres d'intérêt */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="w-5 h-5 text-blue-600" />
              Centres d'intérêt
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Sélectionnez ou ajoutez vos centres d'intérêt
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection rapide */}
            <div className="flex flex-wrap gap-2">
              {predefinedInterests.map((interest) => (
                <Badge
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`cursor-pointer transition-all ${
                    profile?.interests?.includes(interest)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interest}
                </Badge>
              ))}
            </div>

            {/* Intérêts personnalisés */}
            {profile?.interests?.filter(i => !predefinedInterests.includes(i)).length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Vos intérêts personnalisés:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests
                    .filter(i => !predefinedInterests.includes(i))
                    .map((interest) => (
                      <Badge
                        key={interest}
                        className="bg-blue-600 text-white flex items-center gap-1"
                      >
                        {interest}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-200"
                          onClick={() => removeInterest(interest)}
                        />
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Ajouter un intérêt personnalisé */}
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un intérêt personnalisé..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <Button onClick={addCustomInterest} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hobbies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Loisirs et Activités
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Quelles activités pratiquez-vous régulièrement ?
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection rapide */}
            <div className="flex flex-wrap gap-2">
              {predefinedHobbies.map((hobby) => (
                <Badge
                  key={hobby}
                  onClick={() => toggleHobby(hobby)}
                  className={`cursor-pointer transition-all ${
                    profile?.hobbies?.includes(hobby)
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {hobby}
                </Badge>
              ))}
            </div>

            {/* Hobbies personnalisés */}
            {profile?.hobbies?.filter(h => !predefinedHobbies.includes(h)).length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Vos loisirs personnalisés:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies
                    .filter(h => !predefinedHobbies.includes(h))
                    .map((hobby) => (
                      <Badge
                        key={hobby}
                        className="bg-purple-600 text-white flex items-center gap-1"
                      >
                        {hobby}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-200"
                          onClick={() => removeHobby(hobby)}
                        />
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Ajouter un hobby personnalisé */}
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un loisir personnalisé..."
                value={customHobby}
                onChange={(e) => setCustomHobby(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomHobby()}
              />
              <Button onClick={addCustomHobby} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Valeurs personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Mes Valeurs
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Quelles valeurs sont importantes pour vous ? (max 5)
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {valuesOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    const currentValues = profile?.values || [];
                    if (currentValues.includes(option.value) || currentValues.length < 5) {
                      toggleValue(option.value);
                    } else {
                      toast.info('Vous pouvez sélectionner maximum 5 valeurs');
                    }
                  }}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                    profile?.values?.includes(option.value)
                      ? 'border-red-600 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Objectifs relationnels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              Objectifs Relationnels
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Que recherchez-vous dans une relation ?
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relationshipGoalsOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => toggleRelationshipGoal(option.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    profile?.relationship_goals?.includes(option.value)
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Résumé */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {profile?.interests?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Intérêts</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {profile?.hobbies?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Loisirs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-600">
                  {profile?.values?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Valeurs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {profile?.relationship_goals?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Objectifs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}