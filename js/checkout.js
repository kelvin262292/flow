document.addEventListener('DOMContentLoaded', () => {
    // Highlight selected payment method
    const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethodRadios.forEach(radio => {
        // Initial check for default selected
        if (radio.checked) {
            const parentLabel = radio.closest('.form-radio-label');
            if (parentLabel) {
                parentLabel.classList.add('selected');
            }
        }

        radio.addEventListener('change', () => {
            // Remove 'selected' class from all labels
            document.querySelectorAll('.form-radio-label').forEach(label => {
                label.classList.remove('selected');
            });
            // Add 'selected' class to the currently checked one's parent label
            if (radio.checked) {
                const parentLabel = radio.closest('.form-radio-label');
                if (parentLabel) {
                    parentLabel.classList.add('selected');
                }
            }
        });
    });

    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Basic validation example (can be more extensive)
            let isValid = true;
            const requiredFields = checkoutForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('border-red-500', 'dark:border-red-400');
                    // You might want to show a message near the field
                } else {
                    field.classList.remove('border-red-500', 'dark:border-red-400');
                }
            });

            if (!isValid) {
                if (window.showToast) {
                    window.showToast('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
                } else {
                    alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
                }
                // Focus the first invalid field
                const firstInvalidField = checkoutForm.querySelector('[required]:invalid, .border-red-500');
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                return;
            }
            
            // Collect form data (example)
            const formData = new FormData(checkoutForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            console.log('Checkout Data:', data);

            // Simulate order processing
            if (window.showToast) {
                window.showToast('Đang xử lý đơn hàng của bạn...', 'info');
                setTimeout(() => {
                     window.showToast('Đặt hàng thành công! (Đây là bản demo)', 'success', 5000);
                     // checkoutForm.reset(); // Optionally reset form
                     // window.location.href = 'order-confirmation.html'; // Redirect to a confirmation page
                }, 2000);
            } else {
                alert('Đặt hàng thành công! (Đây là bản demo)');
            }
        });
    }

    // Update cart item count (example, should be dynamic from localStorage or similar)
    const cartItemCountElement = document.getElementById('cartItemCount');
    if (cartItemCountElement) {
        const itemsInCart = 0; // Replace with actual count logic e.g. from localStorage
        cartItemCountElement.textContent = itemsInCart > 9 ? '9+' : itemsInCart.toString();
    }
});




