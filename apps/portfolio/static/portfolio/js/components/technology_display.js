/**
 * КОМПОНЕНТ ОТОБРАЖЕНИЯ ТЕХНОЛОГИЙ
 */

class TechnologyDisplay {
    constructor() {
        this.technologyItems = [];
        this.init();
    }

    init() {
        const techContainer = document.querySelector('.project-technologies');
        if (!techContainer) return;

        this.technologyItems = Array.from(techContainer.querySelectorAll('.technology-item'));

        // Добавляем обработчики для интерактивности
        this.technologyItems.forEach(item => {
            // Показ дополнительной информации при наведении
            item.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
            item.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

            // Клик для мобильных устройств
            item.addEventListener('click', (e) => this.handleClick(e));
        });

        // Инициализация ленивой загрузки иконок
        this.initLazyLoading();
    }

    handleMouseEnter(e) {
        const item = e.currentTarget;
        item.style.zIndex = '10';

        // Показываем tooltip для длинных названий
        const nameElement = item.querySelector('.technology-name');
        if (nameElement && nameElement.scrollWidth > nameElement.clientWidth) {
            this.showTooltip(nameElement.textContent, item);
        }
    }

    handleMouseLeave(e) {
        const item = e.currentTarget;
        item.style.zIndex = '';
        this.hideTooltip();
    }

    handleClick(e) {
        const item = e.currentTarget;
        const nameElement = item.querySelector('.technology-name');

        if (nameElement && nameElement.scrollWidth > nameElement.clientWidth) {
            // На мобильных устройствах показываем полное название
            if (window.innerWidth <= 768) {
                alert(nameElement.textContent);
            }
        }
    }

    showTooltip(text, element) {
        // Удаляем существующий тултип
        this.hideTooltip();

        // Создаем новый тултип
        const tooltip = document.createElement('div');
        tooltip.className = 'technology-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1000;
            white-space: nowrap;
            pointer-events: none;
        `;

        // Позиционируем тултип
        const rect = element.getBoundingClientRect();
        tooltip.style.left = `${rect.left + window.scrollX}px`;
        tooltip.style.top = `${rect.top + window.scrollY - 40}px`;

        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const images = document.querySelectorAll('.technology-icon img[loading="lazy"]');

            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (!img.src || img.src === window.location.href) {
                            img.src = img.dataset.src || img.src;
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                if (!img.dataset.src && img.src) {
                    img.dataset.src = img.src;
                }
                imageObserver.observe(img);
            });
        }
    }

    // Метод для фильтрации технологий (если потребуется)
    filterTechnologies(filter) {
        this.technologyItems.forEach(item => {
            const name = item.querySelector('.technology-name').textContent.toLowerCase();
            const shouldShow = filter === '' || name.includes(filter.toLowerCase());
            item.style.display = shouldShow ? 'flex' : 'none';
        });
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    window.technologyDisplay = new TechnologyDisplay();
});