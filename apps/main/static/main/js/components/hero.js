/**
 * HERO COMPONENT LOGIC
 * Специфичная логика для hero-секции
 */

document.addEventListener('DOMContentLoaded', function() {
    // Анимация появления элементов hero
    const heroContent = document.querySelector('.hero__content');
    if (heroContent) {
        // Добавляем класс для анимации
        setTimeout(() => {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Плавный скролл для кнопок в hero
    const heroButtons = document.querySelectorAll('.hero__buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Если это якорная ссылка
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Параллакс эффект для hero (если есть фон)
    const heroSection = document.querySelector('.hero');
    if (heroSection && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroSection.style.transform = `translate3d(0, ${rate}px, 0)`;
        });
    }

    // Интерактив для USP items
    const uspItems = document.querySelectorAll('.usp-item');
    uspItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            const icon = this.querySelector('.usp-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
            }
        });

        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            const icon = this.querySelector('.usp-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });
});