// ===== POEM DISPLAY PAGE FUNCTIONALITY =====

// Global variables
let currentPoem = null;
let currentPage = 1;
let totalPages = 1;
let poemPages = [];
let collectionPoems = [];

// DOM elements
const loadingContainer = document.getElementById("loading-container");
const poemContainer = document.getElementById("poem-container");
const errorContainer = document.getElementById("error-container");
const poemTitle = document.getElementById("poem-title");
const breadcrumbPoemTitle = document.getElementById("breadcrumb-poem-title");
const poemDate = document.getElementById("poem-date");
const poemText = document.getElementById("poem-text");
const paginationControls = document.getElementById("pagination-controls");
const currentPageElement = document.getElementById("current-page");
const totalPagesElement = document.getElementById("total-pages");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const poemNavigation = document.getElementById("poem-navigation");
const collectionPoemsContainer = document.getElementById("collection-poems");
const prevPoemBtn = document.getElementById("prev-poem-btn");
const nextPoemBtn = document.getElementById("next-poem-btn");

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const poemId = urlParams.get("id");

  if (poemId) {
    loadPoem(parseInt(poemId));
  } else {
    showError("No poem ID provided");
  }

  // Setup social bottom bar
  setupSocialBottomBar();
});

// Load poem by ID
async function loadPoem(poemId) {
  try {
    showLoading();

    // Load poems data
    const response = await fetch("data/poems.json");
    if (!response.ok) {
      throw new Error("Failed to load poems data");
    }

    const data = await response.json();
    const poem = data.poems.find((p) => p.id === poemId);

    if (!poem) {
      throw new Error("Poem not found");
    }

    currentPoem = poem;
    displayPoem(poem);
    setupNavigation(data, poemId);
  } catch (error) {
    console.error("Error loading poem:", error);
    showError("Failed to load poem");
  }
}

// Display poem content
function displayPoem(poem) {
  // Set poem title
  const title = poem.title || `Poem ${poem.id}`;
  poemTitle.textContent = title;
  breadcrumbPoemTitle.textContent = title;

  // Set poem date
  const date = new Date(poem.dateCreated);
  poemDate.textContent = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Display all poem content
  displayAllPoemContent(poem.content);

  // Hide pagination since we're showing all content
  paginationControls.style.display = "none";

  // Show poem container
  hideLoading();
  poemContainer.style.display = "block";
}

// Display all poem content without pagination
function displayAllPoemContent(content) {
  let poemHTML = "";

  // Handle both array of stanzas and single string with stanza breaks
  if (Array.isArray(content)) {
    // If content is an array, join all elements and then split by \r\n\r\n
    const fullContent = content.join("\r\n\r\n");
    const stanzas = fullContent.split("\r\n\r\n");

    poemHTML = stanzas
      .map((stanza, index) => {
        const lines = stanza.split("\r\n").filter((line) => line.trim());
        const stanzaLines = lines
          .map((line) => `<div class="poem-line">${line}</div>`)
          .join("");

        // Add a single line break between stanzas (except after the last stanza)
        if (index < stanzas.length - 1) {
          return stanzaLines + '<div class="poem-line stanza-break"></div>';
        }
        return stanzaLines;
      })
      .join("");
  } else if (typeof content === "string") {
    // If content is a single string, split by \r\n\r\n to get stanzas
    const stanzas = content.split("\r\n\r\n");
    poemHTML = stanzas
      .map((stanza, index) => {
        const lines = stanza.split("\r\n").filter((line) => line.trim());
        const stanzaLines = lines
          .map((line) => `<div class="poem-line">${line}</div>`)
          .join("");

        // Add a single line break between stanzas (except after the last stanza)
        if (index < stanzas.length - 1) {
          return stanzaLines + '<div class="poem-line stanza-break"></div>';
        }
        return stanzaLines;
      })
      .join("");
  }

  poemText.innerHTML = poemHTML;
}

