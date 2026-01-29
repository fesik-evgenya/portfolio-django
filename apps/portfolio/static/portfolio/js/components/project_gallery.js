/**
 * ГАЛЕРЕЯ ПРОЕКТА С ПАГИНАЦИЕЙ
 */

class ProjectGalleryManager {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.thumbnails = [];
        this.totalSlides = 0;
        this.init();
    }

    init() {
        const gallery = document.querySelector('.project-gallery');
        if (!gallery) return;

        if (gallery.hasAttribute('data-gallery-initialized')) {
            return;
        }

        this.slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
        this.thumbnails = Array.from(gallery.querySelectorAll('.thumbnail'));
        this.totalSlides = this.slides.length;

        // Если нет множества изображений, скрываем навигацию
        if (this.totalSlides <= 1) {
            const galleryNav = gallery.querySelector('.gallery-navigation');
            if (galleryNav) {
                galleryNav.style.display = 'none';
            }
            return;
        }

        const prevBtn = gallery.querySelector('.gallery-prev');
        const nextBtn = gallery.querySelector('.gallery-next');
        const currentSlideSpan = gallery.querySelector('.current-slide');

        // Инициализация первого слайда
        this.showSlide(0);

        // Обработчики для миниатюр
        this.thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.showSlide(index));
        });

        // Кнопки навигации
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Клавиатурная навигация
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));

        gallery.setAttribute('data-gallery-initialized', 'true');
    }

    showSlide(index) {
        if (index >= this.totalSlides) index = 0;
        if (index < 0) index = this.totalSlides - 1;

        // Скрываем все слайды
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.thumbnails.forEach(thumb => thumb.classList.remove('active'));

        // Показываем выбранный слайд
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        if (this.thumbnails[index]) {
            this.thumbnails[index].classList.add('active');
        }

        // Обновляем счетчик
        const currentSlideSpan = document.querySelector('.current-slide');
        if (currentSlideSpan) {
            currentSlideSpan.textContent = index + 1;
        }

        this.currentSlide = index;
    }

    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    nextSlide() {
        this.showSlide(this.currentSlide + 1);
    }

    handleKeyNavigation(e) {
        if (e.key === 'ArrowLeft') {
            this.prevSlide();
        } else if (e.key === 'ArrowRight') {
            this.nextSlide();
        }
    }

    // Автопрокрутка (опционально)
    startAutoSlide(interval = 5000) {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
        }

        this.autoSlideInterval = setInterval(() => {
            this.nextSlide();
        }, interval);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    window.projectGalleryManager = new ProjectGalleryManager();

    // Опционально: запустить автопрокрутку
    // window.projectGalleryManager.startAutoSlide(5000);
});