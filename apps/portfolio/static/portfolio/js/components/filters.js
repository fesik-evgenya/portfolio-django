/**
 * КОМПОНЕНТ ФИЛЬТРОВ ПОРТФОЛИО
 * Серверная фильтрация через Django
 */

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const applyBtn = document.querySelector('.apply-filters');
    const filterForm = document.querySelector('.filters-form');

    if (!filterButtons.length || !filterForm) return;

    // Парсим текущие параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    const currentPackage = urlParams.get('package');
    const currentSort = urlParams.get('sort');

    // Устанавливаем активные фильтры при загрузке
    function setActiveFiltersFromURL() {
        filterButtons.forEach(btn => {
            const filterType = btn.dataset.type;
            const filterValue = btn.dataset.filter;

            btn.classList.remove('active');

            if (filterValue === 'all' && !currentCategory && !currentPackage) {
                btn.classList.add('active');
            } else if (filterType === 'category' && filterValue === currentCategory) {
                btn.classList.add('active');
            } else if (filterType === 'package' && filterValue === currentPackage) {
                btn.classList.add('active');
            }
        });

        // Устанавливаем сортировку
        if (currentSort && document.getElementById('sortSelect')) {
            document.getElementById('sortSelect').value = currentSort;
        }
    }

    // Инициализация фильтров
    function initFilters() {
        setActiveFiltersFromURL();

        filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();

                const filterType = this.dataset.type;
                const filterValue = this.dataset.filter;

                // Обновляем активный класс
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Обновляем скрытые поля формы
                if (filterValue === 'all') {
                    // Удаляем все фильтры
                    filterForm.querySelector('input[name="category"]')?.remove();
                    filterForm.querySelector('input[name="package"]')?.remove();
                } else {
                    // Удаляем все существующие фильтры
                    filterForm.querySelectorAll('input[name="category"], input[name="package"]')
                        .forEach(input => input.remove());

                    // Добавляем новый фильтр
                    const hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.name = filterType;
                    hiddenInput.value = filterValue;
                    filterForm.appendChild(hiddenInput);
                }

                // Сбрасываем пагинацию на первую страницу
                filterForm.querySelector('input[name="page"]').value = 1;

                // Показываем кнопку применения
                if (applyBtn) {
                    applyBtn.style.display = 'inline-block';
                }
            });
        });

        // Обработка отправки формы
        if (filterForm) {
            filterForm.addEventListener('submit', function(e) {
                // Убираем пустые параметры
                const formData = new FormData(this);
                const params = new URLSearchParams();

                for (let [key, value] of formData.entries()) {
                    if (value) {
                        params.append(key, value);
                    }
                }

                // Формируем новый URL
                const newUrl = `${window.location.pathname}?${params.toString()}`;
                window.location.href = newUrl;

                e.preventDefault();
            });
        }

        // Кнопка сброса фильтров
        const resetBtn = document.querySelector('.reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                e.preventDefault();

                // Сбрасываем активные фильтры
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.filter === 'all') {
                        btn.classList.add('active');
                    }
                });

                // Очищаем скрытые поля
                filterForm.querySelectorAll('input[name="category"], input[name="package"]')
                    .forEach(input => input.remove());

                // Редирект на страницу без фильтров
                window.location.href = window.location.pathname;
            });
        }
    }

    // Инициализация активных фильтров (тегов)
    function initActiveFilters() {
        const activeFiltersContainer = document.createElement('div');
        activeFiltersContainer.className = 'active-filters';
        filterForm.appendChild(activeFiltersContainer);

        function updateActiveFilters() {
            activeFiltersContainer.innerHTML = '';

            // Добавляем теги для активных фильтров
            if (currentCategory) {
                const categoryBtn = document.querySelector(`[data-type="category"][data-filter="${currentCategory}"]`);
                if (categoryBtn) {
                    addFilterTag(categoryBtn.textContent.trim(), 'category', currentCategory);
                }
            }

            if (currentPackage) {
                const packageBtn = document.querySelector(`[data-type="package"][data-filter="${currentPackage}"]`);
                if (packageBtn) {
                    addFilterTag(packageBtn.textContent.trim(), 'package', currentPackage);
                }
            }
        }

        function addFilterTag(text, type, value) {
            const tag = document.createElement('div');
            tag.className = 'active-filter-tag';
            tag.innerHTML = `
                ${text}
                <button type="button" data-type="${type}" data-value="${value}">&times;</button>
            `;

            tag.querySelector('button').addEventListener('click', function() {
                removeFilter(type, value);
            });

            activeFiltersContainer.appendChild(tag);
        }

        function removeFilter(type, value) {
            // Формируем новый URL без удаленного фильтра
            const params = new URLSearchParams(window.location.search);
            params.delete(type);

            // Если нет фильтров, добавляем page=1
            if (!params.has('category') && !params.has('package')) {
                params.set('page', '1');
            }

            window.location.href = `${window.location.pathname}?${params.toString()}`;
        }

        updateActiveFilters();
    }

    // Запускаем инициализацию
    initFilters();
    initActiveFilters();
});