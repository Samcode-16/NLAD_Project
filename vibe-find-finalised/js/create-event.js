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

// Create Event page specific elements
const createEventForm = document.getElementById("create-event-form");
const loginRequired = document.getElementById("login-required");
const eventForm = document.getElementById("event-form");
const eventTitleInput = document.getElementById("event-title");
const eventCategorySelect = document.getElementById("event-category");
const eventDateInput = document.getElementById("event-date");
const eventTimeInput = document.getElementById("event-time");
const eventLocationInput = document.getElementById("event-location");
const eventPriceTypeSelect = document.getElementById("event-price-type");
const priceInputContainer = document.getElementById("price-input-container");
const eventPriceInput = document.getElementById("event-price");
const eventDescriptionInput = document.getElementById("event-description");
const eventImageInput = document.getElementById("event-image");
const imagePreview = document.getElementById("image-preview");
const termsCheckbox = document.getElementById("terms-agree");
const previewBtn = document.getElementById("preview-btn");
const eventPreviewModal = document.getElementById("event-preview-modal");
const successModal = document.getElementById("success-modal");
const viewCreatedEventBtn = document.getElementById("view-created-event");
const loginRedirectBtn = document.getElementById("login-redirect");
const signupRedirectBtn = document.getElementById("signup-redirect");

// Preview elements
const previewImage = document.getElementById("preview-image");
const previewTitle = document.getElementById("preview-title");
const previewDate = document.getElementById("preview-date");
const previewLocation = document.getElementById("preview-location");
const previewDescription = document.getElementById("preview-description");
const previewPrice = document.getElementById("preview-price");
const previewCategory = document.getElementById("preview-category");

// CAPTCHA elements
const captchaText = document.getElementById("captcha-text");
const refreshCaptchaBtn = document.getElementById("refresh-captcha");
const captchaInput = document.getElementById("captcha-input");

// Current CAPTCHA value
let currentCaptcha = "";

// For image preview
let selectedImageFile = null;

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

    // Show create event form
    if (createEventForm && loginRequired) {
      createEventForm.style.display = "block";
      loginRequired.style.display = "none";
    }
  } else {
    // User is not logged in
    authButtons.forEach((btn) => (btn.style.display = "inline-block"));
    profileDropdown.style.display = "none";

    // Show login required message
    if (createEventForm && loginRequired) {
      createEventForm.style.display = "none";
      loginRequired.style.display = "block";
    }
  }
}

// Format date
function formatDate(dateStr, timeStr) {
  const date = new Date(dateStr);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-IN", options);

  if (timeStr) {
    // Convert time from 24-hour to 12-hour format
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedDate} • ${formattedHour}:${minutes} ${ampm}`;
  }

  return formattedDate;
}

// Handle price type change
function handlePriceTypeChange() {
  const priceType = eventPriceTypeSelect.value;

  if (priceType === "paid") {
    priceInputContainer.style.display = "block";
    eventPriceInput.required = true;
  } else {
    priceInputContainer.style.display = "none";
    eventPriceInput.required = false;
    eventPriceInput.value = "";
  }
}

// Handle image upload
function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  selectedImageFile = file;

  const reader = new FileReader();
  reader.onload = function (e) {
    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Event Preview">`;
    imagePreview.classList.add("has-image");
  };
  reader.readAsDataURL(file);
}

