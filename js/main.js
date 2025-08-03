// ===== CORE FUNCTIONALITY =====

// Global state
let poemsData = null;
let collectionsData = null;

// Google Analytics tracking functions
function trackPageView(pageTitle = null) {
  if (typeof gtag !== "undefined") {
    gtag("event", "page_view", {
      page_title: pageTitle || document.title,
      page_location: window.location.href,
    });
  }
}

function trackCustomEvent(eventName, parameters = {}) {
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, parameters);
  }
}

function trackPoemClick(poemId, poemTitle, collection = null) {
  trackCustomEvent("poem_click", {
    poem_id: poemId,
    poem_title: poemTitle,
    collection: collection,
    page_location: window.location.href,
  });
}

function trackSocialClick(platform) {
  trackCustomEvent("social_click", {
    platform: platform,
    page_location: window.location.href,
  });
}

function trackSearch(searchTerm, resultsCount) {
  trackCustomEvent("search", {
    search_term: searchTerm,
    results_count: resultsCount,
    page_location: window.location.href,
  });
}

function trackFilter(filterType, filterValue) {
  trackCustomEvent("filter", {
    filter_type: filterType,
    filter_value: filterValue,
    page_location: window.location.href,
  });
}

// Data loading and management
async function loadPoems() {
  try {
    const response = await fetch("data/poems.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    poemsData = data.poems || [];
    collectionsData = data.collections || [];
    return data;
  } catch (error) {
    console.error("Error loading poems:", error);
    throw error;
  }
}

function getPoemById(id) {
  if (!poemsData) return null;
  return poemsData.find((poem) => poem.id === id);
}

function formatPoemTitle(poem, index) {
  if (poem.title) {
    return poem.title;
  }
  return `Poem ${index + 1}`;
}

function getPoemPreview(content) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return "No preview available";
  }

  // Get the first stanza and limit to first few lines
  const firstStanza = content[0];
  const lines = firstStanza.split("\r\n").filter((line) => line.trim());
  const previewLines = lines.slice(0, 3);

  return previewLines.join("\n");
}

function formatDate(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    return dateString;
  }
}

function navigateToPoem(poemId) {
  const url = `poem.html?id=${poemId}`;
  window.location.href = url;
}

function createPoemCard(poem, index) {
  const title = formatPoemTitle(poem, index);
  const preview = getPoemPreview(poem.content);
  const date = formatDate(poem.dateCreated);

  const card = document.createElement("div");
  card.className = "poem-card";
  card.setAttribute("data-poem-id", poem.id);

  card.innerHTML = `
        <h4 class="poem-card-title">${escapeHtml(title)}</h4>
        <p class="poem-card-preview">${escapeHtml(preview)}</p>
        <div class="poem-card-meta">
            <span class="poem-card-date">${date}</span>
            ${
              poem.collection
                ? `<span class="poem-card-collection">${escapeHtml(
                    poem.collection
                  )}</span>`
                : ""
            }
        </div>
    `;

  // Add click handler
  card.addEventListener("click", () => {
    // Track poem card click
    if (typeof gtag !== "undefined") {
      gtag("event", "poem_card_click", {
        poem_id: poem.id,
        poem_title: title,
        collection: poem.collection || null,
        page_location: window.location.href,
      });
    }
    navigateToPoem(poem.id);
  });

  return card;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Utility function to show loading state
function showLoading(container) {
  container.innerHTML = `
        <div class="loading-placeholder">
            <div class="poem-card skeleton">
                <div class="skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
            <div class="poem-card skeleton">
                <div class="skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
            <div class="poem-card skeleton">
                <div class="skeleton-title"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        </div>
    `;
}

// Utility function to show error state
function showError(container, message = "Failed to load poems") {
  container.innerHTML = `
        <div class="error-state">
            <p>${escapeHtml(message)}</p>
            <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>
    `;
}

// Intersection Observer for animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll(".section").forEach((section) => {
    observer.observe(section);
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupScrollAnimations();
});
