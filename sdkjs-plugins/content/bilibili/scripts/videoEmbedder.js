(function (window, undefined) {
  try {
    var url = "";
    var player = null;
    var isWindowPlayer = false;

    function validateVideoUrl(url) {
      var patterns = [
        /^(?:https?:\/\/)?(?:www\.)?(bilibili\.com\/video\/)([^#\&\?]+)/,
        /^(?:https?:\/\/)?(?:v\.)?(youku\.com\/v_show\/id_)([^#\&\?]+)/,
        /^(?:https?:\/\/)?(?:v\.|m\.)?(qq\.com\/x\/cover\/\w+\/)([^#\&\?]+)/,
        /^(?:https?:\/\/)?(?:v\.|www\.)?(qq\.com\/x\/page\/)([^#\&\?]+)/, // New pattern for v.qq.com
        /^(?:https?:\/\/)?(?:www\.)?(ixigua\.com\/)([^#\&\?]+)/,
        /^(?:https?:\/\/)?(?:www\.)?(iqiyi\.com\/v_)([^#\&\?]+)/,
        /^(?:https?:\/\/)?(?:www\.)?(iqiyi\.com\/a_)([^#\&\?]+)/, // New pattern for iqiyi.com/a_
      ];
      for (var i = 0; i < patterns.length; i++) {
        if (url.match(patterns[i])) return true;
      }
      return false;
    }

    function getVideoId(url) {
      // Extract video IDs for all platforms
      if (url.includes("bilibili.com")) {
        return url.split("/video/")[1].split("/")[0];
      } else if (url.includes("youku.com")) {
        return url.split("id_")[1].split(".")[0];
      } else if (url.includes("qq.com")) {
        if (url.includes("/x/page/")) {
          return url.split("/x/page/")[1].split(".")[0];
        } else {
          return url.split("/cover/")[1].split("/")[1].split(".")[0];
        }
      } else if (url.includes("ixigua.com")) {
        return url.split(".com/")[1].split("?")[0];
      } else if (url.includes("iqiyi.com")) {
        if (url.includes("/a_")) {
          return url.split("/a_")[1].split(".")[0];
        } else {
          return url.split("/v_")[1].split(".")[0];
        }
      }
      return null;
    }

    window.Asc.plugin.init = function (text) {
      var _textbox = document.getElementById("textbox_url");

      if (this.info.isViewMode) {
        _textbox.disabled = true;
        document.getElementById("textbox_button").disabled = true;
      }

      _textbox.onkeyup = function (e) {
        if (e.keyCode == 13)
          document.getElementById("textbox_button").onclick();
      };

      _textbox.oninput = _textbox.onpaste = function (e) {
        this.style.borderColor = "";
        document.getElementById("input_error_id").style.display = "none";
      };

      _textbox.addEventListener("paste", function (e) {
        this.style.borderColor = "";
        document.getElementById("input_error_id").style.display = "none";
      });

      document.getElementById("textbox_button").onclick = function (e) {
        var _url = document.getElementById("textbox_url").value;

        if (!validateVideoUrl(_url)) {
          document.getElementById("textbox_url").style.borderColor = "#d9534f";
          document.getElementById("input_error_id").style.display = "block";
          return;
        }

        if (!isWindowPlayer) {
          var _table = document.getElementById("id_player");
          _table.innerHTML =
            '<div id="content" style="position:absolute;padding:0;margin:0;left:0;top:0;width:100%;height:100%;"></div>';
          isWindowPlayer = true;
          window.Asc.plugin.resizeWindow(620, 480, 390, 400, 0, 0);
        }

        url = _url;

        // Get video ID and create embed URL
        var videoId = getVideoId(url);
        if (videoId) {
          if (url.includes("bilibili.com")) {
            embedUrl = `<iframe src="https://player.bilibili.com/player.html?bvid=${videoId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
          } else if (url.includes("youku.com")) {
            embedUrl = `<iframe src="https://player.youku.com/embed/${videoId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
          } else if (url.includes("qq.com")) {
            embedUrl = `<iframe frameborder="0"  width="100%" height="100%" src="https://v.qq.com/txp/iframe/player.html?vid=${videoId}" allowFullScreen="true"></iframe>`;
          } else if (url.includes("ixigua.com")) {
            embedUrl = `<iframe width="100%" height="100%" frameborder="0" src="https://www.ixigua.com/iframe/${videoId}?autoplay=0"  allowfullscreen></iframe>`;
          } else if (url.includes("iqiyi.com")) {
            embedUrl = `<iframe src="https://www.iqiyi.com/iframe/player.html?vid=${videoId}" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>`;
          }
        } else {
          document.getElementById("textbox_url").style.borderColor = "#d9534f";
          document.getElementById("input_error_id").style.display = "block";
          return;
        }

        document.getElementById("content").innerHTML = `${embedUrl}`;
      };

      url = text;
      if (url !== "") {
        document.getElementById("textbox_url").value = url;
        document.getElementById("textbox_button").onclick();
      }
      _textbox.focus();
    };

    window.Asc.plugin.button = function (id) {
      if (id == 0) {
        url = document.getElementById("textbox_url").value;

        if (!validateVideoUrl(url)) {
          document.getElementById("textbox_url").style.borderColor = "#d9534f";
          document.getElementById("input_error_id").style.display = "block";
          return;
        }

        var _info = window.Asc.plugin.info;
        var _method =
          _info.objectId === undefined ? "AddOleObject" : "EditOleObject";

        var _param = {
          guid: _info.guid,
          widthPix: (_info.mmToPx * _info.width) >> 0,
          heightPix: (_info.mmToPx * _info.height) >> 0,
          width: _info.width ? _info.width : 100,
          height: _info.height ? _info.height : 70,
          imgSrc: "", // static image
          data: url,
          objectId: _info.objectId,
          resize: _info.resize,
        };

        window.Asc.plugin.executeMethod(_method, [_param], function () {
          window.Asc.plugin.executeCommand("close", "");
        });
      } else {
        this.executeCommand("close", "");
      }
    };

    window.Asc.plugin.onTranslate = function () {
      var label = document.getElementById("td_labelUrl");
      var previewBtn = document.getElementById("textbox_button");
      if (label) label.innerHTML = window.Asc.plugin.tr("Paste video URL");
      if (previewBtn) previewBtn.innerHTML = window.Asc.plugin.tr("Preview");
    };
  } catch (error) {
    console.log("Some problem:", error);
  }
})(window, undefined);
