document.addEventListener('DOMContentLoaded', async function() {
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const lightIcon = document.getElementById('theme-toggle-light-icon');

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      if (darkIcon) darkIcon.classList.remove('hidden');
      if (lightIcon) lightIcon.classList.add('hidden');
    } else {
      document.documentElement.classList.remove('dark');
      if (darkIcon) darkIcon.classList.add('hidden');
      if (lightIcon) lightIcon.classList.remove('hidden');
    }
  };

  // Initialize theme based on localStorage or system preference
  let darkMode = localStorage.getItem('darkMode') 
    ? JSON.parse(localStorage.getItem('darkMode'))
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(darkMode);

  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
      darkMode = !darkMode;
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      applyTheme(darkMode);
    });
  }

  // Toast Notification
  const toastElement = document.getElementById('toast');
  window.showToast = function(message, type = 'success') {
    if (!toastElement) return;
    
    toastElement.textContent = message;
    toastElement.classList.remove('bg-green-500', 'bg-red-500', 'opacity-0', 'translate-y-full');
    toastElement.style.visibility = 'visible';

    if (type === 'error') {
      toastElement.classList.add('bg-red-500');
    } else {
      toastElement.classList.add('bg-green-500');
    }
    
    toastElement.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      toastElement.classList.remove('opacity-100', 'translate-y-0');
      toastElement.classList.add('opacity-0', 'translate-y-full');
      setTimeout(() => {
         toastElement.style.visibility = 'hidden';
      }, 500);
    }, 3000);
  };

  // Cart Count Update
  const cartCountBadge = document.getElementById('cart-count-badge');
  window.updateCartCount = async function() {
    if (!cartCountBadge) return;

    try {
      // Check login status first, as cart is user-specific
      const authResponse = await fetch('/api/auth/status');
      const authData = await authResponse.json();

      if (authData.isLoggedIn) {
        const cartResponse = await fetch('/api/cart');
        if (cartResponse.ok) {
          const cartItems = await cartResponse.json();
          const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          
          if (totalItems > 0) {
            cartCountBadge.textContent = totalItems;
            cartCountBadge.style.display = 'flex'; // Ensure it's visible
          } else {
            cartCountBadge.style.display = 'none';
          }
        } else if (cartResponse.status === 401) { // Not logged in or session expired
          cartCountBadge.style.display = 'none'; // Hide if not authenticated
        } else {
          // Other errors fetching cart (e.g., 500)
          console.error('Failed to fetch cart for count:', cartResponse.status);
          cartCountBadge.style.display = 'none'; // Optionally hide or show error state
        }
      } else {
        // User is not logged in, cart count should be hidden or 0
        cartCountBadge.style.display = 'none';
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
      if (cartCountBadge) cartCountBadge.style.display = 'none'; // Hide on error
    }
  };
  // updateCartCount(); // Initial call - will be called after auth UI update

  // Current Year for Footer
  const currentYearElement = document.getElementById('currentYear');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Mobile Menu Toggle
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Close menu if clicking outside (optional)
    document.addEventListener('click', (event) => {
        if (!mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target) && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
  }
  
  // Sticky Category Navigation Bar
  const categoryNav = document.getElementById('category-nav');
  const mainHeader = document.getElementById('main-header');

  if (categoryNav && mainHeader) {
    const headerHeight = mainHeader.offsetHeight;
    categoryNav.style.top = `${headerHeight}px`;

    // Could add a class on scroll for subtle shadow if needed
    // window.addEventListener('scroll', () => {
    //   if (window.pageYOffset > headerHeight) {
    //     categoryNav.classList.add('is-sticky');
    //   } else {
    //     categoryNav.classList.remove('is-sticky');
    //   }
    // });
  }

  // Authentication UI Update
  const authContainer = document.getElementById('auth-container');
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const userInfoDiv = document.getElementById('user-info');
  const usernameDisplay = document.getElementById('username-display');
  const logoutButton = document.getElementById('logout-button');
  const accountLink = userInfoDiv ? userInfoDiv.querySelector('a[href="account.html"]') : null; // More specific account link

  async function updateAuthUI() {
    if (!authContainer) { // If the auth container is not on the page, do nothing
      // console.log('Auth container not found on this page.');
      return;
    }
    try {
      const response = await fetch('/api/auth/status');
      if (!response.ok) { // Check if response is not OK (e.g. 404, 500)
        console.error('Failed to fetch auth status:', response.status);
        // Show default (logged out) state on error
        if (loginLink) loginLink.style.display = 'inline';
        if (registerLink) registerLink.style.display = 'inline';
        if (userInfoDiv) userInfoDiv.classList.add('hidden');
        return;
      }
      const data = await response.json();

      if (data.isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (userInfoDiv) {
          userInfoDiv.classList.remove('hidden');
          if (usernameDisplay) usernameDisplay.textContent = data.username || 'User';
          if (accountLink) accountLink.style.display = 'inline'; // Ensure account link is visible
        }
        if (logoutButton) {
          logoutButton.style.display = 'inline';
          logoutButton.removeEventListener('click', handleLogout); // Remove previous listener to avoid duplicates
          logoutButton.addEventListener('click', handleLogout);
        }
      } else {
        if (loginLink) loginLink.style.display = 'inline';
        if (registerLink) registerLink.style.display = 'inline';
        if (userInfoDiv) userInfoDiv.classList.add('hidden');
      }
    } catch (error) {
      console.error('Error updating auth UI:', error);
      // Optionally show logged-out state as a fallback
      if (loginLink) loginLink.style.display = 'inline';
      if (registerLink) registerLink.style.display = 'inline';
      if (userInfoDiv) userInfoDiv.classList.add('hidden');
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        showToast(data.message || 'Đăng xuất thành công!', 'success');
        // No need to redirect here, updateAuthUI will handle UI changes.
        // If redirect is desired: window.location.href = 'index.html';
      } else {
        showToast(data.message || 'Đăng xuất thất bại.', 'error');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      showToast('Lỗi khi đăng xuất.', 'error');
    }
    updateAuthUI(); // Refresh UI after logout attempt
  }

  // Initial call to set UI based on auth state
  await updateAuthUI(); // Make sure auth UI is updated first
  updateCartCount(); // Then update cart count based on login status

});


