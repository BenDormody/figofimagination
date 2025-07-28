// ===== HOME PAGE FUNCTIONALITY =====

// DOM elements
let recentPoemsGrid = null;
let featuredPoemsGrid = null;

// Initialize home page
async function initializeHomePage() {
  try {
    // Get DOM elements
    recentPoemsGrid = document.getElementById("recent-poems-grid");
    featuredPoemsGrid = document.getElementById("featured-poems-grid");

    if (!recentPoemsGrid || !featuredPoemsGrid) {
      console.error("Required DOM elements not found");
      return;
    }

    // Load poems data
    const data = await loadPoems();

    // Display recent and featured poems
    displayRecentPoems(data.poems);
    displayFeaturedPoems(data.poems);
  } catch (error) {
    console.error("Error initializing home page:", error);
    showError(recentPoemsGrid, "Failed to load poems");
    showError(featuredPoemsGrid, "Failed to load featured poems");
  }
}

// Display recent poems (3-5 most recent)
function displayRecentPoems(poems) {
  if (!recentPoemsGrid || !poems) return;

  // Sort by date (most recent first)
  const sortedPoems = [...poems].sort((a, b) => {
    const dateA = new Date(a.dateCreated || 0);
    const dateB = new Date(b.dateCreated || 0);
    return dateB - dateA;
  });

  // Take the first 3-5 poems
  const recentPoems = sortedPoems.slice(0, 5);

  // Clear loading state
  recentPoemsGrid.innerHTML = "";

  if (recentPoems.length === 0) {
    recentPoemsGrid.innerHTML = `
            <div class="empty-state">
                <p>No poems available yet.</p>
            </div>
        `;
    return;
  }

  // Create and append poem cards
  recentPoems.forEach((poem, index) => {
    const card = createPoemCard(poem, index);
    recentPoemsGrid.appendChild(card);
  });
}

// Display featured poems (2-3 curated selections)
function displayFeaturedPoems(poems) {
  if (!featuredPoemsGrid || !poems) return;

  // Filter for featured poems
  const featuredPoems = poems.filter((poem) => poem.featured === true);

  // Clear loading state
  featuredPoemsGrid.innerHTML = "";

  if (featuredPoems.length === 0) {
    featuredPoemsGrid.innerHTML = `
            <div class="empty-state">
                <p>No featured poems available.</p>
            </div>
        `;
    return;
  }

  // Take up to 3 featured poems
  const displayPoems = featuredPoems.slice(0, 3);

  // Create and append poem cards
  displayPoems.forEach((poem, index) => {
    const card = createPoemCard(poem, index);
    featuredPoemsGrid.appendChild(card);
  });
}

// Enhanced poem card creation for home page
function createPoemPreview(poem) {
  if (
    !poem.content ||
    !Array.isArray(poem.content) ||
    poem.content.length === 0
  ) {
    return "No preview available";
  }

  // Get the first stanza and limit to first few lines
  const firstStanza = poem.content[0];
  const lines = firstStanza.split("\n").filter((line) => line.trim());
  const previewLines = lines.slice(0, 3);

  return previewLines.join("\n");
}

// Add smooth scrolling for anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Add keyboard navigation support
function setupKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    // Escape key to close any modals or overlays
    if (e.key === "Escape") {
      // Add any escape key functionality here
    }

    // Enter key on poem cards
    if (e.key === "Enter" && e.target.classList.contains("poem-card")) {
      const poemId = e.target.getAttribute("data-poem-id");
      if (poemId) {
        navigateToPoem(poemId);
      }
    }
  });
}

// Add focus management for accessibility
function setupFocusManagement() {
  // Make poem cards focusable
  document.querySelectorAll(".poem-card").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      `Read ${card.querySelector(".poem-card-title").textContent}`
    );
  });
}

// Performance optimization: Lazy load images if any are added later
function setupLazyLoading() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

// Error handling with retry functionality
function handleLoadError(container, retryFunction) {
  container.innerHTML = `
        <div class="error-state">
            <p>Something went wrong while loading the content.</p>
            <button class="btn btn-primary" onclick="retryLoad()">Try Again</button>
        </div>
    `;

  // Add retry function to window scope
  window.retryLoad = retryFunction;
}

// Analytics tracking (if needed)
function trackPageView() {
  // Add analytics tracking here if needed
  console.log("Home page viewed");
}

function trackPoemClick(poemId, poemTitle) {
  // Add analytics tracking here if needed
  console.log(`Poem clicked: ${poemTitle} (ID: ${poemId})`);
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize home page functionality
  initializeHomePage();

  // Setup additional functionality
  setupSmoothScrolling();
  setupKeyboardNavigation();
  setupFocusManagement();
  setupLazyLoading();

  // Track page view
  trackPageView();

  // Add focus management after poems are loaded
  setTimeout(() => {
    setupFocusManagement();
  }, 1000);
});

// Export functions for potential use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeHomePage,
    displayRecentPoems,
    displayFeaturedPoems,
    createPoemPreview,
  };
}
