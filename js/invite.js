document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.custom-form');
    const connectBtn = document.getElementById('connect-btn');
    const messengerLinks = document.querySelectorAll('.bi-telegram, .bi-whatsapp, .bi-instagram');
    let isAllowed = false;

    // Присваивание метки пользователю
    const userTag = 'user_' + Date.now();
    localStorage.setItem('userTag', userTag);

    // Обработка кликов по иконкам мессенджеров
    messengerLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Отслеживание времени отсутствия на сайте
            const startTime = Date.now();

            // Проверка возврата на сайт через 25 секунд
            setTimeout(() => {
                const interval = setInterval(() => {
                    if (document.visibilityState === 'visible') {
                        const endTime = Date.now();
                        const elapsedTime = endTime - startTime;

                        if (elapsedTime >= 25000) {
                            isAllowed = true;
                            connectBtn.disabled = false; // Разблокировка кнопки
                        } else {
                            alert("Поделитесь ссылкой со знакомыми для подключения VPN бесплатно");
                        }

                        clearInterval(interval);
                    }
                }, 1000);
            }, 25000);
        });
    });

    // Попытка нажатия кнопки до истечения времени
    connectBtn.addEventListener('click', (e) => {
        if (!isAllowed) {
            e.preventDefault();
            alert("Поделитесь ссылкой со знакомыми для подключения VPN бесплатно");
        } else {
            window.location.href = 'login.html'; // Перенаправление на страницу LOGIN
        }
    });
});
