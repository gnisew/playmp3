// 簡化的 MP3 波形播放器插件
(function() {
    // 創建樣式（保持不變）
    const style = document.createElement('style');
    style.textContent = `
        .mp3wave-player {
            margin: 10px 0;
            position: relative;
        }
        .mp3wave-player .waveform {
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .mp3wave-player .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // 主函數
    function createMP3WaveformPlayer(element) {
        const mp3Url = element.getAttribute('data-mp3-url');
        if (!mp3Url) {
            console.error('沒有提供 MP3 URL');
            return;
        }

        // 獲取屬性
        let playMode = element.getAttribute('data-play-mode') || 'default';
        const waveColor = element.getAttribute('data-wave-color') || '#4CAF50';
        const progressColor = element.getAttribute('data-progress-color') || '#45a049';
        const width = element.getAttribute('data-width') || '100%';
        const height = parseInt(element.getAttribute('data-height') || '128');

        element.classList.add('mp3wave-player');
        element.style.width = width;

        // 創建波形圖容器
        const waveformDiv = document.createElement('div');
        waveformDiv.classList.add('waveform');
        waveformDiv.style.height = `${height}px`;
        waveformDiv.style.width = width;
        element.appendChild(waveformDiv);

        // 創建遮罩層
        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        element.appendChild(overlay);

        // 初始化 WaveSurfer
        const wavesurfer = WaveSurfer.create({
            container: waveformDiv,
            waveColor: waveColor,
            progressColor: progressColor,
            cursorColor: '#333',
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 1,
            height: height,
            barGap: 2,
            interact: true // 允許所有模式下的交互
        });

        // 載入音頻
        wavesurfer.load(mp3Url);

        // 音頻載入完成事件
        wavesurfer.on('ready', function() {
            // 設置點擊事件處理
            overlay.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                if (playMode === 'restart') {
                    wavesurfer.stop();
                    wavesurfer.seekTo(0);
                    wavesurfer.play();
                } else { // default mode
                    const clickPosition = e.offsetX / overlay.offsetWidth;
                    if (wavesurfer.isPlaying()) {
                        wavesurfer.pause();
                    } else {
                        wavesurfer.seekTo(clickPosition);
                        wavesurfer.play();
                    }
                }
            });
        });

        // 播放結束事件
        wavesurfer.on('finish', function() {
            if (playMode === 'restart') {
                wavesurfer.seekTo(0);
            }
        });
    }

    // 初始化所有 mp3wave 元素
    function initAllPlayers() {
        const players = document.querySelectorAll('mp3wave');
        players.forEach(createMP3WaveformPlayer);
    }

    // 當 DOM 載入完成時初始化所有播放器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllPlayers);
    } else {
        initAllPlayers();
    }

    // 設置一個 MutationObserver 來處理動態添加的元素
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === Node.ELEMENT_NODE && node.matches('mp3wave')) {
                    createMP3WaveformPlayer(node);
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();
