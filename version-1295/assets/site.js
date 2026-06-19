(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showHero(current + 1);
      }, 5000);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(current + 1);
        startHero();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showHero(index);
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (query) {
      searchInput.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var value = normalize(searchInput.value);

      cards.forEach(function (card) {
        var content = normalize(card.getAttribute('data-search-text') || card.textContent);
        card.classList.toggle('is-hidden', value && content.indexOf(value) === -1);
      });
    }

    searchInput.addEventListener('input', filterCards);
    filterCards();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-cover');
    var hls = null;
    var mounted = false;

    if (!video || !button) {
      return;
    }

    var source = video.getAttribute('src');

    function mountPlayer() {
      if (mounted || !source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        mounted = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        mounted = true;
      }
    }

    function playMovie() {
      mountPlayer();
      player.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    button.addEventListener('click', playMovie);

    video.addEventListener('click', function () {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
}());
