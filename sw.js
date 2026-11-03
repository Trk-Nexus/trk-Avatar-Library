// SPDX-License-Identifier: GPL-3.0-or-later
// trk Modern UX: Service Worker — PWA キャッシュ戦略・オフラインフォールバック
// キャッシュ名: trk-v2026.11.03-trk269

const CACHE_NAME = "trk-v2026.11.03-trk269";
const OFFLINE_URL = "./index.html";

// インストール時にキャッシュする静的アセット（キャッシュファースト）
const STATIC_ASSETS = [
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

// ネットワークファーストで取得する動的リソース（API など将来拡張用）
const DYNAMIC_ROUTES = [];

// キャッシュ容量管理（最大 50 エントリ）
const MAX_CACHE_ENTRIES = 50;

// インストール: 静的アセットをキャッシュ
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).then(() => {
        return self.skipWaiting();
      });
    })
  );
});

// アクティベーション: 古いキャッシュを削除し、新しい Service Worker を即座に有効化
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// フェッチ: キャッシュ戦略の使い分け
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ナビゲーションリクエスト（HTML）: ネットワークファースト、オフライン時はキャッシュ
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // ネットワーク成功: キャッシュを更新
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // ネットワーク失敗: キャッシュから返す
          return caches.match(OFFLINE_URL).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 最後の手段: 空のレスポンス
            return new Response("オフラインです", {
              status: 503,
              statusText: "Offline",
              headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" }),
            });
          });
        })
    );
    return;
  }

  // 静的アセット: キャッシュファースト
  if (STATIC_ASSETS.includes(url.pathname) || url.pathname.startsWith("./")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // キャッシュヒット: バックグラウンドでネットワーク更新（ stale-while-revalidate）
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                return caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {
              // バックグラウンド更新失敗は無視
            });
          return cachedResponse;
        }
        // キャッシュミス: ネットワーク取得
        return fetch(request).then((networkResponse) => {
          if (!networkResponse.ok) {
            return networkResponse;
          }
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // その他のリソース: ネットワークファースト
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // キャッシュ容量管理
          cache.keys().then((keys) => {
            if (keys.length >= MAX_CACHE_ENTRIES) {
              cache.delete(keys[0]);
            }
          });
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response("リソースが利用できません", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({ "Content-Type": "text/plain; charset=utf-8" }),
          });
        });
      })
  );
});

// メッセージイベント: クライアントからのキャッシュ管理要求
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
