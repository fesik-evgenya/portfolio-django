/**
 * COOKIE CONSENT MODAL FUNCTIONALITY
 * Управление окном согласия на cookies
 */

document.addEventListener('DOMContentLoaded', function() {
    const cookiesModal = document.getElementById('cookiesModal');
    const acceptCookiesBtn = document.getElementById('acceptCookies');

    // Проверяем, было ли уже принято соглашение
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');

    if (!cookiesAccepted) {
        // Показываем модальное окно с задержкой для лучшего UX
        setTimeout(() => {
            if (cookiesModal) {
                cookiesModal.classList.add('active');
            }
        }, 1000);
    }

    // Обработчик принятия cookies
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', function() {
            // Сохраняем согласие в localStorage
            localStorage.setItem('cookiesAccepted', 'true');

            // Скрываем модальное окно
            if (cookiesModal) {
                cookiesModal.classList.remove('active');

                // Добавляем анимацию исчезновения
                setTimeout(() => {
                    cookiesModal.style.display = 'none';
                }, 500);
            }

            // Здесь потом можно добавить логику инициализации аналитики
            console.log('Cookies accepted - analytics can be initialized');
        });
    }

    // Закрытие по клику вне модального окна
    if (cookiesModal) {
        cookiesModal.addEventListener('click', function(e) {
            if (e.target === cookiesModal) {
                cookiesModal.classList.remove('active');
            }
        });
    }
});