// ===== CATALOGUE PAGE FUNCTIONALITY =====

// Global state for catalogue
let allPoems = [];
let allCollections = [];
let filteredPoems = [];
let currentSearchTerm = "";
let currentCollectionFilter = "";
let currentTagFilter = "";
let currentSortOption = "date-desc";
let currentSortColumn = "date";
let currentSortDirection = "desc";

// DOM elements
let searchInput = null;
let clearSearchBtn = null;
let collectionFilter = null;
let tagFilter = null;
let resultsCount = null;
let poemsTable = null;
let poemsTableBody = null;
let noResultsSection = null;
let clearFiltersBtn = null;
let sortButtons = null;

// Initialize catalogue page
async function initializeCatalogue() {
  try {
    // Get DOM elements
    searchInput = document.getElementById("search-input");
    clearSearchBtn = document.getElementById("clear-search");
    collectionFilter = document.getElementById("collection-filter");
    tagFilter = document.getElementById("tag-filter");
    resultsCount = document.getElementById("results-count");
    poemsTable = document.getElementById("poems-table");
    poemsTableBody = document.getElementById("poems-table-body");
    noResultsSection = document.getElementById("no-results-section");
    clearFiltersBtn = document.getElementById("clear-filters");
    sortButtons = document.querySelectorAll(".sort-button");

    if (!searchInput || !poemsTableBody) {
      console.error("Required DOM elements not found");
      return;
    }

    // Load poems data
    const data = await loadPoems();
    allPoems = data.poems || [];
    allCollections = data.collections || [];

    // Initialize the page
    populateCollectionFilter();
    populateTagFilter();
    displayPoemsTable();
    setupEventListeners();
    updateSortButtonStates();
    updateResultsCount();
  } catch (error) {
    console.error("Error initializing catalogue:", error);
    showError(poemsTableBody, "Failed to load poems");
  }
}

// Populate collection filter dropdown
function populateCollectionFilter() {
  if (!collectionFilter) return;

  // Clear existing options except the first one
  collectionFilter.innerHTML = '<option value="">All Collections</option>';

  // Add collection options
  allCollections.forEach((collection) => {
    const option = document.createElement("option");
    option.value = collection.name;
    option.textContent = collection.name;
    collectionFilter.appendChild(option);
  });
}

// Populate tag filter dropdown
function populateTagFilter() {
  if (!tagFilter) return;

  // Clear existing options except the first one
  tagFilter.innerHTML = '<option value="">All Tags</option>';

  // Collect all unique tags from poems
  const allTags = new Set();
  allPoems.forEach((poem) => {
    if (poem.tags && Array.isArray(poem.tags)) {
      poem.tags.forEach((tag) => allTags.add(tag));
    }
  });

  // Add tag options
  Array.from(allTags)
    .sort()
    .forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag;
      option.textContent = tag;
      tagFilter.appendChild(option);
    });
}

