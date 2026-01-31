class OrdersManager {
    constructor() {
        this.ordersTable = document.getElementById('ordersTable');
        this.orderSearch = document.getElementById('orderSearch');
        this.statusFilter = document.getElementById('statusFilter');
        this.solutionFilter = document.getElementById('solutionFilter');
        this.dateFrom = document.getElementById('dateFrom');
        this.dateTo = document.getElementById('dateTo');
        this.applyFiltersBtn = document.getElementById('applyFilters');
        this.resetFiltersBtn = document.getElementById('resetFilters');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupQuickStatus();
        this.setupDeleteHandlers();
        this.applyFilters();
    }

    setupEventListeners() {
        // Поиск с дебаунсом
        if (this.orderSearch) {
            this.orderSearch.addEventListener('input',
                this.debounce(() => this.applyFilters(), 300));
        }

        // Фильтры
        if (this.applyFiltersBtn) {
            this.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        }

        if (this.resetFiltersBtn) {
            this.resetFiltersBtn.addEventListener('click', () => this.resetFilters());
        }

        // Экспорт данных
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                this.exportData(format);
            });
        });
    }

    setupQuickStatus() {
        // Быстрое изменение статуса
        document.querySelectorAll('.quick-status').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const orderId = link.dataset.order;
                const status = link.dataset.status;

                if (await this.confirmStatusChange(orderId, status)) {
                    this.updateOrderStatus(orderId, status);
                }
            });
        });

        // Форма в модальном окне
        const quickStatusForm = document.getElementById('quickStatusForm');
        if (quickStatusForm) {
            quickStatusForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(quickStatusForm);
                const orderId = formData.get('order_id');
                const status = formData.get('status');
                const notify = formData.get('notify') === 'on';

                await this.updateOrderStatus(orderId, status, notify);
                $('#quickStatusModal').modal('hide');
            });
        }
    }

    setupDeleteHandlers() {
        // Обработчики удаления заказов
        document.querySelectorAll('.delete-order').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const orderId = button.dataset.id;
                const orderUuid = button.dataset.uuid;

                this.showDeleteModal(orderId, orderUuid);
            });
        });

        // Активация кнопки подтверждения удаления
        const confirmCheckbox = document.getElementById('confirmDelete');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        if (confirmCheckbox && confirmBtn) {
            confirmCheckbox.addEventListener('change', () => {
                confirmBtn.disabled = !confirmCheckbox.checked;
            });
        }
    }

    async confirmStatusChange(orderId, newStatus) {
        return new Promise((resolve) => {
            const modal = document.getElementById('quickStatusModal');
            const orderIdInput = document.getElementById('orderId');
            const statusSelect = document.getElementById('quickStatus');

            if (orderIdInput && statusSelect) {
                orderIdInput.value = orderId;
                statusSelect.value = newStatus;

                $(modal).modal('show');

                $(modal).on('hidden.bs.modal', () => {
                    resolve(false);
                });

                // Обработчик отправки формы
                const form = document.getElementById('quickStatusForm');
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    resolve(true);
                }, { once: true });
            } else {
                resolve(confirm(`Изменить статус заказа на "${this.getStatusLabel(newStatus)}"?`));
            }
        });
    }

    async updateOrderStatus(orderId, status, notify = true) {
        try {
            const response = await fetch(`/admin/solutions/orders/${orderId}/update-status/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    status: status,
                    notify: notify,
                    notes: document.getElementById('admin_notes')?.value || ''
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.updateOrderRow(orderId, status);
                    this.showToast('Статус заказа успешно обновлен', 'success');
                } else {
                    throw new Error(data.error);
                }
            } else {
                throw new Error('Ошибка обновления статуса');
            }
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            this.showToast('Ошибка обновления статуса: ' + error.message, 'error');
        }
    }

    updateOrderRow(orderId, newStatus) {
        const row = document.querySelector(`.order-row[data-id="${orderId}"]`);
        if (!row) return;

        // Обновляем статус в data-атрибуте
        row.dataset.status = newStatus;

        // Обновляем бейдж статуса
        const statusBadge = row.querySelector('.badge-status');
        if (statusBadge) {
            statusBadge.className = `badge badge-status badge-${newStatus}`;
            statusBadge.textContent = this.getStatusLabel(newStatus);
        }
    }

    applyFilters() {
        const searchTerm = this.orderSearch ? this.orderSearch.value.toLowerCase() : '';
        const statusValue = this.statusFilter ? this.statusFilter.value : '';
        const solutionValue = this.solutionFilter ? this.solutionFilter.value : '';
        const dateFromValue = this.dateFrom ? this.dateFrom.value : '';
        const dateToValue = this.dateTo ? this.dateTo.value : '';

        const rows = this.ordersTable.querySelectorAll('.order-row');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const status = row.dataset.status || '';
            const solution = row.dataset.solution || '';
            const date = row.dataset.date || '';

            const matchesSearch = searchTerm === '' || text.includes(searchTerm);
            const matchesStatus = statusValue === '' || status === statusValue;
            const matchesSolution = solutionValue === '' || solution === solutionValue;
            const matchesDateFrom = dateFromValue === '' || date >= dateFromValue;
            const matchesDateTo = dateToValue === '' || date <= dateToValue;

            row.style.display = (
                matchesSearch &&
                matchesStatus &&
                matchesSolution &&
                matchesDateFrom &&
                matchesDateTo
            ) ? '' : 'none';
        });
    }

    resetFilters() {
        if (this.orderSearch) this.orderSearch.value = '';
        if (this.statusFilter) this.statusFilter.value = '';
        if (this.solutionFilter) this.solutionFilter.value = '';
        if (this.dateFrom) this.dateFrom.value = '';
        if (this.dateTo) this.dateTo.value = '';

        this.applyFilters();
    }

    async exportData(format) {
        try {
            const params = new URLSearchParams({
                format: format,
                status: this.statusFilter?.value || '',
                solution: this.solutionFilter?.value || '',
                date_from: this.dateFrom?.value || '',
                date_to: this.dateTo?.value || ''
            });

            const response = await fetch(`/admin/solutions/orders/export/?${params}`);

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `orders_${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Ошибка экспорта данных');
            }
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.showToast('Ошибка экспорта данных', 'error');
        }
    }

    showDeleteModal(orderId, orderUuid) {
        const orderUuidElement = document.getElementById('orderUuid');
        const deleteForm = document.getElementById('deleteOrderForm');
        const confirmCheckbox = document.getElementById('confirmDelete');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        if (orderUuidElement && deleteForm) {
            orderUuidElement.textContent = `#${orderUuid}`;
            deleteForm.action = `/admin/solutions/orders/${orderId}/delete/`;

            // Сбросить чекбокс
            if (confirmCheckbox) confirmCheckbox.checked = false;
            if (confirmBtn) confirmBtn.disabled = true;

            $('#deleteOrderModal').modal('show');
        }
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Ожидает обработки',
            'processing': 'В обработке',
            'completed': 'Завершен',
            'cancelled': 'Отменен'
        };
        return labels[status] || status;
    }

    getCSRFToken() {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        return csrfToken ? csrfToken.value : '';
    }

    showToast(message, type = 'info') {
        // Простая реализация toast уведомлений
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
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
    window.ordersManager = new OrdersManager();
});