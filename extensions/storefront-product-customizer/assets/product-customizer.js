document.addEventListener("DOMContentLoaded", async () => {
  const loaderHTML = `
  <div id="page-loader" style="
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;">
    <div class="loader" style="
      width: 50px;
      height: 50px;
      border: 5px solid #ccc;
      border-top-color: #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;">
    </div>
  </div>
  <style>
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;
  document.body.insertAdjacentHTML("afterbegin", loaderHTML);

  // Function to show/hide loader
  function showLoader() {
    document.getElementById("page-loader").style.display = "flex";
  }

  function hideLoader() {
    document.getElementById("page-loader").style.display = "none";
  }

  // Show loader when the page starts loading
  showLoader();

  const selectedOptions = {
    imageId: null,
    shapeId: null,
    colorId: null,
    bgColorId: null,
  };

  // Initial HTML structure with wrapper for shape and content
  const initialHTML = `
  <div class="product-customizer-container">
    <div class="product-customizer-image">
      <!-- Base shape container with background color support -->
      <div id="shape-container">
        
        <!-- Content container -->
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <img id="preview-image"
               alt="Selected image">
          <div id="text-overlay" 
               style="position: relative; min-height: 134px; text-align: center; margin-bottom: 20px; z-index: 2;">
            <h1 id="overlay-text-display" 
                style="font-size: 30px; color: #000000; margin-bottom: 10px; font-family:Noto Serif Hentaigana">
              BLUE RIDGE
            </h1>
            <h2 id="braille-text-display"
                style="font-size: 24px; color: #000000; font-family:Noto Serif Hentaigana">
              ⠃⠇⠥⠑ ⠗⠊⠙⠛⠑
            </h2>
          </div>
        </div>
      </div>
      <div class="description_content">
      <h1 class="description_main">Description:</h1>
      <span class="product-description"></span>
      </div>
    </div>
    <div class="product-customizer-content">
      <h2 style="margin-top: 0" class="testing_class">Product Customizer</h2>
      <div class="product-details">
        <p>Product ID: <span class="product-id"></span></p>
        <p style= "font-weight:bold;"><span class="product-price"></span></p>
        <div class="customization-options">
          <h2>Loading customization options...</h2>
        </div>
        <div class="text-customization" style="margin-top: 20px;">
          <h3 style="margin-bottom:7px; font-family: 'Roboto Condensed', sans-serif;">Enter Custom Text</h3>
          <div style="margin-bottom: 15px;">
            <label for="overlay-text" style="display:block;"></label>
            <input type="text" 
              id="overlay-text" 
              value="BLUE RIDGE" 
              maxlength="17" 
              style="width: 100%; padding: 8px;text-transform: uppercase;max-width: 300px; border-radius: 8px;border: 1px solid #000;height: 40px;">
          </div>
        </div>
      </div>
    </div>
  </div>
`;

  // Update text overlay
  function updateTextOverlay(container) {
    const textOverlay = container.querySelector("#overlay-text-display");
    const brailleOverlay = container.querySelector("#braille-text-display");
    const textInput = container.querySelector("#overlay-text");

    if (textOverlay && brailleOverlay && textInput) {
      // Set maxlength attribute on input
      textInput.setAttribute("maxlength", "17");

      textInput.addEventListener("input", (e) => {
        // Convert to uppercase and trim to 17 characters
        let value = e.target.value.toUpperCase();

        // Update input value
        e.target.value = value;

        // Update normal text display
        textOverlay.textContent = value;

        // Convert to Braille
        const brailleValue = value
          .split("")
          .map(
            (char) =>
              "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿"[
                " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=".indexOf(
                  char,
                )
              ],
          )
          .join("");

        // Update Braille display
        brailleOverlay.textContent = brailleValue;
      });

      // Handle paste events
      textInput.addEventListener("paste", (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData(
          "text",
        );
        const uppercaseText = pastedText.toUpperCase().slice(0, 17);

        const currentValue = textInput.value;
        const cursorPosition = textInput.selectionStart;

        const newValue =
          currentValue.slice(0, cursorPosition) +
          uppercaseText +
          currentValue.slice(cursorPosition);

        const finalValue = newValue.slice(0, 17);

        // Update input value
        textInput.value = finalValue;

        // Update normal text
        textOverlay.textContent = finalValue;

        // Update Braille text
        const brailleValue = finalValue
          .split("")
          .map(
            (char) =>
              "⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿"[
                " A1B'K2L@CIF/MSP\"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=".indexOf(
                  char,
                )
              ],
          )
          .join("");
        brailleOverlay.textContent = brailleValue;
      });
    }
  }

  // Generate customization options HTML
  function generateCustomizationHTML(images, colors, bgColors, shapesSizes) {
    if (
      !images?.length &&
      !colors?.length &&
      !bgColors.length &&
      !shapesSizes.length
    ) {
      return "<p>No customization options available.</p>";
    }

    const imageOptionsHTML = images
      .map(
        (image, index) => `
        <div class="image-option" data-id=${image.id}>
          <img src="${image.image_url}" 
               data-url="${image.image_url}" 
               data-price="${image.additional_price || 0}"
               alt="Image option" 
               class="image-thumb" 
               style="width: 100px; height: 75px; cursor: pointer; object-fit: contain; border-radius: 10px;padding:10px">
          <div class="checkmark ${index === 0 ? "active" : ""}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${
            index === 0 ? "flex" : "none"
          }; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>
        `,
      )
      .join("");

    const shapesOptionsHTML = shapesSizes
      .map(
        (shape, index) => `
        <div class="shape-option" data-id=${shape.id} style="gap: 40px; margin-right: 4px; margin-bottom: 10px; position: relative;">
          <img src="${shape.image}" 
               data-url="${shape.image}" 
               data-price="${shape.additional_price || 0}"
               alt="Shape option" 
               class="shapes-sizes" 
               style="width: 100px; height: 75px; cursor: pointer; object-fit: contain; border:1px solid black; border-radius: 0px;">
          <p style="text-align:center;margin:0px">${shape.width}" * ${shape.height}"</p>
          <div class="checkmark ${index === 0 ? "active" : ""}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${
            index === 0 ? "flex" : "none"
          }; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    const colorOptionsHTML = colors
      .map(
        (color, index) => `
        <div class="color-option" style="display: inline-block; margin-right: 10px; margin-bottom: 10px; cursor: pointer; position: relative;">
          <div class="color-swatch" data-id=${color.id} style="background-color: ${color.hex_value}; width: 40px; height: 40px; border: 1px solid #ccc; display: block; border-radius: 10px;" data-color="${color.hex_value}"></div>
          <div class="checkmark ${index === 0 ? "active" : ""}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${
            index === 0 ? "flex" : "none"
          }; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    const bgColorOptionsHtml = bgColors
      .map(
        (bgColor, index) => `
        <div class="bg-color-option" style="display: inline-block; margin-right: 10px; margin-bottom: 10px; cursor: pointer; position: relative;">
          <div class="bgColor-swatch" data-id=${bgColor.id} style="background-color: ${bgColor.hex_value}; width: 40px; height: 40px; border: 1px solid #ccc; display: block; border-radius: 10px;" data-color="${bgColor.hex_value}"></div>
          <div class="checkmark ${index === 0 ? "active" : ""}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${
            index === 0 ? "flex" : "none"
          }; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    return `
      <div class="image-options">
        <h3 style="margin-bottom:7px; font-family: 'Roboto Condensed', sans-serif;">Select an image:</h3>
        <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
          ${imageOptionsHTML}
        </div>
      </div>
      <div class="shape-options">
        <h3 style="margin-bottom:7px; font-family: 'Roboto Condensed', sans-serif;">Select Shape:</h3>
        <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
          ${shapesOptionsHTML}
        </div>
      </div>
      <div class="color-options">
        <h3 style="margin-bottom:7px; font-family: 'Roboto Condensed', sans-serif;">Select text and image color:</h3>
        <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
        ${colorOptionsHTML}
        </div>
      </div>
      <div class="bg-color-options">
        <h3 style="margin-bottom:7px; font-family: 'Roboto Condensed', sans-serif;">Select background color:</h3>
        <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
          ${bgColorOptionsHtml}
        </div>
      </div>
      <div class="quantity-section">
        <h3 style="margin-bottom:7px; font-family: 'Roboto Condensed', sans-serif;">Enter Quantity</h3>
        <div class='entry-quantity-btns'>
        <div class="quantity-container">
        <button class="quantity-btn" onclick="decrement()">-</button>
        <input type="number" id="quantity" class="quantity-input" value="1" min="1">
        <button class="quantity-btn" onclick="increment()">+</button>
        </div>
        <button class='add-cart-btn' id='add-to-cart-btn'>Add To Cart</button>
        </div>
      </div>`;
  }
  // Add the quantity control functions to the global scope
  window.increment = function () {
    let input = document.getElementById("quantity");
    input.value = parseInt(input.value) + 1;
  };

  window.decrement = function () {
    let input = document.getElementById("quantity");
    if (parseInt(input.value) > 1) {
      input.value = parseInt(input.value) - 1;
    }
  };

  // Function to set up quantity input validation
  function setupQuantityValidation() {
    const quantityInput = document.getElementById("quantity");
    if (quantityInput) {
      quantityInput.addEventListener("input", function () {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) {
          this.value = 1;
        }
      });
    }
  }

  // Update image preview

  function updateImagePreview(container, imageUrl, selectedElement) {
    const previewImage = container.querySelector("#preview-image");
    if (imageUrl) {
      previewImage.src = imageUrl;
      previewImage.classList.remove("hidden");

      // Reapply current color if exists
      const currentColorSwatch = container.querySelector(
        ".color-swatch.selected",
      );
      if (currentColorSwatch) {
        const colorCode = currentColorSwatch.dataset.color;
        updateTextColor(container, colorCode, currentColorSwatch);
      }
    }

    // Update checkmarks for images
    container
      .querySelectorAll(".image-option .checkmark")
      .forEach((checkmark) => {
        checkmark.style.display = "none";
      });

    if (selectedElement) {
      const checkmark = selectedElement
        .closest(".image-option")
        .querySelector(".checkmark");
      if (checkmark) {
        checkmark.style.display = "flex";
      }
    }
  }

  // Update shape preview function to handle SVG conversion
  async function updateShapePreview(container, shapeUrl, selectedElement) {
    const shapeContainer = container.querySelector("#shape-container");
    if (shapeUrl) {
      try {
        const signedResponse = await fetch(
          `https://product-configurator-shopify-app.onrender.com/api/sign-s3-url?url=${shapeUrl}`,
        );

        if (!signedResponse.ok) {
          throw new Error(`HTTP error! status: ${signedResponse.status}`);
        }

        const data = await signedResponse.json();
        // Fetch the SVG content
        const response = await fetch(data.signedUrl, {
          mode: "cors",
          method: "GET",
        });
        const svgText = await response.text();

        // Create a temporary div to parse SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgElement = svgDoc.querySelector("svg");

        if (svgElement) {
          // Set viewBox if it doesn't exist
          if (!svgElement.getAttribute("viewBox")) {
            const width = svgElement.getAttribute("width") || "600";
            const height = svgElement.getAttribute("height") || "600";
            svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
          }

          // Set width and height to 100%
          svgElement.setAttribute("width", "100%");
          svgElement.setAttribute("height", "100%");
          svgElement.style.position = "absolute";
          svgElement.style.top = "0";
          svgElement.style.left = "0";

          // Remove any existing SVG
          const existingSvg = shapeContainer.querySelector("svg");
          if (existingSvg) {
            existingSvg.remove();
          }

          // Insert the new SVG as the first child
          shapeContainer.insertBefore(svgElement, shapeContainer.firstChild);

          // Apply current color if exists
          const currentColor = container.querySelector(
            ".bgColor-swatch.selected",
          )?.dataset.color;
          if (currentColor) {
            updateShapeColor(container, currentColor);
          }
        }
      } catch (error) {
        console.error("Error loading SVG:", error);
      }
    }

    // Update checkmarks for shapes
    container
      .querySelectorAll(".shape-option .checkmark")
      .forEach((checkmark) => {
        checkmark.style.display = "none";
      });

    if (selectedElement) {
      const checkmark = selectedElement
        .closest(".shape-option")
        .querySelector(".checkmark");
      if (checkmark) {
        checkmark.style.display = "flex";
      }
    }
  }

  // New function to update SVG color
  function updateShapeColor(container, colorCode) {
    const svg = container.querySelector("svg");
    if (svg) {
      const shapeElements = svg.querySelectorAll(
        "path, rect, circle, ellipse, polygon, polyline",
      );
      shapeElements.forEach((element) => {
        // Force update of fill and stroke, even if inline styles exist
        element.style.fill = colorCode; // Use style.fill instead of setAttribute to override inline styles
        element.style.stroke = "none"; // Remove stroke
      });
    }
  }
  // Update text color

  function updateTextColor(container, colorCode, selectedElement) {
    // Update text color
    const textOverlay = container.querySelector("#overlay-text-display");
    const brailleOverlay = container.querySelector("#braille-text-display");
    if (textOverlay && colorCode) {
      textOverlay.style.color = colorCode;
    }
    if (brailleOverlay && colorCode) {
      brailleOverlay.style.color = colorCode;
    }

    // Update overlay image color
    const previewImage = container.querySelector("#preview-image");
    if (previewImage && colorCode) {
      const filterId = "colorize-filter";
      let filter = document.querySelector(`#${filterId}`);

      if (!filter) {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svg.style.width = "0";
        svg.style.height = "0";
        svg.style.position = "absolute";
        svg.innerHTML = `
                <defs>
                  <filter id="${filterId}">
                    <feColorMatrix type="matrix" values="
                      -1 0 0 0 1
                      0 -1 0 0 1
                      0 0 -1 0 1
                      0 0 0 1 0" result="inverted"/>
                    <feFlood flood-color="${colorCode}" result="color"/>
                    <feComposite operator="in" in="color" in2="inverted" result="colored-image"/>
                    <feComposite operator="over" in="colored-image" in2="SourceGraphic"/>
                  </filter>
                </defs>
            `;
        document.body.appendChild(svg);
      } else {
        // Update existing filter
        const feFlood = filter.querySelector("feFlood");
        if (feFlood) {
          feFlood.setAttribute("flood-color", colorCode);
        }
      }

      // Apply the filter to the preview image
      previewImage.style.filter = `url(#${filterId})`;
    }

    // Update checkmarks for text colors
    container
      .querySelectorAll(".color-options .checkmark")
      .forEach((checkmark) => {
        checkmark.style.display = "none";
      });

    if (selectedElement) {
      const checkmark = selectedElement
        .closest(".color-option")
        .querySelector(".checkmark");
      if (checkmark) {
        checkmark.style.display = "flex";
      }

      // Update selected state
      container.querySelectorAll(".color-swatch").forEach((swatch) => {
        swatch.classList.remove("selected");
      });
      selectedElement.classList.add("selected");
    }
  }

  // Modified background color update function
  function updateBackgroundColor(container, colorCode, selectedElement) {
    // Update the SVG color
    updateShapeColor(container, colorCode);
    // Update checkmarks for background colors
    container
      .querySelectorAll(".bg-color-options .checkmark")
      .forEach((checkmark) => {
        checkmark.style.display = "none";
      });

    if (selectedElement) {
      const checkmark = selectedElement
        .closest(".bg-color-option")
        .querySelector(".checkmark");
      if (checkmark) {
        checkmark.style.display = "flex";
      }

      // Update selected state
      container.querySelectorAll(".bgColor-swatch").forEach((swatch) => {
        swatch.classList.remove("selected");
      });
      selectedElement.classList.add("selected");
    }
  }

  async function initializeCustomizer(
    container,
    productId,
    productPrice,
    productDescription,
  ) {
    try {
      showLoader(); // Show loader when fetching data

      // Set initial HTML
      container.innerHTML = initialHTML;
      setupQuantityValidation();

      // Initialize text overlay controls
      updateTextOverlay(container);

      // Set product ID
      const productIdElement = container.querySelector(".product-id");
      if (productIdElement) {
        productIdElement.textContent = productId;
      }
      // Store base price as a number, removing currency symbol if present
      const cleanPrice = productPrice
        .replace(/[^\d.]/g, "")
        // If there are multiple dots, keep only the last one
        .replace(/\.(?=.*\.)/g, "");
      const basePrice = parseFloat(cleanPrice);
      // Function to update total price display
      function updateTotalPrice(imagePrice, shapePrice) {
        const totalPrice = basePrice + imagePrice + shapePrice;
        const productPriceElement = container.querySelector(".product-price");
        if (productPriceElement) {
          productPriceElement.innerHTML = `Base Price: $${basePrice.toFixed(2)}<br>
                                         Image Price: $${imagePrice.toFixed(2)}<br>
                                         Shape Price: $${shapePrice.toFixed(2)}<br>
                                         <strong>Total: $${totalPrice.toFixed(2)}</strong>`;
        }
      }

      const productDescriptionElement = container.querySelector(
        ".product-description",
      );
      if (productDescriptionElement) {
        productDescriptionElement.innerHTML = productDescription;
      }

      // Fetch product configurations
      const response = await fetch(
        `https://product-configurator-shopify-app.onrender.com/api/productConfigurationList?product_id=${productId}`,
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

      const { images, colors, backgroundColors, shapesSizes } = data.data;
      const allImages = images.map((img) => img.adaSignageImages || []).flat();
      const allColors = colors.map((clr) => clr.availableColors || []).flat();
      const allBackgroundColors = backgroundColors
        .map((bgClr) => bgClr.availableColors || [])
        .flat();
      const allShapesSizes = shapesSizes
        .map((shape) => shape.availableShapesSizes || [])
        .flat();
      const shapesPrice = shapesSizes
        .map((shapeprice) => shapeprice.additional_price)
        .flat();
      const imagePrice = images.map((image) => image.additional_price).flat();

      // Track current selections and their prices
      let currentImagePrice = 0;
      let currentShapePrice = 0;

      // Set default values and initial prices from first items
      if (allImages.length > 0) {
        updateImagePreview(container, allImages[0].image_url);
        currentImagePrice = parseFloat(imagePrice) || 0;
      }
      if (allShapesSizes.length > 0) {
        updateShapePreview(container, allShapesSizes[0].image);
        currentShapePrice = parseFloat(shapesPrice) || 0;
      }
      if (allColors.length > 0) {
        updateTextColor(container, allColors[0].hex_value);
      }
      if (allBackgroundColors.length > 0) {
        const element = container.querySelectorAll(".bgColor-swatch");
        updateBackgroundColor(container, "#32a852");
      }

      // Update initial total price
      updateTotalPrice(currentImagePrice, currentShapePrice);

      async function generateCustomImage(options) {
        try {
          const {
            shapeId,
            imageId,
            colorId,
            bgColorId,
            text,
            format = "png",
          } = options;

          // Make a request to the updated overlay API that now handles S3 upload automatically
          const response = await fetch(
            "https://product-configurator-shopify-app.onrender.com/api/overlay",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                shapeId,
                imageId,
                colorId,
                bgColorId,
                text,
                format,
              }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate image");
          }

          // The API now returns JSON with the S3 URL directly
          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || "Failed to process image");
          }

          // Return the S3 URL from the response
          return result.url;
        } catch (error) {
          console.error("Error generating custom image:", error);
          throw error;
        }
      }

      // Generate customization HTML with prices included in the data attributes
      const customizationHtml = generateCustomizationHTML(
        allImages,
        allColors,
        allBackgroundColors,
        allShapesSizes,
      );
      customizationOptionsElement.innerHTML = customizationHtml;
      const addToCartButton = container.querySelector("#add-to-cart-btn");
      if (addToCartButton) {
        addToCartButton.addEventListener("click", async () => {
          try {
            showLoader(); 
            addToCartButton.disabled = true;
            addToCartButton.textContent = "Generating image...";

            const quantityInput = container.querySelector("#quantity");
            const quantity = parseInt(quantityInput.value) || 1;
            const customText = container.querySelector("#overlay-text").value;

            // Extract IDs
            const imageId =
              parseInt(selectedOptions?.imageId) || allImages[0].id;
            const shapeId =
              parseInt(selectedOptions?.shapeId) || allShapesSizes[0].id;
            const colorId =
              parseInt(selectedOptions?.colorId) || allColors[0].id;
            const bgColorId =
              parseInt(selectedOptions?.bgColorId) || allBackgroundColors[0].id;

            // Find the full objects from arrays to get names
            const selectedImageObj = allImages.find(
              (img) => img.id === imageId,
            );
            const selectedShapeObj = allShapesSizes.find(
              (shape) => shape.id === shapeId,
            );
            const selectedColorObj = allColors.find(
              (color) => color.id === colorId,
            );
            const selectedBgColorObj = allBackgroundColors.find(
              (color) => color.id === bgColorId,
            );

            // Generate the custom image and get S3 URL
            const customImageUrl = await generateCustomImage({
              shapeId: shapeId,
              imageId: imageId,
              colorId: colorId,
              bgColorId: bgColorId,
              text: customText,
              format: "png",
            });

            const productHandle =
              window.location.pathname.split("/products/")[1]?.split("?")[0] ||
              container.getAttribute("data-product-handle");

            if (!productHandle) {
              alert("Could not add to cart: Product information missing");
              return;
            }

            // Prepare cart data with names instead of URLs/hex values
            const formData = {
              items: [
                {
                  id: productHandle,
                  quantity: quantity,
                  sections: ["cart-drawer", "cart-icon-bubble"],
                  properties: {
                    "Custom Text": customText,
                    "Selected Image":
                      selectedImageObj?.image_name || "Default Image",
                    "Selected Shape":
                      selectedShapeObj?.shape_name || "Default Shape",
                    "Text Color":
                      selectedColorObj?.color_name || "Default Color",
                    "Background Color":
                      selectedBgColorObj?.color_name || "Default Background",
                    _custom_image: customImageUrl,
                    "Final Image": customImageUrl,
                  },
                },
              ],
            };

            // Call addToCart with formData
            addToCart(formData);
          } catch (error) {
            console.error("Error generating custom image:", error);
            alert("Failed to generate custom image. Please try again.");
          } finally {
            addToCartButton.disabled = false;
            addToCartButton.textContent = "Add To Cart";
            hideLoader();
          }
        });
      }

      // Update addToCart function to handle line item properties
      function addToCart(formData) {
        let variant;
        // First, get the product variant ID
        fetch(`/products/${formData.items[0].id}.js`)
          .then((response) => response.json())
          .then((product) => {
            // Get the first available variant or the default variant
            variant = product.variants[0];
            if (!variant) {
              throw new Error("No variant found for this product");
            }

            // Create the cart data with the variant ID
            const cartData = {
              sections: ["header", "cart-drawer"],
              items: [
                {
                  id: variant.id, // Use variant ID instead of product ID
                  quantity: formData.items[0].quantity,
                  properties: formData.items[0].properties,
                  sections: ["header", "cart-drawer"],
                },
              ],
            };

            // Add to cart with the variant ID
            return fetch("/cart/add.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(cartData),
            });
          })
          .then(async (response) => {
            if (!response.ok) {
              return response.json().then((error) => Promise.reject(error));
            }

            const data = await response.json();
            if (data.sections && data.sections.header) {
              // Create a temporary container to parse the new header HTML
              const tempContainer = document.createElement("div");
              tempContainer.innerHTML = data.sections.header;

              // Find the header element in the current page
              const currentHeader =
                document.querySelector("header") ||
                document.querySelector(".header") ||
                document.querySelector("#header") ||
                document.querySelector('[data-section-type="header"]');

              if (currentHeader) {
                // 1. Save any custom elements that need to be preserved
                const customImages = Array.from(
                  currentHeader.querySelectorAll('img[data-custom="true"]'),
                );
                const customElements = Array.from(
                  currentHeader.querySelectorAll('[data-preserve="true"]'),
                );

                // 2. Get the new header element from the parsed container
                const newHeader =
                  tempContainer.querySelector("header") ||
                  tempContainer.querySelector(".header") ||
                  tempContainer.querySelector("#header") ||
                  tempContainer.firstElementChild;

                if (newHeader) {
                  // 3. Replace the header content
                  currentHeader.innerHTML = newHeader.innerHTML;

                  // 4. Re-insert preserved elements to their original positions
                  customImages.forEach((img) => {
                    const position = img.getAttribute("data-position");
                    if (position) {
                      const placeholder = currentHeader.querySelector(
                        `[data-position="${position}"]`,
                      );
                      if (placeholder) {
                        placeholder.parentNode.replaceChild(img, placeholder);
                      }
                    }
                  });

                  customElements.forEach((el) => {
                    const position = el.getAttribute("data-position");
                    if (position) {
                      const placeholder = currentHeader.querySelector(
                        `[data-position="${position}"]`,
                      );
                      if (placeholder) {
                        placeholder.parentNode.replaceChild(el, placeholder);
                      }
                    }
                  });

                  // 5. Re-initialize any scripts/functionality that needs to run after DOM update
                  if (typeof window.reinitHeader === "function") {
                    window.reinitHeader();
                  }

                  // 6. Re-attach event listeners
                  attachHeaderEventListeners();
                }
              }
            }

            // Helper function to re-attach event listeners to header elements
            function attachHeaderEventListeners() {
              // Example: Re-attach click events to cart toggle buttons
              const cartToggle = document.querySelector(".cart-toggle");
              if (cartToggle) {
                cartToggle.addEventListener("click", function (e) {
                  e.preventDefault();
                  // Your cart toggle logic here
                });
              }

              // Add other event listeners as needed
            }
          })
          .then(() => {
            // After successful add, update the cart using the update API
            const cartUpdateData = {
              updates: {
                [variant.id]: formData.items[0].quantity,
              },
            };
            return fetch("/cart/update.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(cartUpdateData),
            });
          })
          .then((response) => response.json())
          .then((cart) => {
            // Store cart data in window object for checkout
            window.currentCart = cart;

            // If you're using a cart drawer, trigger its update
            if (
              typeof window.Shopify !== "undefined" &&
              window.Shopify.updateCartDrawer
            ) {
              window.Shopify.updateCartDrawer();
            }

            // Show success message
            const message = document.createElement("div");
            message.classList.add(
              "cart-notification",
              "cart-notification--success",
            );
            message.textContent = "Added to cart!";
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 3000);
          })
          .catch((error) => {
            console.error("Error adding to cart:", error);

            // Show error message
            const message = document.createElement("div");
            message.classList.add(
              "cart-notification",
              "cart-notification--error",
            );
            message.textContent =
              "Failed to add item to cart. Please try again.";
            document.body.appendChild(message);
            setTimeout(() => message.remove(), 3000);
          });
      }
      // Add event listeners with price updates
      const imageOptions = container.querySelectorAll(".image-thumb");
      imageOptions.forEach((img, index) =>
        img.addEventListener("click", () => {
          const imageUrl = img.dataset.url;
          updateImagePreview(container, imageUrl, img);
          // Update image price from database value
          currentImagePrice = parseFloat(imagePrice[index]) || 0;
          updateTotalPrice(currentImagePrice, currentShapePrice);
          const imageId = img.closest(".image-option").dataset.id;
          selectedOptions.imageId = imageId;
        }),
      );

      const shapesOptions = container.querySelectorAll(".shapes-sizes");
      shapesOptions.forEach((shape, index) =>
        shape.addEventListener("click", () => {
          const shapeUrl = shape.dataset.url;
          updateShapePreview(container, shapeUrl, shape);
          // Update shape price from database value
          currentShapePrice = parseFloat(shapesPrice[index]) || 0;
          updateTotalPrice(currentImagePrice, currentShapePrice);
          const shapeId = shape.closest(".shape-option").dataset.id;
          selectedOptions.shapeId = shapeId;
        }),
      );

      const colorOptions = container.querySelectorAll(".color-swatch");
      colorOptions.forEach((swatch) =>
        swatch.addEventListener("click", () => {
          const colorCode = swatch.dataset.color;
          updateTextColor(container, colorCode, swatch);
          const colorId = swatch.dataset.id;
          selectedOptions.colorId = colorId;
        }),
      );

      const backgroundColorOptions =
        container.querySelectorAll(".bgColor-swatch");
      backgroundColorOptions.forEach((bgSwatch, index) => {
        if (index === 0) {
          updateBackgroundColor(container, "", bgSwatch);
        }
        return bgSwatch.addEventListener("click", () => {
          const bgColorCode = bgSwatch.dataset.color;
          updateBackgroundColor(container, bgColorCode, bgSwatch);
          const bgColorId = bgSwatch.dataset.id;
          selectedOptions.bgColorId = bgColorId;
        });
      });
      hideLoader();
    } catch (error) {
      console.error("Error initializing product customizer:", error);
      hideLoader();
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
    const productPrice = container.getAttribute("data-product-price");
    const productDescription = container.getAttribute(
      "data-product-description",
    );
    if (productId && productPrice && productDescription) {
      initializeCustomizer(
        container,
        productId,
        productPrice,
        productDescription,
      );
    } else {
      console.error("Product ID not found for customizer container");
      container.innerHTML =
        '<p class="error-message">Error: Product ID not found</p>';
    }
  });
});
