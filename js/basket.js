class BasketManager {
    constructor() {
        this.basketItems = document.getElementById('basketItems');
        this.basketSummary = document.getElementById('basketSummary');
        this.emptyBasket = document.getElementById('emptyBasket');
        this.totalAmount = document.getElementById('totalAmount');
        this.checkoutBtn = document.getElementById('checkoutBtn');

        this.init();
    }

    init() {
        this.displayBasketItems();
        this.setupEventListeners();
    }

    getCart() {
        return JSON.parse(localStorage.getItem('shopCart') || '{"items": [], "totalCount": 0}');
    }

    saveCart(cart) {
        localStorage.setItem('shopCart', JSON.stringify(cart));
        this.updateCartCounter();
    }

    updateCartCounter() {
        const cart = this.getCart();
        const cartCount = document.querySelector('.cart-count');

        if (cartCount) {
            cartCount.textContent = cart.totalCount;
            cartCount.style.display = cart.totalCount > 0 ? 'flex' : 'none';
        }
    }

    displayBasketItems() {
        const cart = this.getCart();

        if (cart.items.length === 0) {
            this.showEmptyBasket();
            return;
        }

        this.showBasketContent();
        
        this.basketItems.innerHTML = cart.items.map(item => `
            <div class="basket-item" data-product-id="${item.id}">
                <div class="basket-item-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
                </div>
                <div class="basket-item-info">
                    <h3 class="basket-item-title">${item.title}</h3>
                    <div class="basket-item-price">${this.formatPrice(item.price)}</div>
                </div>
                <div class="basket-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn minus" data-action="decrease">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn plus" data-action="increase">+</button>
                    </div>
                    <button class="remove-btn" data-action="remove">Удалить</button>
                </div>
            </div>
        `).join('');

        this.updateTotal();
    }

    formatPrice(price) {
        const numericPrice = parseInt(price.replace(/[^\d]/g, ''));
        return new Intl.NumberFormat('ru-RU').format(numericPrice) + ' руб';
    }

    calculateTotal() {
        const cart = this.getCart();
        return cart.items.reduce((total, item) => {
            const price = parseInt(item.price.replace(/[^\d]/g, ''));
            return total + (price * item.quantity);
        }, 0);
    }

    updateTotal() {
        const total = this.calculateTotal();
        this.totalAmount.textContent = new Intl.NumberFormat('ru-RU').format(total) + ' руб';
    }

    showEmptyBasket() {
        this.emptyBasket.style.display = 'block';
        this.basketSummary.style.display = 'none';
        this.basketItems.innerHTML = '';
    }

    showBasketContent() {
        this.emptyBasket.style.display = 'none';
        this.basketSummary.style.display = 'block';
    }

    setupEventListeners() {
        this.basketItems.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            const basketItem = button.closest('.basket-item');
            const productId = basketItem.dataset.productId;

            this.handleItemAction(productId, action);
        });

        this.checkoutBtn.addEventListener('click', () => {
            this.handleCheckout();
        });
    }

    handleItemAction(productId, action) {
        const cart = this.getCart();
        const itemIndex = cart.items.findIndex(item => item.id === productId);

        if (itemIndex === -1) return;

        switch (action) {
            case 'increase':
                cart.items[itemIndex].quantity += 1;
                break;
            case 'decrease':
                if (cart.items[itemIndex].quantity > 1) {
                    cart.items[itemIndex].quantity -= 1;
                } else {
                    cart.items.splice(itemIndex, 1);
                }
                break;
            case 'remove':
                cart.items.splice(itemIndex, 1);
                break;
        }

        cart.totalCount = cart.items.reduce((total, item) => total + item.quantity, 0);

        this.saveCart(cart);
        this.displayBasketItems();
    }

    handleCheckout() {
        const cart = this.getCart();

        if (cart.items.length === 0) {
            alert('Корзина пуста!');
            return;
        }

        alert(`Заказ оформлен! Сумма: ${this.totalAmount.textContent}`);
        this.saveCart({ items: [], totalCount: 0 });
        this.displayBasketItems();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    new BasketManager();
});