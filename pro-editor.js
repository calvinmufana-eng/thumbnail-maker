/* =========================================
   THUMBNAIL MAKER — PRO EDITOR
   Step 4A: Advanced image layers
   ========================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("thumbnailCanvas");

  if (!canvas) {
    console.error("Thumbnail Maker: canvas not found.");
    return;
  }

  const ctx = canvas.getContext("2d");

  // Keep the Pro Editor separate from the original editor.
  const proLayers = [];

  let selectedLayer = null;
  let dragging = false;
  let resizing = false;
  let rotating = false;

  let startX = 0;
  let startY = 0;

  let startLayerX = 0;
  let startLayerY = 0;

  let startWidth = 0;
  let startHeight = 0;

  let startRotation = 0;

  // -----------------------------------------
  // Create the Pro Editor panel
  // -----------------------------------------

  const panel = document.createElement("div");

  panel.id = "proEditorPanel";

  panel.innerHTML = `
    <div class="pro-editor-title">
      <h2>Pro Editor</h2>
      <p>Add and transform image layers.</p>
    </div>

    <label class="pro-upload">
      Add Photo
      <input
        id="proImageInput"
        type="file"
        accept="image/*"
        multiple
      >
    </label>

    <div class="pro-buttons">
      <button id="proDuplicate">Duplicate</button>
      <button id="proDelete">Delete</button>
    </div>

    <div class="pro-buttons">
      <button id="proRotateLeft">↶ Rotate</button>
      <button id="proRotateRight">Rotate ↷</button>
    </div>

    <label>
      Opacity
      <input
        id="proOpacity"
        type="range"
        min="0"
        max="100"
        value="100"
      >
    </label>

    <div class="pro-info">
      <strong>Selected layer</strong>
      <span id="proSelectedName">None</span>
    </div>

    <div class="pro-help">
      <strong>How to use</strong>
      <p>
        Upload a photo, tap it on the canvas,
        then drag it to move it.
      </p>
      <p>
        Use the buttons to rotate, duplicate,
        or delete the selected photo.
      </p>
    </div>
  `;

  const workspace = document.querySelector(".workspace");

  if (workspace) {
    const controls = document.querySelector(".controls");

    if (controls) {
      controls.appendChild(panel);
    } else {
      workspace.appendChild(panel);
    }
  }

  // -----------------------------------------
  // Image upload
  // -----------------------------------------

  const imageInput =
    document.getElementById("proImageInput");

  imageInput.addEventListener("change", event => {
    const files = Array.from(event.target.files);

    files.forEach(file => {
      const reader = new FileReader();

      reader.onload = readerEvent => {
        const image = new Image();

        image.onload = () => {
          const maxSize =
            Math.min(canvas.width, canvas.height) * 0.65;

          let width = image.width;
          let height = image.height;

          const ratio = width / height;

          if (width > maxSize) {
            width = maxSize;
            height = width / ratio;
          }

          if (height > maxSize) {
            height = maxSize;
            width = height * ratio;
          }

          const layer = {
            id:
              Date.now() +
              Math.random(),

            name: file.name,

            image,

            x: canvas.width / 2,
            y: canvas.height / 2,

            width,
            height,

            rotation: 0,

            opacity: 1
          };

          proLayers.push(layer);

          selectedLayer = layer;

          updateSelectedInfo();

          render();

          console.log(
            "Pro Editor: image added",
            layer.name
          );
        };

        image.src = readerEvent.target.result;
      };

      reader.readAsDataURL(file);
    });

    imageInput.value = "";
  });

  // -----------------------------------------
  // Draw image layer
  // -----------------------------------------

  function drawLayer(layer) {
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

    if (layer === selectedLayer) {
      drawSelection(layer);
    }
  }

  // -----------------------------------------
  // Selection box
  // -----------------------------------------

  function drawSelection(layer) {
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
      "#3b82f6";

    ctx.lineWidth = 4;

    ctx.setLineDash([
      10,
      7
    ]);

    ctx.strokeRect(
      -layer.width / 2,
      -layer.height / 2,
      layer.width,
      layer.height
    );

    ctx.setLineDash([]);

    // Resize handle
    ctx.fillStyle =
      "#3b82f6";

    ctx.fillRect(
      layer.width / 2 - 10,
      layer.height / 2 - 10,
      20,
      20
    );

    // Rotation handle
    ctx.beginPath();

    ctx.arc(
      0,
      -layer.height / 2 - 35,
      10,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // -----------------------------------------
  // Render
  // -----------------------------------------

  function render() {
    /*
      The original editor already draws the
      background and its own elements.

      We only draw Pro Editor layers here.
    */

    proLayers.forEach(layer => {
      drawLayer(layer);
    });
  }

  // -----------------------------------------
  // Canvas coordinates
  // -----------------------------------------

  function getPosition(event) {
    const rect =
      canvas.getBoundingClientRect();

    return {
      x:
        (event.clientX -
          rect.left) *
        (canvas.width /
          rect.width),

      y:
        (event.clientY -
          rect.top) *
        (canvas.height /
          rect.height)
    };
  }

  // -----------------------------------------
  // Hit detection
  // -----------------------------------------

  function findLayer(x, y) {
    for (
      let i =
        proLayers.length - 1;
      i >= 0;
      i--
    ) {
      const layer =
        proLayers[i];

      const left =
        layer.x -
        layer.width / 2;

      const right =
        layer.x +
        layer.width / 2;

      const top =
        layer.y -
        layer.height / 2;

      const bottom =
        layer.y +
        layer.height / 2;

      if (
        x >= left &&
        x <= right &&
        y >= top &&
        y <= bottom
      ) {
        return layer;
      }
    }

    return null;
  }

  // -----------------------------------------
  // Pointer down
  // -----------------------------------------

  canvas.addEventListener(
    "pointerdown",
    event => {
      const position =
        getPosition(event);

      const layer =
        findLayer(
          position.x,
          position.y
        );

      if (!layer) {
        selectedLayer = null;

        updateSelectedInfo();

        return;
      }

      selectedLayer =
        layer;

      dragging = true;

      startX =
        position.x;

      startY =
        position.y;

      startLayerX =
        layer.x;

      startLayerY =
        layer.y;

      canvas.setPointerCapture(
        event.pointerId
      );

      updateSelectedInfo();

      event.stopPropagation();
    },
    true
  );

  // -----------------------------------------
  // Pointer move
  // -----------------------------------------

  canvas.addEventListener(
    "pointermove",
    event => {
      if (
        !dragging ||
        !selectedLayer
      ) {
        return;
      }

      const position =
        getPosition(event);

      const dx =
        position.x -
        startX;

      const dy =
        position.y -
        startY;

      selectedLayer.x =
        startLayerX + dx;

      selectedLayer.y =
        startLayerY + dy;

      render();

      event.stopPropagation();
    },
    true
  );

  // -----------------------------------------
  // Pointer up
  // -----------------------------------------

  canvas.addEventListener(
    "pointerup",
    event => {
      if (!dragging) return;

      dragging = false;

      try {
        canvas.releasePointerCapture(
          event.pointerId
        );
      } catch {}

      event.stopPropagation();
    },
    true
  );

  // -----------------------------------------
  // Duplicate
  // -----------------------------------------

  document
    .getElementById("proDuplicate")
    .addEventListener(
      "click",
      () => {
        if (!selectedLayer) return;

        const copy = {
          ...selectedLayer,

          id:
            Date.now() +
            Math.random(),

          x:
            selectedLayer.x +
            40,

          y:
            selectedLayer.y +
            40
        };

        proLayers.push(copy);

        selectedLayer =
          copy;

        updateSelectedInfo();

        render();
      }
    );

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  document
    .getElementById("proDelete")
    .addEventListener(
      "click",
      () => {
        if (!selectedLayer) return;

        const index =
          proLayers.indexOf(
            selectedLayer
          );

        if (index !== -1) {
          proLayers.splice(
            index,
            1
          );
        }

        selectedLayer = null;

        updateSelectedInfo();

        render();
      }
    );

  // -----------------------------------------
  // Rotate left
  // -----------------------------------------

  document
    .getElementById("proRotateLeft")
    .addEventListener(
      "click",
      () => {
        if (!selectedLayer) return;

        selectedLayer.rotation -= 15;

        render();
      }
    );

  // -----------------------------------------
  // Rotate right
  // -----------------------------------------

  document
    .getElementById("proRotateRight")
    .addEventListener(
      "click",
      () => {
        if (!selectedLayer) return;

        selectedLayer.rotation += 15;

        render();
      }
    );

  // -----------------------------------------
  // Opacity
  // -----------------------------------------

  document
    .getElementById("proOpacity")
    .addEventListener(
      "input",
      event => {
        if (!selectedLayer) return;

        selectedLayer.opacity =
          Number(event.target.value) /
          100;

        render();
      }
    );

  // -----------------------------------------
  // Selected layer information
  // -----------------------------------------

  function updateSelectedInfo() {
    const name =
      document.getElementById(
        "proSelectedName"
      );

    if (!name) return;

    if (!selectedLayer) {
      name.textContent =
        "None";

      return;
    }

    name.textContent =
      selectedLayer.name;
  }

  // -----------------------------------------
  // Make the Pro Editor visible
  // -----------------------------------------

  panel.style.marginTop =
    "20px";

  panel.style.padding =
    "16px";

  panel.style.border =
    "1px solid #292e38";

  panel.style.borderRadius =
    "12px";

  panel.style.background =
    "#11151c";

  // -----------------------------------------
  // Initial state
  // -----------------------------------------

  console.log(
    "Thumbnail Maker Pro Editor loaded."
  );
})();