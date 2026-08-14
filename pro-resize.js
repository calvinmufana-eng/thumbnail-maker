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

  const section = document.createElement("div");

  section.className = "pro-resize-section";

  section.innerHTML = `
    <h3>📏 Transform</h3>

    <button id="proMoveOnly">
      🖱️ Move Only: ON
    </button>

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
      <button id="proSizeUp">➕ Bigger</button>
      <button id="proSizeDown">➖ Smaller</button>
      <button id="proCrop">✂️ Crop</button>
    </div>

    <p id="proResizeStatus">
      Move Only is ON.
    </p>
  `;

  panel.appendChild(section);

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
      margin-top: 12px;
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

    #proMoveOnly {
      margin-top: 0;
      background: #059669;
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

  const sizeSlider =
    document.getElementById("proSize");

  const sizeValue =
    document.getElementById("proSizeValue");

  const moveButton =
    document.getElementById("proMoveOnly");

  const status =
    document.getElementById("proResizeStatus");

  let moveOnly = true;

  function updateSize(value) {
    const layer = editor.getSelected();

    if (!layer) {
      status.textContent =
        "Select a photo first.";
      return;
    }

    if (moveOnly) {
      status.textContent =
        "Move Only is ON — use the Size slider to resize.";
      return;
    }

    const scale =
      Number(value) / 100;

    layer.scaleX = scale;
    layer.scaleY = scale;

    sizeValue.textContent =
      `${value}%`;

    status.textContent =
      `Photo size: ${value}%`;

    editor.render();
  }

  moveButton.addEventListener(
    "click",
    () => {

      moveOnly = !moveOnly;

      if (moveOnly) {

        moveButton.textContent =
          "🖱️ Move Only: ON";

        moveButton.style.background =
          "#059669";

        status.textContent =
          "Move Only is ON.";

      } else {

        moveButton.textContent =
          "📏 Resize Mode: ON";

        moveButton.style.background =
          "#2563eb";

        status.textContent =
          "Resize Mode is ON.";

      }
    }
  );

  sizeSlider.addEventListener(
    "input",
    () => {
      updateSize(sizeSlider.value);
    }
  );

  document
    .getElementById("proSizeUp")
    .addEventListener(
      "click",
      () => {

        if (moveOnly) {
          status.textContent =
            "Turn Resize Mode ON first.";
          return;
        }

        let value =
          Number(sizeSlider.value) + 10;

        value =
          Math.min(value, 200);

        sizeSlider.value = value;

        updateSize(value);
      }
    );

  document
    .getElementById("proSizeDown")
    .addEventListener(
      "click",
      () => {

        if (moveOnly) {
          status.textContent =
            "Turn Resize Mode ON first.";
          return;
        }

        let value =
          Number(sizeSlider.value) - 10;

        value =
          Math.max(value, 10);

        sizeSlider.value = value;

        updateSize(value);
      }
    );

  document
    .getElementById("proCrop")
    .addEventListener(
      "click",
      () => {

        const layer = editor.getSelected();

        if (!layer) {
          status.textContent =
            "Select a photo first.";
          return;
        }

        status.textContent =
          "Crop tool coming next.";
      }
    );

  console.log(
    "📏 Move/Resize controls loaded."
  );

})();

  
