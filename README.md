# Django-проект сайта - портфолио для Fullstack Web-разработчика

> Полнофункциональный сайт для fullstack web-разработчика (портфолио специалиста), реализованный на **Django 5.2+** с двойной системой администрирования.

---

## Общее описание проекта

**____** — это веб-платформа, сочетающая публичную часть для клиентов и **двойную административную панель** для управления контентом. Сайт создан для мастера, изготавливающего авторских мишек Тедди вручную, и позволяет легко обновлять тексты, изображения, товары и настройки без вмешательства в код.
### Ключевые особенности
- **Двойная система администрирования** (стандартная Django + кастомная AJAX-панель)
- **Полностью динамический контент** с резервным режимом
- **Подробное аудит-логирование** всех изменений
- **Двухнедельные сессии** для удобства администраторов
- **Профессиональное логирование** с ротацией файлов
---

## Техническая реализация
### Архитектура проекта

---
``` 
portfolio-django/                 # Проект Django 5.2
├── apps/ 
│   ├── api/                          # Приложение API (RESTful API для взаимодействия с фронтендом)
│   │   ├── migrations/               # Миграции базы данных
│   │   │   └── __init__.py
│   │   ├── __init__.py               # Инициализация приложения
│   │   ├── admin.py                  # Регистрация моделей в админ-панели
│   │   ├── apps.py                   # Конфигурация приложения
│   │   ├── models.py                 # Модели данных приложения
│   │   ├── tests.py                  # Тесты (пока пусто)
│   │   └── views.py                  # Основные представления
│   ├── custom_admin/                 # Кастомная админ панель (заменяет стандартную админку Django)
│   │   ├── migrations/               # Миграции базы данных
│   │   │   └── __init__.py 
│   │   ├── static/                   # Статические файлы для всей админки
│   │   │   └── custom_admin/
│   │   │       ├── css/
│   │   │       │   ├── base.css           # Базовые стили всей админки
│   │   │       │   └── pages/             # Стили страниц админки
│   │   │       │       ├── dashboard.css  # Дашборд
│   │   │       │       ├── login.css      # 
│   │   │       │       ├── portfolio/     # Стили для раздела портфолио
│   │   │       │       │   ├── list.css   # Список проектов
│   │   │       │       │   └── form.css   # Форма проекта
│   │   │       │       └── solutions/     # Стили для раздела решений
│   │   │       │           ├── list.css   # Список решений
│   │   │       │           ├── form.css   # Форма решения
│   │   │       │           └── orders.css # Заказы
│   │   │       └── js/                    # JavaScript для админки
│   │   │           ├── admin_base.js      # Базовый скрипт админки
│   │   │           ├── components/
│   │   │           │   ├─ sidebar.js          # Скрипт Сайдбара
│   │   │           │   ├─ package_manager.js  # 
│   │   │           │   └─ image_upload.js     # Скрипт загрузки изображения
│   │   │           └── pages/              # JS для страниц админки
│   │   │               ├─ dashboard.js     # Скрипт Дашборта
│   │   │               ├─ portfolio/    # Скрипты раздела проектов
│   │   │               │  ├─ form.js    # Управление формами портфолио
│   │   │               │  └─ list.js    # Управление списком проектов
│   │   │               └─ solutions/    # Скрипт раздела решений
│   │   │                  ├─ form.js    # Управление формами решений
│   │   │                  ├─ orders.js  # Управление заказами
│   │   │                  └─ list.js    # Управление списком решений
│   │   ├── templates/         # Шаблоны ВСЕЙ админки (наследуются другими приложениями)
│   │   │   └── custom_admin/
│   │   │       │   └── includes/                        # Общие включаемые шаблоны для админки
│   │   │       │       ├── base/     # Базовые компоненты  
│   │   │       │       │   ├── header.html             # Хедер 
│   │   │       │       │   └── sidebar.html            # Сайдбар 
│   │   │       │       └── forms/    # Компоненты форм
│   │   │       │           ├── image_upload.html       # Загрузка изображений (единый компонент)
│   │   │       │           └── rich_text.html          # Текстовый редактор
│   │   │       ├── base_admin.html          # БАЗОВЫЙ шаблон ВСЕЙ админки
│   │   │       ├── dashboard.html           # Дашборд       
│   │   │       ├── login.html               # Страница входа
│   │   │       ├── portfolio/               # Шаблоны для портфолио (используют наследование)
│   │   │       │   ├── list.html            # Список проектов
│   │   │       │   ├── create.html          # Создание проекта
│   │   │       │   ├── edit.html            # Редактирование проекта
│   │   │       │   └── detail.html          # Детальная страница проекта
│   │   │       ├── solutions/               # Шаблоны для решений 
│   │   │       │   │   └── components/      # Компоненты решений
│   │   │       │   │       └── package_manager.html  # Управление пакетами решений
│   │   │       │   ├── list.html            # Список решений
│   │   │       │   ├── create.html          # Создание решения
│   │   │       │   ├── edit.html            # Редактирование решения
│   │   │       │   ├── orders.html          # Управление заказами
│   │   │       │   └── detail.html          # Детальная страница решения
│   │   │       └── settings/                # Шаблоны настроек
│   │   │           ├── about.html           # Раздел <обо мне>
│   │   │           └── contacts.html        # Радел <контакты>
│   │   ├── __init__.py               # Инициализация приложения       
│   │   ├── admin.py                  # Регистрация моделей в админ-панели
│   │   ├── apps.py                   # Конфигурация приложения
│   │   ├── models.py                 # Модели данных приложения
│   │   ├── tests.py                  # Тесты
│   │   └── views.py                  # Основные представления
│   ├── main/                         # Главное приложение для публичной части
│   │   ├── migrations/               # Миграции базы данных
│   │   │   └── __init__.py 
│   │   ├── static/                   # Статические файлы для публичной части
│   │   │   └── main/
│   │   │       ├── css/
│   │   │       │   ├── components/        # Стили компонентов для публичной части
│   │   │       │   │   ├── hero/          # Hero-секции                             
│   │   │       │   │   │   ├── base.css   # Общие стили hero                        
│   │   │       │   │   │   └── home.css   # Hero для главной                        
│   │   │       │   │   ├── about/                # Страница <Обо мне>               
│   │   │       │   │   │   ├── biography.css     # Биография                        
│   │   │       │   │   │   ├── philosophy.css    # Философия                        
│   │   │       │   │   │   ├── education.css     # Образование                      
│   │   │       │   │   │   └── technologies.css  # Технологии                       
│   │   │       │   │   ├── contact/              # Страница <Контакты>  
│   │   │       │   │   │   ├── info.css          # Информация
│   │   │       │   │   │   ├── form.css          # Форма обратной связи
│   │   │       │   │   │   └── map.css           # Карта
│   │   │       │   │   └── shared/               # Общие компоненты main
│   │   │       │   │       └── error_details.css   # Детализация ошибки
│   │   │       │   ├── pages/               # Стили страниц main (ИСПОЛЬЗУЮТ глобальные стили)
│   │   │       │   │    ├── home.css         # Главная страница (доп.стили)
│   │   │       │   │    ├── about.css        # Страница "Обо мне" (доп.стили)
│   │   │       │   │    ├── contacts.css     # Страница "Контакты" (доп.стили)
│   │   │       │   │    ├── error_pages.css  # Общие стили для страниц 403, 404 и 500
│   │   │       │   │    ├── sitemap.css      # Страница карты сайта
│   │   │       │   │    └── terms.css        # Пользовательское соглашение
│   │   │       │   └── legal/             # Общие компоненты легальной информации
│   │   │       │       └── privacy.css    # Страница Политики конфиденциальности
│   │   │       └── js/
│   │   │           ├── components/
│   │   │           │   ├── hero.js            # Скрипт для Hero                       
│   │   │           │   └── contact_form.js    # Скрипт для формы обратной связи
│   │   │           └── pages/                                              
│   │   │               ├── home.js            # Скрипт для Главной страницы           
│   │   │               ├── about.js           # Скрипт для страницы <Обо мне>       
│   │   │               └── contacts.js        # Скрипт для страницы <Контакты>  
│   │   ├── templates/                # Шаблоны публичной части
│   │   │   └── main/
│   │   │       │   ├── 403.html          # Страница 403 (Forbidden)        
│   │   │       │   ├── 404.html          # Страница 404 (Not Found)                  
│   │   │       │   ├── 500.html          # Страница 500 (Server Error)     
│   │   │       │   ├── about.html        # Страница <Обо мне>
│   │   │       │   ├── contacts.html     # Страница <Контакты>                       
│   │   │       │   ├── index.html        # Главная страница (landing)                
│   │   │       │   ├── privacy.html      # Страница политики конфиденциальности  
│   │   │       │   ├── sitemap.html      # Карта сайта
│   │   │       │   └── terms.html        # Пользовательское соглашение
│   │   │       └── components/           # Компоненты шаблонов main
│   │   │           ├── error_details.html    # Запрашиваемая страница не найдена  
│   │   │           ├── sitemap.xml           # Карта сайта для поисковиков
│   │   │           ├── about/        # Компоненты секции <Обо мне>                   
│   │   │           │   ├── biography.html      # Секция <Биография>                  
│   │   │           │   ├── education.html      # Секция <Образование>                
│   │   │           │   ├── philosophy.html     # Секция <Философия>                  
│   │   │           │   └── technologies.html   # Секция <Технологии>                 
│   │   │           ├── contact/        # Компоненты секции <Контакты>                
│   │   │           │   ├── contact_form.html   # Секция <Форма обратной связи> 
│   │   │           │   ├── contact_info.html   # Секция <Контакты> 
│   │   │           │   └── map.html            # Секция <Карта> 
│   │   │           └── shared/           # Общие компоненты main                    
│   │   │               ├── cookie_consent.html       # Окно <Используем cookie>   
│   │   │               ├── hero_section.html         # Hero - секция  
│   │   │               └── maintenance_content.html  # Контент на странице <На техническом обслуживании>
│   │   ├── templatetags/             
│   │   │   ├── __init__.py           # Инициализация пакета
│   │   │   └── main_extras.py        #      
│   │   ├── __init__.py               # Инициализация приложения       
│   │   ├── admin.py                  # Регистрация моделей в админ-панели
│   │   ├── apps.py                   # Конфигурация приложения
│   │   ├── context_processors.py     # Добавление настроек сайта в контекст всех шаблонов
│   │   ├── models.py                 # Модели данных приложения
│   │   ├── sitemaps.py               # Генерация карты сайта для поисковиков
│   │   ├── tests.py                  # Тесты (пока пусто)
│   │   ├── urls.py                   # URL маршруты main
│   │   └── views.py                  # Основные представления                 
│   ├── portfolio/                    # Приложение для портфолио (ТОЛЬКО модели и логика)
│   │   ├── migrations/               # Миграции базы данных
│   │   │   └── __init__.py 
│   │   ├── static/                   # ТОЛЬКО специфичные статические файлы портфолио
│   │   │   └── portfolio/
│   │   │       ├── css/
│   │   │       │   ├── components/                 # Уникальные компоненты портфолио
│   │   │       │   │   ├── filters.css               # Карточка проекта
│   │   │       │   │   ├── project_card.css          # Карточка проекта
│   │   │       │   │   ├── project_gallery.css       # Галерея проекта
│   │   │       │   │   ├── project_technologies.css  # Технологии проекта
│   │   │       │   │   └── project_testimonial.css   # Отзыв о проекте
│   │   │       │   └── pages/             # Стили страниц portfolio
│   │   │       │       ├── list.css       # Каталог проектов
│   │   │       │       └── detail.css     # Детальная страница
│   │   │       └── js/
│   │   │           ├── components/
│   │   │           │   ├── filters.js             # Фильтры
│   │   │           │   ├── project_gallery.js     # Галерея
│   │   │           │   ├── project_hover.js       # HOVER эффект для карточек проектов
│   │   │           │   └── technology_display.js  # Отображение технологий
│   │   │           └── pages/
│   │   │               ├── portfolio_list.js    # Скрипт для спика проектов
│   │   │               └── portfolio_detail.js  # Скрипт для страницы проекта
│   │   ├── templates/      # ТОЛЬКО уникальные шаблоны портфолио (публичные)
│   │   │   └── portfolio/
│   │   │       ├── portfolio_detail.html      # Детальная страница проекта
│   │   │       ├── portfolio_list.html        # Список проектов
│   │   │       └── components/                   # Уникальные компоненты портфолио
│   │   │           ├── filters.html               # Фильтры
│   │   │           ├── project_card.html          # Карточка проекта
│   │   │           ├── project_cards_ajax.html    # Карточка проекта AJAX
│   │   │           ├── project_gallery.html       # Галерея проекта
│   │   │           ├── project_technologies.html  # Технологии проекта
│   │   │           └── project_testimonial.html   # Отзыв об проекте
│   │   ├── __init__.py               # Инициализация приложения       
│   │   ├── admin.py                  # Регистрация моделей в админ-панели
│   │   ├── apps.py                   # Конфигурация приложения
│   │   ├── models.py                 # Модели данных приложения
│   │   ├── tests.py                  # Тесты (пока пусто)
│   │   ├── urls.py                   # URL маршруты портфолио
│   │   └── views.py                  # Основные представления
│   └── solutions/                    # Приложение для решений (ТОЛЬКО модели и логика)
│       ├── migrations/               # Миграции базы данных
│       │   └── __init__.py 
│       ├── static/                   # ТОЛЬКО специфичные статические файлы решений
│       │   └── solutions/
│       │       ├── css/
│       │       │   ├── components/        # Стили компонентов Решений
│       │       │   │   ├── faq.css                     # FAQ
│       │       │   │   ├── filters.css                 # Фильтры
│       │       │   │   ├── hero_with_search.css        # Блок-заголовок с фильтрами
│       │       │   │   ├── package_comparison.css      # Сравнение пакетов
│       │       │   │   ├── related_solutions.css       # Связанные решения  
│       │       │   │   ├── solution_card.css           # Карточка 
│       │       │   │   ├── solution_features.css       # Особенности
│       │       │   │   ├── solution_pricing.css        # Цена
│       │       │   │   └── solution_requirements.css   # Стек технологий
│       │       │   └── pages/                  # Уникальные стили страниц решений
│       │       │       ├── solution_list.css   # Доп.стили для каталога решений
│       │       │       └── detail.css          # Доп.стили для детальной страницы решения
│       │       └── js/
│       │           ├── components/
│       │           │   ├── faq_accordion.js       # Аккордеон FAQ
│       │           │   ├── package_comparison.js  # Сравнение пакетов
│       │           │   ├── solution_filter.js     # Фильтр решений
│       │           │   ├── search_handler.js      # Логика поиска решений (живой поиск)
│       │           │   └── pricing_calculator.js  # Калькулятор цен
│       │           └── pages/
│       │               ├── solution_list.js     # Скрипт для спика решений
│       │               └── solution_detail.js   # Скрипт для страницы решения
│       ├── templates/                  # Шаблоны
│       │   └── solutions/
│       │       ├── package_detail.html   # Страница детализации доп пакета к решению
│       │       ├── solution_detail.html  # Страница детализации решения
│       │       ├── solution_list.html    # Страница с карточками решений
│       │       └── components/
│       │           ├── cta.html                     # Призыв к действию
│       │           ├── faq.html                     # FAQ
│       │           ├── filters.html                 # Фильтры
│       │           ├── hero_with_search.html        # Hero-блок с поиском
│       │           ├── package_comparison.html      # Сравнение пакетов
│       │           ├── related_solutions.html       # Связанные решения
│       │           ├── solution_actions.html        # Действия
│       │           ├── solution_card.html           # Карточка решения
│       │           ├── solution_description.html    # Описание
│       │           ├── solution_features.html       # Особенности
│       │           ├── solution_hero.html           # Hero-блок решения
│       │           ├── solution_image_gallery.html  # Галерея
│       │           ├── solution_pricing.html        # Цена
│       │           └── solution_requirements.html   # Стек технологий
│       ├── __init__.py               # Инициализация приложения       
│       ├── admin.py                  # Регистрация моделей в админ-панели
│       ├── apps.py                   # Конфигурация приложения
│       ├── context_processors.py     # Добавляет данные корзины в контекст всех шаблонов
│       ├── models.py                 # Модели данных приложения
│       ├── tests.py                  # Тесты (пока пусто)
│       ├── urls.py               # URL маршруты решений
│       └── views.py                  # Основные представления 
├── portfolio_core/               # Основной проект Django (настройки, корневые URL)
│   ├── __init__.py               # Инициализация приложения       
│   ├── asgi.py                   # ASGI-конфигурация для асинхронных серверов
│   ├── settings.py               # Настройки проекта
│   ├── urls.py                   # Корневые URL-маршруты проекта
│   └── wsgi.py                   # WSGI-конфигурация для развертывания 
├── static/                       # Собранные статические файлы (collectstatic)
│   ├── css/                      # ГЛОБАЛЬНЫЕ стили (общие для всего проекта)
│   │   ├── global.css            # Загрузка глобальных стилей асинхронно
│   │   ├── critical.css          # Встраивается инлайн в head
│   │   ├── global/               # Базовые глобальные стили
│   │   │   ├── base.css          # Основные глобальные стили
│   │   │   ├── reset.css         # Сброс стилей (normalize/reset)
│   │   │   ├── typography.css    # Типографика проекта
│   │   │   ├── layout.css        # Общая разметка
│   │   │   └── variables.css     # CSS-переменные (цвета, шрифты, отступы)
│   │   └── shared/               # Общие стили для всех приложений
│   │       ├── components/       # Общие компоненты
│   │       │   ├── footer.css        # Футер
│   │       │   ├── header.css        # Хедер
│   │       │   ├── breadcrumbs.css   # Хлебные крошки
│   │       │   ├── social_links.css  # Блок социальных сетей (иконки)
│   │       │   └── messages.css      # Системные сообщения
│   │       └── modals/           # Модальные окна
│   │           ├── cookie_consent.css  # Согласие на cookies
│   │           └── base_modal.css      # Базовое модальное окно
│   ├── js/                       # ГЛОБАЛЬНЫЕ скрипты
│   │   ├── sw.js                 # SERVICE WORKER для оффлайн работы и кэширования
│   │   ├── global.js             # Основной скрипт (defer)
│   │   ├── global/               # Базовые глобальные скрипты
│   │   │   ├── main.js           # Основной скрипт инициализации
│   │   │   ├── utils/            # Утилиты
│   │   │   │   └── helpers.js    # Хелперы
│   │   │   └── components/       # Глобальные JS компоненты
│   │   │       │   └── modals/                # Управление модальными окнами
│   │   │       │       ├── cookie_consent.js  # Окно согласия на cookies
│   │   │       │       └── base_modal.js      # Базовое модальное окно
│   │   │       ├── lazy-loader.js      # Система lazy loading
│   │   │       └── header.js           # Хедер
│   └── images/                   # Графика проекта
│       ├── icon/                 # Иконки
│       ├── logo/                 # Логотип
│       ├── projects/             # Изображения для проектов (резевные при 503)
│       ├── solutions/            # Изображения для решений (резевные при 503)
│       ├── about_photo.png       # Фото специалиста (резевное при 503)
│       ├── map-marker.svg        # Точка на карте
│       ├── placeholder.jpg       # Плейсхолдер
│       └── workstation.webp      # Фото рабочего места (резевное при 503)
├── templates/                    # ГЛОБАЛЬНЫЕ шаблоны проекта
│   ├── base.html                 # Базовый шаблон сайта (наследуется всеми)
│   ├── emails/                   # Шаблоны писем
│   │   └── contact_form.html     # Письмо с формы обратной связи
│   └── includes/                 # Глобальные включаемые шаблоны
│       ├── layout/               # Компоненты layout
│       │   ├── header.html       # Глобальный хедер
│       │   ├── footer.html       # Глобальный футер
│       │   └── sidebar.html      # Боковая панель (если нужно)
│       ├── components/           # Глобальные компоненты
│       │   ├── breadcrumbs.html       # Хлебные крошки
│       │   ├── loading_spinner.html   # Индикатор загрузки
│       │   ├── messages.html          # Системные сообщения
│       │   ├── meta_tags.html         # Мета-теги
│       │   ├── pagination.html        # Пагинация
│       │   └── social_links.html      # Социальные сети
│       ├── forms/                # Глобальные компоненты форм
│       │   ├── contact_form.html      # Форма обратной связи
│       │   ├── search_form.html       # Форма поиска
│       │   ├── filter_bar.html        # Панель фильтров
│       │   └── form_actions.html      # Кнопки действий формы
│       ├── modals/               # Глобальные модальные окна
│       │   ├── base_modal.html        # Базовое модальное окно
│       │   └── cookie_consent.html    # Согласие на cookies
│       └── ui/                   # UI компоненты
│           ├── buttons/               # Кнопки
│           ├── gallery/               # Галереи
│           │   ├── image_item.html      # Изображение
│           │   ├── gallery_slider.html  # Слайдер галереи
│           │   └── image_uploader.html  # Окно загрузки изображения
│           └── states/                # Состояния
│               └── empty_state.html   # Пустое состояние
├── templatetags/                      # Темплейт теги
│   └── optimize_tags.py         #      
├── build.sh                     # Скрипт построения веб-приложения при деплое
├── manage.py                    # Точка входа Django
├── start.sh                     # Скрипт запуска веб-приложения при деплое
├── requirements.txt             # Зависимости Python
├── shema_db.png                 # Схема таблиц Базы Данных
├── render.yaml                  # Конфигурация для деплоя на Render.com
└── README.md                    # Документация

```
---

