import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, CheckCircle, Brain, Target, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PERSONALITY_QUESTIONS = [
  { key: 'personality_q1', question: 'Comment vos amis vous décriraient-ils ?' },
  { key: 'personality_q2', question: 'Êtes-vous plutôt introverti(e) ou extraverti(e) ? Expliquez.' },
  { key: 'personality_q3', question: 'Comment gérez-vous les conflits dans une relation ?' },
  { key: 'personality_q4', question: "Qu'est-ce qui vous rend heureux(se) au quotidien ?" },
  { key: 'personality_q5', question: 'Quelle est votre plus grande qualité ?' },
  { key: 'personality_q6', question: 'Quel est votre plus grand défaut (soyez honnête 😊) ?' },
  { key: 'personality_q7', question: 'Comment réagissez-vous face au stress ou aux épreuves ?' },
  { key: 'personality_q8', question: 'Êtes-vous plutôt guidé(e) par la tête ou par le cœur ?' },
];

const LIFE_GOALS = [
  { key: 'life_goal_q1', question: 'Quel est votre objectif principal dans les 5 prochaines années ?' },
  { key: 'life_goal_q2', question: 'Comment imaginez-vous votre vie idéale ?' },
  { key: 'life_goal_q3', question: 'Quelle place occupe la famille dans votre vie ?' },
  { key: 'life_goal_q4', question: "Qu'est-ce que le succès signifie pour vous ?" },
  { key: 'life_goal_q5', question: 'Quel héritage souhaitez-vous laisser derrière vous ?' },
  { key: 'life_goal_q6', question: "Quelle est votre vision d'une relation de couple épanouissante ?" },
];

const QUOTES_FIELDS = [
  { quoteKey: 'quote1', authorKey: 'quote_author1', label: 'Citation 1' },
  { quoteKey: 'quote2', authorKey: 'quote_author2', label: 'Citation 2' },
  { quoteKey: 'quote3', authorKey: 'quote_author3', label: 'Citation 3' },
];

function SectionCard({ icon: Icon, title, color, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${color}`}>
        <Icon className="w-5 h-5" />
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function QuestionField({ question, fieldKey, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{question}</label>
      <Textarea
        value={value || ''}
        onChange={e => onChange(fieldKey, e.target.value)}
        placeholder="Votre réponse..."
        className="resize-none h-20 text-sm border-gray-200 focus:border-amber-400 focus:ring-amber-400"
      />
    </div>
  );
}

export default function PersonalityQuestions() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  const { data: personality, isLoading } = useQuery({
    queryKey: ['my-personality'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const results = await base44.entities.Personality.filter({ created_by: user.email });
      return results[0] || null;
    },
  });

  useEffect(() => {
    if (personality) setForm(personality);
  }, [personality]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (personality?.id) {
        return base44.entities.Personality.update(personality.id, data);
      }
      return base44.entities.Personality.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-personality'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const answeredCount = Object.values(form).filter(v => v && String(v).trim() !== '').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 gap-2"
          >
            {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Enregistré !' : 'Sauvegarder'}
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">Questions sur votre personnalité</h1>
          <p className="text-gray-500 text-sm mt-1">
            Répondez à ces questions pour mieux vous faire connaître et créer des connexions plus authentiques.
            {answeredCount > 0 && (
              <span className="ml-2 font-semibold text-amber-600">{answeredCount} réponse{answeredCount > 1 ? 's' : ''}</span>
            )}
          </p>
        </div>

        {/* Section 1 - Personnalité */}
        <SectionCard icon={Brain} title="Questions de personnalité" color="text-purple-700 bg-purple-50">
          {PERSONALITY_QUESTIONS.map(q => (
            <QuestionField
              key={q.key}
              question={q.question}
              fieldKey={q.key}
              value={form[q.key]}
              onChange={handleChange}
            />
          ))}
        </SectionCard>

        {/* Section 2 - Objectifs de vie */}
        <SectionCard icon={Target} title="Objectifs de vie" color="text-amber-700 bg-amber-50">
          {LIFE_GOALS.map(q => (
            <QuestionField
              key={q.key}
              question={q.question}
              fieldKey={q.key}
              value={form[q.key]}
              onChange={handleChange}
            />
          ))}
        </SectionCard>

        {/* Section 3 - Citations */}
        <SectionCard icon={Quote} title="Citations favorites" color="text-teal-700 bg-teal-50">
          <p className="text-sm text-gray-500 -mt-2">Partagez des citations qui vous inspirent ou vous ressemblent.</p>
          {QUOTES_FIELDS.map(({ quoteKey, authorKey, label }) => (
            <div key={quoteKey} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
              <p className="text-sm font-semibold text-gray-600">{label}</p>
              <Textarea
                value={form[quoteKey] || ''}
                onChange={e => handleChange(quoteKey, e.target.value)}
                placeholder='"La citation que vous aimez..."'
                className="resize-none h-16 text-sm italic border-gray-200 bg-white"
              />
              <Input
                value={form[authorKey] || ''}
                onChange={e => handleChange(authorKey, e.target.value)}
                placeholder="Auteur (optionnel)"
                className="text-sm border-gray-200 bg-white h-8"
              />
            </div>
          ))}
        </SectionCard>

        {/* Save bottom */}
        <div className="pb-8 flex justify-center">
          <Button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 gap-2 px-10"
          >
            {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {saved ? 'Enregistré !' : 'Sauvegarder mes réponses'}
          </Button>
        </div>
      </main>
    </div>
  );
}