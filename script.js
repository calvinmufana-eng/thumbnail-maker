const canvas = document.getElementById("thumbnailCanvas");
const ctx = canvas.getContext("2d");

const imageInput = document.getElementById("imageInput");
const titleInput = document.getElementById("titleInput");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontSizeValue = document.getElementById("fontSizeValue");
const textColorInput = document.getElementById("textColorInput");
const backgroundInput = document.getElementById("backgroundInput");
const shadowInput = document.getElementById("shadowInput");

const formatInput = document.getElementById("formatInput");
const canvasSizeLabel = document.getElementById("canvasSizeLabel");

const brightnessInput = document.getElementById("brightnessInput");
const contrastInput = document.getElementById("contrastInput");
const saturationInput = document.getElementById("saturationInput");
const blurInput = document.getElementById("blurInput");

const layersList = document.getElementById("layersList");

let backgroundImage = null;
let elements = [];
let selectedId = null;

let history = [];
let historyIndex = -1;

let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

const formats = {
  youtube: { width: 1280, height: 720 },
  shorts: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 }
};

function createId() {
  return Date.now() + Math.random();
}

function getSelectedElement() {
  return elements.find(element => element.id === selectedId);
}

function updateFontSizeLabel() {
  fontSizeValue.textContent = `${fontSizeInput.value}px`;
}

function saveState() {
  const state = JSON.stringify({
    elements,
    backgroundColor: backgroundInput.value,
    brightness: brightnessInput.value,
    contrast: contrastInput.value,
    saturation: saturationInput.value,
    blur: blurInput.value,
    title: titleInput.value,
    fontSize: fontSizeInput.value,
    textColor: textColorInput.value,
    shadow: shadowInput.checked
  });

  history = history.slice(0, historyIndex + 1);
  history.push(state);
  historyIndex = history.length - 1;

  if (history.length > 50) {
    history.shift();
    historyIndex--;
  }
}

function restoreState(state) {
  const data = JSON.parse(state);

  elements = data.elements || [];
  backgroundInput.value = data.backgroundColor || "#202020";
  brightnessInput.value = data.brightness || 100;
  contrastInput.value = data.contrast || 100;
  saturationInput.value = data.saturation || 100;
  blurInput.value = data.blur || 0;
  titleInput.value = data.title || "YOUR THUMBNAIL TITLE";
  fontSizeInput.value = data.fontSize || 70;
  textColorInput.value = data.textColor || "#ffffff";
  shadowInput.checked = data.shadow !== false;

  selectedId = null;

  updateFontSizeLabel();
  renderLayers();
  draw();
}

function undo() {
  if (historyIndex <= 0) return;

  historyIndex--;
  restoreState(history[historyIndex]);
}

function redo() {
  if (historyIndex >= history.length - 1) return;

  historyIndex++;
  restoreState(history[historyIndex]);
}

function setCanvasSize(width, height) {
  canvas.width = width;
  canvas.height = height;

  canvasSizeLabel.textContent = `${width} × ${height}`;

  draw();
}

function addElement(type, properties = {}) {
  const element = {
    id: createId(),
    type,
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: properties.width || 250,
    height: properties.height || 100,
    rotation: 0,
    text: properties.text || "NEW TEXT",
    color: properties.color || "#ffffff",
    fontSize: properties.fontSize || 70,
    stroke: properties.stroke || "#000000",
    strokeWidth: properties.strokeWidth || 5,
    fill: properties.fill || "#ff0000",
    opacity: 1,
    ...properties
  };

  elements.push(element);
  selectedId = element.id;

  renderLayers();
  draw();
  saveState();
}

function drawBackground() {
  ctx.save();

  ctx.fillStyle = backgroundInput.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (backgroundImage) {
    ctx.filter =
      `brightness(${brightnessInput.value}%) ` +
      `contrast(${contrastInput.value}%) ` +
      `saturate(${saturationInput.value}%) ` +
      `blur(${blurInput.value}px)`;

    const imageRatio =
      backgroundImage.width / backgroundImage.height;

    const canvasRatio =
      canvas.width / canvas.height;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if (imageRatio > canvasRatio) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imageRatio;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = canvas.width;
      drawHeight = drawWidth / imageRatio;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(
      backgroundImage,
      drawX,
      drawY,
      drawWidth,
      drawHeight
    );
  }

  ctx.restore();
}