### Двойная система администрирования

| Тип админки | URL | Особенности | Назначение |
|-------------|-----|-------------|------------|
| **Стандартная Django + Jazzmin** | `/panel/` | Полный CRUD, все модели, расширенный интерфейс | Полное управление всеми данными |
| **Кастомная AJAX-панель** | `/admin-custom/panel/` | Быстрое редактирование, AJAX, фокус на основных элементах | Повседневное редактирование контента |

### Доступ к админ-панелям:
1. **Кастомный вход**: `/admin-custom/enter/` → `/admin-custom/panel/`
2. **Стандартный вход**: `/panel/` (стандартная Django авторизация)
3. **Совместимость**: Старая ссылка `/enter-admin-panel/` перенаправляет на кастомную админку

---

## Основные характеристики



## Установка и запуск

1. Клонируйте репозиторий:

   <span style="color: red;">_git clone https://github.com/fesik-evgenya/portfolio-django.git_</span>

   <span style="color: red;">_cd teddys_tale_</span>
2. Установите зависимости:

   <span style="color: red;">_pip install -r requirements.txt_</span>
3. Создайте и настройте файл .env (как описано ниже)

4. Примените миграции:

   <span style="color: red;">_python manage.py migrate_</span>

5. Создайте суперпользователя:

   <span style="color: red;">_python manage.py createsuperuser_</span>

