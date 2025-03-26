import { createClient } from '@supabase/supabase-js'

// Инициализация клиента
const supabase = createClient(
  'https://xqlsfatnvjicffaxhvam.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbHNmYXRudmppY2ZmYXhodmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MDEzODgsImV4cCI6MjA1ODM3NzM4OH0.iwN2H48Z3k8BFACZgLyncVvtRSy0WHqvfVsWbK9dfSw
' // Замените на реальный ключ
)

// Валидация email
function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(ru|com|net)$/
  return emailRegex.test(email)
}

// Валидация пароля
function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/
  return passwordRegex.test(password)
}

// Обработчик формы
document.addEventListener('DOMContentLoaded', async function() {
  const form = document.getElementById('register-form')
  const messageElement = document.getElementById('register-message')

  if (!form || !messageElement) return

  form.addEventListener('submit', async function(e) {
    e.preventDefault()

    const email = document.getElementById('register-email').value.trim()
    const password = document.getElementById('register-password').value.trim()
    const confirmPassword = document.getElementById('register-confirm-password').value.trim()

    // Валидация
    if (!validateEmail(email)) {
      showError('Введите корректный email (разрешены домены .ru, .com, .net)')
      return
    }

    if (!validatePassword(password)) {
      showError('Пароль должен содержать 8+ символов, заглавную букву и цифру')
      return
    }

    if (password !== confirmPassword) {
      showError('Пароли не совпадают')
      return
    }

    try {
      showMessage('Регистрация...', 'blue')

      // Вызов Edge Function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          email: email,
          password: password // В реальном проекте пароль не должен передаваться так!
        }
      })

      if (error) throw error

      showMessage('Регистрация успешна! Проверьте email.', 'green')
      form.reset()
      
      setTimeout(() => {
        window.location.href = 'login.html'
      }, 3000)

    } catch (error) {
      console.error('Ошибка регистрации:', error)
      showError(error.message || 'Ошибка при регистрации')
    }
  })

  function showMessage(text, color) {
    messageElement.textContent = text
    messageElement.style.color = color
  }

  function showError(text) {
    showMessage(text, 'red')
  }
})