import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { trigger, user_email, user_name } = await req.json();

    if (!trigger || !user_email) {
      return Response.json({ error: 'trigger and user_email are required' }, { status: 400 });
    }

    // Find active automations for this trigger
    const automations = await base44.asServiceRole.entities.EmailAutomation.filter({
      trigger,
      is_active: true,
    });

    if (!automations || automations.length === 0) {
      return Response.json({ sent: 0, message: 'No active automation for this trigger' });
    }

    let sent = 0;
    for (const automation of automations) {
      // Get the template
      const template = await base44.asServiceRole.entities.EmailTemplate.get(automation.template_id);
      if (!template) continue;

      const personalizedBody = template.body.replace(/\{name\}/g, user_name || user_email);

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user_email,
        subject: template.subject,
        body: personalizedBody,
      });

      // Increment emails_sent counter
      await base44.asServiceRole.entities.EmailAutomation.update(automation.id, {
        emails_sent: (automation.emails_sent || 0) + 1,
      });

      sent++;
    }

    return Response.json({ sent, message: `${sent} email(s) sent for trigger: ${trigger}` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});