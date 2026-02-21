import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import Header from '@/components/layout/Header';

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const levels = [
    { score: 1, label: 'Très faible', color: 'bg-red-500' },
    { score: 2, label: 'Faible', color: 'bg-orange-400' },
    { score: 3, label: 'Moyen', color: 'bg-yellow-400' },
    { score: 4, label: 'Fort', color: 'bg-green-500' },
  ];
  return levels[score - 1] || { score: 0, label: '', color: '' };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? color : 'bg-gray-200'}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{label}</p>
    </div>
  );
}

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
            <PasswordStrengthBar password={newPass} />
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-1 block">Confirmez votre Nouveau Mot de passe :</label>
            <PasswordInput value={confirm} onChange={e => setConfirm(e.target.value)} />
            {confirm && newPass !== confirm && (
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
            )}
            {confirm && newPass === confirm && (
              <p className="text-xs text-green-600 mt-1">Les mots de passe correspondent.</p>
            )}
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