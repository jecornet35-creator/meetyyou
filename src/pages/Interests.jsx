import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const CATEGORIES = [
  {
    key: 'sports',
    label: 'Sports & Activités physiques',
    emoji: '⚽',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    activeColor: 'bg-blue-500 text-white border-blue-500',
    items: ['Football', 'Basketball', 'Tennis', 'Natation', 'Course à pied', 'Cyclisme', 'Yoga', 'Gym / Fitness', 'Danse', 'Arts martiaux', 'Randonnée', 'Volleyball', 'Ski / Snowboard', 'Surf', 'Golf', 'Boxe', 'Rugby', 'Escalade', 'Équitation', 'Ping-pong']
  },
  {
    key: 'music',
    label: 'Musique',
    emoji: '🎵',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    activeColor: 'bg-purple-500 text-white border-purple-500',
    items: ['Pop', 'Rock', 'Jazz', 'Classique', 'R&B / Soul', 'Hip-hop / Rap', 'Électronique', 'Reggae', 'Afrobeat', 'Gospel', 'Country', 'Metal', 'Salsa / Latino', 'Blues', 'Opéra', 'Jouer d\'un instrument', 'Chant / Chorale']
  },
  {
    key: 'arts',
    label: 'Arts & Culture',
    emoji: '🎨',
    color: 'bg-pink-50 border-pink-200 text-pink-700',
    activeColor: 'bg-pink-500 text-white border-pink-500',
    items: ['Peinture', 'Dessin', 'Sculpture', 'Photographie', 'Cinéma', 'Théâtre', 'Lecture', 'Écriture', 'Poésie', 'Musées / Expositions', 'Mode / Stylisme', 'BD / Manga', 'Animation / Illustration', 'Artisanat', 'Broderie / Tricot']
  },
  {
    key: 'travel',
    label: 'Voyages & Découvertes',
    emoji: '✈️',
    color: 'bg-amber-50 border-amber-200 text-amber-700',
    activeColor: 'bg-amber-500 text-white border-amber-500',
    items: ['Voyages à l\'étranger', 'Camping', 'Backpacking', 'Croisières', 'Road trips', 'Découverte culturelle', 'Tourisme local', 'Safari', 'Aventure / Extrême', 'Plage et mer', 'Montagne', 'Villes et capitales']
  },
  {
    key: 'food',
    label: 'Cuisine & Gastronomie',
    emoji: '🍽️',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    activeColor: 'bg-orange-500 text-white border-orange-500',
    items: ['Cuisine maison', 'Pâtisserie', 'BBQ / Grillade', 'Cuisine du monde', 'Végétarien / Vegan', 'Restaurants gastronomiques', 'Street food', 'Vins & Œnologie', 'Café & Thé', 'Cocktails & Mixologie']
  },
  {
    key: 'nature',
    label: 'Nature & Plein air',
    emoji: '🌿',
    color: 'bg-green-50 border-green-200 text-green-700',
    activeColor: 'bg-green-500 text-white border-green-500',
    items: ['Jardinage', 'Ornithologie', 'Pêche', 'Chasse', 'Astronomie', 'Ecologie / Environnement', 'Plongée sous-marine', 'Kayak / Canoë', 'Agriculture urbaine', 'Animaux / Mascottes']
  },
  {
    key: 'tech',
    label: 'Technologie & Jeux',
    emoji: '🎮',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    activeColor: 'bg-indigo-500 text-white border-indigo-500',
    items: ['Jeux vidéo', 'Jeux de société', 'Programmation', 'Intelligence artificielle', 'Crypto / Blockchain', 'Jeux de rôle', 'Escape game', 'Poker / Cartes', 'Modélisme', 'Drones / Robotique', 'Science-fiction']
  },
  {
    key: 'social',
    label: 'Social & Divertissement',
    emoji: '🎉',
    color: 'bg-red-50 border-red-200 text-red-700',
    activeColor: 'bg-red-500 text-white border-red-500',
    items: ['Sorties / Soirées', 'Bénévolat', 'Networking', 'Podcasts', 'YouTube / Streaming', 'Séries TV', 'Stand-up / Humour', 'Karaoké', 'Voyages en famille', 'Événements sportifs', 'Concerts / Festivals']
  },
  {
    key: 'wellness',
    label: 'Bien-être & Santé',
    emoji: '🧘',
    color: 'bg-teal-50 border-teal-200 text-teal-700',
    activeColor: 'bg-teal-500 text-white border-teal-500',
    items: ['Méditation', 'Pleine conscience', 'Spa / Massage', 'Nutrition / Diététique', 'Psychologie', 'Développement personnel', 'Sophrologie', 'Aromathérapie', 'Naturopathie', 'Sommeil & Récupération']
  },
];

export default function Interests() {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: interest, isLoading } = useQuery({
    queryKey: ['my-interests'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.Interest.filter({ created_by: user.email });
      return results[0] || null;
    },
  });

  const [selected, setSelected] = useState({});

  React.useEffect(() => {
    if (interest) {
      const init = {};
      CATEGORIES.forEach(cat => {
        init[cat.key] = interest[cat.key] || [];
      });
      setSelected(init);
    } else {
      const init = {};
      CATEGORIES.forEach(cat => { init[cat.key] = []; });
      setSelected(init);
    }
  }, [interest]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (interest?.id) {
        return base44.entities.Interest.update(interest.id, data);
      } else {
        return base44.entities.Interest.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-interests'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const toggle = (catKey, item) => {
    setSelected(prev => {
      const current = prev[catKey] || [];
      return {
        ...prev,
        [catKey]: current.includes(item)
          ? current.filter(i => i !== item)
          : [...current, item]
      };
    });
  };

  const handleSave = () => {
    mutation.mutate(selected);
  };

  const totalSelected = Object.values(selected).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Enregistré !' : 'Sauvegarder'}
          </Button>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Loisirs & Intérêts</h1>
          <p className="text-gray-500 text-sm mt-1">
            Sélectionnez vos centres d'intérêt pour mieux vous faire connaître et trouver des affinités.
            {totalSelected > 0 && (
              <span className="ml-2 font-semibold text-amber-600">{totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Categories */}
        {CATEGORIES.map(cat => {
          const catSelected = selected[cat.key] || [];
          return (
            <div key={cat.key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <h2 className="font-bold text-gray-800">{cat.label}</h2>
                  {catSelected.length > 0 && (
                    <p className="text-xs text-amber-600 font-medium">{catSelected.length} sélectionné{catSelected.length > 1 ? 's' : ''}</p>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-wrap gap-2">
                {cat.items.map(item => {
                  const isActive = catSelected.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggle(cat.key, item)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        isActive ? cat.activeColor : cat.color + ' hover:opacity-80'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Save button bottom */}
        <div className="pb-8 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={mutation.isPending}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 gap-2 px-10"
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Enregistré !' : 'Sauvegarder mes intérêts'}
          </Button>
        </div>
      </main>
    </div>
  );
}