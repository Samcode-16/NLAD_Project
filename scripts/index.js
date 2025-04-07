// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // References to DOM elements
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const heroContent = document.getElementById('hero-content');
    const newsletterForm = document.getElementById('newsletter-form');
    
    // Function to set active navigation link
    function setActiveNavLink() {
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
      
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === 'index.html' && href === 'index.html') ||
            (currentPage === '' && href === 'index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
    
    // Initialize by setting active navigation link
    setActiveNavLink();
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        
        // Toggle between menu and close icon
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    }
    
    // Close mobile menu when clicking a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('active');
        
        // Reset the menu button icon
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      });
    });
    
    // Animate hero content on load
    if (heroContent) {
      setTimeout(() => {
        heroContent.classList.add('loaded');
      }, 100);
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.style.padding = '0.5rem 0';
          navbar.style.backgroundColor = 'rgba(5, 5, 7, 0.9)';
        } else {
          navbar.style.padding = '1rem 0';
          navbar.style.backgroundColor = 'rgba(5, 5, 7, 0.7)';
        }
      }
    });
    
    // Handle newsletter form submission
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (email) {
          // Here you would typically send the data to your server
          // For now, we'll just show a success message
          showToast('Success!', 'Thank you for subscribing to our newsletter.');
          emailInput.value = '';
        }
      });
    }
    
    // Check login status
    function checkLoginStatus() {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userPersonalizedContent = document.querySelectorAll('.user-personalized');
      
      // If user is logged in, personalize the UI
      if (isLoggedIn) {
        try {
          const userProfileData = localStorage.getItem('userProfile');
          if (userProfileData) {
            const userProfile = JSON.parse(userProfileData);
            
            // Update any welcome messages with the user's name
            const welcomeMessages = document.querySelectorAll('.welcome-message');
            welcomeMessages.forEach(el => {
              if (userProfile.name) {
                el.textContent = `Welcome back, ${userProfile.name}!`;
              }
            });
          }
          
          // Show personalized content
          userPersonalizedContent.forEach(el => {
            el.classList.remove('hidden');
          });
        } catch (error) {
          console.error('Error parsing profile data', error);
        }
      } else {
        // Hide personalized content if not logged in
        userPersonalizedContent.forEach(el => {
          el.classList.add('hidden');
        });
      }
    }
    
    // Run login status check
    checkLoginStatus();
  });
  
  // Toast notification function
  function showToast(title, message) {
    const toastContainer = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-content">
        <h3 class="toast-title">${title}</h3>
        <p class="toast-message">${message}</p>
      </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      
      // After animation completes, remove from DOM
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  // Helper function to format date
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Event data could be loaded from an API
  // This is a placeholder for demonstration purposes
  const eventData = [
    {
      id: 1,
      title: 'Summer Music Festival',
      date: '2023-06-15',
      location: 'Central Park, New York',
      category: 'Music',
      description: 'Experience the biggest summer music festival with top artists from around the world.',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819'
    },
    {
      id: 2,
      title: 'DevCon 2023',
      date: '2023-07-10',
      location: 'Convention Center, San Francisco',
      category: 'Tech',
      description: 'Join the leading tech conference for developers and tech enthusiasts.',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622'
    },
    {
      id: 3,
      title: 'International Food Festival',
      date: '2023-08-05',
      location: 'Waterfront Park, Chicago',
      category: 'Food',
      description: 'Taste culinary delights from around the world at this premier food festival.',
      image: 'https://images.unsplash.com/photo-1555244162-803834f70033'
    }
  ];
  
  // Event Listeners for Explore Page (if it exists)
  document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.querySelector('.events-container');
    
    // If on the explore page and the container exists
    if (eventsContainer) {
      // Load and display events
      loadEvents(eventsContainer);
      
      // Set up category filters if they exist
      const categoryFilters = document.querySelectorAll('.category-filter');
      if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
          filter.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active state
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filter events
            if (category === 'all') {
              loadEvents(eventsContainer);
            } else {
              const filteredEvents = eventData.filter(event => event.category.toLowerCase() === category.toLowerCase());
              renderEvents(eventsContainer, filteredEvents);
            }
          });
        });
      }
      
      // Set up search functionality if it exists
      const searchForm = document.querySelector('.search-form');
      if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const searchInput = this.querySelector('input');
          const searchTerm = searchInput.value.trim().toLowerCase();
          
          if (searchTerm) {
            const searchResults = eventData.filter(event => 
              event.title.toLowerCase().includes(searchTerm) || 
              event.description.toLowerCase().includes(searchTerm) ||
              event.location.toLowerCase().includes(searchTerm)
            );
            
            renderEvents(eventsContainer, searchResults);
            
            if (searchResults.length === 0) {
              showToast('No Results', 'No events match your search criteria.');
            }
          } else {
            // If search is empty, show all events
            loadEvents(eventsContainer);
          }
        });
      }
    }
  });
  
  // Function to load events into container
  function loadEvents(container) {
    renderEvents(container, eventData);
  }
  
  // Function to render events
  function renderEvents(container, events) {
    // Clear the container
    container.innerHTML = '';
    
    // Check if we have events to display
    if (events.length === 0) {
      container.innerHTML = `
        <div class="no-events-message">
          <p>No events found. Try different filters or check back later!</p>
        </div>
      `;
      return;
    }
    
    // Create HTML for each event
    events.forEach(event => {
      const eventCard = document.createElement('div');
      eventCard.className = 'event-card';
      eventCard.innerHTML = `
        <div class="event-image-container">
          <img src="${event.image}" alt="${event.title}" class="event-image">
          <div class="event-category">${event.category}</div>
        </div>
        <div class="event-details">
          <h3 class="event-title">${event.title}</h3>
          <p class="event-date"><i class="far fa-calendar-alt"></i> ${formatDate(event.date)}</p>
          <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
          <p class="event-description">${event.description}</p>
          <a href="event-details.html?id=${event.id}" class="event-link">Learn More</a>
        </div>
      `;
      
      container.appendChild(eventCard);
    });
  }
  