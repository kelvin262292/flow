document.addEventListener('DOMContentLoaded', async () => {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartTotalElement = document.getElementById('cartTotal');
    const emptyCartMessageElement = document.getElementById('emptyCartMessage');
    const cartSummaryElement = document.getElementById('cartSummary');
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');

    // Helper to format currency (can be moved to main.js if used elsewhere)
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    async function fetchCart() {
        try {
            const response = await fetch('/api/cart');
            if (response.ok) {
                const cartData = await response.json();
                renderCart(cartData);
            } else if (response.status === 401) {
                // User not logged in, redirect or show message
                if (window.showToast) window.showToast('Vui lòng đăng nhập để xem giỏ hàng.', 'error');
                // Redirect to login page after a short delay
                setTimeout(() => { window.location.href = 'login.html'; }, 2000);
                showEmptyCartState(true, 'Bạn cần đăng nhập để xem giỏ hàng.');
            } else {
                if (window.showToast) window.showToast('Không thể tải giỏ hàng.', 'error');
                showEmptyCartState(true, 'Không thể tải giỏ hàng. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (window.showToast) window.showToast('Lỗi kết nối khi tải giỏ hàng.', 'error');
            showEmptyCartState(true, 'Lỗi kết nối. Vui lòng thử lại.');
        }
    }

    function showEmptyCartState(isEmpty, message = 'Giỏ hàng của bạn đang trống.') {
        if (isEmpty) {
            if (cartItemsContainer) cartItemsContainer.innerHTML = ''; // Clear any existing items
            if (emptyCartMessageElement) {
                 emptyCartMessageElement.querySelector('p.text-xl').textContent = message;
                 emptyCartMessageElement.style.display = 'block';
            }
            if (cartSummaryElement) cartSummaryElement.style.display = 'none';
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            if (emptyCartMessageElement) emptyCartMessageElement.style.display = 'none';
            if (cartSummaryElement) cartSummaryElement.style.display = 'block';
            if (proceedToCheckoutBtn) proceedToCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function renderCart(cartItems) {
        if (!cartItemsContainer) return;

        if (!cartItems || cartItems.length === 0) {
            showEmptyCartState(true);
            updateCartSummary([]); // Pass empty array to correctly set totals to 0
            return;
        }
        showEmptyCartState(false);

        cartItemsContainer.innerHTML = cartItems.map(item => `
            <div class="cart-item flex flex-col sm:flex-row items-center border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0 gap-4" data-product-id="${item.product_id}">
                <img src="${item.image_url || 'https://via.placeholder.com/100x100?text=No+Image'}" alt="${item.name}" class="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div class="flex-grow text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">${item.name}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${item.category || ''}</p>
                    <p class="text-red-500 font-medium mt-1">${formatCurrency(item.price)}</p>
                </div>
                <div class="flex items-center space-x-2 sm:ml-auto mt-3 sm:mt-0">
                    <button data-action="decrease" data-product-id="${item.product_id}" aria-label="Giảm số lượng" class="quantity-change p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 custom-focus-ring disabled:opacity-50" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <svg class="w-4 h-4 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" aria-label="Số lượng" data-product-id="${item.product_id}" class="quantity-input w-12 text-center border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:ring-red-500 focus:border-red-500 custom-focus-ring appearance-none">
                    <button data-action="increase" data-product-id="${item.product_id}" aria-label="Tăng số lượng" class="quantity-change p-1.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 custom-focus-ring">
                        <svg class="w-4 h-4 text-gray-700 dark:text-gray-200" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
                <div class="text-right font-semibold text-gray-800 dark:text-white w-full sm:w-auto mt-3 sm:mt-0 sm:min-w-[100px]">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
                <button data-action="remove" data-product-id="${item.product_id}" aria-label="Xóa sản phẩm" class="item-remove text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 custom-focus-ring transition-colors ml-2 mt-3 sm:mt-0">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                </button>
            </div>
        `).join('');
        
        addEventListenersToCartItems();
        updateCartSummary(cartItems);
    }

    function addEventListenersToCartItems() {
        cartItemsContainer.querySelectorAll('.quantity-change').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', handleQuantityInputChange);
        });
        cartItemsContainer.querySelectorAll('.item-remove').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    async function handleQuantityChange(event) {
        const button = event.currentTarget;
        const action = button.dataset.action;
        const productId = button.dataset.productId;
        const itemDiv = button.closest('.cart-item');
        const quantityInput = itemDiv.querySelector(`.quantity-input[data-product-id="${productId}"]`);
        let currentQuantity = parseInt(quantityInput.value);

        if (action === 'increase') {
            currentQuantity++;
        } else if (action === 'decrease') {
            currentQuantity--;
        }
        if (currentQuantity < 1) currentQuantity = 1; // Should not go below 1
        quantityInput.value = currentQuantity; // Update input visually first

        await updateItemQuantity(productId, currentQuantity);
    }
    
    async function handleQuantityInputChange(event) {
        const input = event.currentTarget;
        const productId = input.dataset.productId;
        let newQuantity = parseInt(input.value);

        if (isNaN(newQuantity) || newQuantity < 1) {
            newQuantity = 1; // Reset to 1 if invalid input
            input.value = newQuantity; // Correct the input field
        }
        await updateItemQuantity(productId, newQuantity);
    }

    async function updateItemQuantity(productId, quantity) {
        try {
            const response = await fetch(`/api/cart/item/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: quantity })
            });
            if (response.ok) {
                const updatedItem = await response.json();
                if (window.showToast) window.showToast(updatedItem.message || 'Số lượng cập nhật.', 'success');
                fetchCart(); // Re-fetch cart to ensure UI consistency and totals
                if (window.updateCartCount) window.updateCartCount();
            } else {
                 const errorData = await response.json();
                if (window.showToast) window.showToast(errorData.message || 'Lỗi cập nhật số lượng.', 'error');
                fetchCart(); // Re-fetch to revert optimistic UI update or show actual state
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            if (window.showToast) window.showToast('Lỗi kết nối khi cập nhật.', 'error');
            fetchCart(); // Re-fetch to revert
        }
    }

    async function handleRemoveItem(event) {
        const button = event.currentTarget;
        const productId = button.dataset.productId;
        
        // Optional: Add a confirmation dialog here
        // if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) return;

        try {
            const response = await fetch(`/api/cart/item/${productId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                 const result = await response.json();
                if (window.showToast) window.showToast(result.message || 'Sản phẩm đã được xóa.', 'success');
                fetchCart(); // Re-fetch cart
                if (window.updateCartCount) window.updateCartCount();
            } else {
                const errorData = await response.json();
                if (window.showToast) window.showToast(errorData.message || 'Lỗi xóa sản phẩm.', 'error');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            if (window.showToast) window.showToast('Lỗi kết nối khi xóa sản phẩm.', 'error');
        }
    }
    
    function updateCartSummary(cartItems) {
        let subtotal = 0;
        if (cartItems && cartItems.length > 0) {
            subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }
        
        // Assuming shipping is free for now or calculated server-side if needed later
        const shipping = 0; 
        const total = subtotal + shipping;

        if (cartSubtotalElement) cartSubtotalElement.textContent = formatCurrency(subtotal);
        // Assuming shippingCost element exists in HTML with id="shippingCost"
        const shippingCostElement = document.getElementById('shippingCost');
        if (shippingCostElement) shippingCostElement.textContent = shipping === 0 ? 'Miễn phí' : formatCurrency(shipping);
        if (cartTotalElement) cartTotalElement.textContent = formatCurrency(total);
    }

    // Initial fetch and render
    await fetchCart();
});





