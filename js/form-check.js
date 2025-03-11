// Инициализация Supabase клиента
const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function() {
    // Проверка существующей сессии
    checkSession();

    // Инициализация форм
    initRegisterForm();
    initLoginForm();
    
    // Добавляем обработчики для живой валидации
    initLiveValidation();

    async function checkSession() {
        // ... (оставляем как есть)
    }

    function initLiveValidation() {
        const registerForm = document.getElementById('register-form');
        if (!registerForm) return;

        const emailInput = document.getElementById('register-email');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');

        // Создаем контейнеры для подсказок
        createValidationHints();

        // Добавляем обработчики событий для живой валидации
        emailInput.addEventListener('input', () => validateEmail(emailInput));
        passwordInput.addEventListener('input', () => validatePassword(passwordInput));
        confirmPasswordInput.addEventListener('input', () => validateConfirmPassword(passwordInput, confirmPasswordInput));
    }

    function createValidationHints() {
        // Создаем и добавляем подсказки для пароля после поля ввода пароля
        const passwordInput = document.getElementById('register-password');
        const hintsList = document.createElement('ul');
        hintsList.className = 'password-hints';
        hintsList.innerHTML = `
            <li id="length-hint">Минимум 8 символов</li>
            <li id="uppercase-hint">Заглавная буква (A-Z)</li>
            <li id="lowercase-hint">Строчная буква (a-z)</li>
            <li id="number-hint">Цифра (0-9)</li>
            <li id="special-hint">Специальный символ (!@#$%^&*-_+=)</li>
            <li id="requirements-hint">Требуется минимум 3 из 4 типов символов</li>
        `;
        
        // Добавляем стили для подсказок
        const style = document.createElement('style');
        style.textContent = `
            .password-hints {
                list-style: none;
                padding-left: 0;
                margin-top: 5px;
                font-size: 0.8em;
            }
            .password-hints li {
                color: #dc3545;
                margin-bottom: 2px;
                padding-left: 20px;
                position: relative;
            }
            .password-hints li::before {
                content: '✕';
                position: absolute;
                left: 0;
                color: #dc3545;
            }
            .password-hints li.valid {
                color: #198754;
            }
            .password-hints li.valid::before {
                content: '✓';
                color: #198754;
            }
            .form-control.is-invalid {
                border-color: #dc3545;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right calc(0.375em + 0.1875rem) center;
                background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            }
            .form-control.is-valid {
                border-color: #198754;
                background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3e%3cpath fill='%23198754' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
                background-repeat: no-repeat;
                background-position: right calc(0.375em + 0.1875rem) center;
                background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
            }
        `;
        document.head.appendChild(style);
        passwordInput.parentNode.insertBefore(hintsList, passwordInput.nextSibling);
    }

    function validateEmail(input) {
        const emailPattern = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
        const isValid = emailPattern.test(input.value);
        
        updateValidationUI(input, isValid);
        return isValid;
    }

    function validatePassword(input) {
        const password = input.value;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*\-_+=]/.test(password)
        };

        // Обновляем подсказки
        document.getElementById('length-hint').classList.toggle('valid', checks.length);
        document.getElementById('uppercase-hint').classList.toggle('valid', checks.uppercase);
        document.getElementById('lowercase-hint').classList.toggle('valid', checks.lowercase);
        document.getElementById('number-hint').classList.toggle('valid', checks.number);
        document.getElementById('special-hint').classList.toggle('valid', checks.special);

        // Подсчитываем количество выполненных требований
        const requirementsMet = Object.values(checks).filter(Boolean).length - 1; // Вычитаем проверку длины
        const isValid = checks.length && requirementsMet >= 3;
        
        document.getElementById('requirements-hint').classList.toggle('valid', requirementsMet >= 3);
        
        updateValidationUI(input, isValid);
        return isValid;
    }

    function validateConfirmPassword(passwordInput, confirmInput) {
        const isValid = confirmInput.value === passwordInput.value && confirmInput.value !== '';
        updateValidationUI(confirmInput, isValid);
        return isValid;
    }

    function updateValidationUI(input, isValid) {
        input.classList.remove('is-valid', 'is-invalid');
        input.classList.add(isValid ? 'is-valid' : 'is-invalid');
    }

    function validateRegistrationForm(email, password, confirmPassword, termsAccepted, messageElement) {
        let isValid = true;

        // Проверка email
        if (!validateEmail(document.getElementById('register-email'))) {
            messageElement.textContent = 'Неверный формат email';
            messageElement.style.color = 'red';
            isValid = false;
        }

        // Проверка пароля
        if (!validatePassword(document.getElementById('register-password'))) {
            messageElement.textContent = 'Пароль не соответствует требованиям безопасности';
            messageElement.style.color = 'red';
            isValid = false;
        }

        // Проверка совпадения паролей
        if (!validateConfirmPassword(
            document.getElementById('register-password'),
            document.getElementById('register-confirm-password')
        )) {
            messageElement.textContent = 'Пароли не совпадают';
            messageElement.style.color = 'red';
            isValid = false;
        }

        // Проверка согласия с условиями
        if (!termsAccepted) {
            messageElement.textContent = 'Необходимо согласиться с условиями использования';
            messageElement.style.color = 'red';
            isValid = false;
        }

        return isValid;
    }

    // ... (оставшаяся часть кода остается без изменений)
});