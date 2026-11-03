// SPDX-License-Identifier: GPL-3.0-or-later
// trk269: Service Worker — キャッシュ名 trk-v2026.11.03-trk269

const CACHE_NAME = "trk-v2026.11.03-trk269";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/core.js",
  "./js/data.js",
  "./js/cli.js",
  "./js/i18n.js",
  "./js/skins-wizard.js",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
