self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      // Icon public folder mein hona chahiye, default vercel icon ya apna logo daal sakte ho
      icon: '/favicon.ico', 
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Jab notification par click ho, toh user seedha dashboard par chala jaye
  event.waitUntil(clients.openWindow('/dashboard'));
});