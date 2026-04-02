import { 
  ArrowLeft, 
  Save, 
  Brain, 
  Target, 
  Quote,
  MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonalityQuestionsPage({ onBack }) {
  const QuestionSection = ({ title, icon, color, questions }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-8">
      <div className={`px-8 py-4 border-b border-neutral-100 flex items-center gap-3 ${color === 'purple' ? 'bg-purple-50/30' : color === 'orange' ? 'bg-orange-50/30' : 'bg-teal-50/30'}`}>
        <div className={color === 'purple' ? 'text-purple-600' : color === 'orange' ? 'text-orange-600' : 'text-teal-600'}>
          {icon}
        </div>
        <h2 className={`font-bold ${color === 'purple' ? 'text-purple-800' : color === 'orange' ? 'text-orange-800' : 'text-teal-800'}`}>
          {title}
        </h2>
      </div>
      <div className="p-8 space-y-6">
        {questions.map((q, idx) => (
          <div key={idx}>
            <label className="block text-neutral-700 text-sm font-bold mb-2">{q}</label>
            <textarea 
              rows={3} 
              placeholder="Votre réponse..."
              className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-sm"
            ></textarea>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-orange-500 font-bold hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>
        <button 
          onClick={onBack}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Save className="w-[18px] h-[18px]" />
          Sauvegarder
        </button>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 mb-8 text-center md:text-left">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Questions sur votre personnalité</h1>
        <p className="text-neutral-500">Répondez à ces questions pour mieux vous faire connaître et créer des connexions plus authentiques.</p>
      </div>

      {/* Personality Questions */}
      <QuestionSection 
        title="Questions de personnalité"
        icon={<Brain className="w-6 h-6" />}
        color="purple"
        questions={[
          "Comment vos amis vous décriraient-ils ?",
          "Êtes-vous plutôt introverti(e) ou extraverti(e) ? Expliquez.",
          "Comment gérez-vous les conflits dans une relation ?",
          "Qu'est-ce qui vous rend heureux(se) au quotidien ?",
          "Quelle est votre plus grande qualité ?",
          "Quel est votre plus grand défaut (soyez honnête 😊) ?",
          "Comment réagissez-vous face au stress ou aux épreuves ?",
          "Êtes-vous plutôt guidé(e) par la tête ou par le cœur ?"
        ]}
      />

      {/* Life Goals */}
      <QuestionSection 
        title="Objectifs de vie"
        icon={<Target className="w-6 h-6" />}
        color="orange"
        questions={[
          "Quel est votre objectif principal dans les 5 prochaines années ?",
          "Comment imaginez-vous votre vie idéale ?",
          "Quelle place occupe la famille dans votre vie ?",
          "Qu'est-ce que le succès signifie pour vous ?",
          "Quel héritage souhaitez-vous laisser derrière vous ?",
          "Quelle est votre vision d'une relation de couple épanouissante ?"
        ]}
      />

      {/* Favorite Quotes */}
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden mb-8">
        <div className="px-8 py-4 border-b border-neutral-100 flex items-center gap-3 bg-teal-50/30">
          <Quote className="text-teal-600 w-6 h-6" />
          <h2 className="font-bold text-teal-800">Citations favorites</h2>
        </div>
        <div className="p-8 space-y-8">
          <p className="text-neutral-500 text-sm italic">Partagez des citations qui vous inspirent ou vous ressemblent.</p>
          
          {[1, 2, 3].map((num) => (
            <div key={num} className="p-6 bg-neutral-50/50 rounded-2xl border border-neutral-100">
              <label className="block text-neutral-700 text-sm font-bold mb-3">Citation {num}</label>
              <textarea 
                rows={2} 
                placeholder='"La citation que vous aimez..."'
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none text-sm mb-3 italic"
              ></textarea>
              <input 
                type="text" 
                placeholder="Auteur (optionnel)"
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Button */}
      <div className="flex justify-center mt-12 mb-20">
        <button 
          onClick={onBack}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-12 py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center gap-3"
        >
          <Save className="w-5 h-5" />
          Sauvegarder mes réponses
        </button>
      </div>
    </div>
  );
}
