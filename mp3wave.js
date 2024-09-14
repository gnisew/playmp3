// 增强的MP3波形播放器插件
(function() {
    // 创建样式（保持不变）
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

    // 主函数
    function createMP3WaveformPlayer(element) {
        const mp3Url = element.getAttribute('data-mp3-url');
        if (!mp3Url) {
            console.error('No MP3 URL provided');
            return;
        }

        // 获取属性
        let playMode = element.getAttribute('data-play-mode');
        const waveColor = element.getAttribute('data-wave-color') || '#4CAF50';
        const progressColor = element.getAttribute('data-progress-color') || '#45a049';
        const width = element.getAttribute('data-width') || '100%';
        const height = parseInt(element.getAttribute('data-height') || '128');

        element.classList.add('mp3wave-player');
        element.style.width = width;

        // 创建波形图容器
        const waveformDiv = document.createElement('div');
        waveformDiv.classList.add('waveform');
        waveformDiv.style.height = `${height}px`;
        element.appendChild(waveformDiv);

        // 创建状态显示元素
        const statusDiv = document.createElement('div');
        statusDiv.classList.add('status');
        element.appendChild(statusDiv);

        // 初始化WaveSurfer
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

        // 加载音频
        wavesurfer.load(mp3Url);

        // 音频加载完成事件
        wavesurfer.on('ready', function() {
            const duration = wavesurfer.getDuration();
            
            // 如果没有设置 playMode，根据音频长度决定
            if (!playMode) {
                playMode = duration < 10 ? 'restart' : 'default';
            }

            // 设置点击事件处理
            waveformDiv.addEventListener('click', function(e) {
                if (playMode === 'restart') {
                    if (wavesurfer.isPlaying()) {
                        wavesurfer.stop();
                    } else {
                        wavesurfer.stop();
                        wavesurfer.play();
                    }
                } else {
                    wavesurfer.playPause();
                }
            });

            statusDiv.textContent = playMode === 'restart' 
                ? '音频已加载，点击播放/停止' 
                : '音频已加载，点击播放/暂停';
        });

        // 错误处理
        wavesurfer.on('error', function(e) {
            console.error('WaveSurfer error:', e);
            statusDiv.textContent = '加载音频时出错：' + e;
        });

        // 加载进度
        wavesurfer.on('loading', function(percent) {
            statusDiv.textContent = '加载进度：' + percent + '%';
        });
    }

    // 初始化所有mp3wave元素
    function initAllPlayers() {
        const players = document.querySelectorAll('mp3wave');
        players.forEach(createMP3WaveformPlayer);
    }

    // 当DOM加载完成时初始化所有播放器
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllPlayers);
    } else {
        initAllPlayers();
    }

    // 设置一个MutationObserver来处理动态添加的元素
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
