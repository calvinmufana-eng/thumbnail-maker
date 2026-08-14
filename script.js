const canvas = document.getElementById("thumbnailCanvas");
const ctx = canvas.getContext("2d");

const imageInput = document.getElementById("imageInput");
const titleInput = document.getElementById("titleInput");
const fontSizeInput = document.getElementById("fontSizeInput");
const fontSizeValue = document.getElementById("fontSizeValue");
const textColorInput = document.getElementById("textColorInput");
const backgroundInput = document.getElementById("backgroundInput");
const shadowInput = document.getElementById("shadowInput");
const downloadBtn = document.getElementById("downloadBtn");

let uploadedImage = null;

function drawThumbnail() {
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = backgroundInput.value;
  ctx.fillRect(0, 0, width, height);

  if (uploadedImage) {
    const imageRatio = uploadedImage.width / uploadedImage.height;
    const canvasRatio = width / height;
    let drawWidth, drawHeight, x, y;

    if (imageRatio > canvasRatio) {
      drawHeight = height;
      drawWidth = height * imageRatio;
      x = (width - drawWidth) / 2;
      y = 0;
    } else {
      drawWidth = width;
      drawHeight = width / imageRatio;
      x = 0;
      y = (height - drawHeight) / 2;
    }

    ctx.drawImage(uploadedImage, x, y, drawWidth, drawHeight);
  }

  const title = titleInput.value.trim() || "YOUR THUMBNAIL TITLE";
  const fontSize = Number(fontSizeInput.value);

  ctx.font = `900 ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (shadowInput.checked) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
  } else {
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  ctx.fillStyle = textColorInput.value;

  // Keep long titles readable by wrapping them.
  const maxWidth = width * 0.88;
  const words = title.split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  const lineHeight = fontSize * 1.1;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((text, index) => {
    ctx.fillText(text, width / 2, startY + index * lineHeight);
  });

  ctx.shadowColor = "transparent";
}

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      uploadedImage = image;
      drawThumbnail();
    };
    image.src = reader.result;
  };

  reader.readAsDataURL(file);
});

titleInput.addEventListener("input", drawThumbnail);

fontSizeInput.addEventListener("input", () => {
  fontSizeValue.textContent = `${fontSizeInput.value}px`;
  drawThumbnail();
});

textColorInput.addEventListener("input", drawThumbnail);
backgroundInput.addEventListener("input", drawThumbnail);
shadowInput.addEventListener("change", drawThumbnail);

downloadBtn.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "thumbnail.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

drawThumbnail();
