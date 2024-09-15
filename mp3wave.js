// 改進的 MP3 波形播放器插件
(function() {
    // 創建樣式
    const style = document.createElement('style');
    style.textContent = `
        .mp3wave-player {
            margin: 10px 0;
        }
        .mp3wave-player .waveform {
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .mp3wave-player .status {
            margin-top: 10px;
            text-align: center;
            color: #666;
            font-size: 14px;
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
        let playMode = element.getAttribute('data-play-mode');
        const waveColor = element.getAttribute('data-wave-color') || '#4CAF50';
        const progressColor = element.getAttribute('data-progress-color') || '#45a049';
        const width = element.getAttribute('data-width') || '100%';
        const height = parseInt(element.getAttribute('data-height') || '128');

        element.classList.add('mp3wave-player');
        element.style.width = width; // 直接設置元素寬度

        // 創建波形圖容器
        const waveformDiv = document.createElement('div');
        waveformDiv.classList.add('waveform');
        waveformDiv.style.height = `${height}px`;
        waveformDiv.style.width = width; // 確保波形圖填滿容器
        element.appendChild(waveformDiv);

        // 創建狀態顯示元素
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status');
        element.appendChild(statusDiv);

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
            barGap: 2
        });

        // 載入音頻
        wavesurfer.load(mp3Url);

        let isPlaying = false;

        // 音頻載入完成事件
        wavesurfer.on('ready', function() {
            const duration = wavesurfer.getDuration();

            // 如果沒有設置 playMode，根據音頻長度決定
            if (!playMode) {
                playMode = duration < 10 ? 'restart' : 'default';
            }

            // 設置點擊事件處理
            waveformDiv.addEventListener('click', function(e) {
                if (playMode === 'restart') {
                    const clickPosition = e.offsetX / waveformDiv.offsetWidth;
                    wavesurfer.seekTo(clickPosition);
                    if (!isPlaying) {
                        wavesurfer.play();
                        isPlaying = true;
                    }
                } else {
                    wavesurfer.playPause();
                    isPlaying = !isPlaying;
                }
            });

            statusDiv.textContent = playMode === 'restart' 
                ? '音頻已載入，點擊從頭播放' 
                : '音頻已載入，點擊播放/暫停';
        });

        // 錯誤處理
        wavesurfer.on('error', function(e) {
            console.error('WaveSurfer 錯誤:', e);
            statusDiv.textContent = '載入音頻時出錯：' + e;
        });

        // 載入進度
        wavesurfer.on('loading', function(percent) {
            statusDiv.textContent = '載入進度：' + percent + '%';
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
