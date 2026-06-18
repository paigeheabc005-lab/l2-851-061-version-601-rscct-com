(function () {
  var body = document.body;
  var basePath = body ? body.getAttribute('data-base') || '' : '';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function joinUrl(path) {
    return basePath + path;
  }

  var menuButton = qs('[data-menu-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      menuButton.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });
  }

  var heroSlides = qsa('[data-hero-slide]');
  var heroDots = qsa('[data-hero-dot]');
  var heroIndex = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }

    heroIndex = (index + heroSlides.length) % heroSlides.length;

    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });

    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  heroDots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (heroSlides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5600);
  }

  function renderSearchResults(input, resultsBox) {
    var keyword = text(input.value);
    var data = window.MovieSearchIndex || [];

    if (!resultsBox) {
      return;
    }

    if (!keyword) {
      resultsBox.classList.remove('open');
      resultsBox.innerHTML = '';
      return;
    }

    var matches = data.filter(function (item) {
      return text(item.text).indexOf(keyword) !== -1;
    }).slice(0, 8);

    if (!matches.length) {
      resultsBox.innerHTML = '<div class="empty-result">没有找到匹配影片</div>';
      resultsBox.classList.add('open');
      return;
    }

    resultsBox.innerHTML = matches.map(function (item) {
      return [
        '<a class="search-item" href="', joinUrl(item.url), '">',
        '<img src="', joinUrl(item.cover), '" alt="', escapeHtml(item.title), '">',
        '<span><strong>', escapeHtml(item.title), '</strong>',
        '<em>', escapeHtml(item.category), ' · ', escapeHtml(item.region), ' · ', escapeHtml(item.year), '</em>',
        '<small>', escapeHtml(item.summary), '</small></span>',
        '</a>'
      ].join('');
    }).join('');

    resultsBox.classList.add('open');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  qsa('[data-search-form]').forEach(function (form) {
    var input = qs('[data-global-search]', form);
    var scope = form.parentElement || document;
    var resultsBox = qs('[data-search-results]', scope) || qs('[data-search-results]');

    if (!input) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      renderSearchResults(input, resultsBox);
    });

    input.addEventListener('input', function () {
      renderSearchResults(input, resultsBox);
    });

    input.addEventListener('focus', function () {
      renderSearchResults(input, resultsBox);
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.header-search-wrap') && !event.target.closest('.home-search-band')) {
      qsa('[data-search-results]').forEach(function (box) {
        box.classList.remove('open');
      });
    }
  });

  var localSearch = qs('[data-local-search]');
  var yearFilter = qs('[data-year-filter]');
  var regionFilter = qs('[data-region-filter]');
  var categoryFilter = qs('[data-category-filter]');
  var cards = qsa('[data-movie-card]');

  function applyLocalFilter() {
    var keyword = text(localSearch ? localSearch.value : '');
    var year = text(yearFilter ? yearFilter.value : '');
    var region = text(regionFilter ? regionFilter.value : '');
    var category = text(categoryFilter ? categoryFilter.value : '');

    cards.forEach(function (card) {
      var cardText = text(card.getAttribute('data-keywords') || '');
      var cardYear = text(card.getAttribute('data-year') || '');
      var cardRegion = text(card.getAttribute('data-region') || '');
      var cardCategory = text(card.getAttribute('data-category') || '');
      var matched = true;

      if (keyword && cardText.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.hidden = !matched;
    });
  }

  [localSearch, yearFilter, regionFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyLocalFilter);
      control.addEventListener('change', applyLocalFilter);
    }
  });
})();
