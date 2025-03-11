import { supabase, showErrorMessage } from './supabase.js';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#reset-form');
    const messageElement = document.getElementById('reset-message');
    const submitButton = form.querySelector('button[type="submit"]');

    // Функция валидации email
    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
        return emailRegex.test(email);
    }

    // Обработка формы сброса пароля
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('reset-email').value.trim();

        // Валидация email
        if (!validateEmail(email)) {
            messageElement.textContent = "Введите корректный email";
            messageElement.style.color = 'red';
            return;
        }

        try {
            submitButton.disabled = true;
            
            // Отправка запроса на сброс пароля
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/password-update.html`,
            });

            if (error) throw error;

            // Успешная отправка
            messageElement.textContent = 'Инструкции по сбросу пароля отправлены на ваш email';
            messageElement.style.color = 'green';

            // Очистка формы
            form.reset();

        } catch (error) {
            console.error('Password reset error:', error.message);
            showErrorMessage();
            messageElement.textContent = 'Ошибка при отправке запроса на сброс пароля';
            messageElement.style.color = 'red';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Валидация email в реальном времени
    const emailInput = document.getElementById('reset-email');
    emailInput.addEventListener('input', function () {
        const email = this.value.trim();
        const isValid = validateEmail(email);
        
        // Визуальная обратная связь
        this.style.borderColor = isValid ? 'green' : '#ccc';
        
        // Активация/деактивация кнопки
        submitButton.disabled = !isValid;
        
        // Сброс сообщения об ошибке при вводе
        if (isValid) {
            messageElement.textContent = '';
        }
    });
});