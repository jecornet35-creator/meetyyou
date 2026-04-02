import { 
  ArrowLeft, 
  Save, 
  Music, 
  Palette, 
  Plane, 
  Utensils, 
  Leaf, 
  Gamepad2, 
  Users, 
  HeartPulse,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function HobbiesPage({ onBack }) {
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Load saved hobbies on mount
  useEffect(() => {
    const loadHobbies = async () => {
      try {
        const savedHobbies = await api.get('hobbies');
        if (savedHobbies && Array.isArray(savedHobbies)) {
          setSelectedTags(new Set(savedHobbies));
        }
      } catch (error) {
        console.error("Failed to load hobbies:", error);
      }
    };
    loadHobbies();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.save('hobbies', Array.from(selectedTags));
      toast.success("Loisirs sauvegardés", {
        description: "Vos centres d'intérêt ont été mis à jour avec succès."
      });
      onBack();
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la sauvegarde."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTag = (tag) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  const categories = [
    {
      title: "Sports & Activités physiques",
      icon: "⚽",
      color: "blue",
      tags: ["Football", "Basketball", "Tennis", "Natation", "Course à pied", "Cyclisme", "Yoga", "Gym / Fitness", "Danse", "Arts martiaux", "Randonnée", "Volleyball", "Ski / Snowboard", "Surf", "Golf", "Boxe", "Rugby", "Escalade", "Équitation", "Ping-pong"]
    },
    {
      title: "Musique",
      icon: "🎵",
      color: "purple",
      tags: ["Pop", "Rock", "Jazz", "Classique", "R&B / Soul", "Hip-hop / Rap", "Électronique", "Reggae", "Afrobeat", "Gospel", "Country", "Metal", "Salsa / Latino", "Blues", "Opéra", "Jouer d'un instrument", "Chant / Chorale"]
    },
    {
      title: "Arts & Culture",
      icon: "🎨",
      color: "pink",
      tags: ["Peinture", "Dessin", "Sculpture", "Photographie", "Cinéma", "Théâtre", "Lecture", "Écriture", "Poésie", "Musées / Expositions", "Mode / Stylisme", "BD / Manga", "Animation / Illustration", "Artisanat", "Broderie / Tricot"]
    },
    {
      title: "Voyages & Découvertes",
      icon: "✈️",
      color: "amber",
      tags: ["Voyages à l'étranger", "Camping", "Backpacking", "Croisières", "Road trips", "Découverte culturelle", "Tourisme local", "Safari", "Aventure / Extrême", "Plage et mer", "Montagne", "Villes et capitales"]
    },
    {
      title: "Cuisine & Gastronomie",
      icon: "🍽️",
      color: "orange",
      tags: ["Cuisine maison", "Pâtisserie", "BBQ / Grillade", "Cuisine du monde", "Végétarien / Vegan", "Restaurants gastronomiques", "Street food", "Vins & Œnologie", "Café & Thé", "Cocktails & Mixologie"]
    },
    {
      title: "Nature & Plein air",
      icon: "🌿",
      color: "emerald",
      tags: ["Jardinage", "Ornithologie", "Pêche", "Chasse", "Astronomie", "Ecologie / Environnement", "Plongée sous-marine", "Kayak / Canoë", "Agriculture urbaine", "Animaux / Mascottes"]
    },
    {
      title: "Technologie & Jeux",
      icon: "🎮",
      color: "indigo",
      tags: ["Jeux vidéo", "Jeux de société", "Programmation", "Intelligence artificielle", "Crypto / Blockchain", "Jeux de rôle", "Escape game", "Poker / Cartes", "Modélisme", "Drones / Robotique", "Science-fiction"]
    },
    {
      title: "Social & Divertissement",
      icon: "🎉",
      color: "red",
      tags: ["Sorties / Soirées", "Bénévolat", "Networking", "Podcasts", "YouTube / Streaming", "Séries TV", "Stand-up / Humour", "Karaoké", "Voyages en famille", "Événements sportifs", "Concerts / Festivals"]
    },
    {
      title: "Bien-être & Santé",
      icon: "🧘",
      color: "teal",
      tags: ["Méditation", "Pleine conscience", "Spa / Massage", "Nutrition / Diététique", "Psychologie", "Développement personnel", "Sophrologie", "Aromathérapie", "Naturopathie", "Sommeil & Récupération"]
    }
  ];

  const getColorClasses = (color, isSelected) => {
    const colors = {
      blue: isSelected ? "bg-blue-500 text-white border-blue-500" : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
      purple: isSelected ? "bg-purple-500 text-white border-purple-500" : "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100",
      pink: isSelected ? "bg-pink-500 text-white border-pink-500" : "bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100",
      amber: isSelected ? "bg-amber-500 text-white border-amber-500" : "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100",
      orange: isSelected ? "bg-orange-500 text-white border-orange-500" : "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
      emerald: isSelected ? "bg-emerald-500 text-white border-emerald-500" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
      indigo: isSelected ? "bg-indigo-500 text-white border-indigo-500" : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100",
      red: isSelected ? "bg-red-500 text-white border-red-500" : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100",
      teal: isSelected ? "bg-teal-500 text-white border-teal-500" : "bg-teal-50 text-teal-600 border-teal-100 hover:bg-teal-100",
    };
    return colors[color];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-orange-500 font-bold hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-[18px] h-[18px]" />
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Loisirs & Intérêts</h1>
        <p className="text-neutral-500">Sélectionnez vos centres d'intérêt pour mieux vous faire connaître et trouver des affinités.</p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((cat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden"
          >
            <div className="px-8 py-4 border-b border-neutral-100 flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <h2 className="font-bold text-neutral-800">{cat.title}</h2>
            </div>
            <div className="p-8 flex flex-wrap gap-3">
              {cat.tags.map((tag) => {
                const isSelected = selectedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${getColorClasses(cat.color, isSelected)}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-center mt-12 mb-20">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-12 py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Sauvegarde en cours..." : "Sauvegarder mes intérêts"}
        </button>
      </div>
    </div>
  );
}
