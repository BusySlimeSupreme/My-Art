// Minimal service worker — only purpose right now is to let the page show
// notifications via registration.showNotification(), which works far more
// reliably on mobile browsers (especially when installed as a PWA) than
// calling `new Notification()` directly from the page.
const SW_VERSION='v3'; // bump this any time you redeploy, so old clients pick up the change
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.map(k=>caches.delete(k)))) // clear any old cached assets from a previous SW version
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const url=e.notification.data&&e.notification.data.url?e.notification.data.url:'/';
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(clientsArr=>{
      for(const client of clientsArr){
        if('focus' in client){client.postMessage({type:'notif-click',data:e.notification.data});return client.focus();}
      }
      if(self.clients.openWindow)return self.clients.openWindow(url);
    })
  );
});
