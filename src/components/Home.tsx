import { useState } from 'react';
import { 
  Heart, 
  Globe, 
  Lock, 
  Rocket, 
  Ban, 
  Trophy, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronDown,
  Diamond,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

export default function Home({ onLogin, onRegister, onAdminClick, onTermsClick, onAboutClick }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Veuillez entrer votre email et mot de passe.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const user = await api.findUser(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Email ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      {/* SECTION 1: HERO & LOGIN */}
      <section className="relative min-h-screen flex flex-col bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920")' }}>
        {/* Header */}
        <header className="p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Heart className="text-orange-500 fill-orange-500 w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">Meetyyou</span>
          </div>
          <button className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900/50 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/20 hover:bg-neutral-900/80 transition-all text-xs sm:text-sm">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Français
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </header>

        {/* Login Form Container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">Connexion des Membres</h1>
            
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg text-sm font-medium text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-white text-sm font-medium mb-1">Email</label>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-lg bg-neutral-100 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
              </div>
              
              <div className="relative">
                <label className="block text-white text-sm font-medium mb-1">Mot de passe</label>
                <input 
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=".........."
                  className="w-full px-4 py-3 rounded-lg bg-neutral-100 border-none focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-neutral-500 hover:text-neutral-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="text-right mt-1">
                  <button type="button" className="text-orange-400 text-sm font-medium hover:underline">Mot De Passe Oublié</button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-3 text-white cursor-pointer group">
                  <input type="checkbox" className="mt-1 rounded border-none bg-neutral-100 text-orange-600 focus:ring-orange-500" />
                  <div className="text-sm">
                    <span className="font-medium">Rester connecté</span>
                    <p className="text-white/60 text-xs leading-tight mt-0.5 italic">
                      Ne cochez pas cette case si vous vous connectez à partir d'un ordinateur public ou partagé
                    </p>
                  </div>
                </label>
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-4 rounded-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoggingIn && <Loader2 className="animate-spin w-5 h-5" />}
                Connexion
              </button>
            </form>

            <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-white/60 text-sm">ou</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              <button className="w-full bg-white hover:bg-neutral-50 text-neutral-700 font-medium py-3 rounded-lg flex items-center justify-center gap-3 transition-all shadow-sm">
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Se connecter avec Google
              </button>

              <div className="text-center pt-4 sm:pt-6">
                <p className="text-white text-base sm:text-lg font-medium mb-1 sm:mb-2">
                  Pas encore membre ?
                </p>
                <button 
                  onClick={onRegister}
                  className="text-orange-500 font-black text-xl sm:text-2xl hover:text-orange-400 transition-colors drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] uppercase tracking-tight"
                >
                  Inscrivez-Vous Gratuitement Maintenant !
                </button>
              </div>
            </motion.div>
          </div>

        {/* Social Footer */}
        <div className="p-8 text-center bg-gradient-to-t from-black/40 to-transparent">
          <p className="text-white/80 text-sm mb-4">Faites passer le mot à propos de Meetyyou !</p>
          <div className="flex justify-center gap-6 text-white/80">
            <Facebook className="cursor-pointer hover:text-white transition-colors w-6 h-6" />
            <Twitter className="cursor-pointer hover:text-white transition-colors w-6 h-6" />
            <Instagram className="cursor-pointer hover:text-white transition-colors w-6 h-6" />
            <Youtube className="cursor-pointer hover:text-white transition-colors w-6 h-6" />
          </div>
        </div>
      </section>

      {/* SECTION 2: EXCLUSIVE OFFER */}
      <section className="py-12 sm:py-20 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.9 }}
            className="bg-orange-500 rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <Trophy className="mx-auto mb-4 sm:mb-6 text-orange-200 w-8 h-8 sm:w-12 sm:h-12" />
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">Offre de lancement exclusive</h2>
              <p className="text-lg sm:text-2xl font-medium mb-4 sm:mb-6">
                Les <span className="font-black underline">500 premiers inscrits</span> bénéficient de <span className="font-black">3 mois PREMIUM gratuits</span> et reçoivent le badge exclusif 🥇 <span className="font-black">Pionnier</span>
              </p>
              <p className="text-orange-100 text-xs sm:text-sm italic">
                Ne manquez pas cette opportunité unique — rejoignez l'aventure dès maintenant !
              </p>
            </div>
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3: WHY MEETYOU */}
      <section className="py-16 sm:py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Pourquoi Meetyyou ?</h2>
          <p className="text-neutral-500 mb-10 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base">Une plateforme conçue pour des rencontres authentiques et sécurisées</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: <Ban className="text-red-500 w-8 h-8 sm:w-10 sm:h-10" />, title: "Zéro faux profil", desc: "Chaque profil est réel. Nous ne créons pas de faux comptes pour simuler l'activité — une pratique malheureusement courante ailleurs." },
              { icon: <Lock className="text-orange-500 w-8 h-8 sm:w-10 sm:h-10" />, title: "Site sécurisé", desc: "Vos données sont protégées. Notre plateforme est sécurisée avec vérification des profils et modération active." },
              { icon: <Rocket className="text-purple-500 w-8 h-8 sm:w-10 sm:h-10" />, title: "En évolution constante", desc: "Meetyyou évolue chaque semaine grâce aux retours de nos membres. Vos suggestions façonnent directement la plateforme." }
            ].map((item, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-neutral-50 border border-neutral-100 hover:shadow-lg transition-all text-center group">
                <div className="mb-4 sm:mb-6 flex justify-center transform group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: PHILOSOPHY */}
      <section className="py-16 sm:py-24 px-4 bg-blue-50/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Un prix bas ≠ une plateforme bas de gamme</h2>
          <p className="text-neutral-500 mb-10 sm:mb-16 max-w-3xl mx-auto text-sm sm:text-base">Nous offrons toutes les fonctionnalités des grandes plateformes — et même plus — à un tarif accessible. Voici pourquoi c'est possible :</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: <Diamond className="text-blue-500 w-8 h-8 sm:w-10 sm:h-10" />, title: "Toutes les options incluses", desc: "Messagerie, filtres avancés, boost de profil, vérification, favoris... tout ce que proposent les autres sites, et davantage." },
              { icon: <Heart className="text-red-500 fill-red-500 w-8 h-8 sm:w-10 sm:h-10" />, title: "Une philosophie équitable", desc: "Nous croyons qu'une rencontre sérieuse ne devrait pas coûter une fortune. L'amour n'a pas de prix, mais l'accès à la plateforme oui." },
              { icon: <Globe className="text-emerald-500 w-8 h-8 sm:w-10 sm:h-10" />, title: "Basé à Madagascar", desc: "Notre équipe est installée à Madagascar, où le coût de la vie est bien inférieur à l'Europe. Ces économies, nous vous les répercutons directement." }
            ].map((item, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl bg-white shadow-sm border border-blue-100/50 hover:shadow-md transition-all">
                <div className="mb-4 sm:mb-6 flex justify-center">{item.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0a0a0a] text-white py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8 sm:mb-12">
            <Heart className="text-orange-500 fill-orange-500 w-6 h-6 sm:w-7 sm:h-7" />
            <span className="text-lg sm:text-xl font-bold tracking-tight">Meetyyou</span>
            <span className="text-neutral-600 ml-2 sm:ml-4 text-xs sm:text-sm">— Plan du site</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12">
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">Découvrir</h4>
              <ul className="space-y-3 text-neutral-500 text-sm">
                <li><button className="hover:text-white transition-colors">Accueil</button></li>
                <li><button className="hover:text-white transition-colors">Recherche avancée</button></li>
                <li><button className="hover:text-white transition-colors">Profils en vedette</button></li>
                <li><button className="hover:text-white transition-colors">Nouvelles rencontres</button></li>
                <li><button className="hover:text-white transition-colors">Profils vérifiés</button></li>
                <li><button onClick={onAdminClick} className="text-orange-500 hover:text-orange-400 font-bold transition-colors">Admin Dashboard</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">Mon Compte</h4>
              <ul className="space-y-3 text-neutral-500 text-sm">
                <li><button className="hover:text-white transition-colors">Mon profil</button></li>
                <li><button className="hover:text-white transition-colors">Mes photos</button></li>
                <li><button className="hover:text-white transition-colors">Mes favoris</button></li>
                <li><button className="hover:text-white transition-colors">Mes messages</button></li>
                <li><button className="hover:text-white transition-colors">Mes likes</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">Abonnements</h4>
              <ul className="space-y-3 text-neutral-500 text-sm">
                <li><button className="hover:text-white transition-colors">Plans & tarifs</button></li>
                <li><button className="hover:text-white transition-colors">Premium</button></li>
                <li><button className="hover:text-white transition-colors">VIP</button></li>
                <li><button className="hover:text-white transition-colors">Pack Booster</button></li>
                <li><button className="hover:text-white transition-colors">Politique de remboursement</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">Aide & Légal</h4>
              <ul className="space-y-3 text-neutral-500 text-sm">
                <li><button className="hover:text-white transition-colors">Centre d'aide</button></li>
                <li><button className="hover:text-white transition-colors">Contacter nous</button></li>
                <li><button onClick={onTermsClick} className="hover:text-white transition-colors">Conditions d'utilisation</button></li>
                <li><button className="hover:text-white transition-colors">Confidentialité</button></li>
                <li><button className="hover:text-white transition-colors">Politique de cookies</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-neutral-400">À Propos</h4>
              <ul className="space-y-3 text-neutral-500 text-sm">
                <li><button onClick={onAboutClick} className="hover:text-white transition-colors">Qui sommes-nous</button></li>
                <li><button className="hover:text-white transition-colors">Témoignages</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
