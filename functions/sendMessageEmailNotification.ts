import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { recipient_email, sender_name, message_preview } = await req.json();

    if (!recipient_email || !sender_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check user notification preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreferences.filter({
      created_by: recipient_email
    });
    const userPrefs = prefs[0];

    // Only send if email_notifications is enabled (or not set yet, default true)
    if (userPrefs && userPrefs.email_notifications === false) {
      return Response.json({ skipped: true, reason: 'email_notifications disabled' });
    }
    if (userPrefs && userPrefs.push_enabled === false) {
      return Response.json({ skipped: true, reason: 'push disabled' });
    }

    const preview = message_preview
      ? message_preview.substring(0, 100)
      : '📷 Image envoyée';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient_email,
      subject: `💬 Nouveau message de ${sender_name}`,
      body: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Meetyyou 💛</h1>
          </div>
          <h2 style="color: #1f2937;">Nouveau message de <strong>${sender_name}</strong></h2>
          <div style="background: #f9fafb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="color: #374151; margin: 0; font-style: italic;">"${preview}${message_preview && message_preview.length > 100 ? '...' : ''}"</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Connectez-vous pour répondre et continuer la conversation.</p>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://meetyyou.base44.app" style="background: #f59e0b; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
              Voir le message →
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Vous recevez cet email car vous avez activé les notifications email dans vos préférences.<br>
            <a href="https://meetyyou.base44.app" style="color: #9ca3af;">Gérer mes préférences</a>
          </p>
        </div>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});