// Process poem content into pages
function processPoemContent(content) {
  poemPages = [];

  let stanzas = [];

  // Handle both array of stanzas and single string with stanza breaks
  if (Array.isArray(content)) {
    stanzas = content;
  } else if (typeof content === "string") {
    stanzas = content.split("\r\n\r\n");
  }

  // Each stanza becomes a page
  stanzas.forEach((stanza, index) => {
    const lines = stanza.split("\r\n").filter((line) => line.trim());
    if (lines.length > 0) {
      poemPages.push({
        stanza: index + 1,
        lines: lines,
      });
    }
  });

  totalPages = poemPages.length;

  // Show pagination if multiple pages
  if (totalPages > 1) {
    paginationControls.style.display = "flex";
    updatePaginationButtons();
  } else {
    paginationControls.style.display = "none";
  }
}

// Display current page
function displayCurrentPage() {
  if (currentPage < 1 || currentPage > totalPages) {
    return;
  }

  const page = poemPages[currentPage - 1];
  if (!page) {
    return;
  }

  // Create poem text HTML
  const poemHTML = `
        <div class="poem-stanza">
            ${page.lines
              .map((line) => `<div class="poem-line">${line}</div>`)
              .join("")}
        </div>
    `;

  poemText.innerHTML = poemHTML;

  // Update pagination display
  currentPageElement.textContent = currentPage;
  totalPagesElement.textContent = totalPages;

  // Update pagination buttons
  updatePaginationButtons();
}

// Update pagination button states
function updatePaginationButtons() {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
}

// Navigate to previous page
function goToPreviousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayCurrentPage();
  }
}

// Navigate to next page
function goToNextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    displayCurrentPage();
  }
}

// Setup navigation between poems
function setupNavigation(data, currentPoemId) {
  // Find poems in the same collection
  if (currentPoem.collection) {
    const collection = data.collections.find(
      (c) => c.name === currentPoem.collection
    );
    if (collection && collection.poems.length > 1) {
      collectionPoems = collection.poems
        .map((id) => data.poems.find((p) => p.id === id))
        .filter(Boolean);

      displayCollectionPoems();
      setupCollectionNavigation(currentPoemId);
    }
  }

  // Show navigation section if we have collection poems
  if (collectionPoems.length > 1) {
    poemNavigation.style.display = "block";
  }
}

// Display collection poems list
function displayCollectionPoems() {
  collectionPoemsContainer.innerHTML = collectionPoems
    .map((poem) => {
      const title = poem.title || `Poem ${poem.id}`;
      const date = new Date(poem.dateCreated).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const isCurrent = poem.id === currentPoem.id;
      const currentClass = isCurrent ? "current" : "";

      return `
            <a href="poem.html?id=${poem.id}" class="collection-poem-link ${currentClass}">
                <span class="collection-poem-title">${title}</span>
                <span class="collection-poem-date">${date}</span>
            </a>
        `;
    })
    .join("");
}

// Setup navigation between poems in collection
function setupCollectionNavigation(currentPoemId) {
  const currentIndex = collectionPoems.findIndex((p) => p.id === currentPoemId);

  // Previous poem button
  if (currentIndex > 0) {
    const prevPoem = collectionPoems[currentIndex - 1];
    prevPoemBtn.disabled = false;
    prevPoemBtn.onclick = () => navigateToPoem(prevPoem.id);
  } else {
    prevPoemBtn.disabled = true;
  }

  // Next poem button
  if (currentIndex < collectionPoems.length - 1) {
    const nextPoem = collectionPoems[currentIndex + 1];
    nextPoemBtn.disabled = false;
    nextPoemBtn.onclick = () => navigateToPoem(nextPoem.id);
  } else {
    nextPoemBtn.disabled = true;
  }
}

// Navigate to a specific poem
function navigateToPoem(poemId) {
  window.location.href = `poem.html?id=${poemId}`;
}

