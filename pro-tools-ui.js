(() => {
  "use strict";

  // Prevent duplicates
  if (window.__COMPACT_PRO_TOOLS__) {
    console.log("Compact Pro Tools already running.");
    return;
  }

  window.__COMPACT_PRO_TOOLS__ = true;

  function createTools() {
    // Don't create it twice
    if (document.getElementById("compactProTools")) {
      return;
    }

    // ==========================================
    // PANEL
    // ==========================================

    const panel = document.createElement("section");

    panel.id = "compactProTools";

    panel.innerHTML = `
      <div class="cpt-header">
        <div>
          <strong>✨ Pro Tools</strong>
          <small>Choose a tool</small>
        </div>
      </div>

      <div class="cpt-grid">

        <button class="cpt-button active" data-tool="move">
          🖱️
          <span>Move</span>
        </button>

        <button class="cpt-button" data-tool="resize">
          📏
          <span>Resize</span>
        </button>

        <button class="cpt-button" data-tool="crop">
          ✂️
          <span>Crop</span>
        </button>

        <button class="cpt-button" data-tool="green">
          🟢
          <span>Green Screen</span>
        </button>

        <button class="cpt-button" data-tool="background">
          🪄
          <span>Remove BG</span>
        </button>

        <button class="cpt-button" data-tool="effects">
          🎨
          <span>Effects</span>
        </button>

      </div>

      <div id="cptControls">
        <div class="cpt-message">
          🖱️ <b>Move</b><br>
          Move your picture around the canvas.
        </div>
      </div>
    `;

    // ==========================================
    // CSS
    // ==========================================

    const style = document.createElement("style");

    style.id = "compactProToolsStyles";

    style.textContent = `
      #compactProTools {
        width: 100%;
        max-width: 420px;
        margin: 16px auto;
        padding: 14px;
        border-radius: 14px;
        background: #171a21;
        border: 1px solid #292e38;
        color: white;
        font-family: Arial, Helvetica, sans-serif;
        box-sizing: border-box;
      }

      .cpt-header {
        margin-bottom: 12px;
      }

      .cpt-header strong {
        display: block;
        font-size: 17px;
      }

      .cpt-header small {
        display: block;
        margin-top: 3px;
        color: #9ca3af;
        font-size: 12px;
      }

      .cpt-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 7px;
      }

      .cpt-button {
        min-height: 62px;
        margin: 0 !important;
        padding: 7px 4px !important;
        border: 1px solid #374151 !important;
        border-radius: 10px !important;
        background: #252a33 !important;
        color: white !important;
        cursor: pointer;
        font-weight: 700;
        font-size: 11px !important;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .cpt-button:first-line {
        font-size: 20px;
      }

      .cpt-button.active {
        background: #2563eb !important;
        border-color: #60a5fa !important;
      }

      .cpt-button:hover {
        filter: brightness(1.15);
      }

      #cptControls {
        margin-top: 9px;
        padding: 11px;
        border-radius: 10px;
        background: #20242c;
      }

      .cpt-message {
        color: #d1d5db;
        font-size: 12px;
        line-height: 1.5;
      }

      .cpt-title {
        color: white;
        font-weight: 800;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .cpt-action {
        width: 100%;
        margin-top: 8px !important;
        padding: 10px !important;
        border: 0 !important;
        border-radius: 8px !important;
        background: #2563eb !important;
        color: white !important;
        font-weight: 700;
        cursor: pointer;
      }

      .cpt-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
      }

      .cpt-slider {
        width: 100%;
        margin-top: 8px;
      }

      .cpt-percent {
        display: block;
        text-align: center;
        margin-top: 5px;
        font-weight: 700;
      }

      @media (max-width: 420px) {
        #compactProTools {
          margin: 10px 0;
          border-radius: 10px;
        }

        .cpt-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    document.head.appendChild(style);

    // ==========================================
    // PUT PANEL ON PAGE
    // ==========================================

    /*
      Try to place it near the existing editor.
      If the editor can't be found, put it at
      the bottom of the page so it ALWAYS appears.
    */

    const editor =
      document.getElementById("proEditor");

    if (editor) {
      editor.appendChild(panel);
    } else {
      const canvas =
        document.getElementById("thumbnailCanvas");

      if (canvas && canvas.parentElement) {
        canvas.parentElement.parentElement.appendChild(panel);
      } else {
        document.body.appendChild(panel);
      }
    }

    // ==========================================
    // TOOL CONTROLS
    // ==========================================

    const controls =
      document.getElementById("cptControls");

    const buttons =
      panel.querySelectorAll(".cpt-button");

    function showTool(tool) {

      if (tool === "move") {
        controls.innerHTML = `
          <div class="cpt-message">
            🖱️ <b>Move</b><br>
            Drag your picture to position it.
          </div>
        `;
      }

      if (tool === "resize") {
        controls.innerHTML = `
          <div class="cpt-title">
            📏 Resize
          </div>

          <input
            id="cptResizeSlider"
            class="cpt-slider"
            type="range"
            min="10"
            max="200"
            value="100"
          >

          <span
            id="cptResizeValue"
            class="cpt-percent"
          >
            100%
          </span>

          <div class="cpt-message">
            Use this control when you want to
            deliberately change the picture size.
          </div>
        `;

        const slider =
          document.getElementById(
            "cptResizeSlider"
          );

        const value =
          document.getElementById(
            "cptResizeValue"
          );

        slider.addEventListener(
          "input",
          () => {
            value.textContent =
              slider.value + "%";

            const api =
              window.ProEditor;

            if (
              api &&
              typeof api.getSelected === "function"
            ) {
              const layer =
                api.getSelected();

              if (layer) {
                const scale =
                  Number(slider.value) / 100;

                layer.scaleX = scale;
                layer.scaleY = scale;

                if (
                  typeof api.render === "function"
                ) {
                  api.render();
                }
              }
            }
          }
        );
      }

      if (tool === "crop") {
        controls.innerHTML = `
          <div class="cpt-title">
            ✂️ Crop
          </div>

          <div class="cpt-message">
            Crop the selected picture.
          </div>

          <button
            class="cpt-action"
            id="cptStartCrop"
          >
            ✂️ Start Crop
          </button>
        `;
      }

      if (tool === "green") {
        controls.innerHTML = `
          <div class="cpt-title">
            🟢 Green Screen
          </div>

          <div class="cpt-message">
            Remove green from a picture and
            keep the subject.
          </div>

          <button
            class="cpt-action"
            id="cptGreenStart"
          >
            🟢 Start Green Screen
          </button>
        `;
      }

      if (tool === "background") {
        controls.innerHTML = `
          <div class="cpt-title">
            🪄 Remove Background
          </div>

          <div class="cpt-message">
            Automatically remove the background
            from the selected picture.
          </div>

          <button
            class="cpt-action"
            id="cptBackgroundStart"
          >
            🪄 Remove Background
          </button>
        `;
      }

      if (tool === "effects") {
        controls.innerHTML = `
          <div class="cpt-title">
            🎨 Effects
          </div>

          <div class="cpt-message">
            Adjust the look of your picture with
            filters and effects.
          </div>

          <button
            class="cpt-action"
            id="cptEffectsStart"
          >
            🎨 Open Effects
          </button>
        `;
      }
    }

    // ==========================================
    // BUTTONS
    // ==========================================

    buttons.forEach(button => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach(
            item => item.classList.remove("active")
          );

          button.classList.add("active");

          showTool(
            button.dataset.tool
          );
        }
      );

    });

    console.log(
      "✅ Compact Pro Tools created successfully."
    );
  }

  // ==========================================
  // START
  // ==========================================

  if (document.readyState === "loading") {

    document.addEventListener(
      "DOMContentLoaded",
      createTools
    );

  } else {

    createTools();

  }

})();
