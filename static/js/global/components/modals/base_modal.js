/**
 * BASE MODAL COMPONENT FUNCTIONALITY
 * Управление базовыми модальными окнами
 */

class ModalManager {
    constructor() {
        this.modals = new Map();
        this.init();
    }

    init() {
        // Находим все модальные окна
        document.querySelectorAll('.modal').forEach(modal => {
            const modalId = modal.id || `modal-${Date.now()}`;
            if (!modal.id) modal.id = modalId;
            this.modals.set(modalId, modal);

            // Закрытие по клику на оверлей
            const overlay = modal.querySelector('.modal__overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.closeModal(modalId));
            }

            // Закрытие по клику на крестик
            const closeBtn = modal.querySelector('.modal__close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modalId));
            }

            // Закрытие по Escape
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    this.closeModal(modalId);
                }
            });
        });
    }

    openModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Фокус на модальном окне
            setTimeout(() => {
                modal.focus();
            }, 100);
        }
    }

    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    toggleModal(modalId) {
        const modal = this.modals.get(modalId);
        if (modal) {
            if (modal.classList.contains('active')) {
                this.closeModal(modalId);
            } else {
                this.openModal(modalId);
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();

    // Глобальные обработчики для открытия модальных окон
    document.querySelectorAll('[data-modal-open]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal-open');
            window.modalManager.openModal(modalId);
        });
    });

    document.querySelectorAll('[data-modal-close]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = button.getAttribute('data-modal-close');
            window.modalManager.closeModal(modalId);
        });
    });
});