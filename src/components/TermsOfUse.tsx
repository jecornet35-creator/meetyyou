import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, ClipboardList, Check } from 'lucide-react';

interface TermsOfUseProps {
  onBack: () => void;
}

export default function TermsOfUse({ onBack }: TermsOfUseProps) {
  const termsContent = [
    {
      title: "1. Bienvenue sur Meetyyou",
      content: [
        "Meetyyou est une plateforme de rencontres en ligne conçue pour connecter des personnes à travers le monde. En accédant à notre application ou site web (ci-après \"la Plateforme\"), vous acceptez sans réserve les présentes Conditions d'Utilisation (ci-après \"CGU\").",
        "Ces CGU constituent un contrat juridiquement contraignant entre vous et Meetyyou SAS (ci-après \"nous\", \"Meetyyou\"). Si vous n'acceptez pas ces conditions, veuillez cesser d'utiliser la Plateforme immédiatement.",
        "Nous nous réservons le droit de modifier ces CGU à tout moment. En cas de modification substantielle, nous vous en informerons par e-mail ou notification push au moins 30 jours avant l'entrée en vigueur des modifications. La poursuite de votre utilisation après notification vaut acceptation des nouvelles conditions."
      ]
    },
    {
      title: "2. Conditions d'accès",
      content: [
        "Âge minimum : Vous devez avoir au moins 18 ans révolus pour utiliser Meetyyou. En vous inscrivant, vous certifiez être majeur(e) selon la loi de votre pays de résidence. Meetyyou applique une politique de tolérance zéro à l'égard de l'utilisation de la Plateforme par des mineurs.",
        "Inscription unique : Vous ne pouvez détenir qu'un seul compte actif. La création de comptes multiples est interdite.",
        "Restrictions légales : Vous certifiez ne pas avoir été condamné pour une infraction sexuelle ou tout autre crime grave vous interdisant l'accès à ce type de service. Meetyyou se réserve le droit de procéder à des vérifications d'identité et d'antécédents à tout moment.",
        "Entreprises et organisations : Seules les personnes physiques peuvent s'inscrire. Les entités commerciales, associations, groupes ou robots ne sont pas autorisés à créer de compte."
      ]
    },
    {
      title: "3. Votre compte",
      content: [
        "Création du compte : Lors de votre inscription, vous vous engagez à fournir des informations exactes, à jour et complètes. Votre profil doit vous représenter fidèlement. Toute usurpation d'identité est strictement prohibée.",
        "Sécurité : Vous êtes responsable de la confidentialité de vos identifiants de connexion. Toute activité réalisée depuis votre compte vous est imputable. Signalez immédiatement toute utilisation non autorisée de votre compte à support@meetyyou.com.",
        "Données du profil : Vous pouvez inclure dans votre profil : photos personnelles, informations de présentation, centres d'intérêt et préférences de rencontre. Vous vous interdisez d'afficher des coordonnées personnelles (email, téléphone, adresse) dans votre profil public.",
        "Photos : Les photos soumises doivent vous représenter uniquement et être récentes. Les images contenant de la nudité, des tiers non consentants, des mineurs, ou du contenu trompeur sont prohibées. Meetyyou peut modérer ou supprimer tout contenu ne respectant pas ces règles.",
        "Inactivité : Un compte sans connexion pendant 12 mois consécutifs et sans abonnement actif peut être désactivé. Vous en serez informé par e-mail 30 jours avant."
      ]
    },
    {
      title: "4. Nos services",
      content: [
        "Nature du service : Meetyyou est une plateforme d'intermédiation sociale permettant à des adultes de se rencontrer. Nous ne sommes pas une agence matrimoniale, ni un service d'escort, ni un service de rencontres par correspondance.",
        "Offre gratuite : La création d'un profil de base, la navigation et certaines interactions limitées sont accessibles gratuitement.",
        "Offres Premium : Des fonctionnalités avancées (messagerie illimitée, visibilité accrue, filtres de recherche avancés, etc.) sont disponibles via nos abonnements payants Premium et VIP, décrits sur la page \"Abonnements\".",
        "Boosts de profil : Des crédits de mise en avant de profil peuvent être achetés séparément ou inclus dans certains abonnements. Un boost offre une visibilité accrue pendant 24 heures. Les crédits non utilisés expirent 12 mois après leur date d'achat.",
        "Algorithme de correspondance : Meetyyou utilise un algorithme de recommandation basé sur vos préférences, votre activité et votre localisation. Cet algorithme est conçu pour vous proposer des profils pertinents, sans discrimination basée sur des critères protégés."
      ]
    },
    {
      title: "5. Abonnements et paiements",
      content: [
        "Tarification : Les tarifs de nos abonnements sont affichés sur la page dédiée et incluent toutes les taxes applicables (TVA pour l'Europe). Les prix peuvent varier selon votre région de résidence.",
        "Facturation : En souscrivant un abonnement, vous autorisez Meetyyou à prélever le montant correspondant via votre moyen de paiement enregistré. En cas de renouvellement automatique, vous en serez informé au moins 7 jours avant le prélèvement.",
        "Renouvellement automatique : Sauf désactivation de votre part, votre abonnement est renouvelé automatiquement à son échéance. Vous pouvez désactiver le renouvellement automatique à tout moment depuis les paramètres de votre compte, sans frais.",
        "Modification des tarifs : Toute modification tarifaire vous sera communiquée avec un préavis d'au moins 30 jours. Elle s'applique au prochain cycle de facturation. Si vous n'acceptez pas la nouvelle tarification, vous pouvez résilier votre abonnement avant l'entrée en vigueur du nouveau tarif.",
        "Sécurité des paiements : En cas d'activité de paiement suspecte, nous pouvons suspendre temporairement les transactions et vous contacter pour vérification.",
        "Services de paiement tiers : Certains paiements transitent par des prestataires tiers (ex. Stripe). Leur utilisation est soumise à leurs propres conditions générales."
      ]
    },
    {
      title: "6. Droit de rétractation et remboursements",
      content: [
        "Utilisateurs de l'Union européenne (Directive 2011/83/UE) : Conformément à la Directive sur les droits des consommateurs, vous disposez d'un délai de 14 jours calendaires à compter de la souscription pour exercer votre droit de rétractation, à condition de ne pas avoir commencé à utiliser les services premium (envoi de messages, consultation de profils premium, utilisation de fonctionnalités payantes). Si vous avez commencé à utiliser les services pendant ce délai, une quote-part proportionnelle à la durée d'utilisation sera retenue.",
        "Pour exercer ce droit, contactez-nous à legal@meetyyou.com avec l'objet \"Rétractation - [votre email d'inscription]\". Le remboursement interviendra dans les 14 jours suivant réception de votre demande.",
        "Utilisateurs du Royaume-Uni : Les droits de rétractation s'exercent dans les mêmes conditions que ceux de l'UE, conformément aux Consumer Contracts Regulations 2013.",
        "Résidents de certains États américains :",
        "Arizona, Californie, Connecticut, Illinois, Iowa, Minnesota, New York, Caroline du Nord, Ohio, Wisconsin : vous pouvez annuler votre abonnement sans pénalité dans les 3 jours ouvrables suivant la souscription.",
        "Californie, Illinois, New York, Ohio : en cas de décès ou d'incapacité permanente survenant pendant la période d'abonnement, votre succession ou vous-même pouvez obtenir le remboursement de la portion non consommée.",
        "Politique générale : En dehors des cas légaux obligatoires, les abonnements ne sont pas remboursables une fois activés et utilisés. Contactez notre support si vous estimez être victime d'une erreur de facturation."
      ]
    },
    {
      title: "7. Règles de comportement",
      content: [
        "Ce que vous vous engagez à faire :",
        "Traiter les autres membres avec respect et dignité",
        "Utiliser votre vrai nom et de vraies photos récentes",
        "Signaler tout comportement suspect ou abusif via la fonction dédiée",
        "Respecter les décisions des autres membres de ne pas poursuivre un échange",
        "Ce qui est strictement interdit :",
        "Harcèlement, intimidation, menaces ou comportements abusifs envers d'autres membres",
        "Usurpation d'identité ou tromperie sur votre âge, situation, identité",
        "Sollicitation d'argent, de données bancaires ou d'informations financières",
        "Publication de contenu sexuellement explicite, violent, raciste, haineux ou illégal",
        "Utilisation de la Plateforme à des fins commerciales, de spam, de phishing ou de démarchage",
        "Collecte automatisée de données (scraping, bots, scripts)",
        "Partage de coordonnées personnelles (téléphone, email, adresse) dans les champs publics",
        "Toute activité illégale incluant la prostitution, le trafic humain ou l'exploitation",
        "Sanctions : La violation de ces règles peut entraîner, selon la gravité : un avertissement, une suspension temporaire, la suppression définitive du compte et/ou un signalement aux autorités compétentes. Aucun remboursement n'est accordé en cas de résiliation pour manquement aux présentes règles."
      ]
    },
    {
      title: "8. Contenu utilisateur",
      content: [
        "Responsabilité : Vous êtes seul(e) responsable du contenu que vous publiez sur la Plateforme (textes, photos, messages). Meetyyou agit en qualité d'hébergeur au sens de la loi.",
        "Licence : En publiant du contenu, vous accordez à Meetyyou une licence mondiale, non exclusive, gratuite et transférable pour héberger, reproduire, afficher, distribuer et adapter ce contenu dans le cadre du fonctionnement et de la promotion de la Plateforme. Cette licence prend fin à la suppression de votre compte, sauf pour les copies de sauvegarde temporaires.",
        "Droits de propriété intellectuelle : Vous certifiez être titulaire des droits sur tout contenu publié ou avoir obtenu les autorisations nécessaires. Vous ne publiez pas de contenu appartenant à des tiers sans leur consentement.",
        "Modération : Meetyyou se réserve le droit de modérer, modifier ou supprimer tout contenu contraire aux présentes CGU, sans préavis et sans engagement de sa responsabilité. Un système de signalement est disponible pour tous les utilisateurs.",
        "Notification de contrefaçon : Pour signaler une violation de vos droits de propriété intellectuelle, contactez-nous à legal@meetyyou.com avec : votre identité, la description du contenu concerné, son emplacement sur la Plateforme et une déclaration sur l'honneur."
      ]
    },
    {
      title: "9. Protection des données personnelles",
      content: [
        "Responsable du traitement : Meetyyou SAS, Paris, France, est responsable du traitement de vos données personnelles.",
        "RGPD (Résidents UE/EEE) : Conformément au Règlement (UE) 2016/679, vous bénéficiez des droits suivants sur vos données : accès, rectification, effacement (\"droit à l'oubli\"), limitation du traitement, portabilité, opposition et retrait du consentement. Pour exercer ces droits : legal@meetyyou.com.",
        "CCPA (Résidents Californie) : Conformément au California Consumer Privacy Act, vous avez le droit de savoir quelles données nous collectons, de demander leur suppression et de vous opposer à leur vente. Meetyyou ne vend pas vos données personnelles à des tiers.",
        "Transferts internationaux : Vos données peuvent être traitées dans des pays hors UE. Dans ce cas, nous mettons en place des garanties appropriées (clauses contractuelles types, décisions d'adéquation) conformément au RGPD.",
        "Conservation : Vos données sont conservées pendant la durée de votre compte et 3 ans après sa suppression pour nos obligations légales, sauf demande d'effacement de votre part.",
        "Politique de confidentialité complète : Consultez notre Politique de Confidentialité détaillée sur la Plateforme pour l'intégralité des informations relatives au traitement de vos données."
      ]
    },
    {
      title: "10. Sécurité et rencontres en ligne",
      content: [
        "Avertissement important : Meetyyou met en relation des utilisateurs mais ne peut garantir l'identité, les intentions ou la véracité des informations de chaque membre. Exercez toujours votre jugement.",
        "Conseils de sécurité :",
        "Pour une première rencontre, choisissez un lieu public et informez une personne de confiance",
        "Ne partagez jamais vos informations financières avec un contact en ligne",
        "Signalez immédiatement tout comportement suspect via le bouton \"Signaler\"",
        "En cas de danger immédiat, contactez les services d'urgence (15, 17, 18 en France ; 911 aux USA)",
        "Signalement : Meetyyou traite tous les signalements dans les 48h ouvrées. Nous coopérons pleinement avec les autorités judiciaires et policières en cas d'infraction.",
        "Vérification d'identité : Meetyyou propose un système de vérification de profil volontaire (badge \"Vérifié\"). Ce badge confirme une correspondance entre la photo de profil et l'identité fournie, mais ne constitue pas une enquête exhaustive sur l'utilisateur."
      ]
    },
    {
      title: "11. Protection des mineurs (CSAM — Tolérance zéro)",
      content: [
        "Meetyyou applique une politique de tolérance zéro absolue envers toute forme d'abus, d'exploitation ou de contenu sexuel impliquant des mineurs (CSAM — Child Sexual Abuse Material).",
        "Sont strictement interdits et feront l'objet d'un signalement immédiat aux autorités :",
        "Tout contenu représentant des mineurs dans un contexte sexualisé",
        "Tout comportement visant à entrer en contact avec des mineurs à des fins sexuelles",
        "Le partage, la production ou la distribution de CSAM sous quelque forme que ce soit",
        "La sextorsion impliquant des mineurs",
        "Signalement : En cas de découverte de contenu illicite impliquant des mineurs, contactez immédiatement legal@meetyyou.com ou utilisez la fonction \"Signaler\" intégrée. Meetyyou signale systématiquement tout CSAM confirmé au Centre National pour Enfants Disparus et Exploités (NCMEC) pour les USA et aux autorités nationales compétentes en Europe (ex. : Internet Watch Foundation au Royaume-Uni, Point de contact national en France).",
        "Coopération légale : Meetyyou coopère sans restriction avec les autorités judiciaires dans toute enquête liée à la protection des mineurs."
      ]
    },
    {
      title: "12. Propriété intellectuelle",
      content: [
        "Droits de Meetyyou : La Plateforme, son code source, ses interfaces, son design, ses marques, logos, textes et fonctionnalités sont la propriété exclusive de Meetyyou SAS et sont protégés par les lois françaises, européennes et internationales sur la propriété intellectuelle.",
        "Ce que vous ne pouvez pas faire : Reproduire, modifier, distribuer, revendre ou exploiter commercialement tout ou partie de la Plateforme sans autorisation écrite préalable de Meetyyou.",
        "Marques : Les marques \"Meetyyou\" et son logo sont des marques déposées. Leur utilisation non autorisée est interdite.",
        "Liens vers la Plateforme : Tout lien vers notre Plateforme est autorisé dans un cadre non trompeur. Les liens présentant Meetyyou de manière erronée ou dégradante sont interdits."
      ]
    },
    {
      title: "13. Limitation de responsabilité",
      content: [
        "Service \"en l'état\" : La Plateforme est fournie \"telle quelle\". Nous ne garantissons pas son accessibilité continue, l'absence d'erreurs ou l'adéquation à vos attentes personnelles en matière de rencontres.",
        "Exclusions légales : Aucune disposition de ces CGU ne limite ou n'exclut notre responsabilité en cas de : décès ou dommages corporels résultant de notre négligence, fraude ou déclaration frauduleuse, violations du droit de la consommation européen ou de toute autre responsabilité ne pouvant légalement être exclue.",
        "Plafond de responsabilité : Dans les limites permises par la loi applicable, notre responsabilité totale envers vous ne pourra excéder le montant total des sommes que vous nous avez versées au cours des 12 mois précédant l'événement ayant causé le préjudice.",
        "Tiers : Meetyyou n'est pas responsable des comportements des autres utilisateurs de la Plateforme ni des contenus qu'ils publient.",
        "Droits des consommateurs européens : Si vous êtes un consommateur résidant dans l'UE, les garanties légales obligatoires prévues par le droit européen s'appliquent sans restriction, notamment en matière de conformité des services numériques (Directive 2019/770/UE)."
      ]
    },
    {
      title: "14. Résiliation du compte",
      content: [
        "Par vous : Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil ou en contactant support@meetyyou.com. La résiliation est effective immédiatement. Les abonnements en cours ne sont pas remboursés, sauf dans les cas prévus à l'Article 6.",
        "Par Meetyyou : Nous pouvons suspendre ou supprimer votre compte, avec ou sans préavis, en cas de violation des présentes CGU, activité frauduleuse, comportement illégal ou atteinte à la sécurité d'autres membres. En cas de résiliation à nos torts, les sommes prépayées non consommées vous seront remboursées.",
        "Effets de la résiliation : La suppression de votre compte entraîne la suppression de votre profil et de vos données, sous réserve de nos obligations légales de conservation. Vos messages envoyés à d'autres membres peuvent subsister dans leurs interfaces jusqu'à leur propre suppression."
      ]
    },
    {
      title: "15. Résolution des litiges",
      content: [
        "Résolution amiable : En cas de litige, nous vous invitons à contacter d'abord notre service client à support@meetyyou.com. Nous nous engageons à répondre dans les 5 jours ouvrés et à rechercher une solution amiable.",
        "Médiation (UE) : Conformément au droit européen (Règlement 524/2013/UE), vous pouvez recourir à la plateforme de règlement en ligne des litiges de la Commission européenne : https://ec.europa.eu/consumers/odr. Meetyyou est également disponible pour une médiation via un médiateur de la consommation agréé.",
        "Droit applicable (UE et autres pays hors USA) : Les présentes CGU sont soumises au droit français. Les tribunaux compétents sont ceux de Paris, France, sans préjudice des règles impératives de protection des consommateurs de votre pays de résidence.",
        "Utilisateurs américains — Arbitrage obligatoire : Tout litige avec des résidents américains sera résolu par arbitrage individuel contraignant administré par l'American Arbitration Association (AAA) selon ses règles Consumer Arbitration Rules (www.adr.org). L'arbitrage se tiendra à New York ou à distance. Les réclamations inférieures à 5 000 USD peuvent être portées devant le tribunal des petites créances de votre comté.",
        "RENONCIATION AUX ACTIONS COLLECTIVES : Vous et Meetyyou renoncez mutuellement au droit de participer à toute action collective ou procédure représentative. Toute réclamation doit être soumise à titre individuel.",
        "Le droit de l'État de New York (USA) s'applique aux utilisateurs américains."
      ]
    },
    {
      title: "16. Dispositions diverses",
      content: [
        "Intégralité de l'accord : Les présentes CGU, combinées à notre Politique de Confidentialité et aux éventuelles conditions spécifiques aux services payants, constituent l'intégralité de l'accord entre vous et Meetyyou.",
        "Divisibilité : Si une clause des présentes CGU est déclarée invalide ou inapplicable, les autres clauses demeurent pleinement en vigueur.",
        "Non-renonciation : Le fait pour Meetyyou de ne pas exercer un droit prévu par les présentes CGU ne constitue pas une renonciation à ce droit.",
        "Cession : Meetyyou peut céder ses droits et obligations issus des présentes CGU à un tiers dans le cadre d'une fusion, acquisition ou cession d'actifs, sous réserve de vous en informer. Vous ne pouvez pas céder vos droits sans accord écrit préalable de Meetyyou.",
        "Force majeure : Meetyyou ne peut être tenu responsable de tout manquement résultant de circonstances indépendantes de sa volonté raisonnable.",
        "Langue : En cas de contradiction entre la version française et une traduction des présentes CGU, la version française prévaut.",
        "Nous contacter :",
        "Support utilisateur : support@meetyyou.com",
        "Questions légales / données personnelles : legal@meetyyou.com",
        "Adresse : Meetyyou SAS, Paris, France"
      ]
    }
  ];

  const summaryItems = [
    { text: <>Vous devez avoir <span className="font-bold">18 ans minimum</span> pour utiliser Meetyyou</> },
    { text: <>Vos informations de profil doivent être <span className="font-bold">exactes et authentiques</span></> },
    { text: <>Respect, bienveillance et honnêteté envers les autres membres sont <span className="font-bold">obligatoires</span></> },
    { text: <>Droit de rétractation de <span className="font-bold">14 jours</span> pour les abonnés UE (sans utilisation du service)</> },
    { text: <>Vos données sont protégées selon le <span className="font-bold">RGPD</span> (UE) et le <span className="font-bold">CCPA</span> (Californie)</> },
    { text: <><span className="font-bold">Tolérance zéro</span> envers tout contenu impliquant des mineurs</> },
    { text: <>Résolution des litiges par <span className="font-bold">médiation</span> (UE) ou <span className="font-bold">arbitrage</span> (USA)</> }
  ];

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] font-sans text-neutral-900">
      {/* Header Section */}
      <header className="bg-[#E88B00] text-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="fill-white text-white w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">Meetyyou</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Conditions d'Utilisation</h1>
          <p className="text-white/90 mb-4">Dernière mise à jour : 2 mars 2026</p>
          <p className="text-white/90 max-w-2xl leading-relaxed">
            Bienvenue chez Meetyyou. Ces conditions régissent votre utilisation de notre plateforme.
            Prenez le temps de les lire — elles protègent à la fois vous et les autres membres de notre communauté.
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-8 pb-24 relative z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[#E88B00] font-medium hover:text-[#CC7A00] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        {/* Summary Card */}
        <div className="bg-[#FFFBF0] border border-[#F2D7A5] rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="text-[#8B5A2B] w-5 h-5" />
            <h2 className="text-lg font-bold text-[#8B5A2B]">Résumé en bref</h2>
          </div>
          <ul className="space-y-3">
            {summaryItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3 text-[#5C4033]">
                <div className="mt-0.5 bg-[#4ADE80] rounded-sm text-white p-0.5 shrink-0">
                  <Check className="w-3 h-3" strokeWidth={4} />
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Table of Contents Card */}
        <div className="bg-white rounded-xl p-8 mb-12 shadow-sm border border-neutral-100">
          <h2 className="text-sm font-bold text-[#001F3F] uppercase tracking-wider mb-6">Table des matières</h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
            {termsContent.map((section, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(index)}
                className="text-left text-[#E88B00] hover:text-[#CC7A00] hover:underline transition-colors text-sm"
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8 md:p-12">
          <div className="space-y-12">
            {termsContent.map((section, index) => (
              <section key={index} id={`section-${index}`}>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6 pb-2 border-b border-neutral-100">
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-neutral-600 leading-relaxed">
                      {paragraph.startsWith("-") || paragraph.match(/^[A-Z]/) && paragraph.length < 100 && section.title.includes("Règles") ? (
                        <span className="flex gap-2">
                          <span className="text-[#E88B00] mt-1">•</span>
                          <span>{paragraph}</span>
                        </span>
                      ) : (
                        paragraph
                      )}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
