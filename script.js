/* Get references to DOM elements */
const categoryFilter = document.getElementById("categoryFilter");
const productsContainer = document.getElementById("productsContainer");
const chatForm = document.getElementById("chatForm");
const chatWindow = document.getElementById("chatWindow");
const selectedProductsList = document.getElementById("selectedProductsList");
const clearAllBtn = document.getElementById("clearAllBtn");

/* Track selected products */
let selectedProducts = [];
let allProducts = [];

/* Load selected products from localStorage when page loads */
function loadSelectedProductsFromStorage() {
  const saved = localStorage.getItem("selectedProducts");
  if (saved) {
    try {
      selectedProducts = JSON.parse(saved);
    } catch (error) {
      console.error(
        "Error loading selected products from localStorage:",
        error
      );
      selectedProducts = [];
    }
  }
}

/* Save selected products to localStorage */
function saveSelectedProductsToStorage() {
  localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
}

/* Initialize selected products from localStorage */
loadSelectedProductsFromStorage();

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

  /* Update the selected products display after loading all products */
  updateSelectedProductsDisplay();

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
    /* Hide the Clear All button when no products are selected */
    clearAllBtn.style.display = "none";
    return;
  }

  /* Show the Clear All button when products are selected */
  clearAllBtn.style.display = "flex";

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

  /* Save updated selection to localStorage */
  saveSelectedProductsToStorage();

  /* Remove selected class from the product card if visible */
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (card) {
    card.classList.remove("selected");
  }

  /* Update the display */
  updateSelectedProductsDisplay();
}

/* Clear all selected products */
function clearAllProducts() {
  /* Clear the selected products array */
  selectedProducts = [];

  /* Clear from localStorage */
  localStorage.removeItem("selectedProducts");

  /* Remove selected class from all product cards */
  const allCards = document.querySelectorAll(".product-card.selected");
  allCards.forEach((card) => {
    card.classList.remove("selected");
  });

  /* Update the display */
  updateSelectedProductsDisplay();

  /* Clear the chat window if it had content */
  if (chatWindow.innerHTML.trim() !== "") {
    chatWindow.innerHTML = "";
  }
}

/* Add click handler for Clear All button */
clearAllBtn.addEventListener("click", () => {
  /* Show confirmation dialog before clearing */
  const confirmed = confirm(
    "Are you sure you want to remove all selected products?"
  );

  if (confirmed) {
    clearAllProducts();
  }
});

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

      /* Save updated selection to localStorage */
      saveSelectedProductsToStorage();

      /* Update the selected products display */
      updateSelectedProductsDisplay();
    });
  });
}

/* Initialize the selected products display on page load */
updateSelectedProductsDisplay();

/* Load products on page load to display any saved selections */
loadProducts();

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

/* Get reference to the Generate Routine button */
const generateRoutineBtn = document.getElementById("generateRoutine");

/* Handle Generate Routine button click */
generateRoutineBtn.addEventListener("click", async () => {
  /* Check if user has selected any products */
  if (selectedProducts.length === 0) {
    chatWindow.innerHTML = `
      <p style="color: #666;">Please select at least one product to generate a routine.</p>
    `;
    return;
  }

  /* Get full product details for each selected product ID */
  const selectedProductDetails = selectedProducts
    .map((id) => allProducts.find((product) => product.id === id))
    .filter((product) => product);

  /* Show loading message while waiting for AI response */
  chatWindow.innerHTML = `
    <p style="color: #666;">
      <i class="fa-solid fa-spinner fa-spin"></i> Generating your personalized routine...
    </p>
  `;

  /* Format the product information as a readable string */
  const productInfo = selectedProductDetails
    .map(
      (product) => `
    - ${product.name} by ${product.brand}
      Category: ${product.category}
      Description: ${product.description}
  `
    )
    .join("\n");

  /* Create the messages array for OpenAI API */
  const messages = [
    {
      role: "system",
      content:
        "You are a professional beauty and skincare advisor for L'Oréal. Create personalized routines based on the products provided. Be specific about the order of use, timing (morning/evening), and application tips.",
    },
    {
      role: "user",
      content: `Please create a detailed skincare/beauty routine using these products:\n\n${productInfo}\n\nProvide step-by-step instructions on how and when to use each product for best results.`,
    },
  ];

   // Replace with your actual Cloudflare Worker URL
    const workerUrl = "https://project-loreal.tonymcmo.workers.dev/";

  try {
    /* Send request to OpenAI API using fetch with async/await */
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        /* Use the API key from secrets.js */
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    /* Parse the JSON response from OpenAI */
    const data = await response.json();

    /* Check if we received a valid response from OpenAI */
    if (data.choices && data.choices[0] && data.choices[0].message) {
      /* Extract the AI-generated routine from the response */
      const routine = data.choices[0].message.content;

      /* Display the routine in the chat window */
      chatWindow.innerHTML = `
        <div style="line-height: 1.8;">
          <h3 style="margin-bottom: 15px; font-size: 18px;">Your Personalized Routine</h3>
          <div style="white-space: pre-wrap;">${routine}</div>
        </div>
      `;
    } else {
      /* Handle cases where the response format is unexpected */
      chatWindow.innerHTML = `
        <p style="color: #d32f2f;">Sorry, I couldn't generate a routine. Please try again.</p>
      `;
    }
  } catch (error) {
    /* Handle any errors that occur during the API call */
    console.error("Error calling OpenAI API:", error);
    chatWindow.innerHTML = `
      <p style="color: #d32f2f;">An error occurred while generating your routine. Please check your API key and try again.</p>
    `;
  }
});
