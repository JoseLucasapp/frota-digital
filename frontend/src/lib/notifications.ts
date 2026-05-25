export const isNotificationRead = (notification: { read?: boolean | null; is_read?: boolean | null }) =>
  Boolean(notification.read ?? notification.is_read ?? false);
