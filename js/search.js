// js/search.js
class ProductSearch {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchSuggestions = document.querySelector(".search-suggestions");
    this.productsGrid = document.querySelector(".wb-products-grid");
    this.allProducts = [];
    this.searchTimeout = null;

    this.init();
  }

  init() {
    if (!this.searchInput) {
      console.log("Search input not found");
      return;
    }

    if (!this.productsGrid) {
      console.log("Products grid not found");
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
        originalDisplay: card.style.display || "block",
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
        this.hideSuggestions();
      }
    });

    // Клик вне области поиска
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".header-search")) {
        this.hideSuggestions();
      }
    });

    // Фокус на поле ввода
    this.searchInput.addEventListener("focus", () => {
      this.showSuggestions(this.searchInput.value);
    });

    // Обработка кликов по подсказкам
    if (this.searchSuggestions) {
      this.searchSuggestions.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
          this.searchInput.value = e.target.textContent;
          this.performSearch(e.target.textContent);
          this.hideSuggestions();
        }
      });
    }
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
    this.searchSuggestions.classList.add('show');
  }

  getSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    const allSuggestions = [
      "худи мужское",
      "футболка мужская", 
      "шорты мужские",
      "джинсы мужские",
      "кроссовки мужские",
      "куртка мужская",
      "рубашка мужская",
      "штаны мужские",
      "шапка мужская",
      "свитшот мужской",
    ];

    return allSuggestions
      .filter((item) => item.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  }

  renderSuggestions(suggestions) {
    if (!this.searchSuggestions) return;

    this.searchSuggestions.innerHTML = "";

    if (suggestions.length === 0) {
      const noResults = document.createElement("div");
      noResults.className = "suggestion-item";
      noResults.textContent = "Ничего не найдено";
      noResults.style.color = "#999";
      noResults.style.cursor = "default";
      noResults.onclick = null;
      this.searchSuggestions.appendChild(noResults);
      return;
    }

    suggestions.forEach((suggestion) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      item.textContent = suggestion;
      item.setAttribute('data-search', suggestion.toLowerCase());
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
      result.element.style.display = "block";
    });

    this.showSearchMessage(results.length, query);
  }

  showAllProducts() {
    this.allProducts.forEach((product) => {
      product.element.style.display = "block";
    });
    this.hideSearchMessage();
  }

  showSearchMessage(resultsCount, query) {
    this.hideSearchMessage();

    const message = document.createElement("div");
    message.className = "search-message";
    message.style.cssText = `
      text-align: center;
      padding: 2rem;
      margin: 2rem 0;
      background: #f8f9fa;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    `;

    if (resultsCount === 0) {
      message.innerHTML = `
        <h3 style="color: #6c757d; margin-bottom: 1rem;">😔 Ничего не найдено</h3>
        <p style="color: #495057; margin: 0;">По запросу "<strong>${query}</strong>" товаров не найдено.</p>
      `;
    } else {
      message.innerHTML = `
        <h3 style="color: #28a745; margin-bottom: 1rem;">🎉 Найдено товаров: ${resultsCount}</h3>
        <p style="color: #495057; margin: 0;">Результаты по запросу: "<strong>${query}</strong>"</p>
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
      this.searchSuggestions.classList.remove('show');
    }
  }
}

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", function () {
  new ProductSearch();
});