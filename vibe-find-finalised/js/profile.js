// DOM Elements
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");
const profileLocation = document.getElementById("profile-location");
const profileBio = document.getElementById("profile-bio");
const profileJoined = document.getElementById("profile-joined");
const profilePicture = document.getElementById("profile-picture");
const picturePreview = document.getElementById("picture-preview");
const changePictureBtn = document.getElementById("change-picture-btn");
const uploadPictureBtn = document.getElementById("upload-picture-btn");
const pictureUpload = document.getElementById("picture-upload");
const useDefaultPictureBtn = document.getElementById("use-default-picture-btn");
const savePictureBtn = document.getElementById("save-picture-btn");
const cancelPictureBtn = document.getElementById("cancel-picture-btn");
const editProfileBtn = document.getElementById("edit-profile-btn");
const profileInfoDisplay = document.getElementById("profile-info-display");
const profileInfoEdit = document.getElementById("profile-info-edit");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const profileEditForm = document.getElementById("profile-edit-form");
const editName = document.getElementById("edit-name");
const editEmail = document.getElementById("edit-email");
const editPhone = document.getElementById("edit-phone");
const editLocation = document.getElementById("edit-location");
const editBio = document.getElementById("edit-bio");
const passwordForm = document.getElementById("password-form");
const currentPassword = document.getElementById("current-password");
const newPassword = document.getElementById("new-password");
const confirmPassword = document.getElementById("confirm-password");
const strengthBar = document.getElementById("strength-bar");
const strengthText = document.getElementById("strength-text");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const deleteAccountModal = document.getElementById("delete-account-modal");
const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
const confirmDeleteBtn = document.getElementById("confirm-delete-btn");
const changePictureModal = document.getElementById("change-picture-modal");
const profileMenu = document.querySelector(".profile-menu");
const profileSections = document.querySelectorAll(".profile-section");
const bookingList = document.getElementById("booking-list");
const noBookings = document.getElementById("no-bookings");
const wishlistEvents = document.getElementById("wishlist-events");
const noWishlist = document.getElementById("no-wishlist");

// Check if user is logged in
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    // Redirect to home page if not logged in
    window.location.href = "index.html";
    return;
  }

  // Set user profile information
  displayUserProfile(user);
  loadBookings();
  loadWishlist();
}

// Display user profile information
function displayUserProfile(user) {
  profileName.textContent = user.name || "Not provided";
  profileEmail.textContent = user.email || "Not provided";
  profilePhone.textContent = user.phone || "Not provided";
  profileLocation.textContent = user.location || "Not provided";
  profileBio.textContent = user.bio || "Not provided";

  // Format joined date
  const joinedDate = new Date(user.id); // Using id as timestamp
  profileJoined.textContent = joinedDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Set profile picture
  if (user.profileImage) {
    profilePicture.src = user.profileImage;
    picturePreview.src = user.profileImage;
  }

  // Populate edit form
  editName.value = user.name || "";
  editEmail.value = user.email || "";
  editPhone.value = user.phone || "";
  editLocation.value = user.location || "";
  editBio.value = user.bio || "";
}

