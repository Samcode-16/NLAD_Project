// DOM Elements
const loginRequired = document.getElementById("login-required");
const wishlistContent = document.getElementById("wishlist-content");
const wishlistGrid = document.getElementById("wishlist-grid");
const noWishlistItems = document.getElementById("no-wishlist-items");
const wishlistCount = document.getElementById("wishlist-count");
const clearWishlistBtn = document.getElementById("clear-wishlist-btn");
const clearWishlistModal = document.getElementById("clear-wishlist-modal");
const cancelClearBtn = document.getElementById("cancel-clear-btn");
const confirmClearBtn = document.getElementById("confirm-clear-btn");
const removeWishlistModal = document.getElementById("remove-wishlist-modal");
const cancelRemoveBtn = document.getElementById("cancel-remove-btn");
const confirmRemoveBtn = document.getElementById("confirm-remove-btn");
const wishlistLoginBtn = document.getElementById("wishlist-login-btn");
const wishlistSignupBtn = document.getElementById("wishlist-signup-btn");

// Current event ID to remove
let currentRemoveEventId = null;

// Search functionality
const wishlistSearch = document.getElementById("wishlist-search");

// Check if user is logged in
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    // Show login required message
    loginRequired.style.display = "block";
    wishlistContent.style.display = "none";
  } else {
    // Load wishlist
    loginRequired.style.display = "none";
    wishlistContent.style.display = "block";
    loadWishlist();
  }
}

// Load wishlist
function loadWishlist() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.savedEvents || user.savedEvents.length === 0) {
    wishlistGrid.style.display = "none";
    noWishlistItems.style.display = "block";
    wishlistCount.textContent = "(0)";
    clearWishlistBtn.style.display = "none";
    return;
  }

  wishlistGrid.style.display = "grid";
  noWishlistItems.style.display = "none";
  wishlistCount.textContent = `(${user.savedEvents.length})`;
  clearWishlistBtn.style.display = "block";

  // Clear existing content
  wishlistGrid.innerHTML = "";

  // Fetch events from CSV to get event details
  fetch("../data/events.csv")
    .then((response) => response.text())
    .then((data) => {
      const events = parseCSV(data);
      const savedEvents = events.filter((event) =>
        user.savedEvents.includes(parseInt(event.id))
      );

      if (savedEvents.length === 0) {
        wishlistGrid.style.display = "none";
        noWishlistItems.style.display = "block";
        wishlistCount.textContent = "(0)";
        clearWishlistBtn.style.display = "none";
        return;
      }

      savedEvents.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "event-card";
        eventCard.dataset.id = event.id;

        const priceDisplay =
          event.price === "Free"
            ? '<div class="event-badge free">Free</div>'
            : `<div class="event-badge paid">${event.price}</div>`;

        eventCard.innerHTML = `
                    <div class="event-image">
                        <img src="${
                          event.image ||
                          "../assets/images/placeholder-event.jpg"
                        }" alt="${event.title || "Event"}">
                        ${priceDisplay}
                        <div class="remove-wishlist" data-id="${event.id}">
                            <i class="fas fa-times"></i>
                        </div>
                    </div>
                    <div class="event-details">
                        <div class="event-date">${formatDate(event.date)} • ${
          event.time || "TBD"
        }</div>
                        <h3 class="event-title">${
                          event.title || "Event Title"
                        }</h3>
                        <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${
                          event.location || "Location TBD"
                        }</div>
                        <div class="event-category">${
                          event.category || "General"
                        }</div>
                        <p class="event-description">${
                          event.description || "No description available"
                        }</p>
                        <div class="event-actions">
                            <button class="btn-primary book-now-btn" data-id="${
                              event.id
                            }" data-title="${
          event.title || "Event"
        }" data-price="${event.price || "Free"}">Book Now</button>
                        </div>
                    </div>
                `;

        // Add event listener for remove button
        const removeBtn = eventCard.querySelector(".remove-wishlist");
        removeBtn.addEventListener("click", function () {
          const eventId = this.getAttribute("data-id");
          showRemoveConfirmation(eventId);
        });

        // Add event listener for book now button
        const bookBtn = eventCard.querySelector(".book-now-btn");
        bookBtn.addEventListener("click", function () {
          const eventId = this.getAttribute("data-id");
          const eventTitle = this.getAttribute("data-title");
          const eventPrice = this.getAttribute("data-price");

          if (typeof openBookingModal === "function") {
            openBookingModal(eventId, eventTitle, eventPrice);
          } else {
            // Implement booking modal if the function doesn't exist
            simulateBooking(eventId, eventTitle, eventPrice);
          }
        });

        wishlistGrid.appendChild(eventCard);
      });
    })
    .catch((error) => {
      console.error("Error loading events:", error);
      wishlistGrid.style.display = "none";
      noWishlistItems.style.display = "block";
    });
}

