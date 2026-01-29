/**
 * solution_filter.js - Логика фильтрации и сортировки решений
 */

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const filterCheckboxes = document.querySelectorAll('input[name="category"]');
    const sortSelect = document.getElementById('sortSelect');
    const solutionCards = document.querySelectorAll('.solution-card');
    const solutionsGrid = document.querySelector('.solutions-grid');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const deliverySelect = document.getElementById('deliveryTime');
    const toggleAdvancedBtn = document.getElementById('toggleAdvancedFilters');
    const advancedFilters = document.getElementById('advancedFilters');

    // Текущее состояние фильтров
    const filters = {
        category: getSelectedCategories(),
        minPrice: minPriceInput ? minPriceInput.value : '',
        maxPrice: maxPriceInput ? maxPriceInput.value : '',
        delivery: deliverySelect ? deliverySelect.value : ''
    };

    // Инициализация
    function init() {
        setupEventListeners();
        applyFilters();
        updateFilterCounter();
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Фильтры по категориям
        filterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCategoryFilter);
        });

        // Сортировка
        if (sortSelect) {
            sortSelect.addEventListener('change', handleSortChange);
        }

        // Дополнительные фильтры
        if (minPriceInput) {
            minPriceInput.addEventListener('input', debounce(handlePriceFilter, 500));
        }

        if (maxPriceInput) {
            maxPriceInput.addEventListener('input', debounce(handlePriceFilter, 500));
        }

        if (deliverySelect) {
            deliverySelect.addEventListener('change', handleDeliveryFilter);
        }

        // Переключение дополнительных фильтров
        if (toggleAdvancedBtn) {
            toggleAdvancedBtn.addEventListener('click', toggleAdvancedFilters);
        }

        // Клик вне дополнительных фильтров
        document.addEventListener('click', closeAdvancedFiltersOnClickOutside);
    }

    // Получение выбранных категорий
    function getSelectedCategories() {
        const selected = [];
        filterCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selected.push(checkbox.value);
            }
        });
        return selected;
    }

    // Обработчик фильтрации по категориям
    function handleCategoryFilter() {
        filters.category = getSelectedCategories();
        applyFilters();
        updateURL();
        updateFilterCounter();
    }

    // Обработчик сортировки
    function handleSortChange(e) {
        applySorting(e.target.value);
        updateURL();
    }

    // Обработчик фильтрации по цене
    function handlePriceFilter() {
        filters.minPrice = minPriceInput.value;
        filters.maxPrice = maxPriceInput.value;
        applyFilters();
        updateURL();
        updateFilterCounter();
    }

    // Обработчик фильтрации по срокам
    function handleDeliveryFilter(e) {
        filters.delivery = e.target.value;
        applyFilters();
        updateURL();
        updateFilterCounter();
    }

    // Применение всех фильтров
    function applyFilters() {
        let visibleCards = Array.from(solutionCards);

        // Фильтрация по категориям
        if (filters.category.length > 0) {
            visibleCards = visibleCards.filter(card => {
                const cardCategory = card.dataset.category;
                return filters.category.includes(cardCategory);
            });
        }

        // Фильтрация по цене
        if (filters.minPrice || filters.maxPrice) {
            const minPrice = parseFloat(filters.minPrice) || 0;
            const maxPrice = parseFloat(filters.maxPrice) || Infinity;

            visibleCards = visibleCards.filter(card => {
                const cardPrice = parseFloat(card.dataset.price) || 0;
                return cardPrice >= minPrice && cardPrice <= maxPrice;
            });
        }

        // Фильтрация по срокам (если в данных есть delivery_days)
        if (filters.delivery) {
            const maxDays = parseInt(filters.delivery);
            visibleCards = visibleCards.filter(card => {
                const deliveryElement = card.querySelector('.solution-delivery');
                if (deliveryElement) {
                    const text = deliveryElement.textContent;
                    const daysMatch = text.match(/(\d+)/);
                    if (daysMatch) {
                        const days = parseInt(daysMatch[1]);
                        return days <= maxDays;
                    }
                }
                return true;
            });
        }

        // Применение сортировки
        const currentSort = sortSelect ? sortSelect.value : 'popular';
        visibleCards = sortCards(visibleCards, currentSort);

        // Обновление отображения
        updateGridDisplay(visibleCards);
    }

    // Применение сортировки
    function applySorting(sortType) {
        const visibleCards = Array.from(document.querySelectorAll('.solution-card:not([style*="display: none"])'));
        const sortedCards = sortCards(visibleCards, sortType);
        updateGridDisplay(sortedCards);
    }

    // Сортировка карточек
    function sortCards(cards, sortType) {
        return cards.sort((a, b) => {
            switch (sortType) {
                case 'new':
                    return compareByNewness(a, b);
                case 'price_asc':
                    return compareByPrice(a, b, 'asc');
                case 'price_desc':
                    return compareByPrice(a, b, 'desc');
                case 'name':
                    return compareByName(a, b);
                case 'popular':
                default:
                    return compareByPopularity(a, b);
            }
        });
    }

    // Сравнение по новизне
    function compareByNewness(a, b) {
        const aIsNew = a.dataset.new === 'true';
        const bIsNew = b.dataset.new === 'true';

        if (aIsNew && !bIsNew) return -1;
        if (!aIsNew && bIsNew) return 1;
        return 0;
    }

    // Сравнение по популярности
    function compareByPopularity(a, b) {
        const aIsPopular = a.dataset.popular === 'true';
        const bIsPopular = b.dataset.popular === 'true';

        if (aIsPopular && !bIsPopular) return -1;
        if (!aIsPopular && bIsPopular) return 1;
        return compareByNewness(a, b);
    }

    // Сравнение по цене
    function compareByPrice(a, b, order = 'asc') {
        const aPrice = parseFloat(a.dataset.price) || 0;
        const bPrice = parseFloat(b.dataset.price) || 0;

        if (order === 'asc') {
            return aPrice - bPrice;
        } else {
            return bPrice - aPrice;
        }
    }

    // Сравнение по названию
    function compareByName(a, b) {
        const aName = a.querySelector('.solution-title').textContent.toLowerCase();
        const bName = b.querySelector('.solution-title').textContent.toLowerCase();

        if (aName < bName) return -1;
        if (aName > bName) return 1;
        return 0;
    }

    // Обновление отображения сетки
    function updateGridDisplay(visibleCards) {
        // Сначала скрываем все карточки
        solutionCards.forEach(card => {
            card.style.display = 'none';
            card.classList.remove('visible');
        });

        // Показываем отфильтрованные карточки с анимацией
        visibleCards.forEach((card, index) => {
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });

        // Если нет результатов, показываем состояние "пусто"
        if (visibleCards.length === 0) {
            showEmptyState();
        } else {
            hideEmptyState();
        }
    }

    // Показать состояние "пусто"
    function showEmptyState() {
        const gridContainer = solutionsGrid ? solutionsGrid.parentElement : document.querySelector('.solutions-category');
        if (gridContainer && !gridContainer.querySelector('.empty-state')) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-box-open"></i>
                <h3>Решений не найдено</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
                <button class="btn btn--outline" onclick="clearAllFilters()">Сбросить фильтры</button>
            `;
            gridContainer.appendChild(emptyState);
        }
    }

    // Скрыть состояние "пусто"
    function hideEmptyState() {
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    // Очистить все фильтры
    function clearAllFilters() {
        // Сбрасываем чекбоксы
        filterCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Сбрасываем дополнительные фильтры
        if (minPriceInput) minPriceInput.value = '';
        if (maxPriceInput) maxPriceInput.value = '';
        if (deliverySelect) deliverySelect.value = '';

        // Сбрасываем сортировку
        if (sortSelect) sortSelect.value = 'popular';

        // Обновляем состояние
        filters.category = [];
        filters.minPrice = '';
        filters.maxPrice = '';
        filters.delivery = '';

        // Применяем фильтры
        applyFilters();
        updateURL();
        updateFilterCounter();
    }

    // Обновление URL с параметрами фильтров
    function updateURL() {
        const params = new URLSearchParams();

        // Добавляем категории
        filters.category.forEach(category => {
            params.append('category', category);
        });

        // Добавляем цену
        if (filters.minPrice) {
            params.set('min_price', filters.minPrice);
        }

        if (filters.maxPrice) {
            params.set('max_price', filters.maxPrice);
        }

        // Добавляем сроки
        if (filters.delivery) {
            params.set('delivery', filters.delivery);
        }

        // Добавляем сортировку
        if (sortSelect && sortSelect.value !== 'popular') {
            params.set('sort', sortSelect.value);
        }

        // Обновляем URL без перезагрузки страницы
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }

    // Обновление счетчика фильтров
    function updateFilterCounter() {
        const counter = document.querySelector('.filter-counter');
        if (!counter) return;

        let count = filters.category.length;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.delivery) count++;

        counter.textContent = count;
        counter.style.display = count > 0 ? 'flex' : 'none';
    }

    // Переключение дополнительных фильтров
    function toggleAdvancedFilters() {
        if (advancedFilters) {
            advancedFilters.classList.toggle('active');
        }
    }

    // Закрытие дополнительных фильтров при клике вне
    function closeAdvancedFiltersOnClickOutside(event) {
        if (!advancedFilters || !toggleAdvancedBtn) return;

        const isClickInside = advancedFilters.contains(event.target) ||
            toggleAdvancedBtn.contains(event.target);

        if (!isClickInside && advancedFilters.classList.contains('active')) {
            advancedFilters.classList.remove('active');
        }
    }

    // Функция debounce для оптимизации
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Экспорт функций для глобального доступа
    window.clearAllFilters = clearAllFilters;

    // Инициализация
    init();
});