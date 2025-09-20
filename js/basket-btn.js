document.addEventListener("DOMContentLoaded", function () {
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

  // Обновляем счетчик при загрузке
  updateCartCounter();

  window.addEventListener("storage", function (e) {
    if (e.key === "shopCart") {
      updateCartCounter();
    }
  });
});
