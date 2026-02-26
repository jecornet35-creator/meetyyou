import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to manage browser push notifications (Web Notification API).
 * Returns:
 *  - permission: 'default' | 'granted' | 'denied'
 *  - requestPermission: function to ask the user
 *  - sendNotification: function(title, body, options) to show a notification
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback((title, body, options = {}) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'meetyyou-message',
      requireInteraction: false,
      ...options,
    });
    if (options.onClick) {
      n.onclick = options.onClick;
    }
  }, []);

  return { permission, requestPermission, sendNotification };
}