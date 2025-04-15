document.addEventListener('DOMContentLoaded', () => {
    let products = [];

    fetch('data/products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            applyFilters(); // запускаем фильтрацию и отображение
        })
        .catch(error => {
            console.error('Ошибка при загрузке товаров:', error);
        });

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
    const productsGrid = document.getElementById('products-grid');
    const foundCountElem = document.getElementById('found-count');
    const searchInput = document.getElementById('search');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const sortSelect = document.getElementById('sort');
    const applyFiltersBtn = document.getElementById('apply-filters-btn');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');
    const modal = document.getElementById('product-modal');
    const modalContent = modal.querySelector('.bg-white');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElem = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // --- 4. ФУНКЦИИ ---

    // 4.1 Рендер карточек
    function renderProducts(productsToRender) {
        // Проверяем существование элемента
        if (!productsGrid) {
            console.error('Элемент products-grid не найден');
            return;
        }

        productsGrid.innerHTML = '';

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
                    <button class="view-detail-btn bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700" data-id="${product.id}">Подробнее</button>
                    <button class="add-to-cart-btn bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300" data-id="${product.id}">В корзину</button>
                </div>
            `;
            productsGrid.appendChild(card);
        });

        // Добавляем обработчики событий для новых кнопок
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                openModal(parseInt(productId));
            });
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-id');
                addToCart(parseInt(productId));
            });
        });

        renderPagination(productsToRender.length);
    }

    // Удалите вторую функцию renderProducts - она лишняя

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

        // Обновление счётчика
        if (foundCountElem) {
            foundCountElem.textContent = result.length;
        }

        renderProducts(result);
    }

    // 4.3 Открыть модалку
    function openModal(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        modalContent.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">${product.name}</h2>
                    <button class="close-modal-btn text-gray-500 hover:text-gray-700">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover rounded mb-4">
                <p class="mb-4">${product.description}</p>
                <p class="text-green-700 text-lg font-bold mb-4">${product.price} руб.</p>
                <button class="add-to-cart-modal-btn bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700" data-id="${product.id}">
                    Добавить в корзину
                </button>
            </div>
        `;
        
        modal.classList.remove('hidden');
        
        // Добавляем обработчики для кнопок в модальном окне
        document.querySelector('.close-modal-btn').addEventListener('click', closeModal);
        document.querySelector('.add-to-cart-modal-btn').addEventListener('click', function() {
            addToCart(parseInt(this.getAttribute('data-id')));
            closeModal();
        });
    }

    // 4.4 Закрыть модалку
    function closeModal() {
        modal.classList.add('hidden');
    }

    // 4.5 Открыть/закрыть корзину
    function openCart() {
        cartSidebar.classList.remove('translate-x-full');
    }
    
    function closeCart() {
        cartSidebar.classList.add('translate-x-full');
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }

    // 4.6 Работа с корзиной
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        // Проверяем, есть ли уже товар в корзине
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        
        updateCart();
        openCart();
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCart();
    }

    function updateCart() {
        if (!cartItemsContainer || !cartTotalElem) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="text-center py-8 text-gray-500">Ваша корзина пуста</div>';
            cartTotalElem.textContent = '0 руб.';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price * (item.quantity || 1);

            const div = document.createElement('div');
            div.className = 'mb-4 flex justify-between items-center border-b pb-2';
            div.innerHTML = `
                <div>
                    <p class="font-medium">${item.name}</p>
                    <p class="text-sm text-gray-500">${item.price} руб. × ${item.quantity || 1}</p>
                </div>
                <button class="remove-from-cart-btn text-red-500 hover:text-red-700" data-index="${index}">×</button>
            `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalElem.textContent = `${total} руб.`;
        
        // Добавляем обработчики для кнопок удаления
        document.querySelectorAll('.remove-from-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                removeFromCart(parseInt(this.getAttribute('data-index')));
            });
        });
    }

    // --- 5. ПОДВЕСКА ОБРАБОТЧИКОВ ФИЛЬТРОВ ---

    // Поиск
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            filters.search = e.target.value;
            applyFilters();
        });
    }

    // Категории (чекбоксы)
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            filters.categories = Array.from(document.querySelectorAll('.category-checkbox:checked'))
                .map(el => el.value);
            applyFilters();
        });
    });

    // Цена
    if (minPriceInput) {
        minPriceInput.addEventListener('input', e => {
            filters.minPrice = parseFloat(e.target.value) || 0;
            applyFilters();
        });
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('input', e => {
            filters.maxPrice = parseFloat(e.target.value) || Infinity;
            applyFilters();
        });
    }

    // Сортировка по цене
    if (sortSelect) {
        sortSelect.addEventListener('change', e => {
            filters.sortBy = e.target.value;
            applyFilters();
        });
    }

    // Кнопка «Применить фильтры»
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // Кнопка «Сбросить фильтры»
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            // Сброс состояния
            filters = { search: '', categories: [], minPrice: 0, maxPrice: Infinity, sortBy: 'default' };
            // Сброс UI
            if (searchInput) searchInput.value = '';
            if (minPriceInput) minPriceInput.value = '';
            if (maxPriceInput) maxPriceInput.value = '';
            categoryCheckboxes.forEach(cb => cb.checked = false);
            if (sortSelect) sortSelect.value = 'default';
            applyFilters();
        });
    }

    // Обработчик оформления заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            
            alert('Заказ оформлен! Товаров: ' + cart.length + '\nСумма: ' + 
                cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) + ' руб.');
            
            cart = [];
            updateCart();
            closeCart();
        });
    }

    // --- 6. СТАРТОВЫЙ РЕНДЕР ---
    // applyFilters() будет вызван после загрузки данных
});
