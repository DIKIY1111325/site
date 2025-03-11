import { supabase, showErrorMessage } from './supabase.js';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('#update-password-form');
    const messageElement = document.getElementById('update-message');
    const submitButton = form.querySelector('button[type="submit"]');

    // Функция валидации пароля
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    }

    // Обработка формы обновления пароля
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Проверка совпадения паролей
        if (newPassword !== confirmPassword) {
            messageElement.textContent = 'Пароли не совпадают';
            messageElement.style.color = 'red';
            return;
        }

        // Валидация пароля
        if (!validatePassword(newPassword)) {
            messageElement.textContent = 'Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы и цифры';
            messageElement.style.color = 'red';
            return;
        }

        try {
            submitButton.disabled = true;
            
            // Обновление пароля
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            // Успешное обновление
            messageElement.textContent = 'Пароль успешно обновлен';
            messageElement.style.color = 'green';

            // Редирект на страницу входа через 3 секунды
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Password update error:', error.message);
            showErrorMessage();
            messageElement.textContent = 'Ошибка при обновлении пароля';
            messageElement.style.color = 'red';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Валидация в реальном времени
    const passwordInputs =