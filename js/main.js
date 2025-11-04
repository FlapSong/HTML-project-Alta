// js/main.js - общая инициализация для всех страниц
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing main.js...');
    
    // Инициализация поиска на всех страницах
    if (document.getElementById('searchInput')) {
        console.log('Initializing search...');
        new ProductSearch();
    }
    
    // Инициализация корзины если есть кнопки добавления
    if (document.querySelector('.wb-add-to-cart-btn')) {
        console.log('Initializing cart manager...');
        window.cartManager = new CartManager();
    }
    
    // Инициализация скролла шапки
    if (document.querySelector('.site-header')) {
        console.log('Initializing scroll header...');
        const header = document.querySelector('.site-header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Обновление счетчика корзины
    function updateCartCounter() {
        const cart = JSON.parse(
            localStorage.getItem("shopCart") || '{"items": [], "totalCount": 0}'
        );
        const cartCount = document.querySelector(".cart-count");

        if (cartCount) {
            const previousCount = parseInt(cartCount.textContent) || 0;
            const newCount = cart.totalCount;

            cartCount.textContent = newCount;

            // Анимация изменения счетчика
            if (newCount !== previousCount) {
                cartCount.classList.add("cart-count-update");
                setTimeout(() => {
                    cartCount.classList.remove("cart-count-update");
                }, 300);
            }

            // Показываем/скрываем счетчик
            if (newCount > 0) {
                cartCount.style.display = "flex";

                // Добавляем класс для большого количества
                if (newCount > 9) {
                    cartCount.classList.add("high-count");
                } else {
                    cartCount.classList.remove("high-count");
                }

                // Анимация добавления
                cartCount.classList.add("cart-add-animation");
                setTimeout(() => {
                    cartCount.classList.remove("cart-add-animation");
                }, 500);
            } else {
                cartCount.style.display = "none";
            }
        }
    }
    
    // Инициализируем счетчик
    updateCartCounter();
    
    // Обновляем при изменениях в localStorage
    window.addEventListener("storage", function (e) {
        if (e.key === "shopCart") {
            updateCartCounter();
        }
    });
});