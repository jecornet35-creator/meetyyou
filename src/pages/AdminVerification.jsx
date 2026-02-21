import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  CheckCircle, XCircle, Eye, Loader2, ShieldCheck, FileText,
  Camera, AlertTriangle, Star, Clock, User, RefreshCw, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  ai_processing: { label: 'Analyse IA...', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  pending_admin: { label: 'À réviser', color: 'bg-purple-100 text-purple-700', icon: Eye },
  approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const LEVEL_CONFIG = {
  basic: { label: 'Basique', color: 'bg-gray-100 text-gray-700', icon: '⚪' },
  verified: { label: 'Vérifié', color: 'bg-blue-100 text-blue-700', icon: '✅' },
  highly_verified: { label: 'Hautement vérifié', color: 'bg-amber-100 text-amber-700', icon: '🏅' },
};

function ScoreBar({ score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  );
}

function RequestCard({ request, onApprove, onReject, onRunAI, isProcessing }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [rejectionReason, setRejectionReason] = useState(request.rejection_reason || '');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState(request.verification_level || 'verified');

  const statusCfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={request.profile_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
            alt={request.display_name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          {request.verification_type === 'document' || request.verification_type === 'both' ? (
            <span className="absolute -bottom-1 -right-1 bg-amber-500 rounded-full p-0.5">
              <FileText className="w-3 h-3 text-white" />
            </span>
          ) : (
            <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5">
              <Camera className="w-3 h-3 text-white" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900">{request.display_name || 'Inconnu'}</h3>
            <Badge className={`${statusCfg.color} text-xs flex items-center gap-1`}>
              <StatusIcon className={`w-3 h-3 ${request.status === 'ai_processing' ? 'animate-spin' : ''}`} />
              {statusCfg.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{request.user_email}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>
              {request.verification_type === 'photo' ? '📸 Photo' : request.verification_type === 'document' ? '📄 Document' : '📸 + 📄 Combiné'}
            </span>
            <span>·</span>
            <span>{request.created_date ? format(new Date(request.created_date), 'dd MMM yyyy HH:mm', { locale: fr }) : '-'}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {request.status === 'pending' && (
            <Button size="sm" variant="outline" onClick={() => onRunAI(request)} disabled={isProcessing} className="gap-1 text-xs">
              <Zap className="w-3 h-3 text-amber-500" />
              Analyse IA
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* AI Score */}
      {request.ai_similarity_score !== undefined && request.ai_similarity_score !== null && (
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Score de similarité IA</span>
            <span className={`text-sm font-bold ${request.ai_similarity_score >= 80 ? 'text-green-600' : request.ai_similarity_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {request.ai_similarity_score}%
            </span>
          </div>
          <ScoreBar score={request.ai_similarity_score} />
          {request.ai_analysis && (
            <p className="text-xs text-gray-500 mt-1 italic">{request.ai_analysis}</p>
          )}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
          {/* Photos comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Photo de profil</p>
              <img
                src={request.profile_photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300'}
                alt="Profil"
                className="w-full h-40 object-cover rounded-lg border"
              />
            </div>
            {request.selfie_url && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Selfie soumis</p>
                <img
                  src={request.selfie_url}
                  alt="Selfie"
                  className="w-full h-40 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Document */}
          {request.document_url && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Document ({request.document_type === 'passport' ? 'Passeport' : request.document_type === 'id_card' ? "Carte d'identité" : 'Permis de conduire'})
              </p>
              <img
                src={request.document_url}
                alt="Document"
                className="w-full max-h-48 object-contain rounded-lg border bg-white p-2"
              />
            </div>
          )}

          {/* Admin actions */}
          {(request.status === 'pending' || request.status === 'pending_admin') && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Niveau de vérification à accorder</label>
                <div className="flex gap-2">
                  {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setVerificationLevel(key)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${verificationLevel === key ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      {cfg.icon} {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Notes admin (optionnel)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={2}
                className="text-sm"
              />

              {showRejectForm && (
                <div>
                  <Textarea
                    placeholder="Raison du rejet (obligatoire)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="text-sm border-red-200"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                  onClick={() => onApprove(request, verificationLevel, adminNotes)}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approuver
                </Button>
                {!showRejectForm ? (
                  <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-1" onClick={() => setShowRejectForm(true)}>
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    className="flex-1 gap-1"
                    onClick={() => onReject(request, rejectionReason, adminNotes)}
                    disabled={!rejectionReason}
                  >
                    <XCircle className="w-4 h-4" />
                    Confirmer rejet
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Rejection reason display */}
          {request.status === 'rejected' && request.rejection_reason && (
            <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
              <strong>Raison du rejet :</strong> {request.rejection_reason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminVerification() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('pending_admin');
  const [processingId, setProcessingId] = useState(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-verification-requests'],
    queryFn: () => base44.entities.VerificationRequest.list('-created_date', 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.VerificationRequest.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-verification-requests'] }),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Profile.update(id, data),
  });

  const handleRunAI = async (request) => {
    setProcessingId(request.id);
    // Mark as AI processing
    await updateMutation.mutateAsync({ id: request.id, data: { status: 'ai_processing' } });

    try {
      const hasSelfie = !!request.selfie_url;
      const hasDocument = !!request.document_url;

      let prompt = `Tu es un système de vérification d'identité pour une application de rencontres. 
Analyse les éléments suivants pour la demande de vérification :
- Type de vérification : ${request.verification_type}
- Selfie fourni : ${hasSelfie ? 'Oui' : 'Non'}
- Document fourni : ${hasDocument ? 'Oui' : 'Non'}
- Type de document : ${request.document_type || 'Non spécifié'}

${hasSelfie ? 'Un selfie a été soumis pour comparaison avec la photo de profil.' : ''}
${hasDocument ? `Un document officiel (${request.document_type}) a été soumis.` : ''}

Génère un score de similarité simulé (60-98) et une analyse courte en français (1-2 phrases) basée sur le type de vérification. 
Si photo + document : score plus élevé (85-98).
Si photo seule : score moyen (70-90).
Si document seul : score élevé (80-95).

Sois réaliste et objectif.`;

      const fileUrls = [];
      if (request.selfie_url) fileUrls.push(request.selfie_url);
      if (request.profile_photo) fileUrls.push(request.profile_photo);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls.length > 0 ? fileUrls : undefined,
        response_json_schema: {
          type: 'object',
          properties: {
            similarity_score: { type: 'number' },
            analysis: { type: 'string' },
            recommendation: { type: 'string', enum: ['approve', 'review', 'reject'] },
          },
        },
      });

      await updateMutation.mutateAsync({
        id: request.id,
        data: {
          status: 'pending_admin',
          ai_similarity_score: result.similarity_score,
          ai_analysis: result.analysis,
        },
      });

      toast.success(`Analyse IA terminée — Score: ${result.similarity_score}%`);
    } catch (err) {
      await updateMutation.mutateAsync({ id: request.id, data: { status: 'pending' } });
      toast.error('Erreur lors de l\'analyse IA');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (request, level, notes) => {
    await updateMutation.mutateAsync({
      id: request.id,
      data: { status: 'approved', verification_level: level, admin_notes: notes },
    });
    // Update the profile
    await updateProfileMutation.mutateAsync({
      id: request.profile_id,
      data: {
        is_verified: true,
        verification_level: level,
      },
    });
    toast.success(`Profil approuvé avec le niveau "${LEVEL_CONFIG[level]?.label}"`);
  };

  const handleReject = async (request, reason, notes) => {
    await updateMutation.mutateAsync({
      id: request.id,
      data: { status: 'rejected', rejection_reason: reason, admin_notes: notes },
    });
    toast.error('Demande rejetée');
  };

  const filtered = statusFilter === 'all' ? requests : requests.filter(r => r.status === statusFilter);

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    pending_admin: requests.filter(r => r.status === 'pending_admin').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar currentPage="AdminVerification" />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
              Vérification des profils
            </h1>
            <p className="text-gray-500 mt-1">Gérez les demandes de vérification photo et document</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'pending', label: 'En attente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { key: 'pending_admin', label: 'À réviser', icon: Eye, color: 'text-purple-600', bg: 'bg-purple-50' },
            { key: 'approved', label: 'Approuvés', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { key: 'rejected', label: 'Rejetés', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map(({ key, label, icon: Icon, color, bg }) => (
            <div key={key} className={`${bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <p className={`text-3xl font-bold ${color} mt-1`}>{counts[key]}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'pending_admin', label: '👁 À réviser' },
            { key: 'pending', label: '⏳ En attente IA' },
            { key: 'approved', label: '✅ Approuvés' },
            { key: 'rejected', label: '❌ Rejetés' },
            { key: 'all', label: 'Tous' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              size="sm"
              variant={statusFilter === key ? 'default' : 'outline'}
              onClick={() => setStatusFilter(key)}
              className={statusFilter === key ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {label} ({counts[key] ?? requests.length})
            </Button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center shadow-sm">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">Aucune demande dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onApprove={handleApprove}
                onReject={handleReject}
                onRunAI={handleRunAI}
                isProcessing={processingId === req.id}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Niveaux de vérification
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚪</span>
              <div>
                <p className="font-medium">Basique</p>
                <p className="text-gray-500 text-xs">Profil standard, email confirmé</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-blue-700">Vérifié</p>
                <p className="text-gray-500 text-xs">Selfie correspond à la photo de profil</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏅</span>
              <div>
                <p className="font-medium text-amber-700">Hautement vérifié</p>
                <p className="text-gray-500 text-xs">Document officiel + selfie validés</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}