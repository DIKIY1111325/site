// Подключение Supabase
const SUPABASE_URL = https://xqlsfatnvjicffaxhvam.supabase.co;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbHNmYXRudmppY2ZmYXhodmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDEzODgsImV4cCI6MjA1ODM3NzM4OH0.iwN2H48Z3k8BFACZgLyncVvtRSy0WHqvfVsWbK9dfSw
;
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Функции валидации email и пароля
function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ru|com|net)$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Проверка, есть ли такой email в базе
async function checkEmailAvailability(email) {
    const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", email)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            return true; // Email свободен
        }
        console.error("Ошибка при проверке email:", error.message);
        return false;
    }

    return !data; // Если данные найдены, email занят
}
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

        try {
            messageElement.textContent = "Проверка email...";
            messageElement.style.color = "blue";

            const isEmailAvailable = await checkEmailAvailability(email);
            if (!isEmailAvailable) {
                messageElement.textContent = "Этот email уже зарегистрирован.";
                messageElement.style.color = "red";
                return;
            }

            messageElement.textContent = "Создание аккаунта...";
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            messageElement.textContent = "Регистрация успешна! Проверьте email.";
            messageElement.style.color = "green";

            form.reset();
            setTimeout(() => {
                window.location.href = "login.html";
            }, 3000);
        } catch (error) {
            console.error("Ошибка регистрации:", error.message);
            messageElement.textContent = "Ошибка при регистрации. Попробуйте позже.";
            messageElement.style.color = "red";
        }
    });
});
const REGISTRATION_COOLDOWN = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
const MAX_REGISTRATION_ATTEMPTS = 5;

// Проверка времени последней регистрации
function checkRegistrationCooldown() {
    const attempts = parseInt(localStorage.getItem("registrationAttempts") || "0");

    if (attempts >= MAX_REGISTRATION_ATTEMPTS) {
        messageElement.textContent = "Превышено количество попыток регистрации.";
        messageElement.style.color = "red";
        return true;
    }

    const lastRegistration = localStorage.getItem("lastRegistrationAttempt");
    if (lastRegistration) {
        const timePassed = Date.now() - parseInt(lastRegistration);
        if (timePassed < REGISTRATION_COOLDOWN) {
            const hoursLeft = Math.ceil((REGISTRATION_COOLDOWN - timePassed) / (1000 * 60 * 60));
            messageElement.textContent = `Повторная регистрация доступна через ${hoursLeft} ч.`;
            messageElement.style.color = "red";
            return true;
        }
    }
    return false;
}

// Обновление попыток регистрации
function updateRegistrationAttempts() {
    const attempts = parseInt(localStorage.getItem("registrationAttempts") || "0") + 1;
    localStorage.setItem("registrationAttempts", attempts.toString());
}

const BRUTEFORCE_LOCK_TIME = 30 * 60 * 1000; // 30 минут в миллисекундах
const MAX_FAILED_ATTEMPTS = 3;

function checkBruteforceLock() {
    const failedAttempts = parseInt(localStorage.getItem("failedRegistrationAttempts") || "0");

    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockTime = parseInt(localStorage.getItem("registrationLockTime") || "0");
        const timeLeft = BRUTEFORCE_LOCK_TIME - (Date.now() - lockTime);

        if (timeLeft > 0) {
            const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
            messageElement.textContent = `Слишком много неудачных попыток. Попробуйте через ${minutesLeft} мин.`;
            messageElement.style.color = "red";
            return true;
        } else {
            // Сброс блокировки после времени ожидания
            localStorage.removeItem("failedRegistrationAttempts");
            localStorage.removeItem("registrationLockTime");
        }
    }
    return false;
}

function updateFailedAttempts() {
    const attempts = parseInt(localStorage.getItem("failedRegistrationAttempts") || "0") + 1;
    localStorage.setItem("failedRegistrationAttempts", attempts.toString());

    if (attempts >= MAX_FAILED_ATTEMPTS) {
        localStorage.setItem("registrationLockTime", Date.now().toString());
    }
}


