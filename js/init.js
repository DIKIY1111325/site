// Подключение функционала при загрузке документа
$(document).ready(function () {
    // Обработчик события для кнопки отправки формы
    $('button.form-control').on('click', function (event) {
        event.preventDefault(); // Предотвращаем отправку формы по умолчанию

        var isValid = true;
        var messages = [];

        // Проверка поля "имя"
        var fullName = $('#full-name').val().trim();
        var namePattern = /^[A-Za-zА-Яа-я]{5,}$/; // Минимум 5 букв
        if (!namePattern.test(fullName)) {
            isValid = false;
            messages.push("Имя должно содержать минимум 5 букв.");
        }

        // Проверка поля "№ телефона или Email"
        var contactInput = $('#email-register').val().trim();
        var emailPattern = /^[^@\\s]{5,}@[^@\\s]{4,}\\.(ru|com|net)$/; // Email: перед @ минимум 5 символов, после минимум 4, оканчивается на .ru|.com|.net
        var phonePattern = /^(8|\+7)\d{10}$/; // Номер начинается с 8 или +7 и содержит ровно 10 цифр
        var noRepeatPattern = /(\d)\1{4}/; // Номер не должен содержать одну цифру более 4 раз подряд

        if (phonePattern.test(contactInput)) {
            if (noRepeatPattern.test(contactInput)) {
                isValid = false;
                messages.push("Номер телефона содержит более 4 одинаковых цифр подряд.");
            }
        } else if (!emailPattern.test(contactInput)) {
            isValid = false;
            messages.push("Введите корректный email или номер телефона.");
        }

        // Проверка поля "пароль"
        var passwordInput = $('#password').val().trim();
        var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d\s]{8,}$/;
        if (!passwordPattern.test(passwordInput)) {
            isValid = false;
            messages.push("Пароль должен содержать минимум 8 символов, включая заглавные и строчные латинские буквы, цифры.");
        }

        // Проверка согласия с условиями
        if (!$('#termsCheck').is(':checked')) {
            isValid = false;
            messages.push("Пожалуйста, ознакомьтесь и согласитесь с условиями сервиса.");
        }

        // Обработка результата проверки
        if (!isValid) {
            alert(messages.join("\n")); // Выводим ошибки
        } else {
            // Анимация изменения цвета кнопки
            $(this).css('background-color', '#77dd77');
            alert("НАСТРОЙКИ VPN СЕРВЕРА СКОПИРОВАНЫ, ВСТАВТЕ ИХ ПРИ СОЗДАНИИ НОВОГО ПРОФИЛЯ В ПРОГРАММЕ КЛИЕНТЕ");

            // Копирование ссылки в буфер обмена
            const vpnLink = "https://example.com/vpn-settings"; // Замените на свою ссылку
            navigator.clipboard.writeText(vpnLink).catch(err => {
                console.error("Ошибка копирования: ", err);
            });
        }
    });
});
