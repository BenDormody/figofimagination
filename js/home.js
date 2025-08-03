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

// Display recent poems (6 most recent)
function displayRecentPoems(poems) {
  if (!recentPoemsGrid || !poems) return;

  // Sort by date (most recent first)
  const sortedPoems = [...poems].sort((a, b) => {
    const dateA = new Date(a.dateCreated || 0);
    const dateB = new Date(b.dateCreated || 0);
    return dateB - dateA;
  });

  // Take the first 6 poems
  const recentPoems = sortedPoems.slice(0, 6);

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
  if (!poem.content) {
    return "No preview available";
  }

  let previewText = "";

  // Handle both array and string content formats
  if (Array.isArray(poem.content)) {
    if (poem.content.length === 0) {
      return "No preview available";
    }

    // Join array elements and get the first stanza
    const fullContent = poem.content.join("\r\n\r\n");
    const firstStanza = fullContent.split("\r\n\r\n")[0];
    const lines = firstStanza.split("\r\n").filter((line) => line.trim());
    const previewLines = lines.slice(0, 3);
    previewText = previewLines.join("\n");
  } else if (typeof poem.content === "string") {
    // For string content, get the first stanza (before first \r\n\r\n)
    const firstStanza = poem.content.split("\r\n\r\n")[0];
    const lines = firstStanza.split("\r\n").filter((line) => line.trim());
    const previewLines = lines.slice(0, 3);
    previewText = previewLines.join("\n");
  }

  return previewText || "No preview available";
}

// Add smooth scrolling for anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");

      // Only handle internal anchor links (starting with #)
      if (href && href.startsWith("#")) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
      // For external links (like social media), let the default behavior happen
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
    const titleElement = card.querySelector(".poem-card-title");
    if (titleElement && titleElement.textContent) {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Read ${titleElement.textContent}`);
    }
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

// Analytics tracking
function trackPageView() {
  // Track home page view
  if (typeof gtag !== "undefined") {
    gtag("event", "page_view", {
      page_title: "Home - Fig of Imagination",
      page_location: window.location.href,
    });
  }
}

function trackPoemClick(poemId, poemTitle) {
  // Track poem click from home page
  if (typeof gtag !== "undefined") {
    gtag("event", "poem_click", {
      poem_id: poemId,
      poem_title: poemTitle,
      page_location: window.location.href,
      source: "home_page",
    });
  }
}

// ===== SOCIAL MEDIA BOTTOM BAR FUNCTIONALITY =====

// Setup social media bottom bar
function setupSocialBottomBar() {
  const socialBar = document.getElementById("social-bottom-bar");
  if (!socialBar) return;

  // Set up social media links (you can replace these with your actual URLs)
  const socialLinks = {
    instagram: "https://instagram.com/ben_dormody",
    spotify:
      "https://open.spotify.com/user/bk0hskxygegtknjfs382lit1d?si=8FkeD-_WRmyZYPBGkDhJhg",
    letterboxd: "https://letterboxd.com/BenFigbar",
    venmo: "https://venmo.com/u/Ben-Dormody",
  };

  // Update social media links
  document.getElementById("instagram-link").href = socialLinks.instagram;
  document.getElementById("spotify-link").href = socialLinks.spotify;
  document.getElementById("letterboxd-link").href = socialLinks.letterboxd;
  document.getElementById("venmo-link").href = socialLinks.venmo;

  // Show/hide social bar based on scroll position
  let isVisible = false;
  let scrollTimeout;

  function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

    // Show bar when scrolled to bottom 10% of the page
    const shouldShow = scrollPercentage > 0.9;

    if (shouldShow && !isVisible) {
      socialBar.classList.add("visible");
      isVisible = true;
    } else if (!shouldShow && isVisible) {
      socialBar.classList.remove("visible");
      isVisible = false;
    }
  }

  // Throttle scroll events for better performance
  function throttledScroll() {
    if (scrollTimeout) return;

    scrollTimeout = setTimeout(() => {
      handleScroll();
      scrollTimeout = null;
    }, 100);
  }

  // Add scroll event listener
  window.addEventListener("scroll", throttledScroll, { passive: true });

  // Initial check
  handleScroll();

  // Add click tracking for social links
  document.querySelectorAll(".social-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      const platform = e.currentTarget.id.replace("-link", "");
      // Track social media clicks
      if (typeof gtag !== "undefined") {
        gtag("event", "social_click", {
          platform: platform,
          page_location: window.location.href,
          source: "home_page",
        });
      }
    });
  });
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
  setupSocialBottomBar();

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
