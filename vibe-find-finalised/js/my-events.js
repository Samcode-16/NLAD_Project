// DOM Elements
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const closeButtons = document.querySelectorAll(".modal .close");
const switchToSignup = document.getElementById("switch-to-signup");
const switchToLogin = document.getElementById("switch-to-login");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const logoutBtn = document.getElementById("logout-btn");
const profileDropdown = document.querySelector(".profile-dropdown");
const authButtons = document.querySelectorAll("#login-btn, #signup-btn");
const loginRequired = document.getElementById("login-required");
const myEventsSection = document.getElementById("my-events-section");
const myEventsContainer = document.getElementById("my-events-container");
const noEvents = document.getElementById("no-events");
const loginRedirectBtn = document.getElementById("login-redirect");
const signupRedirectBtn = document.getElementById("signup-redirect");

// Event action modal elements
const eventActionModal = document.getElementById("event-action-modal");
const editEventBtn = document.getElementById("edit-event-btn");
const deleteEventBtn = document.getElementById("delete-event-btn");
const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const confirmDeleteBtn = document.getElementById("confirm-delete");

// Edit event modal elements
const editEventModal = document.getElementById("edit-event-modal");
const editEventForm = document.getElementById("edit-event-form");

// Current event being managed
let currentEvent = null;

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

// Check if user is logged in and load appropriate content
function checkAuthStatus() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user) {
    // User is logged in
    if (authButtons) {
      authButtons.forEach((btn) => (btn.style.display = "none"));
    }
    if (profileDropdown) {
      profileDropdown.style.display = "block";
    }

    // Set profile image if exists
    const profileImage = document.getElementById("profile-image");
    if (profileImage && user.profileImage) {
      profileImage.src = user.profileImage;
    }

    // Show my events section
    if (loginRequired && myEventsSection) {
      loginRequired.style.display = "none";
      myEventsSection.style.display = "block";

      // Load user's events
      loadUserEvents();
    }
  } else {
    // User is not logged in
    if (authButtons) {
      authButtons.forEach((btn) => (btn.style.display = "inline-block"));
    }
    if (profileDropdown) {
      profileDropdown.style.display = "none";
    }

    // Show login required message
    if (loginRequired && myEventsSection) {
      loginRequired.style.display = "block";
      myEventsSection.style.display = "none";
    }
  }
}

// Load events created by the current user
function loadUserEvents() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.createdEvents || user.createdEvents.length === 0) {
    // User has no events
    if (noEvents && myEventsContainer) {
      noEvents.style.display = "block";
      myEventsContainer.innerHTML = "";
    }
    return;
  }

  // Get all events from localStorage
  const allEvents = JSON.parse(localStorage.getItem("events")) || [];

  // Filter events created by the user
  const userEvents = allEvents.filter(
    (event) =>
      user.createdEvents.includes(parseInt(event.id)) ||
      user.createdEvents.includes(event.id)
  );

  if (userEvents.length === 0) {
    // User has no events
    if (noEvents && myEventsContainer) {
      noEvents.style.display = "block";
      myEventsContainer.innerHTML = "";
    }
    return;
  }

  // User has events, display them
  if (noEvents && myEventsContainer) {
    noEvents.style.display = "none";
    displayUserEvents(userEvents);
  }
}

// Display user's events
function displayUserEvents(events) {
  if (!myEventsContainer) return;

  myEventsContainer.innerHTML = "";

  events.forEach((event) => {
    const eventCard = document.createElement("div");
    eventCard.className = "event-card";

    // Determine price display
    let priceDisplay = "";
    if (event.price && event.price.toLowerCase() === "free") {
      priceDisplay = `<div class="event-price">Free</div>`;
    } else if (event.price) {
      priceDisplay = `<div class="event-price">${event.price}</div>`;
    } else {
      priceDisplay = `<div class="event-price">Free</div>`;
    }

    // Format date
    const formattedDate = event.date ? formatDate(event.date) : "TBD";
    const formattedTime = event.time || "TBD";

    eventCard.innerHTML = `
            <div class="event-image">
                <img src="${
                  event.image || "../assets/images/placeholder-event.jpg"
                }" alt="${event.title || "Event"}">
                ${priceDisplay}
                <div class="event-status">My Event</div>
            </div>
            <div class="event-details">
                <div class="event-date">${formattedDate} • ${formattedTime}</div>
                <h3 class="event-title">${event.title || "Event Title"}</h3>
                <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${
                  event.location || "Location TBD"
                }</div>
                <p class="event-description">${
                  event.description || "No description available"
                }</p>
                <div class="event-actions">
                    <button class="btn-primary manage-event-btn" data-id="${
                      event.id
                    }">Manage Event</button>
                </div>
            </div>
        `;

    myEventsContainer.appendChild(eventCard);

    // Add event listener to the manage event button
    const manageBtn = eventCard.querySelector(".manage-event-btn");
    manageBtn.addEventListener("click", () => openEventActionModal(event));
  });
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-IN", options);
}

