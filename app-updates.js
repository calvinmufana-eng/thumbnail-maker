(() => {
  "use strict";

  if (window.__APP_TOOLS_V2__) return;
  window.__APP_TOOLS_V2__ = true;

  function init() {
    if (document.getElementById("appTools")) return;

    const tools = document.createElement("section");
    tools.id = "appTools";

    tools.innerHTML = `
      <div class="toolsHeader">
        <div>
          <strong>🛠️ More Tools</strong>
          <small>Advanced editing</small>
        </div>

        <button id="toolsToggle" type="button">
          Tools
        </button>
      </div>

      <div id="toolsMenu" class="toolsMenu">

        <button type="button" data-tool="crop">
          ✂️ Crop
        </button>

        <button type="button" data-tool="green">
          🟢 Green Screen
        </button>

        <button type="button" data-tool="remove">
          🪄 Remove BG
        </button>

        <button type="button" data-tool="effects">
          🎨 Effects
        </button>

        <button type="button" data-tool="layers">
          📚 Layers
        </button>

        <button type="button" data-tool="ai">
          ✨ AI Studio
        </button>

      </div>

      <div id="toolWorkspace"></div>

      <div id="toolsStatus">
        Ready.
      </div>
    `;

    const css = document.createElement("style");

    css.textContent = `
      #appTools {
        width: calc(100% - 20px);
        max-width: 600px;
        margin: 12px auto;
        padding: 12px;
        box-sizing: border-box;
        border-radius: 14px;
        background: #171a21;
        border: 1px solid #303642;
        color: white;
        font-family: Arial, sans-serif;
      }

      .toolsHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }

      .toolsHeader strong {
        display: block;
        font-size: 15px;
      }

      .toolsHeader small {
        display: block;
        margin-top: 3px;
        color: #9ca3af;
        font-size: 11px;
      }

      #toolsToggle {
        width: auto;
        min-width: 78px;
        padding: 9px 13px;
        border: 0;
        border-radius: 9px;
        background: #2563eb;
        color: white;
        font-weight: 800;
        cursor: pointer;
      }

      #toolsToggle:active {
        transform: scale(.98);
      }

      .toolsMenu {
        display: none;
        grid-template-columns: repeat(3, 1fr);
        gap: 7px;
        margin-top: 10px;
      }

      .toolsMenu.open {
        display: grid;
      }

      .toolsMenu button {
        min-height: 40px;
        padding: 7px 4px;
        border: 0;
        border-radius: 9px;
        background: #29303b;
        color: white;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      .toolsMenu button:active {
        transform: scale(.97);
      }

      #toolWorkspace {
        margin-top: 10px;
      }

      .toolPanel {
        padding: 12px;
        border-radius: 10px;
        background: #20252e;
        border: 1px solid #343b48;
      }

      .toolPanel h3 {
        margin: 0 0 6px;
        font-size: 14px;
      }

      .toolPanel p {
        margin: 0 0 10px;
        color: #aeb6c4;
        font-size: 11px;
        line-height: 1.45;
      }

      .cropControls {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      .cropControls button {
        min-height: 36px;
        border: 0;
        border-radius: 8px;
        background: #303846;
        color: white;
        font-weight: 700;
        font-size: 11px;
      }

      .cropControls button.active {
        background: #2563eb;
      }

      .cropPrimary {
        margin-top: 8px;
        width: 100%;
        min-height: 40px;
        border: 0;
        border-radius: 9px;
        background: #059669;
        color: white;
        font-weight: 800;
      }

      .cropCancel {
        margin-top: 6px;
        width: 100%;
        min-height: 36px;
        border: 0;
        border-radius: 9px;
        background: #374151;
        color: white;
        font-weight: 700;
      }

      #toolsStatus {
        min-height: 16px;
        margin-top: 8px;
        text-align: center;
        color: #9ca3af;
        font-size: 11px;
      }

      @media (max-width: 430px) {
        .toolsMenu {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    document.head.appendChild(css);

    /*
      Put the tools after the existing editor.
    */
    const editor =
      document.getElementById("proEditor");

    if (editor) {
      editor.appendChild(tools);
    } else {
      document.body.appendChild(tools);
    }

    const toggle =
      document.getElementById("toolsToggle");

    const menu =
      document.getElementById("toolsMenu");

    const workspace =
      document.getElementById("toolWorkspace");

    const status =
      document.getElementById("toolsStatus");

    /*
      REAL OPEN / CLOSE
    */
    toggle.addEventListener("click", () => {

      const isOpen =
        menu.classList.toggle("open");

      toggle.textContent =
        isOpen ? "Close" : "Tools";

      if (!isOpen) {
        workspace.innerHTML = "";
      }
    });

    /*
      TOOL BUTTONS
    */
    menu
      .querySelectorAll("[data-tool]")
      .forEach(button => {

        button.addEventListener("click", () => {

          const tool =
            button.dataset.tool;

          if (tool === "crop") {
            showCrop();
            return;
          }

          showMessage(
            toolName(tool) +
            " is planned for the next connection step."
          );
        });
      });

    function toolName(tool) {

      const names = {
        green: "🟢 Green Screen",
        remove: "🪄 Remove Background",
        effects: "🎨 Effects",
        layers: "📚 Layers",
        ai: "✨ AI Studio"
      };

      return names[tool] || "Tool";
    }

    function showMessage(message) {

      workspace.innerHTML = `
        <div class="toolPanel">
          <h3>${message}</h3>
          <p>
            Your existing editor has not been changed.
            This tool is ready for its full implementation.
          </p>
        </div>
      `;

      status.textContent =
        "Tool selected.";
    }

    /*
      CROP PANEL
    */
    function showCrop() {

      workspace.innerHTML = `
        <div class="toolPanel">

          <h3>✂️ Crop</h3>

          <p>
            Choose the crop format you want.
            The real canvas crop operation will be
            connected to your selected image next.
          </p>

          <div class="cropControls">

            <button
              type="button"
              data-crop="free"
              class="active">
              Free
            </button>

            <button
              type="button"
              data-crop="16:9">
              16:9
            </button>

            <button
              type="button"
              data-crop="1:1">
              1:1
            </button>

            <button
              type="button"
              data-crop="4:5">
              4:5
            </button>

            <button
              type="button"
              data-crop="9:16">
              9:16
            </button>

            <button
              type="button"
              data-crop="4:3">
              4:3
            </button>

          </div>

          <button
            id="cropStartButton"
            class="cropPrimary"
            type="button">
            ✂️ Start Crop
          </button>

          <button
            id="cropCancelButton"
            class="cropCancel"
            type="button">
            Cancel
          </button>

        </div>
      `;

      const cropButtons =
        workspace.querySelectorAll(
          "[data-crop]"
        );

      cropButtons.forEach(button => {

        button.addEventListener(
          "click",
          () => {

            cropButtons.forEach(
              item =>
                item.classList.remove(
                  "active"
                )
            );

            button.classList.add(
              "active"
            );

            status.textContent =
              `Crop ratio: ${button.dataset.crop}`;
          }
        );
      });

      document
        .getElementById(
          "cropStartButton"
        )
        .addEventListener(
          "click",
          () => {

            status.textContent =
              "✂️ Crop mode activated.";

            activateCropMode();
          }
        );

      document
        .getElementById(
          "cropCancelButton"
        )
        .addEventListener(
          "click",
          () => {

            workspace.innerHTML = "";

            status.textContent =
              "Crop cancelled.";
          }
        );
    }

    /*
      Safe crop-mode activation.

      We deliberately do not alter the existing
      editor's image until the crop selection
      is connected to the canvas.
    */
    function activateCropMode() {

      const canvas =
        document.getElementById(
          "thumbnailCanvas"
        );

      if (!canvas) {

        status.textContent =
          "Thumbnail canvas was not found.";

        return;
      }

      canvas.style.cursor =
        "crosshair";

      status.textContent =
        "✂️ Crop mode is active — drag over the canvas.";

      let startX = null;
      let startY = null;

      const down = event => {

        startX =
          event.clientX;

        startY =
          event.clientY;
      };

      const up = event => {

        if (
          startX === null ||
          startY === null
        ) {
          return;
        }

        const width =
          Math.abs(
            event.clientX -
            startX
          );

        const height =
          Math.abs(
            event.clientY -
            startY
          );

        if (
          width < 10 ||
          height < 10
        ) {

          status.textContent =
            "Make a larger crop selection.";

        } else {

          status.textContent =
            `Crop area selected: ${Math.round(width)} × ${Math.round(height)}px`;
        }

        startX = null;
        startY = null;
      };

      canvas.addEventListener(
        "pointerdown",
        down
      );

      canvas.addEventListener(
        "pointerup",
        up
      );

      /*
        Keep references so a future version can
        cleanly replace this mode.
      */
      window.__APP_CROP_MODE__ = {
        canvas,
        down,
        up
      };
    }

    console.log(
      "🛠️ App Tools V2 loaded successfully."
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();
