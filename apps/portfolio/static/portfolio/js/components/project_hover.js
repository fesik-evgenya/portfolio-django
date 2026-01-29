/**
 * КОМПОНЕНТ HOVER ЭФФЕКТОВ ДЛЯ КАРТОЧЕК ПРОЕКТОВ
 */

// Инициализация hover эффектов для конкретной карточки
function initProjectHover(card) {
    if (!card) return;

    // Плавное появление при hover
    card.addEventListener('mouseenter', function(e) {
        this.style.zIndex = '10';

        // Анимация тени
        this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';

        // Анимация трансформации
        this.style.transform = 'translateY(-10px) scale(1.02)';

        // Подсветка границы
        this.style.borderColor = 'var(--accent-purple)';
    });

    card.addEventListener('mouseleave', function(e) {
        this.style.zIndex = '';

        // Возвращаем исходные стили
        this.style.boxShadow = '';
        this.style.transform = '';
        this.style.borderColor = '';

        // Плавный возврат
        setTimeout(() => {
            this.style.borderColor = 'var(--border-color)';
        }, 300);
    });

    // Параллакс эффект для изображения
    const image = card.querySelector('.portfolio-card__image');
    if (image) {
        const img = image.querySelector('img');

        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const moveX = (x - centerX) / 20;
            const moveY = (y - centerY) / 20;

            if (img) {
                img.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
            }
        });

        card.addEventListener('mouseleave', function(e) {
            if (img) {
                img.style.transform = 'scale(1.05) translate(0, 0)';
                setTimeout(() => {
                    img.style.transform = '';
                }, 300);
            }
        });
    }

    // Клик по всей карточке (кроме кнопок)
    card.addEventListener('click', function(e) {
        // Проверяем, не был ли клик по ссылке или кнопке
        if (e.target.tagName === 'A' ||
            e.target.tagName === 'BUTTON' ||
            e.target.closest('a') ||
            e.target.closest('button')) {
            return;
        }

        // Находим ссылку на детальную страницу
        const detailLink = this.querySelector('a[href*="portfolio"]');
        if (detailLink && detailLink.href) {
            window.location.href = detailLink.href;
        }
    });

    // Touch события для мобильных устройств
    let touchStartX = 0;
    let touchStartY = 0;

    card.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Добавляем активный класс для тач-устройств
        this.classList.add('touch-active');
    }, { passive: true });

    card.addEventListener('touchend', function(e) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        // Проверяем, был ли это тап (а не свайп)
        const diffX = Math.abs(touchEndX - touchStartX);
        const diffY = Math.abs(touchEndY - touchStartY);

        if (diffX < 10 && diffY < 10) {
            // Эмулируем hover эффект
            this.classList.toggle('touch-active');

            // Если есть ссылка на детальную страницу - переходим
            const detailLink = this.querySelector('a[href*="portfolio"]');
            if (detailLink && detailLink.href) {
                window.location.href = detailLink.href;
            }
        }

        // Убираем активный класс через некоторое время
        setTimeout(() => {
            this.classList.remove('touch-active');
        }, 300);
    }, { passive: true });

    // Добавляем обработчики для всех внутренних ссылок
    const links = card.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Останавливаем всплытие, чтобы не сработал клик по карточке
            e.stopPropagation();
        });
    });
}

// Инициализация всех карточек на странице
function initAllProjectHovers() {
    document.querySelectorAll('.portfolio-card').forEach(card => {
        initProjectHover(card);
    });
}

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', initAllProjectHovers);

// Экспорт функции для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initProjectHover, initAllProjectHovers };
}