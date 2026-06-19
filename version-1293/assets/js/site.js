(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-control.prev");
        var next = slider.querySelector(".hero-control.next");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-tags") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-type") || "",
            card.getAttribute("data-year") || ""
        ].join(" ").toLowerCase();
    }

    function setupListTools() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-list]"));
        boxes.forEach(function (box) {
            var input = box.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(box.querySelectorAll("[data-filter-value]"));
            var cards = Array.prototype.slice.call(box.querySelectorAll(".movie-card, .rank-row"));
            var empty = box.querySelector(".empty-state");
            var activeFilter = "all";
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var matchText = !q || textOf(card).indexOf(q) !== -1;
                    var matchFilter = activeFilter === "all" || textOf(card).indexOf(activeFilter.toLowerCase()) !== -1;
                    var ok = matchText && matchFilter;
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }
            if (input) {
                var params = new URLSearchParams(window.location.search);
                var initial = params.get("q");
                if (initial && !input.value) {
                    input.value = initial;
                }
                input.addEventListener("input", apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    activeFilter = chip.getAttribute("data-filter-value") || "all";
                    apply();
                });
            });
            apply();
        });
    }

    function setupSearchRedirect() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-redirect]"));
        inputs.forEach(function (input) {
            input.addEventListener("keydown", function (event) {
                if (event.key !== "Enter") {
                    return;
                }
                var q = input.value.trim();
                if (q) {
                    window.location.href = "./search.html?q=" + encodeURIComponent(q);
                } else {
                    window.location.href = "./search.html";
                }
            });
        });
    }

    function setupPlayer() {
        var frames = Array.prototype.slice.call(document.querySelectorAll(".player-frame"));
        frames.forEach(function (frame) {
            var video = frame.querySelector("video");
            var button = frame.querySelector(".player-start");
            if (!video || !button) {
                return;
            }
            var stream = button.getAttribute("data-stream") || "";
            function play() {
                if (!stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    if (!video.src) {
                        video.src = stream;
                    }
                    video.play().catch(function () {});
                    frame.classList.add("is-playing");
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    if (!video.hlsReady) {
                        var hls = new window.Hls();
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                        video.hlsReady = true;
                    }
                    video.play().catch(function () {});
                    frame.classList.add("is-playing");
                    return;
                }
                if (!video.src) {
                    video.src = stream;
                }
                video.play().catch(function () {});
                frame.classList.add("is-playing");
            }
            button.addEventListener("click", play);
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupListTools();
        setupSearchRedirect();
        setupPlayer();
    });
})();
