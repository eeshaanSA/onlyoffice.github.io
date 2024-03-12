(function (window, undefined) {
  window.Asc.plugin.init = function () {
    const textElement = document.getElementById("errorText");
    window.Asc.plugin.onTranslate = function () {
      textElement.innerText = window.Asc.plugin.tr(
        "You have no ComboBoxes in your document. This plugin requires at least one ComboBox to work."
      );
    };
    function setMode(mode) {
      console.log(mode);
      const img = document.getElementById("modalImg");
      img.src = mode
        ? "resources/dark/icon@2x.png"
        : "resources/light/icon@2x.png";
    }

    function getMode() {
      const mode = window.Asc.plugin.info.theme.da;
      if (mode === "dark") {
        setMode(true);
      } else {
        setMode(false);
      }
    }
    getMode();
  };
})(window, undefined);
