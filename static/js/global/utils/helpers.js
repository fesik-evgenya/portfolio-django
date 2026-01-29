/**
 * ГЛОБАЛЬНЫЕ ХЕЛПЕРЫ И УТИЛИТЫ
 */

/**
 * Делит вызов функции на указанный интервал
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Проверяет, является ли устройство мобильным
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Форматирует телефонный номер для отображения
 */
function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Убираем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');

    // Форматируем российский номер
    if (cleaned.length === 11 && cleaned.startsWith('7') || cleaned.startsWith('8')) {
        return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9, 11)}`;
    }

    return phone;
}

/**
 * Копирует текст в буфер обмена
 */
function copyToClipboard(text) {
    return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        });
}

/**
 * Генерирует уникальный ID
 */
function generateId() {
    return 'id-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Проверяет, находится ли элемент в области видимости
 */
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Плавная прокрутка к элементу
 */
function smoothScrollTo(element, duration = 500) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

/**
 * Преобразует строку в slug (для URL)
 */
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

/**
 * Форматирует дату в читаемый вид
 */
function formatDate(date, format = 'ru') {
    const d = new Date(date);

    if (format === 'ru') {
        return d.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    return d.toLocaleDateString();
}

/**
 * Проверяет поддержку WebP формата
 */
async function checkWebPSupport() {
    return new Promise((resolve) => {
        const webP = new Image();
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        webP.onload = webP.onerror = function () {
            resolve(webP.height === 2);
        };
    });
}

// Экспортируем функции для глобального использования
if (typeof window !== 'undefined') {
    window.helpers = {
        debounce,
        isMobile,
        formatPhoneNumber,
        copyToClipboard,
        generateId,
        isElementInViewport,
        smoothScrollTo,
        slugify,
        formatDate,
        checkWebPSupport
    };
}