// Load user bookings
function loadBookings() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.bookings || user.bookings.length === 0) {
    noBookings.style.display = "block";
    return;
  }

  noBookings.style.display = "none";
  bookingList.innerHTML = "";

  // Sort bookings by date (newest first)
  const sortedBookings = [...user.bookings].sort((a, b) => {
    return new Date(b.bookingDate) - new Date(a.bookingDate);
  });

  sortedBookings.forEach((booking) => {
    const bookingCard = document.createElement("div");
    bookingCard.className = "booking-card";

    // Format event date
    let eventDateStr = "Date not available";
    if (booking.eventDate) {
      const eventDate = new Date(booking.eventDate);
      eventDateStr = eventDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Format booking date
    let bookingDateStr = "Date not available";
    if (booking.bookingDate) {
      const bookingDate = new Date(booking.bookingDate);
      bookingDateStr = bookingDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    bookingCard.innerHTML = `
            <div class="booking-event-name">${
              booking.eventTitle || "Unknown Event"
            }</div>
            <div class="booking-details">
                <div class="booking-detail">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${eventDateStr} ${
      booking.eventTime ? "• " + booking.eventTime : ""
    }</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-ticket-alt"></i>
                    <span>${booking.ticketsCount || "1"} Ticket(s)</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>Total: ${booking.totalPaid || "Free"}</span>
                </div>
                <div class="booking-detail">
                    <i class="fas fa-clock"></i>
                    <span>Booked on: ${bookingDateStr}</span>
                </div>
            </div>
            <div class="booking-ticket">
                <div class="booking-qr">
                    <i class="fas fa-qrcode fa-3x"></i>
                </div>
                <div class="booking-id">Booking ID: ${
                  booking.id || "Unknown"
                }</div>
                <button class="btn-secondary download-ticket" data-id="${
                  booking.id
                }">
                    <i class="fas fa-download"></i> Download Ticket
                </button>
            </div>
        `;

    const downloadBtn = bookingCard.querySelector(".download-ticket");
    downloadBtn.addEventListener("click", function () {
      showNotification("Ticket downloaded successfully!");
    });

    bookingList.appendChild(bookingCard);
  });
}

// Load user wishlist
function loadWishlist() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.savedEvents || user.savedEvents.length === 0) {
    noWishlist.style.display = "block";
    return;
  }

  noWishlist.style.display = "none";
  wishlistEvents.innerHTML = "";

  // Fetch events from CSV to get event details
  fetch("../data/events.csv")
    .then((response) => response.text())
    .then((data) => {
      const events = parseCSV(data);
      const savedEvents = events.filter((event) =>
        user.savedEvents.includes(parseInt(event.id))
      );

      if (savedEvents.length === 0) {
        noWishlist.style.display = "block";
        return;
      }

      savedEvents.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.className = "event-card";

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
                        <div class="event-actions">
                            <a href="../html/event-details.html?id=${
                              event.id
                            }" class="btn-primary view-event-btn">View Details</a>
                        </div>
                    </div>
                `;

        const removeBtn = eventCard.querySelector(".remove-wishlist");
        removeBtn.addEventListener("click", function () {
          const eventId = this.getAttribute("data-id");
          removeFromWishlist(eventId);
          eventCard.remove();

          // Check if wishlist is empty after removal
          if (wishlistEvents.children.length === 0) {
            noWishlist.style.display = "block";
          }
        });

        wishlistEvents.appendChild(eventCard);
      });
    })
    .catch((error) => {
      console.error("Error loading events:", error);
      noWishlist.style.display = "block";
    });
}

// Remove event from wishlist
function removeFromWishlist(eventId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.savedEvents) return;

  const index = user.savedEvents.indexOf(parseInt(eventId));
  if (index !== -1) {
    user.savedEvents.splice(index, 1);
    localStorage.setItem("currentUser", JSON.stringify(user));
    showNotification("Event removed from wishlist!");
  }
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
        event[header.trim()] = values[index] ? values[index].trim() : "";
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

// Switch between profile sections
function switchSection(sectionId) {
  // Hide all sections
  profileSections.forEach((section) => {
    section.classList.remove("active");
  });

  // Show the selected section
  document.getElementById(sectionId).classList.add("active");

  // Update menu active state
  const menuItems = document.querySelectorAll(".profile-menu a");
  menuItems.forEach((item) => {
    item.classList.remove("active");
    if (item.getAttribute("href") === "#" + sectionId) {
      item.classList.add("active");
    }
  });
}

// Edit profile
function toggleEditMode(edit) {
  if (edit) {
    profileInfoDisplay.style.display = "none";
    profileInfoEdit.style.display = "block";
  } else {
    profileInfoDisplay.style.display = "block";
    profileInfoEdit.style.display = "none";
  }
}

// Save profile changes
function saveProfileChanges() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  user.name = editName.value;
  user.email = editEmail.value;
  user.phone = editPhone.value;
  user.location = editLocation.value;
  user.bio = editBio.value;

  localStorage.setItem("currentUser", JSON.stringify(user));

  // Update display
  displayUserProfile(user);
  toggleEditMode(false);

  showNotification("Profile updated successfully!");
}

// Change password
function changePassword() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  if (currentPassword.value !== user.password) {
    alert("Current password is incorrect!");
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    alert("New passwords do not match!");
    return;
  }

  // Update password
  user.password = newPassword.value;
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Update all users array
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex((u) => u.id === user.id);
  if (userIndex !== -1) {
    users[userIndex] = user;
    localStorage.setItem("users", JSON.stringify(users));
  }

  // Reset form
  passwordForm.reset();

  showNotification("Password updated successfully!");
}

// Delete account
function deleteAccount() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  // Remove user from users array
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const updatedUsers = users.filter((u) => u.id !== user.id);
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  // Clear current user
  localStorage.removeItem("currentUser");

  showNotification("Account deleted successfully!");

  // Redirect to home page
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

// Change profile picture
function changeProfilePicture() {
  openModal(changePictureModal);
}

// Upload profile picture
function uploadProfilePicture() {
  pictureUpload.click();
}

// Handle profile picture upload
function handlePictureUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    picturePreview.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Use default profile picture
function useDefaultProfilePicture() {
  picturePreview.src = "img/default-profile.png";
}

// Save profile picture
function saveProfilePicture() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;

  user.profileImage = picturePreview.src;
  localStorage.setItem("currentUser", JSON.stringify(user));

  // Update profile picture
  profilePicture.src = picturePreview.src;
  document.getElementById("profile-image").src = picturePreview.src;

  closeModal(changePictureModal);
  showNotification("Profile picture updated successfully!");
}

// Check password strength
function checkPasswordStrength(password) {
  let strength = 0;

  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;

  // Contains number
  if (/\d/.test(password)) strength += 1;

  // Contains lowercase
  if (/[a-z]/.test(password)) strength += 1;

  // Contains uppercase
  if (/[A-Z]/.test(password)) strength += 1;

  // Contains special character
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  // Update UI
  let percentage = 0;
  let text = "";
  let color = "";

  switch (strength) {
    case 0:
    case 1:
      percentage = 20;
      text = "Very Weak";
      color = "#dc3545";
      break;
    case 2:
    case 3:
      percentage = 40;
      text = "Weak";
      color = "#ffc107";
      break;
    case 4:
      percentage = 60;
      text = "Medium";
      color = "#fd7e14";
      break;
    case 5:
      percentage = 80;
      text = "Strong";
      color = "#20c997";
      break;
    case 6:
      percentage = 100;
      text = "Very Strong";
      color = "#198754";
      break;
  }

  strengthBar.style.width = percentage + "%";
  strengthBar.style.backgroundColor = color;
  strengthText.textContent = text;
  strengthText.style.color = color;
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

  // Profile menu click
  const menuItems = document.querySelectorAll(".profile-menu a");
  menuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("href").substring(1);
      switchSection(sectionId);
    });
  });

  // Edit profile button
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      toggleEditMode(true);
    });
  }

  // Cancel edit button
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      toggleEditMode(false);
    });
  }

  // Profile edit form submit
  if (profileEditForm) {
    profileEditForm.addEventListener("submit", (e) => {
      e.preventDefault();
      saveProfileChanges();
    });
  }

  // Password form submit
  if (passwordForm) {
    passwordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      changePassword();
    });
  }

  // New password input
  if (newPassword) {
    newPassword.addEventListener("input", () => {
      checkPasswordStrength(newPassword.value);
    });
  }

  // Delete account button
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener("click", () => {
      openModal(deleteAccountModal);
    });
  }

  // Cancel delete button
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", () => {
      closeModal(deleteAccountModal);
    });
  }

  // Confirm delete button
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      deleteAccount();
    });
  }

  // Change profile picture button
  if (changePictureBtn) {
    changePictureBtn.addEventListener("click", () => {
      changeProfilePicture();
    });
  }

  // Upload profile picture button
  if (uploadPictureBtn) {
    uploadPictureBtn.addEventListener("click", () => {
      uploadProfilePicture();
    });
  }

  // Profile picture upload
  if (pictureUpload) {
    pictureUpload.addEventListener("change", handlePictureUpload);
  }

  // Use default profile picture button
  if (useDefaultPictureBtn) {
    useDefaultPictureBtn.addEventListener("click", () => {
      useDefaultProfilePicture();
    });
  }

  // Save profile picture button
  if (savePictureBtn) {
    savePictureBtn.addEventListener("click", () => {
      saveProfilePicture();
    });
  }

  // Cancel profile picture button
  if (cancelPictureBtn) {
    cancelPictureBtn.addEventListener("click", () => {
      closeModal(changePictureModal);
    });
  }

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === deleteAccountModal) {
      closeModal(deleteAccountModal);
    }
    if (e.target === changePictureModal) {
      closeModal(changePictureModal);
    }
  });

  // Close buttons
  document.querySelectorAll(".close").forEach((button) => {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      closeModal(modal);
    });
  });
});
