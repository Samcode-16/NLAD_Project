// DOM Elements
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const closeButtons = document.querySelectorAll('.close');
const switchToSignup = document.getElementById('switch-to-signup');
const switchToLogin = document.getElementById('switch-to-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');
const profileDropdown = document.querySelector('.profile-dropdown');
const authButtons = document.querySelectorAll('#login-btn, #signup-btn');

// CAPTCHA elements
const captchaText = document.getElementById('captcha-text');
const refreshCaptchaBtn = document.getElementById('refresh-captcha');
const captchaInput = document.getElementById('captcha-input');

// Current CAPTCHA value
let currentCaptcha = '';

// Generate CAPTCHA
function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptcha = captcha;
    if (captchaText) {
        captchaText.textContent = captcha;
    }
    return captcha;
}

// Check if user is logged in
function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        // User is logged in
        authButtons.forEach(btn => btn.style.display = 'none');
        profileDropdown.style.display = 'block';
        
        // Set profile image if exists
        const profileImage = document.getElementById('profile-image');
        if (user.profileImage) {
            profileImage.src = user.profileImage;
        }
    } else {
        // User is not logged in
        authButtons.forEach(btn => btn.style.display = 'inline-block');
        profileDropdown.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    if (captchaText) {
        generateCaptcha();
    }
    updateVisitorStats(); 
   
});


function updateVisitorStats() {
    let stats = JSON.parse(localStorage.getItem('journeyStats')) || {
        events: 0,
        users: 0,
        cities: 0,
        creators: 0
    };

    // Increment user count (simulates a new visit)
    stats.users += 1;

    // Update other stats proportionally
    stats.events = Math.floor(stats.users * 0.01); // 1 event per 100 users
    stats.cities = Math.min(20, Math.floor(stats.users / 2500)); // Max 20 cities
    stats.creators = Math.floor(stats.users * 0.002); // 1 creator per 500 users

    // Save to localStorage
    localStorage.setItem('journeyStats', JSON.stringify(stats));

    // Update the DOM
    const statElements = document.querySelectorAll('.stat-number');
    statElements[0].textContent = `${stats.events}+`;
    statElements[1].textContent = `${stats.users}+`;
    statElements[2].textContent = `${stats.cities}+`;
    statElements[3].textContent = `${stats.creators}+`;
}


// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Open modal
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    if (captchaText) {
        generateCaptcha();
    }
    
});



// Login button click
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        openModal(loginModal);
    });
}

// Signup button click
if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        openModal(signupModal);
        generateCaptcha();
    });
}

// Close buttons
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
    });
});

// Switch between login and signup
if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
        generateCaptcha();
    });
}

if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeModal(loginModal);
    }
    if (e.target === signupModal) {
        closeModal(signupModal);
    }
});

// Refresh CAPTCHA
if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener('click', () => {
        generateCaptcha();
    });
}

// Login form submit
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Find user with matching email and password
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Login successful
            localStorage.setItem('currentUser', JSON.stringify(user));
            closeModal(loginModal);
            checkAuthStatus();
            showNotification('Login successful!');
        } else {
            // Login failed
            alert('Invalid email or password!');
        }
    });
}

// Signup form submit
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const captchaInput = document.getElementById('captcha-input').value;
        
        // Validate CAPTCHA
        if (captchaInput !== currentCaptcha) {
            alert('Invalid CAPTCHA! Please try again.');
            generateCaptcha();
            return;
        }
        
        // Validate passwords
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if email already exists
        if (users.some(u => u.email === email)) {
            alert('Email already exists! Please use a different email.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            savedEvents: [],
            createdEvents: []
        };
        
        // Add user to users array
        users.push(newUser);
        
        // Save users to localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Log in the new user
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Close modal and update UI
        closeModal(signupModal);
        checkAuthStatus();
        showNotification('Account created successfully!');
    });
}

// Logout button click
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        checkAuthStatus();
        showNotification('Logged out successfully!');
        window.location.href = 'index.html';
    });
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
.notification {
    position: fixed;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
    background-color: var(--primary-color);
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: bottom 0.3s ease;
    z-index: 1000;
}

.notification.show {
    bottom: 20px;
}
`;
document.head.appendChild(style);
