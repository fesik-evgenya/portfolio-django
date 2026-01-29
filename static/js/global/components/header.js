/**
 * OPTIMIZED HEADER COMPONENT
 * Загружается lazy или сразу если выше сгиба
 */

class HeaderComponent {
    constructor(element) {
        this.element = element;
        this.menuToggle = element.querySelector('#menuToggle');
        this.navLinks = element.querySelector('#navLinks');
        this.init();
    }

    init() {
        if (!this.menuToggle || !this.navLinks) return;

        this.menuToggle.addEventListener('click', this.toggleMenu.bind(this));

        // Закрытие меню при клике на ссылку
        this.element.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
                // Отслеживание кликов по навигации для аналитики
                this.trackNavigation(link.getAttribute('href'));
            });
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target) && this.navLinks.classList.contains('active')) {
                this.closeMenu();
            }
        });

        // Отмечаем, что компонент инициализирован
        this.element.classList.add('header--initialized');
        console.log('✅ Header component initialized');
    }

    toggleMenu() {
        const isActive = this.navLinks.classList.toggle('active');
        this.menuToggle.classList.toggle('active', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';

        // Анимация для мобильного меню
        if (isActive) {
            this.animateMenuIn();
        }
    }

    closeMenu() {
        this.navLinks.classList.remove('active');
        this.menuToggle.classList.remove('active');
        document.body.style.overflow = '';
        this.animateMenuOut();
    }

    animateMenuIn() {
        // Простая анимация появления
        this.navLinks.style.transform = 'translateX(0)';
    }

    animateMenuOut() {
        this.navLinks.style.transform = 'translateX(-100%)';
    }

    trackNavigation(url) {
        // Отправка данных в аналитику
        if (typeof gtag !== 'undefined') {
            gtag('event', 'navigation_click', {
                'event_category': 'Navigation',
                'event_label': url,
                'transport_type': 'beacon'
            });
        }
    }
}

// Автоматическая инициализация при загрузке компонента
document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('[data-lazy="header"]');
    if (headerElement) {
        // Проверяем, загружен ли уже компонент стилями
        if (headerElement.offsetParent !== null) {
            new HeaderComponent(headerElement);
        } else {
            // Ждём загрузки стилей
            const observer = new MutationObserver(() => {
                if (headerElement.offsetParent !== null) {
                    new HeaderComponent(headerElement);
                    observer.disconnect();
                }
            });
            observer.observe(headerElement, { attributes: true });
        }
    }
});

// Инициализация при событии component:loaded
document.addEventListener('component:loaded', (e) => {
    if (e.detail.componentId === 'header') {
        new HeaderComponent(e.detail.element);
    }
});

// Export для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderComponent;
}