// Инициализация Supabase
const supabaseUrl = 'https://dsvaqphuagrnkjmthtet.supabase.co'; // Ваш Project URL
const supabaseKey = 'your-anon-key'; // Ваш Anon key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Функция проверки авторизации
async function checkAuth() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        // Пользователь не авторизован, перенаправляем на страницу авторизации
        window.location.href = 'login.html';
    } else {
        console.log('Пользователь авторизован:', user);
    }
}

// Вызов функции при загрузке страницы
checkAuth();