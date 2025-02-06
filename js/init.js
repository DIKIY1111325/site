document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.custom-form');
    const termsCheck = document.getElementById('termsCheck');
    const connectBtn = form.querySelector('button[type="submit"]');
    const messengerLinks = document.querySelectorAll('.bi-telegram, .bi-whatsapp, .bi-instagram');
    const fieldsToLock = document.querySelectorAll('#full-name, #email-invite, #password');
    let isAllowed = false;

    // Блокируем поля изначально
    fieldsToLock.forEach(field => {
        field.disabled = true;
    });

    // Обработка кликов по иконкам
    messengerLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Разблокируем доступ через 15 секунд
            setTimeout(() => {
                isAllowed = true;
                fieldsToLock.forEach(field => {
                    field.disabled = false; // Разблокируем поля
                });
                alert("Теперь вы cможете зарегистрироваться или авторизоваться и получить настройки VPN.");
            }, 15000);
        });
    });

    // Проверяем попытки ввода до истечения времени
    fieldsToLock.forEach(field => {
        field.addEventListener('focus', () => {
            if (!isAllowed) {
                alert("Отправка ссылки о проекте - обязательное условие предоставления тестового периода использования VPN.");
                field.blur(); // Убираем фокус с поля
            }
        });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Отключение стандартного поведения отправки формы

        let isValid = true;
        const messages = [];

        // Проверка поля "имя"
        const fullName = document.getElementById('full-name').value.trim();
        const fullNameRegex = /^[a-zA-Zа-яА-Я]{5,}$/;
        if (!fullName || !fullNameRegex.test(fullName)) {
            isValid = false;
            messages.push("Имя должно содержать минимум 5 букв.");
        }

        // Проверка поля "№ телефона или Email"
        const emailOrPhone = document.getElementById('email-invite').value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]{5,}@[a-zA-Z0-9.-]{4,}\.(ru|com|net)$/;
        const phoneRegex = /^(8|\+7)\d{10}$/;
        const noRepeatRegex = /(\d)\1{4}/; // Номер не должен содержать одну цифру более 4 раз подряд

        if (phoneRegex.test(emailOrPhone)) {
            if (noRepeatRegex.test(emailOrPhone)) {
                isValid = false;
                messages.push("Пожалуйста проверьте номер телефона. Вероятно вы ошиблись.");
            }
        } else if (!emailRegex.test(emailOrPhone)) {
            isValid = false;
            messages.push("Введите корректный email или номер телефона.");
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
            alert(messages.join("\n"));
            return; // Остановить выполнение при ошибке
        }

        // Анимация кнопки
        connectBtn.style.backgroundColor = '#77dd77';

        // Копирование настроек VPN
        const vpnSettingsLink = "vless://example-link-to-vpn-server"; // Замените на вашу ссылку
        navigator.clipboard.writeText(vpnSettingsLink)
            .then(() => {
                alert("Настройки VPN сервера скопированы. Вставьте их в приложение-клиент для подключения.");
            })
            .catch(err => {
                alert("Ошибка при копировании настроек. Попробуйте снова.");
                console.error("Ошибка копирования в буфер обмена:", err);
            });
    });

    // Проверка заполнения полей для активации кнопки
    form.addEventListener('input', function () {
        const fullName = document.getElementById('full-name').value.trim();
        const emailOrPhone = document.getElementById('email-invite').value.trim();
        const password = document.getElementById('password').value.trim();
        const allFieldsFilled = fullName && emailOrPhone && password && termsCheck.checked;
        connectBtn.disabled = !allFieldsFilled;
    });
});