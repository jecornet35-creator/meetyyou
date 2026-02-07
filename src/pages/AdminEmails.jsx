import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Plus, Edit, Eye, Trash2, Power, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const emailTypes = [
  { value: 'welcome', label: 'Email de bienvenue', vars: ['{{user_name}}', '{{login_link}}'] },
  { value: 'password_reset', label: 'Réinitialisation mot de passe', vars: ['{{user_name}}', '{{reset_link}}', '{{expiry_time}}'] },
  { value: 'email_verification', label: 'Vérification email', vars: ['{{user_name}}', '{{verification_link}}'] },
  { value: 'payment_confirmation', label: 'Confirmation de paiement', vars: ['{{user_name}}', '{{amount}}', '{{plan_name}}', '{{invoice_url}}'] },
  { value: 'subscription_confirmed', label: 'Abonnement confirmé', vars: ['{{user_name}}', '{{plan_name}}', '{{end_date}}'] },
  { value: 'subscription_cancelled', label: 'Abonnement annulé', vars: ['{{user_name}}', '{{plan_name}}', '{{end_date}}'] },
  { value: 'new_message', label: 'Nouveau message', vars: ['{{user_name}}', '{{sender_name}}', '{{message_preview}}', '{{conversation_link}}'] },
  { value: 'new_match', label: 'Nouveau match', vars: ['{{user_name}}', '{{match_name}}', '{{match_photo}}', '{{profile_link}}'] },
  { value: 'profile_approved', label: 'Profil approuvé', vars: ['{{user_name}}'] },
  { value: 'profile_rejected', label: 'Profil rejeté', vars: ['{{user_name}}', '{{reason}}'] },
];

export default function AdminEmails() {
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    subject: '',
    content: '',
    variables: [],
    is_active: true,
  });

  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['emailTemplates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmailTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Modèle créé avec succès');
      setShowEditor(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Modèle mis à jour');
      setShowEditor(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Modèle supprimé');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.EmailTemplate.update(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailTemplates'] });
      toast.success('Statut mis à jour');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      subject: '',
      content: '',
      variables: [],
      is_active: true,
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      content: template.content,
      variables: template.variables || [],
      is_active: template.is_active,
    });
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.type || !formData.subject || !formData.content) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handlePreview = (template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const renderPreviewContent = () => {
    if (!previewTemplate) return null;

    let content = previewTemplate.content;
    const typeInfo = emailTypes.find(t => t.value === previewTemplate.type);
    
    // Replace variables with sample data
    const sampleData = {
      '{{user_name}}': 'Marie Dupont',
      '{{login_link}}': 'https://meetyyou.com/login',
      '{{reset_link}}': 'https://meetyyou.com/reset-password/abc123',
      '{{verification_link}}': 'https://meetyyou.com/verify/xyz789',
      '{{expiry_time}}': '24 heures',
      '{{amount}}': '29.99€',
      '{{plan_name}}': 'Premium',
      '{{end_date}}': '07 Mars 2026',
      '{{invoice_url}}': 'https://meetyyou.com/invoices/12345',
      '{{sender_name}}': 'Thomas Martin',
      '{{message_preview}}': 'Bonjour, j\'aimerais faire votre connaissance...',
      '{{conversation_link}}': 'https://meetyyou.com/messages/123',
      '{{match_name}}': 'Sophie Bernard',
      '{{match_photo}}': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      '{{profile_link}}': 'https://meetyyou.com/profiles/456',
      '{{reason}}': 'Photo de profil non conforme aux conditions d\'utilisation',
    };

    Object.keys(sampleData).forEach(key => {
      content = content.replace(new RegExp(key, 'g'), sampleData[key]);
    });

    return content;
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar currentPage="AdminEmails" />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modèles d'emails</h1>
              <p className="text-gray-600 mt-2">Gérez les emails transactionnels envoyés aux utilisateurs</p>
            </div>
            <Button onClick={() => { resetForm(); setShowEditor(true); }} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau modèle
            </Button>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium">Variables dynamiques</p>
              <p className="mt-1">Utilisez des variables comme <code className="bg-blue-100 px-1 rounded">{'{{user_name}}'}</code> pour personnaliser vos emails. Les variables disponibles dépendent du type d'email.</p>
            </div>
          </div>

          {/* Templates list */}
          {isLoading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun modèle d'email</h3>
              <p className="text-gray-600 mb-4">Créez votre premier modèle d'email transactionnel</p>
              <Button onClick={() => setShowEditor(true)} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="w-4 h-4 mr-2" />
                Créer un modèle
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map((template) => {
                const typeInfo = emailTypes.find(t => t.value === template.type);
                return (
                  <div key={template.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <Badge variant={template.is_active ? 'default' : 'secondary'}>
                            {template.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                          <Badge variant="outline">{typeInfo?.label || template.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Sujet:</strong> {template.subject}
                        </p>
                        {template.variables?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {template.variables.map((variable, idx) => (
                              <code key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                {variable}
                              </code>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(template)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Prévisualiser
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActiveMutation.mutate({ id: template.id, is_active: !template.is_active })}
                        >
                          <Power className={`w-4 h-4 ${template.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Supprimer ce modèle ?')) {
                              deleteMutation.mutate(template.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Editor Dialog */}
          <Dialog open={showEditor} onOpenChange={setShowEditor}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle d\'email'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Nom du modèle</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Email de bienvenue"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Type d'email</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      const typeInfo = emailTypes.find(t => t.value === value);
                      setFormData({ ...formData, type: value, variables: typeInfo?.vars || [] });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.variables?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">Variables disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.variables.map((variable, idx) => (
                        <code
                          key={idx}
                          className="text-xs bg-white px-2 py-1 rounded text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-100"
                          onClick={() => {
                            navigator.clipboard.writeText(variable);
                            toast.success('Variable copiée');
                          }}
                        >
                          {variable}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Sujet de l'email</label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ex: Bienvenue sur Meetyyou !"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Contenu de l'email</label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    modules={quillModules}
                    className="bg-white"
                    style={{ height: '300px', marginBottom: '50px' }}
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="text-sm font-medium text-gray-700">Statut:</label>
                  <Button
                    variant={formData.is_active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  >
                    {formData.is_active ? 'Actif' : 'Inactif'}
                  </Button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowEditor(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
                    {editingTemplate ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Preview Dialog */}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Prévisualisation de l'email</DialogTitle>
              </DialogHeader>
              
              {previewTemplate && (
                <div className="mt-4">
                  <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-1">Sujet:</p>
                    <p className="font-medium text-gray-900">{previewTemplate.subject}</p>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6">
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: renderPreviewContent() }}
                    />
                  </div>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-900">
                      <strong>Note:</strong> Cette prévisualisation utilise des données fictives. Les variables seront remplacées par les vraies données lors de l'envoi.
                    </p>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}