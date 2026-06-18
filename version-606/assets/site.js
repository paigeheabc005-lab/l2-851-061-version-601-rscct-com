(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var nav = document.querySelector('.main-nav');
    var search = document.querySelector('.header-search');

    if (!button || !nav || !search) {
      return;
    }

    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open');
      search.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    var root = document.querySelector('.js-hero-carousel');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to')) || 0);
        restart();
      });
    });

    if (slides.length > 1) {
      restart();
    }
  }

  function yearMatches(yearText, filter) {
    if (!filter || filter === '全部年份') {
      return true;
    }

    var year = Number(yearText);

    if (!Number.isFinite(year)) {
      return false;
    }

    if (filter === '2025+') {
      return year >= 2025;
    }

    if (filter === '2020-2024') {
      return year >= 2020 && year <= 2024;
    }

    if (filter === '2010-2019') {
      return year >= 2010 && year <= 2019;
    }

    if (filter === '2000-2009') {
      return year >= 2000 && year <= 2009;
    }

    if (filter === '1999以前') {
      return year <= 1999;
    }

    return true;
  }

  function typeMatches(typeText, filter) {
    if (!filter || filter === '全部类型') {
      return true;
    }

    return String(typeText || '').indexOf(filter) !== -1;
  }

  function setupFilters() {
    var form = document.querySelector('.js-filter-form');
    var scope = document.querySelector('.js-filter-scope');

    if (!form || !scope) {
      return;
    }

    var keywordInput = form.querySelector('.js-filter-keyword');
    var yearSelect = form.querySelector('.js-filter-year');
    var typeSelect = form.querySelector('.js-filter-type');
    var sortSelect = form.querySelector('.js-filter-sort');
    var countNode = form.querySelector('.js-filter-count');
    var emptyNode = document.querySelector('.js-empty-result');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

    function cardText(card) {
      return [
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.category,
        card.dataset.tags,
        card.textContent
      ].join(' ').toLowerCase();
    }

    function sortCards() {
      var sort = sortSelect ? sortSelect.value : 'default';
      var ordered = cards.slice();

      if (sort === 'score') {
        ordered.sort(function (a, b) {
          return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
        });
      } else if (sort === 'year') {
        ordered.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      } else if (sort === 'heat') {
        ordered.sort(function (a, b) {
          return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
        });
      } else if (sort === 'title') {
        ordered.sort(function (a, b) {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        });
      }

      ordered.forEach(function (card) {
        scope.appendChild(card);
      });
    }

    function applyFilters() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
      var yearFilter = yearSelect ? yearSelect.value : '全部年份';
      var typeFilter = typeSelect ? typeSelect.value : '全部类型';
      var visible = 0;

      sortCards();

      cards.forEach(function (card) {
        var matched = true;

        if (keyword) {
          matched = cardText(card).indexOf(keyword) !== -1;
        }

        if (matched) {
          matched = yearMatches(card.dataset.year, yearFilter);
        }

        if (matched) {
          matched = typeMatches(card.dataset.type, typeFilter);
        }

        card.classList.toggle('card-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }

      if (emptyNode) {
        emptyNode.hidden = visible !== 0;
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      form.addEventListener(eventName, applyFilters);
    });

    applyFilters();
  }

  function movieCardTemplate(movie) {
    return [
      '<a class="movie-card" href="movie/' + escapeHtml(movie.id) + '.html">',
      '  <figure class="poster-wrap">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy">',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="play-chip">播放</span>',
      '  </figure>',
      '  <div class="card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <div class="card-tags">',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '      <span>' + escapeHtml(movie.score) + ' 分</span>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('\n');
  }

  function setupSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var form = document.querySelector('.js-search-page-form');
    var input = document.querySelector('.js-search-input');
    var results = document.querySelector('.js-search-results');
    var summary = document.querySelector('.js-search-summary');

    if (!data || !form || !input || !results || !summary) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var matched = [];

      if (normalized) {
        matched = data.filter(function (movie) {
          return [
            movie.title,
            movie.oneLine,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            movie.tags,
            movie.category
          ].join(' ').toLowerCase().indexOf(normalized) !== -1;
        });
      }

      results.innerHTML = matched.slice(0, 240).map(movieCardTemplate).join('\n');

      if (!normalized) {
        summary.textContent = '输入关键词后即可查看结果。';
      } else if (matched.length === 0) {
        summary.textContent = '没有找到与“' + query + '”相关的影片。';
      } else {
        summary.textContent = '找到 ' + matched.length + ' 个结果，当前展示前 ' + Math.min(240, matched.length) + ' 个。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      render(query);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.js-play-video');

      if (!video || !button) {
        return;
      }

      var source = video.getAttribute('data-src');
      var loaded = false;

      function playVideo() {
        if (!source) {
          return;
        }

        button.classList.add('is-hidden');

        if (!loaded) {
          loaded = true;

          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
            shell.hlsInstance = hls;
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
              video.play().catch(function () {});
            }, { once: true });
          } else {
            video.src = source;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      button.addEventListener('click', playVideo);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
