(() => {
  "use strict";

  if (window.__PRO_TOOLS_UI_LOADED__) return;
  window.__PRO_TOOLS_UI_LOADED__ = true;

  const panel = document.getElementById("proEditor");

  if (!panel) {
    console.error("Pro Tools UI: Pro Editor panel not found.");
    return;
  }

  // Remove an older tools UI if one exists
  const oldUI = document.getElementById("proToolsUI");
  if (oldUI) oldUI.remove();

  const ui = document.createElement("div");
  ui.id = "proToolsUI";

  ui.innerHTML = `
    <div class="tools-title">
      ✨ Pro Editor
    </div>

    <div class="tools-grid">

      <button class="tool-btn active" data-tool="move">
        🖱️ Move
      </button>

      <button class="tool-btn" data-tool="resize">
        📏 Resize
      </button>

      <button class="tool-btn" data-tool="crop">
        ✂️ Crop
      </button>

      <button class="tool-btn" data-tool="green">
        🟢 Green Screen
      </button>

      <button class="tool-btn" data-tool="background">
        🪄 Remove BG
      </button>

      <button class="tool-btn" data-tool="effects">
        🎨 Effects
      </button>

    </div>

    <div
      id="selectedToolControls"
      class="selected-tool-controls"
    >
      <div class="tool-message">
        🖱️ Move Mode is active.
        <br>
        Drag your picture to position it.
      </div>
    </div>
  `;

  panel.appendChild(ui);

  // ==========================================
  // STYLES
  // ==========================================

  const style = document.createElement("style");

  style.id = "proToolsUIStyles";

  style.textContent = `
    #proToolsUI {
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #374151;
    }

    .tools-title {
      font-size: 16px;
      font-weight: 800;
      margin-bottom: 10px;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    .tool-btn {
      margin: 0 !important;
      padding: 9px 7px !important;
      font-size: 12px !important;
      background: #374151 !important;
      border-radius: 8px !important;
    }

    .tool-btn.active {
      background: #2563eb !important;
    }

    .selected-tool-controls {
      margin-top: 9px;
      padding: 10px;
      border-radius: 9px;
      background: #1f2937;
    }

    .tool-message {
      color: #cbd5e1;
      font-size: 12px;
      line-height: 1.5;
    }

    .tool-control-title {
      font-weight: 800;
      margin-bottom: 8px;
      color: white;
    }

    .tool-action {
      width: 100%;
      margin-top: 6px !important;
      padding: 9px !important;
      font-size: 12px !important;
    }

    .tool-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }

    @media (max-width: 420px) {
      .tools-grid {
        grid-template-columns: 1fr 1fr;
      }

      .tool-btn {
        font-size: 11px !important;
      }
    }
  `;

  document.head.appendChild(style);

  const controls =
    document.getElementById("selectedToolControls");

  const buttons =
    ui.querySelectorAll(".tool-btn");

  // ==========================================
  // TOOL CONTENT
  // ==========================================

  const toolContent = {

    move: `
      <div class="tool-message">
        <div class="tool-control-title">
          🖱️ Move
        </div>
        Drag the selected picture to position it.
      </div>
    `,

    resize: `
      <div class="tool-message">
        <div class="tool-control-title">
          📏 Resize
        </div>

        <input
          id="compactResize"
          type="range"
          min="10"
          max="200"
          value="100"
          style="width:100%;"
        >

        <div style="text-align:center;margin-top:5px;">
          <strong id="compactResizeValue">100%</strong>
        </div>
      </div>
    `,

    crop: `
      <div class="tool-message">
        <div class="tool-control-title">
          ✂️ Crop
        </div>

        <button
          class="tool-action"
          id="startCrop"
        >
          ✂️ Start Crop
        </button>
      </div>
    `,

    green: `
      <div class="tool-message">
        <div class="tool-control-title">
          🟢 Green Screen
        </div>

        Remove a green background from the selected image.
        <button
          class="tool-action"
          id="startGreen"
        >
          🟢 Start Green Screen
        </button>
      </div>
    `,

    background: `
      <div class="tool-message">
        <div class="tool-control-title">
          🪄 Remove Background
        </div>

        Automatic background removal will be added here.
        <button
          class="tool-action"
          id="removeBackground"
        >
          🪄 Remove Background
        </button>
      </div>
    `,

    effects: `
      <div class="tool-message">
        <div class="tool-control-title">
          🎨 Effects
        </div>

        Filters and image effects will appear here.
        <button
          class="tool-action"
          id="openEffects"
        >
          🎨 Open Effects
        </button>
      </div>
    `
  };

  // ==========================================
  // SWITCH TOOLS
  // ==========================================

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
          toolContent[tool] ||
          toolContent.move;

        connectTool(tool);
      }
    );

  });

  // ==========================================
  // TOOL CONNECTIONS
  // ==========================================

  function connectTool(tool) {

    if (tool === "resize") {

      const slider =
        document.getElementById(
          "compactResize"
        );

      const value =
        document.getElementById(
          "compactResizeValue"
        );

      if (!slider) return;

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

      const button =
        document.getElementById(
          "startCrop"
        );

      if (!button) return;

      button.addEventListener(
        "click",
        () => {

          alert(
            "Crop mode will be connected to the selected picture next."
          );

        }
      );
    }

    if (tool === "green") {

      const button =
        document.getElementById(
          "startGreen"
        );

      if (!button) return;

      button.addEventListener(
        "click",
        () => {

          alert(
            "Green Screen controls will be added next."
          );

        }
      );
    }

    if (tool === "background") {

      const button =
        document.getElementById(
          "removeBackground"
        );

      if (!button) return;

      button.addEventListener(
        "click",
        () => {

          alert(
            "Background removal will be connected next."
          );

        }
      );
    }

    if (tool === "effects") {

      const button =
        document.getElementById(
          "openEffects"
        );

      if (!button) return;

      button.addEventListener(
        "click",
        () => {

          alert(
            "Effects controls will be added next."
          );

        }
      );
    }
  }

  console.log(
    "✨ Compact Pro Editor UI loaded."
  );

})();
