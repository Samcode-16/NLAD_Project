// Slider functionality
let currentSlide = 1;
const totalSlides = 2;

function showSlide(n) {
    // Hide all slides
    document.querySelectorAll('.promo-slide').forEach(slide => {
        slide.classList.remove('active');
    });
    // Show selected slide
    document.getElementById(`slide${n}`).classList.add('active');
    
    // Update dot indicators
    document.querySelectorAll('.slider-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    document.querySelector(`.slider-dot[data-slide="${n}"]`).classList.add('active');
    
    currentSlide = n;
}

// Auto-rotate slides every 5 seconds
setInterval(() => {
    currentSlide = currentSlide % totalSlides + 1;
    showSlide(currentSlide);
}, 5000);

// Manual controls
document.querySelectorAll('.slider-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        showSlide(parseInt(dot.dataset.slide));
    });
});

// Calendar functionality
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let selectedDate = null;

// Initialize calendar
function generateCalendar(month, year) {
    const calendarDays = document.getElementById('calendar-days');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
    
    // Clear previous calendar days
    calendarDays.innerHTML = '';
    
    // Add day headers
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    dayNames.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day text-muted';
        dayElement.textContent = day;
        calendarDays.appendChild(dayElement);
    });
    
    // Get first day of month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Add days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day text-muted';
        dayElement.textContent = daysInPrevMonth - i;
        calendarDays.appendChild(dayElement);
    }
    
    // Add days from current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = i;
        
        // Highlight today
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayElement.classList.add('selected');
        }
        
        // Highlight selected date
        if (selectedDate && i === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()) {
            dayElement.classList.add('selected');
        }
        
        dayElement.addEventListener('click', () => {
            selectedDate = new Date(year, month, i);
            generateCalendar(month, year);
            filterEventsByDate(selectedDate);
        });
        
        calendarDays.appendChild(dayElement);
    }
    
    // Add days from next month
    const totalDays = firstDay + daysInMonth;
    const remainingDays = 7 - (totalDays % 7);
    if (remainingDays < 7) {
        for (let i = 1; i <= remainingDays; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day text-muted';
            dayElement.textContent = i;
            calendarDays.appendChild(dayElement);
        }
    }
}

// Initialize calendar
generateCalendar(currentMonth, currentYear);

// Month navigation
document.getElementById('prev-month').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
});

document.getElementById('next-month').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
});

// Price Filter Functionality
document.getElementById('price-button').addEventListener('click', (e) => {
    e.stopPropagation();
    const priceDropdown = document.getElementById('price-dropdown');
    const otherDropdowns = document.querySelectorAll('.dropdown:not(#price-dropdown)');
    
    otherDropdowns.forEach(dropdown => dropdown.style.display = 'none');
    priceDropdown.style.display = priceDropdown.style.display === 'block' ? 'none' : 'block';
});

// Handle price range selection
document.querySelectorAll('.price-range').forEach(range => {
    range.addEventListener('click', function() {
        const min = parseInt(this.dataset.min);
        const max = parseInt(this.dataset.max);
        
        // Remove previous selections
        document.querySelectorAll('.price-range').forEach(r => r.classList.remove('selected'));
        this.classList.add('selected');
        
        // Update button text
        const svg = document.querySelector('#price-button svg').outerHTML;
        document.getElementById('price-button').innerHTML = `${svg} ${this.textContent}`;
        
        filterEventsByPrice(min, max);
        document.getElementById('price-dropdown').style.display = 'none';
    });
});

// Price filtering function
function filterEventsByPrice(min, max) {
    document.querySelectorAll('.event-card').forEach(card => {
        const priceElement = card.querySelector('.event-price');
        let price = 0;
        
        if(priceElement) {
            const priceText = priceElement.textContent;
            price = priceText === 'Free' ? 0 : parseInt(priceText.replace(/[^0-9]/g, ''));
        }

        const showCard = (price >= min) && (price <= max);
        card.style.display = showCard ? 'block' : 'none';
    });
}

// Add to existing click handler for closing dropdowns
document.addEventListener('click', () => {
    document.getElementById('price-dropdown').style.display = 'none';
});

// Prevent price dropdown from closing when clicking inside
document.getElementById('price-dropdown').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Today button
document.getElementById('today-btn').addEventListener('click', () => {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    selectedDate = today;
    generateCalendar(currentMonth, currentYear);
});

// Apply date button
document.getElementById('apply-date').addEventListener('click', () => {
    document.getElementById('date-dropdown').style.display = 'none';
    if (selectedDate) {
        filterEventsByDate(selectedDate);
    }
});

// Add click handler for Book Now buttons
document.querySelectorAll('.slide-button, .event-action').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        if (this.textContent.trim().toLowerCase() === 'book now') {
            alert('This feature is not yet available. Please check back soon!');
        }
    });
});

