// DOM Elements
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const closeButtons = document.querySelectorAll(".close");
const switchToSignup = document.getElementById("switch-to-signup");
const switchToLogin = document.getElementById("switch-to-login");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutBtn = document.getElementById("logout-btn");
const profileDropdown = document.querySelector(".profile-dropdown");
const authButtons = document.querySelectorAll("#login-btn, #signup-btn");

// Events page specific elements
const eventsGrid = document.getElementById("events-grid");
const noResults = document.getElementById("no-results");
const eventCount = document.getElementById("event-count");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumbers = document.getElementById("page-numbers");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");
const locationFilter = document.getElementById("location-filter");
const dateFilter = document.getElementById("date-filter");
const priceFilter = document.getElementById("price-filter");
const filterBtn = document.getElementById("filter-btn");
const clearFiltersBtn = document.getElementById("clear-filters");
const featuredEventPopup = document.getElementById("featured-event-popup");
const closePopupBtn = document.querySelector(".close-popup");

// CAPTCHA elements
const captchaText = document.getElementById("captcha-text");
const refreshCaptchaBtn = document.getElementById("refresh-captcha");
const captchaInput = document.getElementById("captcha-input");

// Current CAPTCHA value
let currentCaptcha = "";

// Pagination variables
let currentPage = 1;
const eventsPerPage = 9;
let totalPages = 1;
let allEvents = [];
let filteredEvents = [];

// Generate CAPTCHA
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let captcha = "";
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
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    // User is logged in
    authButtons.forEach((btn) => (btn.style.display = "none"));
    profileDropdown.style.display = "block";

    // Set profile image if exists
    const profileImage = document.getElementById("profile-image");
    if (user.profileImage) {
      profileImage.src = user.profileImage;
    }
  } else {
    // User is not logged in
    authButtons.forEach((btn) => (btn.style.display = "inline-block"));
    profileDropdown.style.display = "none";
  }
}

// Parse CSV data
function parseCSV(csv) {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");
  const events = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(",");
    const event = {};
    headers.forEach((header, index) => {
      let value = values[index];
      if (header === "image") {
        // Update image path to use correct relative path
        value = value.replace("img/", "../assets/images/");
      }
      event[header] = value;
    });
    events.push(event);
  }
  return events;
}

// Load all events
function loadEvents() {
  // Show loading spinner
  eventsGrid.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading events...</p>
        </div>
    `;

  // In a real application, you would fetch this data from the server
  // For now, we'll try to load from our CSV file
  fetch("../data/events.csv")
    .then((response) => response.text())
    .then((data) => {
      allEvents = parseCSV(data);
      console.log("Loaded events:", allEvents);
      filteredEvents = [...allEvents];
      applyFilters();
    })
    .catch((error) => {
      console.error("Error loading events:", error);
      // Fallback to hardcoded events
      allEvents = generateSampleEvents();
      filteredEvents = [...allEvents];
      applyFilters();
    });
}

// Generate sample events (fallback if CSV fails to load)
function generateSampleEvents() {
  const categories = [
    "Music",
    "Cultural",
    "Food",
    "Business",
    "Sports",
    "Education",
  ];
  const locations = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
  ];
  const titles = [
    "Diwali Cultural Festival",
    "Tech Conference 2025",
    "Classical Music Concert",
    "Food & Wine Festival",
    "Business Networking Event",
    "Cricket Tournament",
    "Art Exhibition",
    "Dance Workshop",
    "Yoga & Meditation Retreat",
    "Startup Pitch Competition",
    "Photography Workshop",
    "Fashion Show",
    "Literary Festival",
    "Science Exhibition",
    "Film Screening",
    "Cooking Masterclass",
    "Heritage Walk",
    "Stand-up Comedy Show",
    "Career Fair",
    "Handicraft Exhibition",
  ];

  const events = [];

  for (let i = 1; i <= 20; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const title = titles[i % titles.length];

    // Generate random date between now and 3 months from now
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 3);
    const randomDate = new Date(
      today.getTime() + Math.random() * (futureDate.getTime() - today.getTime())
    );

    // Format date as YYYY-MM-DD
    const date = randomDate.toISOString().split("T")[0];

    // Random time
    const hour = Math.floor(Math.random() * 12) + 8; // Between 8 and 20
    const minute = Math.random() > 0.5 ? "00" : "30";
    const time = `${hour}:${minute}`;

    // Random price (free or between 100 and 2000)
    const isFree = Math.random() > 0.7;
    const price = isFree
      ? "Free"
      : `₹${Math.floor(Math.random() * 1900) + 100}`;

    events.push({
      id: i,
      title,
      date,
      time,
      location: `${location}, India`,
      description: `Join us for this amazing ${category.toLowerCase()} event in ${location}. Don't miss out on this incredible experience!`,
      price,
      image: "../assets/images/placeholder-event.jpg",
      category,
    });
  }

  return events;
}

