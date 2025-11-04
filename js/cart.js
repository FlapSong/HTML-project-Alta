// js/cart.js
class CartManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupAddToCartListeners();
        this.updateCartCounter(); // Инициализируем счетчик при загрузке
    }

    // Настройка обработчиков для кнопок "В корзину"
    setupAddToCartListeners() {
        const addToCartButtons = document.querySelectorAll('.wb-add-to-cart-btn');
        
        addToCartButtons.forEach(button => {
            // Удаляем существующие обработчики чтобы избежать дублирования
            button.replaceWith(button.cloneNode(true));
        });

        // Получаем обновленные кнопки
        const updatedButtons = document.querySelectorAll('.wb-add-to-cart-btn');
        
        updatedButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Защита от множественных кликов
                if (button.classList.contains('adding')) {
                    return;
                }
                
                button.classList.add('adding');
                const productCard = button.closest('.wb-product-card');
                this.addToCart(productCard, button);
            });
        });
    }

    // Добавление товара в корзину
    addToCart(productCard, button) {
        const productId = button.getAttribute('data-product-id');
        const productTitle = productCard.querySelector('.wb-product-title').textContent;
        const productPrice = productCard.querySelector('.wb-price-current').textContent;
        const productImage = productCard.querySelector('.wb-product-img').src;

        const productData = {
            id: productId,
            title: productTitle.trim(),
            price: productPrice.trim(),
            image: productImage,
            quantity: 1
        };

        this.saveToCart(productData);
        this.showAddToCartFeedback(button);
    }

    // Сохранение товара в localStorage
    saveToCart(productData) {
        let cart = JSON.parse(localStorage.getItem('shopCart') || '{"items": [], "totalCount": 0}');
        
        // Проверяем, есть ли уже такой товар в корзине
        const existingItemIndex = cart.items.findIndex(item => item.id === productData.id);
        
        if (existingItemIndex !== -1) {
            // Увеличиваем количество существующего товара
            cart.items[existingItemIndex].quantity += 1;
        } else {
            // Добавляем новый товар
            cart.items.push(productData);
        }
        
        // Пересчитываем общее количество товаров
        cart.totalCount = cart.items.reduce((total, item) => total + item.quantity, 0);
        
        localStorage.setItem('shopCart', JSON.stringify(cart));
        this.updateCartCounter();
    }

    // Обновление счетчика в шапке
    updateCartCounter() {
        const cart = JSON.parse(localStorage.getItem('shopCart') || '{"items": [], "totalCount": 0}');
        const cartCount = document.querySelector('.cart-count');
        
        if (cartCount) {
            cartCount.textContent = cart.totalCount;
            cartCount.style.display = cart.totalCount > 0 ? 'flex' : 'none';
            
            // Анимация счетчика
            cartCount.classList.add('cart-add-animation');
            setTimeout(() => {
                cartCount.classList.remove('cart-add-animation');
            }, 500);
        }
    }

    // Визуальный фидбэк при добавлении в корзину
    showAddToCartFeedback(button) {
        // Сохраняем оригинальный HTML чтобы точно восстановить
        const originalHTML = button.innerHTML;
        
        // Очищаем кнопку и устанавливаем новый текст
        button.innerHTML = '✓ Добавлено';
        button.classList.add('added');
        
        // Анимация нажатия
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
        
        // Возвращаем исходный текст через 2 секунды
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('added');
            button.classList.remove('adding'); // Разблокируем кнопку
        }, 2000);
    }

    // Метод для получения текущей корзины
    getCart() {
        return JSON.parse(localStorage.getItem('shopCart') || '{"items": [], "totalCount": 0}');
    }

    // Метод для очистки корзины (для отладки)
    clearCart() {
        localStorage.setItem('shopCart', JSON.stringify({"items": [], "totalCount": 0}));
        this.updateCartCounter();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    window.cartManager = new CartManager();
});