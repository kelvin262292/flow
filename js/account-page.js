document.addEventListener('DOMContentLoaded', () => {
    // Mock user data (could eventually come from an auth system)
    const currentUser = {
        name: "Nguyễn Văn An", // Default name from form
        email: "nguyen.van.an@example.com", // Default email from form
        phone: "0912345678",
        address: "Số nhà 123, Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh"
    };

    // Update welcome message
    const welcomeUserNameElement = document.getElementById('welcomeUserName');
    const accountNameInput = document.getElementById('accountName'); // Input field for name

    if (welcomeUserNameElement && accountNameInput) {
        welcomeUserNameElement.textContent = accountNameInput.value || currentUser.name || "Khách";
    }
    
    // Pre-fill form if needed (though it's already value-set in HTML)
    // For robustness, you could set them here too:
    // if (accountNameInput) accountNameInput.value = currentUser.name;
    // const accountEmailInput = document.getElementById('accountEmail');
    // if (accountEmailInput) accountEmailInput.value = currentUser.email;
    // const accountPhoneInput = document.getElementById('accountPhone');
    // if (accountPhoneInput) accountPhoneInput.value = currentUser.phone;
    // const accountAddressInput = document.getElementById('accountAddress');
    // if (accountAddressInput) accountAddressInput.value = currentUser.address;


    // Mock order data
    const mockOrders = [
        {
            id: 'ORD123456',
            date: '2024-03-15',
            total: 348.00,
            status: 'Đã giao hàng',
            statusColor: 'text-green-600 dark:text-green-400',
            items: [{ name: 'Smart Air Purifier PRO', qty: 1, price: 249.00 }, { name: 'USB Desk Fan Mini', qty: 2, price: 49.50 }]
        },
        {
            id: 'ORD123455',
            date: '2024-02-20',
            total: 129.00,
            status: 'Đã hủy',
            statusColor: 'text-red-600 dark:text-red-400',
            items: [{ name: 'Ceramic Heater Deluxe', qty: 1, price: 129.00 }]
        },
        {
            id: 'ORD123454',
            date: '2024-01-10',
            total: 89.00,
            status: 'Đang vận chuyển',
            statusColor: 'text-blue-600 dark:text-blue-400',
            items: [{ name: 'Smart Humidifier Plus', qty: 1, price: 89.00 }]
        },
        {
            id: 'ORD123453',
            date: '2023-12-05',
            total: 39.00,
            status: 'Chờ thanh toán',
            statusColor: 'text-yellow-600 dark:text-yellow-500',
            items: [{ name: 'Portable Neck Fan', qty: 1, price: 39.00 }]
        }
    ];

    const orderHistoryList = document.getElementById('orderHistoryList');
    const noOrdersMessage = document.getElementById('noOrdersMessage');
    const personalInfoForm = document.getElementById('personalInfoForm');

    function formatCurrency(amount) {
      // Using Intl.NumberFormat for better localization and currency formatting
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount * 25000); // Example: Convert USD to VND
      // Or keep it simple if USD is fine: return '$' + amount.toFixed(2);
    }

    function renderOrderHistory() {
        if (!orderHistoryList || !noOrdersMessage) return;

        if (mockOrders.length > 0) {
            noOrdersMessage.classList.add('hidden');
            orderHistoryList.classList.remove('hidden');
            orderHistoryList.innerHTML = mockOrders.map(order => `
                <div class="border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-5 bg-white dark:bg-gray-700/50 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
                    <div class="flex flex-col sm:flex-row justify-between sm:items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                        <h3 class="text-md font-semibold text-gray-800 dark:text-gray-100">Đơn hàng <span class="text-red-500 dark:text-red-400">#${order.id}</span></h3>
                        <span class="text-xs sm:text-sm font-medium ${order.statusColor} mt-1 sm:mt-0 px-2 py-0.5 rounded-full bg-opacity-10 ${order.status === 'Đã giao hàng' ? 'bg-green-100 dark:bg-green-500/20' : order.status === 'Đã hủy' ? 'bg-red-100 dark:bg-red-500/20' : order.status === 'Đang vận chuyển' ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-yellow-100 dark:bg-yellow-500/20'}">
                            ${order.status}
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p class="text-gray-600 dark:text-gray-400"><span class="font-medium text-gray-700 dark:text-gray-300">Ngày đặt:</span> ${new Date(order.date).toLocaleDateString('vi-VN')}</p>
                        <p class="text-gray-600 dark:text-gray-400 md:text-right"><span class="font-medium text-gray-700 dark:text-gray-300">Tổng tiền:</span> <span class="font-bold text-lg text-red-600 dark:text-red-400">${formatCurrency(order.total)}</span></p>
                    </div>
                    
                    <div class="mt-4 border-t border-gray-200 dark:border-gray-600 pt-3">
                        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Sản phẩm (${order.items.length}):</p>
                        <ul class="space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                            ${order.items.map(item => `
                                <li class="flex justify-between items-center">
                                    <span>${item.name} <span class="text-xs text-gray-500 dark:text-gray-400">(x${item.qty})</span></span>
                                    <span class="font-medium">${formatCurrency(item.price * item.qty)}</span>
                                </li>`).join('')}
                        </ul>
                    </div>
                    <div class="mt-5 text-right">
                        <button class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium py-1 px-3 rounded-md hover:bg-red-50 dark:hover:bg-gray-600 transition-colors duration-150">
                            Xem chi tiết đơn hàng
                        </button>
                    </div>
                </div>
            `).join('');
        } else {
            orderHistoryList.classList.add('hidden');
            noOrdersMessage.classList.remove('hidden');
        }
    }

    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(personalInfoForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
            console.log("Thông tin cá nhân đã gửi (demo):", data);

            // Update welcome message if name changed
            if (welcomeUserNameElement && data.accountName) {
                welcomeUserNameElement.textContent = data.accountName;
            }
            
            if (window.showToast) {
                window.showToast('Thông tin cá nhân đã được "cập nhật" (demo)!', 'success');
            } else {
                alert('Thông tin cá nhân đã được "cập nhật" (demo)! Xem console để biết chi tiết.');
            }
        });
    }

    // Initial render
    renderOrderHistory();
});



