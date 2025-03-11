document.addEventListener("DOMContentLoaded", function() {
    // Secure user marker generation
    if (!localStorage.getItem('userMarker')) {
        const marker = `user_${crypto.randomUUID()}`;
        localStorage.setItem('userMarker', marker);
    }

    // Whitelist of allowed redirects
    const ALLOWED_REDIRECTS = {
        'vpn_quick': 'invite.html',
        'vpn_paid': 'faq3_vpn_serv.html',
        'personal_vpn': 'faq4_vpn_serv.html'
    };

    // Button event handlers with validation
    const buttons = {
        'a[href="invite.html"]': 'vpn_quick',
        'a.vpn-paid': 'vpn_paid',
        'a.personal-vpn': 'personal_vpn'
    };

    Object.entries(buttons).forEach(([selector, redirectType]) => {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener("click", function(e) {
                if (ALLOWED_REDIRECTS[redirectType]) {
                    localStorage.setItem('redirectPage', redirectType);
                }
            });
        }
    });
});