// Open event action modal
function openEventActionModal(event) {
  currentEvent = event;

  if (eventActionModal) {
    eventActionModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// Handle edit event button click
function handleEditEvent() {
  if (currentEvent && editEventModal) {
    // Populate the edit form with current event data
    document.getElementById("edit-title").value = currentEvent.title || "";
    document.getElementById("edit-description").value =
      currentEvent.description || "";
    document.getElementById("edit-date").value = currentEvent.date || "";
    document.getElementById("edit-time").value = currentEvent.time || "";
    document.getElementById("edit-location").value =
      currentEvent.location || "";
    document.getElementById("edit-price").value = currentEvent.price || "";
    document.getElementById("edit-image").value = currentEvent.image || "";

    // Open the edit modal
    closeModal(eventActionModal);
    openModal(editEventModal);
  } else {
    console.error("Error: currentEvent or editEventModal is not defined", {
      currentEvent,
      editEventModal,
    });
  }
}

// Handle delete event button click
function handleDeleteEvent() {
  if (deleteConfirmModal) {
    closeModal(eventActionModal);
    deleteConfirmModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// Confirm delete event
function confirmDeleteEvent() {
  if (!currentEvent) return;

  // Get all events from localStorage
  const allEvents = JSON.parse(localStorage.getItem("events")) || [];

  // Remove the event from the events array
  const updatedEvents = allEvents.filter(
    (event) => event.id != currentEvent.id
  );

  // Save updated events to localStorage
  localStorage.setItem("events", JSON.stringify(updatedEvents));

  // Remove the event from user's createdEvents array
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user && user.createdEvents) {
    const eventIdNum = parseInt(currentEvent.id);
    user.createdEvents = user.createdEvents.filter(
      (id) => id !== eventIdNum && id !== currentEvent.id
    );
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  // Close modal and reload events
  closeModal(deleteConfirmModal);
  loadUserEvents();

  // Show notification
  showNotification("Event deleted successfully!");
}

// Open modal
function openModal(modal) {
  if (modal) {
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

// Close modal
function closeModal(modal) {
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
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

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();

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

// Login redirect button
if (loginRedirectBtn) {
  loginRedirectBtn.addEventListener("click", () => {
    openModal(loginModal);
  });
}

// Signup redirect button
if (signupRedirectBtn) {
  signupRedirectBtn.addEventListener("click", () => {
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
  if (e.target === eventActionModal) {
    closeModal(eventActionModal);
  }
  if (e.target === deleteConfirmModal) {
    closeModal(deleteConfirmModal);
  }
  if (e.target === editEventModal) {
    closeModal(editEventModal);
  }
});

// Refresh CAPTCHA
if (refreshCaptchaBtn) {
  refreshCaptchaBtn.addEventListener("click", () => {
    generateCaptcha();
  });
}

// Event action buttons
if (editEventBtn) {
  editEventBtn.addEventListener("click", handleEditEvent);
}

if (deleteEventBtn) {
  deleteEventBtn.addEventListener("click", handleDeleteEvent);
}

// Delete confirmation buttons
if (cancelDeleteBtn) {
  cancelDeleteBtn.addEventListener("click", () => {
    closeModal(deleteConfirmModal);
  });
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", confirmDeleteEvent);
}

// Edit event form submit
if (editEventForm) {
  editEventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!currentEvent || !currentEvent.id) {
      console.error("Error: No current event or event ID is missing", {
        currentEvent,
      });
      alert("Error: No event selected for editing.");
      return;
    }

    // Get updated event data from form
    const updatedEvent = {
      ...currentEvent,
      title: document.getElementById("edit-title").value,
      description: document.getElementById("edit-description").value,
      date: document.getElementById("edit-date").value,
      time: document.getElementById("edit-time").value,
      location: document.getElementById("edit-location").value,
      price: document.getElementById("edit-price").value,
      image: document.getElementById("edit-image").value,
    };

    // Get all events from localStorage
    let allEvents = JSON.parse(localStorage.getItem("events")) || [];

    // Log current state for debugging
    console.log("Before update:", { allEvents, currentEvent, updatedEvent });

    // Update the event in the events array
    const eventId = parseInt(currentEvent.id); // Ensure ID is a number
    const updatedEvents = allEvents.map((event) => {
      if (parseInt(event.id) === eventId) {
        return updatedEvent;
      }
      return event;
    });

    // Log updated events for debugging
    console.log("After update:", { updatedEvents });

    try {
      // Save updated events to localStorage
      localStorage.setItem("events", JSON.stringify(updatedEvents));
      console.log("Events saved to localStorage successfully");
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Error: Failed to save event changes.");
      return;
    }

    // Close modal and reload events
    closeModal(editEventModal);
    loadUserEvents();

    // Show notification
    showNotification("Event updated successfully!");
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
    padding: 15px 28px;
    border-radius: 50px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    transition: bottom 0.3s ease;
    z-index: 1000;
    font-weight: 500;
}

.notification.show {
    bottom: 30px;
}
`;
document.head.appendChild(style);
