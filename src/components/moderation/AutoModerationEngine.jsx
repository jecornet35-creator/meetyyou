import { base44 } from '@/api/base44Client';
import { subDays } from 'date-fns';

/**
 * Moteur de modération automatique
 * Vérifie et applique les règles de modération automatique
 */
export async function checkAndApplyAutoModeration(reportedUserEmail, reportedProfileId, newReportType) {
  try {
    // Récupérer les règles actives
    const rules = await base44.entities.AutoModerationRule.filter({ is_active: true });
    if (rules.length === 0) return null;

    // Trier par priorité
    const sortedRules = rules.sort((a, b) => (b.priority || 1) - (a.priority || 1));

    // Récupérer tous les signalements de l'utilisateur
    const allReports = await base44.entities.Report.filter({ 
      reported_user_email: reportedUserEmail 
    });

    // Pour chaque règle, vérifier si elle est déclenchée
    for (const rule of sortedRules) {
      const timeWindowDate = subDays(new Date(), rule.time_window_days || 7);
      
      // Filtrer les signalements dans la fenêtre de temps
      const recentReports = allReports.filter(r => {
        if (!r.created_date) return false;
        return new Date(r.created_date) > timeWindowDate;
      });

      let shouldTrigger = false;

      // Vérifier selon le type de déclencheur
      if (rule.trigger_type === 'report_count') {
        // Nombre total de signalements
        shouldTrigger = recentReports.length >= (rule.threshold_count || 3);
      } else if (rule.trigger_type === 'report_type_count') {
        // Nombre de signalements par type
        const relevantReports = recentReports.filter(r => 
          rule.report_types && rule.report_types.includes(r.type)
        );
        shouldTrigger = relevantReports.length >= (rule.threshold_count || 2);
      } else if (rule.trigger_type === 'specific_violation') {
        // Violation spécifique
        const specificReports = recentReports.filter(r => 
          rule.report_types && rule.report_types.includes(r.type)
        );
        shouldTrigger = specificReports.length >= (rule.threshold_count || 1);
      }

      if (shouldTrigger) {
        // Vérifier si cette action n'a pas déjà été prise récemment
        const existingActions = await base44.entities.ModerationAction.filter({
          target_user_email: reportedUserEmail,
          action_type: rule.action_type
        });

        const recentAutoActions = existingActions.filter(a => {
          if (!a.created_date) return false;
          return new Date(a.created_date) > timeWindowDate && a.moderator_email === 'system@auto-moderation';
        });

        // Si action déjà prise, continuer à la règle suivante
        if (recentAutoActions.length > 0) continue;

        // Appliquer l'action
        const actionResult = await applyAutoModerationAction(
          rule,
          reportedUserEmail,
          reportedProfileId,
          recentReports.length
        );

        return actionResult;
      }
    }

    return null;
  } catch (error) {
    console.error('Erreur dans le moteur de modération automatique:', error);
    return null;
  }
}

async function applyAutoModerationAction(rule, userEmail, profileId, reportCount) {
  try {
    // Créer l'action de modération
    const actionData = {
      moderator_email: 'system@auto-moderation',
      moderator_name: 'Système automatique',
      target_user_email: userEmail,
      target_profile_id: profileId,
      action_type: rule.action_type,
      reason: `Règle automatique: ${rule.name}`,
      details: `Action automatique déclenchée suite à ${reportCount} signalement(s) dans les ${rule.time_window_days} derniers jours. ${rule.description || ''}`,
      previous_action_count: reportCount
    };

    if (rule.action_type === 'temporary_suspension') {
      const suspensionEnd = new Date();
      suspensionEnd.setDate(suspensionEnd.getDate() + (rule.suspension_days || 7));
      actionData.suspension_end_date = suspensionEnd.toISOString();
    }

    const moderationAction = await base44.entities.ModerationAction.create(actionData);

    // Mettre à jour le statut de l'utilisateur
    const statusUpdate = {};
    
    if (rule.action_type === 'warning') {
      statusUpdate.status = 'warned';
      const existingStatus = await base44.entities.UserStatus.filter({ user_email: userEmail });
      const currentWarnings = existingStatus[0]?.warning_count || 0;
      statusUpdate.warning_count = currentWarnings + 1;
      statusUpdate.last_warning_date = new Date().toISOString();
      statusUpdate.notes = `Avertissement automatique: ${rule.name}`;
    } else if (rule.action_type === 'temporary_suspension') {
      statusUpdate.status = 'suspended';
      const suspensionEnd = new Date();
      suspensionEnd.setDate(suspensionEnd.getDate() + (rule.suspension_days || 7));
      statusUpdate.suspension_end_date = suspensionEnd.toISOString();
      const existingStatus = await base44.entities.UserStatus.filter({ user_email: userEmail });
      const currentSuspensions = existingStatus[0]?.suspension_count || 0;
      statusUpdate.suspension_count = currentSuspensions + 1;
      statusUpdate.notes = `Suspension automatique: ${rule.name}`;
    } else if (rule.action_type === 'permanent_ban') {
      statusUpdate.status = 'banned';
      statusUpdate.ban_reason = `Bannissement automatique: ${rule.name}`;
      statusUpdate.banned_at = new Date().toISOString();
      statusUpdate.notes = `Bannissement automatique suite à ${reportCount} signalements`;
    }

    // Créer ou mettre à jour le statut utilisateur
    const existingUserStatus = await base44.entities.UserStatus.filter({ user_email: userEmail });
    if (existingUserStatus.length > 0) {
      await base44.entities.UserStatus.update(existingUserStatus[0].id, statusUpdate);
    } else {
      await base44.entities.UserStatus.create({ user_email: userEmail, ...statusUpdate });
    }

    return {
      success: true,
      action: moderationAction,
      rule: rule
    };
  } catch (error) {
    console.error('Erreur lors de l\'application de l\'action automatique:', error);
    return { success: false, error };
  }
}

export default { checkAndApplyAutoModeration };