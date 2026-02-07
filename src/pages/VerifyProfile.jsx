import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Upload, Camera, FileText, Video, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);
  const [selectedType, setSelectedType] = useState('photo_selfie');
  const [selfieFile, setSelfieFile] = useState(null);
  const [idDocumentFile, setIdDocumentFile] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setCurrentUser(user);
      base44.entities.Profile.filter({ created_by: user.email }).then(profiles => {
        if (profiles[0]) setCurrentProfile(profiles[0]);
      });
    });
  }, []);

  const { data: existingRequest } = useQuery({
    queryKey: ['verificationRequest', currentUser?.email],
    queryFn: async () => {
      if (!currentUser) return null;
      const requests = await base44.entities.VerificationRequest.filter({ user_email: currentUser.email }, '-created_date', 1);
      return requests[0] || null;
    },
    enabled: !!currentUser,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result.file_url;
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.VerificationRequest.create(data);
    },
    onSuccess: () => {
      toast.success('Demande de vérification envoyée !');
      setSelfieFile(null);
      setIdDocumentFile(null);
      setSelfiePreview(null);
      setIdDocumentPreview(null);
    },
    onError: () => {
      toast.error('Erreur lors de l\'envoi');
    },
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'selfie') {
      setSelfieFile(file);
      setSelfiePreview(URL.createObjectURL(file));
    } else {
      setIdDocumentFile(file);
      setIdDocumentPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!currentUser || !currentProfile) {
      toast.error('Profil non trouvé');
      return;
    }

    if (selectedType === 'photo_selfie' && !selfieFile) {
      toast.error('Veuillez ajouter une photo selfie');
      return;
    }

    if (selectedType === 'id_document' && (!selfieFile || !idDocumentFile)) {
      toast.error('Veuillez ajouter les deux photos');
      return;
    }

    try {
      const selfieUrl = selfieFile ? await uploadMutation.mutateAsync(selfieFile) : null;
      const idDocUrl = idDocumentFile ? await uploadMutation.mutateAsync(idDocumentFile) : null;

      await submitMutation.mutateAsync({
        user_email: currentUser.email,
        profile_id: currentProfile.id,
        user_name: currentProfile.display_name,
        user_photo: currentProfile.main_photo,
        verification_type: selectedType,
        selfie_photo: selfieUrl,
        id_document_photo: idDocUrl,
        status: 'pending',
      });
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  if (!currentUser || !currentProfile) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (currentProfile.is_verified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={currentProfile} />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg p-8 text-center shadow-lg">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Profil vérifié !</h2>
            <p className="text-gray-600">Votre profil est déjà vérifié avec succès.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentProfile} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Vérification du profil</h1>
            </div>
            <p className="text-amber-100">Renforcez la confiance et augmentez votre visibilité</p>
          </div>

          <div className="p-6">
            {/* Existing request status */}
            {existingRequest && (
              <div className={`mb-6 p-4 rounded-lg border-2 ${
                existingRequest.status === 'pending' ? 'bg-blue-50 border-blue-200' :
                existingRequest.status === 'approved' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {existingRequest.status === 'pending' && <Clock className="w-5 h-5 text-blue-600 mt-0.5" />}
                  {existingRequest.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />}
                  {existingRequest.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {existingRequest.status === 'pending' && 'Demande en cours de traitement'}
                      {existingRequest.status === 'approved' && 'Demande approuvée'}
                      {existingRequest.status === 'rejected' && 'Demande rejetée'}
                    </p>
                    {existingRequest.status === 'pending' && (
                      <p className="text-sm text-gray-600 mt-1">
                        Votre demande est en cours d'examen. Vous serez notifié par email.
                      </p>
                    )}
                    {existingRequest.status === 'rejected' && existingRequest.rejection_reason && (
                      <p className="text-sm text-red-700 mt-1">
                        Raison: {existingRequest.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(!existingRequest || existingRequest.status === 'rejected') && (
              <>
                {/* Benefits */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    Avantages de la vérification
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Badge de vérification visible sur votre profil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Augmente la confiance des autres utilisateurs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Meilleure visibilité dans les recherches</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Protection contre les faux profils</span>
                    </li>
                  </ul>
                </div>

                {/* Verification type selection */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Choisissez une méthode de vérification</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedType('photo_selfie')}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedType === 'photo_selfie' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Camera className={`w-6 h-6 mb-2 ${selectedType === 'photo_selfie' ? 'text-amber-600' : 'text-gray-400'}`} />
                      <h4 className="font-medium text-gray-900">Photo Selfie</h4>
                      <p className="text-sm text-gray-600 mt-1">Prenez un selfie avec une pose spécifique</p>
                    </button>

                    <button
                      onClick={() => setSelectedType('id_document')}
                      className={`p-4 border-2 rounded-lg transition-all text-left ${
                        selectedType === 'id_document' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <FileText className={`w-6 h-6 mb-2 ${selectedType === 'id_document' ? 'text-amber-600' : 'text-gray-400'}`} />
                      <h4 className="font-medium text-gray-900">Document d'identité</h4>
                      <p className="text-sm text-gray-600 mt-1">Photo + pièce d'identité (sécurisé)</p>
                    </button>
                  </div>
                </div>

                {/* Upload section */}
                <div className="space-y-4">
                  {/* Selfie upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Photo selfie {selectedType === 'photo_selfie' && <span className="text-red-500">*</span>}
                    </label>
                    <div className="flex items-start gap-4">
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'selfie')}
                          className="hidden"
                        />
                        {!selfiePreview ? (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                          </>
                        ) : (
                          <img src={selfiePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                        )}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      📸 Prenez un selfie en levant 2 doigts (signe de paix)
                    </p>
                  </div>

                  {/* ID document upload */}
                  {selectedType === 'id_document' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Document d'identité <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-start gap-4">
                        <label className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-amber-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'document')}
                            className="hidden"
                          />
                          {!idDocumentPreview ? (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Cliquez pour télécharger</p>
                            </>
                          ) : (
                            <img src={idDocumentPreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                          )}
                        </label>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-2 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900">
                          Vos données sont sécurisées et ne seront utilisées que pour la vérification. Vous pouvez masquer les informations sensibles (numéro ID) sauf votre photo et nom.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={submitMutation.isPending || uploadMutation.isPending}
                    className="bg-amber-600 hover:bg-amber-700 px-8"
                  >
                    {(submitMutation.isPending || uploadMutation.isPending) ? 'Envoi en cours...' : 'Soumettre la demande'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}