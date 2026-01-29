/**
 * solution_list.js - Основная логика страницы списка решений
 * Инициализация компонентов и управление состоянием
 */

document.addEventListener('DOMContentLoaded', function() {
    // Состояние приложения
    const appState = {
        cart: JSON.parse(localStorage.getItem('solution_cart')) || [],
        comparison: JSON.parse(localStorage.getItem('solution_comparison')) || [],
        filters: getFiltersFromURL(),
        sort: getSortFromURL()
    };

    // Инициализация
    function init() {
        updateCartBadge();
        updateComparisonBadge();
        setupCartButtons();
        setupComparisonCheckboxes();
        setupModalClose();
        applyInitialFilters();
        setupQuickFilters();
    }

    // Получение фильтров из URL
    function getFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.getAll('category') || [],
            min_price: params.get('min_price') || '',
            max_price: params.get('max_price') || '',
            delivery: params.get('delivery') || ''
        };
    }

    // Получение сортировки из URL
    function getSortFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('sort') || 'popular';
    }

    // Обновление бейджа корзины
    function updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = appState.cart.length;
            badge.style.display = appState.cart.length > 0 ? 'flex' : 'none';
        }
    }

    // Обновление бейджа сравнения
    function updateComparisonBadge() {
        const badge = document.querySelector('.comparison-badge');
        if (badge) {
            badge.textContent = appState.comparison.length;
            badge.style.display = appState.comparison.length > 0 ? 'flex' : 'none';

            const compareBtn = document.querySelector('.compare-btn');
            if (compareBtn) {
                compareBtn.disabled = appState.comparison.length < 2;
            }
        }
    }

    // Настройка кнопок корзины
    function setupCartButtons() {
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            const solutionId = btn.dataset.id;

            // Проверяем, есть ли уже в корзине
            if (appState.cart.includes(solutionId)) {
                btn.classList.add('added');
            }

            btn.addEventListener('click', function() {
                toggleCart(solutionId, this);
            });
        });
    }

    // Добавление/удаление из корзины
    function toggleCart(solutionId, button) {
        const index = appState.cart.indexOf(solutionId);

        if (index === -1) {
            // Добавляем
            appState.cart.push(solutionId);
            button.classList.add('added');

            // Показываем уведомление
            showNotification('Решение добавлено в корзину', 'success');
        } else {
            // Удаляем
            appState.cart.splice(index, 1);
            button.classList.remove('added');

            // Показываем уведомление
            showNotification('Решение удалено из корзины', 'info');
        }

        // Сохраняем в localStorage
        localStorage.setItem('solution_cart', JSON.stringify(appState.cart));
        updateCartBadge();
    }

    // Настройка чекбоксов сравнения
    function setupComparisonCheckboxes() {
        document.querySelectorAll('.compare-item').forEach(checkbox => {
            const solutionId = checkbox.dataset.id;

            // Проверяем, отмечено ли уже для сравнения
            if (appState.comparison.includes(solutionId)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', function() {
                toggleComparison(solutionId, this.checked);
            });
        });
    }

    // Добавление/удаление из сравнения
    function toggleComparison(solutionId, isChecked) {
        if (isChecked) {
            // Добавляем, если еще нет
            if (!appState.comparison.includes(solutionId)) {
                appState.comparison.push(solutionId);
            }
        } else {
            // Удаляем
            const index = appState.comparison.indexOf(solutionId);
            if (index !== -1) {
                appState.comparison.splice(index, 1);
            }
        }

        // Сохраняем в localStorage
        localStorage.setItem('solution_comparison', JSON.stringify(appState.comparison));
        updateComparisonBadge();

        // Если выбрано 2 или больше, показываем кнопку сравнения
        const compareBtn = document.querySelector('.compare-btn');
        if (compareBtn) {
            compareBtn.disabled = appState.comparison.length < 2;
        }
    }

    // Показать модальное окно сравнения
    function showComparisonModal() {
        if (appState.comparison.length < 2) {
            showNotification('Выберите хотя бы 2 решения для сравнения', 'warning');
            return;
        }

        const modal = document.getElementById('comparisonModal');
        const content = document.getElementById('comparisonContent');

        // Загружаем данные для сравнения
        loadComparisonData().then(data => {
            content.innerHTML = generateComparisonTable(data);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Загрузка данных для сравнения
    function loadComparisonData() {
        return new Promise((resolve) => {
            // Здесь будет запрос к серверу для получения данных выбранных решений
            // Пока используем данные из DOM
            const solutions = [];

            appState.comparison.forEach(id => {
                const card = document.querySelector(`.solution-card[data-id="${id}"]`);
                if (card) {
                    solutions.push({
                        id: id,
                        name: card.querySelector('.solution-title').textContent,
                        price: card.dataset.price,
                        description: card.querySelector('.solution-description').textContent,
                        category: card.dataset.category,
                        popular: card.dataset.popular === 'true',
                        is_new: card.dataset.new === 'true'
                    });
                }
            });

            resolve(solutions);
        });
    }

    // Генерация таблицы сравнения
    function generateComparisonTable(solutions) {
        if (solutions.length === 0) return '<p>Нет данных для сравнения</p>';

        let html = '<table class="comparison-table">';
        html += '<thead><tr><th>Характеристика</th>';

        solutions.forEach(solution => {
            html += `<th>${solution.name}</th>`;
        });

        html += '</tr></thead><tbody>';

        // Цена
        html += '<tr><td>Цена</td>';
        solutions.forEach(solution => {
            html += `<td>${solution.price} ₽</td>`;
        });
        html += '</tr>';

        // Категория
        html += '<tr><td>Категория</td>';
        solutions.forEach(solution => {
            const categoryText = solution.category === 'package' ? 'Пакет' : 'Модуль';
            html += `<td>${categoryText}</td>`;
        });
        html += '</tr>';

        // Популярность
        html += '<tr><td>Популярность</td>';
        solutions.forEach(solution => {
            html += `<td>${solution.popular ? '★ Популярное' : ''}</td>`;
        });
        html += '</tr>';

        // Новизна
        html += '<tr><td>Новинка</td>';
        solutions.forEach(solution => {
            html += `<td>${solution.is_new ? '🆕 Новинка' : ''}</td>`;
        });
        html += '</tr>';

        html += '</tbody></table>';
        return html;
    }

    // Закрыть модальное окно
    function closeComparisonModal() {
        const modal = document.getElementById('comparisonModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Очистить сравнение
    function clearComparison() {
        appState.comparison = [];
        localStorage.removeItem('solution_comparison');

        // Снимаем чекбоксы
        document.querySelectorAll('.compare-item').forEach(checkbox => {
            checkbox.checked = false;
        });

        updateComparisonBadge();
        closeComparisonModal();
        showNotification('Сравнение очищено', 'info');
    }

    // Отправить сравнение на почту
    function sendComparison() {
        const email = prompt('Введите email для отправки сравнения:');
        if (email && validateEmail(email)) {
            // Здесь будет отправка на сервер
            showNotification('Сравнение отправлено на ' + email, 'success');
            closeComparisonModal();
        } else if (email) {
            showNotification('Введите корректный email', 'error');
        }
    }

    // Настройка быстрых фильтров
    function setupQuickFilters() {
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.addEventListener('click', function() {
                const filterValue = this.dataset.filter;

                // Обновляем активный фильтр
                document.querySelectorAll('.quick-filter').forEach(f => {
                    f.classList.remove('active');
                });
                this.classList.add('active');

                // Применяем фильтр
                applyQuickFilter(filterValue);
            });
        });
    }

    // Применение быстрого фильтра
    function applyQuickFilter(filter) {
        const params = new URLSearchParams(window.location.search);

        switch(filter) {
            case 'all':
                params.delete('category');
                break;
            case 'package':
                params.set('category', 'package');
                break;
            case 'module':
                params.set('category', 'module');
                break;
            case 'popular':
                params.set('sort', 'popular');
                break;
            case 'new':
                params.set('sort', 'new');
                break;
        }

        window.location.search = params.toString();
    }

    // Применение начальных фильтров
    function applyInitialFilters() {
        // Обновляем активные чекбоксы
        appState.filters.category.forEach(category => {
            const checkbox = document.querySelector(`input[name="category"][value="${category}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Обновляем селект сортировки
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect && appState.sort) {
            sortSelect.value = appState.sort;
        }

        // Обновляем быстрые фильтры
        updateQuickFilters();
    }

    // Обновление быстрых фильтров
    function updateQuickFilters() {
        document.querySelectorAll('.quick-filter').forEach(filter => {
            filter.classList.remove('active');
        });

        // Если выбраны все категории или ничего - активируем "Все"
        if (appState.filters.category.length === 0 ||
            (appState.filters.category.includes('package') && appState.filters.category.includes('module'))) {
            const allFilter = document.querySelector('.quick-filter[data-filter="all"]');
            if (allFilter) allFilter.classList.add('active');
        } else if (appState.filters.category.includes('package')) {
            const packageFilter = document.querySelector('.quick-filter[data-filter="package"]');
            if (packageFilter) packageFilter.classList.add('active');
        } else if (appState.filters.category.includes('module')) {
            const moduleFilter = document.querySelector('.quick-filter[data-filter="module"]');
            if (moduleFilter) moduleFilter.classList.add('active');
        }

        // Сортировка
        if (appState.sort === 'popular') {
            const popularFilter = document.querySelector('.quick-filter[data-filter="popular"]');
            if (popularFilter) popularFilter.classList.add('active');
        } else if (appState.sort === 'new') {
            const newFilter = document.querySelector('.quick-filter[data-filter="new"]');
            if (newFilter) newFilter.classList.add('active');
        }
    }

    // Настройка закрытия модальных окон
    function setupModalClose() {
        // Клик вне модального окна
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('comparisonModal');
            if (event.target === modal) {
                closeComparisonModal();
            }
        });

        // Клавиша ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeComparisonModal();
            }
        });
    }

    // Показать уведомление
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <span class="notification-text">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 10);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Валидация email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Экспорт функций для глобального доступа
    window.showComparisonModal = showComparisonModal;
    window.closeComparisonModal = closeComparisonModal;
    window.clearComparison = clearComparison;
    window.sendComparison = sendComparison;

    // Инициализация
    init();
});

// Стили для уведомлений
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    background: var(--dark-bg);
    border: 1px solid var(--border-color);
    color: var(--white);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-width: 300px;
    max-width: 400px;
    transform: translateX(150%);
    transition: transform 0.3s ease;
    z-index: 10000;
    backdrop-filter: blur(10px);
}

.notification.show {
    transform: translateX(0);
}

.notification--success {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.1);
}

.notification--error {
    border-color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}

.notification--warning {
    border-color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
}

.notification--info {
    border-color: var(--accent-purple);
    background: rgba(138, 43, 226, 0.1);
}

.notification-text {
    flex: 1;
}

.notification-close {
    background: none;
    border: none;
    color: var(--light-gray);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    transition: color 0.3s ease;
}

.notification-close:hover {
    color: var(--white);
}
`;

// Добавляем стили уведомлений
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);