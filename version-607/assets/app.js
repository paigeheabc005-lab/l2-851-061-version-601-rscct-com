(function () {
    function setActiveSlide(slider, index) {
        var slides = slider.querySelectorAll(".hero-slide");
        var dots = slider.querySelectorAll(".hero-dot");
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === index);
        });
        slider.dataset.currentSlide = String(index);
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = slider.querySelectorAll(".hero-slide");
        if (slides.length <= 1) {
            return;
        }
        slider.dataset.currentSlide = "0";
        slider.querySelectorAll("[data-slide-dot]").forEach(function (dot) {
            dot.addEventListener("click", function () {
                setActiveSlide(slider, Number(dot.dataset.slideDot || 0));
            });
        });
        window.setInterval(function () {
            var current = Number(slider.dataset.currentSlide || 0);
            var next = (current + 1) % slides.length;
            setActiveSlide(slider, next);
        }, 5600);
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = document.body.classList.toggle("nav-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function setupFilters() {
        var inputs = document.querySelectorAll("[data-filter-input]");
        inputs.forEach(function (input) {
            var list = document.querySelector("[data-filter-list]");
            var empty = document.querySelector("[data-empty-state]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            function applyFilter() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.dataset.year,
                        card.textContent
                    ].join(" "));
                    var match = !query || haystack.indexOf(query) !== -1;
                    card.hidden = !match;
                    if (match) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }
            if (input.hasAttribute("data-query-sync")) {
                var params = new URLSearchParams(window.location.search);
                var q = params.get("q") || "";
                input.value = q;
            }
            input.addEventListener("input", applyFilter);
            applyFilter();
        });
        document.querySelectorAll("[data-clear-search]").forEach(function (button) {
            button.addEventListener("click", function () {
                var input = document.querySelector("[data-filter-input]");
                if (input) {
                    input.value = "";
                    input.dispatchEvent(new Event("input"));
                    input.focus();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
