// Импорт необходимых зависимостей
import authManager from './auth.js';
import { supabaseClient } from './supabase.js';

// Основные функции для отображения сообщений и состояния загрузки
const showMessage = (message, isError = false) => {
    const messageElement = document.getElementById('login-message');
    messageElement.textContent = message;
    messageElement.style.color = isError ? 'red' : 'green';
    messageElement.style.display = 'block';
};

// Инициализация Supabase клиента
const supabaseUrl = 'https://aws-0-ap-south-1.pooler.supabase.com:5432';  // Хост и порт
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const clearMessage = () => {
    const messageElement = document.getElementById('login-message');
    messageElement.style.display = 'none';
    messageElement.textContent = '';
};

const { createClient } = supabase;

const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY';

const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Проверяем подключение
(async () => {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*');

    if (error) {
        console.error('Ошибка подключения:', error);
    } else {
        console.log('Данные:', data);
    }
})();


// Проверяем подключение
(async () => {
    const { data, error } = await supabaseClient
        .from('users')
        .select('*');

    if (error) {
        console.error('Ошибка подключения:', error);
    } else {
        console.log('Данные:', data);
    }
})();


const toggleLoadingState = (isLoading) => {
    const elements = ['login-submit', 'login-email', 'login-password'];
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

// Функции для работы с локальным хранилищем
const saveLastUsedEmail = (email, remember) => {
    if (remember) {
        localStorage.setItem('lastUsedEmail', email);
    } else {
        localStorage.removeItem('lastUsedEmail');
    }
};

const restoreLastUsedEmail = (emailInput) => {
    const savedEmail = localStorage.getItem('lastUsedEmail');
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        const rememberCheckbox = document.getElementById('remember-me');
        if (rememberCheckbox) {
            rememberCheckbox.checked = true;
        }
    }
};

// Валидация данных формы
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        return { isValid: false, message: 'Email обязателен' };
    }
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Некорректный формат email' };
    }
    return { isValid: true };
};

const validatePassword = (password) => {
    if (!password) {
        return { isValid: false, message: 'Пароль обязателен' };
    }
    if (password.length < 8) {
        return { isValid: false, message: 'Пароль должен быть не менее 8 символов' };
    }
    return { isValid: true };
};

// Настройка таймера неактивности
const setupInactivityTimer = () => {
    let inactivityTimeout;

    const resetTimer = () => {
        if (inactivityTimeout) {
            clearTimeout(inactivityTimeout);
        }
        inactivityTimeout = setTimeout(() => {
            if (authManager.isAuthenticated()) {
                authManager.logout();
                showMessage('Сессия завершена из-за неактивности', true);
            }
        }, 30 * 60 * 1000); // 30 минут
    };

    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });

    resetTimer();
    return () => {
        if (inactivityTimeout) {
            clearTimeout(inactivityTimeout);
        }
    };
};
// Обработка формы входа и инициализация страницы
document.addEventListener('DOMContentLoaded', () => {
    // Получение элементов формы
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const rememberMeCheckbox = document.getElementById('remember-me');

    // Настройка переключателя видимости пароля
    const setupPasswordToggle = () => {
        const passwordToggle = document.getElementById('toggle-password');
        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                passwordToggle.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
            });
        }
    };

    // Настройка валидации в реальном времени
    const setupRealTimeValidation = () => {
        emailInput?.addEventListener('input', () => {
            const email = emailInput.value.trim();
            const { isValid } = validateEmail(email);
            emailInput.style.borderColor = email ? (isValid ? 'green' : 'red') : '#ccc';
        });

        passwordInput?.addEventListener('input', () => {
            const password = passwordInput.value;
            const { isValid } = validatePassword(password);
            passwordInput.style.borderColor = password ? (isValid ? 'green' : 'red') : '#ccc';
        });
    };

    // Обновление метрик безопасности
    const updateSecurityMetrics = async (email, success) => {
        try {
            const metrics = JSON.parse(localStorage.getItem('security_metrics') || '{}');
            const today = new Date().toISOString().split('T')[0];
            
            if (!metrics[today]) {
                metrics[today] = { attempts: 0, successes: 0, failures: 0 };
            }

            metrics[today].attempts++;
            metrics[today][success ? 'successes' : 'failures']++;

            localStorage.setItem('security_metrics', JSON.stringify(metrics));
        } catch (error) {
            console.error('Error updating security metrics:', error);
        }
    };

    // Проверка подписки пользователя
    const checkUserSubscription = async (userId) => {
        try {
            const { data: subscription, error } = await supabaseClient
                .from('subscriptions')
                .select('status, plan')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return subscription;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return null;
        }
    };

    // Определение страницы для перенаправления
    const getRedirectPage = (subscription) => {
        if (document.referrer.includes('invite.html')) {
            return 'vpn_client.html';
        }
        
        if (subscription?.status === 'active') {
            return 'dashboard.html';
        }
        
        return 'subscription.html';
    };

    // Инициализация страницы
    const initializePage = () => {
        setupPasswordToggle();
        setupRealTimeValidation();
        restoreLastUsedEmail(emailInput);
        const cleanup = setupInactivityTimer();

        // Проверка текущей сессии
        if (authManager.isAuthenticated()) {
            window.location.href = 'dashboard.html';
            return;
        }

        return cleanup;
    };
	    // Обработчик отправки формы
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessage();

        const email = emailInput?.value.trim();
        const password = passwordInput?.value;
        const remember = rememberMeCheckbox?.checked || false;

        // Валидация формы
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        if (!emailValidation.isValid) {
            showMessage(emailValidation.message, true);
            return;
        }

        if (!passwordValidation.isValid) {
            showMessage(passwordValidation.message, true);
            return;
        }

        try {
            toggleLoadingState(true);

            // Проверка ограничений на попытки входа
            const canAttempt = await authManager.canAttemptLogin(email);
            if (!canAttempt) {
                throw new Error('Слишком много попыток входа. Попробуйте позже.');
            }

            // Попытка входа
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                await authManager.handleFailedLogin(email);
                throw error;
            }

            // Сохранение email если выбрано "запомнить меня"
            saveLastUsedEmail(email, remember);

            // Проверка подписки
            const subscription = await checkUserSubscription(data.user.id);
            
            // Обновление метрик безопасности
            await updateSecurityMetrics(email, true);
            
            // Показ сообщения об успехе
            showMessage('Вход выполнен успешно!');

            // Редирект на соответствующую страницу
            const redirectPage = getRedirectPage(subscription);
            setTimeout(() => {
                window.location.href = redirectPage;
            }, 1500);

        } catch (error) {
            await updateSecurityMetrics(email, false);
            
            if (!navigator.onLine || error.name === 'NetworkError') {
                handleNetworkError(error);
            } else {
                showMessage(error.message, true);
            }
        } finally {
            toggleLoadingState(false);
        }
    });

    // Проверка параметров URL для сообщений
    const checkUrlMessages = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const message = urlParams.get('message');
        if (message) {
            showMessage(
                decodeURIComponent(message),
                urlParams.get('error') === 'true'
            );
        }
    };

    // Инициализация страницы и настройка очистки
    const cleanup = initializePage();
    checkUrlMessages();

    // Очистка при выходе со страницы
    window.addEventListener('beforeunload', () => {
        cleanup?.();
    });
});

// Экспорт необходимых функций для тестирования
export {
    validateEmail,
    validatePassword,
    showMessage,
    clearMessage
};
