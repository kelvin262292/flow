document.addEventListener('DOMContentLoaded', () => {
    const { products } = window.APP_DATA;
    const { showToast, loadTheme, initThemeToggle, renderStarRating } = window.ui;
    const { addToCart, updateCartIconHeader } = window.cart;

    // Initialize Theme & Cart
    loadTheme();
    initThemeToggle('darkModeToggle');
    updateCartIconHeader();

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);

    // DOM Elements
    const productNameEl = document.getElementById('productName');
    const productRatingContainerEl = document.getElementById('productRatingContainer');
    const productRatingValueEl = document.getElementById('productRatingValue');
    const productSalePriceEl = document.getElementById('productSalePrice');
    const productOriginalPriceEl = document.getElementById('productOriginalPrice');
    const productDescriptionEl = document.getElementById('productDescription');
    const mainProductImageEl = document.getElementById('mainProductImage');
    const thumbnailContainerEl = document.getElementById('thumbnailContainer');
    
    const quantityInput = document.getElementById('quantityInput');
    const decreaseQuantityBtn = document.getElementById('decreaseQuantity');
    const increaseQuantityBtn = document.getElementById('increaseQuantity');
    const addToCartButton = document.getElementById('addToCartButton');

    const relatedProductsStoreEl = document.getElementById('relatedProductsStore');
    document.getElementById('currentYearFooter').textContent = new Date().getFullYear();

    // Search input in header (optional functionality for PDP)
    const searchInputHeader = document.getElementById('searchInputHeader');
    if (searchInputHeader) {
        searchInputHeader.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInputHeader.value.trim() !== '') {
                window.location.href = `index.html?search=${encodeURIComponent(searchInputHeader.value.trim())}`;
            }
        });
    }


    if (!product) {
        document.getElementById('productDetailContainer').innerHTML = 
            '<p class="col-span-full text-center text-xl text-red-500">Sản phẩm không tồn tại hoặc đã bị xóa.</p>';
        document.getElementById('relatedProductsSection').style.display = 'none';
        // Update page title for not found
        document.title = "Không tìm thấy sản phẩm - JisuLife";
        return;
    }

    // Update page title and meta description
    document.title = `${product.name} - JisuLife`;
    let metaDescriptionTag = document.querySelector('meta[name="description"]');
    if (!metaDescriptionTag) {
        metaDescriptionTag = document.createElement('meta');
        metaDescriptionTag.name = "description";
        document.head.appendChild(metaDescriptionTag);
    }
    metaDescriptionTag.content = `Chi tiết sản phẩm ${product.name}: ${product.description.substring(0, 150)}...`;


    // Populate Product Details
    if (productNameEl) productNameEl.textContent = product.name;
    
    if (productRatingContainerEl && product.rating) {
        productRatingContainerEl.innerHTML = renderStarRating(product.rating, 'w-5 h-5');
        if (productRatingValueEl) productRatingValueEl.textContent = `(${product.rating.toFixed(1)} đánh giá)`;
    } else if (productRatingContainerEl) {
        productRatingContainerEl.innerHTML = `<span class="text-sm text-gray-500 dark:text-gray-400">Chưa có đánh giá</span>`;
    }


    if (productSalePriceEl) productSalePriceEl.textContent = `$${product.salePrice}`;
    if (productOriginalPriceEl) {
        if (product.price !== product.salePrice) {
            productOriginalPriceEl.textContent = `$${product.price}`;
            productOriginalPriceEl.classList.remove('hidden');
        } else {
            productOriginalPriceEl.classList.add('hidden');
        }
    }
    if (productDescriptionEl) {
        // Use marked.js if description is Markdown, otherwise simple text
        // For now, assuming simple text or HTML might be in description.
        // If it's guaranteed plain text that needs paragraph breaks, process it.
        productDescriptionEl.innerHTML = product.description.split('\n').map(p => `<p>${p}</p>`).join('');
    }

    // Image Gallery
    if (mainProductImageEl && product.images && product.images.length > 0) {
        mainProductImageEl.src = product.images[0];
        mainProductImageEl.alt = product.name;
        mainProductImageEl.onload = () => mainProductImageEl.classList.add('opacity-100');


        if (thumbnailContainerEl) {
            thumbnailContainerEl.innerHTML = ''; // Clear any placeholders
            product.images.forEach((imgSrc, index) => {
                const thumb = document.createElement('button');
                thumb.setAttribute('aria-label', `Xem hình ảnh ${index + 1}`);
                thumb.className = `aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden hover:opacity-75 transition ${index === 0 ? 'ring-2 ring-red-500' : ''}`;
                thumb.innerHTML = `<img src="${imgSrc}" alt="Thumbnail ${product.name} ${index + 1}" class="w-full h-full object-cover">`;
                thumb.addEventListener('click', () => {
                    mainProductImageEl.style.opacity = 0; // Start fade out
                    setTimeout(() => {
                        mainProductImageEl.src = imgSrc;
                        mainProductImageEl.onload = () => mainProductImageEl.style.opacity = 1; // Fade in new image
                    }, 150); // Duration for fade-out, match with CSS transition if any
                    
                    // Update active thumbnail
                    thumbnailContainerEl.querySelectorAll('button').forEach(btn => btn.classList.remove('ring-2', 'ring-red-500'));
                    thumb.classList.add('ring-2', 'ring-red-500');
                });
                thumbnailContainerEl.appendChild(thumb);
            });
            if (product.images.length <= 1) thumbnailContainerEl.classList.add('hidden'); // Hide thumbnails if only one image
        }

    } else if (mainProductImageEl && product.image) { // Fallback to main product image if no gallery array
        mainProductImageEl.src = product.image;
        mainProductImageEl.alt = product.name;
        mainProductImageEl.onload = () => mainProductImageEl.classList.add('opacity-100');
        if (thumbnailContainerEl) thumbnailContainerEl.classList.add('hidden');
    }


    // Quantity Controls
    if (decreaseQuantityBtn) {
        decreaseQuantityBtn.addEventListener('click', () => {
            let currentValue = parseInt(quantityInput.value);
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }
    if (increaseQuantityBtn) {
        increaseQuantityBtn.addEventListener('click', () => {
            quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    }
    if(quantityInput) {
        quantityInput.addEventListener('change', () => {
            if (parseInt(quantityInput.value) < 1) {
                quantityInput.value = 1;
            }
        });
    }


    // Add to Cart
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            addToCart(product.id, quantity);
        });
    }

    // Render Related Products
    function renderRelatedProducts() {
        if (!relatedProductsStoreEl) return;
        relatedProductsStoreEl.innerHTML = ''; // Clear

        const related = products.filter(p => p.category === product.category && p.id !== product.id)
                                .slice(0, 4); // Max 4 related products
        
        // If not enough in same category, fill with random (excluding current)
        if (related.length < 4) {
            const otherProducts = products.filter(p => p.id !== product.id && !related.find(r => r.id === p.id));
            const needed = 4 - related.length;
            for (let i = 0; i < needed && i < otherProducts.length; i++) {
                related.push(otherProducts[Math.floor(Math.random() * otherProducts.length)]); // Can have duplicates if not enough unique
            }
        }
        // Remove duplicates if any from random filling
        const uniqueRelated = Array.from(new Set(related.map(p => p.id))).map(id => related.find(p => p.id === id)).slice(0,4);


        if (uniqueRelated.length === 0) {
            document.getElementById('relatedProductsSection').style.display = 'none';
            return;
        }

        uniqueRelated.forEach(relProduct => {
            const productCard = `
                <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                    <a href="product-detail.html?id=${relProduct.id}" class="block group">
                        <div class="relative overflow-hidden aspect-[4/3]">
                            <img src="${relProduct.image}" alt="${relProduct.name}" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                        </div>
                    </a>
                    <div class="p-4 flex flex-col flex-grow">
                         <a href="product-detail.html?id=${relProduct.id}" class="block">
                            <h4 class="text-md font-semibold mb-1 truncate" title="${relProduct.name}">${relProduct.name}</h4>
                        </a>
                        <div class="flex items-center mb-2">
                           ${renderStarRating(relProduct.rating, 'w-3.5 h-3.5')}
                           <span class="ml-1.5 text-xs text-gray-500 dark:text-gray-400">(${relProduct.rating.toFixed(1)})</span>
                        </div>
                        <div class="mt-auto">
                            <div class="flex items-baseline justify-start mb-2">
                                <span class="text-red-500 font-bold text-lg">$${relProduct.salePrice}</span>
                                ${relProduct.price !== relProduct.salePrice ? `<span class="text-gray-500 dark:text-gray-400 line-through ml-2 text-xs">$${relProduct.price}</span>` : ''}
                            </div>
                             <a href="product-detail.html?id=${relProduct.id}" class="add-to-cart-btn-related w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md font-medium transition-colors duration-300 text-xs text-center">
                                Xem Chi Tiết
                            </a>
                        </div>
                    </div>
                </div>
            `;
            relatedProductsStoreEl.innerHTML += productCard;
        });
    }

    renderRelatedProducts();
});







