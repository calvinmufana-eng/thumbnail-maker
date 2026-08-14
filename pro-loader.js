(() => {
  "use strict";

  const editorScript =
    document.createElement("script");

  editorScript.src = "pro-editor.js";

  editorScript.onload = () => {

    const resizeScript =
      document.createElement("script");

    resizeScript.src = "pro-resize.js";

    resizeScript.onload = () => {

      const toolsScript =
        document.createElement("script");

      toolsScript.src = "pro-tools-ui.js";

      document.body.appendChild(
        toolsScript
      );

    };

    document.body.appendChild(
      resizeScript
    );

  };

  document.body.appendChild(
    editorScript
  );

})();
