document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const unregisterActivitySelect = document.getElementById("unregister-activity");
  const signupForm = document.getElementById("signup-form");
  const unregisterForm = document.getElementById("unregister-form");
  const messageDiv = document.getElementById("message");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabPanels = document.querySelectorAll(".tab-panel");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and existing options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      unregisterActivitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsMarkup = (details.participants || []).length > 0
          ? `<ul class="participants-list">${(details.participants || []).map((email) => `<li>${email}</li>`).join("")}</ul>`
          : '<p class="participants-empty">No participants registered yet.</p>';

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <button class="participants-toggle" type="button" aria-expanded="false">
              Registered participants
            </button>
            <div class="participants-content hidden">
              ${participantsMarkup}
            </div>
          </div>
        `;

        activitiesList.appendChild(activityCard);

        const toggleButton = activityCard.querySelector(".participants-toggle");
        const content = activityCard.querySelector(".participants-content");

        toggleButton.addEventListener("click", () => {
          const isExpanded = toggleButton.getAttribute("aria-expanded") === "true";
          toggleButton.setAttribute("aria-expanded", String(!isExpanded));
          content.classList.toggle("hidden", isExpanded);
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option.cloneNode(true));
        unregisterActivitySelect.appendChild(option.cloneNode(true));
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  async function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.tab;

      tabButtons.forEach((tab) => {
        tab.classList.toggle("active", tab === button);
        tab.setAttribute("aria-selected", String(tab === button));
      });

      tabPanels.forEach((panel) => {
        const isActive = panel.id === `${target}-panel`;
        panel.classList.toggle("active", isActive);
        panel.hidden = !isActive;
      });
    });
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        signupForm.reset();
        await fetchActivities();
        await showMessage(result.message, "success");
      } else {
        await showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      await showMessage("Failed to sign up. Please try again.", "error");
      console.error("Error signing up:", error);
    }
  });

  unregisterForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("unregister-email").value;
    const activity = document.getElementById("unregister-activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        unregisterForm.reset();
        await fetchActivities();
        await showMessage(result.message, "success");
      } else {
        await showMessage(result.detail || "An error occurred", "error");
      }
    } catch (error) {
      await showMessage("Failed to unregister. Please try again.", "error");
      console.error("Error unregistering:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
