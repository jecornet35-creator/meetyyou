import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, ChevronUp, ArrowLeft, HelpCircle, MessageCircle,
  User, Zap, CreditCard, Shield, Camera, Heart, Search, CheckCircle, Send
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';

const FAQ_CATEGORIES = [
  {
    id: 'profile',
    icon: User,
    label: 'Profil',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    questions: [
      {
        q: 'Comment créer ou modifier mon profil ?',
        a: 'Accédez à "Modifier Mon Profil" via le menu en haut à gauche. Vous pouvez renseigner vos informations personnelles, votre bio, vos préférences et bien plus encore. N\'oubliez pas de sauvegarder vos modifications.'
      },
      {
        q: 'Comment ajouter des photos à mon profil ?',
        a: 'Rendez-vous dans la section "Photos" via le menu. Vous pouvez télécharger jusqu\'à plusieurs photos. La photo principale sera celle affichée sur votre carte de profil. Les photos doivent être approuvées par notre équipe de modération.'
      },
      {
        q: 'Qu\'est-ce que la vérification de profil ?',
        a: 'La vérification de profil permet d\'attester de votre identité et d\'inspirer confiance aux autres membres. Vous pouvez soumettre un selfie ou un document d\'identité. Il existe 3 niveaux : Basique, Vérifié, et Hautement vérifié.'
      },
      {
        q: 'Comment définir mes critères de correspondance ?',
        a: 'Dans la section "Correspondances" (disponible avec un abonnement Premium), vous pouvez définir en détail les critères de votre partenaire idéal : âge, localisation, apparence, style de vie, valeurs, etc.'
      },
    ]
  },
  {
    id: 'boost',
    icon: Zap,
    label: 'Boost',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    questions: [
      {
        q: 'Qu\'est-ce que le boost de profil ?',
        a: 'Le boost met votre profil en avant dans la section "Profils à la une" sur la page d\'accueil pendant 24 heures. Cela vous permet d\'être vu par beaucoup plus de membres et d\'augmenter vos chances de rencontres.'
      },
      {
        q: 'Comment utiliser un boost ?',
        a: 'Visitez votre propre profil, puis cliquez sur le bouton "Booster mon profil". Si vous avez des boosts disponibles, la mise en avant s\'activera immédiatement pour 24 heures.'
      },
      {
        q: 'Comment obtenir des boosts ?',
        a: 'Vous pouvez obtenir des boosts de deux façons : en achetant un pack Booster (5€ pour 10 boosts), ou via l\'abonnement VIP qui inclut 2 boosts par mois automatiquement.'
      },
      {
        q: 'Combien de temps dure un boost ?',
        a: 'Chaque boost dure 24 heures. Pendant cette période, votre profil apparaît dans la section "Profils à la une" visible par tous les membres sur la page d\'accueil.'
      },
    ]
  },
  {
    id: 'subscription',
    icon: CreditCard,
    label: 'Abonnements',
    color: 'text-green-600',
    bg: 'bg-green-50',
    questions: [
      {
        q: 'Quels sont les différents plans disponibles ?',
        a: 'Nous proposons 3 plans : Gratuit (accès de base), Premium (messagerie illimitée, filtres avancés, etc.), et VIP (toutes les fonctionnalités Premium + boosts mensuels + avantages exclusifs). Vous pouvez aussi acheter des packs de boosts à la carte.'
      },
      {
        q: 'Comment annuler mon abonnement ?',
        a: 'Vous pouvez gérer votre abonnement dans la section "Paramètres" > "Abonnement". L\'annulation prendra effet à la fin de votre période de facturation actuelle.'
      },
      {
        q: 'Les paiements sont-ils sécurisés ?',
        a: 'Oui, tous les paiements sont traités de manière sécurisée via Stripe, un leader mondial du paiement en ligne. Nous ne stockons jamais vos informations de carte bancaire.'
      },
      {
        q: 'Quelle est la différence entre Premium et VIP ?',
        a: 'Premium débloque la messagerie, les filtres avancés et la visibilité des profils. VIP inclut tout cela, plus 2 boosts mensuels, une priorité de modération, et une mise en avant accrue de votre profil.'
      },
    ]
  },
  {
    id: 'messages',
    icon: MessageCircle,
    label: 'Messages',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    questions: [
      {
        q: 'Qui peut m\'envoyer des messages ?',
        a: 'Tous les membres peuvent vous envoyer des messages. Cependant, pour répondre ou envoyer des messages en premier, un abonnement Premium ou VIP est nécessaire.'
      },
      {
        q: 'Comment signaler un message inapproprié ?',
        a: 'Dans une conversation, cliquez sur l\'icône de signalement (drapeau) en haut de la fenêtre de chat. Sélectionnez la raison du signalement. Notre équipe de modération examinera votre signalement sous 24 heures.'
      },
      {
        q: 'Puis-je envoyer des photos en message privé ?',
        a: 'Oui, vous pouvez envoyer des images dans les conversations privées. Cliquez sur l\'icône appareil photo dans la zone de saisie de message pour sélectionner une photo depuis votre appareil.'
      },
    ]
  },
  {
    id: 'security',
    icon: Shield,
    label: 'Sécurité & Confidentialité',
    color: 'text-red-600',
    bg: 'bg-red-50',
    questions: [
      {
        q: 'Comment bloquer un utilisateur ?',
        a: 'Sur le profil d\'un utilisateur, cliquez sur l\'icône de bouclier. Une fois bloqué, cet utilisateur ne pourra plus voir votre profil, vous envoyer des messages, ni vous contacter d\'aucune façon.'
      },
      {
        q: 'Mes données personnelles sont-elles protégées ?',
        a: 'Oui, nous respectons le RGPD. Vos données ne sont jamais revendues à des tiers. Vous pouvez demander la suppression de votre compte et de toutes vos données à tout moment depuis les Paramètres.'
      },
      {
        q: 'Comment signaler un faux profil ?',
        a: 'Sur le profil suspect, cliquez sur le menu "..." puis "Signaler". Sélectionnez "Faux profil" et ajoutez des détails si possible. Notre équipe traitera votre signalement rapidement.'
      },
    ]
  },
];

