export const triggerLocalNotification = async (title, body) => {
  // 1. Check if running in a native Capacitor wrapper
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
    try {
      const LocalNotifications = window.Capacitor.Plugins.LocalNotifications;
      let permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        permStatus = await LocalNotifications.requestPermissions();
      }
      if (permStatus.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now()
            }
          ]
        });
      }
    } catch (e) {
      console.error('Capacitor local notification failed:', e);
    }
  } 
  // 2. Fallback to standard web browser Push Notification API
  else if ('Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
    } catch (e) {
      console.error('Web notification failed:', e);
    }
  }
};