// Show preview
function showPreview() {
  if (!validateForm(true)) return;

  // Set preview values
  previewTitle.textContent = eventTitleInput.value;
  previewDate.textContent = formatDate(
    eventDateInput.value,
    eventTimeInput.value
  );
  previewLocation.innerHTML = eventLocationInput.value;
  previewDescription.textContent = eventDescriptionInput.value;

  // Set preview price
  if (eventPriceTypeSelect.value === "free") {
    previewPrice.textContent = "Free";
  } else {
    previewPrice.textContent = `₹${eventPriceInput.value}`;
  }

  // Set preview category
  previewCategory.textContent = eventCategorySelect.value;

  // Set preview image
  if (selectedImageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(selectedImageFile);
  } else {
    previewImage.src = "../assets/images/placeholder-event.jpg";
  }

  // Show preview modal
  eventPreviewModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Validate form
function validateForm(isPreview = false) {
  // Basic validation
  if (!eventTitleInput.value) {
    if (!isPreview) alert("Please enter an event title");
    return false;
  }

  if (!eventCategorySelect.value) {
    if (!isPreview) alert("Please select a category");
    return false;
  }

  if (!eventDateInput.value) {
    if (!isPreview) alert("Please select a date");
    return false;
  }

  if (!eventTimeInput.value) {
    if (!isPreview) alert("Please select a time");
    return false;
  }

  if (!eventLocationInput.value) {
    if (!isPreview) alert("Please enter a location");
    return false;
  }

  if (!eventPriceTypeSelect.value) {
    if (!isPreview) alert("Please select a price type");
    return false;
  }

  if (eventPriceTypeSelect.value === "paid" && !eventPriceInput.value) {
    if (!isPreview) alert("Please enter a price");
    return false;
  }

  if (!eventDescriptionInput.value) {
    if (!isPreview) alert("Please enter a description");
    return false;
  }

  if (!selectedImageFile && !isPreview) {
    alert("Please upload an event image");
    return false;
  }

  if (!termsCheckbox.checked && !isPreview) {
    alert("Please agree to the terms and conditions");
    return false;
  }

  return true;
}

function submitEventForm(e) {
  e.preventDefault();

  if (!validateForm()) return;

  // Get current user
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    // Show login required message
    loginRequired.style.display = "block";
    createEventForm.style.display = "none";
    return;
  }

  // Generate random ID for the event
  const eventId = Date.now();

  // Convert the uploaded image to Base64
  if (selectedImageFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const eventImageBase64 = e.target.result;

      // Create new event object
      const newEvent = {
        id: eventId,
        title: eventTitleInput.value,
        date: eventDateInput.value,
        time: eventTimeInput.value,
        location: eventLocationInput.value,
        description: eventDescriptionInput.value,
        price:
          eventPriceTypeSelect.value === "free"
            ? "Free"
            : `₹${eventPriceInput.value}`,
        image: eventImageBase64, // Store the Base64 image
        category: eventCategorySelect.value,
        createdBy: user.id,
      };

      // Add event to user's created events
      if (!user.createdEvents) {
        user.createdEvents = [];
      }
      user.createdEvents.push(eventId);

      // Update user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Save event to localStorage
      const allEvents = JSON.parse(localStorage.getItem("events")) || [];
      allEvents.push(newEvent);
      localStorage.setItem("events", JSON.stringify(allEvents));

      // Create link to view event
      viewCreatedEventBtn.href = `my-events.html`;

      // Show success modal
      successModal.style.display = "block";
      document.body.style.overflow = "hidden";
    };
    reader.readAsDataURL(selectedImageFile);
  }
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

  // Set min date for event date to today
  if (eventDateInput) {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    eventDateInput.min = formattedDate;
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
  if (e.target === eventPreviewModal) {
    closeModal(eventPreviewModal);
  }
  if (e.target === successModal) {
    closeModal(successModal);
  }
});

// Refresh CAPTCHA
if (refreshCaptchaBtn) {
  refreshCaptchaBtn.addEventListener("click", () => {
    generateCaptcha();
  });
}

// Price type change
if (eventPriceTypeSelect) {
  eventPriceTypeSelect.addEventListener("change", handlePriceTypeChange);
}

// Image upload
if (eventImageInput) {
  eventImageInput.addEventListener("change", handleImageUpload);
}

// Preview button
if (previewBtn) {
  previewBtn.addEventListener("click", showPreview);
}

// Create event form submission
if (eventForm) {
  eventForm.addEventListener("submit", submitEventForm);
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
    // Redirect to index.html
    window.location.href = "index.html";
  });
}

// Add CSS for notifications if not already added
if (!document.getElementById("notification-styles")) {
  const style = document.createElement("style");
  style.id = "notification-styles";
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
}
