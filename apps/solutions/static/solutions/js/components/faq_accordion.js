/**
 * JavaScript для FAQ аккордеона
 */

class FAQAccordion {
    constructor() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.init();
    }

    init() {
        this.setupAccordion();
        this.setupSearch();
        console.log('FAQ accordion initialized');
    }

    setupAccordion() {
        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            question.addEventListener('click', () => {
                this.toggleItem(item);
            });

            // Открываем первый элемент по умолчанию
            if (item === this.faqItems[0]) {
                this.openItem(item);
            }
        });

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllItems();
            }
        });
    }

    toggleItem(item) {
        const isOpen = item.classList.contains('open');

        if (isOpen) {
            this.closeItem(item);
        } else {
            this.openItem(item);
        }
    }

    openItem(item) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('.faq-icon');

        // Закрываем все остальные элементы
        this.closeAllItems();

        // Открываем текущий
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';

        // Анимация иконки
        if (icon) {
            icon.style.transform = 'rotate(45deg)';
        }

        // Прокрутка к элементу если он частично скрыт
        const rect = item.getBoundingClientRect();
        if (rect.top < 100) {
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Сохраняем в историю браузера
        const faqId = item.getAttribute('data-faq-id');
        if (faqId) {
            history.pushState(null, null, `#faq-${faqId}`);
        }
    }

    closeItem(item) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('.faq-icon');

        item.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
        answer.classList.remove('open');
        answer.style.maxHeight = '0';

        if (icon) {
            icon.style.transform = 'rotate(0deg)';
        }

        // Очищаем хэш если закрыли все
        if (!document.querySelector('.faq-item.open')) {
            history.pushState(null, null, window.location.pathname);
        }
    }

    closeAllItems() {
        this.faqItems.forEach(item => {
            this.closeItem(item);
        });
    }

    setupSearch() {
        // Создаем поле поиска если FAQ много
        if (this.faqItems.length > 5) {
            this.createSearchBox();
        }
    }

    createSearchBox() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'faq-search-container';
        searchContainer.innerHTML = `
            <input type="text" 
                   class="faq-search-input" 
                   placeholder="Поиск по вопросам..."
                   aria-label="Поиск по вопросам">
            <button class="faq-search-clear" aria-label="Очистить поиск">×</button>
        `;

        const faqSection = document.querySelector('.faq-section');
        if (faqSection) {
            const title = faqSection.querySelector('h2');
            if (title) {
                title.parentNode.insertBefore(searchContainer, title.nextSibling);
            }
        }

        const searchInput = searchContainer.querySelector('.faq-search-input');
        const clearButton = searchContainer.querySelector('.faq-search-clear');

        searchInput.addEventListener('input', (e) => {
            this.filterFAQ(e.target.value);

            // Показываем/скрываем кнопку очистки
            if (e.target.value) {
                clearButton.style.display = 'block';
            } else {
                clearButton.style.display = 'none';
            }
        });

        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            this.filterFAQ('');
            clearButton.style.display = 'none';
            searchInput.focus();
        });

        // Стили для поиска
        searchContainer.style.cssText = `
            margin-bottom: 1.5rem;
            position: relative;
        `;

        searchInput.style.cssText = `
            width: 100%;
            padding: 0.75rem 2.5rem 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            color: var(--white);
            font-size: 1rem;
        `;

        clearButton.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: var(--light-gray);
            font-size: 1.5rem;
            cursor: pointer;
            display: none;
        `;

        clearButton.addEventListener('mouseenter', () => {
            clearButton.style.color = 'var(--accent-purple)';
        });

        clearButton.addEventListener('mouseleave', () => {
            clearButton.style.color = 'var(--light-gray)';
        });
    }

    filterFAQ(searchTerm) {
        const term = searchTerm.toLowerCase().trim();

        this.faqItems.forEach(item => {
            const question = item.querySelector('.faq-question span');
            const answer = item.querySelector('.faq-content');

            if (!question || !answer) return;

            const questionText = question.textContent.toLowerCase();
            const answerText = answer.textContent.toLowerCase();

            const matches = questionText.includes(term) || answerText.includes(term);

            if (matches) {
                item.style.display = 'block';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';

                // Подсветка совпадений
                if (term) {
                    this.highlightText(question, term);
                    this.highlightText(answer, term);
                } else {
                    this.removeHighlights(question);
                    this.removeHighlights(answer);
                }
            } else {
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.transform = 'translateY(-10px)';
            }
        });

        // Показываем сообщение если ничего не найдено
        const visibleItems = Array.from(this.faqItems).filter(item =>
            item.style.display !== 'none'
        );

        const noResults = document.querySelector('.faq-no-results');
        if (visibleItems.length === 0 && term) {
            if (!noResults) {
                const noResultsEl = document.createElement('div');
                noResultsEl.className = 'faq-no-results';
                noResultsEl.textContent = 'Ничего не найдено. Попробуйте другие слова.';
                noResultsEl.style.cssText = `
                    text-align: center;
                    padding: 2rem;
                    color: var(--light-gray);
                `;

                const accordion = document.querySelector('.faq-accordion');
                if (accordion) {
                    accordion.appendChild(noResultsEl);
                }
            }
        } else if (noResults) {
            noResults.remove();
        }
    }

    highlightText(element, term) {
        this.removeHighlights(element);

        const regex = new RegExp(`(${term})`, 'gi');
        const html = element.innerHTML;

        if (regex.test(html)) {
            element.innerHTML = html.replace(regex, '<mark class="faq-highlight">$1</mark>');

            // Добавляем стили для подсветки
            if (!document.querySelector('#faq-highlight-style')) {
                const style = document.createElement('style');
                style.id = 'faq-highlight-style';
                style.textContent = `
                    .faq-highlight {
                        background-color: rgba(138, 43, 226, 0.3);
                        color: var(--accent-purple);
                        padding: 0 2px;
                        border-radius: 2px;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }

    removeHighlights(element) {
        const marks = element.querySelectorAll('.faq-highlight');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    window.faqAccordion = new FAQAccordion();

    // Открываем FAQ из хэша URL
    const hash = window.location.hash;
    if (hash && hash.startsWith('#faq-')) {
        const faqId = hash.replace('#faq-', '');
        const targetItem = document.querySelector(`.faq-item[data-faq-id="${faqId}"]`);
        if (targetItem && window.faqAccordion) {
            setTimeout(() => {
                window.faqAccordion.openItem(targetItem);
            }, 100);
        }
    }
});