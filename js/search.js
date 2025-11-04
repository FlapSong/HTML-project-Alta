// js/search.js
class ProductSearch {
  constructor() {
    this.searchInput = document.getElementById("searchInput");
    this.searchSuggestions = document.querySelector(".search-suggestions");
    this.productsGrid = document.querySelector(".wb-products-grid");
    this.allProducts = [];
    this.searchTimeout = null;

    // Определяем тип страницы
    this.isBasketPage = window.location.pathname.includes("basket.html");

    this.init();
  }

  init() {
    if (!this.searchInput) {
      console.log("Search input not found");
      return;
    }

    // Для главной страницы загружаем товары
    if (!this.isBasketPage) {
      if (!this.productsGrid) {
        console.log("Products grid not found");
        return;
      }
      this.loadProducts();

      // Автозаполнение поиска из URL параметра и выполнение поиска
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get("search");
      if (searchQuery) {
        this.searchInput.value = searchQuery;
        // Выполняем поиск после небольшой задержки, чтобы товары успели загрузиться
        setTimeout(() => {
          this.performSearch(searchQuery);
        }, 100);
      }
    }

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
    // Поиск при вводе (только для главной страницы)
    this.searchInput.addEventListener("input", (e) => {
      this.handleSearchInput(e.target.value);
    });

    // Enter для поиска - работает на обеих страницах
    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const query = e.target.value.trim();
        if (query) {
          if (this.isBasketPage) {
            // На странице корзины - сразу переходим на главную с поиском
            e.preventDefault();
            window.location.href = `index.html?search=${encodeURIComponent(
              query
            )}`;
          } else {
            // На главной - выполняем поиск
            this.performSearch(query);
            this.hideSuggestions();
          }
        }
      }
    });

    // Клик вне области поиска
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".header-search")) {
        this.hideSuggestions();
      }
    });

    // Фокус на поле ввода - показываем подсказки
    this.searchInput.addEventListener("focus", () => {
      this.showSuggestions(this.searchInput.value);
    });

    // Обработка кликов по подсказкам
    if (this.searchSuggestions) {
      this.searchSuggestions.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem && !suggestionItem.classList.contains('no-results')) {
          // Берем текст из data-атрибута, чтобы избежать проблем с HTML-разметкой
          const query = suggestionItem.getAttribute('data-suggestion-text');
          
          if (this.isBasketPage) {
            // На странице корзины - перенаправляем на главную с поиском
            window.location.href = `index.html?search=${encodeURIComponent(query)}`;
          } else {
            // На главной странице - выполняем поиск
            this.searchInput.value = query;
            this.performSearch(query);
            this.hideSuggestions();
          }
        }
      });
    }
  }

  handleSearchInput(query) {
    const searchTerm = query.trim();

    if (searchTerm.length > 0) {
      this.showSuggestions(searchTerm);

      if (this.isBasketPage) {
        // На корзине - только подсказки, без автопоиска
        return;
      }

      // На главной - поиск с задержкой
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.performSearch(searchTerm);
      }, 300);
    } else {
      this.hideSuggestions();
      if (!this.isBasketPage) {
        this.showAllProducts();
      }
    }
  }

  showSuggestions(query) {
    if (!this.searchSuggestions) return;

    const suggestions = this.getSuggestions(query);
    this.renderSuggestions(suggestions);
    this.searchSuggestions.classList.add("show");
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
      noResults.className = "suggestion-item no-results";
      noResults.textContent = "Ничего не найдено";
      noResults.style.color = "#999";
      noResults.style.cursor = "default";
      this.searchSuggestions.appendChild(noResults);
      return;
    }

    suggestions.forEach((suggestion) => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      
      // Сохраняем оригинальный текст подсказки в data-атрибут
      item.setAttribute('data-suggestion-text', suggestion);
      
      if (this.isBasketPage) {
        // На корзине - добавляем красивую стрелочку
        item.innerHTML = `
          <span class="suggestion-text">${suggestion}</span>
          <span class="suggestion-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        `;
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.justifyContent = "space-between";
      } else {
        // На главной - обычный текст (без стрелочек)
        item.textContent = suggestion;
      }
      
      item.setAttribute('data-search', suggestion.toLowerCase());
      this.searchSuggestions.appendChild(item);
    });
  }

  performSearch(query) {
    const searchTerm = query.toLowerCase().trim();

    if (searchTerm === "") {
      if (!this.isBasketPage) {
        this.showAllProducts();
      }
      return;
    }

    // На странице корзины - сразу переходим на главную
    if (this.isBasketPage) {
      window.location.href = `index.html?search=${encodeURIComponent(
        searchTerm
      )}`;
      return;
    }

    // УЛУЧШЕННЫЙ ПОИСК: ищем по частичному совпадению
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

    // Показываем ТОЛЬКО результаты поиска
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
        <p style="color: #666; margin-top: 0.5rem;">Попробуйте изменить запрос</p>
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
      this.searchSuggestions.classList.remove("show");
    }
  }
}