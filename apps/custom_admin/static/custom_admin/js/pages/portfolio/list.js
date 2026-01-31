/*
 * Управление списком проектов портфолио
 * Фильтрация, поиск, удаление проектов
 */

class PortfolioListManager {
    constructor() {
        this.searchInput = document.getElementById('portfolioSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.portfolioGrid = document.getElementById('portfolioGrid');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.filterProjects(); // Инициализация фильтрации
    }

    setupEventListeners() {
        // Дебаунс для поиска
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(() => this.filterProjects(), 300));
        }

        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.filterProjects());
        }
    }

    filterProjects() {
        const searchText = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const categoryValue = this.categoryFilter ? this.categoryFilter.value : '';
        const cards = this.portfolioGrid ? this.portfolioGrid.querySelectorAll('.portfolio-card') : [];
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.getAttribute('data-title') || '';
            const itemCategory = card.getAttribute('data-category') || '';
            const matchesSearch = title.includes(searchText);
            const matchesCategory = !categoryValue || itemCategory === categoryValue;

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        this.updateEmptyState(visibleCount);
    }

    updateEmptyState(visibleCount) {
        let emptyState = this.portfolioGrid ? this.portfolioGrid.querySelector('.empty-state') : null;

        if (visibleCount === 0 && this.portfolioGrid) {
            if (!emptyState) {
                emptyState = this.createEmptyState();
                this.portfolioGrid.appendChild(emptyState);
            }
            emptyState.style.display = 'block';
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'col-12 empty-state';
        emptyState.innerHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                    <h3>Проекты не найдены</h3>
                    <p class="text-muted">Попробуйте изменить параметры поиска</p>
                </div>
            </div>
        `;
        return emptyState;
    }

    debounce(func, wait) {
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
}

// Функция удаления проекта
function deleteProject(button, deleteUrl) {
    if (confirm('Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.')) {
        // Создаем форму для CSRF защиты
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = deleteUrl;

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrfmiddlewaretoken';
            csrfInput.value = csrfToken.value;
            form.appendChild(csrfInput);
        }

        document.body.appendChild(form);
        form.submit();
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioListManager = new PortfolioListManager();
});

// Глобальные функции для обратной совместимости
window.deleteProject = deleteProject;