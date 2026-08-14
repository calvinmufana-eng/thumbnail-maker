(() => {
  "use strict";

  // Prevent duplicate loading
  if (window.__PRO_RESIZE_LOADED__) return;
  window.__PRO_RESIZE_LOADED__ = true;

  const editor = window.ProEditor;

  if (!editor) {
    console.error("Pro Editor is not ready.");
    return;
  }

  const panel = document.getElementById("proEditor");

  if (!panel) {
    console.error("Pro Editor panel was not found.");
    return;
  }

  // Remove an older Transform section if one exists
  const oldSection =
    panel.querySelector(".pro-resize-section");

  if (oldSection) {
    oldSection.remove();
  }

  // ==========================================
  // TRANSFORM SECTION
  // ==========================================

  const section =
    document.createElement("div");

  section.className =
    "pro-resize-section";

  section.innerHTML = `
    <h3>📐 Transform</h3>

    <button
      id="proMoveOnly"
      class="transform-mode active"
    >
      🖱️ Move Only
    </button>

    <button
      id="proResizeMode"
      class="transform-mode"
    >
      📏 Resize Mode
    </button>

    <label class="transform-size">
      Size:
      <strong id="proSizeValue">100%</strong>

      <input
        id="proSize"
        type="range"
        min="10"
        max="200"
        value="100"
      >
    </label>

    <div class="transform-buttons">
      <button id="proSizeUp">
        ➕ Bigger
      </button>

      <button id="proSizeDown">
        ➖ Smaller
      </button>

      <button id="proCrop">
        ✂️ Crop
      </button>
    </div>

    <div
      id="proResizeStatus"
      class="transform-status"
    >
      Move Only is active. Dragging the photo
      will only move it.
    </div>
  `;

  panel.appendChild(section);

  // ==========================================
  // STYLES
  // ==========================================

  const style =
    document.createElement("style");

  style.id =
    "proResizeStyles";

  style.textContent = `
    .pro-resize-section {
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid #374151;
    }

    .pro-resize-section h3 {
      margin: 0 0 12px;
      font-size: 16px;
    }

    .transform-mode {
      width: 100%;
      margin-top: 7px;
      background: #374151;
    }

    .transform-mode.active {
      background: #059669;
    }

    .transform-size {
      display: block;
      margin-top: 15px;
      font-size: 13px;
      font-weight: 700;
    }

    .transform-size input {
      display: block;
      width: 100%;
      margin-top: 8px;
    }

    .transform-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }

    .transform-buttons button {
      margin-top: 0;
      background: #374151;
      font-size: 12px;
    }

    #proCrop {
      grid-column: 1 / -1;
      background: #7c3aed;
    }

    .transform-status {
      margin-top: 10px;
      padding: 9px;
      border-radius: 8px;
      background: #1f2937;
      color: #cbd5e1;
      font-size: 12px;
      line-height: 1.4;
    }
  `;

  if (!document.getElementById("proResizeStyles")) {
    document.head.appendChild(style);
  }

  // ==========================================
  // ELEMENTS
  // ==========================================

  const moveButton =
    document.getElementById("proMoveOnly");

  const resizeButton =
    document.getElementById("proResizeMode");

  const sizeSlider =
    document.getElementById("proSize");

  const sizeValue =
    document.getElementById("proSizeValue");

  const status =
    document.getElementById("proResizeStatus");

  let resizeMode = false;

  // ==========================================
  // MOVE ONLY
  // ==========================================

  moveButton.addEventListener(
    "click",
    () => {

      resizeMode = false;

      moveButton.classList.add("active");
      resizeButton.classList.remove("active");

      status.textContent =
        "Move Only is active. Dragging the photo will only move it.";
    }
  );

  // ==========================================
  // RESIZE MODE
  // ==========================================

  resizeButton.addEventListener(
    "click",
    () => {

      resizeMode = true;

      resizeButton.classList.add("active");
      moveButton.classList.remove("active");

      status.textContent =
        "Resize Mode is active. Use the size controls.";
    }
  );

  // ==========================================
  // SIZE SLIDER
  // ==========================================

  function resizeSelected(value) {

    const layer =
      editor.getSelected();

    if (!layer) {

      status.textContent =
        "Upload and select a photo first.";

      return;
    }

    if (!resizeMode) {

      status.textContent =
        "Move Only is active. Select Resize Mode first.";

      return;
    }

    const scale =
      Number(value) / 100;

    layer.scaleX = scale;
    layer.scaleY = scale;

    sizeValue.textContent =
      `${value}%`;

    editor.render();
  }

  sizeSlider.addEventListener(
    "input",
    () => {

      resizeSelected(
        sizeSlider.value
      );

    }
  );

  // ==========================================
  // BIGGER
  // ==========================================

  document
    .getElementById("proSizeUp")
    .addEventListener(
      "click",
      () => {

        if (!resizeMode) {

          status.textContent =
            "Select Resize Mode first.";

          return;
        }

        let value =
          Number(sizeSlider.value) + 10;

        value =
          Math.min(
            value,
            200
          );

        sizeSlider.value =
          value;

        resizeSelected(value);
      }
    );

  // ==========================================
  // SMALLER
  // ==========================================

  document
    .getElementById("proSizeDown")
    .addEventListener(
      "click",
      () => {

        if (!resizeMode) {

          status.textContent =
            "Select Resize Mode first.";

          return;
        }

        let value =
          Number(sizeSlider.value) - 10;

        value =
          Math.max(
            value,
            10
          );

        sizeSlider.value =
          value;

        resizeSelected(value);
      }
    );

  // ==========================================
  // CROP
  // ==========================================

  document
    .getElementById("proCrop")
    .addEventListener(
      "click",
      () => {

        const layer =
          editor.getSelected();

        if (!layer) {

          status.textContent =
            "Select a photo first.";

          return;
        }

        status.textContent =
          "✂️ Crop tool will be added in the next upgrade.";
      }
    );

  console.log(
    "📐 Transform controls loaded."
  );

})();
    
  
