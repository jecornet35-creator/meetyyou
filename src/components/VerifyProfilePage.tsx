import { 
  ArrowLeft, 
  ShieldCheck, 
  Camera, 
  FileText, 
  Star, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function VerifyProfilePage({ onBack }) {
  const [selectedType, setSelectedType] = useState('complete');

  const verificationTypes = [
    {
      id: 'selfie',
      icon: <Camera className="w-6 h-6" />,
      title: "Vérification par selfie",
      description: "Prenez un selfie — notre IA compare votre visage à vos photos de profil",
      badge: { text: "Vérifié", color: "emerald" }
    },
    {
      id: 'document',
      icon: <FileText className="w-6 h-6" />,
      title: "Vérification par document",
      description: "Soumettez une pièce d'identité officielle (passeport, CNI, permis)",
      badge: { text: "🏅 Hautement vérifié", color: "amber" }
    },
    {
      id: 'complete',
      icon: <Star className="w-6 h-6" />,
      title: "Vérification complète (recommandé)",
      description: "Selfie + document officiel pour le niveau de confiance maximum",
      badge: { text: "🏅 Hautement vérifié", color: "amber" },
      recommended: true
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back Link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-orange-500 font-medium mb-8 hover:underline"
      >
        <ArrowLeft className="w-[18px] h-[18px]" />
        Retour au profil
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 md:p-12 text-center">
        {/* Shield Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
            <ShieldCheck className="w-12 h-12" strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Vérifiez votre profil</h1>
        <p className="text-neutral-500 mb-10">Obtenez un badge de confiance pour plus de visibilité</p>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
            <span className="text-orange-500 font-bold text-sm">Choisir</span>
          </div>
          <div className="w-12 h-px bg-neutral-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center font-bold text-sm">2</div>
            <span className="text-neutral-400 font-medium text-sm">Téléverser</span>
          </div>
          <div className="w-12 h-px bg-neutral-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-100 text-neutral-400 rounded-full flex items-center justify-center font-bold text-sm">3</div>
            <span className="text-neutral-400 font-medium text-sm">Confirmer</span>
          </div>
        </div>

        {/* Options Section */}
        <div className="text-left mb-10">
          <h2 className="text-lg font-bold text-neutral-800 mb-6">Choisissez votre type de vérification</h2>
          
          <div className="space-y-4">
            {verificationTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedType(type.id)}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedType === type.id ? 'border-orange-500 bg-orange-50/10' : 'border-neutral-100 hover:border-neutral-200'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 ${selectedType === type.id ? 'text-orange-500' : 'text-neutral-400'}`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-neutral-800">{type.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${type.badge.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {type.badge.color === 'emerald' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {type.badge.text}
                      </span>
                      {type.recommended && (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-500 text-sm leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <button className="w-full bg-orange-300 hover:bg-orange-400 text-white font-bold py-4 rounded-xl transition-all shadow-sm">
          Continuer
        </button>
      </div>
    </div>
  );
}