// Display poems in table format
function displayPoemsTable() {
  if (!poemsTableBody) return;

  // Clear loading state
  poemsTableBody.innerHTML = "";

  if (allPoems.length === 0) {
    poemsTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <p>No poems available.</p>
                </td>
            </tr>
        `;
    return;
  }

  // Show all poems initially
  filteredPoems = [...allPoems];
  renderPoemsTable();
}

// Filter and display poems based on current filters
function filterAndDisplayPoems() {
  if (!poemsTableBody) return;

  // Apply filters
  filteredPoems = allPoems.filter((poem) => {
    // Collection filter
    if (
      currentCollectionFilter &&
      poem.collection !== currentCollectionFilter
    ) {
      return false;
    }

    // Tag filter
    if (
      currentTagFilter &&
      (!poem.tags || !poem.tags.includes(currentTagFilter))
    ) {
      return false;
    }

    // Search filter
    if (currentSearchTerm) {
      const searchLower = currentSearchTerm.toLowerCase();
      const title = (poem.title || "").toLowerCase();

      // Handle both array and string content formats
      let content = "";
      if (poem.content) {
        if (Array.isArray(poem.content)) {
          // Join array elements and replace line breaks with spaces for search
          content = poem.content.join(" ").replace(/\r\n/g, " ").toLowerCase();
        } else if (typeof poem.content === "string") {
          content = poem.content.replace(/\r\n/g, " ").toLowerCase();
        }
      }

      const tags = poem.tags ? poem.tags.join(" ").toLowerCase() : "";

      if (
        !title.includes(searchLower) &&
        !content.includes(searchLower) &&
        !tags.includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  sortPoems();

  // Render results
  renderPoemsTable();
  updateResultsCount();
  showHideNoResults();
}

// Sort poems based on current sort option
function sortPoems() {
  switch (currentSortOption) {
    case "date-desc":
      filteredPoems.sort((a, b) => {
        const dateA = new Date(a.dateCreated);
        const dateB = new Date(b.dateCreated);
        const dateComparison = dateB - dateA;

        // If dates are the same, sort by title
        if (dateComparison === 0) {
          const titleA = (a.title || `Poem ${a.id}`).toLowerCase();
          const titleB = (b.title || `Poem ${b.id}`).toLowerCase();
          return titleA.localeCompare(titleB);
        }

        return dateComparison;
      });
      break;
    case "date-asc":
      filteredPoems.sort((a, b) => {
        const dateA = new Date(a.dateCreated);
        const dateB = new Date(b.dateCreated);
        const dateComparison = dateA - dateB;

        // If dates are the same, sort by title
        if (dateComparison === 0) {
          const titleA = (a.title || `Poem ${a.id}`).toLowerCase();
          const titleB = (b.title || `Poem ${b.id}`).toLowerCase();
          return titleA.localeCompare(titleB);
        }

        return dateComparison;
      });
      break;
    case "title-asc":
      filteredPoems.sort((a, b) => {
        const titleA = (a.title || `Poem ${a.id}`).toLowerCase();
        const titleB = (b.title || `Poem ${b.id}`).toLowerCase();
        return titleA.localeCompare(titleB);
      });
      break;
    case "title-desc":
      filteredPoems.sort((a, b) => {
        const titleA = (a.title || `Poem ${a.id}`).toLowerCase();
        const titleB = (b.title || `Poem ${b.id}`).toLowerCase();
        return titleB.localeCompare(titleA);
      });
      break;
  }
}

// Render poems table
function renderPoemsTable() {
  if (!poemsTableBody) return;

  // Clear table body
  poemsTableBody.innerHTML = "";

  if (filteredPoems.length === 0) {
    poemsTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="empty-state">
                    <p>No poems match your current filters.</p>
                </td>
            </tr>
        `;
    return;
  }

  // Create and append table rows
  filteredPoems.forEach((poem, index) => {
    const row = createPoemTableRow(poem, index);
    poemsTableBody.appendChild(row);
  });
}

// Create poem table row
function createPoemTableRow(poem, index) {
  const row = document.createElement("tr");
  row.setAttribute("data-poem-id", poem.id);

  const title = formatPoemTitle(poem, index);
  const date = formatDate(poem.dateCreated);
  const collection = poem.collection || "";

  row.innerHTML = `
        <td>
            <span class="poem-title">${escapeHtml(title)}</span>
        </td>
        <td>
            <span class="poem-date">${date}</span>
        </td>
        <td>
            ${
              collection
                ? `<span class="poem-collection-badge">${escapeHtml(
                    collection
                  )}</span>`
                : '<span class="no-collection">No collection</span>'
            }
        </td>
    `;

  // Add click handler
  row.addEventListener("click", () => {
    navigateToPoem(poem.id);
  });

  return row;
}

// Update results count
function updateResultsCount() {
  if (!resultsCount) return;

  const total = allPoems.length;
  const filtered = filteredPoems.length;

  if (filtered === total) {
    resultsCount.textContent = `${total} poem${total !== 1 ? "s" : ""} total`;
  } else {
    resultsCount.textContent = `${filtered} of ${total} poem${
      total !== 1 ? "s" : ""
    }`;
  }
}

// Show/hide no results section
function showHideNoResults() {
  if (!noResultsSection) return;

  if (
    filteredPoems.length === 0 &&
    (currentSearchTerm || currentCollectionFilter || currentTagFilter)
  ) {
    noResultsSection.classList.remove("hidden");
  } else {
    noResultsSection.classList.add("hidden");
  }
}

