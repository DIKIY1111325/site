//Hook up the tweet display

$(document).ready(function() {
    /*
    $(".countdown").countdown({
        date: "12 March 2024 18:30:00",
        format: "on"
    },
    
    function() {
        // callback function
    });
    */

    $('button.form-control').on('click', function(event) {
        event.preventDefault(); // Предотвращаем отправку формы по умолчанию

        var isValid = true;
        var messages = [];

        // Проверка поля "имя"
        if ($('#full-name').val().length < 5) {
            isValid = false;
            messages.push("Имя должно содержать минимум 5 символов.");
        }

        // Обновленная проверка поля "№ телефона или Email"
        var contactInput = $('#email-register').val();
        var contactPattern = /^([a-zA-Z]{5,}@([a-zA-Z]{4,})\.(ru|com|net))|(\+7\d{10})$/;
        if (!contactPattern.test(contactInput)) {
            isValid = false;
            messages.push("Введите корректный email или номер телефона.");
        }

        // Проверка поля "пароль"
        var passwordInput = $('#password').val();
        var passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordPattern.test(passwordInput)) {
            isValid = false;
            messages.push("Пароль должен содержать минимум 8 символов, включая заглавные и прописные буквы, цифры, без специальных символов и пробелов.");
        }

        // Проверка согласия с условиями
        if (!$('#termsCheck').is(':checked')) {
            isValid = false;
            messages.push("Пожалуйста, ознакомтесь и согласитесь с условиями сервиса.");
        }

        // Вывод сообщений об ошибках
        if (!isValid) {
            alert(messages.join("\n"));
        } else {
            // Анимация изменения цвета кнопки
            $(this).css('background-color', '#77dd77');
            alert("НАСТРОЙКИ VPN СЕРВЕРА СКОПИРОВАНЫ");
        }
    });
});