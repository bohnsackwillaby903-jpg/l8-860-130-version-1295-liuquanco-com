(function () {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    var url = new URL(window.location.href);
    var query = url.searchParams.get('q') || '';
    var searchInputs = document.querySelectorAll('[data-filter-input]');

    searchInputs.forEach(function (input) {
        if (query && !input.value) {
            input.value = query;
        }
    });

    function applyFilter(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var select = scope.querySelector('[data-category-select]');
        var items = scope.querySelectorAll('.movie-item');
        var empty = scope.querySelector('.no-result');
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var category = select ? select.value : '';
        var visible = 0;

        items.forEach(function (item) {
            var text = (item.getAttribute('data-search') || '').toLowerCase();
            var itemCategory = item.getAttribute('data-category') || '';
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedCategory = !category || itemCategory === category;
            var matched = matchedKeyword && matchedCategory;
            item.classList.toggle('is-hidden-item', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    document.querySelectorAll('[data-filter-list]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var select = scope.querySelector('[data-category-select]');

        if (input) {
            input.addEventListener('input', function () {
                applyFilter(scope);
            });
        }

        if (select) {
            select.addEventListener('change', function () {
                applyFilter(scope);
            });
        }

        if ((input && input.value) || (select && select.value)) {
            applyFilter(scope);
        }
    });

    function bindPlayer(player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('.player-cover');
        var source = player.getAttribute('data-stream');
        var loaded = false;

        function load() {
            if (!video || !source) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hls = hls;
                } else {
                    video.src = source;
                }
                loaded = true;
            }

            if (cover) {
                cover.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', load);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded) {
                    load();
                }
            });
        }
    }

    document.querySelectorAll('.player-box[data-stream]').forEach(bindPlayer);
})();
