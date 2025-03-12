// Константы для аутентификации
const AUTH_STORAGE_KEY = 'auth_data';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней в миллисекундах
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 минут в миллисекундах

// Инициализация Supabase клиента
if (!window.supabaseClient) {
    console.error('Supabase client not found! Make sure to include Supabase SDK before auth.js');
}

// Класс для управления аутентификацией
class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
        this.sessionData = null;
        this.lastActivity = Date.now();
        
        // Загрузка сохраненной сессии
        this.loadSession();
        
        // Установка обработчиков событий
        this.setupEventListeners();
        
        // Запуск периодической проверки сессии
        this.startSessionCheck();
    }

    // Загрузка сохраненной сессии
    async loadSession() {
        try {
            const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
            if (savedSession) {
                const { session, timestamp } = JSON.parse(savedSession);
                
                // Проверка срока действия сессии
                if (Date.now() - timestamp < SESSION_DURATION) {
                    this.sessionData = session;
                    this.currentUser = session.user;
                    
                    // Проверка валидности токена
                    if (await this.validateToken()) {
                        console.log('Session restored successfully');
                        return true;
                    }
                }
                
                // Если сессия истекла или токен недействителен
                this.clearSession();
            }
        } catch (error) {
            console.error('Error loading session:', error);
            this.clearSession();
        }
        return false;
    }
	    // Установка обработчиков событий
    setupEventListeners() {
        // Отслеживание активности пользователя
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            });
        });

        // Обработка изменений в хранилище (для синхронизации между вкладками)
        window.addEventListener('storage', (e) => {
            if (e.key === AUTH_STORAGE_KEY) {
                if (!e.newValue) {
                    // Сессия была очищена в другой вкладке
                    this.handleLogout();
                } else {
                    // Сессия была обновлена в другой вкладке
                    this.loadSession();
                }
            }
        });

        // Обработка перед закрытием страницы
        window.addEventListener('beforeunload', () => {
            this.saveSession();
        });
    }

    // Периодическая проверка сессии
    startSessionCheck() {
        setInterval(() => {
            // Проверка активности пользователя
            const inactiveTime = Date.now() - this.lastActivity;
            if (inactiveTime > SESSION_DURATION) {
                this.handleLogout();
                return;
            }

            // Проверка необходимости обновления токена
            if (this.sessionData) {
                const expiresAt = new Date(this.sessionData.expires_at).getTime();
                const timeToExpire = expiresAt - Date.now();

                if (timeToExpire < TOKEN_REFRESH_THRESHOLD) {
                    this.refreshToken();
                }
            }
        }, 60000); // Проверка каждую минуту
    }

    // Сохранение сессии
    saveSession() {
        if (this.sessionData) {
            const sessionData = {
                session: this.sessionData,
                timestamp: Date.now()
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
        }
    }
	    // Проверка валидности токена
    async validateToken() {
        try {
            if (!this.sessionData?.access_token) return false;

            const { error } = await this.supabase.auth.getUser(this.sessionData.access_token);
            return !error;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }

    // Обновление токена
    async refreshToken() {
        try {
            const { data, error } = await this.supabase.auth.refreshSession();
            
            if (error) {
                console.error('Token refresh error:', error);
                this.handleLogout();
                return false;
            }

            if (data?.session) {
                this.sessionData = data.session;
                this.currentUser = data.session.user;
                this.saveSession();
                return true;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.handleLogout();
        }
        return false;
    }

    // Вход пользователя
    async login(email, password, remember = false) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data?.session) {
                this.sessionData = data.session;
                this.currentUser = data.session.user;

                // Обновление данных о последнем входе
                await this.updateLoginInfo();

                if (remember) {
                    this.saveSession();
                }

                return {
                    success: true,
                    user: this.currentUser
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
	    // Обновление информации о входе пользователя
    async updateLoginInfo() {
        if (!this.currentUser) return;

        try {
            const { error } = await this.supabase
                .from('profiles')
                .update({
                    last_login: new Date().toISOString(),
                    last_login_ip: await this.getUserIP(),
                    login_count: this.supabase.rpc('increment_login_count'),
                    status: 'active'
                })
                .eq('id', this.currentUser.id);

            if (error) {
                console.error('Error updating login info:', error);
            }
        } catch (error) {
            console.error('Failed to update login info:', error);
        }
    }

    // Получение IP пользователя
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Failed to get user IP:', error);
            return null;
        }
    }

    // Выход пользователя
    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.handleLogout();
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Обработка выхода
    handleLogout() {
        this.currentUser = null;
        this.sessionData = null;
        this.clearSession();
        
        // Отправка события выхода
        const logoutEvent = new CustomEvent('userLogout');
        window.dispatchEvent(logoutEvent);
        
        // Перенаправление на страницу входа
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
	    // Очистка сессии
    clearSession() {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.clear();
    }

    // Проверка аутентификации
    isAuthenticated() {
        return !!this.currentUser && !!this.sessionData;
    }

    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Проверка надежности пароля
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return password.length >= minLength && 
               hasUpperCase && 
               hasLowerCase && 
               hasNumbers && 
               hasSpecialChar;
    }

    // Защита от брутфорса
    async handleFailedLogin(email) {
        const key = `failed_attempts_${email}`;
        const attempts = parseInt(localStorage.getItem(key) || '0') + 1;
        localStorage.setItem(key, attempts);
        
        if (attempts >= 5) {
            const cooldownEnd = Date.now() + (30 * 60 * 1000); // 30 минут
            localStorage.setItem(`cooldown_${email}`, cooldownEnd);
        }
    }

    // Проверка возможности входа
    async canAttemptLogin(email) {
        const cooldownEnd = localStorage.getItem(`cooldown_${email}`);
        if (cooldownEnd && Date.now() < parseInt(cooldownEnd)) {
            const minutesLeft = Math.ceil((parseInt(cooldownEnd) - Date.now()) / (60 * 1000));
            throw new Error(`Слишком много попыток входа. Попробуйте снова через ${minutesLeft} минут`);
        }
        return true;
    }

    // Получение данных профиля пользователя
    async getUserProfile() {
        if (!this.currentUser) return null;

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', this.currentUser.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
    }

    // Обновление профиля пользователя
    async updateProfile(updates) {
        if (!this.currentUser) return { success: false, error: 'User not authenticated' };

        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(updates)
                .eq('id', this.currentUser.id);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error updating profile:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Создание глобального экземпляра AuthManager
window.authManager = new AuthManager();

// Экспорт для использования в других модулях
export default window.authManager;

// Проверка аутентификации при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    const publicPages = ['/login.html', '/register.html', '/reset-password.html'];
    const currentPage = window.location.pathname;

    if (!publicPages.some(page => currentPage.endsWith(page))) {
        if (!window.authManager.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    }
});