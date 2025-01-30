document.addEventListener("DOMContentLoaded", async () => {
  // Load CSS
  const linkElem = document.createElement("link");
  linkElem.rel = "stylesheet";
  linkElem.href = "product-customizer.css";
  document.head.appendChild(linkElem);

  // Initial HTML structure with wrapper for shape and content
  const initialHTML = `
  <div class="product-customizer-container" style="display: flex; gap: 120px; margin-top:50px;">
    <div style="position: relative; width:50%;" class="product-customizer-image">
      <!-- Base shape container with background color support -->
      <div id="shape-container" style="position: relative; width: 100%; height: 100%;">
        
        <!-- Content container -->
        <div style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <img id="preview-image"
               alt="Selected image" 
               style="width: 300px; height: 250px; object-fit: contain; z-index: 1;">
          <div id="text-overlay" 
               style="position: relative; width: 100%; text-align: center; padding: 20px; margin-bottom: 20px; z-index: 2;">
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
    </div>
    <div class="product-customizer-content" style="width:50%;">
      <h2 style="margin-top: 0">Product Customizer</h2>
      <div class="product-details">
        <p>Product ID: <span class="product-id"></span></p>
        <div class="customization-options">
          <h2>Loading customization options...</h2>
        </div>
        <div class="text-customization" style="margin-top: 20px;">
          <h3 style="margin-bottom:7px;">Enter Custom Text</h3>
          <div style="margin-bottom: 15px;">
            <label for="overlay-text" style="display:block;"></label>
            <input type="text" 
                   id="overlay-text" 
                   value="BLUE RIDGE" 
                   maxlength="17" 
                   style="width: 100%; padding: 8px;text-transform: uppercase;max-width: 300px; border-radius: 8px;border: 1px solid #000;height: 40px;"
                   placeholder="ENTER TEXT (MAX 17)">
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
        <div class="image-option" style="display: inline-flex;width: 14%; gap: 40px; border:1px solid black; border-radius: 0px; margin-right: 4px; margin-bottom: 10px; position: relative;">
          <img src="${image.image_url}" data-url="${image.image_url}" alt="Image option" class="image-thumb" style="width: 100px; height: 75px; cursor: pointer; object-fit: contain; border-radius: 10px;padding:10px">
          <div class="checkmark ${index === 0 ? "active" : ""}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${index === 0 ? "flex" : "none"}; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>
        `,
      )
      .join("");

    const shapesOptionsHTML = shapesSizes
      .map(
        (shape, index) => `
        <div class="shape-option" style="gap: 40px; margin-right: 4px; margin-bottom: 10px; position: relative;">
          <img src="${shape.image}" data-url="${shape.image}" alt="Shape option" class="shapes-sizes" style="width: 100px; height: 75px; cursor: pointer; object-fit: contain; border-radius: 10px;">
          <p style="text-align:center;margin:0px">${shape.width}" * ${shape.height}"</p>
          <div class="checkmark ${index === 0 ? "active" : ""}" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: ${index === 0 ? "flex" : "none"}; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    const colorOptionsHTML = colors
      .map(
        (color) => `
        <div class="color-option" style="display: inline-block; margin-right: 10px; margin-bottom: 10px; cursor: pointer; position: relative;">
          <div class="color-swatch" style="background-color: ${color.hex_value}; width: 40px; height: 40px; border: 1px solid #ccc; display: block; border-radius: 10px;" data-color="${color.hex_value}"></div>
          <div class="checkmark" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: none; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    const bgColorOptionsHtml = bgColors
      .map(
        (bgColor) => `
        <div class="color-option" style="display: inline-block; margin-right: 10px; margin-bottom: 10px; cursor: pointer; position: relative;">
          <div class="bgColor-swatch" style="background-color: ${bgColor.hex_value}; width: 40px; height: 40px; border: 1px solid #ccc; display: block; border-radius: 10px;" data-color="${bgColor.hex_value}"></div>
          <div class="checkmark" style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background-color: #4CAF50; border-radius: 50%; display: none; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 14px;">✓</span>
          </div>
        </div>`,
      )
      .join("");

    return `
      <div class="image-options">
        <h3 style="margin-bottom:7px;">Select an image:</h3>
        <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
        ${imageOptionsHTML}
        </div>
      </div>
      <div class="shape-options">
        <h3 style="margin-bottom:7px;">Select Shape:</h3>
       <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
        ${shapesOptionsHTML}
        </div>
      </div>
      <div class="color-options">
        <h3 style="margin-bottom:7px;">Select text color:</h3>
        <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
        ${colorOptionsHTML}
        </div>
      </div>
      <div class="bg-color-options">
        <h3 style="margin-bottom:7px;">Select background color:</h3>
      <div class="image-option-widget" style="display:flex;flex-wrap:wrap;">
        ${bgColorOptionsHtml}
        </div>
        <div class="quantity-section">
                <h3 style="margin-bottom:7px;">Enter Quantity</h3>
                 <input type="number" 
                   id="quantity" 
                   value="" 
                   style="width: 100%; padding: 8px;text-transform: uppercase;max-width: 110px; border-radius: 8px;border: 1px solid #000;height: 40px;"
                   placeholder="">
        </div>
      </div>
    `;
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
        // Fetch the SVG content
        const response = await fetch(shapeUrl);
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

    // Update Braille text color
    if (brailleOverlay && colorCode) {
      brailleOverlay.style.color = colorCode;
    }

    // Update overlay image color
    const previewImage = container.querySelector("#preview-image");
    if (previewImage && colorCode) {
      // Create and apply SVG filter for colorizing the image
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
                0 0 0 0 ${hexToRgb(colorCode).r / 255}
                0 0 0 0 ${hexToRgb(colorCode).g / 255}
                0 0 0 0 ${hexToRgb(colorCode).b / 255}
                0 0 0 1 0
              "/>
            </filter>
          </defs>
        `;
        document.body.appendChild(svg);
      } else {
        // Update existing filter
        const feColorMatrix = filter.querySelector("feColorMatrix");
        if (feColorMatrix) {
          const rgb = hexToRgb(colorCode);
          feColorMatrix.setAttribute(
            "values",
            `
            0 0 0 0 ${rgb.r / 255}
            0 0 0 0 ${rgb.g / 255}
            0 0 0 0 ${rgb.b / 255}
            0 0 0 1 0
          `,
          );
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

  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Parse hex values
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
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
        .closest(".color-option")
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
        `http://localhost:35225/api/productConfigurationList?product_id=${productId}`,
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

      // Set default values
      if (allImages.length > 0) {
        updateImagePreview(container, allImages[0].image_url);
      }
      if (allShapesSizes.length > 0) {
        updateShapePreview(container, allShapesSizes[0].image);
      }

      const customizationHtml = generateCustomizationHTML(
        allImages,
        allColors,
        allBackgroundColors,
        allShapesSizes,
      );
      customizationOptionsElement.innerHTML = customizationHtml;

      // Add event listeners
      const imageOptions = container.querySelectorAll(".image-thumb");
      imageOptions.forEach((img) =>
        img.addEventListener("click", () => {
          const imageUrl = img.dataset.url;
          updateImagePreview(container, imageUrl, img);
        }),
      );

      const shapesOptions = container.querySelectorAll(".shapes-sizes");
      shapesOptions.forEach((shape) =>
        shape.addEventListener("click", () => {
          const shapeUrl = shape.dataset.url;
          updateShapePreview(container, shapeUrl, shape);
        }),
      );

      const colorOptions = container.querySelectorAll(".color-swatch");
      colorOptions.forEach((swatch) =>
        swatch.addEventListener("click", () => {
          const colorCode = swatch.dataset.color;
          updateTextColor(container, colorCode, swatch);
        }),
      );

      const backgroundColorOptions =
        container.querySelectorAll(".bgColor-swatch");
      backgroundColorOptions.forEach((bgSwatch) =>
        bgSwatch.addEventListener("click", () => {
          console.log("something");
          const bgColorCode = bgSwatch.dataset.color;
          updateBackgroundColor(container, bgColorCode, bgSwatch);
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
