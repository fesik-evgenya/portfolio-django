/**
 * Калькулятор стоимости для решений
 */

class PricingCalculator {
    constructor() {
        this.basePrice = 0;
        this.selectedOptions = new Set();
        this.pricingTiers = {
            basic: 1,
            standard: 1.5,
            premium: 2
        };

        this.init();
    }

    init() {
        this.getBasePrice();
        this.setupOptionListeners();
        this.setupPackageListeners();
        console.log('Pricing calculator initialized');
    }

    getBasePrice() {
        const priceElement = document.querySelector('.solution-price');
        if (priceElement) {
            const priceText = priceElement.textContent;
            const priceMatch = priceText.match(/[\d\s]+/);
            if (priceMatch) {
                this.basePrice = parseInt(priceMatch[0].replace(/\s/g, ''));
            }
        }
    }

    setupOptionListeners() {
        const optionCheckboxes = document.querySelectorAll('.option-checkbox');
        optionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updatePrice());
        });

        const optionSelects = document.querySelectorAll('.option-select');
        optionSelects.forEach(select => {
            select.addEventListener('change', () => this.updatePrice());
        });
    }

    setupPackageListeners() {
        const packageButtons = document.querySelectorAll('[data-package]');
        packageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const packageType = e.target.getAttribute('data-package');
                this.selectPackage(packageType);
            });
        });
    }

    selectPackage(packageType) {
        const multiplier = this.pricingTiers[packageType] || 1;
        this.currentMultiplier = multiplier;
        this.updatePrice();
    }

    updatePrice() {
        let total = this.basePrice;

        // Добавляем стоимость опций
        const optionCheckboxes = document.querySelectorAll('.option-checkbox:checked');
        optionCheckboxes.forEach(checkbox => {
            const optionPrice = parseInt(checkbox.getAttribute('data-price') || 0);
            total += optionPrice;
        });

        // Добавляем стоимость выбранных опций из select
        const optionSelects = document.querySelectorAll('.option-select');
        optionSelects.forEach(select => {
            const selectedOption = select.options[select.selectedIndex];
            const optionPrice = parseInt(selectedOption.getAttribute('data-price') || 0);
            total += optionPrice;
        });

        // Применяем множитель пакета
        if (this.currentMultiplier) {
            total *= this.currentMultiplier;
        }

        // Обновляем отображение цены
        this.updatePriceDisplay(total);

        // Обновляем скрытое поле формы
        const priceInput = document.querySelector('input[name="total_amount"]');
        if (priceInput) {
            priceInput.value = Math.round(total);
        }
    }

    updatePriceDisplay(price) {
        const priceElements = document.querySelectorAll('.price-display .price, .solution-price');
        priceElements.forEach(element => {
            element.textContent = Math.round(price).toLocaleString('ru-RU');
        });

        // Анимация изменения цены
        this.animatePriceChange();
    }

    animatePriceChange() {
        const priceElements = document.querySelectorAll('.price-display .price');
        priceElements.forEach(element => {
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'scale(1.1)';

            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        });
    }

    // Метод для добавления динамических опций
    addOption(name, price, type = 'checkbox') {
        const optionsContainer = document.querySelector('.solution-options');
        if (!optionsContainer) return;

        let optionHtml = '';
        if (type === 'checkbox') {
            optionHtml = `
                <label class="option-item">
                    <input type="checkbox" 
                           class="option-checkbox" 
                           data-price="${price}"
                           data-name="${name}">
                    <span class="option-name">${name}</span>
                    <span class="option-price">+${price.toLocaleString('ru-RU')} ₽</span>
                </label>
            `;
        } else if (type === 'select') {
            optionHtml = `
                <div class="option-select-group">
                    <label>${name}</label>
                    <select class="option-select">
                        <option value="0" data-price="0">Не выбрано</option>
                        <option value="1" data-price="${price}">${name} (+${price.toLocaleString('ru-RU')} ₽)</option>
                    </select>
                </div>
            `;
        }

        optionsContainer.insertAdjacentHTML('beforeend', optionHtml);

        // Добавляем обработчик события для новой опции
        const newOption = optionsContainer.lastElementChild;
        const input = newOption.querySelector('.option-checkbox, .option-select');
        if (input) {
            input.addEventListener('change', () => this.updatePrice());
        }
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    window.pricingCalculator = new PricingCalculator();
});