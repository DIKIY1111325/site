document.addEventListener("DOMContentLoaded", function() {
    let shareInitiated = false; // Флаг отправки ссылки
    let hiddenTimestamp = null; // Время ухода со страницы
    const MINIMUM_AWAY_TIME = 25 * 1000; // 25 секунд

    // Поиск ссылки "получить настройки для подключения VPN"
    const vpnLink = document.querySelector('.custom-form a.custom-btn');
    if (!vpnLink) return; // Если ссылка не найдена, прекращаем выполнение

    // Изначально блокируем переход по ссылке
    vpnLink.addEventListener("click", function(e) {
        if (!vpnLink.classList.contains("unlocked")) {
            e.preventDefault();
            alert("Отправьте приглашение знакомым, это обязательное условие для использования VPN бесплатно.");
        }
    });

    // Отслеживание кликов по кнопкам мессенджеров
    document.querySelectorAll('.social-icons a').forEach(icon => {
        icon.addEventListener("click", function() {
            shareInitiated = true; // Фиксируем отправку ссылки
        });
    });

    // Отслеживание ухода/возвращения на страницу
    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            hiddenTimestamp = Date.now(); // Фиксируем время ухода
        } else if (shareInitiated && hiddenTimestamp) {
            const timeAway = Date.now() - hiddenTimestamp;
            if (timeAway >= MINIMUM_AWAY_TIME) {
                vpnLink.classList.add("unlocked"); // Разблокируем ссылку
            }
            // Сбрасываем флаги после проверки
            shareInitiated = false;
            hiddenTimestamp = null;
        }
    });
});