// Display events with pagination
function displayEvents() {
  if (!eventsGrid) return;

  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const eventsToDisplay = filteredEvents.slice(startIndex, endIndex);

  // Update event count
  eventCount.textContent = `(${filteredEvents.length})`;

  if (filteredEvents.length === 0) {
    eventsGrid.innerHTML = "";
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";

    eventsGrid.innerHTML = "";

    eventsToDisplay.forEach((event) => {
      const isSaved = isEventSaved(event.id);
      const priceDisplay =
        event.price === "Free"
          ? '<div class="event-badge free">Free</div>'
          : `<div class="event-badge paid">Paid • ${event.price}</div>`;

      const eventCard = document.createElement("div");
      eventCard.className = "event-card";
      eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${
                      event.image || "../assets/images/placeholder-event.jpg"
                    }" alt="${event.title || "Event"}">
                    ${priceDisplay}
                </div>
                <div class="event-details">
                    <div class="event-date">${
                      formatDate(event.date) || "TBD"
                    } • ${event.time || "TBD"}</div>
                    <h3 class="event-title">${event.title || "Event Title"}</h3>
                    <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${
                      event.location || "Location TBD"
                    }</div>
                    <p class="event-description">${
                      event.description || "No description available"
                    }</p>
                    <div class="event-actions">
                        <button class="btn-primary book-now-btn" data-id="${
                          event.id
                        }" data-title="${event.title || "Event"}" data-price="${
        event.price || "Free"
      }">Book Now</button>
                        <div class="save-event ${
                          isSaved ? "saved" : ""
                        }" data-id="${event.id}">
                            <i class="fas fa-heart"></i>
                        </div>
                    </div>
                </div>
            `;

      // Add event listeners for save buttons
      const saveBtn = eventCard.querySelector(".save-event");
      saveBtn.addEventListener("click", function () {
        toggleSaveEvent(event.id);
        this.classList.toggle("saved");
      });

      // Add event listener for book now button
      const bookBtn = eventCard.querySelector(".book-now-btn");
      bookBtn.addEventListener("click", function () {
        console.log("booking...");

        const eventId = this.getAttribute("data-id");
        const eventTitle = this.getAttribute("data-title");
        const eventPrice = this.getAttribute("data-price");

        openBookingModal(eventId, eventTitle, eventPrice);
      });

      eventsGrid.appendChild(eventCard);
    });
  }

  // Update pagination
  updatePagination();
}

function openBookingModal(eventId, eventTitle, eventPrice) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    openModal(loginModal);
    showNotification("Please login to book an event");
    return;
  }

  const bookingModalHTML = `
        <div id="booking-modal" class="modal">
            <div class="modal-content booking-modal-content">
                <span class="close">&times;</span>
                <h2>Book Event: ${eventTitle}</h2>
                <div class="booking-steps">
                    <div class="step active" id="step-1">Step 1: Details</div>
                    <div class="step" id="step-2">Step 2: Payment</div>
                    <div class="step" id="step-3">Step 3: Confirmation</div>
                </div>
                <div class="booking-step-content" id="booking-step-1">
                    <form id="booking-details-form">
                        <div class="form-group">
                            <label for="booking-name">Full Name</label>
                            <input type="text" id="booking-name" value="${
                              user.name || ""
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="booking-email">Email</label>
                            <input type="email" id="booking-email" value="${
                              user.email || ""
                            }" required>
                        </div>
                        <div class="form-group">
                            <label for="booking-phone">Phone Number</label>
                            <input type="tel" id="booking-phone" required>
                        </div>
                        <div class="form-group">
                            <label for="booking-quantity">Number of Tickets</label>
                            <input type="number" id="booking-quantity" min="1" value="1" required>
                        </div>
                        <div class="form-group" id="booking-price-container">
                            <label>Price per Ticket</label>
                            <div class="price-display">${eventPrice}</div>
                        </div>
                        <div class="form-group" id="booking-total-container">
                            <label>Total Price</label>
                            <div class="price-display total-price">${
                              eventPrice === "Free" ? "Free" : eventPrice
                            }</div>
                        </div>
                        <button type="submit" class="btn-primary">Proceed to Payment</button>
                    </form>
                </div>
                <div class="booking-step-content" id="booking-step-2" style="display: none;">
                    <form id="payment-form">
                        <div class="payment-summary">
                            <h3>Payment Summary</h3>
                            <div class="summary-row">
                                <span>Event:</span><span>${eventTitle}</span>
                            </div>
                            <div class="summary-row">
                                <span>Tickets:</span><span id="summary-tickets">1</span>
                            </div>
                            <div class="summary-row">
                                <span>Total:</span><span id="summary-total">${
                                  eventPrice === "Free" ? "Free" : eventPrice
                                }</span>
                            </div>
                        </div>
                        ${
                          eventPrice === "Free"
                            ? `
                            <div class="free-event-message">
                                <p>This is a free event. No payment required.</p>
                                <button type="submit" class="btn-primary">Confirm Booking</button>
                            </div>
                        `
                            : `
                            <div class="payment-methods">
                                <h3>Select Payment Method</h3>
                                <div class="payment-method-options">
                                    <label class="payment-method"><input type="radio" name="payment-method" value="card" checked><span>Credit/Debit Card</span></label>
                                    <label class="payment-method"><input type="radio" name="payment-method" value="upi"><span>UPI</span></label>
                                    <label class="payment-method"><input type="radio" name="payment-method" value="netbanking"><span>Net Banking</span></label>
                                </div>
                                <div class="payment-details card-details">
                                    <div class="form-group">
                                        <label for="card-number">Card Number</label>
                                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" required>
                                    </div>
                                    <div class="form-row">
                                        <div class="form-group">
                                            <label for="card-expiry">Expiry Date</label>
                                            <input type="text" id="card-expiry" placeholder="MM/YY" required>
                                        </div>
                                        <div class="form-group">
                                            <label for="card-cvv">CVV</label>
                                            <input type="text" id="card-cvv" placeholder="123" required>
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label for="card-name">Name on Card</label>
                                        <input type="text" id="card-name" required>
                                    </div>
                                </div>
                                <button type="submit" class="btn-primary">Pay Now</button>
                            </div>
                        `
                        }
                    </form>
                </div>
                <div class="booking-step-content" id="booking-step-3" style="display: none;">
                    <div class="booking-confirmation">
                        <div class="confirmation-icon"><i class="fas fa-check-circle"></i></div>
                        <h3>Booking Confirmed!</h3>
                        <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
                        <div class="confirmation-details">
                            <div class="confirmation-row"><span>Booking ID:</span><span id="booking-id"></span></div>
                            <div class="confirmation-row"><span>Event Date:</span><span id="event-date"></span></div>
                            <div class="confirmation-row"><span>Number of Tickets:</span><span id="tickets-count">1</span></div>
                            <div class="confirmation-row"><span>Total Paid:</span><span id="total-paid">${
                              eventPrice === "Free" ? "Free" : eventPrice
                            }</span></div>
                        </div>
                        <p>A confirmation email has been sent to your registered email address.</p>
                        <div class="confirmation-actions">
                            <a href="../html/events.html" class="btn-secondary">Explore More Events</a>
                            <button class="btn-primary" id="download-ticket">Download Ticket</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = bookingModalHTML;
  const bookingModal = tempDiv.firstElementChild;

  if (!bookingModal) {
    console.error("Booking modal element could not be created.");
    return;
  }

  document.body.appendChild(bookingModal);
  bookingModal.style.display = "block";
  document.body.style.overflow = "hidden";

  const closeBookingModal = bookingModal.querySelector(".close");
  const bookingDetailsForm = bookingModal.querySelector(
    "#booking-details-form"
  );
  const paymentForm = bookingModal.querySelector("#payment-form");
  const quantityInput = bookingModal.querySelector("#booking-quantity");
  const totalPriceDisplay = bookingModal.querySelector(".total-price");
  const summaryTickets = bookingModal.querySelector("#summary-tickets");
  const summaryTotal = bookingModal.querySelector("#summary-total");
  const ticketsCount = bookingModal.querySelector("#tickets-count");
  const totalPaid = bookingModal.querySelector("#total-paid");
  const step1 = bookingModal.querySelector("#booking-step-1");
  const step2 = bookingModal.querySelector("#booking-step-2");
  const step3 = bookingModal.querySelector("#booking-step-3");
  const stepIndicator1 = bookingModal.querySelector("#step-1");
  const stepIndicator2 = bookingModal.querySelector("#step-2");
  const stepIndicator3 = bookingModal.querySelector("#step-3");

  const foundEvent = allEvents.find((e) => e.id == eventId);
  const bookingId = "EVT-" + Math.floor(100000 + Math.random() * 900000);
  bookingModal.querySelector("#booking-id").textContent = bookingId;
  if (foundEvent) {
    bookingModal.querySelector("#event-date").textContent = `${formatDate(
      foundEvent.date
    )} at ${foundEvent.time}`;
  }

  quantityInput.addEventListener("input", function () {
    const qty = parseInt(this.value) || 1;
    const unitPrice =
      eventPrice === "Free" ? 0 : parseInt(eventPrice.replace(/[^\d]/g, ""));
    const total = eventPrice === "Free" ? "Free" : `₹${qty * unitPrice}`;
    totalPriceDisplay.textContent = total;
    summaryTickets.textContent = qty;
    summaryTotal.textContent = total;
    ticketsCount.textContent = qty;
    totalPaid.textContent = total;
  });

  bookingDetailsForm.addEventListener("submit", function (e) {
    e.preventDefault();
    step1.style.display = "none";
    step2.style.display = "block";
    stepIndicator1.classList.remove("active");
    stepIndicator2.classList.add("active");
  });

  paymentForm.addEventListener("submit", function (e) {
    e.preventDefault();
    step2.style.display = "none";
    step3.style.display = "block";
    stepIndicator2.classList.remove("active");
    stepIndicator3.classList.add("active");

    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (!userData.bookings) userData.bookings = [];
    userData.bookings.push({
      id: bookingId,
      eventId,
      eventTitle,
      eventDate: foundEvent.date,
      eventTime: foundEvent.time,
      ticketsCount: parseInt(quantityInput.value) || 1,
      totalPaid: totalPaid.textContent,
      bookingDate: new Date().toISOString(),
    });
    localStorage.setItem("currentUser", JSON.stringify(userData));
    showNotification("Your booking has been confirmed!");
  });

  closeBookingModal.addEventListener("click", function () {
    bookingModal.remove();
    document.body.style.overflow = "auto";
  });

  window.addEventListener("click", function (e) {
    if (e.target === bookingModal) {
      bookingModal.remove();
      document.body.style.overflow = "auto";
    }
  });
}

