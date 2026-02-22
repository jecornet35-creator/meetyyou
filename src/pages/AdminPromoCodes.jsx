import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, Calendar, Gift, ToggleLeft, ToggleRight, Save, X } from 'lucide-react';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLOR_OPTIONS = [
  { value: 'amber', label: '🟡 Doré', bg: 'bg-amber-500' },
  { value: 'red', label: '🔴 Rouge', bg: 'bg-red-500' },
  { value: 'green', label: '🟢 Vert', bg: 'bg-green-500' },
  { value: 'blue', label: '🔵 Bleu', bg: 'bg-blue-500' },
  { value: 'purple', label: '🟣 Violet', bg: 'bg-purple-500' },
  { value: 'pink', label: '🩷 Rose', bg: 'bg-pink-500' },
];

const PRESET_EVENTS = [
  { name: '🎄 Noël', emoji: '🎄', message: '🎄 Accès gratuit pour les fêtes de Noël ! Profitez de toutes les fonctionnalités premium jusqu\'au 26 décembre.' },
  { name: '🎆 Nouvel An', emoji: '🎆', message: '🎆 Bonne Année ! Accès premium offert pour bien commencer l\'année.' },
  { name: '💝 Saint-Valentin', emoji: '💝', message: '💝 Saint-Valentin : accès illimité pour trouver votre moitié !' },
  { name: '🌸 Printemps', emoji: '🌸', message: '🌸 C\'est le printemps ! Profitez d\'un accès complet offert.' },
  { name: '🎉 Anniversaire', emoji: '🎉', message: '🎉 Anniversaire de Meetyyou ! Accès premium gratuit pour tous.' },
];

function getStatus(promo) {
  const now = new Date();
  const start = new Date(promo.start_date);
  const end = new Date(promo.end_date);
  if (!promo.is_active) return { label: 'Désactivée', color: 'bg-gray-100 text-gray-600' };
  if (isBefore(now, start)) return { label: 'Programmée', color: 'bg-blue-100 text-blue-700' };
  if (isAfter(now, end)) return { label: 'Expirée', color: 'bg-red-100 text-red-700' };
  return { label: '✅ Active', color: 'bg-green-100 text-green-700' };
}

const emptyForm = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  is_active: true,
  banner_message: '',
  banner_emoji: '🎉',
  banner_color: 'amber',
};

