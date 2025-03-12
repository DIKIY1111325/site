// Константы и настройки
const PASSWORD_MIN_LENGTH = 8;
const USERNAME_MIN_LENGTH = 3;
const REGISTRATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
const MAX_REGISTRATION_ATTEMPTS = 5;

// Функции валидации
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\s]{8,}$/;
    return passwordRegex.test(password);
}

function validateUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
}

document.addEventListener('DOMContentLoaded', function() {
    // Проверка наличия необходимых элементов
    const form = document.getElementById('register-form');
    if (!form) {
        console.error('Register form not found');
        return;
    }

    const messageElement = document.getElementById('register-message');
    if (!messageElement) {
        console.error('Message element not found');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (!submitButton) {
        console.error('Submit button not found');
        return;
    }

    // Проверка инициализации Supabase
    if (!supabaseClient) {
        console.error('Supabase client not initialized');
        messageElement.textContent = "Ошибка подключения к серверу";
        messageElement.style.color = 'red';
        submitButton.disabled = true;
        return;
    }
    
    // Проверка текущей сессии
    checkAuth().then(user => {
        if (user) {
            window.location.href = 'index.html';
        }
    });

    // Проверка времени последней регистрации и количества попыток
    function checkRegistrationCooldown() {
        const attempts = parseInt(localStorage.getItem('registrationAttempts') || '0');
        if (attempts >= MAX_REGISTRATION_ATTEMPTS) {
            messageElement.textContent = "Превышено количество попыток регистрации";
            messageElement.style.color = 'red';
            submitButton.disabled = true;
            return true;
        }

        const lastRegistration = localStorage.getItem('lastRegistrationAttempt');
        if (lastRegistration) {
            const timePassed = Date.now() - parseInt(lastRegistration);
            if (timePassed < REGISTRATION_COOLDOWN) {
                const hoursLeft = Math.ceil((REGISTRATION_COOLDOWN - timePassed) / (1000 * 60 * 60));
                messageElement.textContent = `Повторная регистрация будет доступна через ${hoursLeft} часов`;
                messageElement.style.color = 'red';
                submitButton.disabled = true;
                return true;
            }
        }
        return false;
    }
	    // Функция проверки занятости email с обработкой ошибок сети
    async function checkEmailAvailability(email) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('email')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return true; // Email свободен
                }
                throw error;
            }

            return !data;
        } catch (error) {
            console.error('Email check failed:', error.message);
            // Увеличиваем счетчик ошибок
            const errorCount = parseInt(sessionStorage.getItem('emailCheckErrors') || '0') + 1;
            sessionStorage.setItem('emailCheckErrors', errorCount.toString());
            
            if (errorCount >= 3) {
                messageElement.textContent = "Проблемы с подключением к серверу. Попробуйте позже.";
                throw new Error('Превышено количество попыток проверки email');
            }
            return false;
        }
    }

    // Функция проверки занятости username с обработкой ошибок сети
    async function checkUsernameAvailability(username) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('username')
                .eq('username', username)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return true; // Username свободен
                }
                throw error;
            }

            return !data;
        } catch (error) {
            console.error('Username check failed:', error.message);
            // Увеличиваем счетчик ошибок
            const errorCount = parseInt(sessionStorage.getItem('usernameCheckErrors') || '0') + 1;
            sessionStorage.setItem('usernameCheckErrors', errorCount.toString());
            
            if (errorCount >= 3) {
                messageElement.textContent = "Проблемы с подключением к серверу. Попробуйте позже.";
                throw new Error('Превышено количество попыток проверки username');
            }
            return false;
        }
    }

    // Функция очистки данных сессии
    function clearSessionData() {
        sessionStorage.removeItem('emailCheckErrors');
        sessionStorage.removeItem('usernameCheckErrors');
        localStorage.removeItem('registrationAttempts');
        sessionStorage.clear();
    }

    // Функция обновления счетчика попыток регистрации
    function updateRegistrationAttempts() {
        const attempts = parseInt(localStorage.getItem('registrationAttempts') || '0') + 1;
        localStorage.setItem('registrationAttempts', attempts.toString());
        return attempts;
    }
	    // Обработка формы регистрации
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (checkRegistrationCooldown()) return;

        const email = document.getElementById('register-email')?.value.trim();
        const username = document.getElementById('register-username')?.value.trim();
        const password = document.getElementById('register-password')?.value.trim();
        const confirmPassword = document.getElementById('register-confirm-password')?.value.trim();
        const referralCode = document.getElementById('referral-code')?.value.trim();

        // Проверка наличия всех полей
        if (!email || !username || !password || !confirmPassword) {
            messageElement.textContent = "Все поля должны быть заполнены";
            messageElement.style.color = 'red';
            return;
        }

        // Базовая валидация
        if (!validateEmail(email)) {
            messageElement.textContent = "Введите корректный email";
            messageElement.style.color = 'red';
            return;
        }

        if (!validateUsername(username)) {
            messageElement.textContent = "Имя пользователя должно содержать от 3 до 20 символов и может включать только буквы, цифры, _ и -";
            messageElement.style.color = 'red';
            return;
        }

        if (!validatePassword(password)) {
            messageElement.textContent = "Пароль должен содержать минимум 8 символов, включая заглавные, строчные буквы и цифры";
            messageElement.style.color = 'red';
            return;
        }

        if (password !== confirmPassword) {
            messageElement.textContent = "Пароли не совпадают";
            messageElement.style.color = 'red';
            return;
        }

        try {
            submitButton.disabled = true;
            messageElement.textContent = "Проверка данных...";
            messageElement.style.color = 'blue';

            // Проверка доступности email и username
            const [isEmailAvailable, isUsernameAvailable] = await Promise.all([
                checkEmailAvailability(email),
                checkUsernameAvailability(username)
            ]);

            if (!isEmailAvailable) {
                messageElement.textContent = "Этот email уже зарегистрирован";
                messageElement.style.color = 'red';
                return;
            }

            if (!isUsernameAvailable) {
                messageElement.textContent = "Это имя пользователя уже занято";
                messageElement.style.color = 'red';
                return;
            }
			            // Проверка реферального кода
            let referralData = null;
            if (referralCode) {
                try {
                    referralData = await checkReferralCode(referralCode);
                    if (!referralData) {
                        messageElement.textContent = "Неверный реферальный код";
                        messageElement.style.color = 'red';
                        return;
                    }
                } catch (refError) {
                    console.error('Referral check error:', refError);
                    messageElement.textContent = "Ошибка проверки реферального кода";
                    messageElement.style.color = 'red';
                    return;
                }
            }

            messageElement.textContent = "Создание аккаунта...";
            
            // Регистрация пользователя
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        registration_date: new Date().toISOString(),
                        referral_code: referralCode || null
                    }
                }
            });

            if (error) throw error;

            // Создание профиля пользователя
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    email,
                    username,
                    created_at: new Date().toISOString(),
                    role: 'user',
                    status: 'pending',
                    referral_code: referralCode || null,
                    last_login: null,
                    registration_ip: await fetch('https://api.ipify.org?format=json')
                        .then(response => response.json())
                        .then(data => data.ip)
                        .catch(() => null)
                }]);

            if (profileError) throw profileError;

            // Обработка реферала
            if (referralData) {
                try {
                    await supabaseClient
                        .from('referral_uses')
                        .insert([{
                            referral_id: referralData.id,
                            used_by: data.user.id,
                            used_at: new Date().toISOString(),
                            status: 'pending'
                        }]);
                } catch (refError) {
                    console.error('Referral processing error:', refError);
                    // Продолжаем выполнение, так как основная регистрация уже прошла успешно
                }
            }
			            // Успешная регистрация
            localStorage.setItem('lastRegistrationAttempt', Date.now().toString());
            clearSessionData(); // Очищаем все временные данные
            
            messageElement.textContent = 'Регистрация успешна! Проверьте ваш email для подтверждения.';
            messageElement.style.color = 'green';

            // Очистка формы
            form.reset();

            // Редирект через 3 секунды
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);

        } catch (error) {
            console.error('Registration error:', error.message);
            const attempts = updateRegistrationAttempts();
            
            // Специфичные сообщения об ошибках
            let errorMessage = "Ошибка при регистрации. ";
            if (error.message.includes('email')) {
                errorMessage += "Проблема с email адресом.";
            } else if (error.message.includes('password')) {
                errorMessage += "Проблема с паролем.";
            } else if (error.message.includes('network')) {
                errorMessage += "Проблема с подключением к серверу.";
            } else {
                errorMessage += "Попробуйте позже.";
            }

            messageElement.textContent = errorMessage;
            messageElement.style.color = 'red';
        } finally {
            submitButton.disabled = false;
        }
    });

    // Валидация в реальном времени
    form.addEventListener('input', function(e) {
        const email = document.getElementById('register-email')?.value.trim() || '';
        const username = document.getElementById('register-username')?.value.trim() || '';
        const password = document.getElementById('register-password')?.value.trim() || '';
        const confirmPassword = document.getElementById('register-confirm-password')?.value.trim() || '';
        
        const emailValid = validateEmail(email);
        const usernameValid = validateUsername(username);
        const passwordValid = validatePassword(password);
        const passwordsMatch = password === confirmPassword && password !== '';
        
        // Визуальная обратная связь
        if (document.getElementById('register-email')) {
            document.getElementById('register-email').style.borderColor = 
                email ? (emailValid ? 'green' : 'red') : '#ccc';
        }
        if (document.getElementById('register-username')) {
            document.getElementById('register-username').style.borderColor = 
                username ? (usernameValid ? 'green' : 'red') : '#ccc';
        }
        if (document.getElementById('register-password')) {
            document.getElementById('register-password').style.borderColor = 
                password ? (passwordValid ? 'green' : 'red') : '#ccc';
        }
        if (document.getElementById('register-confirm-password')) {
            document.getElementById('register-confirm-password').style.borderColor = 
                confirmPassword ? (passwordsMatch ? 'green' : 'red') : '#ccc';
        }
        
        // Активация/деактивация кнопки отправки
        submitButton.disabled = !(emailValid && usernameValid && passwordValid && passwordsMatch) || 
                              checkRegistrationCooldown();
    });

    // Обработчик для кнопок "Показать пароль"
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inputId = this.getAttribute('data-target');
            const input = document.getElementById(inputId);
            if (!input) return;
            
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Обновление иконки
            this.classList.toggle('show-password');
            this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    });
});

			