(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var slideIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        slideIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('active', itemIndex === slideIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('active', itemIndex === slideIndex);
        });
    }

    function restartTimer() {
        if (!slides.length) {
            return;
        }
        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(slideIndex + 1);
        }, 5200);
    }

    if (slides.length) {
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartTimer();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(slideIndex - 1);
                restartTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(slideIndex + 1);
                restartTimer();
            });
        }
        restartTimer();
    }

    var liveGrid = document.querySelector('[data-live-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var currentFilter = 'all';
    var pageSearchForm = document.querySelector('[data-page-search]');
    var pageSearchInput = pageSearchForm ? pageSearchForm.querySelector('input[name="q"]') : null;

    function queryValue() {
        if (!pageSearchInput) {
            return '';
        }
        return pageSearchInput.value.trim().toLowerCase();
    }

    function applyFilters() {
        if (!cards.length || !liveGrid) {
            return;
        }
        var query = queryValue();
        var shown = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var type = card.getAttribute('data-type') || '';
            var typeMatch = currentFilter === 'all' || type === currentFilter;
            var queryMatch = !query || text.indexOf(query) !== -1;
            var visible = typeMatch && queryMatch;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            currentFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    if (pageSearchInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        pageSearchInput.value = initial;
        pageSearchInput.addEventListener('input', applyFilters);
        applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            if (pageSearchForm && form === pageSearchForm) {
                event.preventDefault();
                var nextUrl = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
                window.history.replaceState(null, '', nextUrl);
                applyFilters();
                return;
            }
            if (!value) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });
}());
