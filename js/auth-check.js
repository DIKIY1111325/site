document.addEventListener("DOMContentLoaded", function() {
    // Присвоение метки пользователю, если она ещё не установлена
    if (!localStorage.getItem('userMarker')) {
        var marker = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        localStorage.setItem('userMarker', marker);
        console.log("User marker assigned:", marker);
    }

    // Обработчик для кнопки "VPN ЗА НЕСКОЛЬКО КЛИКОВ В МЕССЕНДЖЕРЕ"
    var vpnQuickButton = document.querySelector('a[href="invite.html"]');
    if (vpnQuickButton) {
        vpnQuickButton.addEventListener("click", function() {
            localStorage.setItem('redirectPage', 'vpn_quick');
        });
    }

    // Обработчик для кнопки "ПОДКЛЮЧИТЬ VPN ЗА СИМВОЛИЧЕСКУЮ ПЛАТУ"
    // Для этой кнопки добавлен класс "vpn-paid"
    var vpnPaidButton = document.querySelector('a.vpn-paid');
    if (vpnPaidButton) {
        vpnPaidButton.addEventListener("click", function() {
            localStorage.setItem('redirectPage', 'vpn_paid');
        });
    }

    // Обработчик для кнопки "ПОДКЛЮЧСЯ К ЛИЧНОМУ VPN СЕРВЕРУ"
    // Для этой кнопки добавлен класс "personal-vpn"
    var personalVpnButton = document.querySelector('a.personal-vpn');
    if (personalVpnButton) {
        personalVpnButton.addEventListener("click", function() {
            localStorage.setItem('redirectPage', 'personal_vpn');
        });
    }
});
