import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, EyeOff, Facebook, Twitter, Instagram, Youtube, Lock, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { isWithinInterval } from 'date-fns';

export default function Landing() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [iAmGender, setIAmGender] = useState('');
  const [lookingForGender, setLookingForGender] = useState('');
  const [age, setAge] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-600'];
  const strengthLabels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'];

  const handlePasswordChange = (val) => {
    setPassword(val);
    // Live strength feedback
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(score);
    if (errors.password) setErrors(e => ({ ...e, password: null }));
  };

  const handleSignup = async () => {
    setIsValidating(true);
    setErrors({});
    try {
      const res = await base44.functions.invoke('validateRegistration', {
        firstName, email, password, age, iAmGender, lookingForGender, acceptTerms
      });
      const data = res.data;
      if (data.valid) {
        base44.auth.redirectToLogin();
      } else {
        setErrors(data.errors || {});
        if (data.passwordStrength !== undefined) setPasswordStrength(data.passwordStrength);
      }
    } catch (e) {
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsValidating(false);
    }
  };

  const [dismissedBanner, setDismissedBanner] = useState(false);
  const ages = Array.from({ length: 63 }, (_, i) => i + 18);

  const { data: activePromo } = useQuery({
    queryKey: ['active-promo'],
    queryFn: async () => {
      const promos = await base44.entities.PromoAccess.list('-created_date', 50);
      const now = new Date();
      return promos.find(p => p.is_active && isWithinInterval(now, {
        start: new Date(p.start_date),
        end: new Date(p.end_date)
      })) || null;
    },
  });

  const footerLinks = [
    'Qui sommes-nous', 'Contacter Nous', 'Témoignages', 'Autres Sites',
    'Conditions d\'utilisation', 'Politique de remboursement', 'Politique de confidentialité',
    'Politique de Cookie', 'Sécurité', 'Plan du site', 'Règles de communauté', 'Compagnie', 'Affiliés'
  ];

  const colorMap = {
    amber: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-600 to-green-700',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Promo Banner */}
      {activePromo && activePromo.banner_message && !dismissedBanner && (
        <div className={`relative z-20 bg-gradient-to-r ${colorMap[activePromo.banner_color] || colorMap.amber} text-white`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
            <span className="text-xl">{activePromo.banner_emoji || '🎉'}</span>
            <p className="text-sm sm:text-base font-medium text-center">{activePromo.banner_message}</p>
            <button onClick={() => setDismissedBanner(true)} className="ml-2 opacity-70 hover:opacity-100 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2 text-white">
          <Heart className="w-8 h-8 fill-amber-500 text-amber-500" />
          <span className="font-bold text-xl">Meetyyou</span>
        </div>
        <Button variant="outline" className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700">
          🌐 Français ▾
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {!isSignup ? (
            <>
              <h1 className="text-3xl font-bold text-white text-center mb-8">
                Connexion des Membres
              </h1>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-white text-sm mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="bg-white/90 border-0 h-12"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-white text-sm mb-1 block">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="bg-white/90 border-0 h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-1">
                    <a href="#" className="text-amber-400 text-sm hover:underline">
                      Mot De Passe Oublié
                    </a>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="mt-1 border-white data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div>
                    <label htmlFor="remember" className="text-white cursor-pointer">
                      Rester connecté
                    </label>
                    <p className="text-gray-300 text-xs mt-1 italic">
                      Ne cochez pas cette case si vous vous connectez à partir d'un ordinateur public ou partagé
                    </p>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg"
                >
                  Connexion
                </Button>

                <div className="text-center text-white text-sm">ou</div>

                {/* Google Login */}
                <Button
                  onClick={handleLogin}
                  variant="outline"
                  className="w-full h-12 bg-white hover:bg-gray-100 text-gray-700 border-0 gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Se connecter avec Google
                </Button>

                {/* Sign up link */}
                <div className="text-center pt-4">
                  <p className="text-white">
                    Pas encore membre ?{' '}
                    <button onClick={() => setIsSignup(true)} className="text-amber-400 hover:underline font-semibold">
                      Inscrivez-Vous Gratuitement Maintenant !
                    </button>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="space-y-4">
                {/* Prénom */}
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Prénom</label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => { setFirstName(e.target.value); setErrors(e2 => ({ ...e2, firstName: null })); }}
                    className={`h-11 ${errors.firstName ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.firstName}</p>}
                </div>

                {/* Gender selectors */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-gray-700 text-sm mb-2 block">Je suis un(e)</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIAmGender('homme')}
                        className={`flex-1 p-3 border rounded flex flex-col items-center gap-1 transition-colors ${
                          iAmGender === 'homme' ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={iAmGender === 'homme' ? '#f59e0b' : '#9ca3af'} strokeWidth="2">
                          <circle cx="12" cy="7" r="4"/>
                          <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setIAmGender('femme')}
                        className={`flex-1 p-3 border rounded flex flex-col items-center gap-1 transition-colors ${
                          iAmGender === 'femme' ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={iAmGender === 'femme' ? '#f59e0b' : '#9ca3af'} strokeWidth="2">
                          <circle cx="12" cy="7" r="4"/>
                          <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
                          <path d="M12 14v7M9 18h6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="text-gray-700 text-sm mb-2 block">Je recherche</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLookingForGender('homme')}
                        className={`flex-1 p-3 border rounded flex flex-col items-center gap-1 transition-colors ${
                          lookingForGender === 'homme' ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={lookingForGender === 'homme' ? '#f59e0b' : '#9ca3af'} strokeWidth="2">
                          <circle cx="12" cy="7" r="4"/>
                          <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => setLookingForGender('femme')}
                        className={`flex-1 p-3 border rounded flex flex-col items-center gap-1 transition-colors ${
                          lookingForGender === 'femme' ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke={lookingForGender === 'femme' ? '#f59e0b' : '#9ca3af'} strokeWidth="2">
                          <circle cx="12" cy="7" r="4"/>
                          <path d="M5 21v-2a7 7 0 0 1 14 0v2"/>
                          <path d="M12 14v7M9 18h6"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="w-24">
                    <label className="text-gray-700 text-sm mb-2 block">Âge</label>
                    <Select value={age} onValueChange={setAge}>
                      <SelectTrigger className="h-[58px] border-gray-300">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {ages.map(a => (
                          <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className="border-gray-300 h-11"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="text-gray-700 text-sm mb-1 block">Mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre Mot de Passe pour Meetyyou"
                      className="border-gray-300 h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-1 border-gray-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                    Oui, je confirme que j'ai plus de 18 et j'accepte les{' '}
                    <a href="#" className="text-amber-600 hover:underline">conditions d'utilisation</a>
                    {' '}et la{' '}
                    <a href="#" className="text-amber-600 hover:underline">déclaration de confidentialité</a>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleLogin}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-lg gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Voir les Célibataires
                </Button>

                {/* Trust badge */}
                <div className="flex justify-center pt-2">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <div className="text-center">
                      <div className="font-semibold">TrustedSite</div>
                      <div className="text-xs">Formulaire sécurisé</div>
                    </div>
                  </div>
                </div>

                {/* Back to login */}
                <div className="text-center pt-2">
                  <button onClick={() => setIsSignup(false)} className="text-amber-600 hover:underline text-sm">
                    Déjà membre ? Connectez-vous
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Social share - only show on login */}
          {!isSignup && (
            <div className="text-center pt-6">
              <p className="text-gray-300 text-sm mb-3">
                Faites passer le mot à propos de Meetyyou !
              </p>
              <div className="flex justify-center gap-4">
                <a href="#" className="text-white hover:text-amber-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-white hover:text-amber-400 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-white hover:text-amber-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-white hover:text-amber-400 transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900/90 text-gray-400 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mb-4">
            {footerLinks.map((link, i) => (
              <a key={i} href="#" className="hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
          <p className="text-center text-xs">
            This website is operated by SDL Networks Limited located at 71 Tower Road, SLM 1609, Sliema, Malta, reg. number C70898.
          </p>
        </div>
      </footer>
    </div>
  );
}