const TUTORIALS = [
  {
    step: 1,
    icon: User,
    title: 'Créez votre profil',
    description: 'Renseignez vos informations, ajoutez vos photos et décrivez-vous pour attirer les bons profils.',
    color: 'from-amber-400 to-amber-600'
  },
  {
    step: 2,
    icon: Search,
    title: 'Définissez vos critères',
    description: 'Utilisez la recherche rapide ou les filtres avancés (Premium) pour trouver des profils correspondant à vos attentes.',
    color: 'from-blue-400 to-blue-600'
  },
  {
    step: 3,
    icon: Heart,
    title: 'Likez et connectez-vous',
    description: 'Likez les profils qui vous intéressent et envoyez des messages pour briser la glace.',
    color: 'from-pink-400 to-pink-600'
  },
  {
    step: 4,
    icon: Zap,
    title: 'Boostez votre visibilité',
    description: 'Utilisez les boosts pour apparaître en tête de liste et être vu par plus de membres.',
    color: 'from-purple-400 to-purple-600'
  },
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-amber-600 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-gray-800">{question}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-amber-500" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />}
      </button>
      {open && (
        <p className="pb-4 text-gray-600 text-sm leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function Help() {
  const [activeCategory, setActiveCategory] = useState('profile');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ subject: '', message: '', email: '' });
  const [sent, setSent] = useState(false);

  const { data: myProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.Profile.filter({ created_by: user.email });
      return profiles[0] || null;
    }
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      await base44.entities.SupportTicket.create({
        user_email: user.email,
        subject: data.subject,
        description: data.message,
        category: 'other',
        status: 'open',
        priority: 'medium',
      });
    },
    onSuccess: () => {
      setSent(true);
      setForm({ subject: '', message: '', email: '' });
      toast.success('Votre message a bien été envoyé !');
    },
    onError: () => toast.error('Erreur lors de l\'envoi, veuillez réessayer.')
  });

  const activeData = FAQ_CATEGORIES.find(c => c.id === activeCategory);

  const filteredQuestions = search.trim()
    ? FAQ_CATEGORIES.flatMap(cat => cat.questions.filter(q =>
        q.q.toLowerCase().includes(search.toLowerCase()) ||
        q.a.toLowerCase().includes(search.toLowerCase())
      ))
    : activeData?.questions || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={myProfile} />

      {/* Hero */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-90" />
          <h1 className="text-3xl font-bold mb-2">Centre d'aide</h1>
          <p className="text-amber-100 mb-6">Comment pouvons-nous vous aider ?</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une question..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">

        {/* Tutoriels */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">🚀 Commencer sur Meetyyou</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TUTORIALS.map(t => (
              <div key={t.step} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                  <t.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs text-gray-400 mb-1">Étape {t.step}</div>
                <h3 className="font-semibold text-gray-800 mb-2">{t.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">❓ Foire aux questions</h2>

          {!search && (
            <div className="flex flex-wrap gap-2 mb-6">
              {FAQ_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? `${cat.bg} ${cat.color} ring-2 ring-current ring-offset-1`
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
            {search && filteredQuestions.length === 0 && (
              <p className="py-8 text-center text-gray-400">Aucun résultat pour "{search}"</p>
            )}
            {filteredQuestions.map((item, i) => (
              <FAQItem key={i} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-6">✉️ Contacter le support</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 text-lg mb-1">Message envoyé !</h3>
                <p className="text-gray-500 text-sm mb-4">Notre équipe vous répondra dans les plus brefs délais.</p>
                <Button variant="outline" onClick={() => setSent(false)}>Envoyer un autre message</Button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); sendMutation.mutate(form); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <Input
                    placeholder="Ex: Problème de paiement, question sur mon profil..."
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
                  <Textarea
                    placeholder="Décrivez votre problème ou votre question en détail..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    required
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 gap-2"
                  disabled={sendMutation.isPending}
                >
                  <Send className="w-4 h-4" />
                  {sendMutation.isPending ? 'Envoi...' : 'Envoyer'}
                </Button>
              </form>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}