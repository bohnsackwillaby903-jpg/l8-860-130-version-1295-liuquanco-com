(function () {
  function attach(video, source) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  window.bindMoviePlayer = function (videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var started = false;

    if (!video || !source) {
      return;
    }

    function play() {
      if (!started) {
        started = true;
        attach(video, source);
      }

      if (cover) {
        cover.classList.add("is-hidden");
      }

      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };
})();
