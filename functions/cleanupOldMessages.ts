import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const messages = await base44.asServiceRole.entities.Message.filter({
        created_date: { $lt: thirtyDaysAgo.toISOString() }
    });

    let deleted = 0;
    for (const msg of messages) {
        await base44.asServiceRole.entities.Message.delete(msg.id);
        deleted++;
    }

    return Response.json({ success: true, deleted, cutoff: thirtyDaysAgo.toISOString() });
});