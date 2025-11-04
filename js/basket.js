class BasketManager {
  constructor() {
    this.basketItems = document.getElementById("basketItems");
    this.basketSummary = document.querySelector(".basket-summary-section");
    this.emptyBasket = document.getElementById("emptyBasket");
    this.totalAmount = document.getElementById("totalAmount");
    this.itemsTotal = document.getElementById("itemsTotal");
    this.discountAmount = document.getElementById("discountAmount");
    this.itemsCount = document.getElementById("itemsCount");
    this.basketCount = document.getElementById("basketCount");
    this.checkoutBtn = document.getElementById("checkoutBtn");
    this.clearBasketBtn = document.getElementById("clearBasket");

    // Проверяем, что элементы существуют перед инициализацией
    if (this.basketItems && this.emptyBasket) {
      this.init();
    }
  }

  init() {
    this.displayBasketItems();
    this.setupEventListeners();
  }

  getCart() {
    try {
      return JSON.parse(
        localStorage.getItem("shopCart") || '{"items": [], "totalCount": 0}'
      );
    } catch (error) {
      console.error("Ошибка при чтении корзины:", error);
      return { items: [], totalCount: 0 };
    }
  }

  saveCart(cart) {
    try {
      localStorage.setItem("shopCart", JSON.stringify(cart));
      this.updateCartCounter();
    } catch (error) {
      console.error("Ошибка при сохранении корзины:", error);
    }
  }

  updateCartCounter() {
    const cart = this.getCart();
    const cartCount = document.querySelector(".cart-count");

    if (cartCount) {
      cartCount.textContent = cart.totalCount;
      cartCount.style.display = cart.totalCount > 0 ? "flex" : "none";
    }
  }

  updateBasketCount() {
    const cart = this.getCart();
    if (this.basketCount) {
      const itemCount = cart.totalCount || 0;
      if (itemCount === 0) {
        this.basketCount.textContent = "Корзина пуста";
      } else {
        this.basketCount.textContent = `${itemCount} ${this.getRussianWord(itemCount, ['товар', 'товара', 'товаров'])}`;
      }
    }
  }

  getRussianWord(number, words) {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
  }

  displayBasketItems() {
    const cart = this.getCart();

    // Правильно проверяем, пуста ли корзина
    const isEmpty = !cart.items || cart.items.length === 0 || cart.totalCount === 0;

    if (isEmpty) {
      this.showEmptyBasket();
      return;
    }

    this.showBasketContent();
    this.updateBasketCount();

    // Безопасное создание HTML
    try {
      this.basketItems.innerHTML = cart.items
        .map(
          (item) => `
            <div class="basket-item" data-product-id="${item.id || ''}">
                <div class="basket-item-image">
                    <img src="${item.image || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${item.title || 'Товар'}" onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
                </div>
                <div class="basket-item-info">
                    <h3 class="basket-item-title">${item.title || 'Без названия'}</h3>
                    <div class="basket-item-meta">
                        <div class="basket-item-color">${this.getRandomColor()}</div>
                        <div class="basket-item-delivery">Послезавтра</div>
                    </div>
                </div>
                <div class="basket-item-price-section">
                    <div class="basket-item-price">${this.formatPrice(item.price || '0')}</div>
                    <div class="basket-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-action="decrease" ${(item.quantity || 0) <= 1 ? "disabled" : ""}>-</button>
                            <span class="quantity-display">${item.quantity || 1}</span>
                            <button class="quantity-btn plus" data-action="increase">+</button>
                        </div>
                        <button class="remove-btn" data-action="remove">Удалить</button>
                    </div>
                </div>
            </div>
        `
        )
        .join("");
    } catch (error) {
      console.error("Ошибка при отображении товаров:", error);
      this.basketItems.innerHTML = '<div class="error-message">Ошибка при загрузке товаров</div>';
    }

    this.updateTotal();
  }

  getRandomColor() {
    const colors = ["черный", "белый", "серый", "синий", "красный", "зеленый"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  formatPrice(price) {
    try {
      const numericPrice = parseInt(String(price).replace(/[^\d]/g, "")) || 0;
      return new Intl.NumberFormat("ru-RU").format(numericPrice) + " ₽";
    } catch (error) {
      return "0 ₽";
    }
  }

  parsePrice(price) {
    try {
      return parseInt(String(price).replace(/[^\d]/g, "")) || 0;
    } catch (error) {
      return 0;
    }
  }

  calculateTotal() {
    const cart = this.getCart();
    
    // Если корзина пуста, возвращаем нули
    if (!cart.items || !Array.isArray(cart.items) || cart.items.length === 0) {
      return { itemsTotal: 0, discount: 0, finalTotal: 0 };
    }

    const itemsTotal = cart.items.reduce((total, item) => {
      const price = this.parsePrice(item.price);
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);

    const discount = Math.round(itemsTotal * 0.35);
    const finalTotal = Math.max(0, itemsTotal - discount);

    return {
      itemsTotal,
      discount,
      finalTotal
    };
  }

  updateTotal() {
    const totals = this.calculateTotal();
    const cart = this.getCart();
    
    if (this.itemsTotal) {
      this.itemsTotal.textContent = new Intl.NumberFormat("ru-RU").format(totals.itemsTotal) + " ₽";
    }
    
    if (this.discountAmount) {
      this.discountAmount.textContent = totals.discount > 0 ? "-" + new Intl.NumberFormat("ru-RU").format(totals.discount) + " ₽" : "0 ₽";
    }
    
    if (this.totalAmount) {
      this.totalAmount.textContent = new Intl.NumberFormat("ru-RU").format(totals.finalTotal) + " ₽";
    }
    
    if (this.itemsCount) {
      const itemCount = cart.totalCount || 0;
      if (itemCount === 0) {
        this.itemsCount.textContent = "Товары (0 шт)";
      } else {
        this.itemsCount.textContent = `Товары (${itemCount} ${this.getRussianWord(itemCount, ['шт', 'шт', 'шт'])})`;
      }
    }
  }

  showEmptyBasket() {
    if (this.emptyBasket) {
      this.emptyBasket.style.display = "block";
    }
    if (this.basketSummary) {
      this.basketSummary.style.display = "none";
    }
    if (this.basketItems) {
      this.basketItems.innerHTML = "";
    }
    // Обновляем счетчики при пустой корзине
    this.updateBasketCount();
    this.updateTotal();
  }

  showBasketContent() {
    if (this.emptyBasket) {
      this.emptyBasket.style.display = "none";
    }
    if (this.basketSummary) {
      this.basketSummary.style.display = "block";
    }
  }

  setupEventListeners() {
    // Обработчик для элементов корзины
    if (this.basketItems) {
      this.basketItems.addEventListener("click", (e) => {
        const button = e.target.closest("button");
        if (!button) return;

        const action = button.dataset.action;
        const basketItem = button.closest(".basket-item");
        
        if (!basketItem) return;
        
        const productId = basketItem.dataset.productId;
        this.handleItemAction(productId, action);
      });
    }

    // Обработчик для кнопки оформления заказа
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener("click", () => {
        this.handleCheckout();
      });
    }

    // Обработчик для кнопки очистки корзины
    if (this.clearBasketBtn) {
      this.clearBasketBtn.addEventListener("click", () => {
        this.showClearConfirmation();
      });
    }
  }

  handleItemAction(productId, action) {
    const cart = this.getCart();
    
    if (!cart.items || !Array.isArray(cart.items)) {
      return;
    }

    const itemIndex = cart.items.findIndex((item) => item.id === productId);

    if (itemIndex === -1) return;

    switch (action) {
      case "increase":
        cart.items[itemIndex].quantity = (cart.items[itemIndex].quantity || 1) + 1;
        break;
      case "decrease":
        if (cart.items[itemIndex].quantity > 1) {
          cart.items[itemIndex].quantity -= 1;
        } else {
          cart.items.splice(itemIndex, 1);
        }
        break;
      case "remove":
        cart.items.splice(itemIndex, 1);
        break;
    }

    // Пересчитываем общее количество товаров
    cart.totalCount = cart.items.reduce(
      (total, item) => total + (item.quantity || 1),
      0
    );

    this.saveCart(cart);
    this.displayBasketItems();
  }

  showClearConfirmation() {
    const cart = this.getCart();
    
    if (!cart.items || cart.items.length === 0) {
      this.showNotification("Корзина уже пуста", "В корзине нет товаров для удаления", "info");
      return;
    }

    // Создаем плашку подтверждения
    const confirmation = document.createElement("div");
    confirmation.className = "wb-confirmation-modal";
    confirmation.innerHTML = `
      <div class="wb-confirmation-content">
        <div class="wb-confirmation-header">
          <h3 class="wb-confirmation-title">Очистить корзину?</h3>
          <button class="wb-confirmation-close">&times;</button>
        </div>
        <div class="wb-confirmation-body">
          <p>Вы уверены, что хотите удалить все товары из корзины? Это действие нельзя отменить.</p>
          <div class="wb-confirmation-stats">
            <span>Товаров в корзине: <strong>${cart.totalCount}</strong></span>
            <span>Общая сумма: <strong>${this.calculateTotal().finalTotal.toLocaleString('ru-RU')} ₽</strong></span>
          </div>
        </div>
        <div class="wb-confirmation-actions">
          <button class="wb-confirmation-btn wb-confirmation-cancel">Отмена</button>
          <button class="wb-confirmation-btn wb-confirmation-confirm">Очистить корзину</button>
        </div>
      </div>
    `;

    // Добавляем стили
    if (!document.querySelector('#confirmation-styles')) {
      const styles = document.createElement('style');
      styles.id = 'confirmation-styles';
      styles.textContent = `
        .wb-confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.3s ease;
        }
        
        .wb-confirmation-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: slideIn 0.3s ease;
        }
        
        .wb-confirmation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .wb-confirmation-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #000;
        }
        
        .wb-confirmation-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #999;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .wb-confirmation-close:hover {
          background: #f5f5f5;
          color: #000;
        }
        
        .wb-confirmation-body {
          padding: 20px 24px;
        }
        
        .wb-confirmation-body p {
          margin: 0 0 16px 0;
          color: #666;
          line-height: 1.5;
        }
        
        .wb-confirmation-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .wb-confirmation-stats span {
          display: flex;
          justify-content: space-between;
        }
        
        .wb-confirmation-stats strong {
          color: #000;
        }
        
        .wb-confirmation-actions {
          display: flex;
          gap: 12px;
          padding: 0 24px 20px 24px;
        }
        
        .wb-confirmation-btn {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }
        
        .wb-confirmation-cancel {
          background: #f8f9fa;
          color: #666;
        }
        
        .wb-confirmation-cancel:hover {
          background: #e9ecef;
        }
        
        .wb-confirmation-confirm {
          background: #ff3d00;
          color: white;
        }
        
        .wb-confirmation-confirm:hover {
          background: #ff6b35;
          transform: translateY(-1px);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(confirmation);

    // Обработчики событий
    const closeBtn = confirmation.querySelector('.wb-confirmation-close');
    const cancelBtn = confirmation.querySelector('.wb-confirmation-cancel');
    const confirmBtn = confirmation.querySelector('.wb-confirmation-confirm');

    const closeModal = () => {
      confirmation.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        if (confirmation.parentNode) {
          confirmation.remove();
        }
      }, 300);
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    confirmBtn.addEventListener('click', () => {
      this.saveCart({ items: [], totalCount: 0 });
      this.displayBasketItems();
      this.showNotification("Корзина очищена", "Все товары удалены из корзины", "success");
      closeModal();
    });

    // Закрытие по клику вне модального окна
    confirmation.addEventListener('click', (e) => {
      if (e.target === confirmation) {
        closeModal();
      }
    });
  }

  handleCheckout() {
    const cart = this.getCart();

    if (!cart.items || cart.items.length === 0 || cart.totalCount === 0) {
      this.showNotification(
        "Ошибка",
        "Корзина пуста! Добавьте товары перед оформлением заказа.",
        "error"
      );
      return;
    }

    // уведомление об успешном заказе
    this.showNotification(
      "Заказ оформлен!",
      `Спасибо за ваш заказ! Сумма: ${this.totalAmount?.textContent || '0 ₽'}. Мы свяжемся с вами в ближайшее время для подтверждения.`,
      "success"
    );

    // очищаем корзину
    this.saveCart({ items: [], totalCount: 0 });
    this.displayBasketItems();
  }

  // метод показа уведомлений
  showNotification(title, message, type = "success") {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll(".wb-notification");
    existingNotifications.forEach(notification => notification.remove());

    // Создание уведомления
    const notification = document.createElement("div");
    notification.className = `wb-notification ${type}`;

    notification.innerHTML = `
        <div class="wb-notification-icon">
            <svg viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        </div>
        <div class="wb-notification-content">
            <div class="wb-notification-title">${title}</div>
            <div class="wb-notification-message">${message}</div>
        </div>
        <button class="wb-notification-close">×</button>
    `;

    // Добавление на страницу
    document.body.appendChild(notification);

    // Обработчик закрытия
    const closeBtn = notification.querySelector(".wb-notification-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hideNotification(notification);
      });
    }

    // Автоматическое закрытие (5 секунд)
    setTimeout(() => {
      if (notification.parentNode) {
        this.hideNotification(notification);
      }
    }, 5000);
  }

  hideNotification(notification) {
    if (!notification) return;
    
    notification.classList.add("hiding");
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }
}

// Безопасная инициализация
document.addEventListener('DOMContentLoaded', function() {
  try {
    new BasketManager();
  } catch (error) {
    console.error("Ошибка при инициализации корзины:", error);
  }
});