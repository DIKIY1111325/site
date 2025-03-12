// Часть 1: Конфигурация и базовая настройка Supabase клиента
const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY';

// Функция для отображения ошибок пользователю
function showErrorMessage(message = 'Что-то пошло не так(((') {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = '#ff4444';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '15px 30px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '1000';
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Инициализация Supabase клиента
let supabaseClient = null;

try {
    supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);
    if (!supabaseClient) {
        throw new Error('Failed to initialize Supabase client');
    }
    console.log('Supabase client initialized successfully');
} catch (error) {
    console.error('Error initializing Supabase:', error.message);
    showErrorMessage();
}

// Функции для работы с профилями пользователей
async function getUserProfile() {
    try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return null;

        const { data: userData, error: userError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (userError) throw userError;
        return userData;
    } catch (error) {
        console.error('Get user profile failed:', error.message);
        showErrorMessage();
        return null;
    }
}

// Функция для обновления профиля пользователя
async function updateUserProfile(profileData) {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from('profiles')
            .update(profileData)
            .eq('id', user.id);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Update profile failed:', error.message);
        showErrorMessage('Ошибка обновления профиля');
        return null;
    }
}
// Функции для работы с подписками
async function getUserSubscription() {
    try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return null;

        const { data: subscription, error: subError } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('status', 'active')
            .single();

        if (subError) throw subError;
        return subscription;
    } catch (error) {
        console.error('Get subscription failed:', error.message);
        showErrorMessage();
        return null;
    }
}

// Функция проверки активной подписки
async function hasActiveSubscription() {
    try {
        const subscription = await getUserSubscription();
        return subscription !== null && 
               subscription.status === 'active' && 
               (!subscription.end_date || new Date(subscription.end_date) > new Date());
    } catch (error) {
        console.error('Check subscription failed:', error.message);
        showErrorMessage();
        return false;
    }
}

// Функция создания новой подписки
async function createSubscription(subscriptionData) {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from('subscriptions')
            .insert([{
                user_id: user.id,
                status: 'active',
                start_date: getCurrentUTCTimestamp(),
                ...subscriptionData
            }]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create subscription failed:', error.message);
        showErrorMessage('Ошибка создания подписки');
        return null;
    }
}

// Базовые функции аутентификации
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Auth check failed:', error.message);
        showErrorMessage();
        return null;
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Sign out failed:', error.message);
        showErrorMessage();
    }
}

// Функция для получения текущего времени в UTC
function getCurrentUTCTimestamp() {
    return new Date().toISOString();
}
// Функции для работы с рефералами
async function createReferral(referralCode) {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from('referrals')
            .insert([{
                user_id: user.id,
                referral_code: referralCode,
                created_at: getCurrentUTCTimestamp(),
                status: 'active'
            }]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Create referral failed:', error.message);
        showErrorMessage('Ошибка создания реферального кода');
        return null;
    }
}

// Функция для проверки реферального кода
async function checkReferralCode(code) {
    try {
        const { data, error } = await supabaseClient
            .from('referrals')
            .select('*')
            .eq('referral_code', code)
            .eq('status', 'active')
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Check referral code failed:', error.message);
        showErrorMessage('Ошибка проверки реферального кода');
        return null;
    }
}

// Экспорт всех функций в глобальную область видимости
window.supabaseClient = supabaseClient;
window.checkAuth = checkAuth;
window.signOut = signOut;
window.getUserProfile = getUserProfile;
window.updateUserProfile = updateUserProfile;
window.getUserSubscription = getUserSubscription;
window.hasActiveSubscription = hasActiveSubscription;
window.createSubscription = createSubscription;
window.showErrorMessage = showErrorMessage;
window.getCurrentUTCTimestamp = getCurrentUTCTimestamp;
window.createReferral = createReferral;
window.checkReferralCode = checkReferralCode;

// Инициализация защиты от CSRF
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        // Устанавливаем CSRF токен в localStorage
        localStorage.setItem('csrf_token', session.access_token);
    } else if (event === 'SIGNED_OUT') {
        // Удаляем CSRF токен при выходе
        localStorage.removeItem('csrf_token');
    }
});

// Добавляем обработчик для автоматического обновления токена
setInterval(async () => {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session && !error) {
            await supabaseClient.auth.refreshSession();
        }
    } catch (error) {
        console.error('Token refresh failed:', error.message);
    }
}, 1200000); // Обновление каждые 20 мин

// Финальная проверка инициализации
console.log('Supabase configuration completed');