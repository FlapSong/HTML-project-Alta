// Основной класс для управления авторизацией
class WBAuth {
    constructor() {
        this.currentPhone = '';
        this.generatedCode = '1234'; // Фиксированный код
        this.isAuthenticated = false;
        this.initializeElements();
        this.bindEvents();
    }

    // Инициализация DOM элементов
    initializeElements() {
        // Кнопки и модальное окно
        this.loginBtn = document.getElementById('loginButton');
        this.authModal = document.getElementById('authModal');
        this.closeAuth = document.getElementById('closeAuth');
        
        // Формы
        this.phoneForm = document.getElementById('phoneForm');
        this.codeForm = document.getElementById('codeForm');
        
        // Элементы форм
        this.phoneInput = document.getElementById('phoneInput');
        this.codePhone = document.getElementById('codePhone');
        this.changePhone = document.getElementById('changePhone');
        this.backBtn = document.getElementById('backBtn');
        this.resendCode = document.getElementById('resendCode');
        this.timer = document.getElementById('timer');
        
        // Поля для кода
        this.codeInputs = document.querySelectorAll('.wb-code-input');
        this.submitCodeBtn = this.codeForm ? this.codeForm.querySelector('.wb-auth-submit') : null;
        
        // Таймер
        this.countdown = null;
        this.timeLeft = 59;
    }

