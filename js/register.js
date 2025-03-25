// Настройки анти-спама и защиты
const REGISTRATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 часа
const MAX_REGISTRATION_ATTEMPTS = 5;
const BRUTEFORCE_LOCK_TIME = 30 * 60 * 1000; // 30 минут
const MAX_FAILED_ATTEMPTS = 3;

// Функции валидации email и пароля
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ru|com|net)$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Проверка блокировки регистрации (anti-spam)
function checkRegistrationCooldown() {
    const attempts = parseInt(localStorage.getItem("registrationAttempts") || "0");

    if (attempts >= MAX_REGISTRATION_ATTEMPTS) {
        return "Превышено количество попыток регистрации.";
    }

    const lastRegistration = localStorage.getItem("lastRegistrationAttempt");
    if (lastRegistration) {
        const timePassed = Date.now() - parseInt(lastRegistration);
        if (timePassed < REGISTRATION_COOLDOWN) {
            const hoursLeft = Math.ceil((REGISTRATION_COOLDOWN - timePassed) / (1000 * 60 * 60));
            return `Повторная регистрация доступна через ${hoursLeft} ч.`;
        }
    }
    return null;
}

// Обновление попыток регистрации
function updateRegistrationAttempts() {
    const attempts = parseInt(localStorage.getItem("registrationAttempts") || "0") + 1;
    localStorage.setItem("registrationAttempts", attempts.toString());
}

// Проверка защиты от брутфорса
function checkBruteforceLock() {
    const failedAttempts = parseInt(localStorage.getItem("failedRegistrationAttempts") || "0");

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockTime = parseInt(localStorage.getItem("registrationLockTime") || "0");
        const timeLeft = BRUTEFORCE_LOCK_TIME - (Date.now() - lockTime);

        if (timeLeft > 0) {
            const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
            return `Слишком много неудачных попыток. Попробуйте через ${minutesLeft} мин.`;
        } else {
            localStorage.removeItem("failedRegistrationAttempts");
            localStorage.removeItem("registrationLockTime");
        }
    }
    return null;
}

// Обновление неудачных попыток
function updateFailedAttempts() {
    const attempts = parseInt(localStorage.getItem("failedRegistrationAttempts") || "0") + 1;
    localStorage.setItem("failedRegistrationAttempts", attempts.toString());

    if (attempts >= MAX_FAILED_ATTEMPTS) {
        localStorage.setItem("registrationLockTime", Date.now().toString());
    }
}

// Отправка email через серверless-функцию
async function sendEmail(email) {
    try {
        const response = await fetch("https://xqlsfatnvjicffaxhvam.supabase.co/functions/v1/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();
        if (response.ok) {
            console.log("Email отправлен:", result);
            return true;
        } else {
            console.error("Ошибка при отправке email:", result);
            return false;
        }
    } catch (error) {
        console.error("Ошибка сети при отправке email:", error);
        return false;
    }
}

// Обработчик регистрации
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("register-form");
    const messageElement = document.getElementById("register-message");

    if (!form || !messageElement) {
        console.error("Форма регистрации или сообщение не найдены!");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("register-confirm-password").value.trim();

        if (!email || !password || !confirmPassword) {
            messageElement.textContent = "Все поля должны быть заполнены.";
            messageElement.style.color = "red";
            return;
        }

        if (!validateEmail(email)) {
            messageElement.textContent = "Введите корректный email.";
            messageElement.style.color = "red";
            return;
        }

        if (!validatePassword(password)) {
            messageElement.textContent = "Пароль должен содержать минимум 8 символов, заглавную букву и цифру.";
            messageElement.style.color = "red";
            return;
        }

        if (password !== confirmPassword) {
            messageElement.textContent = "Пароли не совпадают.";
            messageElement.style.color = "red";
            return;
        }

        // Проверка на брутфорс и частые регистрации
        let cooldownMessage = checkRegistrationCooldown() || checkBruteforceLock();
        if (cooldownMessage) {
            messageElement.textContent = cooldownMessage;
            messageElement.style.color = "red";
            return;
        }

        try {
            messageElement.textContent = "Создание аккаунта...";
            messageElement.style.color = "blue";

            // Запрос на регистрацию через серверless-функцию
            const response = await fetch("https://xqlsfatnvjicffaxhvam.supabase.co/functions/v1/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Ошибка регистрации");

            // Отправка email
            const emailSent = await sendEmail(email);
            if (!emailSent) throw new Error("Ошибка при отправке email");

            // Успешная регистрация
            localStorage.setItem("lastRegistrationAttempt", Date.now().toString());
            messageElement.textContent = "Регистрация успешна! Проверьте email.";
            messageElement.style.color = "green";

            form.reset();
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        } catch (error) {
            console.error("Ошибка регистрации:", error.message);
            updateFailedAttempts();
            messageElement.textContent = "Ошибка при регистрации. Попробуйте позже.";
            messageElement.style.color = "red";
        }
    });
});
