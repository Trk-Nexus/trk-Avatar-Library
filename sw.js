// SPDX-License-Identifier: GPL-3.0-or-later
// Cache only this application's assets; never delete a sibling application's caches.
const CACHE_PREFIX = "trk-avatar-library-";
const CACHE_NAME = `${CACHE_PREFIX}2026-11-03-review35`;
const BASE = self.registration.scope;
const STATIC_ASSETS = [
  "./", "./index.html", "./css/style.css", "./js/core.js", "./js/data.js",
  "./js/cli.js", "./js/i18n.js", "./js/skins-wizard.js", "./manifest.json",
  "./icon-192.png", "./icon-512.png",
];
const STATIC_URLS = new Set(STATIC_ASSETS.map((path) => new URL(path, BASE).href));
const OFFLINE_URL = new URL("./index.html", BASE).href;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Do not cache arbitrary paths or other applications on the same origin.
  if (request.mode !== "navigate" && !STATIC_URLS.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok && STATIC_URLS.has(url.href)) await cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) ||
        (request.mode === "navigate" && await cache.match(OFFLINE_URL)) ||
        new Response("オフラインです", {status: 503, headers: {"Content-Type": "text/plain; charset=utf-8"}});
    }
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_VERSION" && event.ports[0]) {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
