document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      // Redirect to signup page if not logged in
      showToast('Access Denied', 'You must be logged in to create events.');
      setTimeout(() => {
        window.location.href = 'signup.html';
      }, 2000);
      return;
    }
  
    // Event price radio toggle
    const eventPriceRadios = document.querySelectorAll('input[name="eventPrice"]');
    const priceInputGroup = document.getElementById('priceInputGroup');
    
    eventPriceRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'paid') {
          priceInputGroup.style.display = 'block';
        } else {
          priceInputGroup.style.display = 'none';
        }
      });
    });
  
    // Image preview functionality
    const eventImageInput = document.getElementById('eventImage');
    const imagePreview = document.getElementById('imagePreview');
    
    if (eventImageInput) {
      eventImageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Event Image Preview">`;
          };
          
          reader.readAsDataURL(this.files[0]);
        } else {
          imagePreview.innerHTML = '<p>No image selected</p>';
        }
      });
    }
  
    // Cancel button
    const cancelButton = document.getElementById('cancelButton');
    if (cancelButton) {
      cancelButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
          window.location.href = 'profile.html';
        }
      });
    }
  
    // Create event form submission
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
      createEventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const eventTitle = document.getElementById('eventTitle').value;
        const eventDescription = document.getElementById('eventDescription').value;
        const eventCategory = document.getElementById('eventCategory').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventLocation = document.getElementById('eventLocation').value;
        const eventAddress = document.getElementById('eventAddress').value;
        
        // Simple validation
        if (!eventTitle || !eventDescription || !eventCategory || !eventDate || !eventTime || !eventLocation || !eventAddress) {
          showToast('Error', 'Please fill in all required fields.');
          return;
        }
        
        // Get price information
        const isPaid = document.getElementById('eventPaid').checked;
        let price = 0;
        
        if (isPaid) {
          price = parseFloat(document.getElementById('eventPriceAmount').value);
          if (isNaN(price) || price < 0) {
            showToast('Error', 'Please enter a valid price amount.');
            return;
          }
        }
        
        // In a real app, we would send this data to a server
        // For now, we'll just simulate success and store in localStorage for demo purposes
        
        // Get current user events or initialize if none
        let userEvents = JSON.parse(localStorage.getItem('userEvents')) || {
          upcoming: [],
          past: [],
          saved: []
        };
        
        // Format date for display
        const formattedDate = new Date(eventDate);
        const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        const displayDate = formattedDate.toLocaleDateString('en-US', dateOptions);
        
        // Create new event object
        const newEvent = {
          id: Date.now(), // Simple unique ID
          title: eventTitle,
          description: eventDescription,
          category: eventCategory,
          date: displayDate,
          time: eventTime,
          location: eventLocation,
          address: eventAddress,
          isPaid: isPaid,
          price: price,
          creatorId: JSON.parse(localStorage.getItem('userProfile')).email,
          image: document.getElementById('imagePreview').querySelector('img') ? 
                 document.getElementById('imagePreview').querySelector('img').src : 
                 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(eventTitle)
        };
        
        // Add to upcoming events
        userEvents.upcoming.push(newEvent);
        
        // Save to localStorage
        localStorage.setItem('userEvents', JSON.stringify(userEvents));
        
        // Show success message
        showToast('Success', 'Your event has been created!');
        
        // Redirect to profile page after a delay
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 2000);
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
  