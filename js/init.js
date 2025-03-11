document.addEventListener('DOMContentLoaded', function () {
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
            // Разблокируем доступ через 25 секунд
            setTimeout(() => {
                isAllowed = true;
                fieldsToLock.forEach(field => {
                    field.disabled = false; // Разблокируем поля
                });
                alert("Теперь вы cможете зарегистрироваться или авторизоваться и получить настройки VPN.");
            }, 25000);
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
});