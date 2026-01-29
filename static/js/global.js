/**
 * GLOBAL OPTIMIZED JAVASCRIPT
 * Загружается с defer, не блокирует рендеринг
 */

// Утилиты для производительности
const PerformanceUtils = {
    mark: (name) => {
        if (window.performance && performance.mark) {
            performance.mark(name);
        }
    },

    measure: (name, startMark, endMark) => {
        if (window.performance && performance.measure) {
            performance.measure(name, startMark, endMark);
        }
    },

    getFirstPaint() {
        if (window.performance && performance.getEntriesByType) {
            const paints = performance.getEntriesByType('paint');
            return paints.find(p => p.name === 'first-paint') || paints[0];
        }
        return null;
    }
};

// Оптимизированный обработчик DOMContentLoaded
const initOnDOMReady = () => {
    PerformanceUtils.mark('domContentLoaded');

    // Предзагрузка критических изображений
    preloadCriticalImages();

    // Инициализация Service Worker (если есть)
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }

    // Оптимизация для мобильных устройств
    if ('connection' in navigator) {
        optimizeForConnection(navigator.connection);
    }

    console.log('🚀 Global JS initialized');
};

// Предзагрузка критических изображений
function preloadCriticalImages() {
    const criticalImages = [
        '{% static "images/logo/og_image.jpg" %}',
        '{% static "images/about_photo.png" %}'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
        img.loading = 'eager';
        img.fetchPriority = 'high';
    });
}

// Регистрация Service Worker
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register(
            '{% static "js/sw.js" %}',
            { scope: '/' }
        );
        console.log('✅ Service Worker зарегистрирован:', registration.scope);
    } catch (error) {
        console.log('❌ Ошибка регистрации Service Worker:', error);
    }
}

// Оптимизация под тип соединения
function optimizeForConnection(connection) {
    if (connection.saveData) {
        // Режим экономии данных
        disableAnimations();
        loadLowerQualityImages();
    }

    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Медленное соединение
        disableNonCriticalFeatures();
    }
}

function disableAnimations() {
    document.documentElement.classList.add('reduce-motion');
}

function loadLowerQualityImages() {
    document.querySelectorAll('img[data-src-low]').forEach(img => {
        img.src = img.dataset.srcLow;
    });
}

function disableNonCriticalFeatures() {
    // Отключаем не-критичные функции
    const nonCritical = document.querySelectorAll('[data-non-critical]');
    nonCritical.forEach(el => el.style.display = 'none');
}

// Оптимизированные обработчики событий
const EventHandlers = {
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    debounce: (func, wait) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};

// Инициализация при полной загрузке страницы
window.addEventListener('load', () => {
    PerformanceUtils.mark('pageLoaded');
    PerformanceUtils.measure('pageLoadTime', 'domContentLoaded', 'pageLoaded');

    // Отправка метрик производительности
    sendPerformanceMetrics();

    // Удаляем preload ссылки для освобождения памяти
    cleanupPreloadLinks();
});

// Отправка метрик производительности
function sendPerformanceMetrics() {
    if (window.performance && performance.getEntriesByType) {
        const timing = performance.timing;
        const metrics = {
            dns: timing.domainLookupEnd - timing.domainLookupStart,
            tcp: timing.connectEnd - timing.connectStart,
            request: timing.responseEnd - timing.requestStart,
            domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
            pageLoad: timing.loadEventEnd - timing.navigationStart,
            fcp: PerformanceUtils.getFirstPaint()?.startTime || 0
        };

        // Отправляем в аналитику
        if (typeof gtag !== 'undefined') {
            gtag('event', 'performance_metrics', metrics);
        }

        console.log('📊 Performance Metrics:', metrics);
    }
}

// Очистка preload ссылок
function cleanupPreloadLinks() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"]');
    setTimeout(() => {
        preloadLinks.forEach(link => {
            if (link.rel === 'preload') {
                link.rel = 'preload';
            }
        });
    }, 3000);
}

// Инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnDOMReady);
} else {
    initOnDOMReady();
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PerformanceUtils,
        EventHandlers,
        initOnDOMReady
    };
}