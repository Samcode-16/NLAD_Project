// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      if (link.getAttribute('href') === 'about.html') {
        link.classList.add('active');
      }
    });
  
    // Intersection Observer for about sections
    const sections = document.querySelectorAll('.about-section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });
    
    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  
    // Navbar scroll effect
    let scrolled = false;
    window.addEventListener('scroll', function() {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        scrolled = isScrolled;
        const navbar = document.querySelector('.navbar');
        if (navbar) {
          if (scrolled) {
            navbar.style.padding = '0.5rem 0';
            navbar.style.backgroundColor = 'rgba(5, 5, 7, 0.9)';
          } else {
            navbar.style.padding = '1rem 0';
            navbar.style.backgroundColor = 'rgba(5, 5, 7, 0.7)';
          }
        }
      }
    });
  });
  
  // Toast notification function
  function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Show the toast
    toast.classList.add('show');
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  