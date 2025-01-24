document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.custom-form');
    const termsCheck = document.getElementById('termsCheck');
    const connectBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Отключение стандартного поведения отправки формы

        let isValid = true;
        const messages = [];

        // Проверка согласия с условиями
        if (!termsCheck.checked) {
            isValid = false;
            messages.push("Пожалуйста, ознакомьтесь и согласитесь с условиями сервиса.");
        }

        // Проверка других полей формы
        const fullName = document.getElementById('full-name').value.trim();
        const email = document.getElementById('email-register').value.trim();
        const password = document.getElementById('password').value.trim();

        const fullNameRegex = /^[a-zA-Zа-яА-Я]{5,}$/;
        if (!fullName || !fullNameRegex.test(fullName)) {
            isValid = false;
            messages.push("Поле 'Ваше имя' должно содержать не менее 5 букв.");
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
        if (!email || !emailRegex.test(email)) {
            isValid = false;
            messages.push("Пожалуйста введите корректный Email");
        }

        if (!password || password.length < 8) {
            isValid = false;
            messages.push("Пароль должен содержать не менее 8 символов.");
        }

        // Вывод сообщений об ошибках
        if (!isValid) {
            alert(messages.join("\n"));
            return; // Остановить дальнейшее выполнение
        }

        // Анимация изменения цвета кнопки
        connectBtn.style.backgroundColor = '#77dd77';

        // Копирование ссылки в буфер обмена
        const vpnSettingsLink = "vless://example-link-to-vpn-server"; // Замените на вашу ссылку
        navigator.clipboard.writeText(vpnSettingsLink)
            .then(() => {
                alert("НАСТРОЙКИ VPN СЕРВЕРА СКОПИРОВАНЫ. Для использования, вставьте их в приложение-клиент.");
            })
            .catch(err => {
                alert("Ошибка при копировании настроек. Попробуйте снова.");
                console.error("Ошибка копирования в буфер обмена:", err);
            });
    });

    // Проверка состояния формы и активация кнопки
    form.addEventListener('input', function () {
        const allFieldsFilled = fullName && email && password && termsCheck.checked;
        connectBtn.disabled = !allFieldsFilled;
    });
});
