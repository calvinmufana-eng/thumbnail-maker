(() => {
  "use strict";

  if (window.__PRO_RESIZE_LOADED__) {
    console.log("Resize tools already loaded.");
    return;
  }

  window.__PRO_RESIZE_LOADED__ = true;

  const editor = window.ProEditor;

  if (!editor) {
    console.error("Resize tools: Pro Editor is not ready.");
    return;
  }

  const panel = document.getElementById("proEditor");

  if (!panel) {
    console.error("Resize tools: Pro Editor panel not found.");
    return;
  }

  // ==========================================
  // RESIZE / CROP CONTROLS
  // ==========================================

  const section = document.createElement("div");

  section.className = "pro-resize-section";

  section.innerHTML = `
    <h3>📏 Resize & Crop</h3>

    <label>
      Size
      <input
        id="proSize"
        type="range"
        min="10"
        max="200"
        value="100"
      >
      <strong id="proSizeValue">100%</strong>
    </label>

    <div class="pro-resize-buttons">

      <button id="proSizeUp">
        ➕ Bigger
      </button>

      <button id="proSizeDown">
        ➖ Smaller
      </button>

      <button id="proCrop">
        ✂️ Crop Mode
      </button>

    </div>

    <p id="proResizeStatus">
      Select a photo first.
    </p>
  `;

  panel.appendChild(section);

  // ==========================================
  // STYLES
  // ==========================================

  const style = document.createElement("style");

  style.textContent = `
    .pro-resize-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #374151;
    }

    .pro-resize-section h3 {
      margin: 0 0 12px;
      font-size: 15px;
    }

    .pro-resize-section label {
      display: block;
      font-size: 13px;
      font-weight: 700;
    }

    .pro-resize-section input {
      width: 100%;
      margin-top: 8px;
    }

    .pro-resize-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }

    .pro-resize-buttons button {
      margin-top: 0;
      background: #374151;
      font-size: 12px;
    }

    .pro-resize-buttons button:hover {
      background: #4b5563;
    }

    #proCrop {
      grid-column: 1 / -1;
      background: #7c3aed;
    }

    #proResizeStatus {
      font-size: 12px;
      color: #9ca3af;
      margin-top: 10px;
    }
  `;

  document.head.appendChild(style);

  // ==========================================
  // ELEMENTS
  // ==========================================

  const sizeSlider =
    document.getElementById("proSize");

  const sizeValue =
    document.getElementById("proSizeValue");

  const status =
    document.getElementById("proResizeStatus");

  // ==========================================
  // UPDATE SIZE
  // ==========================================

  function updateSize(value) {

    const layer =
      editor.getSelected();

    if (!layer) {

      status.textContent =
        "Select a photo first.";

      return;
    }

    const scale =
      Number(value) / 100;

    layer.scaleX =
      scale >= 0 ? scale : 1;

    layer.scaleY =
      scale >= 0 ? scale : 1;

    sizeValue.textContent =
      `${value}%`;

    status.textContent =
      `Photo size: ${value}%`;

    editor.render();
  }

  // ==========================================
  // SLIDER
  // ==========================================

  sizeSlider.addEventListener(
    "input",
    () => {

      updateSize(
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

        const layer =
          editor.getSelected();

        if (!layer) {
          status.textContent =
            "Select a photo first.";
          return;
        }

        let value =
          Number(sizeSlider.value) + 10;

        value =
          Math.min(value, 200);

        sizeSlider.value =
          value;

        updateSize(value);
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

        const layer =
          editor.getSelected();

        if (!layer) {
          status.textContent =
            "Select a photo first.";
          return;
        }

        let value =
          Number(sizeSlider.value) - 10;

        value =
          Math.max(value, 10);

        sizeSlider.value =
          value;

        updateSize(value);
      }
    );

  // ==========================================
  // CROP MODE
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
          "Crop mode is ready for the next editing upgrade.";

      }
    );

  console.log(
    "📏 Resize controls loaded."
  );

})();
