import React, { useEffect, useState } from 'react';
import { User, Heart, X, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await api.get('profiles');
        setProfiles(data);
      } catch (error) {
        console.error('Failed to fetch profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Découvrez de nouveaux profils</h1>
        <p className="text-muted-foreground">Trouvez la personne qui vous correspond sur Meetyyou.</p>
      </header>

      {profiles.length === 0 ? (
        <div className="max-w-md mx-auto p-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <User className="w-8 h-8" />
          </div>
          <p className="text-lg font-medium">Aucun profil disponible</p>
          <p className="text-sm text-muted-foreground">Revenez plus tard pour découvrir de nouveaux profils.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {profiles.map((profile) => (
            <div key={profile.id} className="bg-card rounded-3xl overflow-hidden border shadow-sm hover:shadow-md transition-shadow group">
              <div className="aspect-[3/4] relative overflow-hidden">
                <img 
                  src={profile.photo} 
                  alt={profile.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>
                  <p className="text-sm opacity-90 line-clamp-2">{profile.bio}</p>
                </div>
              </div>
              <div className="p-4 flex items-center justify-around border-t">
                <button className="p-3 rounded-full bg-muted hover:bg-red-50 hover:text-red-500 transition-colors">
                  <X className="w-6 h-6" />
                </button>
                <button className="p-4 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform shadow-lg">
                  <Heart className="w-8 h-8 fill-current" />
                </button>
                <button className="p-3 rounded-full bg-muted hover:bg-blue-50 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
              </div>
              {profile.interests && (
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <span key={interest} className="text-[10px] uppercase tracking-wider font-bold bg-muted px-2 py-1 rounded-md">
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
