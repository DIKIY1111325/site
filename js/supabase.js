// Конфигурация Supabase клиента
const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdmFxcGh1YWdybmtqbXRodGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNjUwMTQsImV4cCI6MjA1Njc0MTAxNH0.7p5J2VlCie9lWoUrm1YkMdSeEkRadB4b7vROMlPexsY';

// Функция для отображения ошибки пользователю
function showErrorMessage() {
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
    errorDiv.textContent = 'что-то пошло нет(((';

    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Создание клиента Supabase
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

// Функции для работы с пользователями (соответствует таблице users)
async function getUserProfile() {
    try {
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) return null;

        const { data: userData, error: userError } = await supabaseClient
            .from('users')
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

// Функции для работы с подписками (соответствует таблице subscriptions)
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

// Базовые функции аутентификации
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return !!session;
    } catch (error) {
        console.error('Auth check failed:', error.message);
        showErrorMessage();
        return false;
    }
}

async function signOut() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Sign out failed:', error.message);
        showErrorMessage();
        return false;
    }
}

// Утилита для получения текущего времени в формате UTC
function getCurrentUTCTimestamp() {
    return new Date().toISOString();
}

// Экспорт всех функций и клиента
export const supabase = supabaseClient;
export { 
    checkAuth,
    signOut,
    getUserProfile,
    getUserSubscription,
    hasActiveSubscription,
    showErrorMessage,
    getCurrentUTCTimestamp
};