// Show remove confirmation
function showRemoveConfirmation(eventId) {
  currentRemoveEventId = eventId;
  openModal(removeWishlistModal);
}

// Remove event from wishlist
function removeFromWishlist(eventId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.savedEvents) return;

  const index = user.savedEvents.indexOf(parseInt(eventId));
  if (index !== -1) {
    user.savedEvents.splice(index, 1);
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Remove card from UI
    const card = document.querySelector(`.event-card[data-id="${eventId}"]`);
    if (card) {
      card.remove();
    }

    // Update wishlist count
    wishlistCount.textContent = `(${user.savedEvents.length})`;

    // Show no wishlist items if empty
    if (user.savedEvents.length === 0) {
      wishlistGrid.style.display = "none";
      noWishlistItems.style.display = "block";
      clearWishlistBtn.style.display = "none";
    }

    showNotification("Event removed from wishlist!");
  }
}

// Clear wishlist
function clearWishlist() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  user.savedEvents = [];
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Update UI
  wishlistGrid.style.display = "none";
  noWishlistItems.style.display = "block";
  wishlistCount.textContent = "(0)";
  clearWishlistBtn.style.display = "none";

  showNotification("Wishlist cleared successfully!");
}

// Parse CSV data
function parseCSV(csv) {
  const lines = csv.split("\n");
  const headers = lines[0].split(",");

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(",");
      const event = {};

      headers.forEach((header, index) => {
        let value = values[index] ? values[index].trim() : "";
        if (header === "image") {
          // Update image path to use correct relative path
          value = value.replace("img/", "../assets/images/");
        }
        event[header.trim()] = value;
      });

      return event;
    });
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return "Date TBD";

  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-IN", options);
}

