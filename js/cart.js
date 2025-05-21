document.addEventListener('DOMContentLoaded', () => {
  // Dark mode and cart icon are handled by utils.js on its own DOMContentLoaded
  renderCartPage();
  setupCartEventListeners();
});

function renderCartPage() {
  const cartItems = getCartItems();
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSummary = document.getElementById('cartSummary');
  const emptyCartMessage = document.getElementById('emptyCartMessage');
  const cartContent = document.getElementById('cartContent'); // Main content wrapper

  if (!cartItemsContainer || !cartSummary || !emptyCartMessage || !cartContent) {
    console.error("Cart page elements not found.");
    return;
  }

  if (cartItems.length === 0) {
    cartContent.classList.add('hidden');
    emptyCartMessage.classList.remove('hidden');
    updateCartSummary(0); // Update summary for empty cart
  } else {
    cartContent.classList.remove('hidden');
    emptyCartMessage.classList.add('hidden');
    
    cartItemsContainer.innerHTML = `
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <ul role="list" class="divide-y divide-gray-200 dark:divide-gray-700">
          ${cartItems.map(item => `
            <li class="p-4 sm:p-6 flex items-center space-x-4">
              <img src="${item.image}" alt="${item.name}" loading="lazy" class="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border border-gray-200 dark:border-gray-700">
              <div class="flex-1 min-w-0">
                <h3 class="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate" title="${item.name}">${item.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${formatCurrency(item.price)}</p>
                <div class="mt-2 flex items-center">
                  <label for="quantity-${item.id}" class="sr-only">Số lượng</label>
                  <button data-id="${item.id}" class="decrease-quantity p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-50" ${item.quantity <= 1 ? 'disabled' : ''}>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                  </button>
                  <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" class="quantity-input w-12 mx-2 text-center border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm bg-transparent" data-id="${item.id}" aria-label="Số lượng cho ${item.name}">
                  <button data-id="${item.id}" class="increase-quantity p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  </button>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">${formatCurrency(item.price * item.quantity)}</p>
                <button data-id="${item.id}" class="remove-item mt-1 text-xs sm:text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">
                  Xóa
                </button>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    updateCartSummary(subtotal);
  }
  // updateCartIcon is called by saveCartItems, which is good.
  // An initial call here might be redundant if utils.js already calls it.
}

function updateCartSummary(subtotal) {
  const subtotalElement = document.getElementById('cartSubtotal');
  const checkoutButton = document.getElementById('checkoutButton');
  if (subtotalElement) {
    subtotalElement.textContent = formatCurrency(subtotal);
  }
  if (checkoutButton) {
      checkoutButton.disabled = subtotal === 0;
      checkoutButton.classList.toggle('opacity-50', subtotal === 0);
      checkoutButton.classList.toggle('cursor-not-allowed', subtotal === 0);
  }
}

function setupCartEventListeners() {
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', (event) => {
      const target = event.target;
      const button = target.closest('button');
      const productId = button ? button.dataset.id : (target.dataset.id && target.classList.contains('quantity-input') ? target.dataset.id : null);

      if (!productId) return;

      if (button && button.classList.contains('increase-quantity')) {
        updateItemQuantity(productId, 1);
      } else if (button && button.classList.contains('decrease-quantity')) {
        updateItemQuantity(productId, -1);
      } else if (button && button.classList.contains('remove-item')) {
        removeItemFromCart(productId);
      }
    });
    
    cartItemsContainer.addEventListener('change', (event) => {
        const target = event.target;
        if (target.classList.contains('quantity-input')) {
            const productId = target.dataset.id;
            const newQuantity = parseInt(target.value, 10);
            if (productId && !isNaN(newQuantity) && newQuantity >= 1) {
                setCartItemQuantity(productId, newQuantity);
            } else if (productId && !isNaN(newQuantity) && newQuantity < 1) {
                // Reset to 1 if invalid value like 0 or negative is entered
                target.value = 1; 
                setCartItemQuantity(productId, 1);
            }
        }
    });
  }

  const checkoutButton = document.getElementById('checkoutButton');
  if(checkoutButton) {
    checkoutButton.addEventListener('click', () => {
        const cartItems = getCartItems();
        if(cartItems.length > 0) {
            // In a real app, this would navigate to a checkout page or open a modal.
            // For now, just an alert.
            showToast('Chuyển đến trang thanh toán (chưa triển khai).', 'info');
            console.log("Proceeding to checkout with items:", cartItems);
        } else {
            showToast('Giỏ hàng trống. Không thể thanh toán.', 'error');
        }
    });
  }
}

function updateItemQuantity(productId, change) {
  let cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === productId);

  if (itemIndex > -1) {
    cartItems[itemIndex].quantity += change;
    if (cartItems[itemIndex].quantity <= 0) {
      cartItems.splice(itemIndex, 1); // Remove if quantity is 0 or less
      showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
    }
    saveCartItems(cartItems);
    renderCartPage();
  }
}

function setCartItemQuantity(productId, newQuantity) {
    let cartItems = getCartItems();
    const itemIndex = cartItems.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQuantity <= 0) { // Should be caught by input min="1", but safeguard
            cartItems.splice(itemIndex, 1);
            showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
        } else {
            cartItems[itemIndex].quantity = newQuantity;
        }
        saveCartItems(cartItems);
        renderCartPage(); // Re-render to update totals and button states
    }
}


function removeItemFromCart(productId) {
  let cartItems = getCartItems();
  cartItems = cartItems.filter(item => item.id !== productId);
  saveCartItems(cartItems);
  renderCartPage();
  showToast('Đã xóa sản phẩm khỏi giỏ hàng.', 'info');
}