// Save booking to localStorage
function saveBooking(
  eventId,
  eventTitle,
  eventDate,
  eventTime,
  ticketsCount,
  totalPaid,
  bookingId
) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  if (!user.bookings) {
    user.bookings = [];
  }

  const booking = {
    id: bookingId,
    eventId,
    eventTitle,
    eventDate,
    eventTime,
    ticketsCount,
    totalPaid,
    bookingDate: new Date().toISOString(),
  };

  user.bookings.push(booking);
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Update pagination
function updatePagination() {
  totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Update prev/next buttons
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;

  // Generate page numbers
  pageNumbers.innerHTML = "";

  // Determine range of page numbers to show
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.max(1, Math.min(totalPages, startPage + 4));

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  // Add first page
  if (startPage > 1) {
    addPageNumber(1);
    if (startPage > 2) {
      // Add ellipsis
      const ellipsis = document.createElement("span");
      ellipsis.className = "page-ellipsis";
      ellipsis.textContent = "...";
      pageNumbers.appendChild(ellipsis);
    }
  }

  // Add page numbers
  for (let i = startPage; i <= endPage; i++) {
    addPageNumber(i);
  }

  // Add last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      // Add ellipsis
      const ellipsis = document.createElement("span");
      ellipsis.className = "page-ellipsis";
      ellipsis.textContent = "...";
      pageNumbers.appendChild(ellipsis);
    }
    addPageNumber(totalPages);
  }
}

