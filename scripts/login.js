document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      // Redirect to profile page if already logged in
      window.location.href = 'profile.html';
      return;
    }
    
    // Set active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === 'login.html') {
        link.classList.add('active');
      }
    });
  
    const loginForm = document.getElementById('loginForm');
    
    // Check for saved email (remember me functionality)
    const savedEmail = localStorage.getItem('userEmail');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    
    if (savedEmail && rememberMeCheckbox) {
      document.getElementById('email').value = savedEmail;
      rememberMeCheckbox.checked = true;
    }
    
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = document.getElementById('submitButtonText');
        const rememberMe = document.getElementById('rememberMe')?.checked;
        
        // Simple validation
        if (!email || !password) {
          showToast('Error', 'Please fill in all fields.');
          return;
        }
        
        // Get stored user data (in a real app, this would be a server call)
        const userProfileData = localStorage.getItem('userProfile');
        let userFound = false;
        
        if (userProfileData) {
          try {
            const userProfile = JSON.parse(userProfileData);
            
            // Basic authentication (in a real app, this would be handled securely on the server)
            if (userProfile.email === email) {
              userFound = true;
              
              // Save email if "remember me" is checked
              if (rememberMe) {
                localStorage.setItem('userEmail', email);
              } else {
                localStorage.removeItem('userEmail');
              }
              
              // Save login status
              localStorage.setItem('isLoggedIn', 'true');
              
              // Update last login time
              userProfile.lastLogin = new Date().toISOString();
              localStorage.setItem('userProfile', JSON.stringify(userProfile));
              
              // Show loading state
              submitButton.textContent = 'Signing in...';
              
              // Show success message
              showToast('Login successful', 'Welcome back to Vibefind!');
              
              // Redirect to profile page after successful login
              setTimeout(() => {
                window.location.href = 'profile.html';
              }, 1500);
            }
          } catch (e) {
            console.error('Error parsing profile data:', e);
          }
        }
        
        if (!userFound) {
          // In a demo app, we'll automatically create an account
          const newUserProfile = {
            name: email.split('@')[0], // Simple name from email
            email: email,
            joinDate: new Date().toISOString(),
            preferences: [],
            notifications: {
              email: true,
              push: true
            },
            location: '',
            lastLogin: new Date().toISOString()
          };
          
          // Store in localStorage (in a real app, this would go to a server)
          localStorage.setItem('userProfile', JSON.stringify(newUserProfile));
          localStorage.setItem('isLoggedIn', 'true');
          
          if (rememberMe) {
            localStorage.setItem('userEmail', email);
          }
          
          // Show loading state
          submitButton.textContent = 'Creating account...';
          
          // Show success message
          showToast('Account created', 'Welcome to Vibefind! Redirecting to your profile...');
          
          // Redirect to profile page
          setTimeout(() => {
            window.location.href = 'profile.html';
          }, 1500);
        }
      });
    }
  
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
  