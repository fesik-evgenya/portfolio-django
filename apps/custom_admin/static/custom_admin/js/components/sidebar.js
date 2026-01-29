/*
   SIDEBAR COMPONENT - Django Version
 */

class AdminSidebar {
    constructor() {
        this.sidebar = document.getElementById('adminSidebar');
        this.toggleBtn = document.getElementById('sidebarToggle');
        this.isCollapsed = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedState();
        this.setupResizeHandler();
        console.log('Sidebar initialized');
    }

    setupEventListeners() {
        // Кнопка переключения сайдбара
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }

        // Раскрытие/сворачивание подменю
        document.querySelectorAll('.nav-link').forEach(link => {
            const parentItem = link.closest('.nav-item');
            if (parentItem.querySelector('.nav-submenu')) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) return;
                    e.preventDefault();
                    this.toggleSubmenu(parentItem);
                });
            }
        });

        // Закрытие сайдбара при клике вне на мобильных
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 768) return;

            if (this.sidebar.classList.contains('show') &&
                !this.sidebar.contains(e.target) &&
                !e.target.closest('.sidebar-toggle')) {
                this.hide();
            }
        });
    }

    toggle() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.toggle('show');
        } else {
            this.isCollapsed = !this.isCollapsed;
            this.updateSidebarState();
            this.saveState();
        }
    }

    show() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('show');
        } else {
            this.isCollapsed = false;
            this.updateSidebarState();
            this.saveState();
        }
    }

    hide() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('show');
        } else {
            this.isCollapsed = true;
            this.updateSidebarState();
            this.saveState();
        }
    }

    updateSidebarState() {
        if (!this.sidebar) return;

        if (this.isCollapsed) {
            this.sidebar.style.width = 'var(--sidebar-collapsed-width)';
            document.querySelector('.admin-main-wrapper').style.marginLeft = 'var(--sidebar-collapsed-width)';
            this.sidebar.classList.add('collapsed');

            // Скрываем текст и подменю
            document.querySelectorAll('.nav-text').forEach(text => {
                text.style.opacity = '0';
                text.style.width = '0';
            });

            document.querySelectorAll('.nav-submenu').forEach(submenu => {
                submenu.style.display = 'none';
            });
        } else {
            this.sidebar.style.width = 'var(--sidebar-width)';
            document.querySelector('.admin-main-wrapper').style.marginLeft = 'var(--sidebar-width)';
            this.sidebar.classList.remove('collapsed');

            // Показываем текст
            document.querySelectorAll('.nav-text').forEach(text => {
                text.style.opacity = '1';
                text.style.width = 'auto';
            });
        }
    }

    toggleSubmenu(parentItem) {
        const submenu = parentItem.querySelector('.nav-submenu');
        if (!submenu) return;

        const isActive = parentItem.classList.contains('active');

        // Закрываем все другие подменю
        document.querySelectorAll('.nav-item.active').forEach(item => {
            if (item !== parentItem) {
                item.classList.remove('active');
                item.querySelector('.nav-submenu').style.display = 'none';
            }
        });

        if (!isActive) {
            parentItem.classList.add('active');
            submenu.style.display = 'block';

            // Плавная анимация
            submenu.style.maxHeight = '0';
            setTimeout(() => {
                submenu.style.maxHeight = submenu.scrollHeight + 'px';
            }, 10);
        } else {
            parentItem.classList.remove('active');
            submenu.style.maxHeight = '0';
            setTimeout(() => {
                submenu.style.display = 'none';
            }, 300);
        }
    }

    loadSavedState() {
        if (window.innerWidth <= 768) return;

        const savedState = localStorage.getItem('admin_sidebar_collapsed');
        if (savedState !== null) {
            this.isCollapsed = savedState === 'true';
            this.updateSidebarState();
        }
    }

    saveState() {
        if (window.innerWidth <= 768) return;
        localStorage.setItem('admin_sidebar_collapsed', this.isCollapsed);
    }

    setupResizeHandler() {
        let resizeTimeout;

        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        };

        window.addEventListener('resize', handleResize);
        this.handleResize(); // Инициализация при загрузке
    }

    handleResize() {
        if (window.innerWidth <= 768) {
            // Мобильный режим
            this.sidebar.style.width = '280px';
            this.sidebar.classList.remove('collapsed');
            document.querySelector('.admin-main-wrapper').style.marginLeft = '0';

            // Показываем весь текст
            document.querySelectorAll('.nav-text').forEach(text => {
                text.style.opacity = '1';
                text.style.width = 'auto';
            });

            // Скрываем сайдбар по умолчанию на мобильных
            if (!this.sidebar.classList.contains('show')) {
                this.sidebar.style.transform = 'translateX(-100%)';
            }
        } else {
            // Десктоп режим
            this.sidebar.style.transform = 'translateX(0)';
            this.updateSidebarState();
        }
    }

    // Обновление бейджа уведомлений в сайдбаре
    updateNotificationBadge(count) {
        const badge = document.querySelector('.nav-badge');
        if (!badge) return;

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // Активация текущего пункта меню
    activateCurrentMenuItem() {
        const currentPath = window.location.pathname;
        let activeFound = false;

        document.querySelectorAll('.nav-link').forEach(link => {
            const parentItem = link.closest('.nav-item');
            const href = link.getAttribute('href');

            if (href === currentPath || currentPath.startsWith(href)) {
                parentItem.classList.add('active');
                activeFound = true;

                // Раскрываем родительское меню если есть
                const parentSubmenu = parentItem.closest('.nav-submenu');
                if (parentSubmenu) {
                    const parentListItem = parentSubmenu.closest('.nav-item');
                    if (parentListItem) {
                        parentListItem.classList.add('active');
                        parentSubmenu.style.display = 'block';
                    }
                }
            } else {
                parentItem.classList.remove('active');
            }
        });

        // Если не нашли точное совпадение, ищем по части пути
        if (!activeFound) {
            const pathParts = currentPath.split('/').filter(p => p);
            let bestMatch = null;
            let bestMatchLength = 0;

            document.querySelectorAll('.nav-link').forEach(link => {
                const href = link.getAttribute('href');
                if (href === '/' || !href) return;

                const hrefParts = href.split('/').filter(p => p);
                let matchLength = 0;

                for (let i = 0; i < Math.min(pathParts.length, hrefParts.length); i++) {
                    if (pathParts[i] === hrefParts[i]) {
                        matchLength++;
                    } else {
                        break;
                    }
                }

                if (matchLength > bestMatchLength) {
                    bestMatchLength = matchLength;
                    bestMatch = link;
                }
            });

            if (bestMatch && bestMatchLength > 0) {
                const parentItem = bestMatch.closest('.nav-item');
                parentItem.classList.add('active');
            }
        }
    }

    // Деструктор
    destroy() {
        if (this.toggleBtn) {
            this.toggleBtn.removeEventListener('click', () => this.toggle());
        }

        document.querySelectorAll('.nav-link').forEach(link => {
            link.removeEventListener('click', (e) => {
                const parentItem = link.closest('.nav-item');
                if (parentItem.querySelector('.nav-submenu')) {
                    e.preventDefault();
                    this.toggleSubmenu(parentItem);
                }
            });
        });
    }
}

// Инициализация сайдбара
document.addEventListener('DOMContentLoaded', () => {
    window.adminSidebar = new AdminSidebar();

    // Активация текущего пункта меню
    adminSidebar.activateCurrentMenuItem();

    // Загрузка уведомлений
    if (window.adminPanel) {
        window.adminPanel.loadNotifications();
    }
});

// Глобальные функции
window.toggleSidebar = () => {
    return window.adminSidebar?.toggle();
};

window.showSidebar = () => {
    return window.adminSidebar?.show();
};

window.hideSidebar = () => {
    return window.adminSidebar?.hide();
};