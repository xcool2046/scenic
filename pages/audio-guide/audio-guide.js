// pages/audio-guide/audio-guide.js
const config = require('../../utils/config');
const { audioManager } = require('../../utils/audio');

Page({
  data: {
    config,
    
    // 当前播放信息
    currentAudio: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    
    // 格式化时间显示
    currentTimeText: '0:00',
    durationText: '0:00',
    
    // 景点列表 - 使用真实音频数据
    spotList: [],
    currentSpotIndex: 0,
    
    // 页面状态
    loading: true,
    error: false,
  },

  onLoad(options) {
    console.log('音频导游页面开始加载:', options);
    
    // 加载真实景区音频数据
    this.loadRealAudioData();
    this.initAudioManager();
    
    // 处理传入参数
    if (options.spotId) {
      setTimeout(() => {
        this.navigateToSpot(options.spotId);
      }, 500);
    }
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: '码上导游'
    });
    this.resumeAudioState();
  },

  onHide() {
    this.saveAudioState();
  },

  onUnload() {
    // 页面卸载时停止音频播放
    if (audioManager) {
      audioManager.stop();
    }
  },

  /**
   * 加载真实景区音频数据
   */
  loadRealAudioData() {
    try {
      const spotList = config.AUDIO?.SCENIC_SPOTS || [];
      
      if (spotList.length === 0) {
        console.warn('未找到景区音频数据');
        this.setData({
          error: true,
          loading: false
        });
        return;
      }

      // 为每个音频项添加格式化的时长文本
      const formattedSpotList = spotList.map(spot => ({
        ...spot,
        durationText: this.formatDuration(spot.duration)
      }));

      this.setData({
        spotList: formattedSpotList,
        loading: false,
        error: false
      });

      console.log(`成功加载 ${formattedSpotList.length} 个景区音频`);
      
    } catch (error) {
      console.error('加载音频数据失败:', error);
      this.setData({
        error: true,
        loading: false
      });
    }
  },

  /**
   * 格式化时间为显示文本
   */
  formatTime(seconds) {
    if (!seconds || seconds < 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * 格式化时长为显示文本
   */
  formatDuration(duration) {
    if (!duration || duration < 60) {
      return `${duration || 0}秒`;
    }
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    if (seconds > 0) {
      return `${minutes}分${seconds}秒`;
    } else {
      return `${minutes}分`;
    }
  },

  /**
   * 初始化音频管理器
   */
  initAudioManager() {
    // 监听播放状态变化
    audioManager.on('onPlay', () => {
      this.setData({ isPlaying: true });
    });

    audioManager.on('onPause', () => {
      this.setData({ isPlaying: false });
    });

    audioManager.on('onStop', () => {
      this.setData({ 
        isPlaying: false,
        currentTime: 0,
        progress: 0,
        currentTimeText: '0:00'
      });
    });

    audioManager.on('onEnded', () => {
      this.setData({ 
        isPlaying: false,
        currentTime: 0,
        progress: 0,
        currentTimeText: '0:00'
      });
      
      // 自动播放下一个
      this.playNext();
    });

    audioManager.on('onTimeUpdate', (data) => {
      const { currentTime, duration } = data;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
      
      this.setData({
        currentTime: currentTime || 0,
        duration: duration || 0,
        progress: progress,
        currentTimeText: this.formatTime(currentTime || 0),
        durationText: this.formatTime(duration || 0)
      });
    });

    audioManager.on('onError', (error) => {
      console.error('音频播放错误:', error);
      this.setData({ isPlaying: false });
      
      wx.showToast({
        title: '播放失败，请重试',
        icon: 'none',
        duration: 2000
      });
    });

    audioManager.on('onCanplay', () => {
      console.log('音频准备就绪，可以播放');
    });
  },

  /**
   * 播放指定音频
   */
  playAudio(e) {
    const { index } = e.currentTarget.dataset;
    const audio = this.data.spotList[index];
    
    if (!audio) {
      wx.showToast({
        title: '音频不存在',
        icon: 'none'
      });
      return;
    }

    console.log('准备播放音频:', audio.title);

    // 如果是同一个音频且正在播放，则暂停
    if (this.data.currentAudio?.id === audio.id && this.data.isPlaying) {
      audioManager.pause();
      return;
    }

    // 播放新音频
    const success = audioManager.play(audio);
    
    if (success) {
      this.setData({
        currentAudio: audio,
        currentSpotIndex: index,
        isPlaying: true
      });

      // 显示播放提示
      wx.showToast({
        title: `正在播放: ${audio.title}`,
        icon: 'none',
        duration: 1500
      });
    } else {
      wx.showToast({
        title: '播放失败，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 暂停/恢复播放
   */
  togglePlay() {
    if (!this.data.currentAudio) {
      wx.showToast({
        title: '请先选择要播放的音频',
        icon: 'none'
      });
      return;
    }

    if (this.data.isPlaying) {
      audioManager.pause();
    } else {
      // 如果没有正在播放的音频，重新播放当前选中的
      const success = audioManager.play(this.data.currentAudio);
      if (!success) {
        wx.showToast({
          title: '播放失败，请重试',
          icon: 'none'
        });
      }
    }
  },



  /**
   * 播放上一个
   */
  playPrevious() {
    const { spotList, currentSpotIndex } = this.data;
    if (spotList.length === 0) return;

    const prevIndex = currentSpotIndex > 0 ? currentSpotIndex - 1 : spotList.length - 1;
    const prevAudio = spotList[prevIndex];

    if (prevAudio) {
      const success = audioManager.play(prevAudio);
      if (success) {
        this.setData({
          currentAudio: prevAudio,
          currentSpotIndex: prevIndex,
          isPlaying: true
        });
      }
    }
  },

  /**
   * 播放下一个
   */
  playNext() {
    const { spotList, currentSpotIndex } = this.data;
    if (spotList.length === 0) return;

    const nextIndex = currentSpotIndex < spotList.length - 1 ? currentSpotIndex + 1 : 0;
    const nextAudio = spotList[nextIndex];

    if (nextAudio) {
      const success = audioManager.play(nextAudio);
      if (success) {
        this.setData({
          currentAudio: nextAudio,
          currentSpotIndex: nextIndex,
          isPlaying: true
        });
      }
    }
  },

  /**
   * 进度条拖动
   */
  onProgressChange(e) {
    const { value } = e.detail;
    const { duration } = this.data;
    
    if (duration > 0) {
      const seekTime = (value / 100) * duration;
      audioManager.seek(seekTime);
    }
  },



  /**
   * 导航到指定景点
   */
  navigateToSpot(spotId) {
    const { spotList } = this.data;
    const index = spotList.findIndex(spot => spot.id === spotId);
    
    if (index !== -1) {
      const audio = spotList[index];
      const success = audioManager.play(audio);
      
      if (success) {
        this.setData({
          currentAudio: audio,
          currentSpotIndex: index,
          isPlaying: true
        });
      }
    }
  },

  /**
   * 保存音频播放状态
   */
  saveAudioState() {
    try {
      const state = audioManager.getPlayState();
      wx.setStorageSync('audioGuideState', {
        currentAudio: this.data.currentAudio,
        currentTime: state.currentTime,
        currentSpotIndex: this.data.currentSpotIndex
      });
    } catch (error) {
      console.error('保存音频状态失败:', error);
    }
  },

  /**
   * 恢复音频播放状态
   */
  resumeAudioState() {
    try {
      const savedState = wx.getStorageSync('audioGuideState');
      if (savedState && savedState.currentAudio) {
        this.setData({
          currentAudio: savedState.currentAudio,
          currentSpotIndex: savedState.currentSpotIndex || 0
        });

        // 可选择是否自动恢复播放位置
        if (savedState.currentTime > 5) { // 超过5秒才恢复位置
          setTimeout(() => {
            audioManager.seek(savedState.currentTime);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('恢复音频状态失败:', error);
    }
  },

  /**
   * 刷新音频列表
   */
  refreshAudioList() {
    this.setData({ loading: true });
    setTimeout(() => {
      this.loadRealAudioData();
    }, 500);
  },

  /**
   * 分享音频 (简化版)
   */
  onShareAppMessage() {
    const { currentAudio } = this.data;
    if (currentAudio) {
      return {
        title: `听听这个景点的故事：${currentAudio.title}`,
        path: `/pages/audio-guide/audio-guide?spotId=${currentAudio.id}`,
        imageUrl: currentAudio.image
      };
    }
    return {
      title: '码上导游 - 音频导览',
      path: '/pages/audio-guide/audio-guide'
    };
  }
}); 