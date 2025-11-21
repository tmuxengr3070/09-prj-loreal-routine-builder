/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");

/* Track selected products */
let selectedProducts = [];
let allProducts = [];

/* Show initial placeholder until user selects a category */
productsContainer.innerHTML = `
  <div class="placeholder-message">
    Select a category to view products
  </div>
`;

/* Load product data from JSON file */
async function loadProducts() {
  const response = await fetch("products.json");
  const data = await response.json();
  /* Store all products for later use */
  allProducts = data.products;
  return data.products;
}

/* Create HTML for displaying product cards */
function displayProducts(products) {
  productsContainer.innerHTML = products
    .map(
      (product) => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="product-brand">${product.brand}</p>
      </div>
      <div class="product-overlay">
        <p class="overlay-description">${product.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  /* Add click handlers to all product cards */
  addProductClickHandlers();
}

/* Update the selected products display section */
function updateSelectedProductsDisplay() {
  if (selectedProducts.length === 0) {
    selectedProductsList.innerHTML = `
      <p style="color: #666; font-size: 16px;">No products selected yet. Click on products above to add them.</p>
    `;
    return;
  }

  /* Find the full product details for each selected ID */
  const selectedProductDetails = selectedProducts
    .map((id) => allProducts.find((product) => product.id === id))
    .filter((product) => product); // Remove any undefined products

  /* Create HTML for selected products */
  selectedProductsList.innerHTML = selectedProductDetails
    .map(
      (product) => `
    <div class="selected-product-item">
      <img src="${product.image}" alt="${product.name}">
      <div class="selected-product-info">
        <strong>${product.name}</strong>
        <span>${product.brand}</span>
      </div>
      <button class="remove-btn" data-id="${product.id}" title="Remove product">×</button>
    </div>
  `
    )
    .join("");

  /* Add click handlers to remove buttons */
  const removeButtons = selectedProductsList.querySelectorAll(".remove-btn");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = btn.getAttribute("data-id");
      removeProduct(productId);
    });
  });
}

/* Remove a product from selection */
function removeProduct(productId) {
  selectedProducts = selectedProducts.filter((id) => id !== productId);

  /* Remove selected class from the product card if visible */
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    card.classList.remove("selected");
  }

  /* Update the display */
  updateSelectedProductsDisplay();
}

/* Add click handlers to product cards for selection */
function addProductClickHandlers() {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productId = card.getAttribute("data-id");

      /* Toggle selection - if already selected, unselect it */
      if (selectedProducts.includes(productId)) {
        selectedProducts = selectedProducts.filter((id) => id !== productId);
        card.classList.remove("selected");
      } else {
        /* Add to selected products */
        selectedProducts.push(productId);
        card.classList.add("selected");
      }

      /* Update the selected products display */
      updateSelectedProductsDisplay();
    });
  });
}

/* Initialize the selected products display on page load */
updateSelectedProductsDisplay();

/* Filter and display products when category changes */
categoryFilter.addEventListener("change", async (e) => {
  const products = await loadProducts();
  const selectedCategory = e.target.value;

  /* filter() creates a new array containing only products 
     where the category matches what the user selected */
  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  displayProducts(filteredProducts);

  /* Restore selected state for any products that were previously selected */
  setTimeout(() => {
    selectedProducts.forEach((id) => {
      const card = document.querySelector(`.product-card[data-id="${id}"]`);
      if (card) {
        card.classList.add("selected");
      }
    });
  }, 0);
});

/* Chat form submission handler - placeholder for OpenAI integration */
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  chatWindow.innerHTML = "Connect to the OpenAI API for a response!";
});
