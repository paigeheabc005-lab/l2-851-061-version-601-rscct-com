(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    var region = document.querySelector("[data-region-filter]");
    var type = document.querySelector("[data-type-filter]");
    var items = Array.prototype.slice.call(document.querySelectorAll(".searchable-item"));
    var empty = document.querySelector(".empty-state");
    if (!items.length || (!input && !region && !type)) {
      return;
    }
    function valueOf(node) {
      return node ? node.value.trim().toLowerCase() : "";
    }
    function apply() {
      var q = valueOf(input);
      var r = valueOf(region);
      var t = valueOf(type);
      var visible = 0;
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute("data-title") || "",
          item.getAttribute("data-region") || "",
          item.getAttribute("data-type") || "",
          item.getAttribute("data-tags") || ""
        ].join(" ").toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (r && (item.getAttribute("data-region") || "").toLowerCase().indexOf(r) === -1) {
          ok = false;
        }
        if (t && (item.getAttribute("data-type") || "").toLowerCase().indexOf(t) === -1) {
          ok = false;
        }
        item.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }
    [input, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener("input", apply);
        node.addEventListener("change", apply);
      }
    });
  }

  function initTabs() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll(".tab-btn"));
    if (!buttons.length) {
      return;
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var target = button.getAttribute("data-tab");
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        Array.prototype.slice.call(document.querySelectorAll(".tab-panel")).forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-panel") === target);
        });
      });
    });
  }

  window.initMoviePlayer = function (streamUrl) {
    var box = document.querySelector(".player-box");
    var video = document.querySelector(".movie-video");
    var layer = document.querySelector(".player-layer");
    var button = document.querySelector(".player-button");
    if (!box || !video || !streamUrl) {
      return;
    }
    function attach() {
      if (video.dataset.ready === "1") {
        return;
      }
      video.dataset.ready = "1";
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }
    function play() {
      attach();
      box.classList.add("is-playing");
      if (layer) {
        layer.hidden = true;
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (layer) {
            layer.hidden = false;
          }
          box.classList.remove("is-playing");
        });
      }
    }
    if (button) {
      button.addEventListener("click", play);
    }
    if (layer) {
      layer.addEventListener("click", play);
    }
    video.addEventListener("play", function () {
      box.classList.add("is-playing");
      if (layer) {
        layer.hidden = true;
      }
    });
  };

  ready(function () {
    initNav();
    initHero();
    initSearch();
    initTabs();
  });
})();
