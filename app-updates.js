(() => {
  "use strict";

  if (window.__REAL_CROP_V3__) return;
  window.__REAL_CROP_V3__ = true;

  let cropOverlay = null;
  let cropBox = null;
  let selectedRatio = null;
  let dragging = false;
  let resizing = false;
  let resizeHandle = null;

  let startPointerX = 0;
  let startPointerY = 0;
  let startBox = null;

  const state = {
    zoom: 1,
    rotation: 0
  };

  function init() {
    if (document.getElementById("realCropTools")) return;

    const panel = document.createElement("section");
    panel.id = "realCropTools";

    panel.innerHTML = `
      <div class="rctHeader">
        <div>
          <strong>✂️ Crop</strong>
          <small>Move and resize your crop area</small>
        </div>

        <button id="rctToggle" type="button">
          Tools
        </button>
      </div>

      <div id="rctMenu">

        <div class="rctButtons">

          <button data-tool="crop" type="button">
            ✂️ Crop
          </button>

          <button data-tool="green" type="button">
            🟢 Green Screen
          </button>

          <button data-tool="remove" type="button">
            🪄 Remove BG
          </button>

          <button data-tool="effects" type="button">
            🎨 Effects
          </button>

          <button data-tool="ai" type="button">
            ✨ AI Studio
          </button>

        </div>

        <div id="rctWorkspace"></div>

      </div>

      <div id="rctStatus">
        Ready.
      </div>
    `;

    const style = document.createElement("style");

    style.textContent = `
      #realCropTools {
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

      .rctHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .rctHeader strong {
        display: block;
        font-size: 15px;
      }

      .rctHeader small {
        display: block;
        margin-top: 3px;
        color: #9ca3af;
        font-size: 11px;
      }

      #rctToggle {
        border: 0;
        border-radius: 8px;
        padding: 8px 13px;
        background: #2563eb;
        color: white;
        font-weight: 800;
      }

      #rctMenu {
        display: none;
        margin-top: 10px;
      }

      #rctMenu.open {
        display: block;
      }

      .rctButtons {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
      }

      .rctButtons button,
      .ratioButton,
      .rctAction {
        min-height: 38px;
        padding: 6px;
        border: 0;
        border-radius: 8px;
        background: #29303b;
        color: white;
        font-size: 11px;
        font-weight: 700;
      }

      .rctWorkspace {
        margin-top: 10px;
      }

      .cropPanel {
        padding: 10px;
        border-radius: 10px;
        background: #20252e;
      }

      .ratioGrid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }

      .ratioButton.active {
        background: #2563eb;
      }

      .cropSliders {
        margin-top: 9px;
      }

      .cropSliders label {
        display: block;
        margin-bottom: 7px;
        font-size: 11px;
      }

      .cropSliders input {
        width: 100%;
        box-sizing: border-box;
      }

      .cropActions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin-top: 8px;
      }

      .applyCrop {
        background: #059669 !important;
      }

      #rctStatus {
        margin-top: 8px;
        min-height: 16px;
        text-align: center;
        color: #9ca3af;
        font-size: 11px;
      }

      #realCropOverlay {
        position: fixed;
        z-index: 999999;
        pointer-events: none;
        background: rgba(0,0,0,.55);
      }

      #realCropBox {
        position: absolute;
        border: 2px solid white;
        box-sizing: border-box;
        pointer-events: auto;
        cursor: move;
        touch-action: none;
        box-shadow:
          0 0 0 9999px rgba(0,0,0,.55);
      }

      .cropHandle {
        position: absolute;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: white;
        border: 1px solid #111;
        box-sizing: border-box;
      }

      .cropHandle.nw {
        left: -8px;
        top: -8px;
        cursor: nwse-resize;
      }

      .cropHandle.ne {
        right: -8px;
        top: -8px;
        cursor: nesw-resize;
      }

      .cropHandle.sw {
        left: -8px;
        bottom: -8px;
        cursor: nesw-resize;
      }

      .cropHandle.se {
        right: -8px;
        bottom: -8px;
        cursor: nwse-resize;
      }

      @media (max-width: 500px) {
        .rctButtons {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    document.head.appendChild(style);

    const editor =
      document.getElementById("proEditor");

    if (editor) {
      editor.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    const toggle =
      document.getElementById("rctToggle");

    const menu =
      document.getElementById("rctMenu");

    const workspace =
      document.getElementById("rctWorkspace");

    const status =
      document.getElementById("rctStatus");

    toggle.addEventListener("click", () => {

      const open =
        menu.classList.toggle("open");

      toggle.textContent =
        open ? "Close" : "Tools";
    });

    panel
      .querySelectorAll("[data-tool]")
      .forEach(button => {

        button.addEventListener("click", () => {

          if (
            button.dataset.tool ===
            "crop"
          ) {
            openCropPanel();
            return;
          }

          workspace.innerHTML = `
            <div class="cropPanel">
              <strong>
                ${button.textContent}
              </strong>

              <p style="color:#9ca3af;font-size:11px;">
                This tool is ready for its
                implementation step.
              </p>
            </div>
          `;
        });
      });

    function findCanvas() {
      return (
        document.getElementById(
          "thumbnailCanvas"
        ) ||
        document.querySelector(
          "canvas"
        )
      );
    }

    function openCropPanel() {

      workspace.innerHTML = `
        <div class="cropPanel">

          <strong>✂️ Real Crop</strong>

          <p style="color:#9ca3af;font-size:11px;">
            Select a ratio, then start cropping.
          </p>

          <div class="ratioGrid">

            <button
              class="ratioButton active"
              data-ratio="free">
              Free
            </button>

            <button
              class="ratioButton"
              data-ratio="16:9">
              16:9
            </button>

            <button
              class="ratioButton"
              data-ratio="1:1">
              1:1
            </button>

            <button
              class="ratioButton"
              data-ratio="4:5">
              4:5
            </button>

            <button
              class="ratioButton"
              data-ratio="9:16">
              9:16
            </button>

            <button
              class="ratioButton"
              data-ratio="4:3">
              4:3
            </button>

          </div>

          <div class="cropSliders">

            <label>
              Zoom
              <input
                id="cropZoom"
                type="range"
                min="50"
                max="200"
                value="100">
            </label>

            <label>
              Rotation
              <input
                id="cropRotation"
                type="range"
                min="-180"
                max="180"
                value="0">
            </label>

          </div>

          <div class="cropActions">

            <button
              class="rctAction applyCrop"
              id="applyRealCrop"
              type="button">
              ✅ Apply Crop
            </button>

            <button
              class="rctAction"
              id="cancelRealCrop"
              type="button">
              ❌ Cancel
            </button>

          </div>

        </div>
      `;

      selectedRatio = "free";

      workspace
        .querySelectorAll("[data-ratio]")
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              selectedRatio =
                button.dataset.ratio;

              workspace
                .querySelectorAll(
                  "[data-ratio]"
                )
                .forEach(
                  b =>
                    b.classList.remove(
                      "active"
                    )
                );

              button.classList.add(
                "active"
              );

              if (cropBox) {
                applyRatio();
                renderCrop();
              }
            }
          );
        });

      document
        .getElementById(
          "cropZoom"
        )
        .addEventListener(
          "input",
          event => {

            state.zoom =
              Number(
                event.target.value
              ) / 100;

            renderCrop();
          }
        );

      document
        .getElementById(
          "cropRotation"
        )
        .addEventListener(
          "input",
          event => {

            state.rotation =
              Number(
                event.target.value
              );

            renderCrop();
          }
        );

      document
        .getElementById(
          "applyRealCrop"
        )
        .addEventListener(
          "click",
          applyCrop
        );

      document
        .getElementById(
          "cancelRealCrop"
        )
        .addEventListener(
          "click",
          cancelCrop
        );

      createCrop();
    }

    function createCrop() {

      const canvas = findCanvas();

      if (!canvas) {
        status.textContent =
          "No thumbnail canvas found.";
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      if (
        rect.width < 10 ||
        rect.height < 10
      ) {
        status.textContent =
          "The canvas is not ready yet.";
        return;
      }

      if (cropOverlay) {
        cropOverlay.remove();
      }

      cropOverlay =
        document.createElement("div");

      cropOverlay.id =
        "realCropOverlay";

      cropOverlay.style.left =
        `${rect.left}px`;

      cropOverlay.style.top =
        `${rect.top}px`;

      cropOverlay.style.width =
        `${rect.width}px`;

      cropOverlay.style.height =
        `${rect.height}px`;

      cropBox =
        document.createElement("div");

      cropBox.id =
        "realCropBox";

      const handles = [
        "nw",
        "ne",
        "sw",
        "se"
      ];

      handles.forEach(name => {

        const handle =
          document.createElement("div");

        handle.className =
          `cropHandle ${name}`;

        handle.dataset.handle =
          name;

        cropBox.appendChild(handle);

        handle.addEventListener(
          "pointerdown",
          startResize
        );
      });

      cropOverlay.appendChild(
        cropBox
      );

      document.body.appendChild(
        cropOverlay
      );

      cropBox.style.left =
        `${rect.width * .1}px`;

      cropBox.style.top =
        `${rect.height * .1}px`;

      cropBox.style.width =
        `${rect.width * .8}px`;

      cropBox.style.height =
        `${rect.height * .8}px`;

      cropBox.addEventListener(
        "pointerdown",
        startDrag
      );

      renderCrop();

      status.textContent =
        "✂️ Drag the crop area or its corners.";
    }

    function startDrag(event) {

      if (
        event.target.classList.contains(
          "cropHandle"
        )
      ) return;

      event.preventDefault();

      dragging = true;

      startPointerX =
        event.clientX;

      startPointerY =
        event.clientY;

      startBox = {
        left:
          parseFloat(
            cropBox.style.left
          ),

        top:
          parseFloat(
            cropBox.style.top
          ),

        width:
          parseFloat(
            cropBox.style.width
          ),

        height:
          parseFloat(
            cropBox.style.height
          )
      };

      cropBox.setPointerCapture(
        event.pointerId
      );

      cropBox.addEventListener(
        "pointermove",
        moveDrag
      );

      cropBox.addEventListener(
        "pointerup",
        stopDrag,
        { once: true }
      );
    }

    function moveDrag(event) {

      if (!dragging) return;

      const dx =
        event.clientX -
        startPointerX;

      const dy =
        event.clientY -
        startPointerY;

      const parentWidth =
        cropOverlay.clientWidth;

      const parentHeight =
        cropOverlay.clientHeight;

      let left =
        startBox.left + dx;

      let top =
        startBox.top + dy;

      left =
        Math.max(
          0,
          Math.min(
            left,
            parentWidth -
            startBox.width
          )
        );

      top =
        Math.max(
          0,
          Math.min(
            top,
            parentHeight -
            startBox.height
          )
        );

      cropBox.style.left =
        `${left}px`;

      cropBox.style.top =
        `${top}px`;
    }

    function stopDrag() {

      dragging = false;

      cropBox.removeEventListener(
        "pointermove",
        moveDrag
      );
    }

    function startResize(event) {

      event.preventDefault();
      event.stopPropagation();

      resizing = true;

      resizeHandle =
        event.target.dataset.handle;

      startPointerX =
        event.clientX;

      startPointerY =
        event.clientY;

      startBox = {
        left:
          parseFloat(
            cropBox.style.left
          ),

        top:
          parseFloat(
            cropBox.style.top
          ),

        width:
          parseFloat(
            cropBox.style.width
          ),

        height:
          parseFloat(
            cropBox.style.height
          )
      };

      event.target.setPointerCapture(
        event.pointerId
      );

      event.target.addEventListener(
        "pointermove",
        resizeMove
      );

      event.target.addEventListener(
        "pointerup",
        resizeStop,
        { once: true }
      );
    }

    function resizeMove(event) {

      if (!resizing) return;

      const dx =
        event.clientX -
        startPointerX;

      const dy =
        event.clientY -
        startPointerY;

      let left =
        startBox.left;

      let top =
        startBox.top;

      let width =
        startBox.width;

      let height =
        startBox.height;

      if (
        resizeHandle.includes("e")
      ) {
        width =
          startBox.width + dx;
      }

      if (
        resizeHandle.includes("w")
      ) {
        width =
          startBox.width - dx;

        left =
          startBox.left + dx;
      }

      if (
        resizeHandle.includes("s")
      ) {
        height =
          startBox.height + dy;
      }

      if (
        resizeHandle.includes("n")
      ) {
        height =
          startBox.height - dy;

        top =
          startBox.top + dy;
      }

      width =
        Math.max(30, width);

      height =
        Math.max(30, height);

      const maxWidth =
        cropOverlay.clientWidth;

      const maxHeight =
        cropOverlay.clientHeight;

      left =
        Math.max(
          0,
          Math.min(
            left,
            maxWidth - width
          )
        );

      top =
        Math.max(
          0,
          Math.min(
            top,
            maxHeight - height
          )
        );

      cropBox.style.left =
        `${left}px`;

      cropBox.style.top =
        `${top}px`;

      cropBox.style.width =
        `${width}px`;

      cropBox.style.height =
        `${height}px`;

      applyRatio();
    }

    function resizeStop() {

      resizing = false;
      resizeHandle = null;
    }

    function applyRatio() {

      if (
        !selectedRatio ||
        selectedRatio === "free" ||
        !cropBox
      ) return;

      const parts =
        selectedRatio.split(":");

      const ratio =
        Number(parts[0]) /
        Number(parts[1]);

      let width =
        parseFloat(
          cropBox.style.width
        );

      let height =
        width / ratio;

      if (
        height >
        cropOverlay.clientHeight
      ) {
        height =
          cropOverlay.clientHeight;

        width =
          height * ratio;
      }

      cropBox.style.width =
        `${width}px`;

      cropBox.style.height =
        `${height}px`;
    }

    function renderCrop() {

      if (!cropBox) return;

      cropBox.style.transform =
        `rotate(${state.rotation}deg)`;
    }

    function applyCrop() {

      const canvas = findCanvas();

      if (
        !canvas ||
        !cropBox ||
        !cropOverlay
      ) {
        status.textContent =
          "Crop area is not ready.";
        return;
      }

      const canvasRect =
        canvas.getBoundingClientRect();

      const boxRect =
        cropBox.getBoundingClientRect();

      const scaleX =
        canvas.width /
        canvasRect.width;

      const scaleY =
        canvas.height /
        canvasRect.height;

      const sx =
        Math.max(
          0,
          (boxRect.left -
            canvasRect.left) *
          scaleX
        );

      const sy =
        Math.max(
          0,
          (boxRect.top -
            canvasRect.top) *
          scaleY
        );

      const sw =
        Math.min(
          canvas.width - sx,
          boxRect.width * scaleX
        );

      const sh =
        Math.min(
          canvas.height - sy,
          boxRect.height * scaleY
        );

      if (
        sw <= 1 ||
        sh <= 1
      ) {
        status.textContent =
          "Crop area is too small.";
        return;
      }

      const output =
        document.createElement(
          "canvas"
        );

      output.width =
        Math.round(sw);

      output.height =
        Math.round(sh);

      const ctx =
        output.getContext("2d");

      ctx.drawImage(
        canvas,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        output.width,
        output.height
      );

      const dataURL =
        output.toDataURL(
          "image/png"
        );

      window.__LAST_THUMBNAIL_CROP__ =
        dataURL;

      window.dispatchEvent(
        new CustomEvent(
          "thumbnailCropApplied",
          {
            detail: {
              dataURL,
              width:
                output.width,
              height:
                output.height
            }
          }
        )
      );

      cropOverlay.remove();

      cropOverlay = null;
      cropBox = null;

      status.textContent =
        `✅ Crop created: ${output.width} × ${output.height}px`;
    }

    function cancelCrop() {

      if (cropOverlay) {
        cropOverlay.remove();
      }

      cropOverlay = null;
      cropBox = null;

      status.textContent =
        "Crop cancelled.";
    }

    console.log(
      "✂️ Real Crop V3 loaded."
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
