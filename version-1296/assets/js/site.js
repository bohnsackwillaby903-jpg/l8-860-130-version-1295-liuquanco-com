(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dotsWrap = document.querySelector("[data-hero-dots]");
      var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];
      var index = 0;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
          slide.classList.toggle("active", itemIndex === index);
        });
        dots.forEach(function (dot, itemIndex) {
          dot.classList.toggle("active", itemIndex === index);
        });
      }

      dots.forEach(function (dot, itemIndex) {
        dot.addEventListener("click", function () {
          show(itemIndex);
        });
      });

      show(0);
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var searchInput = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilters() {
      if (!cards.length) {
        return;
      }

      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        var matched = matchedKeyword && matchedYear;
        card.classList.toggle("is-hidden", !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("show", visible === 0);
      }
    }

    if (searchInput || yearFilter) {
      if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
      }
      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }

      var query = new URLSearchParams(window.location.search).get("q");
      if (query && searchInput) {
        searchInput.value = query;
      }
      applyFilters();
    }
  });
})();
