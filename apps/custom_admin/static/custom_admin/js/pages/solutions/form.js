class SolutionForm {
    constructor() {
        this.form = document.getElementById('solutionForm');
        this.imageInput = document.getElementById('imageInput');
        this.imageDropzone = document.getElementById('imageDropzone');
        this.previewImageIndex = document.getElementById('previewImageIndex');
        this.hasDiscount = document.querySelector('[name="has_discount"]');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupImageUpload();
        this.setupDiscountToggle();
        this.setupFeaturesHandling();
        this.setupSlugGeneration();

        // Инициализация компонента управления пакетами
        if (window.packageManager) {
            window.packageManager.init();
        }
    }

    setupEventListeners() {
        // Валидация формы перед отправкой
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                if (!this.validateForm()) {
                    e.preventDefault();
                }
            });
        }

        // Генерация slug при изменении названия
        const nameInput = document.querySelector('[name="name"]');
        const slugInput = document.querySelector('[name="slug"]');

        if (nameInput && slugInput) {
            nameInput.addEventListener('blur', () => {
                if (!slugInput.value) {
                    this.generateSlug(nameInput.value, slugInput);
                }
            });

            slugInput.addEventListener('blur', () => {
                this.validateSlug(slugInput);
            });
        }
    }

    setupImageUpload() {
        if (!this.imageDropzone || !this.imageInput) return;

        // Клик по dropzone
        this.imageDropzone.addEventListener('click', () => {
            this.imageInput.click();
        });

        // Обработка выбора файлов
        this.imageInput.addEventListener('change', (e) => {
            if (this.validateFiles(e.target.files)) {
                this.handleImageSelection(e.target.files);
            } else {
                e.target.value = '';
            }
        });

        // Drag and Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.imageDropzone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.imageDropzone.addEventListener(eventName, this.highlightDropzone, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.imageDropzone.addEventListener(eventName, this.unhighlightDropzone, false);
        });

        this.imageDropzone.addEventListener('drop', (e) => {
            this.handleFileDrop(e);
        });
    }

    setupDiscountToggle() {
        if (!this.hasDiscount) return;

        const discountFields = document.querySelector('.discount-fields');

        this.hasDiscount.addEventListener('change', () => {
            if (discountFields) {
                discountFields.style.display = this.hasDiscount.checked ? 'block' : 'none';
            }
        });

        // Инициализация состояния
        if (discountFields) {
            discountFields.style.display = this.hasDiscount.checked ? 'block' : 'none';
        }
    }

    setupFeaturesHandling() {
        // Преобразование текста в JSON для особенностей и требований
        const featuresText = document.querySelector('[name="features_text"]');
        const featuresHidden = document.querySelector('[name="features"]');
        const requirementsText = document.querySelector('[name="requirements_text"]');
        const requirementsHidden = document.querySelector('[name="requirements"]');

        if (featuresText && featuresHidden) {
            featuresText.addEventListener('blur', () => {
                const features = featuresText.value
                    .split('\n')
                    .map(f => f.trim())
                    .filter(f => f.length > 0);
                featuresHidden.value = JSON.stringify(features);
            });
        }

        if (requirementsText && requirementsHidden) {
            requirementsText.addEventListener('blur', () => {
                const requirements = requirementsText.value
                    .split('\n')
                    .map(r => r.trim())
                    .filter(r => r.length > 0);
                requirementsHidden.value = JSON.stringify(requirements);
            });
        }
    }

    setupSlugGeneration() {
        const slugInput = document.querySelector('[name="slug"]');
        if (slugInput) {
            slugInput.addEventListener('blur', () => {
                const slug = this.slugify(slugInput.value);
                if (slug !== slugInput.value) {
                    slugInput.value = slug;
                }
            });
        }
    }

    validateForm() {
        const requiredFields = [
            'name', 'slug', 'category', 'price', 'delivery_days', 'description'
        ];

        let isValid = true;

        requiredFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field && !field.value.trim()) {
                this.showError(field, 'Это поле обязательно для заполнения');
                isValid = false;
            }
        });

        // Проверка slug
        const slugField = document.querySelector('[name="slug"]');
        if (slugField && slugField.value) {
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slugField.value)) {
                this.showError(slugField, 'Slug может содержать только латинские буквы, цифры и дефисы');
                isValid = false;
            }
        }

        // Проверка цены
        const priceField = document.querySelector('[name="price"]');
        if (priceField && (!priceField.value || parseFloat(priceField.value) <= 0)) {
            this.showError(priceField, 'Введите корректную цену');
            isValid = false;
        }

        // Проверка срока
        const deliveryField = document.querySelector('[name="delivery_days"]');
        if (deliveryField && (!deliveryField.value || parseInt(deliveryField.value) <= 0)) {
            this.showError(deliveryField, 'Введите корректный срок разработки');
            isValid = false;
        }

        return isValid;
    }

    validateFiles(files) {
        const maxFiles = 10;
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        if (files.length > maxFiles) {
            alert(`Можно загрузить не более ${maxFiles} файлов`);
            return false;
        }

        for (let file of files) {
            if (file.size > maxSize) {
                alert(`Файл "${file.name}" слишком большой. Максимальный размер: 2MB`);
                return false;
            }

            if (!allowedTypes.includes(file.type)) {
                alert(`Файл "${file.name}" имеет недопустимый формат. Разрешены: JPG, PNG, WEBP, GIF`);
                return false;
            }
        }

        return true;
    }

    handleImageSelection(files) {
        const previewContainer = document.getElementById('imagePreviews');
        if (!previewContainer) return;

        // Очистить предыдущие превью
        previewContainer.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.className = `preview-item ${index === 0 ? 'selected' : ''}`;
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" class="preview-image">
                    <div class="preview-info">
                        <div class="preview-filename">${file.name}</div>
                        <div class="preview-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <div class="preview-radio">
                        <input type="radio" name="preview_radio" value="${index}"
                               ${index === 0 ? 'checked' : ''}
                               onchange="window.solutionForm.selectPreviewImage(this)">
                        <label>Использовать как превью</label>
                    </div>
                `;
                previewContainer.appendChild(previewItem);
            };

            reader.readAsDataURL(file);
        });

        // Установить первое изображение как превью по умолчанию
        if (files.length > 0) {
            this.previewImageIndex.value = '0';
        }
    }

    selectPreviewImage(radio) {
        const previewIndex = radio.value;
        const previewItems = document.querySelectorAll('.preview-item');

        // Обновить скрытое поле
        this.previewImageIndex.value = previewIndex;

        // Обновить визуальное выделение
        previewItems.forEach((item, index) => {
            if (index == previewIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    generateSlug(name, slugField) {
        if (name && slugField) {
            slugField.value = this.slugify(name);
        }
    }

    validateSlug(slugField) {
        if (slugField.value) {
            const correctedSlug = this.slugify(slugField.value);
            if (correctedSlug !== slugField.value) {
                slugField.value = correctedSlug;
            }
        }
    }

    slugify(text) {
        const transliterationMap = {
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
        };

        return text.toLowerCase()
            .split('')
            .map(char => {
                if (transliterationMap[char]) {
                    return transliterationMap[char];
                }
                if ([' ', '_', '.', ','].includes(char)) {
                    return '-';
                }
                if (['!', '?', '(', ')', '[', ']', '{', '}', '<', '>', '"', "'"].includes(char)) {
                    return '';
                }
                return char.match(/[a-z0-9-]/) ? char : '';
            })
            .join('')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(field, message) {
        alert(message);
        field.classList.add('is-invalid');
        field.focus();

        setTimeout(() => {
            field.classList.remove('is-invalid');
        }, 3000);
    }

    // Drag and Drop методы
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlightDropzone() {
        const dropzone = document.querySelector('.file-dropzone');
        if (dropzone) {
            dropzone.classList.add('drag-over');
        }
    }

    unhighlightDropzone() {
        const dropzone = document.querySelector('.file-dropzone');
        if (dropzone) {
            dropzone.classList.remove('drag-over');
        }
    }

    handleFileDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (this.imageInput && files.length > 0) {
            if (this.validateFiles(files)) {
                this.imageInput.files = files;
                this.handleImageSelection(files);
            }
        }
        this.unhighlightDropzone();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.solutionForm = new SolutionForm();
});