document.addEventListener('DOMContentLoaded', function() {
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
  window.updateCartCount = function() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountBadge) {
      if (totalItems > 0) {
        cartCountBadge.textContent = totalItems;
        cartCountBadge.style.display = 'flex';
      } else {
        cartCountBadge.style.display = 'none';
      }
    }
  };
  updateCartCount(); // Initial call

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

});


