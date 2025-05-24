/**
 * Quản lý trang tài khoản
 * File này xử lý việc đăng nhập, đăng ký và quản lý thông tin tài khoản
 */

// DOM Elements
let loginForm;
let registerForm;
let accountInfo;
let orderHistory;
let logoutButton;

// Biến lưu trữ trạng thái đăng nhập (sẽ được cập nhật từ API)
let currentUser = null; 

/**
 * Khởi tạo trang tài khoản
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Kiểm tra trạng thái đăng nhập đầu tiên
  try {
    const response = await fetch('/api/auth/status');
    if (!response.ok) {
      // If API call fails (e.g. server error), redirect to login as a precaution
      console.error('Auth status check failed, redirecting to login.');
      window.location.href = 'login.html';
      return;
    }
    const data = await response.json();

    if (!data.isLoggedIn) {
      window.location.href = 'login.html';
      return; // Stop further execution if not logged in
    }
    
    // User is logged in, store user data and proceed
    currentUser = {
      id: data.userId,
      username: data.username,
      // email: data.email // Assuming email is also returned by /api/auth/status or fetched separately
    };
    
    // Khởi tạo các phần tử DOM
    initElements(); 
    
    // Hiển thị thông tin tài khoản (vì đã đăng nhập)
    showAccountInfo(); 
    
    // Thiết lập các sự kiện
    setupEventListeners(); 
    
    // Tải lịch sử đơn hàng
    loadOrderHistory(); 
    
    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartCount(); 

  } catch (error) {
    console.error('Error checking auth status:', error);
    window.location.href = 'login.html'; // Redirect on any error during auth check
    return;
  }
});

/**
 * Khởi tạo các phần tử DOM
 */
function initElements() {
  // loginForm and registerForm are no longer needed on this page if it's protected
  // loginForm = document.getElementById('loginForm'); 
  // registerForm = document.getElementById('registerForm'); 
  accountInfo = document.getElementById('accountInfo');
  orderHistory = document.getElementById('orderHistory');
  // logoutButton is handled by js/main.js in the header now
  // logoutButton = document.getElementById('logoutButton'); 
  
  // Khởi tạo chế độ tối/sáng
  initDarkMode();
}

/**
 * Khởi tạo chế độ tối/sáng
 */
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (!darkModeToggle) return;
  
  // Kiểm tra trạng thái chế độ tối/sáng từ localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  
  // Cập nhật giao diện dựa trên trạng thái hiện tại
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Cập nhật biểu tượng
  updateDarkModeIcon(isDarkMode);
  
  // Sự kiện chuyển đổi chế độ tối/sáng
  darkModeToggle.addEventListener('click', () => {
    const isDarkMode = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    
    // Cập nhật biểu tượng
    updateDarkModeIcon(isDarkMode);
  });
}

/**
 * Cập nhật biểu tượng chế độ tối/sáng
 */
function updateDarkModeIcon(isDarkMode) {
  const lightModeIcon = document.getElementById('lightModeIcon');
  const darkModeIcon = document.getElementById('darkModeIcon');
  
  if (lightModeIcon && darkModeIcon) {
    if (isDarkMode) {
      lightModeIcon.classList.remove('hidden');
      darkModeIcon.classList.add('hidden');
    } else {
      lightModeIcon.classList.add('hidden');
      darkModeIcon.classList.remove('hidden');
    }
  }
}

/**
 * Thiết lập các sự kiện
 */