6. Запустите сервер:

   <span style="color: red;">_python manage.py runserver_</span>

<span style="color: red;">Стандартная админ-панель будет доступна по адресу: http://127.0.0.1:8000/panel/</span>.
<span style="color: red;">Кастомная AJAX-админка будет доступна по адресу: http://127.0.0.1:8000/admin-custom/enter/</span>.

## Настройка переменных окружения (.env)

Перед запуском проекта необходимо создать файл `.env` в корневой директории проекта и настроить переменные окружения. Для удобства создайте файл на основе шаблона:

1. **Создайте файл `.env` в корне проекта:**
Заполните его необходимыми значениями. 
2. Пример минимальной конфигурации для разработки:

```
env
# ====================
# ОСНОВНЫЕ НАСТРОЙКИ DJANGO
# ====================

# СЕКРЕТНЫЙ КЛЮЧ DJANGO (обязательно измените в продакшене!)
DJANGO_SECRET_KEY=Your_Secret_Key

# Режим отладки (True - разработка, False - продакшен)
DJANGO_DEBUG=True

# Разрешенные хосты (через запятую)
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

# ====================
# БАЗА ДАННЫХ
# ====================

# SQLite (по умолчанию для разработки)
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# PostgreSQL (раскомментировать для продакшена)
# DATABASE_URL=postgresql://пользователь:пароль@хост:порт/название_бд
# DATABASE_ENGINE=django.db.backends.postgresql
# DATABASE_NAME=teddystale_db
# DATABASE_USER=postgres_user
# DATABASE_PASSWORD=очень_сложный_пароль_тут
# DATABASE_HOST=localhost
# DATABASE_PORT=5432

# ====================
# БЕЗОПАСНОСТЬ
# ====================

# CSRF (межсайтовая защита)
CSRF_COOKIE_SECURE=False  # True для HTTPS
CSRF_TRUSTED_ORIGINS=http://127.0.0.1:8000,http://localhost:8000

# Сессии
SESSION_COOKIE_SECURE=False  # True для HTTPS
SESSION_COOKIE_AGE=1209600  # 2 недели в секундах

# ====================
# ПУТИ К ФАЙЛАМ
# ====================

# Пути для медиа и статических файлов
MEDIA_ROOT=media
STATIC_ROOT=staticfiles

# ====================
# ЛОГИРОВАНИЕ
# ====================

# Уровень логирования (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=DEBUG

# Максимальный размер лог-файла (в байтах)
LOG_MAX_BYTES=1048576  # 1MB

# Количество резервных копий логов
LOG_BACKUP_COUNT=3

# ====================
# ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ
# ====================

# Временная зона
TIME_ZONE=Europe/Moscow

# Язык
LANGUAGE_CODE=ru-RU

# Email настройки (для будущего использования)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=ваш_email@gmail.com
# EMAIL_HOST_PASSWORD=пароль_приложения
# DEFAULT_FROM_EMAIL=Teddy's Tale <ваш_email@gmail.com>

# ====================
# РЕЖИМ ПРОДАКШЕНА (раскомментировать при развертывании)
# ====================

# SECURE_SSL_REDIRECT=True  # Перенаправление на HTTPS
# SECURE_HSTS_SECONDS=31536000  # HSTS на год
# SECURE_HSTS_INCLUDE_SUBDOMAINS=True
# SECURE_HSTS_PRELOAD=True
# SECURE_CONTENT_TYPE_NOSNIFF=True
# SECURE_BROWSER_XSS_FILTER=True
# X_FRAME_OPTIONS=DENY

# ====================
# API КЛЮЧИ
# ====================
YANDEX_MAPS_API_KEY=Your_Secret_Key

```
### Контакты
Проект разработан для мастера авторских мишек Тедди.
По вопросам настройки и доработки обращайтесь к разработчику: 
<span style="color: green;">ganef85@mail.ru</span>

### Версия и статус
Версия: 1.0 
Статус: __В разработке__