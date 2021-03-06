// TODO: implement service worker so that users can use the app offline. The SW
// will need to cache static assets to display the app offline. Additionally,
// the SW should cache transaction data, using the cached data as a fallback
// when the app is used offline. HINT: You should use two caches. One for the
// static assets such as html, css, js, images, etc; and another cache for
// the dynamic data from requests to routes beginning with "/api".

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/db.js",
    "/style.css"
    // "/assets/images/icons/icon-192x192.png",
    // "/assets/images/icons/icon-512x512.png",
    // "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    // "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

//Install service worker
console.log('installing service worker');
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', evt => {
    // remove old caches
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map( key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log('Removing old cache data', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Files
self.addEventListener('fetch',  evt => {

    // cache successful GET requests to the API
    // add --> && evt.request.method === "GET")
    if (evt.request.url.includes('/api/')&& evt.request.method === "GET") {
        console.log('[Service Worker] Fetch (data)', evt.request.url);

        evt.respondWith(
            caches
            .open(DATA_CACHE_NAME)
            .then(cache => {
                return fetch(evt.request)
                    .then(response  => {
                        // If the response was good, clone it and store it in the cache
                        // changed --> evt.request.url,
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }
                        return response;
                    })
                    //or ---> .catch((err) => console.log(err))
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            })
        );
        // stop execution of the fetch event callback
        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request)
            });

        })
    );
});