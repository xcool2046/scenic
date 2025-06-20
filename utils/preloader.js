/**
 * 预加载工具
 * 优化首屏加载速度，减少白屏时间
 */

// 导入其他工具模块
const cache = require('./cache');
const imageOptimizer = require('./imageOptimizer');

const preloader = {
  // 关键资源预加载状态
  loadingState: {
    weatherLoaded: false,
    spotsLoaded: false,
    configLoaded: false,
    commonImagesLoaded: false
  },
  
  // 预加载超时时间（毫秒）
  PRELOAD_TIMEOUT: 3000,
  
  // 常用图片资源
  commonImages: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    'https://img.icons8.com/fluency/96/sun.png',
    'https://img.icons8.com/fluency/96/ticket.png',
    'https://img.icons8.com/fluency/96/map-marker.png'
  ],
  
  /**
   * 初始化预加载
   * @param {Function} callback - 预加载完成回调
   */
  initPreload(callback) {
    const startTime = Date.now();
    
    // 并行加载所有资源
    this.loadWeatherData();
    this.loadSpotsData();
    this.loadConfigData();
    this.preloadCommonImages();
    
    // 监听所有资源加载状态
    const checkInterval = setInterval(() => {
      if (this.isAllResourceLoaded()) {
        clearInterval(checkInterval);
        const loadTime = Date.now() - startTime;
        console.log('预加载完成，耗时:', loadTime + 'ms');
        
        if (callback) callback({success: true, loadTime});
      }
      
      // 超时保护，最多等待指定时间
      if (Date.now() - startTime > this.PRELOAD_TIMEOUT) {
        clearInterval(checkInterval);
        console.warn('预加载超时，部分资源未加载完成');
        
        // 记录哪些资源未加载完成
        const unloadedResources = Object.keys(this.loadingState)
          .filter(key => !this.loadingState[key]);
        
        if (callback) {
          callback({
            success: false, 
            loadTime: Date.now() - startTime,
            unloadedResources
          });
        }
      }
    }, 100);
  },
  
  /**
   * 检查是否所有资源都已加载
   * @returns {Boolean} - 是否全部加载完成
   */
  isAllResourceLoaded() {
    return Object.values(this.loadingState).every(state => state === true);
  },
  
  /**
   * 加载天气数据
   */
  loadWeatherData() {
    // 检查缓存
    const cachedWeather = cache.getCache('weather_data');
    if (cachedWeather) {
      this.loadingState.weatherLoaded = true;
      return;
    }
    
    // 从API加载
    const api = require('./api');
    api.getWeather('default_location')
      .then(data => {
        cache.setCache('weather_data', data, 30 * 60); // 缓存30分钟
        this.loadingState.weatherLoaded = true;
      })
      .catch(() => {
        // 加载失败也标记为完成，避免阻塞其它资源
        this.loadingState.weatherLoaded = true;
      });
  },
  
  /**
   * 加载景点数据
   */
  loadSpotsData() {
    const cachedSpots = cache.getCache('spots_data');
    if (cachedSpots) {
      this.loadingState.spotsLoaded = true;
      return;
    }
    
    const api = require('./api');
    api.getSpotsCongestInfo()
      .then(data => {
        cache.setCache('spots_data', data, 5 * 60); // 缓存5分钟
        this.loadingState.spotsLoaded = true;
      })
      .catch(() => {
        this.loadingState.spotsLoaded = true;
      });
  },
  
  /**
   * 加载应用配置数据
   */
  loadConfigData() {
    const cachedConfig = cache.getCache('app_config');
    if (cachedConfig) {
      this.loadingState.configLoaded = true;
      return;
    }
    
    // 这里可以从服务器加载配置，现在使用模拟数据
    setTimeout(() => {
      // 模拟配置数据
      const mockConfig = {
        version: '1.0.0',
        features: {
          enableWeather: true,
          enableRealtime: true,
          enableGuide: true
        },
        ui: {
          theme: 'default',
          primaryColor: '#1AAD19'
        }
      };
      
      cache.setCache('app_config', mockConfig, 24 * 60 * 60); // 缓存24小时
      this.loadingState.configLoaded = true;
    }, 200);
  },
  
  /**
   * 预加载常用图片
   */
  preloadCommonImages() {
    imageOptimizer.preloadImages(this.commonImages)
      .then(() => {
        this.loadingState.commonImagesLoaded = true;
      })
      .catch(() => {
        // 即使加载失败也标记为完成
        this.loadingState.commonImagesLoaded = true;
      });
  },
  
  /**
   * 获取预加载的数据
   * @param {String} key - 数据键名
   * @returns {Object} - 预加载的数据
   */
  getPreloadedData(key) {
    switch(key) {
      case 'weather':
        return cache.getCache('weather_data');
      case 'spots':
        return cache.getCache('spots_data');
      case 'config':
        return cache.getCache('app_config');
      default:
        return null;
    }
  },
  
  /**
   * 清除预加载缓存
   * @param {String} key - 可选，指定要清除的缓存键，不指定则清除所有
   */
  clearPreloadCache(key) {
    if (key) {
      switch(key) {
        case 'weather':
          cache.removeCache('weather_data');
          break;
        case 'spots':
          cache.removeCache('spots_data');
          break;
        case 'config':
          cache.removeCache('app_config');
          break;
      }
    } else {
      // 清除所有预加载缓存
      cache.removeCache('weather_data');
      cache.removeCache('spots_data');
      cache.removeCache('app_config');
    }
  }
};

module.exports = preloader; 