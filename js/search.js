// js/search.js
class ProductSearch {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchSuggestions = document.querySelector(".search-suggestions");
    this.productsGrid = document.querySelector(".wb-products-grid");
    this.allProducts = [];

    this.init();
  }

  init() {
    if (!this.searchInput) {
      return;
    }

    if (!this.productsGrid) {
      return;
    }

    this.loadProducts();
    this.setupEventListeners();
  }

  loadProducts() {
    const productCards = document.querySelectorAll(".wb-product-card");

    this.allProducts = Array.from(productCards).map((card, index) => {
      const titleElement = card.querySelector(".wb-product-title");
      return {
        element: card,
        title: titleElement ? titleElement.textContent.toLowerCase() : "",
        originalDisplay: window.getComputedStyle(card).display,
        index: index,
      };
    });
  }

  setupEventListeners() {
    // Поиск при вводе
    this.searchInput.addEventListener("input", (e) => {
      this.handleSearchInput(e.target.value);
    });

    // Enter для поиска
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.performSearch(e.target.value);
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) {
        this.hideSuggestions();
      }
    });

    this.searchInput.addEventListener("focus", () => {
      this.showSuggestions(this.searchInput.value);
    });
  }

  handleSearchInput(query) {
    const searchTerm = query.trim();

    if (searchTerm.length > 0) {
      this.showSuggestions(searchTerm);
      // Поиск с задержкой
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.performSearch(searchTerm);
      }, 300);
    } else {
      this.hideSuggestions();
      this.showAllProducts();
    }
  }

  showSuggestions(query) {
    if (!this.searchSuggestions) return;

    const suggestions = this.getSuggestions(query);
    this.renderSuggestions(suggestions);
    this.searchSuggestions.style.display = "block";
  }

  getSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    const allSuggestions = [
      "худи",
      "футболка",
      "шорты",
      "джинсы",
      "кроссовки",
      "куртка",
      "рубашка",
      "штаны",
      "шапка",
      "свитшот",
    ];

    return allSuggestions
      .filter((item) => item.includes(lowerQuery))
      .slice(0, 5);
  }

  renderSuggestions(suggestions) {
    if (!this.searchSuggestions) return;

    this.searchSuggestions.innerHTML = "";

    suggestions.forEach((suggestion) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent =
        suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
      item.onclick = () => {
        this.searchInput.value = suggestion;
        this.performSearch(suggestion);
        this.hideSuggestions();
      };
      this.searchSuggestions.appendChild(item);
    });
  }

  performSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    if (searchTerm === "") {
      this.showAllProducts();
      return;
    }

    const results = this.allProducts.filter((product) =>
      product.title.includes(searchTerm)
    );
    this.displaySearchResults(results, searchTerm);
  }

  displaySearchResults(results, query) {
    // Скрываем все товары
    this.allProducts.forEach((product) => {
      product.element.style.display = "none";
    });

    // Показываем результаты
    results.forEach((result) => {
      result.element.style.display = result.originalDisplay;
    });

    this.showSearchMessage(results.length, query);
  }

  showAllProducts() {
    this.allProducts.forEach((product) => {
      product.element.style.display = product.originalDisplay;
    });
    this.hideSearchMessage();
  }

  showSearchMessage(resultsCount, query) {
    this.hideSearchMessage();

    const message = document.createElement("div");
    message.className = "search-message";

    if (resultsCount === 0) {
      message.innerHTML = `
                <h3>😔 Ничего не найдено</h3>
                <p>По запросу "<strong>${query}</strong>" товаров не найдено.</p>
            `;
    } else {
      message.innerHTML = `
                <h3>🎉 Найдено товаров: ${resultsCount}</h3>
                <p>Результаты по запросу: "<strong>${query}</strong>"</p>
            `;
    }

    if (this.productsGrid && this.productsGrid.parentNode) {
      this.productsGrid.parentNode.insertBefore(message, this.productsGrid);
    }
  }

  hideSearchMessage() {
    const existingMessage = document.querySelector(".search-message");
    if (existingMessage) {
      existingMessage.remove();
    }
  }

  hideSuggestions() {
    if (this.searchSuggestions) {
      this.searchSuggestions.style.display = "none";
    }
  }
}

// Простая инициализация
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    try {
      window.productSearch = new ProductSearch();
    } catch (error) {}
  }, 500);
});
