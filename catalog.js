document.addEventListener('DOMContentLoaded', () => {
  // --- 1. ДАННЫЕ ---
  const products = [
    { id: 1, name: 'Комплексное удобрение', category: 'Минеральные удобрения', price: 250, image: 'Images/grunt.webp', description: 'Содержит сбалансированный набор макро- и микроэлементов.' },
    { id: 2, name: 'Органическое удобрение BIO', category: 'Органические удобрения', price: 180, image: 'Images/grunt.webp', description: 'Экологически чистый продукт на основе компоста.' },
    { id: 3, name: 'Грунт универсальный',      category: 'Субстраты и грунты',       price: 150, image: 'Images/grunt.webp', description: 'Подходит для рассады и комнатных растений.' },
    { id: 4, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
	  { id: 5, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
	    { id: 6, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
		  { id: 7, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
		    { id: 8, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
			  { id: 9, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
			    { id: 10, name: 'Стимулятор роста X',      category: 'Стимуляторы роста',        price: 300, image: 'Images/grunt.webp', description: 'Ускоряет образование корней и цветение.' },
    // ...добавьте остальные товары
  ];

  // --- 2. СОСТОЯНИЕ ФИЛЬТРОВ И КОРЗИНЫ ---
  let filters = {
    search: '',
    categories: [],    // [] — все категории
    minPrice: 0,
    maxPrice: Infinity,
    sortBy: 'default'  // 'price_asc' | 'price_desc'
  };
  let cart = [];

  let currentPage = 1;
  const pageSize = 6; // товаров на страницу

  // --- 3. DOM-ЭЛЕМЕНТЫ ---
  const productsGrid     = document.getElementById('products-grid');
  const foundCountElem   = document.getElementById('found-count');
  const searchInput      = document.getElementById('search');
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const minPriceInput    = document.getElementById('min-price');
  const maxPriceInput    = document.getElementById('max-price');
  const sortSelect       = document.getElementById('sort');
  const applyFiltersBtn  = document.getElementById('apply-filters-btn');
  const resetFiltersBtn  = document.getElementById('reset-filters-btn');
  const modal            = document.getElementById('product-modal');
  const modalContent     = modal.querySelector('.bg-white');
  const cartSidebar      = document.getElementById('cart-sidebar');
  const closeCartBtn     = document.getElementById('close-cart');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalElem    = document.getElementById('cart-total');
  const checkoutBtn      = document.getElementById('checkout-btn');

  // --- 4. ФУНКЦИИ ---

  // 4.1 Рендер карточек
  function renderProducts(productsToRender) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';

    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = productsToRender.slice(startIndex, startIndex + pageSize);

    paginatedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-2xl shadow text-center';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover mb-4 rounded-lg">
            <h3 class="text-xl font-semibold mb-2">${product.name}</h3>
            <p class="text-gray-600 text-sm mb-4">${product.category}</p>
            <p class="text-green-700 font-bold mb-4">${product.price} руб.</p>
            <div class="flex justify-center gap-2">
                <button class="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700" onclick="openModal(${product.id})">Подробнее</button>
                <button class="bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300" onclick="addToCart(${product.id})">В корзину</button>
            </div>
        `;
        grid.appendChild(card);
    });

    renderPagination(productsToRender.length);
}

function renderPagination(totalItems) {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(totalItems / pageSize);
  pagination.innerHTML = '';

  const createBtn = (label, page, active = false, disabled = false) => {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = label;
      a.className = `px-3 py-2 border ${active ? 'bg-green-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`;
      if (page) {
          a.addEventListener('click', e => {
              e.preventDefault();
              if (!disabled) {
                  currentPage = page;
                  applyFilters();
              }
          });
      }
      return a;
  };

  // Назад
  pagination.appendChild(createBtn('Назад', currentPage - 1, false, currentPage === 1));

  for (let i = 1; i <= totalPages; i++) {
      pagination.appendChild(createBtn(i, i, i === currentPage));
  }

  // Вперед
  pagination.appendChild(createBtn('Вперед', currentPage + 1, false, currentPage === totalPages));
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  document.getElementById('checkout-modal').classList.remove('hidden');
});

document.getElementById('open-cart-btn').addEventListener('click', () => {
  document.getElementById('cart-sidebar').classList.remove('translate-x-full');
});

document.getElementById('close-cart').addEventListener('click', () => {
  document.getElementById('cart-sidebar').classList.add('translate-x-full');
});

document.getElementById('checkout-form').addEventListener('submit', function (e) {
    e.preventDefault();

    alert('Заказ успешно оформлен!');
    cart = [];
    updateCart();
    closeCheckout();
    closeCart(); // если используешь окно корзины
});

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

  // 4.2 Применение фильтров + сортировка
  function applyFilters() {
    let result = products.slice();

    // Поиск по имени
    if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Фильтр по категориям
    if (filters.categories.length) {
        result = result.filter(p => filters.categories.includes(p.category));
    }

    // Фильтр по цене
    result = result.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    // Сортировка по цене
    if (filters.sortBy === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
    }

    // ✅ Правильное обновление счётчика
    const foundCountElem = document.getElementById('found-count');
    if (foundCountElem) {
        foundCountElem.textContent = result.length;
    }

    renderProducts(result);
}

  // 4.3 Открыть модалку
  window.openModal = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    modalContent.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">${product.name}</h2>
          <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover rounded mb-4">
        <p class="mb-4">${product.description}</p>
        <p class="text-green-700 text-lg font-bold mb-4">${product.price} руб.</p>
        <button onclick="addToCart(${product.id}); closeModal();" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
          Добавить в корзину
        </button>
      </div>
    `;
    modal.classList.remove('hidden');
  };

  // 4.4 Закрыть модалку
  window.closeModal = function() {
    modal.classList.add('hidden');
  };

  // 4.5 Открыть/закрыть корзину
  function openCart() {
    cartSidebar.classList.remove('translate-x-full');
  }
  function closeCart() {
    cartSidebar.classList.add('translate-x-full');
  }
  closeCartBtn.addEventListener('click', closeCart);

  // 4.6 Работа с корзиной
  window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    cart.push(product);
    updateCart();
    openCart();
  };

  function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
  }

  function updateCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalElem = document.getElementById('cart-total');
    const countElem = document.getElementById('cart-count');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Ваша корзина пуста</div>';
        totalElem.textContent = '0 руб.';
        if (countElem) countElem.textContent = '0';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        const div = document.createElement('div');
        div.className = 'mb-4 flex justify-between items-center border-b pb-2';
        div.innerHTML = `
            <div>
                <p class="font-medium">${item.name}</p>
                <p class="text-sm text-gray-500">${item.price} руб.</p>
            </div>
            <button onclick="removeFromCart(${index})" class="text-red-500 hover:text-red-700">×</button>
        `;
        cartContainer.appendChild(div);
    });

    totalElem.textContent = `${total} руб.`;
    if (countElem) countElem.textContent = cart.length;
}

  // --- 5. ПОДВЕСКА ОБРАБОТЧИКОВ ФИЛЬТРОВ ---

  // Поиск
  searchInput.addEventListener('input', e => {
    filters.search = e.target.value;
    applyFilters();
  });

  // Категории (чекбоксы)
  categoryCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      filters.categories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
        .map(el => el.value);
      applyFilters();
    });
  });

  // Цена
  minPriceInput.addEventListener('input', e => {
    filters.minPrice = parseFloat(e.target.value) || 0;
    applyFilters();
  });
  maxPriceInput.addEventListener('input', e => {
    filters.maxPrice = parseFloat(e.target.value) || Infinity;
    applyFilters();
  });

  // Сортировка по цене
  sortSelect.addEventListener('change', e => {
    filters.sortBy = e.target.value;
    applyFilters();
  });

  // Кнопка «Применить фильтры»
  applyFiltersBtn.addEventListener('click', applyFilters);

  // Кнопка «Сбросить фильтры»
  resetFiltersBtn.addEventListener('click', () => {
    // Сброс состояния
    filters = { search: '', categories: [], minPrice: 0, maxPrice: Infinity, sortBy: 'default' };
    // Сброс UI
    searchInput.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    categoryCheckboxes.forEach(cb => cb.checked = false);
    sortSelect.value = 'default';
    applyFilters();
  });

  // --- 6. СТАРТОВЫЙ РЕНДЕР ---
  applyFilters();
});