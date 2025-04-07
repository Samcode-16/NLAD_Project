// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      if (link.getAttribute('href') === 'contact.html') {
        link.classList.add('active');
      }
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
  
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
      contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;
        const submitButton = document.getElementById('submitButtonText');
        
        // Simple validation
        if (!name || !email || !message) {
          showToast('Error', 'Please fill in all fields.');
          return;
        }
        
        // Show loading state
        submitButton.textContent = 'Sending...';
        
        // Simulate form submission delay
        setTimeout(() => {
          // Reset form
          contactForm.reset();
          
          // Show success message
          showToast('Message sent', "We've received your message and will get back to you soon!");
          
          // Reset button
          submitButton.textContent = 'Send Message';
        }, 1500);
      });
    }
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
  