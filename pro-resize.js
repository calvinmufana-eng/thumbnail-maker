(() => {
  "use strict";

  if (window.__PRO_RESIZE_LOADED__) {
    console.log("Resize tools already loaded.");
    return;
  }

  window.__PRO_RESIZE_LOADED__ = true;

  const editor = window.ProEditor;

  if (!editor) {
    console.error(
      "Resize tools: Pro Editor is not ready."
    );
    return;
  }

  console.log(
    "📏 Resize tools connected to Pro Editor."
  );

})();
