(() => {
  "use strict";

  // Load the Pro Editor after the main Thumbnail Maker
  // has finished loading.
  const script = document.createElement("script");

  script.src = "pro-editor.js";
  script.defer = true;

  script.onload = () => {
    console.log("✅ Pro Editor connected successfully.");
  };

  script.onerror = () => {
    console.error("❌ Could not load pro-editor.js");
  };

  document.head.appendChild(script);
})();
const script = document.createElement("script");

script.src = "pro-editor.js";

script.onload = () => {

  const resizeScript =
    document.createElement("script");

  resizeScript.src =
    "pro-resize.js";

  document.body.appendChild(
    resizeScript
  );

};

document.body.appendChild(
  script
);
