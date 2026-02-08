import { base44 } from '@/api/base44Client';

export async function calculateTrustScore(userEmail, profileId) {
  try {
    // Récupérer toutes les données nécessaires
    const [profile, reports, moderationActions, messages, likes, profileViews, verificationRequests] = await Promise.all([
      base44.entities.Profile.filter({ created_by: userEmail }).then(p => p[0]),
      base44.entities.Report.filter({ reported_user_email: userEmail }),
      base44.entities.ModerationAction.filter({ target_user_email: userEmail }),
      base44.entities.Message.filter({ sender_email: userEmail }),
      base44.entities.Like.filter({ liker_email: userEmail }),
      base44.entities.ProfileView.filter({ viewer_email: userEmail }),
      base44.entities.VerificationRequest.filter({ user_email: userEmail })
    ]);

    // Calculer le score de complétion du profil
    const profileFields = [
      'display_name', 'bio', 'city', 'country', 'age', 'occupation',
      'education_level', 'photos', 'interests', 'hobbies', 'values',
      'relationship_goals', 'about_me', 'looking_for_in_partner'
    ];
    const completedFields = profileFields.filter(field => {
      const value = profile?.[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
    });
    const profileCompletionScore = Math.round((completedFields.length / profileFields.length) * 100);

    // Score de vérification
    const isVerified = profile?.is_verified || false;
    const hasPhotos = profile?.photos?.length > 0;
    const verificationPending = verificationRequests.some(v => v.status === 'pending');
    const verificationScore = isVerified ? 100 : (hasPhotos ? 50 : 0) + (verificationPending ? 25 : 0);

    // Score d'interactions
    const totalInteractions = messages.length + likes.length + profileViews.length;
    const interactionScore = Math.min(100, Math.round((totalInteractions / 50) * 100));

    // Score basé sur les signalements
    const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'dismissed');
    const pendingReports = reports.filter(r => r.status === 'pending');
    const reportScore = reports.length === 0 ? 100 : Math.max(0, 100 - (pendingReports.length * 20) - (resolvedReports.length * 5));

    // Score d'activité
    const daysSinceJoin = profile?.created_date 
      ? Math.floor((Date.now() - new Date(profile.created_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const activityScore = daysSinceJoin > 0 ? Math.min(100, Math.round((totalInteractions / daysSinceJoin) * 10)) : 0;

    // Analyse IA
    const aiAnalysisPrompt = `Analyse le profil utilisateur suivant et fournis une évaluation de confiance:

Données du profil:
- Complétion: ${profileCompletionScore}%
- Vérifié: ${isVerified}
- Signalements: ${reports.length} (${pendingReports.length} en attente)
- Actions de modération: ${moderationActions.length}
- Messages envoyés: ${messages.length}
- Likes donnés: ${likes.length}
- Profils vus: ${profileViews.length}
- Jours depuis inscription: ${daysSinceJoin}

Fournis:
1. Une analyse du comportement (2-3 phrases)
2. Les signaux d'alerte potentiels
3. Les points positifs
4. Des recommandations

Sois concis et factuel.`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: aiAnalysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          analysis: { type: "string" },
          red_flags: { type: "array", items: { type: "string" } },
          positive_points: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Calcul du score global avec pondération
    const overallScore = Math.round(
      profileCompletionScore * 0.25 +
      verificationScore * 0.20 +
      interactionScore * 0.20 +
      reportScore * 0.25 +
      activityScore * 0.10
    );

    // Déterminer le niveau de confiance
    let trustLevel = 'low';
    if (overallScore >= 80) trustLevel = 'excellent';
    else if (overallScore >= 60) trustLevel = 'high';
    else if (overallScore >= 40) trustLevel = 'medium';

    // Avantages débloqués
    const benefits = [];
    if (overallScore >= 40) benefits.push('Profil visible dans la recherche');
    if (overallScore >= 60) benefits.push('Badge de confiance', 'Priorité dans les matchs');
    if (overallScore >= 80) benefits.push('Accès aux fonctionnalités premium', 'Visibilité maximale', 'Support prioritaire');

    return {
      user_email: userEmail,
      profile_id: profileId,
      overall_score: overallScore,
      trust_level: trustLevel,
      profile_completion_score: profileCompletionScore,
      verification_score: verificationScore,
      interaction_score: interactionScore,
      report_score: reportScore,
      activity_score: activityScore,
      ai_analysis: aiResult.analysis,
      factors: {
        completed_fields: completedFields.length,
        total_fields: profileFields.length,
        is_verified: isVerified,
        reports_count: reports.length,
        pending_reports: pendingReports.length,
        moderation_actions: moderationActions.length,
        total_interactions: totalInteractions,
        days_since_join: daysSinceJoin,
        positive_points: aiResult.positive_points,
        recommendations: aiResult.recommendations
      },
      last_calculated: new Date().toISOString(),
      benefits_unlocked: benefits,
      red_flags: aiResult.red_flags || []
    };
  } catch (error) {
    console.error('Error calculating trust score:', error);
    throw error;
  }
}

export async function updateUserTrustScore(userEmail, profileId) {
  const scoreData = await calculateTrustScore(userEmail, profileId);
  
  // Vérifier si un score existe déjà
  const existing = await base44.entities.TrustScore.filter({ user_email: userEmail });
  
  if (existing.length > 0) {
    return base44.entities.TrustScore.update(existing[0].id, scoreData);
  } else {
    return base44.entities.TrustScore.create(scoreData);
  }
}