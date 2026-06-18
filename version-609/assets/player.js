import { H as Hls } from './hls.js';

function showMessage(video, message) {
  var frame = video.closest('.video-frame');
  var box = frame ? frame.querySelector('[data-player-message]') : null;

  if (!box) {
    return;
  }

  box.textContent = message;
  box.hidden = false;
}

function hidePlayButton(video) {
  var frame = video.closest('.video-frame');
  var button = frame ? frame.querySelector('[data-play-button]') : null;

  if (button) {
    button.classList.add('hidden');
  }
}

function initVideo(video) {
  var stream = video.getAttribute('data-stream');

  if (!stream) {
    showMessage(video, '播放源暂不可用');
    return;
  }

  if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(stream);
    hls.attachMedia(video);

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        showMessage(video, '网络连接异常，正在重新加载');
        hls.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        showMessage(video, '播放出现波动，正在恢复');
        hls.recoverMediaError();
        return;
      }

      showMessage(video, '播放初始化失败，请刷新页面重试');
      hls.destroy();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
  } else {
    showMessage(video, '此浏览器无法播放该视频');
  }

  video.addEventListener('play', function () {
    hidePlayButton(video);
  });
}

Array.prototype.slice.call(document.querySelectorAll('.js-hls-player')).forEach(initVideo);

Array.prototype.slice.call(document.querySelectorAll('[data-play-button]')).forEach(function (button) {
  button.addEventListener('click', function () {
    var frame = button.closest('.video-frame');
    var video = frame ? frame.querySelector('.js-hls-player') : null;

    if (!video) {
      return;
    }

    hidePlayButton(video);
    video.play().catch(function () {
      showMessage(video, '点击播放器控件即可开始播放');
    });
  });
});
