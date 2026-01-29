/*
   DASHBOARD FUNCTIONALITY - Django Version
 */

class Dashboard {
    constructor() {
        this.revenueChart = null;
        this.ordersChart = null;
        this.init();
    }

    init() {
        this.initCharts();
        this.loadDashboardData();
        this.setupEventListeners();
        this.setupRealTimeUpdates();
        console.log('Dashboard initialized');
    }

    // Инициализация графиков
    initCharts() {
        this.initRevenueChart();
        this.initOrdersChart();
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
                datasets: [{
                    label: 'Доход',
                    data: [65000, 79000, 83000, 89000, 97000, 105000, 120000],
                    borderColor: 'rgba(74, 108, 247, 1)',
                    backgroundColor: 'rgba(74, 108, 247, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toLocaleString('ru-RU')} ₽`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('ru-RU') + ' ₽';
                            }
                        },
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initOrdersChart() {
        const ctx = document.getElementById('ordersChart');
        if (!ctx) return;

        this.ordersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                datasets: [{
                    label: 'Заказы',
                    data: [12, 19, 8, 15, 10, 22, 18],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(40, 167, 69, 0.7)'
                    ],
                    borderColor: [
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(40, 167, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5
                        },
                        grid: {
                            drawBorder: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Загрузка данных дашборда
    async loadDashboardData() {
        try {
            // Загружаем данные через AJAX
            const data = await this.fetchDashboardData();

            // Обновляем статистические карточки
            this.updateStats(data.stats);

            // Обновляем таблицы
            this.updateRecentOrders(data.recent_orders);
            this.updateRecentMessages(data.recent_messages);

            // Обновляем активность
            this.updateSystemActivity(data.activity);

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            adminPanel.showNotification('Ошибка загрузки данных дашборда', 'error');
        }
    }

    async fetchDashboardData() {
        // Здесь будет AJAX запрос к Django API
        // Временно возвращаем тестовые данные
        return {
            stats: {
                orders: 24,
                messages: 15,
                revenue: 84200,
                visitors: 128
            },
            recent_orders: [],
            recent_messages: [],
            activity: []
        };
    }

    updateStats(stats) {
        if (stats.orders) {
            document.getElementById('ordersCount').textContent = stats.orders;
        }
        if (stats.messages) {
            document.getElementById('messagesCount').textContent = stats.messages;
        }
        if (stats.revenue) {
            document.getElementById('revenueValue').textContent =
                stats.revenue.toLocaleString('ru-RU') + ' ₽';
        }
        if (stats.visitors) {
            document.getElementById('visitorsCount').textContent = stats.visitors;
        }
    }

    updateRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        if (!container || !orders) return;

        if (orders.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Нет заказов</td>
                </tr>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.solution_name}</td>
                <td>${order.total_amount} ₽</td>
                <td>
                    <span class="status-badge status-${order.status}">
                        ${order.status_display}
                    </span>
                </td>
                <td>${order.created_at}</td>
            </tr>
        `).join('');
    }

    updateRecentMessages(messages) {
        const container = document.getElementById('recentMessages');
        if (!container || !messages) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Нет сообщений</td>
                </tr>
            `;
            return;
        }

        container.innerHTML = messages.map(message => `
            <tr>
                <td>${message.name}</td>
                <td>${message.email}</td>
                <td>${message.subject || 'Без темы'}</td>
                <td>
                    <span class="status-badge status-${message.status}">
                        ${message.status_display}
                    </span>
                </td>
                <td>${message.created_at}</td>
            </tr>
        `).join('');
    }

    updateSystemActivity(activity) {
        const container = document.getElementById('systemActivity');
        if (!container || !activity) return;

        if (activity.length === 0) {
            container.innerHTML = `
                <div class="activity-empty">
                    <i class="fas fa-history"></i>
                    <p>Нет активности</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activity.map(item => `
            <li>
                <div class="activity-icon">
                    <i class="fas fa-${this.getActivityIcon(item.type)}"></i>
                </div>
                <div class="activity-content">
                    <p class="activity-text">${item.text}</p>
                    <span class="activity-time">${item.time}</span>
                </div>
            </li>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'order': 'shopping-cart',
            'message': 'envelope',
            'user': 'user',
            'system': 'cog',
            'warning': 'exclamation-triangle'
        };
        return icons[type] || 'bell';
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обновление периода графиков
        const revenuePeriod = document.getElementById('revenuePeriod');
        const ordersPeriod = document.getElementById('ordersPeriod');

        if (revenuePeriod) {
            revenuePeriod.addEventListener('change', (e) => {
                this.updateRevenueChart(e.target.value);
            });
        }

        if (ordersPeriod) {
            ordersPeriod.addEventListener('change', (e) => {
                this.updateOrdersChart(e.target.value);
            });
        }

        // Кнопка обновления активности
        const refreshBtn = document.querySelector('.refresh-activity');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadDashboardData();
                adminPanel.showNotification('Данные обновлены', 'success');
            });
        }

        // Экспорт данных
        const exportButtons = document.querySelectorAll('[data-export]');
        exportButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tableId = btn.getAttribute('data-export');
                const filename = btn.getAttribute('data-filename') || 'export.xls';
                adminPanel.exportTableToExcel(tableId, filename);
            });
        });
    }

    // Обновление графиков при смене периода
    async updateRevenueChart(period) {
        try {
            // Показываем индикатор загрузки
            const ctx = document.getElementById('revenueChart');
            ctx.classList.add('chart-loading');

            // Загружаем новые данные
            const data = await this.fetchRevenueData(period);

            // Обновляем график
            this.revenueChart.data.labels = data.labels;
            this.revenueChart.data.datasets[0].data = data.values;
            this.revenueChart.update();

            // Скрываем индикатор загрузки
            ctx.classList.remove('chart-loading');

        } catch (error) {
            console.error('Failed to update revenue chart:', error);
            adminPanel.showNotification('Ошибка обновления графика', 'error');
        }
    }

    async updateOrdersChart(period) {
        try {
            // Показываем индикатор загрузки
            const ctx = document.getElementById('ordersChart');
            ctx.classList.add('chart-loading');

            // Загружаем новые данные
            const data = await this.fetchOrdersData(period);

            // Обновляем график
            this.ordersChart.data.labels = data.labels;
            this.ordersChart.data.datasets[0].data = data.values;
            this.ordersChart.update();

            // Скрываем индикатор загрузки
            ctx.classList.remove('chart-loading');

        } catch (error) {
            console.error('Failed to update orders chart:', error);
            adminPanel.showNotification('Ошибка обновления графика', 'error');
        }
    }

    async fetchRevenueData(period) {
        // Здесь будет AJAX запрос
        // Временно возвращаем тестовые данные
        const data = {
            'week': {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                values: [18000, 22000, 19000, 25000, 21000, 28000, 24000]
            },
            'month': {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'],
                values: [65000, 79000, 83000, 89000, 97000, 105000, 120000]
            },
            'year': {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                values: [65000, 79000, 83000, 89000, 97000, 105000, 120000, 125000, 130000, 135000, 140000, 150000]
            }
        };

        return data[period] || data.month;
    }

    async fetchOrdersData(period) {
        // Здесь будет AJAX запрос
        // Временно возвращаем тестовые данные
        const data = {
            'week': {
                labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                values: [12, 19, 8, 15, 10, 22, 18]
            },
            'month': {
                labels: ['Неделя 1', 'Неделя 2', 'Неделя 3', 'Неделя 4'],
                values: [45, 52, 48, 60]
            }
        };

        return data[period] || data.week;
    }

    // Реалтайм обновления
    setupRealTimeUpdates() {
        // WebSocket или Polling для реалтайм обновлений
        this.setupWebSocket();

        // Обновление каждые 60 секунд
        setInterval(() => {
            this.loadDashboardData();
        }, 60000);
    }

    setupWebSocket() {
        // Здесь будет WebSocket соединение для реалтайм обновлений
        // Временно используем polling
    }

    // Вспомогательные функции
    formatCurrency(value) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        }).format(value);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Инициализация дашборда
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, находимся ли мы на странице дашборда
    if (document.querySelector('.dashboard-container')) {
        window.dashboard = new Dashboard();
    }
});