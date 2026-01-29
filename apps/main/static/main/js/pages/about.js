// Основной JavaScript для страницы "Обо мне"
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initPhilosophyTabs();
    initEducationAccordion();
    initToolsInteractions();
    initImageLazyLoading();
    initSmoothAnimations();
});

// Инициализация табов философии
function initPhilosophyTabs() {
    const philosophyCards = document.querySelectorAll('.philosophy-card');
    const philosophyGrid = document.getElementById('philosophyTabs');

    if (!philosophyCards.length || !philosophyGrid) return;

    // Установка первого таба как активного
    philosophyCards[0].classList.add('active');

    philosophyCards.forEach(card => {
        card.addEventListener('click', function() {
            // Удаляем активный класс у всех карточек
            philosophyCards.forEach(c => c.classList.remove('active'));

            // Добавляем активный класс текущей карточке
            this.classList.add('active');

            // Получаем номер таба
            const tabNumber = this.dataset.tab;

            // Здесь можно добавить логику для отображения дополнительного контента
            console.log(`Активирован таб философии: ${tabNumber}`);
        });
    });
}

// Инициализация аккордеона образования
function initEducationAccordion() {
    const educationItems = document.querySelectorAll('.education-item');

    educationItems.forEach(item => {
        const header = item.querySelector('.education-header');
        const toggle = item.querySelector('.accordion-toggle');

        header.addEventListener('click', function() {
            // Закрываем все другие элементы
            educationItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });

            // Переключаем текущий элемент
            item.classList.toggle('active');

            // Анимируем иконку
            if (toggle) {
                if (item.classList.contains('active')) {
                    toggle.textContent = '−';
                } else {
                    toggle.textContent = '+';
                }
            }
        });
    });
}

// Инициализация взаимодействий с инструментами
function initToolsInteractions() {
    const toolItems = document.querySelectorAll('.tool-item');

    toolItems.forEach(item => {
        item.addEventListener('click', function() {
            // Переключаем активный класс
            toolItems.forEach(tool => tool.classList.remove('active'));
            this.classList.add('active');

            // Получаем имя инструмента
            const toolName = this.dataset.tool;
            console.log(`Выбран инструмент: ${toolName}`);

            // Здесь можно добавить логику для отображения деталей инструмента
        });

        // Добавляем эффект при наведении на мобильных устройствах
        item.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });

        item.addEventListener('touchend', function() {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        });
    });
}

// Ленивая загрузка изображений
function initImageLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Плавные анимации при прокрутке
function initSmoothAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Наблюдаем за секциями
    const sections = document.querySelectorAll('.about__text');
    sections.forEach(section => observer.observe(section));
}

// Адаптивность меню
function handleMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
}

// Обработка ресайза окна
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Переинициализация при изменении размера
        initPhilosophyTabs();
        initEducationAccordion();
    }, 250);
});

// Экспорт функций для использования в других модулях
window.AboutPage = {
    initPhilosophyTabs,
    initEducationAccordion,
    initToolsInteractions,
    initImageLazyLoading,
    initSmoothAnimations,
    handleMobileMenu
};