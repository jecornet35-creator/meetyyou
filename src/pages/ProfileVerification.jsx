import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ShieldCheck, Camera, FileText, Upload, CheckCircle,
  Clock, XCircle, ArrowLeft, Loader2, Star, Info
} from 'lucide-react';

const STEPS = [
  { id: 'choose', label: 'Choisir' },
  { id: 'upload', label: 'Téléverser' },
  { id: 'confirm', label: 'Confirmer' },
];

export default function ProfileVerification() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState('choose');
  const [verType, setVerType] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [docType, setDocType] = useState('id_card');
  const [uploading, setUploading] = useState(false);

  const selfieRef = useRef();
  const docRef = useRef();

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ created_by: user.email });
      return profiles[0] || null;
    },
  });

  const { data: existingRequest } = useQuery({
    queryKey: ['myVerificationRequest'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const requests = await base44.entities.VerificationRequest.filter({ user_email: user.email });
      return requests.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0] || null;
    },
    enabled: !!currentUser,
  });

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.VerificationRequest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVerificationRequest'] });
      toast.success('Demande envoyée avec succès !');
      setStep('done');
    },
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (type === 'selfie') { setSelfieFile(file); setSelfiePreview(preview); }
    else { setDocFile(file); setDocPreview(preview); }
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      let selfieUrl = null;
      let documentUrl = null;

      if (selfieFile) {
        const r = await base44.integrations.Core.UploadFile({ file: selfieFile });
        selfieUrl = r.file_url;
      }
      if (docFile) {
        const r = await base44.integrations.Core.UploadFile({ file: docFile });
        documentUrl = r.file_url;
      }

      await submitMutation.mutateAsync({
        profile_id: myProfile?.id,
        user_email: currentUser.email,
        display_name: myProfile?.display_name || myProfile?.first_name,
        profile_photo: myProfile?.main_photo,
        verification_type: verType,
        selfie_url: selfieUrl,
        document_url: documentUrl,
        document_type: docFile ? docType : undefined,
        status: 'pending',
      });
    } finally {
      setUploading(false);
    }
  };

  const STATUS_INFO = {
    pending: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'En attente d\'analyse IA', desc: 'Votre demande va être traitée automatiquement.' },
    ai_processing: { icon: Loader2, color: 'text-blue-600 bg-blue-50', label: 'Analyse IA en cours...', desc: 'Notre IA compare votre selfie à votre photo de profil.' },
    pending_admin: { icon: Eye, color: 'text-purple-600 bg-purple-50', label: 'Révision manuelle', desc: 'Un administrateur vérifie votre demande.' },
    approved: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Profil vérifié ✅', desc: 'Félicitations ! Votre profil est maintenant vérifié.' },
    rejected: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Demande rejetée', desc: 'Votre demande a été refusée.' },
  };

  // Show existing request status
  if (existingRequest && existingRequest.status !== 'rejected' && step !== 'done') {
    const info = STATUS_INFO[existingRequest.status];
    const Icon = info.icon;
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="max-w-xl mx-auto px-4 py-10">
          <Link to={createPageUrl('EditProfile')} className="inline-flex items-center gap-2 text-amber-600 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Retour au profil
          </Link>
          <div className={`rounded-2xl p-8 text-center ${info.color} border`}>
            <Icon className={`w-14 h-14 mx-auto mb-4 ${existingRequest.status === 'ai_processing' ? 'animate-spin' : ''}`} />
            <h2 className="text-xl font-bold mb-2">{info.label}</h2>
            <p className="text-sm opacity-80">{info.desc}</p>
            {existingRequest.status === 'approved' && (
              <div className="mt-4">
                <Badge className="bg-amber-100 text-amber-700 text-sm px-4 py-1">
                  🏅 {existingRequest.verification_level === 'highly_verified' ? 'Hautement vérifié' : 'Vérifié'}
                </Badge>
              </div>
            )}
            {existingRequest.ai_similarity_score && (
              <p className="mt-3 text-sm font-medium">Score IA : {existingRequest.ai_similarity_score}%</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link to={createPageUrl('EditProfile')} className="inline-flex items-center gap-2 text-amber-600 text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour au profil
        </Link>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <ShieldCheck className="w-14 h-14 text-amber-500 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">Vérifiez votre profil</h1>
            <p className="text-gray-500 mt-2">Obtenez un badge de confiance pour plus de visibilité</p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-10">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className={`flex items-center gap-2 text-sm font-medium ${step === s.id || (step === 'done' && i < 3) ? 'text-amber-600' : 'text-gray-400'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step === s.id ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300 text-gray-400'}`}>{i + 1}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-10 h-0.5 bg-gray-200" />}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Choose */}
          {step === 'choose' && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-800 mb-4">Choisissez votre type de vérification</h2>
              {[
                {
                  id: 'photo',
                  icon: Camera,
                  title: 'Vérification par selfie',
                  desc: 'Prenez un selfie — notre IA compare votre visage à vos photos de profil',
                  badge: '✅ Vérifié',
                  badgeColor: 'bg-blue-100 text-blue-700',
                },
                {
                  id: 'document',
                  icon: FileText,
                  title: 'Vérification par document',
                  desc: "Soumettez une pièce d'identité officielle (passeport, CNI, permis)",
                  badge: '🏅 Hautement vérifié',
                  badgeColor: 'bg-amber-100 text-amber-700',
                },
                {
                  id: 'both',
                  icon: Star,
                  title: 'Vérification complète (recommandé)',
                  desc: 'Selfie + document officiel pour le niveau de confiance maximum',
                  badge: '🏅 Hautement vérifié',
                  badgeColor: 'bg-amber-100 text-amber-700',
                  highlight: true,
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setVerType(opt.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${verType === opt.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'} ${opt.highlight ? 'relative overflow-hidden' : ''}`}
                >
                  {opt.highlight && <span className="absolute top-2 right-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Recommandé</span>}
                  <opt.icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${verType === opt.id ? 'text-amber-500' : 'text-gray-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{opt.title}</p>
                      <Badge className={`text-xs ${opt.badgeColor}`}>{opt.badge}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                  </div>
                </button>
              ))}

              <Button
                className="w-full bg-amber-500 hover:bg-amber-600 mt-4"
                disabled={!verType}
                onClick={() => setStep('upload')}
              >
                Continuer
              </Button>
            </div>
          )}

          {/* Step 2: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-800 mb-2">Téléversez vos fichiers</h2>

              {(verType === 'photo' || verType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-500" /> Selfie
                  </label>
                  <div
                    onClick={() => selfieRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${selfiePreview ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                  >
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="selfie" className="max-h-40 mx-auto rounded-lg object-cover" />
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Cliquez pour prendre/uploader votre selfie</p>
                      </div>
                    )}
                    <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => handleFileChange(e, 'selfie')} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> Regardez droit vers la caméra, bonne luminosité</p>
                </div>
              )}

              {(verType === 'document' || verType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500" /> Document officiel
                  </label>
                  <div className="flex gap-2 mb-3">
                    {[
                      { value: 'id_card', label: "Carte d'identité" },
                      { value: 'passport', label: 'Passeport' },
                      { value: 'driver_license', label: 'Permis' },
                    ].map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDocType(d.value)}
                        className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all ${docType === d.value ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600'}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <div
                    onClick={() => docRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${docPreview ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}
                  >
                    {docPreview ? (
                      <img src={docPreview} alt="doc" className="max-h-40 mx-auto rounded-lg object-contain" />
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Téléversez votre document</p>
                      </div>
                    )}
                    <input ref={docRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileChange(e, 'doc')} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Info className="w-3 h-3" /> Document entier visible, pas de reflet, bonne qualité</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('choose')}>Retour</Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  disabled={
                    (verType === 'photo' && !selfieFile) ||
                    (verType === 'document' && !docFile) ||
                    (verType === 'both' && (!selfieFile || !docFile))
                  }
                  onClick={() => setStep('confirm')}
                >
                  Vérifier
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <h2 className="font-semibold text-gray-800 mb-2">Confirmation de votre demande</h2>
              <div className="grid grid-cols-2 gap-4">
                {selfiePreview && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Selfie</p>
                    <img src={selfiePreview} className="w-full h-36 object-cover rounded-xl border" alt="selfie" />
                  </div>
                )}
                {docPreview && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1 font-medium">Document</p>
                    <img src={docPreview} className="w-full h-36 object-contain rounded-xl border bg-gray-50 p-1" alt="doc" />
                  </div>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Vos données sont sécurisées</p>
                  <p className="text-xs text-amber-700">Vos documents sont utilisés uniquement pour la vérification et sont supprimés après traitement conformément à notre politique de confidentialité.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('upload')}>Retour</Button>
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 gap-2"
                  onClick={handleSubmit}
                  disabled={uploading || submitMutation.isPending}
                >
                  {(uploading || submitMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  Soumettre
                </Button>
              </div>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Demande envoyée !</h2>
              <p className="text-gray-500 mt-2">Notre IA va analyser vos documents. Vous serez notifié du résultat.</p>
              <Link to={createPageUrl('EditProfile')}>
                <Button className="mt-6 bg-amber-500 hover:bg-amber-600">Retour au profil</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}