// Инициализация Supabase
const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co'; // Ваш Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY'; // Ваш Anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.custom-form');
    const termsCheck = document.getElementById('termsCheck');
    const connectBtn = form.querySelector('button[type="submit"]');
    const message = document.getElementById('message');

    form.addEventListener('submit', async function (e) {
        e.preventDefault(); // Отключение стандартного поведения отправки формы

        let isValid = true;
        const messages = [];

        // Проверка поля "email"
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
        if (!email || !emailRegex.test(email)) {
            isValid = false;
            messages.push("Введите корректный email.");
        }

        // Проверка поля "№ телефона"
        const phone = document.getElementById('phone').value.trim();
        const phoneRegex = /^(8|\+7)\d{10}$/;
        const noRepeatRegex = /(\d)\1{4}/; // Номер не должен содержать одну цифру более 4 раз подряд

        if (phoneRegex.test(phone)) {
            if (noRepeatRegex.test(phone)) {
                isValid = false;
                messages.push("Пожалуйста проверьте номер телефона. Вероятно вы ошиблись.");
            }
        } else if (!phoneRegex.test(phone)) {
            isValid = false;
            messages.push("Введите корректный номер телефона.");
        }

        // Проверка поля "пароль"
        const password = document.getElementById('password').value.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\s]{8,}$/;
        if (!password || !passwordRegex.test(password)) {
            isValid = false;
            messages.push("Пароль должен содержать минимум 8 символов, включая заглавные и строчные латинские буквы, а также цифры.");
        }

        // Проверка согласия с условиями
        if (!termsCheck.checked) {
            isValid = false;
            messages.push("Пожалуйста, ознакомьтесь и согласитесь с условиями сервиса.");
        }

        // Вывод сообщений об ошибках
        if (!isValid) {
            message.textContent = messages.join("\n");
            return; // Остановить выполнение при ошибке
        }

        // Анимация кнопки
        connectBtn.style.backgroundColor = '#77dd77';

        try {
            // Попытка регистрации или авторизации
            let { user, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                // Если ошибка, попытка авторизации
                ({ user, error } = await supabase.auth.signIn({
                    email: email,
                    password: password
                }));

                if (error) {
                    message.textContent = `Ошибка: ${error.message}`;
                    return;
                }
            }

            message.textContent = 'Успешная авторизация!';

            // Получаем метку пользователя из localStorage
            const redirectPage = localStorage.getItem('redirectPage');

            // Перенаправляем пользователя на нужную страницу
            if (redirectPage) {
                window.location.href = redirectPage;
            } else {
                window.location.href = 'index.html'; // В случае ошибки или неопределенной страницы
            }
        } catch (err) {
            message.textContent = `Неожиданная ошибка: ${err.message}`;
        }
    });

    // Проверка заполнения полей для активации кнопки
    form.addEventListener('input', function () {
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const password = document.getElementById('password').value.trim();
        const allFieldsFilled = email && phone && password && termsCheck.checked;
        connectBtn.disabled = !allFieldsFilled;
    });
});
