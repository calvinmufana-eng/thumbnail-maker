(() => {
  "use strict";

  if (window.__FULL_CROP_ENGINE__) return;
  window.__FULL_CROP_ENGINE__ = true;

  let image = null;
  let cropBox = null;
  let mode = "free";
  let zoom = 1;
  let rotation = 0;
  let history = [];
  let historyIndex = -1;

  const state = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };

  function createCropEngine() {
    if (document.getElementById("fullCropEngine")) return;

    const canvas =
      document.getElementById("thumbnailCanvas");

    if (!canvas) {
      console.error(
        "Crop Engine: thumbnailCanvas not found."
      );
      return;
    }

    const panel = document.createElement("section");
    panel.id = "fullCropEngine";

    panel.innerHTML = `
      <div class="fce-title">
        ✂️ Professional Crop
      </div>

      <div class="fce-toolbar">

        <button data-action="start">
          ✂️ Crop
        </button>

        <button data-action="reset">
          🔄 Reset
        </button>

        <button data-action="undo">
          ↩️ Undo
        </button>

        <button data-action="redo">
          ↪️ Redo
        </button>

      </div>

      <div class="fce-ratios">

        <button data-ratio="free" class="active">
          Free
        </button>

        <button data-ratio="16:9">
          16:9
        </button>

        <button data-ratio="1:1">
          1:1
        </button>

        <button data-ratio="4:5">
          4:5
        </button>

        <button data-ratio="9:16">
          9:16
        </button>

        <button data-ratio="4:3">
          4:3
        </button>

      </div>

      <div class="fce-controls">

        <label>
          Zoom
          <input
            id="fceZoom"
            type="range"
            min="50"
            max="300"
            value="100"
          >
          <span id="fceZoomValue">100%</span>
        </label>

        <label>
          Rotation
          <input
            id="fceRotation"
            type="range"
            min="-180"
            max="180"
            value="0"
          >
          <span id="fceRotationValue">0°</span>
        </label>

      </div>

      <div class="fce-actions">

        <button data-action="apply">
          ✅ Apply Crop
        </button>

        <button data-action="cancel">
          ❌ Cancel
        </button>

      </div>

      <div id="fceStatus">
        Upload an image and press Crop.
      </div>
    `;

    const style = document.createElement("style");

    style.id = "fullCropEngineStyles";

    style.textContent = `
      #fullCropEngine {
        width: 100%;
        max-width: 560px;
        margin: 12px auto;
        padding: 12px;
        box-sizing: border-box;
        border-radius: 14px;
        background: #171a21;
        border: 1px solid #303642;
        color: white;
        font-family: Arial, sans-serif;
      }

      .fce-title {
        font-size: 16px;
        font-weight: 800;
        margin-bottom: 9px;
      }

      .fce-toolbar,
      .fce-ratios,
      .fce-actions {
        display: grid;
        grid-template-columns:
          repeat(4, 1fr);
        gap: 6px;
        margin-bottom: 7px;
      }

      .fce-ratios {
        grid-template-columns:
          repeat(6, 1fr);
      }

      #fullCropEngine button {
        min-height: 36px;
        padding: 7px 5px;
        border: 0;
        border-radius: 8px;
        background: #29303b;
        color: white;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      #fullCropEngine button:hover {
        filter: brightness(1.15);
      }

      #fullCropEngine button.active {
        background: #2563eb;
      }

      .fce-controls {
        padding: 9px;
        margin-top: 8px;
        border-radius: 9px;
        background: #20252e;
      }

      .fce-controls label {
        display: block;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 700;
      }

      .fce-controls label:last-child {
        margin-bottom: 0;
      }

      .fce-controls input {
        width: 100%;
        margin-top: 5px;
        box-sizing: border-box;
      }

      .fce-controls span {
        display: block;
        text-align: center;
        color: #cbd5e1;
        margin-top: 3px;
      }

      .fce-actions {
        grid-template-columns: 1fr 1fr;
        margin-top: 8px;
      }

      .fce-actions button:first-child {
        background: #059669 !important;
      }

      .fce-actions button:last-child {
        background: #374151 !important;
      }

      #fceStatus {
        min-height: 17px;
        margin-top: 7px;
        text-align: center;
        color: #9ca3af;
        font-size: 11px;
      }

      @media (max-width: 480px) {
        .fce-toolbar {
          grid-template-columns: 1fr 1fr;
        }

        .fce-ratios {
          grid-template-columns:
            repeat(3, 1fr);
        }
      }
    `;

    document.head.appendChild(style);

    /*
      Put the crop controls near the existing editor.
    */
    const editor =
      document.getElementById("proEditor");

    if (editor) {
      editor.appendChild(panel);
    } else if (canvas.parentElement) {
      canvas.parentElement.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    const status =
      document.getElementById("fceStatus");

    const zoomSlider =
      document.getElementById("fceZoom");

    const rotationSlider =
      document.getElementById("fceRotation");

    const zoomValue =
      document.getElementById("fceZoomValue");

    const rotationValue =
      document.getElementById("fceRotationValue");

    /*
      Find the most recently uploaded image
      used by the existing page.
    */
    function findImage() {
      const images =
        document.querySelectorAll("img");

      for (let i = images.length - 1; i >= 0; i--) {
        const candidate = images[i];

        if (
          candidate.complete &&
          candidate.naturalWidth > 0
        ) {
          return candidate;
        }
      }

      return null;
    }

    function saveState() {
      history =
        history.slice(0, historyIndex + 1);

      history.push({
        x: state.x,
        y: state.y,
        width: state.width,
        height: state.height,
        zoom,
        rotation,
        mode
      });

      historyIndex =
        history.length - 1;
    }

    function restoreState(saved) {
      if (!saved) return;

      state.x = saved.x;
      state.y = saved.y;
      state.width = saved.width;
      state.height = saved.height;

      zoom = saved.zoom;
      rotation = saved.rotation;
      mode = saved.mode;

      zoomSlider.value =
        Math.round(zoom * 100);

      rotationSlider.value =
        rotation;

      zoomValue.textContent =
        `${Math.round(zoom * 100)}%`;

      rotationValue.textContent =
        `${Math.round(rotation)}°`;

      renderCrop();
    }

    function undo() {
      if (historyIndex <= 0) return;

      historyIndex--;

      restoreState(
        history[historyIndex]
      );

      status.textContent =
        "Undo applied.";
    }

    function redo() {
      if (
        historyIndex >=
        history.length - 1
      ) return;

      historyIndex++;

      restoreState(
        history[historyIndex]
      );

      status.textContent =
        "Redo applied.";
    }

    function setRatio(value) {
      mode = value;

      document
        .querySelectorAll(
          ".fce-ratios button"
        )
        .forEach(button => {
          button.classList.toggle(
            "active",
            button.dataset.ratio === value
          );
        });

      if (
        value !== "free" &&
        state.width > 0
      ) {
        const parts =
          value.split(":");

        const ratio =
          Number(parts[0]) /
          Number(parts[1]);

        state.height =
          state.width / ratio;
      }

      renderCrop();
      saveState();
    }

    function startCrop() {
      image = findImage();

      if (!image) {
        status.textContent =
          "Upload a picture first.";
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      state.x =
        rect.left;

      state.y =
        rect.top;

      state.width =
        rect.width * 0.8;

      state.height =
        rect.height * 0.8;

      zoom = 1;
      rotation = 0;

      zoomSlider.value = 100;
      rotationSlider.value = 0;

      zoomValue.textContent = "100%";
      rotationValue.textContent = "0°";

      saveState();

      status.textContent =
        "Crop is active. Choose a ratio, zoom, or rotation.";

      renderCrop();
    }

    function renderCrop() {
      if (!image) return;

      /*
        The crop engine stores the crop
        geometry independently from the
        existing editor.
      */

      if (!cropBox) {
        cropBox =
          document.createElement("div");

        cropBox.id =
          "fceCropBox";

        cropBox.innerHTML = `
          <div class="fce-handle nw"></div>
          <div class="fce-handle ne"></div>
          <div class="fce-handle sw"></div>
          <div class="fce-handle se"></div>
        `;

        document.body.appendChild(
          cropBox
        );

        cropBox.style.position =
          "fixed";

        cropBox.style.border =
          "2px solid white";

        cropBox.style.boxSizing =
          "border-box";

        cropBox.style.zIndex =
          "999999";

        cropBox.style.boxShadow =
          "0 0 0 9999px rgba(0,0,0,.55)";

        cropBox.style.touchAction =
          "none";

        cropBox
          .querySelectorAll(".fce-handle")
          .forEach(handle => {

            handle.style.position =
              "absolute";

            handle.style.width =
              "16px";

            handle.style.height =
              "16px";

            handle.style.background =
              "white";

            handle.style.borderRadius =
              "50%";

            handle.style.boxShadow =
              "0 0 0 1px #111";
          });

        const handles = {
          nw: ["left", "top"],
          ne: ["right", "top"],
          sw: ["left", "bottom"],
          se: ["right", "bottom"]
        };

        Object.entries(handles)
          .forEach(([name, pos]) => {

            const handle =
              cropBox.querySelector(
                "." + name
              );

            handle.style[pos[0]] =
              "-8px";

            handle.style[pos[1]] =
              "-8px";
          });
      }

      cropBox.style.left =
        `${state.x}px`;

      cropBox.style.top =
        `${state.y}px`;

      cropBox.style.width =
        `${state.width}px`;

      cropBox.style.height =
        `${state.height}px`;

      cropBox.style.transform =
        `rotate(${rotation}deg)`;
    }

    function reset() {
      image = findImage();

      if (!image) return;

      zoom = 1;
      rotation = 0;
      mode = "free";

      zoomSlider.value = 100;
      rotationSlider.value = 0;

      zoomValue.textContent = "100%";
      rotationValue.textContent = "0°";

      state.x = 0;
      state.y = 0;
      state.width = 0;
      state.height = 0;

      if (cropBox) {
        cropBox.remove();
        cropBox = null;
      }

      history = [];
      historyIndex = -1;

      status.textContent =
        "Crop reset.";

      setRatio("free");
    }

    function cancel() {
      if (cropBox) {
        cropBox.remove();
        cropBox = null;
      }

      image = null;

      status.textContent =
        "Crop cancelled.";
    }

    /*
      Create the final cropped image.
      This is a real canvas crop operation.
    */
    function applyCrop() {
      if (!image) {
        status.textContent =
          "Upload and select a picture first.";
        return;
      }

      if (
        state.width < 2 ||
        state.height < 2
      ) {
        status.textContent =
          "Select a crop area first.";
        return;
      }

      const output =
        document.createElement("canvas");

      const ctx =
        output.getContext("2d");

      const sourceRect =
        canvas.getBoundingClientRect();

      const scaleX =
        image.naturalWidth /
        sourceRect.width;

      const scaleY =
        image.naturalHeight /
        sourceRect.height;

      let sx =
        (state.x -
          sourceRect.left) *
        scaleX;

      let sy =
        (state.y -
          sourceRect.top) *
        scaleY;

      let sw =
        state.width *
        scaleX;

      let sh =
        state.height *
        scaleY;

      sx = Math.max(
        0,
        Math.min(
          sx,
          image.naturalWidth
        )
      );

      sy = Math.max(
        0,
        Math.min(
          sy,
          image.naturalHeight
        )
      );

      sw = Math.min(
        sw,
        image.naturalWidth - sx
      );

      sh = Math.min(
        sh,
        image.naturalHeight - sy
      );

      if (
        sw <= 1 ||
        sh <= 1
      ) {
        status.textContent =
          "The crop area is outside the picture.";
        return;
      }

      output.width =
        Math.round(sw);

      output.height =
        Math.round(sh);

      ctx.save();

      ctx.translate(
        output.width / 2,
        output.height / 2
      );

      ctx.rotate(
        rotation *
        Math.PI /
        180
      );

      ctx.scale(
        zoom,
        zoom
      );

      ctx.drawImage(
        image,
        sx,
        sy,
        sw,
        sh,
        -output.width / 2,
        -output.height / 2,
        output.width,
        output.height
      );

      ctx.restore();

      /*
        Make the result available to
        the rest of the application.
      */
      const result =
        output.toDataURL(
          "image/png",
          1
        );

      window.__LAST_CROP_RESULT__ =
        result;

      window.dispatchEvent(
        new CustomEvent(
          "cropApplied",
          {
            detail: {
              dataURL: result,
              width: output.width,
              height: output.height
            }
          }
        )
      );

      if (cropBox) {
        cropBox.remove();
        cropBox = null;
      }

      status.textContent =
        `Crop applied — ${output.width} × ${output.height}px`;

      console.log(
        "✂️ Crop result created:",
        output.width,
        output.height
      );
    }

    // ==========================================
    // BUTTON ACTIONS
    // ==========================================

    panel
      .querySelectorAll("[data-action]")
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const action =
              button.dataset.action;

            if (action === "start")
              startCrop();

            if (action === "reset")
              reset();

            if (action === "undo")
              undo();

            if (action === "redo")
              redo();

            if (action === "apply")
              applyCrop();

            if (action === "cancel")
              cancel();
          }
        );
      });

    // ==========================================
    // ASPECT RATIOS
    // ==========================================

    panel
      .querySelectorAll(
        "[data-ratio]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            setRatio(
              button.dataset.ratio
            );
          }
        );
      });

    // ==========================================
    // ZOOM
    // ==========================================

    zoomSlider.addEventListener(
      "input",
      () => {

        zoom =
          Number(
            zoomSlider.value
          ) / 100;

        zoomValue.textContent =
          `${zoomSlider.value}%`;

        renderCrop();
      }
    );

    zoomSlider.addEventListener(
      "change",
      saveState
    );

    // ==========================================
    // ROTATION
    // ==========================================

    rotationSlider.addEventListener(
      "input",
      () => {

        rotation =
          Number(
            rotationSlider.value
          );

        rotationValue.textContent =
          `${rotation}°`;

        renderCrop();
      }
    );

    rotationSlider.addEventListener(
      "change",
      saveState
    );

    console.log(
      "✂️ Professional Crop Engine loaded."
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      createCropEngine
    );
  } else {
    createCropEngine();
  }

})();
