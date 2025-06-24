/**
 * 音频管理工具类 - 支持真实景区音频播放
 * 提供核心音频播放功能和备用源切换
 */

const config = require('./config');

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.currentAudio = null;
    this.isInitialized = false;
    this.currentSources = [];
    this.currentSourceIndex = 0;
    this.callbacks = {
      onPlay: [],
      onPause: [],
      onStop: [],
      onEnded: [],
      onTimeUpdate: [],
      onError: [],
      onCanplay: []
    };
    
    this.initAudioContext();
  }

  /**
   * 初始化音频上下文
   */
  initAudioContext() {
    try {
      this.audioContext = wx.createInnerAudioContext();
      
      // 配置音频属性以确保播放
      const playerConfig = config.AUDIO?.PLAYER_CONFIG || {};
      this.audioContext.autoplay = playerConfig.autoplay || false;
      this.audioContext.loop = playerConfig.loop || false;
      this.audioContext.obeyMuteSwitch = playerConfig.obeyMuteSwitch || false;
      this.audioContext.volume = playerConfig.volume || 0.8;
      
      this.setupAudioListeners();
      this.isInitialized = true;
      
      console.log('音频上下文初始化成功');
      
    } catch (error) {
      console.error('音频上下文初始化失败:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 设置音频事件监听器
   */
  setupAudioListeners() {
    if (!this.audioContext) return;

    // 播放事件
    this.audioContext.onPlay(() => {
      console.log('音频开始播放');
      this.triggerCallbacks('onPlay');
    });

    // 暂停事件
    this.audioContext.onPause(() => {
      console.log('音频暂停播放');
      this.triggerCallbacks('onPause');
    });

    // 停止事件
    this.audioContext.onStop(() => {
      console.log('音频停止播放');
      this.triggerCallbacks('onStop');
    });

    // 播放结束事件
    this.audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.triggerCallbacks('onEnded');
    });

    // 时间更新事件
    this.audioContext.onTimeUpdate(() => {
      this.triggerCallbacks('onTimeUpdate', {
        currentTime: this.audioContext.currentTime,
        duration: this.audioContext.duration
      });
    });

    // 音频可以播放事件
    this.audioContext.onCanplay(() => {
      console.log('音频可以播放');
      this.triggerCallbacks('onCanplay');
    });

    // 错误事件 - 支持备用源切换
    this.audioContext.onError((error) => {
      console.error('音频播放错误:', error);
      this.handleAudioError(error);
    });
  }

  /**
   * 处理音频播放错误，尝试备用音频源
   */
  handleAudioError(error) {
    console.log(`音频源 ${this.currentSourceIndex} 播放失败，尝试备用源`);
    
    // 尝试下一个音频源
    if (this.currentSourceIndex < this.currentSources.length - 1) {
      this.currentSourceIndex++;
      const nextUrl = this.currentSources[this.currentSourceIndex];
      
      console.log(`尝试备用音频源: ${nextUrl}`);
      this.audioContext.src = nextUrl;
      
      // 延迟一点再播放，给音频加载时间
      setTimeout(() => {
        this.audioContext.play();
      }, 500);
    } else {
      // 所有网络音频源都失败了，尝试本地降级方案
      console.log('所有网络音频源失败，尝试本地降级方案');
      
      if (config.AUDIO?.LOCAL_FALLBACK?.defaultAudio) {
        console.log('使用本地降级音频');
        this.audioContext.src = config.AUDIO.LOCAL_FALLBACK.defaultAudio;
        
        setTimeout(() => {
          this.audioContext.play();
        }, 300);
        
        // 显示降级提示
        wx.showToast({
          title: '网络音频不可用，使用测试音频',
          icon: 'none',
          duration: 2000
        });
      } else {
        // 最终失败
        console.error('所有音频源都无法播放');
        this.triggerCallbacks('onError', error);
        
        wx.showToast({
          title: '音频播放失败，请检查网络连接',
          icon: 'none',
          duration: 3000
        });
      }
    }
  }

  /**
   * 播放音频
   */
  play(audioInfo) {
    if (!this.isInitialized) {
      console.error('音频上下文未初始化');
      return false;
    }

    try {
      // 停止当前播放
      this.stop();

      // 准备音频源列表（主源+备用源+本地降级）
      this.currentSources = [audioInfo.url];
      
      // 添加备用音频源
      if (config.AUDIO?.BACKUP_SOURCES) {
        const backupSource = config.AUDIO.BACKUP_SOURCES.find(
          item => item.id === audioInfo.id
        );
        if (backupSource) {
          this.currentSources.push(backupSource.url);
        }
      }
      
      // 添加本地降级音频作为最后的备选
      if (config.AUDIO?.LOCAL_FALLBACK?.defaultAudio) {
        this.currentSources.push(config.AUDIO.LOCAL_FALLBACK.defaultAudio);
      }

      this.currentSourceIndex = 0;
      this.currentAudio = audioInfo;

      // 设置音频源
      this.audioContext.src = this.currentSources[0];
      
      console.log(`开始播放: ${audioInfo.title}`);
      console.log(`音频源: ${this.currentSources[0]}`);
      
      // 播放音频
      this.audioContext.play();
      
      return true;
    } catch (error) {
      console.error('播放音频失败:', error);
      return false;
    }
  }

  /**
   * 暂停播放
   */
  pause() {
    if (this.audioContext) {
      this.audioContext.pause();
    }
  }

  /**
   * 停止播放
   */
  stop() {
    if (this.audioContext) {
      this.audioContext.stop();
    }
    this.currentAudio = null;
  }

  /**
   * 设置播放位置
   */
  seek(time) {
    if (this.audioContext) {
      this.audioContext.seek(time);
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume) {
    if (this.audioContext) {
      this.audioContext.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * 获取当前播放状态
   */
  getPlayState() {
    if (!this.audioContext) {
      return {
        currentTime: 0,
        duration: 0,
        paused: true
      };
    }

    return {
      currentTime: this.audioContext.currentTime || 0,
      duration: this.audioContext.duration || 0,
      paused: this.audioContext.paused
    };
  }

  /**
   * 添加事件回调
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * 移除事件回调
   */
  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  /**
   * 触发回调函数
   */
  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`回调函数执行错误 [${event}]:`, error);
        }
      });
    }
  }

  /**
   * 销毁音频管理器
   */
  destroy() {
    if (this.audioContext) {
      this.audioContext.destroy();
      this.audioContext = null;
    }
    this.isInitialized = false;
    this.currentAudio = null;
    this.callbacks = {
      onPlay: [],
      onPause: [],
      onStop: [],
      onEnded: [],
      onTimeUpdate: [],
      onError: [],
      onCanplay: []
    };
  }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager();

module.exports = {
  audioManager
}; 