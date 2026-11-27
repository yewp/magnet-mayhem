'use strict';
// Orbbitz.io's offline copy, for the web site and the Android app (which shows the site). The page, its manifest and
// its icons are kept in a cache: each request goes to the network first (so a new version shows as soon as it is
// online) and falls back to the cache without a connection, so Practice offline works with no network. Requests to
// other origins (the online arena, Google Fonts) are left alone; offline, the page uses the system fonts.
const CACHE = 'orbbitz-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png',
  './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