// Toggle dropdowns
document.getElementById('location-button').addEventListener('click', (e) => {
    e.stopPropagation();
    const locationDropdown = document.getElementById('location-dropdown');
    const dateDropdown = document.getElementById('date-dropdown');
    
    if (locationDropdown.style.display === 'block') {
        locationDropdown.style.display = 'none';
    } else {
        locationDropdown.style.display = 'block';
        dateDropdown.style.display = 'none';
        
        // Load cities when dropdown is opened
        loadIndianCities();
    }
});

document.getElementById('date-button').addEventListener('click', (e) => {
    e.stopPropagation();
    const dateDropdown = document.getElementById('date-dropdown');
    const locationDropdown = document.getElementById('location-dropdown');
    
    if (dateDropdown.style.display === 'block') {
        dateDropdown.style.display = 'none';
    } else {
        dateDropdown.style.display = 'block';
        locationDropdown.style.display = 'none';
    }
});

// Close dropdowns when clicking outside
document.addEventListener('click', () => {
    document.getElementById('location-dropdown').style.display = 'none';
    document.getElementById('date-dropdown').style.display = 'none';
});

// Prevent dropdown from closing when clicking inside
document.getElementById('location-dropdown').addEventListener('click', (e) => {
    e.stopPropagation();
});

document.getElementById('date-dropdown').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 10) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.backgroundColor = 'rgba(5, 5, 7, 0.9)';
    } else {
        navbar.style.padding = '1rem 0';
        navbar.style.backgroundColor = 'rgba(5, 5, 7, 0.7)';
    }
});

// Filter events by date
function filterEventsByDate(selectedDate) {
    const eventCards = document.querySelectorAll('.event-card[data-event-date]');
    const targetDate = selectedDate.toISOString().split('T')[0];
    
    eventCards.forEach(card => {
        const eventDate = card.dataset.eventDate;
        if (eventDate === targetDate) {
            card.style.display = 'block'; // Show matching events
        } else {
            card.style.display = 'none';  // Hide others
        }
    });
}

// Set active link
document.querySelectorAll('.nav-link').forEach(link => {
    if(link.href === window.location.href) {
        link.classList.add('active');
    }
});

// Load Indian cities
async function loadIndianCities() {
    // For demo purposes, we'll use a static list
    const cities = [
        "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", 
        "Chennai", "Kolkata", "Surat", "Pune", "Jaipur", 
        "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", 
        "Bhopal", "Visakhapatnam", "Patna", "Vadodara", 
        "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad",
        "Meerut", "Rajkot", "Varanasi",
        "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai",
        "Allahabad", "Ranchi", "Gwalior", "Jabalpur",
        "Coimbatore", "Vijayawada", "Jodhpur", "Madurai", "Raipur",
        "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad"
    ].sort();
    
    const locationList = document.getElementById('location-list');
    locationList.innerHTML = '';
    
    cities.forEach(city => {
        const cityElement = document.createElement('div');
        cityElement.className = 'location-item';
        cityElement.textContent = city;
        cityElement.addEventListener('click', () => {
            document.getElementById('location-button').innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.25rem; height: 1.25rem; margin-right: 0.5rem;">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                </svg>
                ${city}
            `;
            document.getElementById('location-dropdown').style.display = 'none';
        });
        locationList.appendChild(cityElement);
    });
    
    // Add search functionality
    document.getElementById('location-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cityElements = locationList.querySelectorAll('.location-item');
        
        cityElements.forEach(cityElement => {
            const cityName = cityElement.textContent.toLowerCase();
            if (cityName.includes(searchTerm)) {
                cityElement.style.display = 'block';
            } else {
                cityElement.style.display = 'none';
            }
        });
    });
}

// Function to create event cards dynamically from CSV data
// Function to create event cards dynamically from CSV data
function displayEvents(events) {
    // Target the "All Events" grid specifically
    const eventsGrid = document.getElementById('all-events-grid');
    
    // Optionally clear existing events if needed
    eventsGrid.innerHTML = '';
    
    events.forEach(event => {
      // Create a card container
      const card = document.createElement('div');
      card.classList.add('event-card');
      
      // Build card inner HTML (adjust markup as needed)
      card.innerHTML = `
        <img src="images/default-event.avif" alt="${event["Event Name"]}" class="event-image">
        <div class="event-content">
          <h3 class="event-title">${event["Event Name"]}</h3>
          <div class="event-location">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            ${event["Exact Place & City"]}
          </div>
          <p class="event-description">Date & Time: ${event["Date and Time"]}</p>
          <div class="event-footer">
            <span class="event-price">${event["Price"]}</span>
            <button class="event-action">Book Now</button>
          </div>
        </div>
      `;
      
      eventsGrid.appendChild(card);
    });
  }
  