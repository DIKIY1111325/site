Аутентификация пользователей сайта развернутого на гибабе (https://dikiy1111325.github.io/site/ ) реализую ниже перечисленные функции с помощью Supabase(обязательно наужно учитывать что у Supabase бесплатный тариф), пиши максимально подробно и учитывая специфику гитхаба и Supabase (бесплатный тариф)последовательность настройки функций:
Регистрация новых пользователей
Авторизация существующих пользователей
Управление сессиями
Восстановление пароля
Работа с подписками:

Управление тарифами
Обработка платежей
Реферальная система
Безопасность:

Шифрование данных
Защита от брутфорса
Валидация входных данных
Интерфейс:

Адаптивный дизайн
Всплывающие уведомления
Интерактивные формы 
index.html - Главная страница
login.html - Страница входа
register.html - Страница регистрации
password-reset.html - Сброс пароля
invite.html - Система приглашений
vpn_client.html - Информация о VPN клиенте  + страница имеет кнопку при нажатии на которую пользователь выполнив все предписаные условия копирует в буфер ссылку-ключ для подключения к серверу Xray который передается сайту от сервера и обновляется (вопрос: нужно определить оптимальный способ)каждые 2 дня 
promovpnkey.html вероятно понадобится для размещения ссылки на подключение за инвайт.(пока не нужна)
subscription.html - Тарифы и подписки информация об выгоде 
pay.html - Страница оплаты
contact.html - Контактная форма
subscription VPN server.html подписка, собственный впн сервер (1мес, 6 мес, 12 мес)
subscription VPN.html подписка впн (1мес, 6 мес, 12 мес)
FAQ страницы:
faq1_vpn_serv.html об условиях предоставления сервиса (впн за инвайт, впн подписка, собственный впн сервер)
faq2_vpn_serv.html, информация о безопастности данных и преимуществах при использовани впн и протоколах vless механизмах xray
faq3_vpn_serv.html, -клиенте Hiddify подключение и настройки

так же есть следущие js:
js/config.js - Конфигурация Supabase с ключами доступа
js/init.js - Инициализация приложения
js/form-check.js - Валидация форм
Основные JavaScript файлы:

js/auth.js - Управление аутентификацией, включая:
Регистрация пользователей
Вход в систему
Управление сессиями
Защита от брутфорса
Валидация паролей
js/supabase.js - Работа с Supabase, включая:
Инициализация клиента
Управление профилями
Работа с подписками
Система рефералов 
НО НУЖНО ОБЯЗАТЕЛЬНО УЧИТЫВАТЬ ЧТО В НИХ ОШИБки и при работе с ними требуется ревизия их кода