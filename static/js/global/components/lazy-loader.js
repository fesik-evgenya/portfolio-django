/**
 * LAZY LOADING SYSTEM
 * Загружает компоненты по мере появления в viewport
 */

class LazyLoader {
    constructor() {
        this.loadedComponents = new Set();
        this.observerOptions = {
            root: null,
            rootMargin: '150px', // Начинаем загружать заранее
            threshold: 0.01
        };

        this.init();
    }

    init() {
        // Проверяем поддержку IntersectionObserver
        if ('IntersectionObserver' in window) {
            this.setupObserver();
        } else {
            // Fallback: загружаем всё сразу
            this.loadAllComponents();
        }

        // Отмечаем, что страница загружена
        window.addEventListener('load', () => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
        });
    }

    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadComponent(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Находим все компоненты с data-lazy
        document.querySelectorAll('[data-lazy]').forEach(element => {
            // Если компонент выше сгиба, загружаем сразу
            if (this.isAboveTheFold(element)) {
                this.loadComponent(element);
            } else {
                this.observer.observe(element);
            }
        });
    }

    isAboveTheFold(element) {
        const rect = element.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }

    async loadComponent(element) {
        const componentId = element.dataset.lazy;

        // Проверяем, не загружен ли уже компонент
        if (this.loadedComponents.has(componentId)) {
            return;
        }

        this.loadedComponents.add(componentId);

        // Загружаем стили
        if (element.dataset.styles) {
            await this.loadStyles(element.dataset.styles);
        }

        // Загружаем скрипты
        if (element.dataset.script) {
            await this.loadScript(element.dataset.script);
        }

        // Инициализируем компонент
        this.initializeComponent(element, componentId);

        // Диспатчим событие о загрузке компонента
        element.dispatchEvent(new CustomEvent('component:loaded', {
            detail: { componentId, element }
        }));
    }

    loadStyles(href) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружены ли уже стили
            if (document.querySelector(`link[href="${href}"]`)) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = () => {
                console.log(`✅ Styles loaded: ${href}`);
                resolve();
            };
            link.onerror = reject;

            document.head.appendChild(link);
        });
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = () => {
                console.log(`✅ Script loaded: ${src}`);
                resolve();
            };
            script.onerror = reject;

            document.body.appendChild(script);
        });
    }

    initializeComponent(element, componentId) {
        // Компонентная инициализация
        switch(componentId) {
            case 'header':
                element.classList.add('header--loaded');
                break;
            case 'messages':
                element.classList.add('messages--loaded');
                break;
            case 'canvas':
                // Canvas background уже будет инициализирован своим скриптом
                element.style.opacity = '0';
                setTimeout(() => {
                    element.style.transition = 'opacity 0.5s ease';
                    element.style.opacity = '1';
                }, 100);
                break;
        }

        console.log(`🎯 Component initialized: ${componentId}`);
    }

    loadAllComponents() {
        // Fallback: загружаем все компоненты сразу
        document.querySelectorAll('[data-lazy]').forEach(element => {
            this.loadComponent(element);
        });
    }

    // API для ручной загрузки компонента
    loadComponentById(componentId) {
        const element = document.querySelector(`[data-lazy="${componentId}"]`);
        if (element) {
            this.loadComponent(element);
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
});

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}