// Handle table header sorting
function handleTableSort(column) {
  console.log("handleTableSort called with column:", column);

  // Update sort state
  if (currentSortColumn === column) {
    // Toggle direction if same column
    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
  } else {
    // New column, default to ascending
    currentSortColumn = column;
    currentSortDirection = "asc";
  }

  // Update sort option
  currentSortOption = `${column}-${currentSortDirection}`;
  console.log("Sort option updated to:", currentSortOption);

  // Update sort button states
  updateSortButtonStates();

  // Apply sorting and filtering
  filterAndDisplayPoems();
}

// Update sort button visual states
function updateSortButtonStates() {
  if (!sortButtons) return;

  sortButtons.forEach((button) => {
    const column = button.getAttribute("data-sort");
    button.classList.remove("active", "asc", "desc");

    if (column === currentSortColumn) {
      button.classList.add("active", currentSortDirection);
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Search input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearchTerm = e.target.value.trim();
      updateClearSearchButton();
      filterAndDisplayPoems();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        clearSearch();
      }
    });
  }

  // Clear search button
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", clearSearch);
  }

  // Collection filter
  if (collectionFilter) {
    collectionFilter.addEventListener("change", (e) => {
      currentCollectionFilter = e.target.value;
      filterAndDisplayPoems();
    });
  }

  // Tag filter
  if (tagFilter) {
    tagFilter.addEventListener("change", (e) => {
      currentTagFilter = e.target.value;
      filterAndDisplayPoems();
    });
  }

  // Table header sort buttons
  if (sortButtons) {
    console.log("Setting up sort buttons:", sortButtons.length);
    sortButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const column = button.getAttribute("data-sort");
        console.log("Sort button clicked:", column);
        handleTableSort(column);
      });
    });
  }

  // Clear filters button
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearAllFilters);
  }
}

// Update clear search button visibility
function updateClearSearchButton() {
  if (!clearSearchBtn) return;

  if (currentSearchTerm) {
    clearSearchBtn.classList.add("visible");
  } else {
    clearSearchBtn.classList.remove("visible");
  }
}

// Clear search
function clearSearch() {
  if (searchInput) {
    searchInput.value = "";
  }
  currentSearchTerm = "";
  updateClearSearchButton();
  filterAndDisplayPoems();
}

// Clear all filters
function clearAllFilters() {
  // Clear search
  if (searchInput) {
    searchInput.value = "";
  }
  currentSearchTerm = "";

  // Clear collection filter
  if (collectionFilter) {
    collectionFilter.value = "";
  }
  currentCollectionFilter = "";

  // Clear tag filter
  if (tagFilter) {
    tagFilter.value = "";
  }
  currentTagFilter = "";

  // Reset sort to default
  currentSortOption = "date-desc";
  currentSortColumn = "date";
  currentSortDirection = "desc";

  // Update UI
  updateClearSearchButton();
  updateSortButtonStates();
  filterAndDisplayPoems();
}

// Keyboard navigation support
function setupKeyboardNavigation() {
  document.addEventListener("keydown", (e) => {
    // Focus search input with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Clear filters with Ctrl/Cmd + Shift + K
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") {
      e.preventDefault();
      clearAllFilters();
    }
  });
}

// Performance optimization: Debounce search
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced search function
const debouncedSearch = debounce(() => {
  filterAndDisplayPoems();
}, 300);

// ===== SOCIAL MEDIA BOTTOM BAR FUNCTIONALITY =====

// Setup social media bottom bar
function setupSocialBottomBar() {
  const socialBar = document.getElementById("social-bottom-bar");
  if (!socialBar) return;

  // Set up social media links (you can replace these with your actual URLs)
  const socialLinks = {
    instagram: "https://instagram.com/ben_dormody",
    letterboxd: "https://letterboxd.com/BenFigbar",
    venmo: "https://venmo.com/Ben-Dormody",
  };

  // Update social media links
  document.getElementById("instagram-link").href = socialLinks.instagram;
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
      console.log(`Social link clicked: ${platform}`);
      // Add analytics tracking here if needed
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeCatalogue();
  setupKeyboardNavigation();
  setupSocialBottomBar();
});

// Export functions for potential use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initializeCatalogue,
    filterAndDisplayPoems,
    clearAllFilters,
  };
}
