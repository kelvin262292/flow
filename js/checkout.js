/**
 * Quản lý trang thanh toán
 * File này xử lý việc hiển thị thông tin đơn hàng và xử lý form đặt hàng
 */

document.addEventListener('DOMContentLoaded', async () => {
  const checkoutForm = document.getElementById('checkoutForm');
  const orderSummaryContainer = document.querySelector('#checkoutForm section.lg\\:col-span-1 > div:nth-child(1) > div.space-y-3'); // More specific selector for order summary
  
  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Function to fetch cart data and display summary (optional on this page)
  async function displayOrderSummary() {
    if (!orderSummaryContainer) return;

    try {
      const response = await fetch('/api/cart');
      if (!response.ok) {
        if (response.status === 401) {
          if (window.showToast) window.showToast('Vui lòng đăng nhập để thanh toán.', 'error');
          setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
          if (window.showToast) window.showToast('Không thể tải tóm tắt giỏ hàng.', 'error');
        }
        orderSummaryContainer.innerHTML = '<p class="text-red-500">Không thể tải tóm tắt đơn hàng.</p>';
        return;
      }
      const cartItems = await response.json();

      if (cartItems.length === 0) {
        if (window.showToast) window.showToast('Giỏ hàng trống. Không thể thanh toán.', 'error');
        orderSummaryContainer.innerHTML = '<p>Giỏ hàng của bạn trống.</p>';
        // Disable form submission if cart is empty
        if(checkoutForm) checkoutForm.querySelector('button[type="submit"]').disabled = true;
        setTimeout(() => window.location.href = 'cart.html', 2000); // Redirect to cart page
        return;
      }

      let subtotal = 0;
      let summaryHtml = '';
      cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        summaryHtml += `
          <div class="flex justify-between items-center text-gray-600 dark:text-gray-300">
            <span>${item.name} x ${item.quantity}</span>
            <span>${formatCurrency(itemTotal)}</span>
          </div>`;
      });
      
      // Assuming shipping is free for now
      const shipping = 0;
      const total = subtotal + shipping;

      summaryHtml += `
        <hr class="border-gray-200 dark:border-gray-700 my-3">
        <div class="flex justify-between items-center font-medium text-gray-700 dark:text-gray-200">
          <span>Tạm tính</span>
          <span>${formatCurrency(subtotal)}</span>
        </div>
        <div class="flex justify-between items-center font-medium text-gray-700 dark:text-gray-200">
          <span>Phí vận chuyển</span>
          <span>${shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</span>
        </div>
        <hr class="border-gray-200 dark:border-gray-700 my-3">
        <div class="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-white">
          <span>Tổng cộng</span>
          <span class="text-red-500">${formatCurrency(total)}</span>
        </div>
      `;
      orderSummaryContainer.innerHTML = summaryHtml;

    } catch (error) {
      console.error('Error fetching cart for summary:', error);
      if (window.showToast) window.showToast('Lỗi kết nối khi tải tóm tắt giỏ hàng.', 'error');
      orderSummaryContainer.innerHTML = '<p class="text-red-500">Lỗi kết nối.</p>';
    }
  }

  // Initial call to display summary and check cart status
  await displayOrderSummary();


  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const submitButton = checkoutForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Đang xử lý...';

      const formData = new FormData(checkoutForm);
      const shippingAddress = {
        fullName: formData.get('fullName'),
        phoneNumber: formData.get('phoneNumber'),
        province: formData.get('province'),
        district: formData.get('district'),
        ward: formData.get('ward'),
        addressDetail: formData.get('addressDetail'),
        notes: formData.get('notes')
      };
      
      // Basic client-side validation (can be more comprehensive)
      if (!shippingAddress.fullName || !shippingAddress.phoneNumber || !shippingAddress.province || !shippingAddress.district || !shippingAddress.ward || !shippingAddress.addressDetail) {
          if(window.showToast) window.showToast('Vui lòng điền đầy đủ thông tin giao hàng bắt buộc.', 'error');
          submitButton.disabled = false;
          submitButton.textContent = 'Hoàn Tất Đơn Hàng';
          return;
      }

      try {
        const response = await fetch('/api/orders/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shippingAddress: Object.values(shippingAddress).join(', ') }), // Backend expects a single string for shipping_address
        });

        const result = await response.json();

        if (response.ok) {
          if (window.showToast) window.showToast(result.message || 'Đặt hàng thành công!', 'success');
          if (window.updateCartCount) window.updateCartCount(); // Update cart count (should be 0)
          
          // Display success message and redirect or update UI
          // For now, using the existing showOrderSuccess logic idea but simplified
          document.querySelector('main').innerHTML = `
            <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
              <div class="mb-6">
                <svg class="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-4">Đặt hàng thành công!</h2>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                Mã đơn hàng của bạn là: <strong>${result.order.id}</strong>.
                Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng sớm nhất.
              </p>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 text-left">
                <h3 class="font-semibold text-gray-700 dark:text-gray-200 mb-2">Thông tin đơn hàng:</h3>
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Người nhận:</strong> ${result.order.shipping_address.split(',')[0]}<br> 
                  <strong>Địa chỉ:</strong> ${result.order.shipping_address}<br>
                  <strong>Tổng tiền:</strong> ${formatCurrency(result.order.total_amount)}
                </p>
              </div>
              <div class="flex flex-wrap justify-center gap-4">
                <a href="index.html" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Tiếp tục mua sắm
                </a>
                <a href="account.html#orderHistoryTab" class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Xem lịch sử đơn hàng
                </a>
              </div>
            </div>`;
        } else {
          if (window.showToast) window.showToast(result.message || 'Đặt hàng thất bại. Vui lòng thử lại.', 'error');
          submitButton.disabled = false;
          submitButton.textContent = 'Hoàn Tất Đơn Hàng';
        }
      } catch (error) {
        console.error('Checkout error:', error);
        if (window.showToast) window.showToast('Lỗi kết nối khi đặt hàng.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Hoàn Tất Đơn Hàng';
      }
    });
  }

  // Dark mode and mobile menu are handled by js/main.js, so local functions can be removed
  // initDarkMode(), updateDarkModeIcon(), initProvinceSelect() (if not strictly needed for complex logic),
  // setupEventListeners() (for mobile menu), updatePaymentMethod() (if no dynamic UI changes)
  // can be simplified or removed if their sole purpose was covered by main.js or not critical for API integration.
  // The `provinces` array and `initProvinceSelect` are for a datalist, which is a pure HTML/JS feature,
  // not directly related to API integration, so it can remain if desired for UX.
  
    // Simplified setupEventListeners for payment method (if needed for UI changes)
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', () => {
            // console.log('Payment method changed to:', method.value);
            // Add any UI logic needed when payment method changes
        });
    });

});




