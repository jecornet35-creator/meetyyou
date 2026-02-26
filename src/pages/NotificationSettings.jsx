import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Bell, MessageCircle, Heart, Eye, Star, UserCheck, Mail, Moon, Gift, Save, Check, BellRing, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/components/notifications/usePushNotifications';

const SettingRow = ({ icon: Icon, iconColor, title, description, checked, onCheckedChange }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg ${iconColor}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

export default function NotificationSettings() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    push_enabled: true,
    new_messages: true,
    new_matches: true,
    profile_views: true,
    likes: true,
    favorites: true,
    profile_updates: false,
    promotions: false,
    email_notifications: true,
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: existingPrefs } = useQuery({
    queryKey: ['notificationPrefs', currentUser?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreferences.filter({ created_by: currentUser.email });
      return prefs[0];
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (existingPrefs) {
      setSettings(prev => ({ ...prev, ...existingPrefs }));
    }
  }, [existingPrefs]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (existingPrefs?.id) {
        return base44.entities.NotificationPreferences.update(existingPrefs.id, data);
      } else {
        return base44.entities.NotificationPreferences.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPrefs'] });
      setSaved(true);
      toast.success('Préférences enregistrées');
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6" />
              Préférences de notification
            </h1>
            <p className="text-white/80 mt-1">Personnalisez vos alertes et notifications</p>
          </div>

          <div className="p-6">
            {/* Master toggle */}
            <div className="bg-amber-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Notifications Push</p>
                    <p className="text-sm text-gray-600">Activer toutes les notifications</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.push_enabled} 
                  onCheckedChange={(v) => updateSetting('push_enabled', v)} 
                />
              </div>
            </div>

            {/* Notification types */}
            <div className={settings.push_enabled ? '' : 'opacity-50 pointer-events-none'}>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Types de notifications</h2>
              
              <SettingRow
                icon={MessageCircle}
                iconColor="bg-blue-500"
                title="Nouveaux messages"
                description="Recevoir une alerte pour chaque nouveau message"
                checked={settings.new_messages}
                onCheckedChange={(v) => updateSetting('new_messages', v)}
              />
              
              <SettingRow
                icon={UserCheck}
                iconColor="bg-green-500"
                title="Nouvelles correspondances"
                description="Quand un profil correspond à vos critères"
                checked={settings.new_matches}
                onCheckedChange={(v) => updateSetting('new_matches', v)}
              />
              
              <SettingRow
                icon={Eye}
                iconColor="bg-purple-500"
                title="Visites de profil"
                description="Quand quelqu'un consulte votre profil"
                checked={settings.profile_views}
                onCheckedChange={(v) => updateSetting('profile_views', v)}
              />
              
              <SettingRow
                icon={Heart}
                iconColor="bg-red-500"
                title="Likes reçus"
                description="Quand quelqu'un aime votre profil"
                checked={settings.likes}
                onCheckedChange={(v) => updateSetting('likes', v)}
              />
              
              <SettingRow
                icon={Star}
                iconColor="bg-amber-500"
                title="Ajouts aux favoris"
                description="Quand quelqu'un vous ajoute en favori"
                checked={settings.favorites}
                onCheckedChange={(v) => updateSetting('favorites', v)}
              />
              
              <SettingRow
                icon={Gift}
                iconColor="bg-pink-500"
                title="Offres et promotions"
                description="Recevoir nos offres spéciales"
                checked={settings.promotions}
                onCheckedChange={(v) => updateSetting('promotions', v)}
              />
            </div>

            {/* Email notifications */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email</h2>
              <SettingRow
                icon={Mail}
                iconColor="bg-gray-500"
                title="Notifications par email"
                description="Recevoir aussi les notifications par email"
                checked={settings.email_notifications}
                onCheckedChange={(v) => updateSetting('email_notifications', v)}
              />
            </div>

            {/* Quiet hours */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mode silencieux</h2>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-indigo-500">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Activer le mode silencieux</p>
                    <p className="text-sm text-gray-500">Désactiver les notifications pendant certaines heures</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.quiet_hours_enabled} 
                  onCheckedChange={(v) => updateSetting('quiet_hours_enabled', v)} 
                />
              </div>
              
              {settings.quiet_hours_enabled && (
                <div className="mt-4 flex items-center gap-4 pl-14">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">De</label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_start}
                      onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
                      className="w-32"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">À</label>
                    <Input
                      type="time"
                      value={settings.quiet_hours_end}
                      onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Save button */}
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={() => saveMutation.mutate(settings)}
                disabled={saveMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 gap-2"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Enregistré!' : saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}