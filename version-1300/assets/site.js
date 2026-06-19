(function () {
  var activeHlsPlayers = new WeakMap();

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initializeMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function initializeNavSearch() {
    qsa('[data-nav-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input', form);
        var query = input ? input.value.trim() : '';
        var target = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
        window.location.href = target;
      });
    });
  }

  function initializeHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        showSlide(dotIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  function initializePageFilter() {
    var filterInput = qs('[data-card-filter]');
    var sortSelect = qs('[data-card-sort]');
    var regionSelect = qs('[data-region-filter]');
    var cards = qsa('[data-movie-card]');
    var grid = qs('[data-card-grid]');
    if (!cards.length || !grid) {
      return;
    }

    function applyFilter() {
      var keyword = normalizeText(filterInput ? filterInput.value : '');
      var region = normalizeText(regionSelect ? regionSelect.value : '');
      cards.forEach(function (card) {
        var text = normalizeText(card.getAttribute('data-search-text'));
        var cardRegion = normalizeText(card.getAttribute('data-region'));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedRegion = !region || cardRegion === region;
        card.classList.toggle('is-hidden-by-filter', !(matchedKeyword && matchedRegion));
      });
    }

    function applySort() {
      if (!sortSelect) {
        applyFilter();
        return;
      }
      var sorted = cards.slice();
      var mode = sortSelect.value;
      sorted.sort(function (a, b) {
        if (mode === 'title') {
          return normalizeText(a.getAttribute('data-title')).localeCompare(normalizeText(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        if (mode === 'year-asc') {
          return Number(a.getAttribute('data-year-number') || 0) - Number(b.getAttribute('data-year-number') || 0);
        }
        return Number(b.getAttribute('data-year-number') || 0) - Number(a.getAttribute('data-year-number') || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', applyFilter);
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', applySort);
      applySort();
    } else {
      applyFilter();
    }
  }

  function initializeSearchPage() {
    var form = qs('[data-search-form]');
    var input = qs('[data-search-input]');
    var results = qs('[data-search-results]');
    var status = qs('[data-search-status]');
    if (!form || !input || !results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function cardTemplate(movie) {
      var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
        return '<span class="chip">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<a class="movie-card" href="' + escapeAttribute(movie.url) + '" data-movie-card data-title="' + escapeAttribute(movie.title) + '" data-year-number="' + escapeAttribute(movie.yearNumber) + '" data-region="' + escapeAttribute(movie.region) + '" data-search-text="' + escapeAttribute(movie.searchText) + '">' +
        '<div class="poster-wrap"><img src="./' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + ' 海报" loading="lazy"><span class="poster-gradient"></span><span class="poster-badge">' + escapeHtml(movie.region) + '</span><span class="poster-year">' + escapeHtml(movie.year) + '</span></div>' +
        '<div class="card-body"><div class="card-meta">' + tags + '<span>' + escapeHtml(movie.type) + '</span></div><h3 class="card-title">' + escapeHtml(movie.title) + '</h3><p class="card-desc">' + escapeHtml(movie.oneLine) + '</p></div>' +
        '</a>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }

    function escapeAttribute(value) {
      return escapeHtml(value).replace(/`/g, '&#96;');
    }

    function runSearch() {
      var keyword = normalizeText(input.value);
      var tokens = keyword.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var text = normalizeText(movie.searchText);
        return !tokens.length || tokens.every(function (token) {
          return text.indexOf(token) !== -1;
        });
      }).slice(0, 80);
      results.innerHTML = matched.map(cardTemplate).join('');
      status.textContent = keyword ? '已显示与“' + input.value.trim() + '”相关的影片结果。' : '输入片名、类型、地区、年份或标签后即可筛选影片。';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
    });
    input.addEventListener('input', runSearch);

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    runSearch();
  }

  function initializePlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var overlay = qs('[data-player-start]', player);
      var status = qs('[data-player-status]', player);
      var source = player.getAttribute('data-video-url');
      if (!video || !source) {
        return;
      }

      function setStatus(message) {
        if (!status) {
          return;
        }
        status.textContent = message;
        status.classList.toggle('is-visible', Boolean(message));
      }

      function bindSourceAndPlay() {
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        setStatus('正在加载播放源...');

        var existingHls = activeHlsPlayers.get(video);
        if (existingHls) {
          video.play().catch(function () {});
          setStatus('');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          activeHlsPlayers.set(video, hls);
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('');
            video.play().catch(function () {
              setStatus('点击播放器即可继续播放。');
            });
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              setStatus('网络加载异常，正在重新连接...');
              hls.startLoad();
              return;
            }
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              setStatus('媒体解析异常，正在恢复播放...');
              hls.recoverMediaError();
              return;
            }
            setStatus('当前播放源暂时无法播放。');
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('');
          }, { once: true });
          video.play().catch(function () {
            setStatus('点击播放器即可继续播放。');
          });
        } else {
          setStatus('当前浏览器不支持 HLS 播放。');
        }
      }

      if (overlay) {
        overlay.addEventListener('click', bindSourceAndPlay);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          bindSourceAndPlay();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initializeMobileMenu();
    initializeNavSearch();
    initializeHero();
    initializePageFilter();
    initializeSearchPage();
    initializePlayers();
  });
})();