function setupEventListeners() {
  // Sự kiện cho nút menu di động (if it exists on account.html, otherwise handled by main.js)
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
      mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
    });
  }
  
  // Sự kiện chuyển đổi giữa đăng nhập và đăng ký
  // Login/Register tabs and forms are no longer part of this page's direct responsibility
  // if it's a protected page.
  // const loginTab = document.getElementById('loginTab');
  // const registerTab = document.getElementById('registerTab');
  // const loginSection = document.getElementById('loginSection');
  // const registerSection = document.getElementById('registerSection');
  
  // if (loginTab && registerTab && loginSection && registerSection) { ... }
  
  // Login/Register form submissions are handled by login.js and register.js
  // if (loginForm) { ... }
  // if (registerForm) { ... }
  
  // Logout is handled by main.js in the header
  // if (logoutButton) { ... }
  
  // Sự kiện chuyển đổi tab trong trang tài khoản
  const accountTabs = document.querySelectorAll('.account-tab');
  const accountSections = document.querySelectorAll('.account-section');
  
  accountTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      
      // Cập nhật trạng thái active cho tab
      accountTabs.forEach(t => t.classList.remove('bg-blue-500', 'text-white'));
      tab.classList.add('bg-blue-500', 'text-white');
      
      // Hiển thị section tương ứng
      accountSections.forEach(section => {
        if (section.id === target) {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Kiểm tra trạng thái đăng nhập
 */
// The old checkLoginStatus, showLoginForm, handleLogin, handleRegister, handleLogout are removed
// as they are based on localStorage and conflict with the new session-based auth.

/**
 * Hiển thị thông tin tài khoản
 */
function showAccountInfo() {
  // This page should only be visible if logged in, so authSection can be assumed hidden.
  // const authSection = document.getElementById('authSection');
  const accountSection = document.getElementById('accountSection'); 
  
  if (accountSection) { // Ensure account section exists
    accountSection.classList.remove('hidden');
  }
  
  // Cập nhật thông tin người dùng
  const userNameElement = document.getElementById('userName'); // Assuming this ID exists in account.html
  const userEmailElement = document.getElementById('userEmail'); // Assuming this ID exists
  const welcomeMessageElement = document.getElementById('welcome-message'); // Optional welcome message
  
  if (currentUser) {
    if (userNameElement) {
      userNameElement.textContent = currentUser.username || 'Người dùng'; // Use username from session
    }
    if (userEmailElement && currentUser.email) { // Check if email is available
      userEmailElement.textContent = currentUser.email;
    } else if (userEmailElement) {
      userEmailElement.textContent = 'N/A'; // Or fetch it if needed
    }
    if (welcomeMessageElement) {
      welcomeMessageElement.textContent = `Chào mừng trở lại, ${currentUser.username || 'User'}!`;
    }
  }
}

/**
 * Tải lịch sử đơn hàng
 */
async function loadOrderHistory() {
  if (!orderHistory || !currentUser) {
    console.log('Order history element or current user not found.');
    if (orderHistory) orderHistory.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Không thể tải lịch sử đơn hàng.</p>';
    return;
  }

  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      if (response.status === 401) {
        if (window.showToast) window.showToast('Vui lòng đăng nhập để xem lịch sử đơn hàng.', 'error');
        // Redirect handled by initial auth check, but good to be defensive
      } else {
        if (window.showToast) window.showToast('Không thể tải lịch sử đơn hàng.', 'error');
      }
      orderHistory.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">Không thể tải lịch sử đơn hàng. Vui lòng thử lại.</p>`;
      return;
    }

    const orders = await response.json();

    if (orders.length === 0) {
      orderHistory.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">Bạn chưa có đơn hàng nào.</p>
           <a href="index.html#products" class="mt-4 inline-block bg-primary hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Bắt đầu mua sắm
          </a>
        </div>
      `;
      return;
    }

    // Clear placeholder or existing content
    const orderHistoryContentContainer = document.querySelector('#orders div.space-y-4');
    if (orderHistoryContentContainer) {
        orderHistoryContentContainer.innerHTML = ''; // Clear default placeholders
    } else {
        orderHistory.innerHTML = ''; // Fallback clear
    }
    
    // Create table structure for orders
    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mã ĐH</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ngày Đặt</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tổng Tiền</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trạng Thái</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
    `;

    orders.forEach(order => {
      const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
      const formattedTotal = formatter.format(order.total_amount);
      const orderDate = new Date(order.order_date).toLocaleDateString('vi-VN');
      
      let statusClass = 'bg-gray-100 text-gray-800';
      if (order.status === 'pending') statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      else if (order.status === 'delivered' || order.status === 'shipped') statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      else if (order.status === 'cancelled') statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';


      html += `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#${order.order_id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${orderDate}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formattedTotal}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
              ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="view-order-details text-primary hover:underline" data-order-id="${order.order_id}">Xem chi tiết</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;
    orderHistory.innerHTML = html;

    // Add event listeners for "View Details" buttons
    orderHistory.querySelectorAll('.view-order-details').forEach(button => {
      button.addEventListener('click', () => {
        const orderId = button.dataset.orderId;
        const orderData = orders.find(o => o.order_id == orderId); // Use '==' for string to number comparison if needed, or ensure types match
        if (orderData) {
          showOrderDetail(orderData);
        } else {
          console.error('Order data not found for ID:', orderId);
          if(window.showToast) window.showToast('Không tìm thấy chi tiết đơn hàng.', 'error');
        }
      });
    });

  } catch (error) {
    console.error('Error loading order history:', error);
    orderHistory.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">Lỗi tải lịch sử đơn hàng.</p>`;
    if (window.showToast) window.showToast('Lỗi kết nối khi tải lịch sử đơn hàng.', 'error');
  }
}

/**
 * Hiển thị chi tiết đơn hàng
 */
function showOrderDetail(order) { // order object now comes from the API via /api/orders
  const modal = document.createElement('div');
  // Ensure z-index is high enough, e.g., z-50 if other elements are up to z-40
  modal.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-60 transition-opacity duration-300 opacity-0'; 
  
  const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
  const formattedTotal = formatter.format(order.total_amount);
  const orderDate = new Date(order.order_date).toLocaleDateString('vi-VN');
  const orderTime = new Date(order.order_date).toLocaleTimeString('vi-VN');

  let itemsHtml = '';
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach(item => {
      const itemTotal = item.price_at_purchase * item.quantity;
      itemsHtml += `
        <tr class="border-b dark:border-gray-700">
          <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
            <div class="flex items-center">
              <img src="${item.image_url || 'https://via.placeholder.com/50x50?text=No+Img'}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md mr-3">
              <span>${item.name}</span>
            </div>
          </td>
          <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 text-center">${item.quantity}</td>
          <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 text-right">${formatter.format(item.price_at_purchase)}</td>
          <td class="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 text-right">${formatter.format(itemTotal)}</td>
        </tr>
      `;
    });
  } else {
    itemsHtml = '<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Không có thông tin chi tiết sản phẩm.</td></tr>';
  }
  
  let statusClass = 'bg-gray-100 text-gray-800';
  if (order.status === 'pending') statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  else if (order.status === 'delivered' || order.status === 'shipped') statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  else if (order.status === 'cancelled') statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';

  modal.innerHTML = `
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 opacity-0">
      <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-5">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Chi Tiết Đơn Hàng #${order.order_id}</h3>
        <button id="closeOrderDetail" aria-label="Đóng" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="p-5 overflow-y-auto flex-grow">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">
          <div>
            <strong class="text-gray-500 dark:text-gray-400">Ngày đặt:</strong>
            <span class="text-gray-700 dark:text-gray-200 ml-2">${orderDate} lúc ${orderTime}</span>
          </div>
          <div>
            <strong class="text-gray-500 dark:text-gray-400">Trạng thái:</strong>
            <span class="ml-2 px-2.5 py-1 text-xs leading-5 font-semibold rounded-full ${statusClass}">
              ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div class="sm:col-span-2">
            <strong class="text-gray-500 dark:text-gray-400">Địa chỉ giao hàng:</strong>
            <span class="text-gray-700 dark:text-gray-200 ml-2">${order.shipping_address}</span>
          </div>
        </div>
        
        <h4 class="text-md font-semibold text-gray-700 dark:text-gray-200 mb-3">Sản phẩm đã đặt:</h4>
        <div class="overflow-x-auto border rounded-lg dark:border-gray-700">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                <th class="py-3 px-4 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SL</th>
                <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Đơn giá</th>
                <th class="py-3 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Thành tiền</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
        <div class="flex justify-end items-center">
            <span class="text-lg font-semibold text-gray-700 dark:text-gray-200 mr-2">Tổng cộng:</span>
            <span class="text-xl font-bold text-primary">${formattedTotal}</span>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  // Trigger transition
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    modal.querySelector('.transform').classList.remove('scale-95', 'opacity-0');
  }, 10);


  const closeButton = modal.querySelector('#closeOrderDetail');
  const modalContent = modal.querySelector('.bg-white');

  const closeModal = () => {
    modal.classList.add('opacity-0');
    modal.querySelector('.transform').classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    }, 300); // Match duration of opacity transition
  };

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) { // Only close if clicking on the backdrop
      closeModal();
    }
  });
}


/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
function updateCartCount() {
  const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  
  const cartCountElements = document.querySelectorAll('#cartItemCount, #cart-count-badge');
  cartCountElements.forEach(element => {
    if (element) {
      element.textContent = totalItems;
      
      if (element.id === 'cart-count-badge') {
        element.style.display = totalItems > 0 ? 'flex' : 'none';
      }
            }
        });
    }

/**
 * Hiển thị thông báo toast
 */
function showToast(message, type = 'success', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${type === 'error' ? 'bg-red-500' : 'bg-green-500'} transition-opacity duration-300`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

// Cập nhật năm hiện tại cho footer
document.addEventListener('DOMContentLoaded', () => {
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});



