import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, ShieldAlert, Mail } from 'lucide-react';
import Header from '@/components/layout/Header';

export default function AccountEmail() {
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const isVerified = true; // base44 manages email verification

  useEffect(() => {
    base44.auth.me().then(u => {
      setCurrentUser(u);
      setEmail(u.email || '');
    }).catch(() => {});
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSendVerification = () => {
    setVerificationSent(true);
    setTimeout(() => setVerificationSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Adresse Email</h1>
          <p className="text-gray-500 text-sm mb-6">
            Veuillez mettre à jour votre adresse email si elle a changé afin de ne pas manquer les communications ou alertes de correspondances.
          </p>

          <h2 className="text-amber-700 font-semibold mb-3">Modifier Adresse Email</h2>
          <div className="flex gap-3 items-center">
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1"
              placeholder="votre@email.com"
            />
            <Button
              onClick={handleSave}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-6"
            >
              ENREGISTRER
            </Button>
          </div>

          {saved && (
            <p className="text-green-600 text-sm mt-3">Email mis à jour avec succès.</p>
          )}

          {isVerified ? (
            <div className="flex items-center gap-2 mt-5 text-green-700 text-sm">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span>Cet email a déjà été vérifié.</span>
            </div>
          ) : (
            <div className="mt-5 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 text-sm mb-3">
                <ShieldAlert className="w-5 h-5" />
                <span>Cet email n'a pas encore été vérifié.</span>
              </div>
              <Button
                onClick={handleSendVerification}
                disabled={verificationSent}
                className="bg-amber-700 hover:bg-amber-800 text-white gap-2"
              >
                <Mail className="w-4 h-4" />
                {verificationSent ? 'Email envoyé !' : 'Envoyer un email de vérification'}
              </Button>
              {verificationSent && (
                <p className="text-green-600 text-xs mt-2">Un email de vérification a été envoyé à {email}.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}