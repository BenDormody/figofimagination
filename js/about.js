// ===== ABOUT PAGE FUNCTIONALITY =====

// Initialize about page
function initializeAboutPage() {
  try {
    // Setup social media bottom bar
    setupSocialBottomBar();

    // Setup any additional functionality
    setupArtistRecommendations();

    // Track page view
    if (typeof gtag !== "undefined") {
      gtag("event", "page_view", {
        page_title: "About - Fig of Imagination",
        page_location: window.location.href,
      });
    }
  } catch (error) {
    console.error("Error initializing about page:", error);
  }
}

// Setup artist recommendations interactions
function setupArtistRecommendations() {
  const artistItems = document.querySelectorAll(".artist-item");

  artistItems.forEach((item) => {
    item.addEventListener("click", function () {
      const artistName = this.textContent;
      console.log(`Artist clicked: ${artistName}`);
      // You can add more functionality here, like opening a search or showing more info
    });

    // Add keyboard accessibility
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Learn more about ${item.textContent}`);

    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.click();
      }
    });
  });
}

// Setup social media bottom bar
function setupSocialBottomBar() {
  const socialBar = document.getElementById("social-bottom-bar");
  if (!socialBar) return;

  // Set up social media links
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
          source: "about_page",
        });
      }
    });
  });
}

// Add smooth scrolling for anchor links (if any)
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
      // For external links, let the default behavior happen
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
  });
}

// Add focus management for accessibility
function setupFocusManagement() {
  // Make recommendation categories focusable
  document.querySelectorAll(".recommendation-category").forEach((category) => {
    category.setAttribute("tabindex", "0");
    category.setAttribute("role", "region");

    const title = category.querySelector(".category-title");
    if (title) {
      category.setAttribute(
        "aria-label",
        `Recommendations for ${title.textContent.trim()}`
      );
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

// Analytics tracking
function trackPageView() {
  // Add analytics tracking here if needed
  console.log("About page viewed");
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize about page functionality
  initializeAboutPage();

  // Setup additional functionality
  setupSmoothScrolling();
  setupKeyboardNavigation();
  setupFocusManagement();
  setupLazyLoading();
});

// Export functions for potential use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeAboutPage,
    setupArtistRecommendations,
    setupSocialBottomBar,
  };
}
