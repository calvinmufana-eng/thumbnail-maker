> {
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
        font-size: 1

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
      </div
