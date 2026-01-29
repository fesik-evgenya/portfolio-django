/**
 * JavaScript для сравнения пакетов
 */

class PackageComparison {
    constructor() {
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');
        this.orderButtons = document.querySelectorAll('.package-order-btn');

        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupOrderButtons();
        console.log('Package comparison initialized');
    }

    setupTabSwitching() {
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                // Убираем активный класс у всех кнопок
                this.tabButtons.forEach(btn => btn.classList.remove('active'));
                // Добавляем активный класс нажатой кнопке
                button.classList.add('active');

                // Скрываем все табы
                this.tabContents.forEach(content => {
                    content.classList.remove('active');
                });

                // Показываем выбранный таб
                const targetTab = document.getElementById(`tab-${tabId}`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }

                // Сохраняем выбор в localStorage
                localStorage.setItem('selectedPackageTab', tabId);
            });
        });

        // Восстанавливаем выбор из localStorage
        const savedTab = localStorage.getItem('selectedPackageTab');
        if (savedTab) {
            const savedButton = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
            if (savedButton) {
                savedButton.click();
            }
        }
    }

    setupOrderButtons() {
        this.orderButtons.forEach(button => {
            button.addEventListener('click', () => {
                const packageType = button.getAttribute('data-package');
                this.selectPackage(packageType);

                // Прокрутка к форме заказа
                const orderForm = document.querySelector('.order-form');
                if (orderForm) {
                    orderForm.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    selectPackage(packageType) {
        // Обновляем форму заказа с выбранным пакетом
        const packageInput = document.querySelector('input[name="package_type"]');
        if (packageInput) {
            packageInput.value = packageType;
        }

        // Обновляем отображаемую цену
        let price = 0;
        switch(packageType) {
            case 'basic':
                price = 15000;
                break;
            case 'standard':
                price = 35000;
                break;
            case 'premium':
                price = 75000;
                break;
        }

        const priceInput = document.querySelector('input[name="total_amount"]');
        if (priceInput) {
            priceInput.value = price;
        }

        const priceDisplay = document.querySelector('.price-display .price');
        if (priceDisplay) {
            priceDisplay.textContent = price.toLocaleString('ru-RU');
        }

        // Показываем уведомление
        this.showNotification(`Выбран пакет: ${this.getPackageName(packageType)}`);
    }

    getPackageName(packageType) {
        switch(packageType) {
            case 'basic': return 'Базовый';
            case 'standard': return 'Стандартный';
            case 'premium': return 'Премиум';
            default: return packageType;
        }
    }

    showNotification(message) {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = 'package-notification';
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">×</button>
        `;

        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, var(--accent-purple), #9d4edd);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
        `;

        // Анимация
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Кнопка закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    window.packageComparison = new PackageComparison();
});