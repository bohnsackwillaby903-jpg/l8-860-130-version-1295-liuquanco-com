(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initCarousel();
    initSearchFilters();
  });

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initCarousel() {
    var root = document.querySelector('[data-carousel]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-carousel-dot]'));
    var next = root.querySelector('[data-carousel-next]');
    var prev = root.querySelector('[data-carousel-prev]');
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
      }, 5200);
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-carousel-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function initSearchFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('.searchable-list'));
    var input = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var count = document.querySelector('[data-result-count]');

    if (!lists.length || !input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      input.value = query;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var term = normalize(input.value);
      var category = categoryFilter ? categoryFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var visible = 0;

      lists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll('.searchable-card')).forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matched = true;

          if (term && text.indexOf(term) === -1) {
            matched = false;
          }

          if (category && cardCategory !== category) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);

          if (matched) {
            visible += 1;
          }
        });
      });

      if (count) {
        count.textContent = '共 ' + visible + ' 部';
      }
    }

    input.addEventListener('input', apply);

    if (categoryFilter) {
      categoryFilter.addEventListener('change', apply);
    }

    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }

    apply();
  }
})();
