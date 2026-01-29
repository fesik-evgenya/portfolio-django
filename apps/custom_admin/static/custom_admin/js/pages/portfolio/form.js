/*
 * Управление формами портфолио (создание и редактирование)
 * Генерация slug, валидация, управление изображениями
 */

class PortfolioFormManager {
    constructor() {
        this.portfolioId = document.getElementById('portfolioId')?.value;
        this.deleteUrl = document.getElementById('deleteImageUrl')?.value;
        this.setPreviewUrl = document.getElementById('setPreviewUrl')?.value;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSlugGeneration();
        this.setupFormValidation();
        this.initRichTextEditor();
    }

    setupEventListeners() {
        // Обработка удаления существующих изображений
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-existing-image')) {
                const button = e.target.closest('.delete-existing-image');
                const imageId = button.getAttribute('data-image-id');
                this.deleteExistingImage(imageId, button);
            }

            // Обработка изменения превью для существующих изображений
            if (e.target.classList.contains('existing-preview-radio')) {
                const imageId = e.target.value;
                this.setExistingAsPreview(imageId);
            }
        });

        // Обработка отправки формы
        const form = document.getElementById('portfolioForm');
        const saveButton = document.getElementById('saveButton');

        if (form && saveButton) {
            form.addEventListener('submit', (e) => {
                if (this.validateForm()) {
                    this.showLoadingState(saveButton);
                } else {
                    e.preventDefault();
                }
            });
        }
    }

    setupSlugGeneration() {
        const titleInput = document.getElementById('id_title');
        const slugInput = document.getElementById('id_slug');

        if (titleInput && slugInput) {
            titleInput.addEventListener('blur', () => {
                this.generateSlug(titleInput, slugInput);
            });

            slugInput.addEventListener('input', () => {
                slugInput.setAttribute('data-auto-generated', 'false');
            });

            // Устанавливаем начальный атрибут
            slugInput.setAttribute('data-auto-generated',
                slugInput.value ? 'false' : 'true');
        }
    }

    generateSlug(titleInput, slugInput) {
        if (titleInput.value && (!slugInput.value || slugInput.getAttribute('data-auto-generated') === 'true')) {
            const slug = titleInput.value.toLowerCase()
                .replace(/[^a-z0-9а-яё\s-]/gi, '')
                .replace(/[а-яё]/g, (match) => {
                    const cyrToLat = {
                        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
                        'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
                        'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
                        'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
                        'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
                        'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '',
                        'э': 'e', 'ю': 'yu', 'я': 'ya'
                    };
                    return cyrToLat[match] || match;
                })
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

            slugInput.value = slug;
            slugInput.setAttribute('data-auto-generated', 'true');
        }
    }

    setupFormValidation() {
        // Валидация будет выполняться при отправке формы
    }

    validateForm() {
        const requiredFields = ['id_title', 'id_category', 'id_package', 'id_duration', 'id_client'];
        let isValid = true;
        const errors = [];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('is-invalid');
                errors.push(`Поле "${field.previousElementSibling?.textContent || field.labels?.[0]?.textContent}" обязательно для заполнения`);
                isValid = false;

                // Убираем валидацию при вводе
                field.addEventListener('input', () => {
                    field.classList.remove('is-invalid');
                });
            }
        });

        // Валидация особенностей (features)
        const featuresField = document.getElementById('id_features');
        if (featuresField && !featuresField.value.trim()) {
            featuresField.classList.add('is-invalid');
            errors.push('Добавьте особенности проекта');
            isValid = false;

            featuresField.addEventListener('input', () => {
                featuresField.classList.remove('is-invalid');
            });
        }

        if (!isValid) {
            this.showNotification(errors.join('<br>'), 'error', 5000);
            // Прокручиваем к первой ошибке
            this.scrollToFirstError();
        }

        return isValid;
    }

    scrollToFirstError() {
        const firstError = document.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }

    showLoadingState(button) {
        button.disabled = true;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Сохранение...';
        button.setAttribute('data-original-text', originalText);
    }

    deleteExistingImage(imageId, button) {
        if (confirm('Вы уверены, что хотите удалить это изображение?')) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>';

            const formData = new FormData();
            formData.append('image_id', imageId);
            formData.append('csrfmiddlewaretoken', this.getCSRFToken());

            fetch(this.deleteUrl, {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Удаляем элемент из DOM
                        const imageElement = button.closest('[data-image-id]');
                        if (imageElement) {
                            imageElement.remove();
                            this.showNotification('Изображение успешно удалено', 'success');
                        }
                    } else {
                        this.showNotification('Ошибка при удалении изображения', 'error');
                        button.disabled = false;
                        button.innerHTML = '<i class="fas fa-trash me-1"></i>Удалить';
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    this.showNotification('Ошибка при удалении изображения', 'error');
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-trash me-1"></i>Удалить';
                });
        }
    }

    setExistingAsPreview(imageId) {
        const formData = new FormData();
        formData.append('image_id', imageId);
        formData.append('csrfmiddlewaretoken', this.getCSRFToken());

        fetch(this.setPreviewUrl, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showNotification('Превью успешно обновлено', 'success');
                    // Обновляем визуальное выделение
                    this.updatePreviewHighlight();
                } else {
                    this.showNotification('Ошибка при обновлении превью', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.showNotification('Ошибка при обновлении превью', 'error');
            });
    }

    updatePreviewHighlight() {
        // Убираем бейджи со всех изображений
        document.querySelectorAll('.badge.bg-success').forEach(badge => {
            badge.remove();
        });

        // Добавляем бейдж к выбранному превью
        const selectedRadio = document.querySelector('.existing-preview-radio:checked');
        if (selectedRadio) {
            const imageItem = selectedRadio.closest('.image-item');
            const badge = document.createElement('span');
            badge.className = 'position-absolute top-0 start-0 m-2 badge bg-success';
            badge.textContent = 'Превью';
            imageItem.appendChild(badge);
        }
    }

    initRichTextEditor() {
        // Инициализация WYSIWYG редактора (например, Summernote)
        const descriptionField = document.getElementById('id_description');
        if (descriptionField && typeof window.initSummernote === 'function') {
            window.initSummernote(descriptionField.id);
        }
    }

    getCSRFToken() {
        const tokenInput = document.querySelector('[name=csrfmiddlewaretoken]');
        return tokenInput ? tokenInput.value : '';
    }

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show notification`;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas ${this.getNotificationIcon(type)} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioFormManager = new PortfolioFormManager();
});

// Глобальные функции
window.generateSlug = function() {
    if (window.portfolioFormManager) {
        const titleInput = document.getElementById('id_title');
        const slugInput = document.getElementById('id_slug');
        if (titleInput && slugInput) {
            window.portfolioFormManager.generateSlug(titleInput, slugInput);
        }
    }
};