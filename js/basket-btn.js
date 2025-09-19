// Добавьте этот код для работы счетчика корзины
document.addEventListener("DOMContentLoaded", function () {
  // Функция для обновления счетчика корзины
  function updateCartCounter() {
    // Получаем текущее состояние корзины из localStorage
    const cart = JSON.parse(
      localStorage.getItem("shopCart") || '{"items": [], "totalCount": 0}'
    );
    const cartCount = document.querySelector(".cart-count");

    if (cartCount) {
      cartCount.textContent = cart.totalCount;

      // Показываем/скрываем счетчик
      if (cart.totalCount > 0) {
        cartCount.style.display = "flex";
        cartCount.classList.add("cart-add-animation");
        setTimeout(() => cartCount.classList.remove("cart-add-animation"), 500);
      } else {
        cartCount.style.display = "none";
      }
    }
  }

  // Обновляем счетчик при загрузке страницы
  updateCartCounter();
});

// Анимация добавления в корзину
const cartAddAnimation = `
@keyframes cartBounce {
    0%, 20%, 50%, 80%, 100% {
        transform: scale(1);
    }
    40% {
        transform: scale(1.3);
    }
    60% {
        transform: scale(1.1);
    }
}

.cart-add-animation {
    animation: cartBounce 0.5s ease;
}
`;

// Добавляем стили анимации
const style = document.createElement("style");
style.textContent = cartAddAnimation;
document.head.appendChild(style);
