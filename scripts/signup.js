document.addEventListener('DOMContentLoaded', function() {
    // Set active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === 'signup.html') {
        link.classList.add('active');
      }
    });
  
  
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      showToast('Already Signed In', 'You have already signed in. Redirecting to your profile...');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 2500);
      return;
    }
    
  
    // Signup form submission
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
      signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const terms = document.getElementById('terms').checked;
        const submitButton = document.getElementById('submitButtonText');
        
        // Simple validation
        if (!name || !email || !password) {
          showToast('Error', 'Please fill in all fields.');
          return;
        }
        
        if (!terms) {
          showToast('Error', 'Please agree to the Terms of Service and Privacy Policy.');
          return;
        }
        
        // Create user profile
        const userProfile = {
          name: name,
          email: email,
          joinDate: new Date().toISOString(),
          preferences: [],
          notifications: {
            email: true,
            push: true
          },
          location: ''
        };
        
        // Store in localStorage (in a real app, this would go to a server)
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show loading state
        submitButton.textContent = 'Creating account...';
        
        // Simulate signup delay
        setTimeout(() => {
          // Show success message
          showToast('Account created', 'Welcome to Vibefind! Redirecting to your profile...');
          
          // Redirect to profile page after successful signup
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 1500);
        }, 1000);
      });
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
  
  // Toast notification function
  function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-content">
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show the toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Hide and remove the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  