// 改進的 MP3 波形播放器插件
(function() {
    // 創建樣式
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
        .mp3wave-player .status {
            margin-top: 10px;
            text-align: center;
            color: #666;
            font-size: 14px;
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
            statusDiv.textContent = playMode === 'restart' 
                ? '音頻已載入，點擊從頭播放' 
                : '音頻已載入，點擊播放/暫停';

            // 設置點擊事件處理
            overlay.addEventListener('click', function(e) {
                e.preventDefault(); // 防止事件傳播到 WaveSurfer 內部
                if (playMode === 'restart') {
                    wavesurfer.stop(); // 停止當前播放
                    wavesurfer.seekTo(0); // 將播放位置重置到開始
                    wavesurfer.play(); // 從頭開始播放
                    isPlaying = true;
                } else { // default mode
                    if (!isPlaying) {
                        if (wavesurfer.getCurrentTime() === wavesurfer.getDuration()) {
                            wavesurfer.seekTo(0);
                        }
                        wavesurfer.play();
                    } else {
                        wavesurfer.pause();
                    }
                    isPlaying = !isPlaying;
                }
            });
        });

        wavesurfer.on('finish', function() {
            isPlaying = false;
            if (playMode === 'restart') {
                wavesurfer.seekTo(0);
            }
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
