/**
 * JavaScript для детальной страницы решения
 */

class SolutionGalleryManager {
    constructor() {
        this.currentPage = 1;
        this.imagesPerPage = 10;
        this.totalImages = 0;
        this.solutionId = 0;
        this.currentImages = [];

        this.init();
    }

    init() {
        this.solutionId = typeof SOLUTION_CONFIG !== 'undefined' ? SOLUTION_CONFIG.id : 0;
        this.totalImages = typeof SOLUTION_CONFIG !== 'undefined' ? SOLUTION_CONFIG.totalImages : 0;
        this.imagesPerPage = typeof SOLUTION_CONFIG !== 'undefined' ? SOLUTION_CONFIG.imagesPerPage : 10;

        this.setupPagination();
        this.setupEventListeners();
        this.setupGlobalImageErrorHandling();

        console.log('Solution gallery manager initialized', {
            solutionId: this.solutionId,
            totalImages: this.totalImages,
            imagesPerPage: this.imagesPerPage
        });
    }

    setupGlobalImageErrorHandling() {
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('.solution-gallery img');
            images.forEach(img => {
                img.addEventListener('error', (e) => {
                    console.warn('Image load error:', e.target.src);
                    this.handleImageError(e.target);
                });
            });
        });
    }

    handleImageError(imgElement) {
        const placeholder = '/static/images/placeholder.jpg';

        this.preloadImage(placeholder).then(exists => {
            if (exists) {
                imgElement.src = placeholder;
                imgElement.alt = 'Изображение не найдено';
                imgElement.classList.add('placeholder-image');
            } else {
                imgElement.style.display = 'none';
                console.error('Placeholder image also not found');
            }
        });
    }

    preloadImage(src) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = src;
        });
    }

    setupPagination() {
        const totalPages = Math.ceil(this.totalImages / this.imagesPerPage);

        if (this.totalImages <= this.imagesPerPage) {
            const pagination = document.querySelector('.images-pagination');
            if (pagination) {
                pagination.style.display = 'none';
            }
            return;
        }

        this.updatePaginationInfo();
    }

    setupEventListeners() {
        const prevBtn = document.getElementById('paginationPrev');
        const nextBtn = document.getElementById('paginationNext');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.loadPage(this.currentPage - 1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.loadPage(this.currentPage + 1));
        }

        this.setupGalleryNavigation();
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    setupGalleryNavigation() {
        const prevBtn = document.querySelector('.gallery-prev');
        const nextBtn = document.querySelector('.gallery-next');
        const thumbnails = document.querySelectorAll('.thumbnail');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateGallery(-1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateGallery(1));
        }

        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', () => this.showGallerySlide(index));
        });
    }

    async loadPage(page = 1) {
        if (page < 1 || page > Math.ceil(this.totalImages / this.imagesPerPage)) {
            return;
        }

        this.currentPage = page;

        try {
            this.showLoading();

            const response = await fetch(`/api/solutions/${this.solutionId}/images/?page=${page}&per_page=${this.imagesPerPage}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.images && data.images.length > 0) {
                this.currentPage = data.page;
                this.totalImages = data.total;
                this.currentImages = data.images;

                this.renderImages(data.images);
                this.updatePaginationInfo();
                this.hideLoading();
                this.setupGalleryNavigation();
            } else {
                this.showNoImages();
            }
        } catch (error) {
            console.error('Ошибка загрузки изображений:', error);
            this.showError('Не удалось загрузить изображения');
        }
    }

    renderImages(images) {
        const galleryMain = document.querySelector('.gallery-main');
        const galleryThumbnails = document.querySelector('.gallery-thumbnails');

        if (!galleryMain || !galleryThumbnails) return;

        galleryMain.innerHTML = '';
        galleryThumbnails.innerHTML = '';

        images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `gallery-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img src="${image.url}"
                     alt="${image.alt || 'Решение - изображение ' + ((this.currentPage - 1) * this.imagesPerPage + index + 1)}"
                     loading="lazy"
                     onerror="window.solutionGalleryManager.handleImageError(this)">
            `;
            galleryMain.appendChild(slide);
        });

        if (images.length > 1) {
            images.forEach((image, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                thumbnail.setAttribute('data-index', index);
                thumbnail.innerHTML = `
                    <img src="${image.thumbnail_url || image.url}"
                         alt="Thumbnail ${index + 1}"
                         onerror="window.solutionGalleryManager.handleImageError(this)">
                `;
                galleryThumbnails.appendChild(thumbnail);
            });
        }

        this.updateSlideCounter();
    }

    updatePaginationInfo() {
        const totalPages = Math.ceil(this.totalImages / this.imagesPerPage);
        const startImage = (this.currentPage - 1) * this.imagesPerPage + 1;
        const endImage = Math.min(this.currentPage * this.imagesPerPage, this.totalImages);

        const paginationInfo = document.getElementById('paginationInfo');
        const prevBtn = document.getElementById('paginationPrev');
        const nextBtn = document.getElementById('paginationNext');

        if (paginationInfo) {
            paginationInfo.textContent = `Изображения ${startImage}-${endImage} из ${this.totalImages}`;
        }

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    updateSlideCounter() {
        const currentSlide = document.querySelector('.current-slide');
        const totalSlides = document.querySelector('.total-slides');

        if (currentSlide) {
            currentSlide.textContent = '1';
        }
        if (totalSlides) {
            totalSlides.textContent = this.currentImages.length;
        }
    }

    navigateGallery(direction) {
        const slides = document.querySelectorAll('.gallery-slide');
        const thumbnails = document.querySelectorAll('.thumbnail');

        if (slides.length <= 1) return;

        let currentIndex = 0;
        slides.forEach((slide, index) => {
            if (slide.classList.contains('active')) {
                currentIndex = index;
            }
        });

        let newIndex = currentIndex + direction;
        if (newIndex >= slides.length) newIndex = 0;
        if (newIndex < 0) newIndex = slides.length - 1;

        this.showGallerySlide(newIndex);
    }

    showGallerySlide(index) {
        const slides = document.querySelectorAll('.gallery-slide');
        const thumbnails = document.querySelectorAll('.thumbnail');
        const currentSlide = document.querySelector('.current-slide');

        if (slides.length === 0 || thumbnails.length === 0) return;

        slides.forEach(slide => slide.classList.remove('active'));
        thumbnails.forEach(thumb => thumb.classList.remove('active'));

        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (thumbnails[index]) {
            thumbnails[index].classList.add('active');
        }

        if (currentSlide) {
            currentSlide.textContent = index + 1;
        }
    }

    handleKeyboardNavigation(e) {
        if (e.key === 'ArrowLeft') {
            this.navigateGallery(-1);
        } else if (e.key === 'ArrowRight') {
            this.navigateGallery(1);
        }
    }

    showLoading() {
        const galleryMain = document.querySelector('.gallery-main');
        if (!galleryMain) return;

        galleryMain.innerHTML = `
            <div class="gallery-loading">
                <div class="loading-spinner"></div>
                <p>Загрузка изображений...</p>
            </div>
        `;
    }

    hideLoading() {
        const loadingElement = document.querySelector('.gallery-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showNoImages() {
        const galleryMain = document.querySelector('.gallery-main');
        if (!galleryMain) return;

        galleryMain.innerHTML = `
            <div class="no-images">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
                <p>Изображения не найдены</p>
            </div>
        `;

        const galleryNav = document.querySelector('.gallery-navigation');
        if (galleryNav) {
            galleryNav.style.display = 'none';
        }
    }

    showError(message) {
        const galleryMain = document.querySelector('.gallery-main');
        if (!galleryMain) return;

        galleryMain.innerHTML = `
            <div class="gallery-error">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>${message}</p>
                <button class="btn btn--outline retry-btn">Попробовать снова</button>
            </div>
        `;

        const retryBtn = galleryMain.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.loadPage(this.currentPage));
        }
    }
}

// Оптимизация для мобильных
function optimizeForMobile() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (!img.src || img.src === window.location.href) {
                        const dataSrc = img.getAttribute('data-src');
                        if (dataSrc) {
                            img.src = dataSrc;
                        }
                    }
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            if (!img.hasAttribute('data-src') && img.src) {
                img.setAttribute('data-src', img.src);
            }
            imageObserver.observe(img);
        });
    }

    // Swipe для мобильных
    let startX = 0;
    const galleryMain = document.querySelector('.gallery-main');

    if (galleryMain) {
        galleryMain.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        galleryMain.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 50) {
                if (diffX > 0 && window.solutionGalleryManager) {
                    window.solutionGalleryManager.navigateGallery(1);
                } else if (window.solutionGalleryManager) {
                    window.solutionGalleryManager.navigateGallery(-1);
                }
            }
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    window.solutionGalleryManager = new SolutionGalleryManager();
    optimizeForMobile();

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    console.log('Solution detail page initialized');
});

window.SolutionGalleryManager = SolutionGalleryManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (!window.solutionGalleryManager) {
            window.solutionGalleryManager = new SolutionGalleryManager();
        }
    });
} else {
    if (!window.solutionGalleryManager) {
        window.solutionGalleryManager = new SolutionGalleryManager();
    }
}
