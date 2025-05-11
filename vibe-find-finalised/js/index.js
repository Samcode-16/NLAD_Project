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
const featuredEventsContainer = document.getElementById(
  "featured-events-container"
);

// CAPTCHA elements
const captchaText = document.getElementById("captcha-text");
const refreshCaptchaBtn = document.getElementById("refresh-captcha");
const captchaInput = document.getElementById("captcha-input");

// Current CAPTCHA value
let currentCaptcha = "";

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

// Load featured events
function loadFeaturedEvents() {
  if (!featuredEventsContainer) {
    console.error("featuredEventsContainer not found!");
    return;
  }

  featuredEventsContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading events...</p>
        </div>
    `;
  fetch("../data/events.csv")
    .then((response) => response.text())
    .then((data) => {
      const events = parseCSV(data);
      // Show random 3 events
      const randomEvents = events.sort(() => 0.5 - Math.random()).slice(0, 3);
      displayFeaturedEvents(randomEvents);
    })
    .catch((error) => {
      console.error("Error loading events:", error);
      // Fallback to hardcoded events if CSV fails to load
      const fallbackEvents = [
        {
          id: 1,
          title: "Diwali Cultural Festival",
          date: "2025-04-25",
          time: "18:00",
          location: "Mumbai, Maharashtra",
          description:
            "Join us for a celebration of lights with music, dance, and traditional Indian food.",
          price: "Free",
          image: "../assets/images/diwali-festival.jpeg",
          category: "Cultural",
        },
        {
          id: 2,
          title: "Tech Conference 2025",
          date: "2025-05-15",
          time: "09:00",
          location: "Bangalore, Karnataka",
          description:
            "The biggest tech conference in India featuring industry leaders and innovative startups.",
          price: "₹1500",
          image: "../assets/images/tech-conference.jpg",
          category: "Business",
        },
        {
          id: 3,
          title: "Classical Music Concert",
          date: "2025-06-10",
          time: "19:30",
          location: "Delhi, NCR",
          description:
            "An evening of classical Indian music featuring renowned musicians from across the country.",
          price: "₹800",
          image: "../assets/images/orchestra.jpg",
          category: "Music",
        },
      ];
      displayFeaturedEvents(fallbackEvents);
    });
}

// Parse CSV data
function parseCSV(csv) {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");

  return lines
    .slice(1)
    .map((line) => {
      if (!line.trim()) return null; // Skip empty lines

      const values = line.split(",");
      const event = {};

      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim() : "";
        // Convert img/ paths to assets/images/
        if (header === "image" && value.startsWith("img/")) {
          value = "../assets/images/" + value.substring(4);
        }
        event[header.trim()] = value;
      });

      return event;
    })
    .filter((event) => event !== null);
}

// Display featured events
function displayFeaturedEvents(events) {
  console.log("Events to display:", events);
  if (!featuredEventsContainer) return;

  featuredEventsContainer.innerHTML = "";

  events.forEach((event) => {
    console.log("Processing event:", event);
    console.log("Image path:", event.image);
    const isSaved = isEventSaved(event.id);
    const priceDisplay =
      event.price === "Free"
        ? '<div class="event-badge free">Free</div>'
        : `<div class="event-badge paid">Paid • ${event.price}</div>`;

    const eventCard = document.createElement("div");
    eventCard.className = "event-card";
    const imagePath = event.image || "../assets/images/placeholder-event.jpg";
    console.log("Final image path:", imagePath);
    eventCard.innerHTML = `
    <div class="event-image">
        <img src="${imagePath}" alt="${
      event.title || "Event"
    }" onerror="console.log('Image failed to load:', this.src)">
        ${priceDisplay}
    </div>
    <div class="event-details">
        <div class="event-date">${formatDate(event.date) || "TBD"} • ${
      event.time || "TBD"
    }</div>
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
            <div class="save-event ${isSaved ? "saved" : ""}" data-id="${
      event.id
    }">
                <i class="fas ${isSaved ? "fa-heart" : "fa-heart"}"></i>
            </div>
        </div>
    </div>
`;

    // Add event listeners for save buttons
    const saveBtn = eventCard.querySelector(".save-event");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        toggleSaveEvent(event.id);
        this.classList.toggle("saved");
      });
    }

    // Add event listener for book now button
    const bookBtn = eventCard.querySelector(".book-now-btn");
    bookBtn.addEventListener("click", function () {
      alert("Please visit the events page to complete your booking.");
    });

    featuredEventsContainer.appendChild(eventCard);
  });
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
                            <a href="events.html" class="btn-secondary">Explore More Events</a>
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

// Simple booking modal function for index page
function simpleBookingModal(eventId, eventTitle, eventPrice) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    // Show login modal if user is not logged in
    openModal(loginModal);
    showNotification("Please login to book an event");
    return;
  }

  // Create a simple booking modal
  const bookingModalHTML = `
<div id="booking-modal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Book Event: ${eventTitle}</h2>
        <p>To complete your booking, please go to the events page.</p>
        <div class="modal-actions">
            <button id="go-to-events" class="btn-primary">Go to Events</button>
        </div>
    </div>
</div>
`;

  // Add modal to the body
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = bookingModalHTML;
  document.body.appendChild(modalContainer.firstChild);

  // Get modal elements
  const bookingModal = document.getElementById("booking-modal");
  const closeBtn = bookingModal.querySelector(".close");
  const goToEventsBtn = document.getElementById("go-to-events");

  // Show modal
  bookingModal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Add event listeners
  closeBtn.addEventListener("click", function () {
    bookingModal.style.display = "none";
    document.body.style.overflow = "auto";
    bookingModal.remove();
  });

  goToEventsBtn.addEventListener("click", function () {
    window.location.href = "events.html";
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === bookingModal) {
      bookingModal.style.display = "none";
      document.body.style.overflow = "auto";
      bookingModal.remove();
    }
  });
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return "Date TBD";

  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-IN", options);
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

  if (index === -1) {
    // Add event to saved list
    user.savedEvents.push(eventIdNum);
    showNotification("Event saved to wishlist!");
  } else {
    // Remove event from saved list
    user.savedEvents.splice(index, 1);
    showNotification("Event removed from wishlist!");
  }

  // Update user data in localStorage
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Update all matching save buttons on the page
  const saveButtons = document.querySelectorAll(
    `.save-event[data-id="${eventId}"]`
  );
  saveButtons.forEach((btn) => {
    if (index === -1) {
      btn.classList.add("saved");
    } else {
      btn.classList.remove("saved");
    }
  });
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

// Event Listeners
window.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  loadFeaturedEvents();

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

// Add CSS for notifications
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
`;
document.head.appendChild(style);