// Add page number to pagination
function addPageNumber(pageNum) {
  const pageNumber = document.createElement("div");
  pageNumber.className = `page-number ${
    pageNum === currentPage ? "active" : ""
  }`;
  pageNumber.textContent = pageNum;
  pageNumber.addEventListener("click", () => {
    currentPage = pageNum;
    displayEvents();
    // Scroll to top of events section
    document
      .querySelector(".events-list")
      .scrollIntoView({ behavior: "smooth" });
  });
  pageNumbers.appendChild(pageNumber);
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return "Date TBD";
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-IN", options);
}

// Apply filters to events
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;
  const location = locationFilter.value;
  const date = dateFilter.value;
  const price = priceFilter.value;

  filteredEvents = allEvents.filter((event) => {
    // Search term filter
    if (
      searchTerm &&
      !event.title.toLowerCase().includes(searchTerm) &&
      !event.description.toLowerCase().includes(searchTerm) &&
      !event.location.toLowerCase().includes(searchTerm)
    ) {
      return false;
    }

    // Category filter
    if (category && event.category !== category) {
      return false;
    }

    // Location filter
    if (location && !event.location.includes(location)) {
      return false;
    }

    // Date filter
    if (date) {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const thisWeekend = new Date(today);
      const daysUntilWeekend = 6 - today.getDay(); // Saturday is day 6
      thisWeekend.setDate(thisWeekend.getDate() + daysUntilWeekend);

      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      switch (date) {
        case "today":
          if (eventDate.toDateString() !== today.toDateString()) {
            return false;
          }
          break;
        case "tomorrow":
          if (eventDate.toDateString() !== tomorrow.toDateString()) {
            return false;
          }
          break;
        case "this-week":
          if (eventDate < today || eventDate > nextWeek) {
            return false;
          }
          break;
        case "this-weekend":
          const weekendEnd = new Date(thisWeekend);
          weekendEnd.setDate(weekendEnd.getDate() + 1);
          if (eventDate < thisWeekend || eventDate > weekendEnd) {
            return false;
          }
          break;
        case "next-week":
          const weekAfterNext = new Date(nextWeek);
          weekAfterNext.setDate(weekAfterNext.getDate() + 7);
          if (eventDate < nextWeek || eventDate > weekAfterNext) {
            return false;
          }
          break;
        case "this-month":
          if (eventDate < today || eventDate > nextMonth) {
            return false;
          }
          break;
      }
    }

    // Price filter
    if (price) {
      if (price === "free" && event.price !== "Free") {
        return false;
      } else if (price === "paid" && event.price === "Free") {
        return false;
      } else if (price === "0-500") {
        const eventPrice = parseInt(event.price.replace("₹", ""));
        if (isNaN(eventPrice) || eventPrice > 500) {
          return false;
        }
      } else if (price === "500-1000") {
        const eventPrice = parseInt(event.price.replace("₹", ""));
        if (isNaN(eventPrice) || eventPrice < 500 || eventPrice > 1000) {
          return false;
        }
      } else if (price === "1000+") {
        const eventPrice = parseInt(event.price.replace("₹", ""));
        if (isNaN(eventPrice) || eventPrice < 1000) {
          return false;
        }
      }
    }

    return true;
  });

  // Reset to first page
  currentPage = 1;

  // Display filtered events
  displayEvents();
}

