// Check authentication status when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      // Redirect to login page if not logged in
      window.location.href = 'signup.html';
      return;
    }
  
    // Load user profile
    const userProfileData = localStorage.getItem('userProfile');
    if (userProfileData) {
      try {
        const userProfile = JSON.parse(userProfileData);
        
        // Update profile information
        document.getElementById('profileName').textContent = userProfile.name || 'Guest';
        
        // Format join date
        const joinDate = userProfile.joinDate ? new Date(userProfile.joinDate) : new Date();
        const formattedDate = joinDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long'
        });
        document.getElementById('profileJoinDate').textContent = `Joined ${formattedDate}`;
        
        // Fill settings form fields
        const nameInput = document.getElementById('settingsName');
        const emailInput = document.getElementById('settingsEmail');
        const locationInput = document.getElementById('settingsLocation');
        
        if (nameInput) nameInput.value = userProfile.name || '';
        if (emailInput) emailInput.value = userProfile.email || '';
        if (locationInput) locationInput.value = userProfile.location || '';
        
        // Set preferences checkboxes if they exist in the user profile
        if (userProfile.preferences) {
          if (userProfile.preferences.includes('music')) {
            document.getElementById('catMusic').checked = true;
          }
          if (userProfile.preferences.includes('tech')) {
            document.getElementById('catTech').checked = true;
          }
          if (userProfile.preferences.includes('food')) {
            document.getElementById('catFood').checked = true;
          }
          if (userProfile.preferences.includes('sports')) {
            document.getElementById('catSports').checked = true;
          }
        }
        
        // Set notification preferences
        if (userProfile.notifications) {
          document.getElementById('notifyEmail').checked = userProfile.notifications.email || false;
          document.getElementById('notifyPush').checked = userProfile.notifications.push || false;
        }
        
      } catch (e) {
        console.error('Error parsing profile data:', e);
      }
    }
    

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and panes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Add active class to clicked button and corresponding pane
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
      });
    });

    // Add this code in the DOMContentLoaded event listener after loading user profile
// Handle avatar upload
const avatarUpload = document.getElementById('avatarUpload');
const profileAvatar = document.getElementById('profileAvatar');
const uploadError = document.createElement('div');
uploadError.className = 'upload-error';
document.querySelector('.profile-avatar').appendChild(uploadError);

avatarUpload.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    showError('Please select an image file');
    return;
  }

  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    showError('File size too large (max 2MB)');
    return;
  }

  // Show loading state
  const loading = document.createElement('div');
  loading.className = 'upload-loading';
  loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  document.querySelector('.profile-avatar').appendChild(loading);

  // Read and display image
  const reader = new FileReader();
  reader.onload = function(e) {
    profileAvatar.src = e.target.result;
    loading.remove();
    
    // Save to localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    userProfile.avatar = e.target.result;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  };
  
  reader.onerror = function() {
    loading.remove();
    showError('Error reading file');
  };

  reader.readAsDataURL(file);
});

function showError(message) {
  uploadError.textContent = message;
  uploadError.style.display = 'block';
  setTimeout(() => {
    uploadError.style.display = 'none';
  }, 3000);
}

