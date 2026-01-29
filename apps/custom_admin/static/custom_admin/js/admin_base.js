/*
   ADMIN PANEL BASE FUNCTIONALITY - Django Version
 */

class AdminPanel {
    constructor() {
        this.modals = new Map();
        this.notifications = [];
        this.init();
    }

    init() {
        this.activateCurrentNav();
        this.initModalSystem();
        this.initConfirmations();
        this.initNotifications();
        this.setupResizeHandler();
        this.setupAjaxCSRF();
        console.log('Admin panel initialized - Django Version');
    }

    // Активация текущего пункта меню
    activateCurrentNav() {
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(item => {
            if (item.getAttribute('href') === currentPath) {
                item.closest('.nav-item').classList.add('active');
            }
        });
    }

    // Система модальных окон
    initModalSystem() {
        // Регистрируем все модальные окна
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            const modalId = modal.id;
            this.modals.set(modalId, modal);
        });

        document.addEventListener('click', (e) => {
            // Закрытие модальных окон
            if (e.target.classList.contains('modal-overlay') ||
                e.target.classList.contains('modal-close') ||
                e.target.closest('.modal-close')) {
                this.closeModal(e.target.closest('.modal-overlay'));
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Глобальные функции
        window.openLogoutModal = () => this.openModal('logoutModal');
        window.closeLogoutModal = () => this.closeModal(document.getElementById('logoutModal'));
    }

    // Открытие модального окна
    openModal(modalId) {
        const modal = this.modals.get(modalId) || document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            setTimeout(() => modal.classList.add('show'), 10);

            if (!this.modals.has(modalId)) {
                this.modals.set(modalId, modal);
            }
        }
    }

    // Закрытие модального окна
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    // Закрытие всех модальных окон
    closeAllModals() {
        this.modals.forEach(modal => {
            this.closeModal(modal);
        });
    }

    // Подтверждение действий
    initConfirmations() {
        document.addEventListener('click', (e) => {
            const confirmable = e.target.closest('[data-confirm]');
            if (confirmable) {
                const message = confirmable.getAttribute('data-confirm') ||
                    'Вы уверены, что хотите выполнить это действие?';
                if (!confirm(message)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }
        });
    }

    // Уведомления
    initNotifications() {
        this.loadNotifications();
        this.setupNotificationPolling();
    }

    async loadNotifications() {
        try {
            const response = await this.ajaxRequest('/admin/api/notifications/');
            if (response.success) {
                this.notifications = response.data;
                this.updateNotificationBadge();
                this.renderNotificationDropdown();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    renderNotificationDropdown() {
        const container = document.querySelector('.notification-list');
        if (!container) return;

        const unreadNotifications = this.notifications.filter(n => !n.read);
        const recentNotifications = unreadNotifications.slice(0, 5);

        if (recentNotifications.length === 0) {
            container.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>Нет новых уведомлений</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentNotifications.map(notification => `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" 
                 data-id="${notification.id}">
                <div class="notification-icon">
                    <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-text">${notification.message}</p>
                    <span class="notification-time">${notification.time}</span>
                </div>
            </div>
        `).join('');
    }

    getNotificationIcon(type) {
        const icons = {
            'order': 'shopping-cart',
            'message': 'envelope',
            'system': 'cog',
            'warning': 'exclamation-triangle',
            'success': 'check-circle'
        };
        return icons[type] || 'bell';
    }

    setupNotificationPolling() {
        // Опрос новых уведомлений каждые 30 секунд
        setInterval(() => {
            this.loadNotifications();
        }, 30000);
    }

    // Настройка CSRF для AJAX
    setupAjaxCSRF() {
        const csrfToken = this.getCookie('csrftoken');
        if (csrfToken) {
            $.ajaxSetup({
                headers: {
                    'X-CSRFToken': csrfToken
                }
            });
        }
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // AJAX запросы
    async ajaxRequest(url, options = {}) {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Admin AJAX request failed:', error);
            this.showNotification('Ошибка загрузки данных', 'error');
            throw error;
        }
    }

    // Показать уведомление
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotification(message, type);
        document.body.appendChild(notification);

        requestAnimationFrame(() => {
            notification.classList.add('admin-notification--show');
        });

        const timeoutId = setTimeout(() => {
            this.hideNotification(notification);
        }, duration);

        notification.timeoutId = timeoutId;
        return notification;
    }

    createNotification(message, type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification--${type}`;
        notification.innerHTML = `
            <div class="admin-notification__content">
                <i class="fas fa-${icons[type] || 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="admin-notification__close">
                <i class="fas fa-times"></i>
            </button>
        `;

        notification.querySelector('.admin-notification__close')
            .addEventListener('click', () => this.hideNotification(notification));

        return notification;
    }

    hideNotification(notification) {
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }
        notification.classList.remove('admin-notification--show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    // Обработчик изменения размера
    setupResizeHandler() {
        let resizeTimeout;
        const resizeHandler = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.handleResize(), 250);
        };

        window.addEventListener('resize', resizeHandler);
        this.resizeHandler = resizeHandler;
    }

    handleResize() {
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('adminSidebar');
            if (sidebar) {
                sidebar.classList.remove('show');
            }
        }
    }

    // Экспорт таблиц в Excel
    exportTableToExcel(tableId, filename = '') {
        const table = document.getElementById(tableId);
        if (!table) return;

        let html = table.outerHTML;
        let blob = new Blob(['\ufeff', html], {
            type: 'application/vnd.ms-excel'
        });

        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'export.xls';
        link.click();

        this.showNotification('Таблица успешно экспортирована', 'success');
    }

    // Очистка ресурсов
    destroy() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        this.modals.clear();
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});

// Глобальные функции для обратной совместимости
window.showAdminNotification = (message, type) => {
    return window.adminPanel?.showNotification(message, type);
};

window.adminAjaxRequest = (url, options) => {
    return window.adminPanel?.ajaxRequest(url, options);
};

window.openAdminModal = (modalId) => {
    return window.adminPanel?.openModal(modalId);
};

window.closeAdminModal = (modalId) => {
    const modal = document.getElementById(modalId);
    return window.adminPanel?.closeModal(modal);
};

window.exportToExcel = (tableId, filename) => {
    return window.adminPanel?.exportTableToExcel(tableId, filename);
};