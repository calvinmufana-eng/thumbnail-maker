(() => {
  "use strict";

  if (window.__PRO_EDITOR_LOADED__) {
    console.log("Pro Editor already loaded.");
    return;
  }

  window.__PRO_EDITOR_LOADED__ = true;

  const canvas = document.getElementById("thumbnailCanvas");

  if (!canvas) {
    console.error("Pro Editor: canvas not found.");
    return;
  }

  const ctx = canvas.getContext("2d");

  const layers = [];
  let selected = null;
  let dragging = false;

  let startX = 0;
  let startY = 0;
  let startLayerX = 0;
  let startLayerY = 0;

  // ==========================================
  // PRO EDITOR PANEL
  // ==========================================

  const oldPanel = document.getElementById("proEditor");

  if (oldPanel) {
    oldPanel.remove();
  }

  const panel = document.createElement("section");

  panel.id = "proEditor";

  panel.innerHTML = `
    <div class="pro-header">
      <h2>✨ Pro Editor</h2>
      <p>Edit photos directly on your thumbnail.</p>
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

    <div id="proStatus" class="pro-status">
      No photo selected
    </div>

    <div class="pro-grid">

      <button id="proRotateLeft">
        ↶ Rotate
      </button>

      <button id="proRotateRight">
        Rotate ↷
      </button>

      <button id="proFlipH">
        ↔️ Flip
      </button>

      <button id="proFlipV">
        ↕️ Flip
      </button>

      <button id="proDuplicate">
        📋 Duplicate
      </button>

      <button id="proDelete">
        🗑️ Delete
      </button>

    </div>

    <label class="pro-control">
      Opacity:
      <strong id="proOpacityValue">100%</strong>

      <input
        id="proOpacity"
        type="range"
        min="0"
        max="100"
        value="100"
      >
    </label>

    <div class="pro-help">
      <strong>How to edit</strong>

      <p>
        Upload a photo and drag it around
        the canvas.
      </p>

      <p>
        Select a photo to rotate, flip,
        duplicate or delete it.
      </p>

      <p>
        Use the opacity slider to make
        the photo transparent.
      </p>
    </div>
  `;

  const controls = document.querySelector(".controls");

  if (controls) {
    controls.appendChild(panel);
  } else {
    document.body.appendChild(panel);
  }

  // ==========================================
  // STYLES
  // ==========================================

  const style = document.createElement("style");

  style.textContent = `
    #proEditor {
      margin-top: 20px;
      padding: 16px;
      background: #111827;
      border: 1px solid #374151;
      border-radius: 14px;
    }

    #proEditor h2 {
      margin: 0;
      font-size: 20px;
    }

    #proEditor p {
      color: #9ca3af;
      font-size: 13px;
    }

    .pro-upload-button {
      display: block;
      width: 100%;
      padding: 16px;
      margin-top: 15px;
      border-radius: 12px;
      background: #2563eb;
      color: white;
      text-align: center;
      font-weight: 800;
      cursor: pointer;
    }

    .pro-upload-button:hover {
      background: #1d4ed8;
    }

    .pro-status {
      margin-top: 10px;
      padding: 9px;
      background: #1f2937;
      border-radius: 8px;
      color: #cbd5e1;
      font-size: 12px;
      text-align: center;
    }

    .pro-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 12px;
    }

    .pro-grid button {
      margin-top: 0;
      background: #374151;
      font-size: 12px;
    }

    .pro-grid button:hover {
      background: #4b5563;
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

    .pro-help {
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

  // ==========================================
  // ELEMENTS
  // ==========================================

  const photoInput =
    document.getElementById("proPhotoInput");

  const status =
    document.getElementById("proStatus");

  const opacity =
    document.getElementById("proOpacity");

  const opacityValue =
    document.getElementById("proOpacityValue");

  // ==========================================
  // UPLOAD
  // ==========================================

  photoInput.addEventListener("change", event => {

    const files = Array.from(event.target.files);

    files.forEach(file => {

      const reader = new FileReader();

      reader.onload = () => {

        const image = new Image();

        image.onload = () => {

          const maxWidth = canvas.width * 0.55;
          const maxHeight = canvas.height * 0.75;

          let width = image.width;
          let height = image.height;

          const scale = Math.min(
            maxWidth / width,
            maxHeight / height,
            1
          );

          width *= scale;
          height *= scale;

          const layer = {
            image: image,
            name: file.name,

            x: canvas.width / 2,
            y: canvas.height / 2,

            width: width,
            height: height,

            rotation: 0,
            scaleX: 1,
            scaleY: 1,

            opacity: 1
          };

          layers.push(layer);

          selected = layer;

          status.textContent =
            `Selected: ${file.name}`;

          opacity.value = 100;
          opacityValue.textContent = "100%";

          render();
        };

        image.src = reader.result;
      };

      reader.readAsDataURL(file);
    });

    photoInput.value = "";
  });

  // ==========================================
  // DRAW
  // ==========================================

  function drawLayer(layer) {

    ctx.save();

    ctx.translate(layer.x, layer.y);

    ctx.rotate(
      layer.rotation * Math.PI / 180
    );

    ctx.scale(
      layer.scaleX,
      layer.scaleY
    );

    ctx.globalAlpha = layer.opacity;

    ctx.drawImage(
      layer.image,
      -layer.width / 2,
      -layer.height / 2,
      layer.width,
      layer.height
    );

    ctx.restore();
  }

  // ==========================================
  // SELECTION BOX
  // ==========================================

  function drawSelection(layer) {

    ctx.save();

    ctx.translate(layer.x, layer.y);

    ctx.rotate(
      layer.rotation * Math.PI / 180
    );

    ctx.scale(
      layer.scaleX,
      layer.scaleY
    );

    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 6]);

    ctx.strokeRect(
      -layer.width / 2,
      -layer.height / 2,
      layer.width,
      layer.height
    );

    ctx.setLineDash([]);

    ctx.fillStyle = "#60a5fa";

    ctx.fillRect(
      layer.width / 2 - 12,
      layer.height / 2 - 12,
      24,
      24
    );

    ctx.restore();
  }

  // ==========================================
  // RENDER
  // ==========================================

  function render() {

    layers.forEach(drawLayer);

    if (selected) {
      drawSelection(selected);
    }
  }

  // ==========================================
  // FIND POSITION
  // ==========================================

  function getPosition(event) {

    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        (event.clientX - rect.left) *
        canvas.width /
        rect.width,

      y:
        (event.clientY - rect.top) *
        canvas.height /
        rect.height
    };
  }

  // ==========================================
  // FIND LAYER
  // ==========================================

  function findLayer(x, y) {

    for (
      let i = layers.length - 1;
      i >= 0;
      i--
    ) {

      const layer = layers[i];

      const width =
        layer.width *
        Math.abs(layer.scaleX);

      const height =
        layer.height *
        Math.abs(layer.scaleY);

      if (
        x >= layer.x - width / 2 &&
        x <= layer.x + width / 2 &&
        y >= layer.y - height / 2 &&
        y <= layer.y + height / 2
      ) {
        return layer;
      }
    }

    return null;
  }

  // ==========================================
  // MOVE PHOTO
  // ==========================================

  canvas.addEventListener(
    "pointerdown",
    event => {

      const pos = getPosition(event);

      const layer =
        findLayer(pos.x, pos.y);

      if (!layer) {
        return;
      }

      selected = layer;

      dragging = true;

      startX = pos.x;
      startY = pos.y;

      startLayerX = layer.x;
      startLayerY = layer.y;

      status.textContent =
        `Selected: ${layer.name}`;

      canvas.setPointerCapture(
        event.pointerId
      );

      render();
    },
    true
  );

  canvas.addEventListener(
    "pointermove",
    event => {

      if (!dragging || !selected) {
        return;
      }

      const pos = getPosition(event);

      selected.x =
        startLayerX +
        pos.x -
        startX;

      selected.y =
        startLayerY +
        pos.y -
        startY;

      render();
    },
    true
  );

  canvas.addEventListener(
    "pointerup",
    event => {

      dragging = false;

      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch {}
    },
    true
  );

  // ==========================================
  // ROTATE
  // ==========================================

  document
    .getElementById("proRotateLeft")
    .onclick = () => {

      if (!selected) return;

      selected.rotation -= 15;

      render();
    };

  document
    .getElementById("proRotateRight")
    .onclick = () => {

      if (!selected) return;

      selected.rotation += 15;

      render();
    };

  // ==========================================
  // FLIP
  // ==========================================

  document
    .getElementById("proFlipH")
    .onclick = () => {

      if (!selected) return;

      selected.scaleX *= -1;

      render();
    };

  document
    .getElementById("proFlipV")
    .onclick = () => {

      if (!selected) return;

      selected.scaleY *= -1;

      render();
    };

  // ==========================================
  // DUPLICATE
  // ==========================================

  document
    .getElementById("proDuplicate")
    .onclick = () => {

      if (!selected) return;

      const copy = {
        ...selected,

        x: selected.x + 40,
        y: selected.y + 40
      };

      layers.push(copy);

      selected = copy;

      status.textContent =
        `Selected: ${copy.name}`;

      render();
    };

  // ==========================================
  // DELETE
  // ==========================================

  document
    .getElementById("proDelete")
    .onclick = () => {

      if (!selected) return;

      const index =
        layers.indexOf(selected);

      if (index !== -1) {
        layers.splice(index, 1);
      }

      selected = null;

      status.textContent =
        "No photo selected";

      opacity.value = 100;
      opacityValue.textContent = "100%";

      render();
    };

  // ==========================================
  // OPACITY
  // ==========================================

  opacity.addEventListener("input", () => {

    const value =
      Number(opacity.value);

    opacityValue.textContent =
      value + "%";

    if (selected) {

      selected.opacity =
        value / 100;

      render();
    }
  });

  // ==========================================
// PUBLIC PRO EDITOR API
// ==========================================

window.ProEditor = {
  getSelected() {
    return selected;
  },

  render() {
    render();
  }
};

console.log(
  "✨ Pro Editor loaded successfully."
);

})();