// Simulate booking if openBookingModal function is not available
function simulateBooking(eventId, eventTitle, eventPrice) {
  // Create booking modal
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
                            <input type="text" id="booking-name" required>
                        </div>
                        <div class="form-group">
                            <label for="booking-email">Email</label>
                            <input type="email" id="booking-email" required>
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
                                <span>Event:</span>
                                <span>${eventTitle}</span>
                            </div>
                            <div class="summary-row">
                                <span>Tickets:</span>
                                <span id="summary-tickets">1</span>
                            </div>
                            <div class="summary-row">
                                <span>Total:</span>
                                <span id="summary-total">${
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
                                    <label class="payment-method">
                                        <input type="radio" name="payment-method" value="card" checked>
                                        <span>Credit/Debit Card</span>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="payment-method" value="upi">
                                        <span>UPI</span>
                                    </label>
                                    <label class="payment-method">
                                        <input type="radio" name="payment-method" value="netbanking">
                                        <span>Net Banking</span>
                                    </label>
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
                        <div class="confirmation-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h3>Booking Confirmed!</h3>
                        <p>Your booking for <strong>${eventTitle}</strong> has been confirmed.</p>
                        <div class="confirmation-details">
                            <div class="confirmation-row">
                                <span>Booking ID:</span>
                                <span id="booking-id"></span>
                            </div>
                            <div class="confirmation-row">
                                <span>Event:</span>
                                <span>${eventTitle}</span>
                            </div>
                            <div class="confirmation-row">
                                <span>Number of Tickets:</span>
                                <span id="tickets-count">1</span>
                            </div>
                            <div class="confirmation-row">
                                <span>Total Paid:</span>
                                <span id="total-paid">${
                                  eventPrice === "Free" ? "Free" : eventPrice
                                }</span>
                            </div>
                        </div>
                        <p>A confirmation email has been sent to your registered email address.</p>
                        <div class="confirmation-actions">
                            <button class="btn-secondary" id="close-confirmation">Close</button>
                            <button class="btn-primary" id="download-ticket">Download Ticket</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

  // Add modal to the body
  const modalContainer = document.createElement("div");
  modalContainer.innerHTML = bookingModalHTML;
  document.body.appendChild(modalContainer.firstChild);

  // Get elements
  const bookingModal = document.getElementById("booking-modal");
  const closeBookingModal = bookingModal.querySelector(".close");
  const bookingDetailsForm = document.getElementById("booking-details-form");
  const paymentForm = document.getElementById("payment-form");
  const step1 = document.getElementById("booking-step-1");
  const step2 = document.getElementById("booking-step-2");
  const step3 = document.getElementById("booking-step-3");
  const stepIndicator1 = document.getElementById("step-1");
  const stepIndicator2 = document.getElementById("step-2");
  const stepIndicator3 = document.getElementById("step-3");
  const quantityInput = document.getElementById("booking-quantity");
  const totalPriceDisplay = document.querySelector(".total-price");
  const summaryTickets = document.getElementById("summary-tickets");
  const summaryTotal = document.getElementById("summary-total");
  const closeConfirmationBtn = document.getElementById("close-confirmation");
  const downloadTicketBtn = document.getElementById("download-ticket");

  // Autofill user details
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    document.getElementById("booking-name").value = user.name || "";
    document.getElementById("booking-email").value = user.email || "";
    document.getElementById("booking-phone").value = user.phone || "";
  }

  // Generate booking ID
  const bookingId = "EVT-" + Math.floor(100000 + Math.random() * 900000);
  document.getElementById("booking-id").textContent = bookingId;

  // Show modal
  bookingModal.style.display = "block";
  document.body.style.overflow = "hidden";

  // Update total price when quantity changes
  if (eventPrice !== "Free") {
    quantityInput.addEventListener("change", function () {
      const quantity = parseInt(this.value);
      const priceValue = parseInt(eventPrice.replace("₹", ""));
      const total = quantity * priceValue;
      totalPriceDisplay.textContent = `₹${total}`;
    });
  } else {
    // Hide price containers for free events
    document.getElementById("booking-price-container").style.display = "none";
    document.getElementById("booking-total-container").style.display = "none";
  }

  // Close modal
  closeBookingModal.addEventListener("click", function () {
    bookingModal.style.display = "none";
    document.body.style.overflow = "auto";
    bookingModal.remove();
  });

  // Booking details form submit
  bookingDetailsForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Update summary information
    const quantity = quantityInput.value;
    summaryTickets.textContent = quantity;

    if (eventPrice !== "Free") {
      const priceValue = parseInt(eventPrice.replace("₹", ""));
      const total = quantity * priceValue;
      summaryTotal.textContent = `₹${total}`;
    }

    // Move to step 2
    step1.style.display = "none";
    step2.style.display = "block";
    stepIndicator1.classList.remove("active");
    stepIndicator2.classList.add("active");
  });

  // Payment form submit
  paymentForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Show a loading indicator
    if (eventPrice !== "Free") {
      this.innerHTML = `<div class="processing-payment">
                <div class="spinner"></div>
                <p>Processing payment...</p>
            </div>`;
    }

    // Simulate payment processing
    setTimeout(() => {
      // Update confirmation details
      document.getElementById("tickets-count").textContent =
        quantityInput.value;

      if (eventPrice !== "Free") {
        const priceValue = parseInt(eventPrice.replace("₹", ""));
        const total = parseInt(quantityInput.value) * priceValue;
        document.getElementById("total-paid").textContent = `₹${total}`;
      }

      // Save booking to localStorage
      saveBooking(
        eventId,
        eventTitle,
        quantityInput.value,
        eventPrice === "Free" ? "Free" : totalPriceDisplay.textContent,
        bookingId
      );

      // Move to step 3
      step2.style.display = "none";
      step3.style.display = "block";
      stepIndicator2.classList.remove("active");
      stepIndicator3.classList.add("active");
    }, 2000);
  });

  // Close confirmation button
  closeConfirmationBtn.addEventListener("click", function () {
    bookingModal.style.display = "none";
    document.body.style.overflow = "auto";
    bookingModal.remove();
  });

  // Download ticket button
  downloadTicketBtn.addEventListener("click", function () {
    showNotification("Ticket downloaded successfully!");
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

// Save booking to localStorage
function saveBooking(eventId, eventTitle, ticketsCount, totalPaid, bookingId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  if (!user.bookings) {
    user.bookings = [];
  }

  // Find event details from CSV
  fetch("../data/events.csv")
    .then((response) => response.text())
    .then((data) => {
      const events = parseCSV(data);
      const event = events.find((e) => e.id == eventId);

      const booking = {
        id: bookingId,
        eventId,
        eventTitle,
        eventDate: event ? event.date : "",
        eventTime: event ? event.time : "",
        ticketsCount,
        totalPaid,
        bookingDate: new Date().toISOString(),
      };

      user.bookings.push(booking);
      localStorage.setItem("currentUser", JSON.stringify(user));
    })
    .catch((error) => {
      console.error("Error loading event details:", error);

      // Save booking without event details
      const booking = {
        id: bookingId,
        eventId,
        eventTitle,
        ticketsCount,
        totalPaid,
        bookingDate: new Date().toISOString(),
      };

      user.bookings.push(booking);
      localStorage.setItem("currentUser", JSON.stringify(user));
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
document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();

  // Clear wishlist button
  if (clearWishlistBtn) {
    clearWishlistBtn.addEventListener("click", () => {
      openModal(clearWishlistModal);
    });
  }

  // Cancel clear button
  if (cancelClearBtn) {
    cancelClearBtn.addEventListener("click", () => {
      closeModal(clearWishlistModal);
    });
  }

  // Confirm clear button
  if (confirmClearBtn) {
    confirmClearBtn.addEventListener("click", () => {
      clearWishlist();
      closeModal(clearWishlistModal);
    });
  }

  // Cancel remove button
  if (cancelRemoveBtn) {
    cancelRemoveBtn.addEventListener("click", () => {
      closeModal(removeWishlistModal);
      currentRemoveEventId = null;
    });
  }

  // Confirm remove button
  if (confirmRemoveBtn) {
    confirmRemoveBtn.addEventListener("click", () => {
      if (currentRemoveEventId) {
        removeFromWishlist(currentRemoveEventId);
        currentRemoveEventId = null;
      }
      closeModal(removeWishlistModal);
    });
  }

  // Wishlist login button
  if (wishlistLoginBtn) {
    wishlistLoginBtn.addEventListener("click", () => {
      const loginModal = document.getElementById("login-modal");
      if (loginModal) {
        openModal(loginModal);
      }
    });
  }

  // Wishlist signup button
  if (wishlistSignupBtn) {
    wishlistSignupBtn.addEventListener("click", () => {
      const signupModal = document.getElementById("signup-modal");
      if (signupModal) {
        openModal(signupModal);
        if (typeof generateCaptcha === "function") {
          generateCaptcha();
        }
      }
    });
  }

  // Close buttons
  document.querySelectorAll(".close").forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      closeModal(modal);
    });
  });

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === clearWishlistModal) {
      closeModal(clearWishlistModal);
    }
    if (e.target === removeWishlistModal) {
      closeModal(removeWishlistModal);
      currentRemoveEventId = null;
    }
  });

  // Search functionality
  wishlistSearch.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const wishlistItems = document.querySelectorAll(".event-card");
    const noSearchResults = document.getElementById("no-search-results");
    let visibleItems = 0;

    wishlistItems.forEach((item) => {
      const eventTitle = item
        .querySelector(".event-title")
        .textContent.toLowerCase();
      const eventDescription = item
        .querySelector(".event-description")
        .textContent.toLowerCase();

      if (
        eventTitle.includes(searchTerm) ||
        eventDescription.includes(searchTerm)
      ) {
        item.style.display = "block";
        visibleItems++;
      } else {
        item.style.display = "none";
      }
    });

    // Show/hide no results message
    if (searchTerm && visibleItems === 0) {
      noSearchResults.style.display = "block";
    } else {
      noSearchResults.style.display = "none";
    }
  });
});

// Add CSS for booking modal if not already added
const bookingModalStyle = document.createElement("style");
bookingModalStyle.textContent = `
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

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid var(--primary-color);
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

@media screen and (max-width: 576px) {
    .payment-method-options {
        flex-direction: column;
        gap: 8px;
    }
    
    .form-row {
        flex-direction: column;
        gap: 8px;
    }
    
    .confirmation-actions {
        flex-direction: column;
        gap: 8px;
    }
    
    .confirmation-actions button {
        width: 100%;
    }
}
`;
document.head.appendChild(bookingModalStyle);
