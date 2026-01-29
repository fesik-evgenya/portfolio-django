/**
 * search_handler.js - Логика поиска решений (живой поиск)
 */

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');
    const liveSearchResults = document.getElementById('liveSearchResults');
    const searchForm = document.getElementById('searchForm');

    let searchTimeout;
    let currentSearchTerm = '';

    // Инициализация
    function init() {
        if (!searchInput) return;

        setupEventListeners();
        updateClearButton();
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Ввод в поле поиска
        searchInput.addEventListener('input', handleSearchInput);

        // Очистка поиска
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
        }

        // Отправка формы
        if (searchForm) {
            searchForm.addEventListener('submit', handleFormSubmit);
        }

        // Клик вне результатов поиска
        document.addEventListener('click', closeSearchResultsOnClickOutside);

        // Клавиши навигации в результатах поиска
        searchInput.addEventListener('keydown', handleSearchNavigation);
    }

    // Обработчик ввода в поле поиска
    function handleSearchInput() {
        const searchTerm = searchInput.value.trim();
        currentSearchTerm = searchTerm;

        updateClearButton();

        if (searchTerm.length < 2) {
            hideLiveResults();
            return;
        }

        // Дебаунс для оптимизации
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performLiveSearch(searchTerm);
        }, 300);
    }

    // Выполнение живого поиска
    function performLiveSearch(searchTerm) {
        // Здесь будет AJAX запрос к серверу
        // Пока используем симуляцию с данными из DOM

        const results = searchInSolutions(searchTerm);
        displayLiveResults(results, searchTerm);
    }

    // Поиск в решениях (заглушка)
    function searchInSolutions(searchTerm) {
        const solutions = [];
        const cards = document.querySelectorAll('.solution-card');

        cards.forEach(card => {
            const title = card.querySelector('.solution-title').textContent.toLowerCase();
            const description = card.querySelector('.solution-description').textContent.toLowerCase();
            const searchTermLower = searchTerm.toLowerCase();

            if (title.includes(searchTermLower) || description.includes(searchTermLower)) {
                solutions.push({
                    id: card.dataset.id,
                    title: card.querySelector('.solution-title').textContent,
                    description: card.querySelector('.solution-description').textContent,
                    price: card.dataset.price,
                    image: card.querySelector('.solution-image').src,
                    url: card.querySelector('.btn--outline').href
                });
            }
        });

        return solutions;
    }

    // Отображение результатов живого поиска
    function displayLiveResults(results, searchTerm) {
        if (!liveSearchResults) return;

        if (results.length === 0) {
            liveSearchResults.innerHTML = `
                <div class="search-result-empty">
                    <i class="fas fa-search"></i>
                    <p>По запросу "${searchTerm}" ничего не найдено</p>
                </div>
            `;
        } else {
            let html = '';
            results.forEach(result => {
                html += `
                <a href="${result.url}" class="search-result-item">
                    <img src="${result.image}" alt="${result.title}" class="search-result-image">
                    <div class="search-result-content">
                        <div class="search-result-title">${result.title}</div>
                        <div class="search-result-price">${result.price} ₽</div>
                    </div>
                </a>
                `;
            });

            // Добавляем ссылку на все результаты
            html += `
            <div class="search-result-all">
                <a href="?q=${encodeURIComponent(searchTerm)}" class="btn btn--outline btn--block">
                    Показать все результаты (${results.length})
                </a>
            </div>
            `;

            liveSearchResults.innerHTML = html;
        }

        liveSearchResults.classList.add('active');
    }

    // Скрыть результаты живого поиска
    function hideLiveResults() {
        if (liveSearchResults) {
            liveSearchResults.classList.remove('active');
        }
    }

    // Обновление кнопки очистки
    function updateClearButton() {
        if (!clearSearchBtn) return;

        if (searchInput.value.trim().length > 0) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }

    // Очистка поиска
    function clearSearch() {
        searchInput.value = '';
        currentSearchTerm = '';
        updateClearButton();
        hideLiveResults();
        searchInput.focus();
    }

    // Обработчик отправки формы
    function handleFormSubmit(e) {
        const searchTerm = searchInput.value.trim();

        if (searchTerm.length < 2) {
            e.preventDefault();
            searchInput.focus();
            showSearchError('Введите хотя бы 2 символа для поиска');
            return;
        }

        // Добавляем параметр поиска в форму
        if (!searchForm.querySelector('input[name="q"]')) {
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'q';
            hiddenInput.value = searchTerm;
            searchForm.appendChild(hiddenInput);
        }
    }

    // Навигация по результатам поиска с клавиатуры
    function handleSearchNavigation(e) {
        if (!liveSearchResults || !liveSearchResults.classList.contains('active')) {
            return;
        }

        const results = liveSearchResults.querySelectorAll('.search-result-item');
        const currentFocus = document.activeElement;
        let currentIndex = -1;

        // Находим текущий индекс
        results.forEach((result, index) => {
            if (result === currentFocus) {
                currentIndex = index;
            }
        });

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < results.length - 1) {
                    results[currentIndex + 1].focus();
                } else {
                    results[0].focus();
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    results[currentIndex - 1].focus();
                } else {
                    results[results.length - 1].focus();
                }
                break;

            case 'Escape':
                hideLiveResults();
                searchInput.focus();
                break;

            case 'Enter':
                if (currentFocus.classList.contains('search-result-item')) {
                    e.preventDefault();
                    currentFocus.click();
                }
                break;
        }
    }

    // Закрытие результатов при клике вне
    function closeSearchResultsOnClickOutside(e) {
        if (!liveSearchResults) return;

        const isClickInside = searchInput.contains(e.target) ||
            liveSearchResults.contains(e.target) ||
            (clearSearchBtn && clearSearchBtn.contains(e.target));

        if (!isClickInside && liveSearchResults.classList.contains('active')) {
            hideLiveResults();
        }
    }

    // Показать ошибку поиска
    function showSearchError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'search-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: rgba(255, 107, 107, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(255, 107, 107, 0.3);
        `;

        const existingError = searchInput.parentElement.querySelector('.search-error');
        if (existingError) {
            existingError.remove();
        }

        searchInput.parentElement.appendChild(errorDiv);

        // Удаляем ошибку через 3 секунды
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 3000);
    }

    // Экспорт функций для глобального доступа
    window.clearSearch = clearSearch;

    // Инициализация
    init();
});

// Стили для результатов поиска
const searchResultsStyles = `
.search-result-all {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
}

.btn--block {
    width: 100%;
    text-align: center;
}

.search-error {
    animation: shake 0.5s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;

// Добавляем стили для поиска
const searchStyleSheet = document.createElement('style');
searchStyleSheet.textContent = searchResultsStyles;
document.head.appendChild(searchStyleSheet);