(() => {
  "use strict";

  function loadScript(src, next) {
    const script = document.createElement("script");

    script.src = src;

    script.onload = () => {
      console.log("Loaded:", src);

      if (next) next();
    };

    script.onerror = () => {
      console.error("Could not load:", src);
    };

    document.body.appendChild(script);
  }

  loadScript("pro-editor.js", () => {

    loadScript("pro-resize.js", () => {

      loadScript("pro-tools-ui.js", () => {

        console.log(
          "✨ All Pro Editor tools loaded."
        );

      });

    });

  });

})();
