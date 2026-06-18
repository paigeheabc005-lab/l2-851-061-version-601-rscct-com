(function () {
  function setupMoviePlayer(options) {
    var video = document.querySelector(options.video);
    var overlay = document.querySelector(options.overlay);
    var source = options.source;
    var hls = null;
    var readyPromise = null;

    if (!video || !overlay || !source) {
      return;
    }

    function attachSource() {
      if (readyPromise) {
        return readyPromise;
      }
      readyPromise = new Promise(function (resolve) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.load();
          resolve();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          return;
        }
        video.src = source;
        video.load();
        resolve();
      });
      return readyPromise;
    }

    function playMovie() {
      overlay.classList.add("is-hidden");
      attachSource().then(function () {
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      });
    }

    overlay.addEventListener("click", playMovie);
    video.addEventListener("click", function () {
      if (video.paused) {
        playMovie();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
