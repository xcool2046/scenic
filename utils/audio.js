/**
 * 音频管理工具类
 * 提供音频播放、暂停、进度控制等功能
 */

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.isInitialized = false;
    this.callbacks = {
      onPlay: [],
      onPause: [],
      onStop: [],
      onEnded: [],
      onTimeUpdate: [],
      onError: []
    };
    
    this.initAudioContext();
  }

  /**
   * 初始化音频上下文
   */
  initAudioContext() {
    try {
      // 在小程序中使用全局音频管理器
      this.audioContext = wx.getBackgroundAudioManager();
      this.setupEventListeners();
      this.isInitialized = true;
    } catch (error) {
      console.error('音频上下文初始化失败:', error);
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    if (!this.audioContext) return;

    this.audioContext.onPlay(() => {
      this.triggerCallback('onPlay');
    });

    this.audioContext.onPause(() => {
      this.triggerCallback('onPause');
    });

    this.audioContext.onStop(() => {
      this.triggerCallback('onStop');
    });

    this.audioContext.onEnded(() => {
      this.triggerCallback('onEnded');
    });

    this.audioContext.onTimeUpdate(() => {
      const currentTime = this.audioContext.currentTime || 0;
      const duration = this.audioContext.duration || 0;
      this.triggerCallback('onTimeUpdate', currentTime, duration);
    });

    this.audioContext.onError((error) => {
      console.error('音频播放错误:', error);
      this.triggerCallback('onError', error);
    });
  }

  /**
   * 播放音频
   */
  play(url, title = '', singer = '导览系统') {
    if (!this.isInitialized || !url) {
      console.error('音频管理器未初始化或URL无效');
      return false;
    }

    try {
      this.audioContext.title = title;
      this.audioContext.singer = singer;
      this.audioContext.src = url;
      this.currentAudio = { url, title, singer };
      
      // 小程序会自动开始播放
      return true;
    } catch (error) {
      console.error('播放音频失败:', error);
      this.triggerCallback('onError', error);
      return false;
    }
  }

  /**
   * 暂停播放
   */
  pause() {
    if (!this.audioContext) return false;
    
    try {
      this.audioContext.pause();
      return true;
    } catch (error) {
      console.error('暂停播放失败:', error);
      return false;
    }
  }

  /**
   * 恢复播放
   */
  resume() {
    if (!this.audioContext) return false;
    
    try {
      this.audioContext.play();
      return true;
    } catch (error) {
      console.error('恢复播放失败:', error);
      return false;
    }
  }

  /**
   * 停止播放
   */
  stop() {
    if (!this.audioContext) return false;
    
    try {
      this.audioContext.stop();
      this.currentAudio = null;
      return true;
    } catch (error) {
      console.error('停止播放失败:', error);
      return false;
    }
  }

  /**
   * 跳转到指定时间
   */
  seek(time) {
    if (!this.audioContext || time < 0) return false;
    
    try {
      this.audioContext.seek(time);
      return true;
    } catch (error) {
      console.error('跳转失败:', error);
      return false;
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume) {
    // 注意：小程序背景音频管理器不支持音量控制
    // 这里只是提供接口，实际音量由系统控制
    console.log('设置音量:', volume);
  }

  /**
   * 获取当前播放状态
   */
  isPlaying() {
    if (!this.audioContext) return false;
    
    // 通过paused状态判断是否在播放
    return !this.audioContext.paused;
  }

  /**
   * 获取当前播放时间
   */
  getCurrentTime() {
    return this.audioContext ? (this.audioContext.currentTime || 0) : 0;
  }

  /**
   * 获取音频总时长
   */
  getDuration() {
    return this.audioContext ? (this.audioContext.duration || 0) : 0;
  }

  /**
   * 获取当前播放的音频信息
   */
  getCurrentAudio() {
    return this.currentAudio;
  }

  /**
   * 下载音频文件
   */
  downloadAudio(url, filename) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: url,
        success: (res) => {
          if (res.statusCode === 200) {
            // 保存到本地
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                console.log('音频下载成功:', saveRes.savedFilePath);
                
                // 保存下载记录
                this.saveDownloadRecord(url, filename, saveRes.savedFilePath);
                resolve(saveRes.savedFilePath);
              },
              fail: (error) => {
                console.error('保存音频失败:', error);
                reject(error);
              }
            });
          } else {
            reject(new Error('下载失败'));
          }
        },
        fail: (error) => {
          console.error('下载音频失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 保存下载记录
   */
  saveDownloadRecord(url, filename, localPath) {
    try {
      let downloads = wx.getStorageSync('audioDownloads') || [];
      
      // 避免重复记录
      const existingIndex = downloads.findIndex(item => item.url === url);
      if (existingIndex !== -1) {
        downloads[existingIndex] = {
          url,
          filename,
          localPath,
          downloadTime: new Date().toISOString()
        };
      } else {
        downloads.push({
          url,
          filename,
          localPath,
          downloadTime: new Date().toISOString()
        });
      }

      wx.setStorageSync('audioDownloads', downloads);
    } catch (error) {
      console.error('保存下载记录失败:', error);
    }
  }

  /**
   * 获取下载记录
   */
  getDownloadRecords() {
    try {
      return wx.getStorageSync('audioDownloads') || [];
    } catch (error) {
      console.error('获取下载记录失败:', error);
      return [];
    }
  }

  /**
   * 检查音频是否已下载
   */
  isAudioDownloaded(url) {
    const downloads = this.getDownloadRecords();
    return downloads.some(item => item.url === url);
  }

  /**
   * 获取本地音频路径
   */
  getLocalAudioPath(url) {
    const downloads = this.getDownloadRecords();
    const record = downloads.find(item => item.url === url);
    return record ? record.localPath : null;
  }

  /**
   * 注册事件回调
   */
  onPlay(callback) {
    this.callbacks.onPlay.push(callback);
  }

  onPause(callback) {
    this.callbacks.onPause.push(callback);
  }

  onStop(callback) {
    this.callbacks.onStop.push(callback);
  }

  onEnded(callback) {
    this.callbacks.onEnded.push(callback);
  }

  onTimeUpdate(callback) {
    this.callbacks.onTimeUpdate.push(callback);
  }

  onError(callback) {
    this.callbacks.onError.push(callback);
  }

  /**
   * 触发回调函数
   */
  triggerCallback(eventType, ...args) {
    const callbacks = this.callbacks[eventType] || [];
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`回调函数执行失败 (${eventType}):`, error);
      }
    });
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventType, callback) {
    if (this.callbacks[eventType]) {
      const index = this.callbacks[eventType].indexOf(callback);
      if (index > -1) {
        this.callbacks[eventType].splice(index, 1);
      }
    }
  }

  /**
   * 清理资源
   */
  destroy() {
    this.stop();
    this.callbacks = {
      onPlay: [],
      onPause: [],
      onStop: [],
      onEnded: [],
      onTimeUpdate: [],
      onError: []
    };
    this.currentAudio = null;
    this.audioContext = null;
    this.isInitialized = false;
  }
}

// 创建单例实例
const audioManager = new AudioManager();

module.exports = {
  audioManager,
  AudioManager
}; 