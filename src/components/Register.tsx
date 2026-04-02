import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck,
  ChevronDown,
  Loader2,
  MailCheck,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

export default function Register({ onBack, onRegisterSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState('man');
  const [lookingFor, setLookingFor] = useState('woman');
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !age || !email || !password || !termsAccepted) {
      setError('Veuillez remplir tous les champs et accepter les conditions.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.register({
        email,
        password,
        firstName,
        age,
        gender,
        lookingFor
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920")' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-10 text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Vérifiez votre email</h2>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Un email de confirmation a été envoyé à <span className="font-bold text-neutral-900">{email}</span>.<br />
            Veuillez cliquer sur le lien dans l'email pour activer votre compte.
          </p>
          <div className="space-y-4">
            <button 
              onClick={onBack}
              className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à l'accueil
            </button>
            <p className="text-xs text-neutral-400">
              Vous n'avez pas reçu l'email ? Vérifiez vos spams ou <button className="text-orange-500 hover:underline">renvoyez l'email</button>.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920")' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          {/* Prénom */}
          <div>
            <label className="block text-neutral-700 text-sm font-medium mb-1.5 sm:mb-2">Prénom</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm sm:text-base"
              placeholder=""
            />
          </div>

          {/* Gender Selection */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-neutral-700 text-sm font-medium mb-1.5 sm:mb-2">Je suis un(e)</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setGender('man')}
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${gender === 'man' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-neutral-200 hover:bg-neutral-50'}`}
                >
                  <img src="https://api.iconify.design/noto:man-medium-light-skin-tone.svg" className="w-6 h-6 sm:w-8 sm:h-8 mb-1" alt="Man" />
                  <span className="text-[10px] font-medium text-neutral-500">Homme</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setGender('woman')}
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${gender === 'woman' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-neutral-200 hover:bg-neutral-50'}`}
                >
                  <img src="https://api.iconify.design/noto:woman-medium-light-skin-tone.svg" className="w-6 h-6 sm:w-8 sm:h-8 mb-1" alt="Woman" />
                  <span className="text-[10px] font-medium text-neutral-500">Femme</span>
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-neutral-700 text-sm font-medium mb-1.5 sm:mb-2">Je recherche</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setLookingFor('man')}
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${lookingFor === 'man' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-neutral-200 hover:bg-neutral-50'}`}
                >
                  <img src="https://api.iconify.design/noto:man-medium-light-skin-tone.svg" className="w-6 h-6 sm:w-8 sm:h-8 mb-1" alt="Man" />
                  <span className="text-[10px] font-medium text-neutral-500">Homme</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setLookingFor('woman')}
                  className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${lookingFor === 'woman' ? 'border-orange-500 ring-1 ring-orange-500' : 'border-neutral-200 hover:bg-neutral-50'}`}
                >
                  <img src="https://api.iconify.design/noto:woman-medium-light-skin-tone.svg" className="w-6 h-6 sm:w-8 sm:h-8 mb-1" alt="Woman" />
                  <span className="text-[10px] font-medium text-neutral-500">Femme</span>
                </button>
              </div>
            </div>

            <div className="w-full sm:w-24">
              <label className="block text-neutral-700 text-sm font-medium mb-1.5 sm:mb-2">Âge</label>
              <div className="relative">
                <select 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 appearance-none focus:ring-2 focus:ring-orange-500 outline-none bg-white text-neutral-900 text-sm sm:text-base"
                >
                  <option value=""></option>
                  {Array.from({ length: 82 }, (_, i) => i + 18).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-neutral-700 text-sm font-medium mb-1.5 sm:mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm sm:text-base"
              placeholder="email@exemple.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-neutral-700 text-sm font-medium mb-1.5 sm:mb-2">Mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm sm:text-base"
                placeholder="Votre Mot de Passe pour Meetyyou"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-[18px] h-[18px] sm:w-5 sm:h-5" /> : <Eye className="w-[18px] h-[18px] sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 rounded border-neutral-300 text-orange-600 focus:ring-orange-500" 
            />
            <span className="text-sm text-neutral-600 leading-tight">
              Oui, je confirme que j'ai plus de 18 et j'accepte les <button type="button" className="text-orange-500 hover:underline">conditions d'utilisation</button> et la <button type="button" className="text-orange-500 hover:underline">déclaration de confidentialité</button>
            </span>
          </label>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-4 rounded-lg shadow-lg transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            Voir les Célibataires
          </button>

          {/* TrustedSite */}
          <div className="flex flex-col items-center justify-center text-neutral-400 gap-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <div className="text-center">
                <div className="text-xs font-bold text-neutral-600">TrustedSite</div>
                <div className="text-[10px]">Formulaire sécurisé</div>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={onBack}
              className="text-orange-500 font-medium text-sm hover:underline"
            >
              Déjà membre ? Connectez-vous
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
