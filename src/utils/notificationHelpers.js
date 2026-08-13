/**
 * Helper utilities for notification filtering based on installation timestamp.
 */

export const getNotificationTimestamp = (item) => {
  if (!item) return 0;
  if (item.createdAt) {
    const ms = new Date(item.createdAt).getTime();
    if (!isNaN(ms) && ms > 0) return ms;
  }
  if (item.id) {
    const matches = String(item.id).match(/\d{10,13}/);
    if (matches) return parseInt(matches[0], 10);
  }
  return 0;
};

export const isNotificationAfterInstall = (notif, installTime) => {
  if (!installTime) return true;
  const installMs = new Date(installTime).getTime();
  if (isNaN(installMs) || installMs === 0) return true;

  const notifMs = getNotificationTimestamp(notif);
  if (!notifMs) return true;

  return notifMs >= installMs;
};

export const getFilteredNotifications = (notifications = [], installTime = null) => {
  if (!Array.isArray(notifications)) return [];
  return notifications.filter(n => isNotificationAfterInstall(n, installTime));
};
