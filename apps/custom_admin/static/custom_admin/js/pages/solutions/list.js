class SolutionsList {
    constructor() {
        this.searchInput = document.getElementById('solutionSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.solutionsGrid = document.getElementById('solutionsGrid');
        this.deleteModal = document.getElementById('deleteModal');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDeleteHandlers();
        this.applyFilters();
    }

    setupEventListeners() {
        // Поиск и фильтрация
        if (this.searchInput) {
            this.searchInput.addEventListener('input',
                this.debounce(() => this.applyFilters(), 300));
        }

        if (this.categoryFilter) {
            this.categoryFilter.addEventListener('change', () => this.applyFilters());
        }

        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    setupDeleteHandlers() {
        // Обработчики удаления решений
        document.querySelectorAll('.delete-solution').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const solutionId = button.dataset.id;
                const solutionName = button.dataset.name;

                this.showDeleteModal(solutionId, solutionName);
            });
        });
    }

    showDeleteModal(solutionId, solutionName) {
        const solutionNameElement = document.getElementById('solutionName');
        const deleteForm = document.getElementById('deleteForm');

        if (solutionNameElement && deleteForm) {
            solutionNameElement.textContent = solutionName;
            deleteForm.action = `/admin/solutions/delete/${solutionId}/`;

            // Показать модальное окно через Bootstrap
            $('#deleteModal').modal('show');
        }
    }

    applyFilters() {
        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const categoryValue = this.categoryFilter ? this.categoryFilter.value : '';
        const statusValue = this.statusFilter ? this.statusFilter.value : '';

        const rows = this.solutionsGrid.querySelectorAll('.solution-row');

        rows.forEach(row => {
            const title = row.dataset.title || '';
            const category = row.dataset.category || '';
            const status = row.dataset.status || '';

            const matchesSearch = searchTerm === '' || title.includes(searchTerm);
            const matchesCategory = categoryValue === '' || category === categoryValue;
            const matchesStatus = statusValue === '' || status === statusValue;

            row.style.display = (matchesSearch && matchesCategory && matchesStatus) ? '' : 'none';
        });
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

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.solutionsList = new SolutionsList();
});

// Глобальные функции
window.deleteSolution = function(solutionId) {
    if (confirm('Вы уверены, что хотите удалить это решение?')) {
        fetch(`/admin/solutions/delete/${solutionId}/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Ошибка при удалении решения: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Ошибка при удалении решения');
            });
    }
};