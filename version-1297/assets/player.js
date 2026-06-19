import { H as Hls } from './hls.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

ready(function () {
  var shell = document.querySelector('[data-player-shell]');
  var video = document.querySelector('#moviePlayer');
  var start = document.querySelector('[data-player-start]');
  var message = document.querySelector('[data-player-message]');

  if (!shell || !video || !start) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function attachSource() {
    if (!source) {
      setMessage('当前影片没有可用播放源。');
      return Promise.reject(new Error('Missing source'));
    }

    video.setAttribute('controls', 'controls');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      if (!hlsInstance) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('播放源加载失败，请稍后重试。');
          }
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      }

      return Promise.resolve();
    }

    setMessage('当前浏览器暂不支持 HLS 播放。');
    return Promise.reject(new Error('HLS not supported'));
  }

  start.addEventListener('click', function () {
    start.hidden = true;
    setMessage('正在加载播放源...');

    attachSource()
      .then(function () {
        return video.play();
      })
      .then(function () {
        setMessage('');
      })
      .catch(function () {
        start.hidden = false;
      });
  });
});
