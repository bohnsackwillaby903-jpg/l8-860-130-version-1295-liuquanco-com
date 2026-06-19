(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = $('[data-menu-toggle]');
    var panel = $('[data-mobile-panel]');
    if (!button || !panel) return;
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.textContent = panel.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function initHero() {
    var root = $('[data-hero]');
    if (!root) return;
    var slides = $all('[data-hero-slide]', root);
    var dots = $all('[data-hero-dot]', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    if (!slides.length) return;
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function reset() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        reset();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        reset();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        reset();
      });
    }

    start();
  }

  function bindFilter(input, listSelector, counter) {
    var list = $(listSelector);
    if (!input || !list) return;
    var cards = $all('.movie-card', list);

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) visible += 1;
      });
      if (counter) counter.textContent = keyword ? '找到 ' + visible + ' 个相关结果' : '输入关键词筛选影片';
    }

    input.addEventListener('input', apply);
    apply();
  }

  function initFilters() {
    var pageFilter = $('[data-page-filter]');
    bindFilter(pageFilter, '[data-filter-list]');

    var searchPage = $('[data-search-page]');
    if (!searchPage) return;
    var input = $('[data-search-input]', searchPage);
    var counter = $('[data-result-count]', searchPage);
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) input.value = q;
    bindFilter(input, '[data-search-list]', counter);
  }

  function initPlayer() {
    var video = $('[data-hls]');
    if (!video) return;
    var button = $('[data-play-button]');
    var src = video.getAttribute('data-hls');
    var loaded = false;

    function load() {
      if (loaded || !src) return;
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      load();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    load();
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (button) button.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (button && video.currentTime === 0) button.classList.remove('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
