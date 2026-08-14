(() => {
  "use strict";

  if (window.__AI_STUDIO_LOADED__) return;
  window.__AI_STUDIO_LOADED__ = true;

  function createAIStudio() {
    if (document.getElementById("aiStudio")) return;

    const studio = document.createElement("section");
    studio.id = "aiStudio";

    studio.innerHTML = `
      <div class="ai-header">
        <div>
          <h2>✨ AI Studio</h2>
          <p>Describe the edit you want.</p>
        </div>
      </div>

      <label class="ai-upload">
        📷 Upload Character / Picture
        <input
          id="aiImageInput"
          type="file"
          accept="image/*"
        >
      </label>

      <div id="aiPreview">
        <span>No image selected</span>
      </div>

      <label class="ai-label">
        What should the AI change?
        <textarea
          id="aiPrompt"
          rows="4"
          maxlength="1000"
          placeholder="Example: Make the character smile, look surprised, give a thumbs-up, and place them in a dramatic gaming setup with cinematic lighting."
        ></textarea>
      </label>

      <div class="ai-options">

        <button class="ai-option active" data-mode="full">
          ✨ Full Edit
        </button>

        <button class="ai-option" data-mode="expression">
          😊 Expression
        </button>

        <button class="ai-option" data-mode="pose">
          🧍 Pose
        </button>

        <button class="ai-option" data-mode="background">
          🌄 Background
        </button>

        <button class="ai-option" data-mode="style">
          🎨 Style
        </button>

        <button class="ai-option" data-mode="lighting">
          💡 Lighting
        </button>

      </div>

      <button id="aiGenerate">
        ✨ Generate AI Edit
      </button>

      <div id="aiStatus"></div>

      <div id="aiResult">
        <span>Your edited image will appear here.</span>
      </div>

      <button
        id="aiApply"
        disabled
      >
        ✅ Add Result to Thumbnail
      </button>
    `;

    // ==========================================
    // STYLES
    // ==========================================

    const style = document.createElement("style");

    style.textContent = `
      #aiStudio {
        width: 100%;
        max-width: 720px;
        margin: 20px auto;
        padding: 18px;
        border-radius: 16px;
        background: #171a21;
        border: 1px solid #292e38;
        color: white;
        font-family: Arial, sans-serif;
      }

      .ai-header h2 {
        margin: 0;
        font-size: 21px;
      }

      .ai-header p {
        margin: 5px 0 15px;
        color: #9ca3af;
        font-size: 13px;
      }

      .ai-upload {
        display: block;
        padding: 14px;
        border: 2px dashed #374151;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        font-weight: 700;
      }

      .ai-upload input {
        display: none;
      }

      .ai-label {
        display: block;
        margin-top: 14px;
        font-size: 13px;
        font-weight: 700;
      }

      #aiPrompt {
        width: 100%;
        margin-top: 7px;
        padding: 11px;
        resize: vertical;
        border-radius: 9px;
        border: 1px solid #374151;
        background: #0f1115;
        color: white;
        box-sizing: border-box;
      }

      .ai-options {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 7px;
        margin-top: 12px;
      }

      .ai-option {
        margin: 0 !important;
        padding: 9px 5px !important;
        background: #252a33 !important;
        border: 1px solid #374151 !important;
        font-size: 11px !important;
      }

      .ai-option.active {
        background: #2563eb !important;
      }

      #aiGenerate {
        margin-top: 12px;
        background: #7c3aed !important;
      }

      #aiStatus {
        min-height: 20px;
        margin-top: 9px;
        color: #aeb6c4;
        font-size: 12px;
        text-align: center;
      }

      #aiPreview,
      #aiResult {
        min-height: 120px;
        margin-top: 12px;
        border-radius: 10px;
        background: #0f1115;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        color: #6b7280;
        font-size: 12px;
      }

      #aiPreview img,
      #aiResult img {
        max-width: 100%;
        max-height: 360px;
        display: block;
      }

      #aiApply {
        margin-top: 10px;
        background: #059669 !important;
      }

      #aiApply:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }

      @media (max-width: 500px) {
        #aiStudio {
          padding: 12px;
        }

        .ai-options {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;

    document.head.appendChild(style);

    // ==========================================
    // ADD TO PAGE
    // ==========================================

    const app =
      document.querySelector(".app");

    if (app) {
      app.appendChild(studio);
    } else {
      document.body.appendChild(studio);
    }

    // ==========================================
    // ELEMENTS
    // ==========================================

    const input =
      document.getElementById("aiImageInput");

    const preview =
      document.getElementById("aiPreview");

    const prompt =
      document.getElementById("aiPrompt");

    const generate =
      document.getElementById("aiGenerate");

    const status =
      document.getElementById("aiStatus");

    const result =
      document.getElementById("aiResult");

    const apply =
      document.getElementById("aiApply");

    const options =
      studio.querySelectorAll(".ai-option");

    let selectedMode = "full";
    let selectedImage = null;

    // ==========================================
    // IMAGE UPLOAD
    // ==========================================

    input.addEventListener("change", () => {

      const file = input.files[0];

      if (!file) return;

      selectedImage =
        URL.createObjectURL(file);

      preview.innerHTML = `
        <img src="${selectedImage}" alt="Selected image">
      `;

      status.textContent =
        "Image ready for editing.";
    });

    // ==========================================
    // EDIT MODE
    // ==========================================

    options.forEach(option => {

      option.addEventListener("click", () => {

        options.forEach(
          item => item.classList.remove("active")
        );

        option.classList.add("active");

        selectedMode =
          option.dataset.mode;
      });

    });

    // ==========================================
    // GENERATE
    // ==========================================

    generate.addEventListener("click", () => {

      if (!selectedImage) {

        status.textContent =
          "Upload an image first.";

        return;
      }

      if (!prompt.value.trim()) {

        status.textContent =
          "Describe the edit you want.";

        return;
      }

      /*
        The actual AI image-generation request
        will be connected through a secure backend.
      */

      status.textContent =
        "AI connection is ready to be connected.";

      result.innerHTML = `
        <span>
          AI result will appear here after the
          secure AI backend is connected.
        </span>
      `;
    });

    console.log(
      "✨ AI Studio interface loaded."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      createAIStudio
    );
  } else {
    createAIStudio();
  }

})();
