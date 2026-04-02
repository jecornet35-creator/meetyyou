import { 
  ArrowLeft, 
  Search, 
  User, 
  Search as SearchIcon, 
  Heart, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  MessageCircle,
  Shield,
  CreditCard,
  Send,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export default function HelpPage({ onBack }) {
  const [activeFaqTab, setActiveFaqTab] = useState('profil');
  const [expandedFaq, setExpandedFaq] = useState(0);

  const steps = [
    {
      step: 1,
      title: "Créez votre profil",
      desc: "Renseignez vos informations, ajoutez vos photos et décrivez-vous pour attirer les bons profils.",
      icon: <User className="w-6 h-6" />,
      color: "bg-amber-500"
    },
    {
      step: 2,
      title: "Définissez vos critères",
      desc: "Utilisez la recherche rapide ou les filtres avancés (Premium) pour trouver des profils correspondant à vos attentes.",
      icon: <SearchIcon className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      step: 3,
      title: "Likez et connectez-vous",
      desc: "Likez les profils qui vous intéressent et envoyez des messages pour briser la glace.",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-pink-500"
    },
    {
      step: 4,
      title: "Boostez votre visibilité",
      desc: "Utilisez les boosts pour apparaître en tête de liste et être vu par plus de membres.",
      icon: <Zap className="w-6 h-6" />,
      color: "bg-purple-500"
    }
  ];

  const faqTabs = [
    { id: 'profil', label: 'Profil', icon: <User className="w-4 h-4" /> },
    { id: 'boost', label: 'Boost', icon: <Zap className="w-4 h-4" /> },
    { id: 'abonnements', label: 'Abonnements', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'securite', label: 'Sécurité & Confidentialité', icon: <Shield className="w-4 h-4" /> },
  ];

  const faqs = [
    {
      question: "Comment créer ou modifier mon profil ?",
      answer: "Accédez à \"Modifier Mon Profil\" via le menu en haut à gauche. Vous pouvez renseigner vos informations personnelles, votre bio, vos préférences et bien plus encore. N'oubliez pas de sauvegarder vos modifications."
    },
    {
      question: "Comment ajouter des photos à mon profil ?",
      answer: "Rendez-vous dans la section \"Photos\" via le menu. Vous pouvez télécharger jusqu'à plusieurs photos. La photo principale sera celle affichée sur votre carte de profil. Les photos doivent être approuvées par notre équipe de modération."
    },
    {
      question: "Qu'est-ce que la vérification de profil ?",
      answer: "La vérification de profil permet d'attester de votre identité et d'inspirer confiance aux autres membres. Vous pouvez soumettre un selfie ou un document d'identité. Il existe 3 niveaux : Basique, Vérifié, et Hautement vérifié."
    },
    {
      question: "Comment définir mes critères de correspondance ?",
      answer: "Dans la section \"Correspondances\" (disponible avec un abonnement Premium), vous pouvez définir en détail les critères de votre partenaire idéal : âge, localisation, apparence, style de vie, valeurs, etc."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      {/* Header Section */}
      <div className="bg-orange-500 text-white pt-8 pb-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <HelpCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Centre d'aide</h1>
            <p className="text-orange-100">Comment pouvons-nous vous aider ?</p>
          </div>

          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher une question..." 
              className="w-full py-4 pl-12 pr-4 rounded-xl text-neutral-800 focus:outline-none shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-10">
        {/* Getting Started Section */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-neutral-800 mb-8 flex items-center gap-2">
            🚀 Commencer sur Meetyyou
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step) => (
              <div key={step.step} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                <div className={`${step.color} w-10 h-10 rounded-lg flex items-center justify-center text-white mb-4 shadow-sm`}>
                  {step.icon}
                </div>
                <span className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Étape {step.step}</span>
                <h3 className="text-lg font-bold text-neutral-800 mt-1 mb-3">{step.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-neutral-800 mb-8 flex items-center gap-2">
            ❓ Foire aux questions
          </h2>
          
          {/* FAQ Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {faqTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFaqTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all text-sm font-medium ${
                  activeFaqTab === tab.id 
                    ? 'bg-white border-orange-500 text-orange-600 shadow-sm' 
                    : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-neutral-50 last:border-0">
                <button 
                  onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-bold text-neutral-800">{faq.question}</span>
                  {expandedFaq === index ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5 text-orange-500" />}
                </button>
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-neutral-500 text-sm leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-neutral-800 mb-8 flex items-center gap-2">
            📩 Contacter le support
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Sujet</label>
                <input 
                  type="text" 
                  placeholder="Ex: Problème de paiement, question sur mon profil..." 
                  className="w-full p-4 rounded-xl border border-neutral-200 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Votre message</label>
                <textarea 
                  rows={4}
                  placeholder="Décrivez votre problème ou votre question en détail..." 
                  className="w-full p-4 rounded-xl border border-neutral-200 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                ></textarea>
              </div>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95">
                <Send className="w-5 h-5" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
