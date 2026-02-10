import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings, Eye, EyeOff, Clock, Globe, Ruler } from 'lucide-react';
import { Country } from 'country-state-city';

export default function ProfileSettings() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    online_status: true,
    show_profile: true,
    timezone: '(GMT+01:00) Europe/Brussels',
    date_format: 'Français (France)',
    unit_system: 'Métrique',
    country_filter: 'Belgique',
  });

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['user-profile', currentUser?.email],
    queryFn: async () => {
      const profiles = await base44.entities.Profile.filter({ 
        created_by: currentUser.email 
      });
      return profiles[0];
    },
    enabled: !!currentUser,
  });

  const countries = Country.getAllCountries();

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès');
  };

  const handleHideProfile = () => {
    toast.success('Votre profil est maintenant caché aux autres utilisateurs');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={profile} />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Paramètres de Profil</h1>
          <p className="text-gray-600 mt-1">Mettez à jour vos options d'affichage de profil et de localisation.</p>
        </div>

        {/* Options En Ligne */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-amber-700">Options En Ligne:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Statut En Ligne</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="online_status" 
                    checked={settings.online_status}
                    onChange={() => setSettings({ ...settings, online_status: true })}
                    className="w-4 h-4 text-amber-600"
                  />
                  <span className="text-gray-700">Montrez-moi en ligne</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="online_status" 
                    checked={!settings.online_status}
                    onChange={() => setSettings({ ...settings, online_status: false })}
                    className="w-4 h-4 text-amber-600"
                  />
                  <span className="text-gray-700">Montrez-moi occupé</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Afficher Profil:
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="show_profile" 
                    checked={settings.show_profile}
                    onChange={() => setSettings({ ...settings, show_profile: true })}
                    className="w-4 h-4 text-amber-600"
                  />
                  <span className="text-gray-700">Afficher mon profil aux utilisateurs</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="show_profile" 
                    checked={!settings.show_profile}
                    onChange={() => setSettings({ ...settings, show_profile: false })}
                    className="w-4 h-4 text-amber-600"
                  />
                  <span className="text-gray-700">Cacher mon profil aux utilisateurs</span>
                </label>
              </div>
              
              {!settings.show_profile && (
                <div className="mt-4 p-4 bg-green-100 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-start gap-2">
                    <span className="text-green-700 text-3xl mt-1">⚠</span>
                    <p className="text-green-800 text-sm">
                      Abonnez-vous maintenant pour cacher votre profil aux autres utilisateurs et naviguer anonymement
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Localisation:
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Fuseaux horaires</label>
              <Select value={settings.country_filter} onValueChange={(v) => setSettings({ ...settings, country_filter: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.isoCode} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Filtrer les fuseaux horaires par pays</p>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Fuseau horaire
              </label>
              <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="(GMT+01:00) Europe/Brussels">(GMT+01:00) Europe/Brussels</SelectItem>
                  <SelectItem value="(GMT+01:00) Europe/Paris">(GMT+01:00) Europe/Paris</SelectItem>
                  <SelectItem value="(GMT+00:00) Europe/London">(GMT+00:00) Europe/London</SelectItem>
                  <SelectItem value="(GMT-05:00) America/New_York">(GMT-05:00) America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">Format Date et Heure:</label>
              <Select value={settings.date_format} onValueChange={(v) => setSettings({ ...settings, date_format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Français (France)">Français (France)</SelectItem>
                  <SelectItem value="English (US)">English (US)</SelectItem>
                  <SelectItem value="English (UK)">English (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                <Ruler className="w-4 h-4 inline mr-1" />
                Unités de mesure:
              </label>
              <Select value={settings.unit_system} onValueChange={(v) => setSettings({ ...settings, unit_system: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Métrique">Métrique</SelectItem>
                  <SelectItem value="Impérial">Impérial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8"
          >
            ENREGISTRER
          </Button>
        </div>

        {/* Désactiver mon profil */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Désactiver mon profil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Vous souhaitez suspendre votre profil sur AfroIntroductions ?{' '}
              <button className="text-amber-600 hover:underline font-medium">
                cliquez ici
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}