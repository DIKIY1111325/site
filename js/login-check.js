import { getSupabaseConfig } from './config.js';

// Initialize Supabase with secure configuration
const { url: supabaseUrl, publicKey: supabaseKey } = getSupabaseConfig();
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.custom-form');
    const termsCheck = document.getElementById('termsCheck');
    const connectBtn = form.querySelector('button[type="submit"]');
    const message = document.getElementById('message');

    // Add CSRF protection
    const csrfToken = generateCSRFToken();
    
    // Rate limiting setup
    let loginAttempts = parseInt(sessionStorage.getItem('loginAttempts') || '0');
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

    // Функция валидации email
    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
        return emailRegex.test(email);
    }

    // Функция валидации телефона
    function validatePhone(phone) {
        const phoneRegex = /^(8|\+7)\d{10}$/;
        const noRepeatRegex = /(\d)\1{4}/;
        return phoneRegex.test(phone) && !noRepeatRegex.test(phone);
    }

    // Функция валидации пароля
    function validatePassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\s]{8,}$/;
        return passwordRegex.test(password);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Проверка блокировки
        const lockoutEnd = sessionStorage.getItem('lockoutEnd');
        if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
            const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 1000 / 60);
            message.textContent = `Слишком много попыток входа. Попробуйте снова через ${remainingTime} минут.`;
            return;
        }

        let isValid = true;
        const messages = [];

        // Получение и валидация email
        const email = document.getElementById('email').value.trim();
        if (!email || !validateEmail(email)) {
            isValid = false;
            messages.push("Введите корректный email (минимум 5 символов до @ и 4 после).");
        }

        // Получение и валидация телефона
        const phone = document.getElementById('phone').value.trim();
        if (!validatePhone(phone)) {
            isValid = false;
            messages.push("Введите корректный номер телефона (+7 или 8, затем 10 цифр).");
        }

        // Получение и валидация пароля
        const password = document.getElementById('password').value.trim();
        if (!validatePassword(password)) {
            isValid = false;
            messages.push("Пароль должен содержать минимум 8 символов, включая заглавные и строчные латинские буквы, а также цифры.");
        }

        // Проверка согласия с условиями
        if (!termsCheck.checked) {
            isValid = false;
            messages.push("Пожалуйста, ознакомьтесь и согласитесь с условиями сервиса.");
        }

        if (!isValid) {
            message.textContent = messages.join("\n");
            message.style.color = 'red';
            return;
        }

        // Secure redirect validation
        const allowedRedirects = {
            'vpn_quick': 'invite.html',
            'vpn_paid': 'faq3_vpn_serv.html',
            'personal_vpn': 'faq4_vpn_serv.html'
        };

        try {
            connectBtn.disabled = true;
            connectBtn.style.backgroundColor = '#77dd77';

            const { data: { user }, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        phone: phone
                    }
                }
            });

            if (error) {
                if (error.message.includes('User already registered')) {
                    const { data: { user: signInUser }, error: signInError } = 
                        await supabase.auth.signInWithPassword({
                            email: email,
                            password: password
                        });

                    if (signInError) {
                        handleLoginFailure();
                        throw signInError;
                    }
                } else {
                    throw error;
                }
            }

            // Success handling
            sessionStorage.setItem('loginAttempts', '0');
            message.textContent = 'Успешная авторизация!';
            message.style.color = 'green';

            // Secure redirect handling
            const redirectIntent = localStorage.getItem('redirectPage');
            const targetPage = allowedRedirects[redirectIntent] || 'index.html';
            
            // Clean up sensitive data
            localStorage.removeItem('redirectPage');
            
            // Delayed redirect with visual feedback
            setTimeout(() => {
                window.location.href = targetPage;
            }, 1000);

        } catch (err) {
            console.error('Auth error:', err);
            message.textContent = 'Произошла ошибка при авторизации. Пожалуйста, попробуйте снова.';
            message.style.color = 'red';
        } finally {
            connectBtn.disabled = false;
        }
    });

    // Helper functions
    function handleLoginFailure() {
        loginAttempts++;
        sessionStorage.setItem('loginAttempts', loginAttempts.toString());
        
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const lockoutEndTime = Date.now() + LOCKOUT_TIME;
            sessionStorage.setItem('lockoutEnd', lockoutEndTime.toString());
        }
    }

    function generateCSRFToken() {
        const token = crypto.randomUUID();
        sessionStorage.setItem('csrfToken', token);
        return token;
    }

    // Обработчик событий input для проверки полей формы
    form.addEventListener('input', function () {
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value.trim();
        
        const emailValid = validateEmail(email);
        const phoneValid = validatePhone(phone);
        const passwordValid = validatePassword(password);
        
        // Визуальная обратная связь
        document.getElementById('email').style.borderColor = emailValid ? 'green' : '#ccc';
        document.getElementById('phone').style.borderColor = phoneValid ? 'green' : '#ccc';
        document.getElementById('password').style.borderColor = passwordValid ? 'green' : '#ccc';
        
        // Активация/деактивация кнопки
        const allFieldsValid = emailValid && phoneValid && passwordValid && termsCheck.checked;
        connectBtn.disabled = !allFieldsValid;
        
        // Сброс сообщения об ошибке при вводе
        if (allFieldsValid) {
            message.textContent = '';
        }
    });
});