import { supabase, showErrorMessage } from './supabase.js';

// Константы для защиты от брутфорса
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 минут

// Разрешенные редиректы
const ALLOWED_REDIRECTS = {
    'vpn_quick': 'invite.html',
    'vpn_paid': 'faq3_vpn_serv.html',
    'personal_vpn': 'faq4_vpn_serv.html'
};

// Функции валидации
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\s]{8,}$/;
    return passwordRegex.test(password);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.custom-form');
    const messageElement = document.getElementById('login-message');
    const submitButton = form.querySelector('button[type="submit"]');

    // Проверка блокировки
    function checkLockout() {
        const lockoutEnd = sessionStorage.getItem('lockoutEnd');
        if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
            const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000 / 60);
            messageElement.textContent = `Слишком много попыток входа. Попробуйте снова через ${remainingTime} минут.`;
            return true;
        }
        return false;
    }

    // Обработка неудачного входа
    function handleLoginFailure() {
        const attempts = parseInt(sessionStorage.getItem('loginAttempts') || '0') + 1;
        sessionStorage.setItem('loginAttempts', attempts.toString());
        
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            const lockoutEndTime = Date.now() + LOCKOUT_TIME;
            sessionStorage.setItem('lockoutEnd', lockoutEndTime.toString());
        }
    }

    // Обработка формы входа
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (checkLockout()) return;

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Валидация полей
        if (!validateEmail(email)) {
            messageElement.textContent = "Введите корректный email";
            messageElement.style.color = 'red';
            return;
        }

        if (!validatePassword(password)) {
            messageElement.textContent = "Некорректный формат пароля";
            messageElement.style.color = 'red';
            return;
        }

        try {
            submitButton.disabled = true;
            
            // Попытка входа
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            // Успешный вход
            sessionStorage.setItem('loginAttempts', '0');
            messageElement.textContent = 'Успешная авторизация!';
            messageElement.style.color = 'green';

            // Обработка редиректа
            const redirectIntent = localStorage.getItem('redirectPage');
            const targetPage = ALLOWED_REDIRECTS[redirectIntent] || 'index.html';
            localStorage.removeItem('redirectPage');

            // Редирект после успешного входа
            setTimeout(() => {
                window.location.href = targetPage;
            }, 1000);

        } catch (error) {
            console.error('Login error:', error.message);
            handleLoginFailure();
            showErrorMessage();
            messageElement.textContent = 'Неверный email или пароль';
            messageElement.style.color = 'red';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Валидация полей в реальном времени
    form.addEventListener('input', function () {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        const emailValid = validateEmail(email);
        const passwordValid = validatePassword(password);
        
        // Визуальная обратная связь
        document.getElementById('login-email').style.borderColor = emailValid ? 'green' : '#ccc';
        document.getElementById('login-password').style.borderColor = passwordValid ? 'green' : '#ccc';
        
        // Активация/деактивация кнопки
        submitButton.disabled = !(emailValid && passwordValid);
        
        // Сброс сообщения об ошибке при вводе
        if (emailValid && passwordValid) {
            messageElement.textContent = '';
        }
    });
});