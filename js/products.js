/**
 * Products module for JisuLife ecommerce website
 * Manages product data, filtering, and rendering
 */

// Mock data sản phẩm
const products = [
  {
    id: 1,
    name: "Smart Air Purifier",
    price: 299,
    salePrice: 249,
    category: "air",
    image: "https://placehold.co/400x300?text=Air+Purifier",
    rating: 4.5
  },
  {
    id: 2,
    name: "Ceramic Heater",
    price: 129,
    salePrice: 99,
    category: "heater",
    image: "https://placehold.co/400x300?text=Ceramic+Heater",
    rating: 4.2
  },
  {
    id: 3,
    name: "USB Desk Fan",
    price: 49,
    salePrice: 39,
    category: "fan",
    image: "https://placehold.co/400x300?text=Desk+Fan",
    rating: 4.7
  },
  {
    id: 4,
    name: "Smart Humidifier",
    price: 89,
    salePrice: 69,
    category: "humidifier",
    image: "https://placehold.co/400x300?text=Humidifier",
    rating: 4.4
  },
  {
    id: 5,
    name: "Tower Fan",
    price: 159,
    salePrice: 129,
    category: "fan",
    image: "https://placehold.co/400x300?text=Tower+Fan",
    rating: 4.6
  },
  {
    id: 6,
    name: "Oil Heater",
    price: 199,
    salePrice: 179,
    category: "heater",
    image: "https://placehold.co/400x300?text=Oil+Heater",
    rating: 4.3
  },
  {
    id: 7,
    name: "Car Air Purifier",
    price: 99,
    salePrice: 79,
    category: "air",
    image: "https://placehold.co/400x300?text=Car+Air+Purifier",
    rating: 4.1
  },
  {
    id: 8,
    name: "Personal Humidifier",
    price: 59,
    salePrice: 49,
    category: "humidifier",
    image: "https://placehold.co/400x300?text=Personal+Humidifier",
    rating: 4.0
  }
];

// State
let activeCategory = 'all';
let searchTerm = '';

/**
 * Updates the active category filter and re-renders products.
 * @param {string} category - The category to filter by.
 */
function setActiveCategory(category) {
  activeCategory = category;
  // Clear search term when changing category
  searchTerm = '';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
  }
  renderProducts();
}

/**
 * Updates the search term, sets category to 'all', and re-renders products.
 * Debounced function handled in initProductSearch.
 * @param {string} term - The search term.
 */
function setSearchTerm(term) {
  searchTerm = term.toLowerCase();
  activeCategory = 'all'; // Set category to 'all' for search

  // Update category buttons UI to reflect 'all' is active
  document.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.dataset.category === 'all') {
      btn.classList.remove('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
      btn.classList.add('bg-red-500', 'text-white');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('bg-red-500', 'text-white');
      btn.classList.add('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  renderProducts(); // This will now use the correct searchTerm and activeCategory
}


/**
 * Filters products based on the active category AND current search term.
 * @returns {Array} Filtered products array
 */
function getFilteredProducts() {
  let filtered = products; // Start with all products

  // Filter by category if not 'all'
  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }
  
  // Then, filter by search term if present
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
}

/**
 * Creates HTML for a single product card
 * @param {Object} product - The product object
 * @returns {string} HTML string for product card
 */
function createProductCardHTML(product) {
  return `
    <article 
      data-product-id="${product.id}" 
      class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col"
      aria-labelledby="product-title-${product.id}"
    >
      <div class="relative overflow-hidden group">
        <img 
          src="${product.image}" 
          alt="${product.name}"
          loading="lazy"
          class="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            class="add-to-cart-btn bg-white text-red-500 px-4 py-2 rounded-full font-semibold transform transition hover:scale-105"
            aria-label="Thêm ${product.name} vào giỏ hàng"
          >
            Thêm Giỏ Hàng
          </button>
        </div>
      </div>
      <div class="p-4 flex flex-col flex-grow">
        <h4 id="product-title-${product.id}" class="text-lg font-semibold mb-2 flex-grow">${product.name}</h4>
        <div class="flex items-center justify-between mt-auto">
          <div>
            <span class="text-red-500 font-bold text-lg">$${product.salePrice}</span>
            <span class="text-gray-500 line-through ml-2">$${product.price}</span>
          </div>
          <div class="flex" aria-label="Đánh giá ${product.rating} trên 5 sao">
            ${createStarRating(product.rating)}
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders skeleton loading state for products
 */
function renderProductSkeletons() {
  const skeletonContainer = document.getElementById('products-skeleton');
  const productsGrid = document.getElementById('products-grid');
  const searchResultsInfo = document.getElementById('searchResultsInfo');

  skeletonContainer.innerHTML = '';
  skeletonContainer.classList.remove('hidden');
  productsGrid.classList.add('hidden');
  searchResultsInfo.classList.add('hidden');

  for (let i = 0; i < 8; i++) {
    skeletonContainer.appendChild(createProductCardSkeleton());
  }
}

/**
 * Renders products based on active category and search term
 */
function renderProducts() {
  renderProductSkeletons();

  const filteredProducts = getFilteredProducts();
  const productsGrid = document.getElementById('products-grid');
  const skeletonContainer = document.getElementById('products-skeleton');
  const searchResultsInfo = document.getElementById('searchResultsInfo');

  setTimeout(() => {
    let productsHTML = '';
    if (filteredProducts.length > 0) {
      filteredProducts.forEach(product => {
        productsHTML += createProductCardHTML(product);
      });
      searchResultsInfo.classList.add('hidden');
    } else {
      productsHTML = ''; 
      const messageBase = "Không tìm thấy sản phẩm nào phù hợp";
      if (searchTerm) {
        searchResultsInfo.textContent = `${messageBase} với tìm kiếm "${searchTerm}".`;
      } else if (activeCategory !== 'all') {
        const categoryElement = document.querySelector(`.category-btn[data-category="${activeCategory}"]`);
        const categoryName = categoryElement ? categoryElement.textContent.trim() : activeCategory;
        searchResultsInfo.textContent = `${messageBase} trong danh mục "${categoryName}".`;
      } else {
         searchResultsInfo.textContent = messageBase + ".";
      }
      searchResultsInfo.classList.remove('hidden');
    }

    productsGrid.innerHTML = productsHTML;
    skeletonContainer.classList.add('hidden');
    productsGrid.classList.remove('hidden');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productElement = this.closest('[data-product-id]');
        if (productElement) {
            const productId = parseInt(productElement.dataset.productId);
            const product = products.find(p => p.id === productId);
            if (product) {
                addToCart(product);
            }
        }
      });
    });
  }, 300); 
}

/**
 * Initialize category filters
 */
function initCategoryFilters() {
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const newCategory = this.dataset.category;
      setActiveCategory(newCategory);
      
      document.querySelectorAll('.category-btn').forEach(el => {
        if (el.dataset.category === newCategory) {
          el.classList.remove('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
          el.classList.add('bg-red-500', 'text-white');
          el.setAttribute('aria-pressed', 'true');
        } else {
          el.classList.remove('bg-red-500', 'text-white');
          el.classList.add('bg-white', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
          el.setAttribute('aria-pressed', 'false');
        }
      });
    });
  });
}

/**
 * Initialize product search functionality
 */
function initProductSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    const debouncedSearch = debounce(setSearchTerm, 400); 
    searchInput.addEventListener('input', function(event) {
      debouncedSearch(event.target.value);
    });
  }
}









