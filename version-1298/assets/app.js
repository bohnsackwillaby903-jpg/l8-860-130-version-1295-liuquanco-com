
(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('active');
      document.body.classList.toggle('is-menu-open', mobileNav.classList.contains('active'));
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var activeIndex = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('active', itemIndex === activeIndex);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('active', itemIndex === activeIndex);
      });

      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle('active', itemIndex === activeIndex);
      });
    }

    function startHero() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setHero(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        startHero();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        setHero(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        setHero(activeIndex - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setHero(activeIndex + 1);
        startHero();
      });
    }

    setHero(0);
    startHero();
  }

  var searchInput = document.getElementById('site-search');
  var filterRow = document.querySelector('[data-filter-row]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] [data-title], [data-card-list] .rank-row'));
  var noResults = document.querySelector('[data-no-results]');
  var activeFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function searchableText(element) {
    return normalize([
      element.getAttribute('data-title'),
      element.getAttribute('data-region'),
      element.getAttribute('data-year'),
      element.getAttribute('data-genre'),
      element.getAttribute('data-category'),
      element.textContent
    ].join(' '));
  }

  function applySearch() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : '');
    var matched = 0;

    cards.forEach(function (card) {
      var text = searchableText(card);
      var category = card.getAttribute('data-category') || '';
      var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchFilter = activeFilter === 'all' || category === activeFilter;
      var visible = matchKeyword && matchFilter;

      card.style.display = visible ? '' : 'none';

      if (visible) {
        matched += 1;
      }
    });

    if (noResults) {
      noResults.classList.toggle('active', matched === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', applySearch);
  }

  if (filterRow) {
    filterRow.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');

      if (!button) {
        return;
      }

      activeFilter = button.getAttribute('data-filter') || 'all';
      Array.prototype.slice.call(filterRow.querySelectorAll('button')).forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      applySearch();
    });
  }

  applySearch();

  var playerSection = document.querySelector('[data-video-url]');

  if (playerSection) {
    var video = playerSection.querySelector('video');
    var trigger = playerSection.querySelector('[data-player-trigger]');
    var source = playerSection.getAttribute('data-video-url');
    var loaded = false;
    var hlsInstance = null;

    function loadVideo() {
      if (!video || loaded || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      loaded = true;
    }

    function playVideo() {
      loadVideo();

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      if (video) {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (trigger) {
              trigger.classList.remove('is-hidden');
            }
          });
        }
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
