document.addEventListener("DOMContentLoaded", function () {
    const timerDuration = 25; // Время в секундах
    const redirectURL = "faq5_vpn_serv.html"; // Куда перенаправлять с момента таймера
    const timerKey = "vpn_invite_timer"; // Ключ для localStorage
    const messengerLinks = document.querySelectorAll(".bi-telegram, .bi-whatsapp, .bi-instagram");
    const continueBtn = document.getElementById("continue-btn");

    let isTimerRunning = false;

    function startTimer() {
        if (isTimerRunning) return; // Не запускаем повторно

        const startTime = Date.now();
        localStorage.setItem(timerKey, startTime);
        isTimerRunning = true;
        updateTimer();
    }

    function updateTimer() {
        const startTime = localStorage.getItem(timerKey);
        if (!startTime) return;

        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        const remainingTime = Math.max(0, timerDuration - elapsedTime);

        if (remainingTime > 0) {
            setTimeout(updateTimer, 1000);
        } else {
            localStorage.removeItem(timerKey);
            if (continueBtn) {
                continueBtn.disabled = false; // Делаем кнопку активной
            }
        }
    }

    // Обработка кликов по мессенджерам
    messengerLinks.forEach(link => {
        link.addEventListener("click", () => {
            startTimer();
        });
    });

    // Проверяем, был ли запущен таймер при загрузке страницы
    if (localStorage.getItem(timerKey)) {
        updateTimer();
    }
});