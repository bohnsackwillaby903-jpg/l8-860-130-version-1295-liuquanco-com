(function () {
  var body = document.body;
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var searchInput = document.querySelector('[data-search-input]');
  var filterButtons = document.querySelectorAll('[data-filter-value]');
  var cards = document.querySelectorAll('[data-movie-card]');

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  function applySearch(value) {
    var keyword = (value || '').trim().toLowerCase();
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      if (!keyword || haystack.indexOf(keyword) !== -1) {
        card.classList.remove('is-hidden');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      applySearch(searchInput.value);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-filter-value') || '';
      if (searchInput) {
        searchInput.value = value;
      }
      applySearch(value);
    });
  });

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = slider.querySelectorAll('.hero-slide');
    var dots = slider.querySelectorAll('[data-hero-dot]');
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startSlider() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
        startSlider();
      });
    });

    if (slides.length > 1) {
      startSlider();
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video[data-src]');
    var button = player.querySelector('[data-play-button]');
    var status = player.querySelector('[data-player-status]');
    var initialized = false;
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function startPlayback() {
      if (!video) {
        return;
      }

      var source = video.getAttribute('data-src');
      if (!source) {
        setStatus('播放线路暂不可用');
        return;
      }

      player.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      setStatus('正在加载播放线路');

      if (!initialized) {
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
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
            video.play().catch(function () {
              setStatus('请再次点击播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              setStatus('播放线路加载失败，请刷新后重试');
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
                initialized = false;
              }
            }
          });
        } else {
          video.src = source;
        }
        initialized = true;
      }

      video.play().then(function () {
        setStatus('');
      }).catch(function () {
        setStatus('请再次点击播放');
      });
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener('playing', function () {
        player.classList.add('is-playing');
        setStatus('');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime > 0) {
          player.classList.remove('is-playing');
        }
      });
    }
  });
})();
