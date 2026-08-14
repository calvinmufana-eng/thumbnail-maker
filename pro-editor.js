(() => {
  "use strict";

  if (window.__PRO_EDITOR_LOADED__) {
    console.log("Pro Editor already loaded — skipping duplicate.");
    return;
  }

  window.__PRO_EDITOR_LOADED__ = true;

  const canvas = document.getElementById("thumbnailCanvas");

  if (!canvas) {
    console.error("Pro Editor: thumbnailCanvas was not found.");
    return;
  } (() => {
  "use strict";

  const canvas = document.getElementById("thumbnailCanvas");

  if (!canvas) {
    console.error("Pro Editor: thumbnailCanvas was not found.");
    return;
  }

  // --------------------------------------------------
  // PRO EDITOR STATE
  // --------------------------------------------------

  const layers = [];
  let selected = null;
  let dragging = false;

  let pointerStartX = 0;
  let pointerStartY = 0;
  let layerStartX = 0;
  let layerStartY = 0;

  // --------------------------------------------------
  // CREATE PANEL
  // --------------------------------------------------

  const panel = document.createElement("section");

  panel.id = "proEditor";

  panel.innerHTML = `
    <div class="pro-header">
      <h2>✨ Pro Editor</h2>
      <p>Add your photo and build your thumbnail.</p>
    </div>

    <label class="pro-upload-button">
      📷 Upload Your Photo
      <input
        id="proPhotoInput"
        type="file"
        accept="image/*"
        multiple
        hidden
      >
    </label>

    <div class="pro-status" id="proStatus">
      No photo selected
    </div>

    <div class="pro-tools">
      <button type="button" id="proRotateLeft">
        ↶ Rotate
      </button>

      <button type="button" id="proRotateRight">
        Rotate ↷
      </button>
    </div>

    <div class="pro-tools">
      <button type="button" id="proDuplicate">
        📋 Duplicate
      </button>

      <button type="button" id="proDelete">
        🗑️ Delete
      </button>
    </div>

    <label class="pro-control">
      Opacity
      <input
        id="proOpacity"
        type="range"
        min="0"
        max="100"
        value="100"
      >
    </label>

    <div class="pro-tip">
      💡 <strong>Tip:</strong>
      Upload a photo, then drag it around the canvas.
    </div>
  `;

  const controls =
    document.querySelector(".controls");

  if (controls) {
    controls.appendChild(panel);
  } else {
    document.body.appendChild(panel);
  }

  // --------------------------------------------------
  // STYLES
  // --------------------------------------------------

  const style = document.createElement("style");

  style.textContent = `
    #proEditor {
      margin-top: 20px;
      padding: 16px;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 14px;
    }

    #proEditor .pro-header h2 {
      margin: 0;
      font-size: 20px;
    }

    #proEditor .pro-header p {
      margin: 6px 0 16px;
      color: #9ca3af;
      font-size: 13px;
    }

    .pro-upload-button {
      display: block;
      width: 100%;
      padding: 15px;
      border-radius: 12px;
      background: #2563eb;
      color: white;
      text-align: center;
      font-weight: 800;
      cursor: pointer;
      transition: 0.2s;
    }

    .pro-upload-button:hover {
      background: #1d4ed8;
    }

    .pro-status {
      margin-top: 10px;
      padding: 9px;
      border-radius: 8px;
      background: #1f2937;
      color: #cbd5e1;
      font-size: 12px;
      text-align: center;
    }

    .pro-tools {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .pro-tools button {
      font-size: 12px;
    }

    .pro-control {
      display: block;
      margin-top: 15px;
      font-size: 13px;
      font-weight: 700;
    }

    .pro-control input {
      display: block;
      width: 100%;
      margin-top: 7px;
    }

    .pro-tip {
      margin-top: 15px;
      padding: 10px;
      border-radius: 9px;
      background: #1f2937;
      color: #cbd5e1;
      font-size: 12px;
      line-height: 1.5;
    }
  `;

  document.head.appendChild(style);

  // --------------------------------------------------
  // ELEMENTS
  // --------------------------------------------------

  const photoInput =
    document.getElementById("proPhotoInput");

  const status =
    document.getElementById("proStatus");

  const opacity =
    document.getElementById("proOpacity");

  // --------------------------------------------------
  // UPLOAD PHOTO
  // --------------------------------------------------

  photoInput.addEventListener("change", event => {
    const files =
      Array.from(event.target.files);

    files.forEach(file => {
      const reader =
        new FileReader();

      reader.onload = () => {
        const image =
          new Image();

        image.onload = () => {
          const maxWidth =
            canvas.width * 0.55;

          const maxHeight =
            canvas.height * 0.75;

          let width =
            image.width;

          let height =
            image.height;

          const scale =
            Math.min(
              maxWidth / width,
              maxHeight / height,
              1
            );

          width *= scale;
          height *= scale;

          const layer = {
            image,
            name: file.name,

            x:
              canvas.width / 2,

            y:
              canvas.height / 2,

            width,
            height,

            rotation: 0,

            opacity: 1
          };

          layers.push(layer);

          selected = layer;

          status.textContent =
            `Selected: ${file.name}`;

          opacity.value = 100;

          redraw();
        };

        image.src =
          reader.result;
      };

      reader.readAsDataURL(file);
    });

    photoInput.value = "";
  });

  // --------------------------------------------------
  // DRAW PRO LAYERS
  // --------------------------------------------------

  function drawLayer(layer) {
    const ctx =
      canvas.getContext("2d");

    ctx.save();

    ctx.translate(
      layer.x,
      layer.y
    );

    ctx.rotate(
      layer.rotation *
      Math.PI /
      180
    );

    ctx.globalAlpha =
      layer.opacity;

    ctx.drawImage(
      layer.image,
      -layer.width / 2,
      -layer.height / 2,
      layer.width,
      layer.height
    );

    ctx.restore();
  }

  // --------------------------------------------------
  // SELECTION
  // --------------------------------------------------

  function drawSelection(layer) {
    const ctx =
      canvas.getContext("2d");

    ctx.save();

    ctx.translate(
      layer.x,
      layer.y
    );

    ctx.rotate(
      layer.rotation *
      Math.PI /
      180
    );

    ctx.strokeStyle =
      "#60a5fa";

    ctx.lineWidth = 4;

    ctx.setLineDash([
      10,
      6
    ]);

    ctx.strokeRect(
      -layer.width / 2,
      -layer.height / 2,
      layer.width,
      layer.height
    );

    ctx.setLineDash([]);

    ctx.restore();
  }

  // --------------------------------------------------
  // REDRAW
  // --------------------------------------------------

  function redraw() {
    /*
      We intentionally do not clear the canvas here.
      The existing thumbnail editor remains responsible
      for its normal canvas rendering.
    */

    layers.forEach(drawLayer);

    if (selected) {
      drawSelection(selected);
    }
  }

  // --------------------------------------------------
  // FIND PHOTO
  // --------------------------------------------------

  function findLayer(x, y) {
    for (
      let i = layers.length - 1;
      i >= 0;
      i--
    ) {
      const layer =
        layers[i];

      if (
        x >=
          layer.x -
          layer.width / 2 &&
        x <=
          layer.x +
          layer.width / 2 &&
        y >=
          layer.y -
          layer.height / 2 &&
        y <=
          layer.y +
          layer.height / 2
      ) {
        return layer;
      }
    }

    return null;
  }

  // --------------------------------------------------
  // CANVAS POINTER
  // --------------------------------------------------

  canvas.addEventListener(
    "pointerdown",
    event => {
      const rect =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rect.left) *
        canvas.width /
        rect.width;

      const y =
        (event.clientY -
          rect.top) *
        canvas.height /
        rect.height;

      const layer =
        findLayer(x, y);

      if (!layer) {
        return;
      }

      selected = layer;

      dragging = true;

      pointerStartX = x;
      pointerStartY = y;

      layerStartX =
        layer.x;

      layerStartY =
        layer.y;

      status.textContent =
        `Selected: ${layer.name}`;

      canvas.setPointerCapture(
        event.pointerId
      );

      redraw();
    }
  );

  canvas.addEventListener(
    "pointermove",
    event => {
      if (
        !dragging ||
        !selected
      ) {
        return;
      }

      const rect =
        canvas.getBoundingClientRect();

      const x =
        (event.clientX -
          rect.left) *
        canvas.width /
        rect.width;

      const y =
        (event.clientY -
          rect.top) *
        canvas.height /
        rect.height;

      selected.x =
        layerStartX +
        (x - pointerStartX);

      selected.y =
        layerStartY +
        (y - pointerStartY);

      redraw();
    }
  );

  canvas.addEventListener(
    "pointerup",
    () => {
      dragging = false;
    }
  );

  // --------------------------------------------------
  // ROTATE
  // --------------------------------------------------

  document
    .getElementById(
      "proRotateLeft"
    )
    .addEventListener(
      "click",
      () => {
        if (!selected) return;

        selected.rotation -= 15;

        redraw();
      }
    );

  document
    .getElementById(
      "proRotateRight"
    )
    .addEventListener(
      "click",
      () => {
        if (!selected) return;

        selected.rotation += 15;

        redraw();
      }
    );

  // --------------------------------------------------
  // DUPLICATE
  // --------------------------------------------------

  document
    .getElementById(
      "proDuplicate"
    )
    .addEventListener(
      "click",
      () => {
        if (!selected) return;

        const copy = {
          ...selected,

          x:
            selected.x + 40,

          y:
            selected.y + 40
        };

        layers.push(copy);

        selected = copy;

        status.textContent =
          `Selected: ${copy.name}`;

        redraw();
      }
    );

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  document
    .getElementById(
      "proDelete"
    )
    .addEventListener(
      "click",
      () => {
        if (!selected) return;

        const index =
          layers.indexOf(
            selected
          );

        if (index !== -1) {
          layers.splice(
            index,
            1
          );
        }

        selected = null;

        status.textContent =
          "No photo selected";

        redraw();
      }
    );

  // --------------------------------------------------
  // OPACITY
  // --------------------------------------------------

  opacity.addEventListener(
    "input",
    event => {
      if (!selected) return;

      selected.opacity =
        Number(
          event.target.value
        ) / 100;

      redraw();
    }
  );

  console.log(
    "✨ Pro Editor loaded successfully."
  );
})();
}