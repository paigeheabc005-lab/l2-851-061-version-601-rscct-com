(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-input]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var container = scope.parentElement;
      var results = container ? container.querySelector("[data-filter-results]") : null;
      var cards = results ? Array.prototype.slice.call(results.querySelectorAll("[data-search-card]")) : Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
      var empty = container ? container.querySelector("[data-empty-state]") : null;

      function valueOf(element) {
        return element ? element.value.trim().toLowerCase() : "";
      }

      function apply() {
        var query = valueOf(input);
        var typeValue = typeSelect ? typeSelect.value : "";
        var regionValue = regionSelect ? regionSelect.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-meta") || ""
          ].join(" ").toLowerCase();
          var typeMatch = !typeValue || card.getAttribute("data-type") === typeValue;
          var regionMatch = !regionValue || card.getAttribute("data-region") === regionValue;
          var queryMatch = !query || haystack.indexOf(query) !== -1;
          var showCard = typeMatch && regionMatch && queryMatch;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (typeSelect) {
        typeSelect.addEventListener("change", apply);
      }
      if (regionSelect) {
        regionSelect.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
