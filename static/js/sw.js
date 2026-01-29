/**
 * SERVICE WORKER для оффлайн работы и кэширования
 */

const CACHE_NAME = 'portfolio-v1';
const CRITICAL_ASSETS = [
    '/',
    '/static/css/critical.css',
    '/static/js/global.js',
    '/static/js/global/components/lazy-loader.js',
    '/static/images/logo/favicon.svg'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Стратегия кэширования: Network First, fallback to Cache
self.addEventListener('fetch', event => {
    // Пропускаем не-GET запросы
    if (event.request.method !== 'GET') return;

    // Пропускаем chrome-extension запросы
    if (event.request.url.startsWith('chrome-extension://')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Клонируем ответ для кэширования
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, responseClone));
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request)
                    .then(cachedResponse => cachedResponse || fetch(event.request));
            })
    );
});

// Background Sync для оффлайн данных
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncForms());
    }
});

async function syncForms() {
    // Логика синхронизации форм
    console.log('🔄 Syncing forms...');
}