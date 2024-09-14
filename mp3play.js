// 改進的MP3聲波播放器插件
(function() {
    // 創建樣式
    const style = document.createElement('style');
    style.textContent = `
        .mp3-waveform-player {
            width: 100%;
            margin: 10px 0;
        }
        .mp3-waveform-player .waveform {
            width: 100%;
            height: 128px;
            background-color: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
        }
        .mp3-waveform-player .status {
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
            console.error('No MP3 URL provided');
            return;
        }

        element.classList.add('mp3-waveform-player');

        // 創建波形圖容器
        const waveformDiv = document.createElement('div');
        waveformDiv.classList.add('waveform');
        element.appendChild(waveformDiv);

        // 創建狀態顯示元素
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status');
        element.appendChild(statusDiv);

        // 初始化WaveSurfer
        const wavesurfer = WaveSurfer.create({
            container: waveformDiv,
            waveColor: '#4CAF50',
            progressColor: '#45a049',
            cursorColor: '#333',
            barWidth: 2,
            barRadius: 3,
            cursorWidth: 1,
            height: 128,
            barGap: 2
        });

        // 加載音頻
        wavesurfer.load(mp3Url);

        // 單擊事件：播放/暫停
        waveformDiv.addEventListener('click', function(e) {
            wavesurfer.playPause();
        });

        // 雙擊事件：從頭播放
        let lastClickTime = 0;
        waveformDiv.addEventListener('click', function(e) {
            const currentTime = new Date().getTime();
            const timeDiff = currentTime - lastClickTime;
            if (timeDiff < 300) {  // 300毫秒內的雙擊
                wavesurfer.stop();
                wavesurfer.play();
            }
            lastClickTime = currentTime;
        });

        // 音頻加載完成事件
        wavesurfer.on('ready', function() {
            statusDiv.textContent = '音頻已加載，點擊播放/暫停，雙擊從頭播放';
        });

        // 錯誤處理
        wavesurfer.on('error', function(e) {
            console.error('WaveSurfer error:', e);
            statusDiv.textContent = '加載音頻時出錯：' + e;
        });

        // 加載進度
        wavesurfer.on('loading', function(percent) {
            statusDiv.textContent = '加載進度：' + percent + '%';
        });
    }

    // 初始化所有mp3-waveform元素
    function initAllPlayers() {
        const players = document.querySelectorAll('mp3-waveform');
        players.forEach(createMP3WaveformPlayer);
    }

    // 當DOM加載完成時初始化所有播放器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllPlayers);
    } else {
        initAllPlayers();
    }

    // 設置一個MutationObserver來處理動態添加的元素
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === Node.ELEMENT_NODE && node.matches('mp3-waveform')) {
                    createMP3WaveformPlayer(node);
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();