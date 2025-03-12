// Импорт менеджера аутентификации
import authManager from './auth.js';

// Объявление основных функций
const showMessage = (message, isError = false) => {
    const messageElement = document.getElementById('login-message');
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.style.display = 'block';
};

const clearMessage = () => {
    const messageElement = document.getElementById('login-message');
    messageElement.style.display = 'none';
    messageElement.textContent = '';
};

const toggleLoadingState = (isLoading) => {
    const elements = ['login-submit', 'login-email', 'login-password', 'remember-me'];
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.disabled = isLoading;
            if (id === 'login-submit') {
                element.innerHTML = isLoading ? '<span class="spinner"></span> Вход...' : 'Войти';
            }
        }
    });
};

const handleNetworkError = (error) => {
    console.error('Network error:', error);
    showMessage('Проблема с подключением к серверу. Проверьте интернет-соединение.', true);
};

// Основной обработчик загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов формы
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const passwordToggle = document.getElementById('toggle-password');

    // Обработчик переключения видимости пароля
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            passwordToggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
	    // Валидация email в реальном времени
    emailInput?.addEventListener('input', () => {
        const email = emailInput.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        emailInput.style.borderColor = email ? (isValid ? 'green' : 'red') : '#ccc';
    });

    // Валидация пароля в реальном времени
    passwordInput?.addEventListener('input', () => {
        const password = passwordInput.value;
        const isValid = authManager.validatePassword(password);
        passwordInput.style.borderColor = password ? (isValid ? 'green' : 'red') : '#ccc';
    });

    // Функции для работы с email
    const saveLastUsedEmail = (email) => {
        if (rememberMeCheckbox.checked) {
            localStorage.setItem('lastUsedEmail', email);
        } else {
            localStorage.removeItem('lastUsedEmail');
        }
    };

    const restoreLastUsedEmail = () => {
        const savedEmail = localStorage.getItem('lastUsedEmail');
        if (savedEmail && emailInput) {
            emailInput.value = savedEmail;
            rememberMeCheckbox.checked = true;
        }
    };

    // Таймер неактивности
    const resetInactivityTimer = () => {
        if (window.inactivityTimeout) {
            clearTimeout(window.inactivityTimeout);
        }
        window.inactivityTimeout = setTimeout(() => {
            if (authManager.isAuthenticated()) {
                authManager.logout();
                showMessage('Сессия завершена из-за неактивности', true);
            }
        }, 30 * 60 * 1000); // 30 минут
    };

    // Отслеживание активности пользователя
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, resetInactivityTimer);
    });

    // Валидация полей
    const getValidationErrors = (email, password) => {
        const errors = [];
        
        if (!email) {
            errors.push('Email обязателен');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Некорректный формат email');
        }

        if (!password) {
            errors.push('Пароль обязателен');
        } else if (!authManager.validatePassword(password)) {
            errors.push('Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры и специальные символы');
        }

        return errors;
    };
	    // Обработка формы входа
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const email = emailInput?.value.trim();
        const password = passwordInput?.value;
        const remember = rememberMeCheckbox?.checked || false;

        // Проверка валидации
        const errors = getValidationErrors(email, password);
        if (errors.length > 0) {
            showMessage(errors.join('\n'), true);
            return;
        }

        try {
            toggleLoadingState(true);

            // Проверка ограничений на попытки входа
            await authManager.canAttemptLogin(email);

            // Попытка входа
            const result = await authManager.login(email, password, remember);

            if (!result.success) {
                await authManager.handleFailedLogin(email);
                throw new Error(result.error || 'Ошибка входа');
            }

            // Обработка успешного входа
            saveLastUsedEmail(email);
            await updateSecurityMetrics(email, true);
            showMessage('Вход выполнен успешно!');
            
            // Задержка перед редиректом
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            await updateSecurityMetrics(email, false);
            if (error.name === 'NetworkError' || !navigator.onLine) {
                handleNetworkError(error);
            } else {
                showMessage(error.message, true);
            }
        } finally {
            toggleLoadingState(false);
        }
    });

    // Метрики безопасности
    const updateSecurityMetrics = async (email, success) => {
        try {
            const metrics = JSON.parse(localStorage.getItem('security_metrics') || '{}');
            const today = new Date().toISOString().split('T')[0];
            
            if (!metrics[today]) {
                metrics[today] = { attempts: 0, successes: 0, failures: 0 };
            }

            metrics[today].attempts++;
            if (success) {
                metrics[today].successes++;
            } else {
                metrics[today].failures++;
            }

            localStorage.setItem('security_metrics', JSON.stringify(metrics));
        } catch (error) {
            console.error('Error updating security metrics:', error);
        }
    };

    // Инициализация страницы
    const initializePage = () => {
        restoreLastUsedEmail();
        resetInactivityTimer();
        
        // Проверка предыдущей сессии
        if (authManager.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }

        // Проверка параметров URL для сообщений
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        if (message) {
            showMessage(decodeURIComponent(message), 
                       urlParams.get('error') === 'true');
        }
    };

    // Инициализация всех обработчиков и настроек
    initializePage();

    // Очистка при выходе со страницы
    window.addEventListener('beforeunload', () => {
        if (window.inactivityTimeout) {
            clearTimeout(window.inactivityTimeout);
        }
    });
});

	
