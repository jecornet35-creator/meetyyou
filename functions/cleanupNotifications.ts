import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (user?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();

  let deleted = 0;

  // 1. Delete all profile_view notifications older than 15 days
  const oldViews = await base44.asServiceRole.entities.Notification.filter({
    type: 'profile_view',
    created_date: { $lt: fifteenDaysAgo }
  }, '-created_date', 500);
  for (const n of oldViews) {
    await base44.asServiceRole.entities.Notification.delete(n.id);
    deleted++;
  }

  // 2. For likes and favorites: keep only 50 most recent per user, delete older ones + delete if > 15 days
  const types = ['like', 'favorite'];

  // Get all unique user emails with likes/favorites
  const allLikesFavs = await base44.asServiceRole.entities.Notification.filter(
    { type: { $in: types } }, '-created_date', 5000
  );

  // Group by user_email + type
  const grouped = {};
  for (const n of allLikesFavs) {
    const key = `${n.user_email}__${n.type}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  }

  for (const key of Object.keys(grouped)) {
    const notifications = grouped[key]; // already sorted by -created_date
    // Delete ones older than 15 days
    for (const n of notifications) {
      if (new Date(n.created_date) < new Date(fifteenDaysAgo)) {
        await base44.asServiceRole.entities.Notification.delete(n.id);
        deleted++;
      }
    }
    // Keep only 50 most recent (after the date filter, re-check remaining)
    const remaining = notifications.filter(n => new Date(n.created_date) >= new Date(fifteenDaysAgo));
    if (remaining.length > 50) {
      const toDelete = remaining.slice(50); // oldest ones beyond 50
      for (const n of toDelete) {
        await base44.asServiceRole.entities.Notification.delete(n.id);
        deleted++;
      }
    }
  }

  return Response.json({ success: true, deleted });
});