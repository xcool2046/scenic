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
    
    // 景点列表
    spotList: [],
    currentSpotIndex: 0,
    
    // 页面状态
    loading: true,
    error: false,
    
    // 用户位置信息
    userLocation: null,
  },

  onLoad(options) {
    console.log('音频导游页面开始加载:', options);
    
    // 直接加载数据，简化流程
    this.loadSpotList();
    
    // 初始化音频管理器
    this.initAudioManager();
    
    // 处理传入参数
    if (options.spotId) {
      setTimeout(() => {
        this.navigateToSpot(options.spotId);
      }, 100);
    }
    
    console.log('页面加载完成');
  },

  onShow() {
    // 更新页面标题
    wx.setNavigationBarTitle({
      title: '码上导游'
    });
    
    // 恢复音频状态
    this.resumeAudioState();
    
    // 如果处于播放状态，恢复进度更新
    setTimeout(() => {
      if (this.data.isPlaying && this.data.currentAudio) {
        console.log('onShow: 恢复播放进度');
        this.startSimulateProgress();
      }
    }, 200);
  },

  onHide() {
    console.log('onHide: 页面隐藏，停止进度更新');
    // 保存当前播放状态
    this.saveAudioState();
    
    // 停止进度更新以节省资源
    this.stopSimulateProgress();
  },

  onUnload() {
    console.log('onUnload: 页面卸载，清理所有资源');
    // 完整的资源清理
    this.cleanupAllResources();
  },

  /**
   * 初始化音频管理器
   */
  initAudioManager() {
    console.log('initAudioManager: 使用模拟音频播放模式');
    // 在演示环境中使用模拟播放，无需复杂的音频管理器初始化
  },

  /**
   * 加载景点列表
   */
  loadSpotList() {
    console.log('loadSpotList: 开始加载演示数据');
    
    // 演示数据 - 精简版
    const demoSpots = [
      {
        id: 1,
        name: '入口广场',
        description: '景区的主要入口，这里有美丽的喷泉和标志性建筑',
        audioUrl: 'demo_audio_1.mp3',
        audioDuration: 180,
        image: '../../assets/images/spots/spot1.jpg',
        latitude: 30.1234,
        longitude: 120.1234
      },
      {
        id: 2,
        name: '古树名木区',
        description: '这里有百年古树，见证了景区的历史变迁',
        audioUrl: 'demo_audio_2.mp3',
        audioDuration: 240,
        image: '../../assets/images/spots/spot2.jpg',
        latitude: 30.1244,
        longitude: 120.1244
      },
      {
        id: 3,
        name: '观景台',
        description: '最佳观景位置，可以俯瞰整个景区美景',
        audioUrl: 'demo_audio_3.mp3',
        audioDuration: 200,
        image: '../../assets/images/scenic_spots/waterfall.jpg',
        latitude: 30.1254,
        longitude: 120.1254
      },
      {
        id: 4,
        name: '文化展示区',
        description: '展示当地传统文化和历史文物',
        audioUrl: 'demo_audio_4.mp3',
        audioDuration: 300,
        image: '../../assets/images/scenic_spots/old_trees.jpg',
        latitude: 30.1264,
        longitude: 120.1264
      }
    ];
    
    console.log('loadSpotList: 演示数据准备完成，共', demoSpots.length, '个景点');
    
    // 一次性设置所有数据，确保页面能正常显示
    const updateData = {
      spotList: demoSpots,
      loading: false
    };
    
    // 默认加载第一个音频作为当前播放
    if (demoSpots.length > 0) {
      updateData.currentAudio = {
        ...demoSpots[0],
        title: demoSpots[0].name
      };
      updateData.currentSpotIndex = 0;
      console.log('loadSpotList: 设置默认音频:', updateData.currentAudio.title);
    }
    
    console.log('loadSpotList: 准备调用setData，数据:', updateData);
    this.setData(updateData);
    console.log('loadSpotList: setData调用完成，当前数据状态:', {
      spotListLength: this.data.spotList.length,
      currentAudio: this.data.currentAudio,
      loading: this.data.loading
    });
  },

  /**
   * 获取用户位置
   */
  getUserLocation() {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.setData({
          userLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
      },
      fail: (error) => {
        console.log('获取位置失败:', error);
      }
    });
  },

  /**
   * 导航到指定景点
   */
  navigateToSpot(spotId) {
    const spotIndex = this.data.spotList.findIndex(spot => spot.id == spotId);
    if (spotIndex !== -1) {
      this.playSpotByIndex(spotIndex);
    }
  },

  /**
   * 播放指定景点音频
   */
  playSpotAudio(spot) {
    console.log('playSpotAudio: 开始播放', spot.name);
    
    // 使用模拟音频播放，因为演示环境没有真实音频文件
    const duration = spot.audioDuration || 180;
    
    this.setData({
      currentAudio: {
        ...spot,
        title: spot.name
      },
      isPlaying: true,
      duration: duration,
      currentTime: 0,
      progress: 0
    });
    
    // 等待setData完成后再开始播放进度更新
    setTimeout(() => {
      this.startSimulateProgress();
    }, 50);
    
    console.log('playSpotAudio: 开始模拟播放');
  },

  /**
   * 开始模拟播放进度
   */
  startSimulateProgress() {
    // 清除之前的定时器
    this.stopSimulateProgress();
    
    // 每秒更新一次进度，模拟真实音频播放器
    this.progressTimer = setInterval(() => {
      if (this.data.isPlaying && this.data.currentAudio) {
        const currentTime = this.data.currentTime + 1; // 每次增加1秒
        const duration = this.data.duration || this.data.currentAudio.audioDuration || 180;
        const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
        
        // 检查是否播放完成
        if (currentTime >= duration) {
          this.onAudioEnded();
        } else {
          this.setData({
            currentTime: currentTime, // 整数秒数
            progress: Math.min(progress, 100),
            duration: duration
          });
        }
      } else {
        // 如果不在播放状态，停止定时器
        this.stopSimulateProgress();
      }
    }, 1000);
  },

  /**
   * 停止模拟播放进度
   */
  stopSimulateProgress() {
    if (this.progressTimer) {
      clearInterval(this.progressTimer);
      this.progressTimer = null;
      console.log('进度定时器已停止');
    }
  },

  // 音频事件处理
  onAudioPlay() {
    console.log('onAudioPlay: 开始播放');
    this.setData({ isPlaying: true });
    this.startSimulateProgress();
  },

  onAudioPause() {
    console.log('onAudioPause: 暂停播放');
    this.setData({ isPlaying: false });
    this.stopSimulateProgress();
  },

  onAudioStop() {
    this.setData({ 
      isPlaying: false,
      currentTime: 0,
      progress: 0
    });
    this.stopSimulateProgress();
  },

  onAudioTimeUpdate(e) {
    // 在模拟模式下不需要这个方法
  },

  onAudioEnded() {
    console.log('onAudioEnded: 播放结束');
    this.stopSimulateProgress();
    this.setData({ 
      isPlaying: false,
      currentTime: 0,
      progress: 0
    });
    
    // 自动播放下一首
    setTimeout(() => {
      this.playNext();
    }, 1000);
  },

  onAudioError(e) {
    console.error('音频播放错误:', e);
    this.setData({ isPlaying: false });
    this.stopSimulateProgress();
  },

  // 播放控制方法
  togglePlay() {
    console.log('togglePlay: 当前状态', this.data.isPlaying);
    
    if (this.data.isPlaying) {
      // 暂停播放
      console.log('执行暂停操作');
      this.setData({ isPlaying: false });
      this.stopSimulateProgress();
    } else {
      if (this.data.currentAudio) {
        // 恢复或开始播放
        console.log('执行播放操作');
        this.setData({ isPlaying: true });
        setTimeout(() => {
          if (this.data.isPlaying) {
            this.startSimulateProgress();
          }
        }, 50);
      }
    }
  },

  playNext() {
    const nextIndex = (this.data.currentSpotIndex + 1) % this.data.spotList.length;
    this.playSpotByIndex(nextIndex);
  },

  playPrevious() {
    const prevIndex = this.data.currentSpotIndex === 0 
      ? this.data.spotList.length - 1 
      : this.data.currentSpotIndex - 1;
    this.playSpotByIndex(prevIndex);
  },

  playSpotByIndex(index) {
    if (index >= 0 && index < this.data.spotList.length) {
      const spot = this.data.spotList[index];
      this.setData({ currentSpotIndex: index });
      this.playSpotAudio(spot);
    }
  },

  // UI交互方法
  onSpotTap(e) {
    const index = e.currentTarget.dataset.index;
    this.playSpotByIndex(index);
  },

  onProgressChange(e) {
    const progress = e.detail.value;
    const duration = this.data.duration || (this.data.currentAudio ? this.data.currentAudio.audioDuration : 0);
    
    if (duration > 0) {
      const currentTime = (progress / 100) * duration;
      
      // 先停止当前的进度更新
      this.stopSimulateProgress();
      
      this.setData({
        progress,
        currentTime: Math.round(currentTime * 10) / 10,
        duration
      });
      
      // 如果正在播放，延迟重新开始计时
      if (this.data.isPlaying) {
        setTimeout(() => {
          if (this.data.isPlaying) {
            this.startSimulateProgress();
          }
        }, 200);
      }
    }
  },

  // 状态保存和恢复
  saveAudioState() {
    wx.setStorageSync('audioGuideState', {
      currentSpotIndex: this.data.currentSpotIndex,
      currentTime: this.data.currentTime
    });
  },

  resumeAudioState() {
    try {
      const savedState = wx.getStorageSync('audioGuideState');
      if (savedState) {
        this.setData({
          currentSpotIndex: savedState.currentSpotIndex || 0
        });
      }
    } catch (error) {
      console.error('恢复音频状态失败:', error);
    }
  },

  cleanupAllResources() {
    console.log('cleanupAllResources: 开始清理所有资源');
    
    // 停止模拟播放
    this.stopSimulateProgress();
    
    // 重置播放状态
    this.setData({
      isPlaying: false,
      currentTime: 0,
      progress: 0
    });
    
    console.log('cleanupAllResources: 资源清理完成');
  },



  /**
   * 格式化时间
   */
  formatTime: function(seconds) {
    if (!seconds || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * 格式化时长
   */
  formatDuration: function(seconds) {
    if (!seconds || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation: function() {
    // 空函数，用于阻止事件冒泡
  },

  onShareAppMessage() {
    const currentAudio = this.data.currentAudio;
    return {
      title: currentAudio ? `正在听《${currentAudio.title}》语音导览` : '景悦达语音导游',
      path: `/pages/audio-guide/audio-guide${currentAudio ? `?spotId=${currentAudio.id}` : ''}`,
      imageUrl: currentAudio?.image || '/assets/images/share/audio-guide.jpg'
    };
  }
}); 