    // Привязка событий
    bindEvents() {
        if (!this.loginBtn || !this.authModal) {
            console.error('Не найдены необходимые элементы!');
            return;
        }

        this.loginBtn.addEventListener('click', () => this.openModal());
        this.closeAuth.addEventListener('click', () => this.closeModal());
        this.authModal.addEventListener('click', (e) => {
            if (e.target === this.authModal) this.closeModal();
        });

        if (this.phoneForm) {
            this.phoneForm.addEventListener('submit', (e) => this.handlePhoneSubmit(e));
        }
        
        if (this.codeForm) {
            this.codeForm.addEventListener('submit', (e) => this.handleCodeSubmit(e));
        }
        
        if (this.backBtn) this.backBtn.addEventListener('click', () => this.showPhoneForm());
        if (this.changePhone) this.changePhone.addEventListener('click', () => this.showPhoneForm());
        if (this.resendCode) this.resendCode.addEventListener('click', () => this.resendSMS());

        this.codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => this.handleCodeInput(e, index));
            input.addEventListener('keydown', (e) => this.handleCodeKeydown(e, index));
            input.addEventListener('paste', (e) => this.handlePaste(e));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.authModal.classList.contains('active')) {
                this.closeModal();
            }
        });

        if (this.phoneInput) {
            this.phoneInput.addEventListener('input', (e) => this.formatPhoneNumber(e));
        }
    }

    // Открытие модального окна
    openModal() {
        this.authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.resetForms();
        
        if (this.phoneInput) {
            this.phoneInput.focus();
        }
    }

    // Закрытие модального окна
    closeModal() {
        this.authModal.classList.remove('active');
        document.body.style.overflow = '';
        this.resetForms();
    }

    // Показать форму телефона
    showPhoneForm() {
        if (this.codeForm && this.phoneForm) {
            this.codeForm.classList.remove('active');
            this.phoneForm.classList.add('active');
            this.clearTimer();
            
            if (this.phoneInput) {
                this.phoneInput.focus();
            }
        }
    }

    // Обработка отправки номера телефона
    async handlePhoneSubmit(e) {
        e.preventDefault();
        
        if (!this.phoneInput) return;
        
        const phone = this.phoneInput.value.replace(/\D/g, '');
        
        if (!this.validatePhone(phone)) {
            this.showError('Введите корректный номер телефона');
            return;
        }

        try {
            const submitBtn = this.phoneForm.querySelector('.wb-auth-submit');
            if (submitBtn) {
                this.showLoading(submitBtn, 'Отправка...');
            }
            
            // Симуляция запроса к серверу
            await this.sendSMSCode(phone);
            
            this.currentPhone = this.phoneInput.value;
            
            if (this.codePhone) {
                this.codePhone.textContent = this.currentPhone;
            }
            
            this.showCodeForm();
            
        } catch (error) {
            this.showError('Ошибка отправки кода. Попробуйте позже.');
        }
    }

    // Обработка отправки кода
    async handleCodeSubmit(e) {
        e.preventDefault();
        
        const code = this.getEnteredCode();
        
        if (code.length !== 4) {
            this.showError('Введите полный код из 4 цифр');
            return;
        }

        try {
            if (this.submitCodeBtn) {
                this.showLoading(this.submitCodeBtn, 'Проверка...');
            }
            
            // Проверка кода - всегда 1234
            const isValid = await this.verifyCode(code);
            
            if (isValid) {
                await this.handleSuccessfulLogin();
            } else {
                this.handleInvalidCode();
            }
            
        } catch (error) {
            this.showError('Ошибка проверки кода. Попробуйте позже.');
        }
    }

    // Обработка ввода цифр кода
    handleCodeInput(e, index) {
        const value = e.target.value.replace(/\D/g, '');
        
        if (value) {
            e.target.value = value[0];
            e.target.classList.add('filled');
            
            // Автопереход к следующему полю
            if (index < this.codeInputs.length - 1) {
                this.codeInputs[index + 1].focus();
            }
        } else {
            e.target.classList.remove('filled');
        }
        
        this.checkCodeCompletion();
    }

    // Обработка Backspace в полях кода
    handleCodeKeydown(e, index) {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            this.codeInputs[index - 1].focus();
        }
    }

    // Обработка вставки кода
    handlePaste(e) {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
        
        if (pasteData.length === 4) {
            this.codeInputs.forEach((input, index) => {
                input.value = pasteData[index] || '';
                input.classList.toggle('filled', !!pasteData[index]);
            });
            this.checkCodeCompletion();
            
            if (this.codeInputs[3]) {
                this.codeInputs[3].focus();
            }
        }
    }

    // Показать форму кода
    showCodeForm() {
        if (this.phoneForm && this.codeForm) {
            this.phoneForm.classList.remove('active');
            this.codeForm.classList.add('active');
            this.startTimer();
            
            if (this.codeInputs[0]) {
                this.codeInputs[0].focus();
            }
        }
    }

    // Отправка кода (симуляция)
    async sendSMSCode(phone) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Всегда используем код 1234
                console.log(`📱 SMS отправлен на ${phone}. Код: 1234`);
                resolve(true);
            }, 1000);
        });
    }

    // Проверка кода - всегда 1234
    async verifyCode(code) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Простая проверка - код всегда 1234
                const isValid = code === '1234';
                resolve(isValid);
            }, 1000);
        });
    }

    // Успешная авторизация
    async handleSuccessfulLogin() {
        this.isAuthenticated = true;
        
        // Сохраняем в localStorage
        localStorage.setItem('wbAuth', JSON.stringify({
            phone: this.currentPhone,
            timestamp: Date.now()
        }));
        
        // Обновляем интерфейс
        if (this.loginBtn) {
            this.loginBtn.innerHTML = '<span class="wb-login-icon">👤</span> Мой профиль';
            this.loginBtn.classList.add('authenticated');
        }
        
        // Показываем уведомление
        this.showSuccess('Успешный вход!');
        
        // Закрываем модальное окно с задержкой
        setTimeout(() => {
            this.closeModal();
            this.onLoginSuccess();
        }, 1000);
    }

    // Обработка неверного кода
    handleInvalidCode() {
        this.showError('Неверный код. Используйте код 1234');
        this.clearCodeInputs();
        
        if (this.codeInputs[0]) {
            this.codeInputs[0].focus();
        }
        
        if (this.submitCodeBtn) {
            this.submitCodeBtn.disabled = false;
            this.submitCodeBtn.textContent = 'Войти';
        }
    }

    // Повторная отправка SMS
    resendSMS() {
        if (this.resendCode && !this.resendCode.disabled) {
            this.sendSMSCode(this.currentPhone.replace(/\D/g, ''));
            this.startTimer();
            this.showSuccess('Код отправлен повторно');
        }
    }

    // Запуск таймера
    startTimer() {
        this.timeLeft = 59;
        
        if (this.resendCode && this.timer) {
            this.resendCode.disabled = true;
            this.timer.textContent = this.timeLeft;
        }
        
        this.clearTimer();
        
        this.countdown = setInterval(() => {
            this.timeLeft--;
            
            if (this.timer) {
                this.timer.textContent = this.timeLeft;
            }
            
            if (this.timeLeft <= 0) {
                this.clearTimer();
                if (this.resendCode) {
                    this.resendCode.disabled = false;
                }
            }
        }, 1000);
    }

    // Валидация телефона
    validatePhone(phone) {
        return phone.length === 11 && phone.startsWith('7');
    }

    // Форматирование номера телефона
    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            value = '+7 (' + value;
            
            if (value.length > 7) value = value.slice(0, 7) + ') ' + value.slice(7);
            if (value.length > 12) value = value.slice(0, 12) + '-' + value.slice(12);
            if (value.length > 15) value = value.slice(0, 15) + '-' + value.slice(15, 17);
        }
        
        e.target.value = value;
    }

    // Получить введенный код
    getEnteredCode() {
        return Array.from(this.codeInputs).map(input => input.value).join('');
    }

    // Проверить заполнение кода
    checkCodeCompletion() {
        const code = this.getEnteredCode();
        if (this.submitCodeBtn) {
            this.submitCodeBtn.disabled = code.length !== 4;
        }
    }

    // Показать загрузку
    showLoading(button, text) {
        button.disabled = true;
        button.textContent = text;
    }

    // Показать ошибку
    showError(message) {
        alert(message);
    }

    // Показать успех
    showSuccess(message) {
        alert(message);
    }

    // Очистить поля кода
    clearCodeInputs() {
        this.codeInputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        this.checkCodeCompletion();
    }

    // Сбросить формы
    resetForms() {
        if (this.phoneForm && this.codeForm) {
            this.phoneForm.classList.add('active');
            this.codeForm.classList.remove('active');
        }
        
        if (this.phoneInput) {
            this.phoneInput.value = '';
        }
        
        this.clearCodeInputs();
        this.clearTimer();
        
        if (this.resendCode) {
            this.resendCode.disabled = true;
        }
        
        if (this.timer) {
            this.timer.textContent = '59';
        }
    }

    // Очистить таймер
    clearTimer() {
        if (this.countdown) {
            clearInterval(this.countdown);
            this.countdown = null;
        }
    }

    // Колбэк при успешном входе
    onLoginSuccess() {
        console.log('Пользователь успешно авторизован:', this.currentPhone);
    }

    // Проверка авторизации при загрузке страницы
    checkAuthStatus() {
        const authData = localStorage.getItem('wbAuth');
        if (authData && this.loginBtn) {
            try {
                const { phone, timestamp } = JSON.parse(authData);
                // Проверяем, не истекла ли сессия (например, 7 дней)
                if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
                    this.isAuthenticated = true;
                    this.currentPhone = phone;
                    this.loginBtn.innerHTML = '<span class="wb-login-icon">👤</span> Мой профиль';
                    this.loginBtn.classList.add('authenticated');
                } else {
                    localStorage.removeItem('wbAuth');
                }
            } catch (error) {
                console.error('Ошибка при проверке авторизации:', error);
                localStorage.removeItem('wbAuth');
            }
        }
    }

    // Выход из системы
    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('wbAuth');
        
        if (this.loginBtn) {
            this.loginBtn.innerHTML = '<span class="wb-login-icon">👤</span> Войти';
            this.loginBtn.classList.remove('authenticated');
        }
        
        this.showSuccess('Вы вышли из системы');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const wbAuth = new WBAuth();
    wbAuth.checkAuthStatus();
    
    window.wbAuth = wbAuth;
});