function drawElement(element) {
  ctx.save();

  ctx.translate(element.x, element.y);
  ctx.rotate((element.rotation || 0) * Math.PI / 180);
  ctx.globalAlpha = element.opacity ?? 1;

  if (element.type === "text") {
    ctx.font =
      `700 ${element.fontSize}px Arial, Helvetica, sans-serif`;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (shadowInput.checked) {
      ctx.shadowColor = "rgba(0,0,0,0.75)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
    }

    ctx.lineWidth = element.strokeWidth || 5;
    ctx.strokeStyle = element.stroke || "#000000";
    ctx.strokeText(element.text, 0, 0);

    ctx.fillStyle = element.color || "#ffffff";
    ctx.fillText(element.text, 0, 0);
  }

  if (element.type === "arrow") {
    const length = element.width || 300;
    const head = 35;

    ctx.strokeStyle = element.color || "#ff0000";
    ctx.fillStyle = element.color || "#ff0000";
    ctx.lineWidth = element.strokeWidth || 18;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(length / 2, 0);
    ctx.lineTo(length / 2 - head, -head);
    ctx.lineTo(length / 2 - head, head);
    ctx.closePath();
    ctx.fill();
  }

  if (element.type === "circle") {
    const radius =
      Math.min(element.width, element.height) / 2;

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);

    ctx.strokeStyle = element.color || "#ff0000";
    ctx.lineWidth = element.strokeWidth || 12;
    ctx.stroke();
  }

  if (element.type === "rectangle") {
    ctx.fillStyle = element.fill || "#ff0000";

    ctx.fillRect(
      -element.width / 2,
      -element.height / 2,
      element.width,
      element.height
    );

    ctx.strokeStyle = element.color || "#ffffff";
    ctx.lineWidth = element.strokeWidth || 5;

    ctx.strokeRect(
      -element.width / 2,
      -element.height / 2,
      element.width,
      element.height
    );
  }

  if (element.type === "emoji") {
    ctx.font = `${element.fontSize || 100}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(element.text || "🔥", 0, 0);
  }

  ctx.restore();

  if (element.id === selectedId) {
    drawSelectionBox(element);
  }
}

function drawSelectionBox(element) {
  ctx.save();

  ctx.translate(element.x, element.y);
  ctx.rotate((element.rotation || 0) * Math.PI / 180);

  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);

  const width = element.width || 250;
  const height =
    element.height || element.fontSize || 100;

  ctx.strokeRect(
    -width / 2,
    -height / 2,
    width,
    height
  );

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  elements.forEach(element => {
    drawElement(element);
  });
}

function renderLayers() {
  layersList.innerHTML = "";

  if (elements.length === 0) {
    layersList.innerHTML =
      `<div class="empty-layers">No additional layers yet.</div>`;
    return;
  }

  [...elements].reverse().forEach(element => {
    const item = document.createElement("div");

    item.className = "layer-item";

    if (element.id === selectedId) {
      item.style.outline = "2px solid #2563eb";
    }

    let name = element.type;

    if (element.type === "text") {
      name = element.text || "Text";
    }

    if (element.type === "emoji") {
      name = `Emoji ${element.text}`;
    }

    item.textContent = name;

    item.addEventListener("click", () => {
      selectedId = element.id;
      renderLayers();
      draw();
    });

    layersList.appendChild(item);
  });
}

function getCanvasPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x:
      (event.clientX - rect.left) *
      (canvas.width / rect.width),

    y:
      (event.clientY - rect.top) *
      (canvas.height / rect.height)
  };
}

function isPointInsideElement(x, y, element) {
  const width = element.width || 250;
  const height =
    element.height || element.fontSize || 100;

  return (
    x >= element.x - width / 2 &&
    x <= element.x + width / 2 &&
    y >= element.y - height / 2 &&
    y <= element.y + height / 2
  );
}

canvas.addEventListener("pointerdown", event => {
  const position = getCanvasPosition(event);

  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];

    if (
      isPointInsideElement(
        position.x,
        position.y,
        element
      )
    ) {
      selectedId = element.id;
      dragging = true;

      dragOffsetX =
        position.x - element.x;

      dragOffsetY =
        position.y - element.y;

      canvas.setPointerCapture(event.pointerId);

      renderLayers();
      draw();

      break;
    }
  }
});

canvas.addEventListener("pointermove", event => {
  if (!dragging) return;

  const element = getSelectedElement();

  if (!element) return;

  const position = getCanvasPosition(event);

  element.x =
    position.x - dragOffsetX;

  element.y =
    position.y - dragOffsetY;

  draw();
});

canvas.addEventListener("pointerup", event => {
  if (!dragging) return;

  dragging = false;

  try {
    canvas.releasePointerCapture(event.pointerId);
  } catch {}

  saveState();
});

imageInput.addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = event => {
    const image = new Image();

    image.onload = () => {
      backgroundImage = image;
      draw();
      saveState();
    };

    image.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

titleInput.addEventListener("input", () => {
  let title = elements.find(
    element => element.id === "main-title"
  );

  if (!title) {
    title = {
      id: "main-title",
      type: "text",
      x: canvas.width / 2,
      y: canvas.height - 110,
      width: canvas.width * 0.85,
      height: 120,
      rotation: 0,
      text: "",
      color: textColorInput.value,
      fontSize: Number(fontSizeInput.value),
      stroke: "#000000",
      strokeWidth: 6,
      opacity: 1
    };

    elements.push(title);
  }

  title.text = titleInput.value;
  title.color = textColorInput.value;
  title.fontSize = Number(fontSizeInput.value);

  draw();
});

fontSizeInput.addEventListener("input", () => {
  updateFontSizeLabel();

  const title = elements.find(
    element => element.id === "main-title"
  );

  if (title) {
    title.fontSize =
      Number(fontSizeInput.value);

    draw();
  }
});

textColorInput.addEventListener("input", () => {
  const title = elements.find(
    element => element.id === "main-title"
  );

  if (title) {
    title.color =
      textColorInput.value;

    draw();
  }
});

backgroundInput.addEventListener("input", draw);
shadowInput.addEventListener("change", draw);

brightnessInput.addEventListener("input", draw);
contrastInput.addEventListener("input", draw);
saturationInput.addEventListener("input", draw);
blurInput.addEventListener("input", draw);

formatInput.addEventListener("change", () => {
  if (formatInput.value === "custom") {
    const width = Number(
      prompt("Enter canvas width:", "1280")
    );

    const height = Number(
      prompt("Enter canvas height:", "720")
    );

    if (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
    ) {
      setCanvasSize(width, height);
    }

    return;
  }

  const format = formats[formatInput.value];

  if (format) {
    setCanvasSize(
      format.width,
      format.height
    );
  }
});

document
  .getElementById("addTextBtn")
  .addEventListener("click", () => {
    addElement("text", {
      text: "NEW TEXT",
      fontSize: 70,
      width: 350,
      height: 100,
      color: "#ffffff",
      stroke: "#000000",
      strokeWidth: 6
    });
  });

document
  .getElementById("addArrowBtn")
  .addEventListener("click", () => {
    addElement("arrow", {
      width: 300,
      height: 70,
      color: "#ff0000",
      strokeWidth: 18
    });
  });

document
  .getElementById("addCircleBtn")
  .addEventListener("click", () => {
    addElement("circle", {
      width: 220,
      height: 220,
      color: "#ff0000",
      strokeWidth: 12
    });
  });

document
  .getElementById("addRectangleBtn")
  .addEventListener("click", () => {
    addElement("rectangle", {
      width: 300,
      height: 150,
      fill: "#ff0000",
      color: "#ffffff",
      strokeWidth: 5
    });
  });

document
  .getElementById("addEmojiBtn")
  .addEventListener("click", () => {
    const emoji = prompt(
      "Enter an emoji:",
      "🔥"
    );

    if (emoji) {
      addElement("emoji", {
        text: emoji,
        width: 120,
        height: 120,
        fontSize: 100
      });
    }
  });

document
  .getElementById("undoBtn")
  .addEventListener("click", undo);

document
  .getElementById("redoBtn")
  .addEventListener("click", redo);

document
  .getElementById("resetBtn")
  .addEventListener("click", () => {
    if (
      !confirm(
        "Reset the canvas and remove all elements?"
      )
    ) {
      return;
    }

    elements = [];
    selectedId = null;
    backgroundImage = null;

    backgroundInput.value = "#202020";
    brightnessInput.value = 100;
    contrastInput.value = 100;
    saturationInput.value = 100;
    blurInput.value = 0;

    titleInput.value =
      "YOUR THUMBNAIL TITLE";

    draw();
    renderLayers();
    saveState();
  });

document
  .getElementById("deleteBtn")
  .addEventListener("click", () => {
    if (!selectedId) return;

    elements = elements.filter(
      element => element.id !== selectedId
    );

    selectedId = null;

    renderLayers();
    draw();
    saveState();
  });

document
  .getElementById("duplicateBtn")
  .addEventListener("click", () => {
    const selected = getSelectedElement();

    if (!selected) return;

    const copy = {
      ...selected,
      id: createId(),
      x: selected.x + 30,
      y: selected.y + 30
    };

    elements.push(copy);
    selectedId = copy.id;

    renderLayers();
    draw();
    saveState();
  });

document
  .getElementById("bringForwardBtn")
  .addEventListener("click", () => {
    const index = elements.findIndex(
      element => element.id === selectedId
    );

    if (
      index === -1 ||
      index === elements.length - 1
    ) {
      return;
    }

    const temp = elements[index];

    elements[index] =
      elements[index + 1];

    elements[index + 1] = temp;

    renderLayers();
    draw();
    saveState();
  });

document
  .getElementById("sendBackwardBtn")
  .addEventListener("click", () => {
    const index = elements.findIndex(
      element => element.id === selectedId
    );

    if (index <= 0) return;

    const temp = elements[index];

    elements[index] =
      elements[index - 1];

    elements[index - 1] = temp;

    renderLayers();
    draw();
    saveState();
  });

document
  .getElementById("downloadPngBtn")
  .addEventListener("click", () => {
    downloadImage("png");
  });

document
  .getElementById("downloadJpgBtn")
  .addEventListener("click", () => {
    downloadImage("jpeg");
  });

function downloadImage(type) {
  draw();

  const link = document.createElement("a");

  link.download =
    type === "png"
      ? "thumbnail-maker.png"
      : "thumbnail-maker.jpg";

  link.href =
    canvas.toDataURL(
      `image/${type}`,
      0.95
    );

  link.click();
}

updateFontSizeLabel();

addElement("text", {
  id: "main-title",
  text: "YOUR THUMBNAIL TITLE",
  x: canvas.width / 2,
  y: canvas.height - 110,
  width: canvas.width * 0.85,
  height: 120,
  fontSize: 70,
  color: "#ffffff",
  stroke: "#000000",
  strokeWidth: 6
});

saveState();
draw();
renderLayers();
    
