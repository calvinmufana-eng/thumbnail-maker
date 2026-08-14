(() => {
  "use strict";

  if (window.__APP_UPDATES_LOADED__) return;
  window.__APP_UPDATES_LOADED__ = true;

  function startUpdatesHub() {
    if (document.getElementById("updatesHub")) return;

    const hub = document.createElement("section");
    hub.id = "updatesHub";

    hub.innerHTML = `
      <div class="updates-header">
        <div>
          <strong>🛠️ More Tools</strong>
          <small>Advanced thumbnail features</small>
        </div>

        <button id="updatesToggle">
          Tools
        </button>
      </div>

      <div id="updatesMenu" hidden>

        <button data-feature="crop">
          ✂️ Crop
        </button>

        <button data-feature="green">
          🟢 Green Screen
        </button>

        <button data-feature="remove-bg">
          🪄 Remove BG
        </button>

        <button data-feature="effects">
          🎨 Effects
        </button>

        <button data-feature="layers">
          📚 Layers
        </button>

        <button data-feature="undo">
          ↩️ Undo
        </button>

        <button data-feature="redo">
          ↪️ Redo
        </button>

        <button data-feature="export">
          📤 Export
        </button>

        <button data-feature="ai">
          ✨ AI Studio
        </button>

      </div>

      <div id="updatesStatus">
        Ready.
      </div>
    `;

    const style = document.createElement("style");

    style.id = "updatesHubStyles";

    style.textContent = `
      #updatesHub {
        width: 100%;
        max-width: 560px;
        margin: 12px auto;
        padding: 10px;
        box-sizing: border-box;
        border-radius: 14px;
        background: #171a21;
        border: 1px solid #303642;
        color: white;
        font-family: Arial, sans-serif;
      }

      .updates-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .updates-header strong {
        display: block;
        font-size: 14px;
      }

      .updates-header small {
        display: block;
        margin-top: 3px;
        color: #9ca3af;
        font-size: 11px;
      }

      #updatesToggle {
        width: auto;
        min-width: 70px;
        padding: 8px 12px;
        border: 0;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-weight: 700;
        cursor: pointer;
      }

      #updatesMenu {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-top: 10px;
      }

      #updatesMenu button {
        min-height: 38px;
        padding: 7px 4px;
        border: 0;
        border-radius: 8px;
        background: #29303b;
        color: white;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      #updatesMenu button:hover {
        filter: brightness(1.15);
      }

      #updatesStatus {
        min-height: 16px;
        margin-top: 8px;
        text-align: center;
        color: #9ca3af;
        font-size: 11px;
      }

      @media (max-width: 430px) {
        #updatesMenu {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    document.head.appendChild(style);

    const editor =
      document.getElementById("proEditor");

    if (editor) {
      editor.appendChild(hub);
    } else {
      document.body.appendChild(hub);
    }

    const toggle =
      document.getElementById("updatesToggle");

    const menu =
      document.getElementById("updatesMenu");

    const status =
      document.getElementById("updatesStatus");

    toggle.addEventListener("click", () => {
      menu.hidden = !menu.hidden;

      toggle.textContent =
        menu.hidden ? "Tools" : "Close";
    });

    /*
      Feature controller.

      These buttons do not fake AI processing.
      They provide a safe central place for
      connecting each real feature.
    */

    menu
      .querySelectorAll("[data-feature]")
      .forEach(button => {

        button.addEventListener("click", () => {

          const feature =
            button.dataset.feature;

          switch (feature) {

            case "crop":
              openCrop();
              break;

            case "green":
              openGreenScreen();
              break;

            case "remove-bg":
              openRemoveBackground();
              break;

            case "effects":
              openEffects();
              break;

            case "layers":
              openLayers();
              break;

            case "undo":
              performUndo();
              break;

            case "redo":
              performRedo();
              break;

            case "export":
              performExport();
              break;

            case "ai":
              openAIStudio();
              break;
          }
        });
      });

    function openCrop() {

      const crop =
        document.getElementById(
          "fullCropEngine"
        );

      if (crop) {
        crop.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        status.textContent =
          "✂️ Crop tools opened.";

        return;
      }

      status.textContent =
        "✂️ Crop engine is not loaded yet.";
    }

    function openGreenScreen() {

      status.textContent =
        "🟢 Green Screen is ready for connection.";
    }

    function openRemoveBackground() {

      status.textContent =
        "🪄 Remove Background will use the secure AI/image-processing connection.";
    }

    function openEffects() {

      status.textContent =
        "🎨 Effects panel is ready for connection.";
    }

    function openLayers() {

      status.textContent =
        "📚 Layers system is ready for connection.";
    }

    function performUndo() {

      if (
        typeof window.undo ===
        "function"
      ) {
        window.undo();
        return;
      }

      status.textContent =
        "↩️ Undo is ready for connection.";
    }

    function performRedo() {

      if (
        typeof window.redo ===
        "function"
      ) {
        window.redo();
        return;
      }

      status.textContent =
        "↪️ Redo is ready for connection.";
    }

    function performExport() {

      /*
        Don't silently download anything.
        This will eventually use the app's
        proper export workflow.
      */

      status.textContent =
        "📤 Export system is ready for the professional export workflow.";
    }

    function openAIStudio() {

      const ai =
        document.getElementById(
          "aiStudio"
        );

      if (ai) {

        ai.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });

        status.textContent =
          "✨ AI Studio opened.";

        return;
      }

      status.textContent =
        "✨ AI Studio is not connected yet.";
    }

    /*
      Crop event connection.
    */

    window.addEventListener(
      "cropApplied",
      event => {

        const detail =
          event.detail;

        if (!detail) return;

        status.textContent =
          `✂️ Crop ready: ${detail.width} × ${detail.height}px`;
      }
    );

    console.log(
      "🛠️ Updates Hub loaded."
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      startUpdatesHub
    );
  } else {
    startUpdatesHub();
  }

})();