// Show loading state
function showLoading() {
  loadingContainer.style.display = "flex";
  poemContainer.style.display = "none";
  errorContainer.style.display = "none";
}

// Hide loading state
function hideLoading() {
  loadingContainer.style.display = "none";
}

// Show error state
function showError(message) {
  loadingContainer.style.display = "none";
  poemContainer.style.display = "none";
  errorContainer.style.display = "flex";

  const errorTitle = document.querySelector(".error-title");
  if (errorTitle) {
    errorTitle.textContent = message;
  }
}

// Event listeners
prevBtn.addEventListener("click", goToPreviousPage);
nextBtn.addEventListener("click", goToNextPage);

// Keyboard navigation
document.addEventListener("keydown", function (event) {
  // Only handle keyboard navigation when poem is displayed
  if (poemContainer.style.display === "none") {
    return;
  }

  switch (event.key) {
    case "ArrowLeft":
      event.preventDefault();
      goToPreviousPage();
      break;
    case "ArrowRight":
      event.preventDefault();
      goToNextPage();
      break;
    case "Home":
      event.preventDefault();
      if (currentPage > 1) {
        currentPage = 1;
        displayCurrentPage();
      }
      break;
    case "End":
      event.preventDefault();
      if (currentPage < totalPages) {
        currentPage = totalPages;
        displayCurrentPage();
      }
      break;
  }
});

// Handle browser back/forward buttons
window.addEventListener("popstate", function (event) {
  const urlParams = new URLSearchParams(window.location.search);
  const poemId = urlParams.get("id");

  if (poemId) {
    loadPoem(parseInt(poemId));
  }
});

// Update browser history when navigating pages
function updateHistory() {
  const url = new URL(window.location);
  url.searchParams.set("page", currentPage);
  window.history.replaceState({}, "", url);
}

// Add page change to history
function goToPage(pageNumber) {
  if (pageNumber >= 1 && pageNumber <= totalPages) {
    currentPage = pageNumber;
    displayCurrentPage();
    updateHistory();
  }
}

// Enhanced pagination with page numbers
function createPageNumberButtons() {
  if (totalPages <= 1) return;

  const pageNumbersContainer = document.createElement("div");
  pageNumbersContainer.className = "page-numbers";

  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous ellipsis
  if (startPage > 1) {
    const firstBtn = document.createElement("button");
    firstBtn.textContent = "1";
    firstBtn.className = "page-number-btn";
    firstBtn.onclick = () => goToPage(1);
    pageNumbersContainer.appendChild(firstBtn);

    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "page-ellipsis";
      pageNumbersContainer.appendChild(ellipsis);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.className = `page-number-btn ${i === currentPage ? "active" : ""}`;
    pageBtn.onclick = () => goToPage(i);
    pageNumbersContainer.appendChild(pageBtn);
  }

  // Next ellipsis
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "...";
      ellipsis.className = "page-ellipsis";
      pageNumbersContainer.appendChild(ellipsis);
    }

    const lastBtn = document.createElement("button");
    lastBtn.textContent = totalPages;
    lastBtn.className = "page-number-btn";
    lastBtn.onclick = () => goToPage(totalPages);
    pageNumbersContainer.appendChild(lastBtn);
  }

  return pageNumbersContainer;
}

// Add page number buttons to pagination if needed
function addPageNumberButtons() {
  if (totalPages > 5) {
    const existingPageNumbers = document.querySelector(".page-numbers");
    if (existingPageNumbers) {
      existingPageNumbers.remove();
    }

    const pageNumbers = createPageNumberButtons();
    if (pageNumbers) {
      paginationControls.insertBefore(pageNumbers, nextBtn);
    }
  }
}

// Update display to include page numbers
const originalDisplayCurrentPage = displayCurrentPage;
displayCurrentPage = function () {
  originalDisplayCurrentPage();
  addPageNumberButtons();
};

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