// Clear all filters
function clearFilters() {
  searchInput.value = "";
  categoryFilter.value = "";
  locationFilter.value = "";
  dateFilter.value = "";
  priceFilter.value = "";

  filteredEvents = [...allEvents];
  currentPage = 1;
  displayEvents();
}

// Check if event is saved
function isEventSaved(eventId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.savedEvents) return false;

  return user.savedEvents.includes(parseInt(eventId));
}

// Toggle save event
function toggleSaveEvent(eventId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    // Show login modal if user is not logged in
    openModal(loginModal);
    return;
  }

  if (!user.savedEvents) {
    user.savedEvents = [];
  }

  const eventIdNum = parseInt(eventId);
  const index = user.savedEvents.indexOf(eventIdNum);

  // Update all matching save buttons on the page immediately
  const saveButtons = document.querySelectorAll(
    `.save-event[data-id="${eventId}"]`
  );

  if (index === -1) {
    // Add event to saved list
    user.savedEvents.push(eventIdNum);
    showNotification("Event saved to wishlist!");
    saveButtons.forEach((btn) => {
      btn.classList.add("saved");
      btn.querySelector("i").style.color = "#ff5e7d";
    });
  } else {
    // Remove event from saved list
    user.savedEvents.splice(index, 1);
    showNotification("Event removed from wishlist!");
    saveButtons.forEach((btn) => {
      btn.classList.remove("saved");
      btn.querySelector("i").style.color = "#ccc";
    });
  }

  // Update user data in localStorage
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Show notification
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Open modal
function openModal(modal) {
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Close modal
function closeModal(modal) {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Show featured event popup
// Show featured event popup
function showFeaturedEventPopup() {
  console.log("Checking popup...");
  // Only show if popup element exists
  if (!featuredEventPopup) return;

  // Check if user has seen it before
  const hasSeenPopup = localStorage.getItem("hasSeenPopup");

  if (!hasSeenPopup) {
    // Show after 3 seconds
    setTimeout(() => {
      featuredEventPopup.style.display = "block";
      document.body.style.overflow = "hidden"; // Prevent scrolling
      localStorage.setItem("hasSeenPopup", "true");
    }, 3000);
  }
}

// Close popup when clicking the close button
if (closePopupBtn) {
  closePopupBtn.addEventListener("click", () => {
    featuredEventPopup.style.display = "none";
    document.body.style.overflow = "auto"; // Re-enable scrolling
  });
}

// Close popup when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === featuredEventPopup) {
    featuredEventPopup.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  loadEvents();
  showFeaturedEventPopup();

  const closePopupBtn = document.querySelector(".close-popup");
  if (captchaText) {
    generateCaptcha();
  }
});

