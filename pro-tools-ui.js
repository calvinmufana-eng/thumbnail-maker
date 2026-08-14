(() => {
  "use strict";

  if (window.__PRO_TOOLS_UI_LOADED__) {
    console.log("Pro Tools UI already loaded.");
    return;
  }

  window.__PRO_TOOLS_UI_LOADED__ = true;

  function start() {
    const panel =
      document.getElementById("proEditor");

    if (!panel) {
      console.error(
        "Pro Tools UI: #proEditor was not found."
      );
      return;
    }

    // Remove previous compact UI
    const old =
      document.getElementById("proToolsUI");

    if (old) old.remove();

    // ========================================
    // MAIN UI
    // ========================================

    const ui =
      document.createElement("div");

    ui.id = "proToolsUI";

    ui.innerHTML = `
      <div class="pt-title">
        ✨ Pro Editor Tools
      </div>

      <div class="pt-grid">

        <button class="pt-tool active" data-tool="move">
          🖱️ Move
        </button>

        <button class="pt-tool" data-tool="resize">
          📏 Resize
        </button>

        <button class="pt-tool" data-tool="crop">
          ✂️ Crop
        </button>

        <button class="pt-tool" data-tool="green">
          🟢 Green Screen
        </button>

        <button class="pt-tool" data-tool="background">
          🪄 Remove BG
        </button>

        <button class="pt-tool" data-tool="effects">
          🎨 Effects
        </button>

      </div>

      <div id="ptControls">
        <div class="pt-info">
          🖱️ <strong>Move</strong><br>
          Drag your picture to position it.
        </div>
      </div>
    `;

    panel.appendChild(ui);

    // ========================================
    // STYLES
    // ========================================

    if (!document.getElementById("ptStyles")) {

      const style =
        document.createElement("style");

      style.id = "ptStyles";

      style.textContent = `
        #proToolsUI {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #374151;
        }

        .pt-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .pt-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .pt-tool {
          width: 100%;
          margin: 0 !important;
          padding: 10px 6px !important;
          border: 0;
          border-radius: 8px;
          background: #374151 !important;
          color: white;
          font-size: 12px !important;
          font-weight: 700;
          cursor: pointer;
        }

        .pt-tool.active {
          background: #2563eb !important;
        }

        .pt-tool:hover {
          filter: brightness(1.15);
        }

        #ptControls {
          margin-top: 9px;
          padding: 10px;
          border-radius: 9px;
          background: #1f2937;
        }

        .pt-info {
          color: #d1d5db;
          font-size: 12px;
          line-height: 1.5;
        }

        .pt-control-title {
          color: white;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .pt-action {
          width: 100%;
          margin-top: 7px !important;
          padding: 9px !important;
          border: 0;
          border-radius: 8px;
          color: white;
          background: #374151;
          font-weight: 700;
          cursor: pointer;
        }

        .pt-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 7px;
        }

        .pt-slider {
          width: 100%;
          margin-top: 7px;
        }
      `;

      document.head.appendChild(style);
    }

    const controls =
      document.getElementById("ptControls");

    const buttons =
      ui.querySelectorAll(".pt-tool");

    // ========================================
    // TOOL CONTENT
    // ========================================

    const content = {

      move: `
        <div class="pt-info">
          🖱️ <strong>Move</strong><br>
          Drag your picture to position it.
        </div>
      `,

      resize: `
        <div class="pt-control-title">
          📏 Resize
        </div>

        <input
          id="ptResize"
          class="pt-slider"
          type="range"
          min="10"
          max="200"
          value="100"
        >

        <div
          style="text-align:center;margin-top:5px;"
        >
          <strong id="ptResizeValue">100%</strong>
        </div>
      `,

      crop: `
        <div class="pt-control-title">
          ✂️ Crop
        </div>

        <div class="pt-info">
          Select the photo first, then start cropping.
        </div>

        <button
          class="pt-action"
          id="ptStartCrop"
        >
          ✂️ Start Crop
        </button>
      `,

      green: `
        <div class="pt-control-title">
          🟢 Green Screen
        </div>

        <div class="pt-info">
          Remove green from your selected picture.
        </div>

        <button
          class="pt-action"
          id="ptGreenStart"
        >
          🟢 Start Green Screen
        </button>
      `,

      background: `
        <div class="pt-control-title">
          🪄 Remove Background
        </div>

        <div class="pt-info">
          Remove the background from the selected picture.
        </div>

        <button
          class="pt-action"
          id="ptRemoveBG"
        >
          🪄 Remove Background
        </button>
      `,

      effects: `
        <div class="pt-control-title">
          🎨 Effects
        </div>

        <div class="pt-info">
          Adjust the appearance of your picture.
        </div>

        <button
          class="pt-action"
          id="ptEffects"
        >
          🎨 Open Effects
        </button>
      `
    };

    // ========================================
    // TOOL SWITCHING
    // ========================================

    buttons.forEach(button => {

      button.addEventListener(
        "click",
        () => {

          buttons.forEach(
            b => b.classList.remove("active")
          );

          button.classList.add("active");

          const tool =
            button.dataset.tool;

          controls.innerHTML =
            content[tool];

          connect(tool);
        }
      );

    });

    // ========================================
    // CONNECT CONTROLS
    // ========================================

    function connect(tool) {

      if (tool === "resize") {

        const slider =
          document.getElementById("ptResize");

        const value =
          document.getElementById(
            "ptResizeValue"
          );

        slider.addEventListener(
          "input",
          () => {

            value.textContent =
              `${slider.value}%`;

            const editor =
              window.ProEditor;

            if (!editor) return;

            const layer =
              editor.getSelected();

            if (!layer) return;

            const scale =
              Number(slider.value) / 100;

            layer.scaleX = scale;
            layer.scaleY = scale;

            editor.render();
          }
        );
      }

      if (tool === "crop") {

        document
          .getElementById("ptStartCrop")
          ?.addEventListener(
            "click",
            () => {

              console.log(
                "Crop tool activated."
              );

              alert(
                "Crop mode activated."
              );
            }
          );
      }

      if (tool === "green") {

        document
          .getElementById("ptGreenStart")
          ?.addEventListener(
            "click",
            () => {

              console.log(
                "Green Screen tool activated."
              );

              alert(
                "Green Screen tool activated."
              );
            }
          );
      }

      if (tool === "background") {

        document
          .getElementById("ptRemoveBG")
          ?.addEventListener(
            "click",
            () => {

              console.log(
                "Background removal activated."
              );

              alert(
                "Background removal will be connected next."
              );
            }
          );
      }

      if (tool === "effects") {

        document
          .getElementById("ptEffects")
          ?.addEventListener(
            "click",
            () => {

              console.log(
                "Effects tool activated."
              );

              alert(
                "Effects controls will be connected next."
              );
            }
          );
      }
    }

    console.log(
      "✨ Pro Tools UI successfully created."
    );
  }

  // Wait for the existing Pro Editor
  function waitForEditor() {

    if (
      document.getElementById("proEditor")
    ) {
      start();
      return;
    }

    setTimeout(
      waitForEditor,
      100
    );
  }

  waitForEditor();

})();
