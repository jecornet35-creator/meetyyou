import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, Eye, EyeOff, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

export default function Landing() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    base44.auth.redirectToLogin();
  };

  const footerLinks = [
    'Qui sommes-nous', 'Contacter Nous', 'Témoignages', 'Autres Sites',
    'Conditions d\'utilisation', 'Politique de remboursement', 'Politique de confidentialité',
    'Politique de Cookie', 'Sécurité', 'Plan du site', 'Règles de communauté', 'Compagnie', 'Affiliés'
  ];

  return (
    <div className="min-h-screen relative flex flex-col">
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
          <span className="font-bold text-xl">AfroIntroductions</span>
        </div>
        <Button variant="outline" className="bg-gray-800/80 border-gray-600 text-white hover:bg-gray-700">
          🌐 Français ▾
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
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
                <a href="#" onClick={handleLogin} className="text-amber-400 hover:underline font-semibold">
                  Inscrivez-Vous Gratuitement Maintenant !
                </a>
              </p>
            </div>

            {/* Social share */}
            <div className="text-center pt-2">
              <p className="text-gray-300 text-sm mb-3">
                Faites passer le mot à propos de AfroIntroductions !
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
          </div>
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