// Login button click
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    openModal(loginModal);
  });
}

// Signup button click
if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    openModal(signupModal);
    generateCaptcha();
  });
}

// Close buttons
closeButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const modal = this.closest(".modal");
    closeModal(modal);
  });
});

// Close popup
if (closePopupBtn) {
  closePopupBtn.addEventListener("click", () => {
    featuredEventPopup.style.display = "none";
  });
}

// Switch between login and signup
if (switchToSignup) {
  switchToSignup.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
    generateCaptcha();
  });
}

if (switchToLogin) {
  switchToLogin.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
  });
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === loginModal) {
    closeModal(loginModal);
  }
  if (e.target === signupModal) {
    closeModal(signupModal);
  }
  if (e.target === featuredEventPopup) {
    featuredEventPopup.style.display = "none";
  }
});

// Refresh CAPTCHA
if (refreshCaptchaBtn) {
  refreshCaptchaBtn.addEventListener("click", () => {
    generateCaptcha();
  });
}

// Login form submit
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Find user with matching email and password
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Login successful
      localStorage.setItem("currentUser", JSON.stringify(user));
      closeModal(loginModal);
      checkAuthStatus();
      showNotification("Login successful!");
    } else {
      // Login failed
      alert("Invalid email or password!");
    }
  });
}

