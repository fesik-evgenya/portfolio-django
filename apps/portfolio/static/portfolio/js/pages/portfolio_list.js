/**
 * ПОЛНЫЙ КОД ДЛЯ СТРАНИЦЫ ПОРТФОЛИО
 * Пагинация, модальные окна, сортировка
 */

document.addEventListener('DOMContentLoaded', function() {
    /* ========== ПАГИНАЦИЯ AJAX ========== */
    function initAjaxPagination() {
        const portfolioGrid = document.getElementById('portfolioGrid');
        const loadMoreBtn = document.querySelector('.load-more-btn');

        if (!loadMoreBtn || !portfolioGrid) return;

        let isLoading = false;
        let currentPage = parseInt(portfolioGrid.dataset.currentPage) || 1;
        const totalPages = parseInt(portfolioGrid.dataset.totalPages) || 1;

        loadMoreBtn.addEventListener('click', function() {
            if (isLoading || currentPage >= totalPages) return;

            isLoading = true;
            const nextPage = currentPage + 1;

            // Показываем loader
            const loader = document.createElement('div');
            loader.className = 'portfolio-loader';
            loader.innerHTML = '<div class="loader-spinner"></div>';
            loadMoreBtn.parentNode.insertBefore(loader, loadMoreBtn);
            loadMoreBtn.style.display = 'none';

            // Получаем текущие параметры фильтрации
            const activeFilters = getActiveFilters();
            const sortValue = document.getElementById('sortSelect')?.value;

            // Формируем URL для запроса
            const url = new URL(window.location.href);
            url.searchParams.set('page', nextPage);

            if (activeFilters.category) {
                url.searchParams.set('category', activeFilters.category);
            }
            if (activeFilters.package) {
                url.searchParams.set('package', activeFilters.package);
            }
            if (sortValue) {
                url.searchParams.set('sort', sortValue);
            }

            // AJAX запрос
            fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Ошибка загрузки');
                    return response.text();
                })
                .then(html => {
                    // Создаем временный контейнер для парсинга HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;

                    // Находим новые карточки
                    const newCards = tempDiv.querySelectorAll('.portfolio-card');

                    // Добавляем новые карточки с анимацией
                    newCards.forEach((card, index) => {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(30px)';
                        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        card.style.transitionDelay = `${index * 0.1}s`;

                        portfolioGrid.appendChild(card);

                        // Активируем анимацию
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);

                        // Инициализируем hover эффекты для новых карточек
                        initProjectHover(card);
                    });

                    // Обновляем счетчик страниц
                    currentPage = nextPage;
                    portfolioGrid.dataset.currentPage = currentPage;

                    // Проверяем, есть ли еще страницы
                    if (currentPage >= totalPages) {
                        loadMoreBtn.style.display = 'none';
                    } else {
                        loadMoreBtn.style.display = 'block';
                    }
                })
                .catch(error => {
                    console.error('Error loading more projects:', error);
                    loadMoreBtn.style.display = 'block';
                })
                .finally(() => {
                    // Убираем loader
                    if (loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                    isLoading = false;
                });
        });
    }

    /* ========== СОРТИРОВКА ========== */
    function initSorting() {
        const sortSelect = document.getElementById('sortSelect');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', function() {
            // Получаем текущие параметры фильтрации
            const activeFilters = getActiveFilters();

            // Формируем новый URL
            const url = new URL(window.location.href);
            url.searchParams.set('sort', this.value);
            url.searchParams.set('page', 1);

            // Удаляем старые параметры фильтрации
            url.searchParams.delete('category');
            url.searchParams.delete('package');

            // Добавляем активные фильтры
            if (activeFilters.category) {
                url.searchParams.set('category', activeFilters.category);
            }
            if (activeFilters.package) {
                url.searchParams.set('package', activeFilters.package);
            }

            // Перенаправляем на новую страницу
            window.location.href = url.toString();
        });
    }

    /* ========== МОДАЛЬНОЕ ОКНО ПРОЕКТА ========== */
    const modal = document.getElementById('projectModal');
    const modalBody = document.querySelector('.portfolio-modal__body');
    const closeModal = document.querySelector('.portfolio-modal__close');

    function initModal() {
        if (!modal) return;

        // Закрытие по кнопке
        if (closeModal) {
            closeModal.addEventListener('click', closeProjectModal);
        }

        // Закрытие по клику вне окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProjectModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeProjectModal();
            }
        });

        // Обработка кликов по кнопкам быстрого просмотра
        document.addEventListener('click', function(e) {
            if (e.target.closest('.quick-view')) {
                e.preventDefault();
                const projectId = e.target.closest('.quick-view').dataset.id;
                loadProjectModal(projectId);
            }
        });
    }

    function loadProjectModal(id) {
        if (!modal || !modalBody) return;

        // Показываем loader
        modalBody.innerHTML = '<div class="loader">Загрузка проекта...</div>';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Формируем URL для Django (используем URL из шаблона)
        const url = `/portfolio/ajax/project/${id}/`;

        fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка загрузки проекта');
                return response.json();
            })
            .then(result => {
                if (!result.success) {
                    throw new Error(result.error || 'Неизвестная ошибка');
                }

                const data = result.data;

                // Формируем содержимое модального окна
                modalBody.innerHTML = `
            <div class="project-modal-content">
                <div class="project-gallery">
                    ${data.images && data.images.length > 0 ?
                    data.images.map(img => `
                            <img src="${img.url}" alt="${img.alt || data.title}" loading="lazy">
                        `).join('') :
                    '<img src="/static/images/placeholder.jpg" alt="Нет изображений">'
                }
                </div>
                
                <div class="project-info">
                    <h2>${data.title || 'Название проекта'}</h2>
                    <p class="project-geo">${data.geo || 'Санкт-Петербург'}</p>
                    
                    <div class="project-details">
                        <div class="detail-item">
                            <strong>Категория:</strong>
                            <span>${data.category || 'Не указана'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Пакет:</strong>
                            <span>${data.package_display || data.package || 'Не указан'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Срок разработки:</strong>
                            <span>${data.duration || '14 дней'}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Дата создания:</strong>
                            <span>${data.created_at || 'Не указана'}</span>
                        </div>
                    </div>
                    
                    ${data.description ? `
                    <div class="project-description">
                        <h3>Описание проекта:</h3>
                        <p>${data.description}</p>
                    </div>
                    ` : ''}
                    
                    ${data.features && data.features.length > 0 ? `
                    <div class="project-features">
                        <h3>Функционал:</h3>
                        <ul>
                            ${data.features.map(feature => `
                                <li>${feature}</li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${data.technologies && data.technologies.length > 0 ? `
                    <div class="project-technologies">
                        <h3>Технологии:</h3>
                        <div class="tech-tags">
                            ${data.technologies.map(tech => `
                                <span class="tech-tag">${tech}</span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.testimonial ? `
                    <blockquote class="project-testimonial">
                        <p>"${data.testimonial}"</p>
                        <cite>${data.client || 'Клиент'}</cite>
                    </blockquote>
                    ` : ''}
                    
                    <div class="project-actions">
                        ${data.live_url ? `
                        <a href="${data.live_url}" target="_blank" rel="noopener" class="btn btn--primary">
                            Посмотреть сайт
                        </a>
                        ` : ''}
                        ${data.github_url ? `
                        <a href="${data.github_url}" target="_blank" rel="noopener" class="btn btn--secondary">
                            Исходный код
                        </a>
                        ` : ''}
                        <a href="${data.detail_url || '#'}" class="btn btn--secondary">
                            Подробнее о проекте
                        </a>
                        <button class="btn btn--outline modal-close">Закрыть</button>
                    </div>
                </div>
            </div>
        `;

                // Добавляем обработчик закрытия
                const closeBtn = modalBody.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', closeProjectModal);
                }
            })
            .catch(error => {
                console.error('Error loading project:', error);
                modalBody.innerHTML = `
            <div class="error-message">
                <p>Произошла ошибка при загрузке проекта.</p>
                <p>${error.message}</p>
                <button class="btn modal-close">Закрыть</button>
            </div>
        `;
                const closeBtn = modalBody.querySelector('.modal-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', closeProjectModal);
                }
            });
    }

    function closeProjectModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            if (modalBody) {
                modalBody.innerHTML = '';
            }
        }
    }

    /* ========== АНИМАЦИИ ПРИ ПРОКРУТКЕ ========== */
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Добавляем анимацию для карточек
        const cards = document.querySelectorAll('.portfolio-card');
        cards.forEach((card, index) => {
            card.style.setProperty('--card-index', index);
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.transitionDelay = `${index * 0.1}s`;

            observer.observe(card);
        });
    }

    /* ========== ПОЛУЧЕНИЕ АКТИВНЫХ ФИЛЬТРОВ ========== */
    function getActiveFilters() {
        const activeFilterBtn = document.querySelector('.filter-btn.active');
        if (!activeFilterBtn) return {};

        const filterType = activeFilterBtn.dataset.type;
        const filterValue = activeFilterBtn.dataset.filter;

        if (filterValue === 'all') return {};

        return {
            [filterType]: filterValue
        };
    }

    /* ========== ИНИЦИАЛИЗАЦИЯ ВСЕХ ФУНКЦИЙ ========== */
    function initPortfolioPage() {
        initAjaxPagination();
        initSorting();
        initModal();
        initScrollAnimations();

        // Инициализируем hover эффекты для всех карточек
        document.querySelectorAll('.portfolio-card').forEach(card => {
            initProjectHover(card);
        });
    }

    // Запускаем инициализацию
    initPortfolioPage();
});