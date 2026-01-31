/**
 * Логика обработки формы обратной связи
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
});

function initializeContactForm() {
    const form = document.getElementById('contact-form');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        setButtonLoadingState(submitBtn, true);

        try {
            const response = await submitFormData(new FormData(form));

            if (response.success) {
                showSuccessModal(response.message || 'Сообщение отправлено!');
                form.reset();
            } else {
                showError(response.message || 'Произошла ошибка при отправке');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            showError('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
        } finally {
            setButtonLoadingState(submitBtn, false, originalText);
        }
    });
}

async function submitFormData(formData) {
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    const response = await fetch('/api/contact/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

function setButtonLoadingState(button, isLoading, originalText = null) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Отправка...';
    } else {
        button.disabled = false;
        button.textContent = originalText || 'Отправить';
    }
}