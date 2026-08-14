(() => {
  "use strict";

  if (window.__PRO_TRANSFORM_LOADED__) return;
  window.__PRO_TRANSFORM_LOADED__ = true;

  const style = document.createElement("style");

  style.textContent = `
    .pro-transform-tools {
      margin-top: 12px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .pro-transform-tools button {
      width: 100%;
      padding: 10px;
      border: 0;
      border-radius: 8px;
      background: #374151;
      color: white;
      cursor: pointer;
      font-weight: 700;
    }

    .pro-transform-tools button:hover {
      background: #4b5563;
    }
  `;

  document.head.appendChild(style);

  const panel =
    document.getElementById("proEditor");

  if (!panel) {
    console.error(
      "Pro Transform: Pro Editor not found."
    );
    return;
  }

  const tools =
    document.createElement("div");

  tools.className =
    "pro-transform-tools";

  tools.innerHTML = `
    <button id="proFlipH">
      ↔️ Flip
    </button>

    <button id="proFlipV">
      ↕️ Flip
    </button>
  `;

  panel.appendChild(tools);

  document
    .getElementById("proFlipH")
    .addEventListener(
      "click",
      () => {
        if (
          typeof window.proFlipHorizontal ===
          "function"
        ) {
          window.proFlipHorizontal();
        }
      }
    );

  document
    .getElementById("proFlipV")
    .addEventListener(
      "click",
      () => {
        if (
          typeof window.proFlipVertical ===
          "function"
        ) {
          window.proFlipVertical();
        }
      }
    );

  console.log(
    "Pro Transform loaded."
  );
})();