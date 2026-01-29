/**
 * КОД ДЛЯ СТРАНИЦЫ ДЕТАЛИЗАЦИИ ПРОЕКТА
 * Основная функциональность для страницы проекта
 */

document.addEventListener('DOMContentLoaded', function() {
    /* ========== ПЛАВНАЯ ПРОКРУТКА ДЛЯ ВНУТРЕННИХ ССЫЛОК ========== */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 100;

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /* ========== LAZY LOADING ДЛЯ ИЗОБРАЖЕНИЙ ========== */
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('img[loading="lazy"]');

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        // Убедимся, что изображение еще не загружено
                        if (!img.src || img.src === window.location.href) {
                            img.src = img.dataset.src || img.src;
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                // Сохраняем оригинальный src в data-src если нужно
                if (!img.dataset.src && img.src) {
                    img.dataset.src = img.src;
                    // Устанавливаем placeholder для ленивой загрузки
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
                }
                imageObserver.observe(img);
            });
        }
    }

    /* ========== ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ ========== */
    function initProjectDetailPage() {
        initSmoothScroll();
        initLazyLoading();

        // Инициализация обработчиков ошибок изображений
        const images = document.querySelectorAll('.project-gallery img, .client-logo img');
        images.forEach(img => {
            img.addEventListener('error', function() {
                console.warn('Ошибка загрузки изображения:', this.src);
                this.src = '/static/images/placeholder.jpg';
                this.alt = 'Изображение не загружено';
            });
        });

        console.log('Страница детализации проекта инициализирована');
    }

    // Запускаем инициализацию
    initProjectDetailPage();
});