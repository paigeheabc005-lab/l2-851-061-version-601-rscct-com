function setupMoviePlayer(videoId, buttonId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var attached = false;

    function attachStream() {
        if (attached || !video) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        attachStream();
        if (button) {
            button.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                if (button) {
                    button.classList.remove("is-hidden");
                }
            });
        }
    }

    if (!video) {
        return;
    }

    if (button) {
        button.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (!attached || video.paused) {
            playVideo();
        }
    });

    video.addEventListener("play", function () {
        if (button) {
            button.classList.add("is-hidden");
        }
    });

    video.addEventListener("pause", function () {
        if (button && video.currentTime === 0) {
            button.classList.remove("is-hidden");
        }
    });
}