export default function AdminPromoCodes() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { data: promos = [] } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => base44.entities.PromoAccess.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      };
      if (editingId) return base44.entities.PromoAccess.update(editingId, payload);
      return base44.entities.PromoAccess.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoAccess.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-promos'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PromoAccess.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-promos'] }),
  });

  const handleEdit = (promo) => {
    setEditingId(promo.id);
    setForm({
      name: promo.name || '',
      description: promo.description || '',
      start_date: promo.start_date ? promo.start_date.substring(0, 16) : '',
      end_date: promo.end_date ? promo.end_date.substring(0, 16) : '',
      is_active: promo.is_active ?? true,
      banner_message: promo.banner_message || '',
      banner_emoji: promo.banner_emoji || '🎉',
      banner_color: promo.banner_color || 'amber',
    });
    setShowForm(true);
  };

  const handlePreset = (preset) => {
    setForm(f => ({ ...f, name: preset.name, banner_message: preset.message, banner_emoji: preset.emoji }));
  };

  const activePromos = promos.filter(p => {
    const now = new Date();
    return p.is_active && isWithinInterval(now, { start: new Date(p.start_date), end: new Date(p.end_date) });
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminPromoCodes" />

      <div className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Gift className="w-8 h-8 text-amber-500" />
              Codes promo & Accès gratuit
            </h1>
            <p className="text-gray-500 mt-1">Offrez un accès premium temporaire à tous les utilisateurs non-premium</p>
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle promotion
          </Button>
        </div>

        {/* Active banner preview */}
        {activePromos.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-600 mb-2">🔴 Promotions actuellement actives :</p>
            {activePromos.map(p => {
              const colorMap = { amber: 'from-amber-500 to-amber-600', red: 'from-red-500 to-red-600', green: 'from-green-500 to-green-600', blue: 'from-blue-500 to-blue-600', purple: 'from-purple-500 to-purple-600', pink: 'from-pink-500 to-pink-600' };
              return (
                <div key={p.id} className={`bg-gradient-to-r ${colorMap[p.banner_color] || colorMap.amber} text-white rounded-xl p-4 mb-2`}>
                  <p className="font-semibold">Aperçu du banner : {p.name}</p>
                  <p className="text-sm opacity-90 mt-1">{p.banner_message}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-8 border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingId ? 'Modifier la promotion' : 'Nouvelle promotion'}</span>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Presets */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Événements prédéfinis :</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EVENTS.map(p => (
                    <button key={p.name} onClick={() => handlePreset(p)} className="px-3 py-1.5 bg-gray-100 hover:bg-amber-100 rounded-full text-sm transition-colors">
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la promotion *</label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Promotion Noël 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description interne</label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Note interne (non visible)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                  <Input type="datetime-local" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                  <Input type="datetime-local" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message affiché sur la page de connexion</label>
                <Input
                  value={form.banner_message}
                  onChange={e => setForm(f => ({ ...f, banner_message: e.target.value }))}
                  placeholder="Ex: 🎄 Accès gratuit pour Noël ! Profitez de toutes les fonctionnalités..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                  <Input value={form.banner_emoji} onChange={e => setForm(f => ({ ...f, banner_emoji: e.target.value }))} placeholder="🎉" maxLength={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur du banner</label>
                  <Select value={form.banner_color} onValueChange={v => setForm(f => ({ ...f, banner_color: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              {form.banner_message && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Aperçu du banner :</p>
                  {(() => {
                    const colorMap = { amber: 'from-amber-500 to-amber-600', red: 'from-red-500 to-red-600', green: 'from-green-500 to-green-600', blue: 'from-blue-500 to-blue-600', purple: 'from-purple-500 to-purple-600', pink: 'from-pink-500 to-pink-600' };
                    return (
                      <div className={`bg-gradient-to-r ${colorMap[form.banner_color] || colorMap.amber} text-white rounded-xl p-4 text-center`}>
                        <p className="font-semibold">{form.banner_message}</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={() => saveMutation.mutate(form)} className="bg-amber-500 hover:bg-amber-600 gap-2" disabled={!form.name || !form.start_date || !form.end_date}>
                  <Save className="w-4 h-4" />
                  {editingId ? 'Enregistrer' : 'Créer la promotion'}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }}>Annuler</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Promos list */}
        <div className="space-y-4">
          {promos.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-gray-500">
                <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Aucune promotion créée</p>
                <p className="text-sm mt-1">Créez une promotion pour offrir un accès gratuit temporaire</p>
              </CardContent>
            </Card>
          ) : (
            promos.map(promo => {
              const status = getStatus(promo);
              const colorMap = { amber: 'border-l-amber-500', red: 'border-l-red-500', green: 'border-l-green-500', blue: 'border-l-blue-500', purple: 'border-l-purple-500', pink: 'border-l-pink-500' };
              return (
                <Card key={promo.id} className={`border-l-4 ${colorMap[promo.banner_color] || colorMap.amber}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-2xl">{promo.banner_emoji || '🎉'}</span>
                          <h3 className="font-bold text-gray-900 text-lg">{promo.name}</h3>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        {promo.description && <p className="text-sm text-gray-500 mb-2">{promo.description}</p>}
                        {promo.banner_message && (
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 mb-3 italic">"{promo.banner_message}"</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Du {promo.start_date ? format(new Date(promo.start_date), 'dd MMM yyyy HH:mm', { locale: fr }) : '?'}</span>
                          <span>→</span>
                          <span>Au {promo.end_date ? format(new Date(promo.end_date), 'dd MMM yyyy HH:mm', { locale: fr }) : '?'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleMutation.mutate({ id: promo.id, is_active: !promo.is_active })}
                          className={`transition-colors ${promo.is_active ? 'text-green-500 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                          title={promo.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {promo.is_active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                        </button>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(promo)}>
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(promo.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}