// Add this to the existing user profile loading code
if (userProfile.avatar) {
  document.getElementById('profileAvatar').src = userProfile.avatar;
}
    
    // Settings form submission
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get current profile data
        let userProfile = {};
        if (localStorage.getItem('userProfile')) {
          userProfile = JSON.parse(localStorage.getItem('userProfile'));
        }
        
        // Update with form values
        userProfile.name = document.getElementById('settingsName').value;
        userProfile.email = document.getElementById('settingsEmail').value;
        userProfile.location = document.getElementById('settingsLocation').value;
        
        // Get preferences
        userProfile.preferences = [];
        if (document.getElementById('catMusic').checked) userProfile.preferences.push('music');
        if (document.getElementById('catTech').checked) userProfile.preferences.push('tech');
        if (document.getElementById('catFood').checked) userProfile.preferences.push('food');
        if (document.getElementById('catSports').checked) userProfile.preferences.push('sports');
        
        // Get notification settings
        userProfile.notifications = {
          email: document.getElementById('notifyEmail').checked,
          push: document.getElementById('notifyPush').checked
        };
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Update profile name display
        document.getElementById('profileName').textContent = userProfile.name;
        
        // Show success message
        showToast('Success', 'Your settings have been saved.');
      });
    }
    
    // Edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', function() {
        // Activate settings tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        document.querySelector('[data-tab="settings"]').classList.add('active');
        document.getElementById('settings').classList.add('active');
        
        // Scroll to settings
        document.getElementById('settings').scrollIntoView({ behavior: 'smooth' });
      });
    }
    
    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', function() {
        // Clear login status and profile
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userProfile');
      
        showToast('Logged out', 'You have been successfully logged out.');
      
        // Redirect to signup or home
        setTimeout(() => {
          window.location.href = 'signup.html';
        }, 2000);
      });
    }
    
    // Load user events (in a real app, these would be fetched from a database)
    // For demonstration, we're adding sample data
    initializeSampleEvents();
  });
  
  // Initialize sample events
  function initializeSampleEvents() {
    // Sample event data
    const sampleUpcomingEvents = [
      {
        title: 'Summer Music Festival',
        date: 'June 15, 2023',
        time: '3:00 PM',
        location: 'Central Park, New York',
        image: 'https://via.placeholder.com/400x200?text=Summer+Music+Festival'
      },
      {
        title: 'Tech Conference 2023',
        date: 'July 8, 2023',
        time: '9:00 AM',
        location: 'Convention Center, San Francisco',
        image: 'https://via.placeholder.com/400x200?text=Tech+Conference'
      }
    ];
    
    const samplePastEvents = [
      {
        title: 'Winter Jazz Night',
        date: 'December 12, 2022',
        time: '8:00 PM',
        location: 'Blue Note, Chicago',
        rating: 4,
        image: 'https://via.placeholder.com/400x200?text=Jazz+Night'
      }
    ];
    
    const sampleSavedEvents = [
      {
        title: 'Food & Wine Festival',
        date: 'August 20, 2023',
        time: '12:00 PM',
        location: 'Waterfront Park, Seattle',
        image: 'https://via.placeholder.com/400x200?text=Food+and+Wine'
      }
    ];
    
    // Clear and populate event grids
    populateEvents('upcomingEventsGrid', sampleUpcomingEvents, false);
    populateEvents('pastEventsGrid', samplePastEvents, true);
    populateEvents('savedEventsGrid', sampleSavedEvents, false);
  }
  
  // Populate events in the specified grid
  function populateEvents(gridId, events, isPast) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    // Clear existing content
    grid.innerHTML = '';
    
    if (events.length === 0) {
      grid.innerHTML = '<p class="no-events">No events to display.</p>';
      return;
    }
    
    // Add events to grid
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = isPast ? 'event-card glass-panel past-event' : 'event-card glass-panel';
      
      let ratingHtml = '';
      if (isPast && event.rating) {
        const stars = '★'.repeat(event.rating) + '☆'.repeat(5 - event.rating);
        ratingHtml = `
          <div class="event-rating">
            <p>Your rating: ${stars}</p>
          </div>
        `;
      }
      
      let actionButton = '';
      if (!isPast) {
        actionButton = `<button class="vibe-button sm">View Details</button>`;
      }
      
      eventCard.innerHTML = `
        <div class="event-image">
          <img src="${event.image}" alt="${event.title}">
        </div>
        <div class="event-details">
          <h3>${event.title}</h3>
          <p class="event-date">${event.date} • ${event.time}</p>
          <p class="event-location">${event.location}</p>
          ${ratingHtml}
          ${actionButton}
        </div>
      `;
      
      grid.appendChild(eventCard);
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
  