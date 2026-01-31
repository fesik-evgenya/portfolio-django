/*
 * Компонент загрузки изображений
 * Поддержка drag & drop, превью, валидация
 */

class ImageUploadComponent {
    constructor() {
        this.maxFiles = 10;
        this.maxFileSize = 2 * 1024 * 1024; // 2MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        this.init();
    }

    init() {
        this.setupDropzones();
        this.setupFileInputs();
        this.setupEventListeners();
    }

    setupDropzones() {
        document.querySelectorAll('.file-dropzone').forEach(dropzone => {
            const fileInput = dropzone.querySelector('input[type="file"]');

            // Обработчики drag & drop
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, this.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, () => this.highlight(dropzone), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, () => this.unhighlight(dropzone), false);
            });

            dropzone.addEventListener('drop', (e) => this.handleDrop(e, fileInput), false);
            dropzone.addEventListener('click', () => fileInput.click(), false);
        });
    }

    setupFileInputs() {
        document.querySelectorAll('input[type="file"][multiple]').forEach(input => {
            input.addEventListener('change', (e) => this.handleFileSelect(e));
        });
    }

    setupEventListeners() {
        // Удаление изображений из превью
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-image')) {
                this.removeImage(e.target.closest('.remove-image'));
            }

            // Выбор превью
            if (e.target.classList.contains('preview-radio')) {
                this.handlePreviewSelection(e.target);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    highlight(element) {
        element.classList.add('drag-over');
    }

    unhighlight(element) {
        element.classList.remove('drag-over');
    }

    handleDrop(e, fileInput) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (this.validateFiles(files)) {
            fileInput.files = files;
            this.updateFileCounter(fileInput);
            this.previewImages(files, fileInput);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;

        if (this.validateFiles(files)) {
            this.updateFileCounter(e.target);
            this.previewImages(files, e.target);
        } else {
            e.target.value = '';
        }
    }

    validateFiles(files) {
        if (files.length > this.maxFiles) {
            this.showNotification(`Можно загрузить не более ${this.maxFiles} файлов`, 'error');
            return false;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Проверка размера
            if (file.size > this.maxFileSize) {
                this.showNotification(`Файл "${file.name}" превышает лимит 2MB`, 'error');
                return false;
            }

            // Проверка типа файла
            if (!this.allowedTypes.includes(file.type)) {
                this.showNotification(`Файл "${file.name}" имеет недопустимый формат`, 'error');
                return false;
            }
        }

        return true;
    }

    previewImages(files, fileInput) {
        const previewContainer = fileInput.closest('.form-group')?.querySelector('.image-previews');
        if (!previewContainer) return;

        // Очищаем предыдущие превью
        previewContainer.innerHTML = '';

        // Создаем превью для каждого файла
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const template = document.getElementById('previewTemplate');
                    if (!template) return;

                    const newPreview = template.content.cloneNode(true);
                    const previewElement = newPreview.querySelector('.preview-item');

                    // Заполняем данные
                    previewElement.querySelector('.preview-image').src = e.target.result;
                    previewElement.querySelector('.preview-filename').textContent = file.name;
                    previewElement.querySelector('.preview-size').textContent = this.formatFileSize(file.size);

                    // Настраиваем радио-кнопку
                    const radioBtn = previewElement.querySelector('.preview-radio');
                    radioBtn.name = `preview_${fileInput.id}`;
                    radioBtn.value = index;

                    // Первый файл - превью по умолчанию
                    if (index === 0) {
                        radioBtn.checked = true;
                        this.updatePreviewIndex(index);
                    }

                    // Добавляем обработчик для радио-кнопки
                    radioBtn.addEventListener('change', (e) => {
                        if (e.target.checked) {
                            this.updatePreviewIndex(e.target.value);
                        }
                    });

                    previewContainer.appendChild(newPreview);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateFileCounter(fileInput) {
        const fileCounter = fileInput.closest('.form-group')?.querySelector('#fileCounter');
        if (fileCounter) {
            const count = fileInput.files.length;
            fileCounter.textContent = `${count} из ${this.maxFiles} файлов`;
        }
    }

    removeImage(button) {
        const previewItem = button.closest('.preview-item');
        const fileInput = previewItem.closest('.form-group')?.querySelector('input[type="file"]');

        if (fileInput) {
            const files = Array.from(fileInput.files);
            const previewIndex = Array.from(previewItem.parentElement.children).indexOf(previewItem);

            // Удаляем файл из FileList
            files.splice(previewIndex, 1);

            // Обновляем FileList
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;

            // Удаляем превью
            previewItem.remove();

            // Обновляем счетчик
            this.updateFileCounter(fileInput);

            // Сбрасываем превью если удалено выбранное
            const deletedWasPreview = document.querySelector(`input[name="preview_${fileInput.id}"]:checked`)?.value == previewIndex;
            if (deletedWasPreview && files.length > 0) {
                const firstRadio = document.querySelector(`input[name="preview_${fileInput.id}"]`);
                if (firstRadio) {
                    firstRadio.checked = true;
                    this.updatePreviewIndex(firstRadio.value);
                }
            }
        }
    }

    handlePreviewSelection(radioBtn) {
        this.updatePreviewIndex(radioBtn.value);

        // Визуальное выделение выбранного превью
        document.querySelectorAll('.preview-item').forEach(item => {
            item.classList.remove('selected');
        });
        radioBtn.closest('.preview-item').classList.add('selected');
    }

    updatePreviewIndex(index) {
        const previewIndexInput = document.getElementById('previewImageIndex');
        if (previewIndexInput) {
            previewIndexInput.value = index;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    window.imageUploadComponent = new ImageUploadComponent();
});