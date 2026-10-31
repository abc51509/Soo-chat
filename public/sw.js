self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 接收來自畫面的延遲推播指令
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, options } = event.data;
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delay);
  }
});
