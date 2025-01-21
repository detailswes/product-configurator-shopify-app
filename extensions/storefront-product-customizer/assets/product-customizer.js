document.addEventListener("DOMContentLoaded", async () => {
  // Load CSS
  const linkElem = document.createElement("link");
  linkElem.rel = "stylesheet";
  linkElem.href = "product-customizer.css";
  document.head.appendChild(linkElem);

  // Initial HTML structure with modified overlay positioning
  const initialHTML = `
    <div class="product-customizer-container" style="display: flex; gap: 120px; margin-top:50px;">
      <div style="position: relative;">
        <img src="https://admit-ease.s3.us-east-1.amazonaws.com/brochure/new-board.png" alt="Select an image" style="width: 600px; height: 600px; border: 1px solid #666; border-radius: 5px">
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <img id="preview-image" src="default-image.png" alt="Selected image" style="width: 300px; height: 250px; object-fit: contain; z-index: 1;">
        <div id="text-overlay" style="position: relative; width: 100%; text-align: center; padding: 20px; margin-bottom: 20px; z-index: 2;">
          <h1 id="overlay-text-display" style="font-size: 32px; color: #000000; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Blue Ridge</h1>
        </div>
        </div>
      </div>
      <div>
        <h2 style="margin-top: 0">Product Customizer</h2>
        <div class="product-details">
          <p>Product ID: <span class="product-id"></span></p>
          <div class="text-customization" style="margin-top: 20px;">
            <h3>Text Overlay</h3>
            <div style="margin-bottom: 15px;">
              <label for="overlay-text">Text:</label>
              <input type="text" id="overlay-text" value="Blue Ridge" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>
          </div>
          <div class="customization-options">
            <h2>Loading customization options...</h2>
          </div>
        </div>
      </div>
    </div>
  `;

  // Update text overlay
  function updateTextOverlay(container) {
    const textOverlay = container.querySelector("#overlay-text-display");
    const textInput = container.querySelector("#overlay-text");
    // const fontSize = container.querySelector("#font-size");
    // const fontSizeValue = container.querySelector("#font-size-value");

    if (textOverlay && textInput) {
      textInput.addEventListener("input", (e) => {
        textOverlay.textContent = e.target.value;
      });

      // fontSize.addEventListener("input", (e) => {
      //   const size = `${e.target.value}px`;
      //   textOverlay.style.fontSize = size;
      //   fontSizeValue.textContent = size;
      // });
    }
  }

  // Generate customization options HTML with checkmark overlay
  function generateCustomizationHTML(images, colors) {
    if (!images?.length && !colors?.length) {
      return "<p>No customization options available.</p>";
    }

    const imageOptionsHTML = images
      .map(
        (image, index) => `
        <div class="image-option" style="display: inline-flex; gap: 40px; border:1px solid black; border-radius: 10px; margin-right: 10px; position: relative;">
          <img src="${image.image_url}" data-url="${image.image_url}" alt="Image option" class="image-thumb" style="width: 100px; height: 75px; cursor: pointer; object-fit: contain; border-radius: 10px;">
          <div class="checkmark ${index === 0 ? 'active' : ''}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${index === 0 ? 'flex' : 'none'}; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    const colorOptionsHTML = colors
      .map(
        (color) => `
        <div class="color-option" style="display: inline-block; margin-right: 10px; cursor: pointer; position: relative;">
          <div class="color-swatch" style="background-color: ${color.hex_value}; width: 40px; height: 40px; border: 1px solid #ccc; display: block; border-radius: 10px;" data-color="${color.hex_value}"></div>
          <div class="checkmark" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: none; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    return `
      <h2>Customize Your Product</h2>
      <div class="image-options">
        <h3>Select an image:</h3>
        ${imageOptionsHTML}
      </div>
      <div class="color-options">
        <h3>Select a color:</h3>
        ${colorOptionsHTML}
      </div>
    `;
  }

  // Update preview elements with selection indicators
  function updateImagePreview(container, imageUrl, selectedElement) {
    const previewImage = container.querySelector("#preview-image");
    if (imageUrl) {
      previewImage.src = imageUrl;
      previewImage.classList.remove("hidden");
    }

    // Update checkmarks for images
    container.querySelectorAll('.image-option .checkmark').forEach(checkmark => {
      checkmark.style.display = 'none';
    });
    
    if (selectedElement) {
      const checkmark = selectedElement.closest('.image-option').querySelector('.checkmark');
      if (checkmark) {
        checkmark.style.display = 'flex';
      }
    }
  }

  function updateColorPreview(container, colorCode, selectedElement) {
    const textOverlay = container.querySelector("#overlay-text-display");
    if (textOverlay && colorCode) {
      textOverlay.style.color = colorCode;
    }

    // Update checkmarks for colors
    container.querySelectorAll('.color-option .checkmark').forEach(checkmark => {
      checkmark.style.display = 'none';
    });
    
    if (selectedElement) {
      const checkmark = selectedElement.closest('.color-option').querySelector('.checkmark');
      if (checkmark) {
        checkmark.style.display = 'flex';
      }
    }
  }

  // Initialize customizer
  async function initializeCustomizer(container, productId) {
    try {
      // Set initial HTML
      container.innerHTML = initialHTML;

      // Initialize text overlay controls
      updateTextOverlay(container);

      // Set product ID
      const productIdElement = container.querySelector(".product-id");
      if (productIdElement) {
        productIdElement.textContent = productId;
      }

      // Fetch product configurations
      const response = await fetch(
        `http://localhost:45903/api/productConfigurationList?product_id=${productId}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const customizationOptionsElement = container.querySelector(
        ".customization-options",
      );
      if (!customizationOptionsElement) {
        throw new Error("Customization options container not found");
      }

      const { images, colors } = data.data;
      const allImages = images.map((img) => img.adaSignageImages || []).flat();
      const allColors = colors.map((clr) => clr.availableColors || []).flat();

      // Set default image if available
      if (allImages.length > 0) {
        updateImagePreview(container, allImages[0].image_url);
      }

      const customizationHtml = generateCustomizationHTML(allImages, allColors);
      customizationOptionsElement.innerHTML = customizationHtml;

      // Add event listeners for image selection
      const imageOptions = container.querySelectorAll(".image-thumb");
      imageOptions.forEach((img) =>
        img.addEventListener("click", () => {
          const imageUrl = img.dataset.url;
          console.log("Image selected:", imageUrl);
          updateImagePreview(container, imageUrl, img);
        }),
      );

      // Add event listeners for color selection
      const colorOptions = container.querySelectorAll(".color-swatch");
      colorOptions.forEach((swatch) =>
        swatch.addEventListener("click", () => {
          const colorCode = swatch.dataset.color;
          console.log("Color selected:", colorCode);
          updateColorPreview(container, colorCode, swatch);
        }),
      );
    } catch (error) {
      console.error("Error initializing product customizer:", error);
      const customizationOptionsElement = container.querySelector(
        ".customization-options",
      );
      if (customizationOptionsElement) {
        customizationOptionsElement.innerHTML = `
          <p class="error-message">Failed to load customization options: ${error.message}</p>
        `;
      }
    }
  }

  // Initialize all customizer containers
  const containers = document.querySelectorAll("[data-product-customizer]");

  containers.forEach((container) => {
    const productId = container.getAttribute("data-product-id");
    if (productId) {
      initializeCustomizer(container, productId);
    } else {
      console.error("Product ID not found for customizer container");
      container.innerHTML =
        '<p class="error-message">Error: Product ID not found</p>';
    }
  });
});