// Signup form submit
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("signup-name").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById(
      "signup-confirm-password"
    ).value;
    const captchaInput = document.getElementById("captcha-input").value;

    // Validate CAPTCHA
    if (captchaInput !== currentCaptcha) {
      alert("Invalid CAPTCHA! Please try again.");
      generateCaptcha();
      return;
    }

    // Validate passwords
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if email already exists
    if (users.some((u) => u.email === email)) {
      alert("Email already exists! Please use a different email.");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      savedEvents: [],
      createdEvents: [],
    };

    // Add user to users array
    users.push(newUser);

    // Save users to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    // Log in the new user
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    // Close modal and update UI
    closeModal(signupModal);
    checkAuthStatus();
    showNotification("Account created successfully!");
  });
}

// Logout button click
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("currentUser");
    checkAuthStatus();
    showNotification("Logged out successfully!");
    window.location.href = "index.html";
  });
}

// Search button click
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    applyFilters();
  });
}

// Search input enter key
if (searchInput) {
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  });
}

// Filter button click
if (filterBtn) {
  filterBtn.addEventListener("click", () => {
    applyFilters();
  });
}

// Clear filters button click
if (clearFiltersBtn) {
  clearFiltersBtn.addEventListener("click", () => {
    clearFilters();
  });
}

// Pagination buttons
if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayEvents();
      // Scroll to top of events section
      document
        .querySelector(".events-list")
        .scrollIntoView({ behavior: "smooth" });
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayEvents();
      // Scroll to top of events section
      document
        .querySelector(".events-list")
        .scrollIntoView({ behavior: "smooth" });
    }
  });
}

// Add CSS for notifications and booking modal
const style = document.createElement("style");
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

.event-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    color: white;
}

.event-badge.free {
    background-color: #10b981;
}

.event-badge.paid {
    background-color: #6366f1;
}

.booking-modal-content {
    max-width: 600px;
}

.booking-steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 16px;
}

.step {
    flex: 1;
    text-align: center;
    padding: 8px 12px;
    border-radius: 4px;
    color: #64748b;
    font-weight: 500;
}

.step.active {
    background-color: var(--primary-color);
    color: white;
}

.booking-step-content {
    margin-bottom: 24px;
}

.form-row {
    display: flex;
    gap: 16px;
}

.form-row .form-group {
    flex: 1;
}

.price-display {
    font-size: 18px;
    font-weight: 600;
    color: var(--primary-color);
}

.payment-summary {
    background-color: #f8fafc;
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 24px;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 16px;
}

.summary-row:last-child {
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px dashed #cbd5e1;
    font-weight: 600;
}

.payment-methods h3 {
    margin-bottom: 16px;
}

.payment-method-options {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
}

.payment-method {
    display: flex;
    align-items: center;
    background-color: #f1f5f9;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.payment-method input {
    margin-right: 8px;
}

.card-details {
    margin-bottom: 24px;
}

.booking-confirmation {
    text-align: center;
    padding: 24px 0;
}

.confirmation-icon {
    font-size: 64px;
    color: #10b981;
    margin-bottom: 16px;
}

.confirmation-details {
    max-width: 400px;
    margin: 24px auto;
    background-color: #f8fafc;
    padding: 16px;
    border-radius: 4px;
}

.confirmation-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.confirmation-actions {
    margin-top: 24px;
    display: flex;
    justify-content: center;
    gap: 16px;
}

.processing-payment {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
}

.free-event-message {
    text-align: center;
    padding: 24px 0;
}

.free-event-message p {
    margin-bottom: 16px;
    font-size: 18px;
    color: #10b981;
    font-weight: 500;
}
`;
document.head.appendChild(style);
