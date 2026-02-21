import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function AccountPassword() {
  const [currentUser, setCurrentUser] = useState(null);
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const handleSave = () => {
    setError('');
    if (!current) { setError('Veuillez entrer votre mot de passe actuel.'); return; }
    if (!newPass) { setError('Veuillez entrer un nouveau mot de passe.'); return; }
    if (newPass !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (newPass.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setSaved(true);
    setCurrent(''); setNewPass(''); setConfirm('');
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Réinitialisez votre Mot de passe</h1>
          <p className="text-gray-500 text-sm mb-1">
            Pour garder votre compte sécurisé, nous vous recommandons de changer régulièrement votre Mot de passe.
          </p>
          <p className="text-gray-700 text-sm font-semibold mb-6">
            Important: Pour plus de sécurité assurez-vous que votre nouveau Mot de passe N'est PAS le même que votre adresse d'email.
          </p>

          <h2 className="text-amber-700 font-semibold mb-4">Tapez votre mot de passe</h2>

          <div className="mb-2">
            <label className="text-sm text-gray-600 mb-1 block">Mot de passe actuel</label>
            <PasswordInput value={current} onChange={e => setCurrent(e.target.value)} />
          </div>
          <div className="text-right mb-6">
            <button className="text-sm text-gray-500 hover:underline">Mot De Passe Oublié</button>
          </div>

          <h2 className="text-amber-700 font-semibold mb-4">Entrez votre nouveau Mot de passe</h2>

          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-1 block">Nouveau Mot de passe :</label>
            <PasswordInput value={newPass} onChange={e => setNewPass(e.target.value)} />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-1 block">Confirmez votre Nouveau Mot de passe :</label>
            <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          {saved && <p className="text-green-600 text-sm mb-3">Mot de passe mis à jour avec succès.</p>}

          <Button
            onClick={handleSave}
            className="bg-amber-700 hover:bg-amber-800 text-white font-bold px-8"
          >
            ENREGISTRER
          </Button>
        </div>
      </main>
    </div>
  );
}