// app.js
const preloader = require('./utils/preloader');
const performance = require('./utils/performance');
const cache = require('./utils/cache');

App({
  // 全局数据
  globalData: {
    userInfo: null,
    hasLogin: false,
    systemInfo: null,
    loadingStatus: {
      isPreloaded: false,
      preloadTime: 0
    },
    networkType: 'unknown',
    isConnected: true,
    isWeakNetwork: false,
    offlineData: {},
    // 全局性能配置
    performanceConfig: {
      enableImageLazyLoad: true,     // 启用图片懒加载
      enablePreload: true,           // 启用预加载
      enableDataCache: true,         // 启用数据缓存
      maxCacheAge: 30 * 60 * 1000,   // 缓存最大时间(30分钟)
      batchRender: true,             // 启用批量渲染
      listRenderBatchSize: 10,       // 列表每批渲染数量
      monitorPerformance: true       // 启用性能监控
    }
  },
  
  // 应用初始化
  onLaunch: function(options) {
    console.log('App onLaunch', options);
    
    // 记录应用启动性能
    performance.performanceMonitor.recordAppLaunch();
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 启动预加载
    this.startPreload();
    
    // 检查用户登录状态
    this.checkLoginStatus();
    
    // 检查网络状态
    this.checkNetworkStatus();
    
    // 设置性能监控
    this.setupPerformanceMonitor();
    
    // 预加载页面和资源
    this.preloadPages();
  },
  
  // 预加载应用资源
  startPreload() {
    preloader.initPreload(result => {
      this.globalData.loadingStatus.isPreloaded = result.success;
      this.globalData.loadingStatus.preloadTime = result.loadTime;
      
      console.log('预加载完成状态:', result.success ? '成功' : '部分失败', 
                 '耗时:', result.loadTime + 'ms');
      
      // 触发预加载完成事件
      if (this.preloadCallback) {
        this.preloadCallback(result);
      }
    });
  },
  
  // 注册预加载完成回调
  onPreloadFinish(callback) {
    if (this.globalData.loadingStatus.isPreloaded) {
      // 如果预加载已完成，直接执行回调
      callback({
        success: this.globalData.loadingStatus.isPreloaded,
        loadTime: this.globalData.loadingStatus.preloadTime
      });
    } else {
      // 否则保存回调等待预加载完成
      this.preloadCallback = callback;
    }
  },
  
  // 获取设备系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      console.log('系统信息:', systemInfo);
      
      // 记录性能相关参数
      performance.performanceMonitor.recordSystemInfo(systemInfo);
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
  },
  
  // 检查用户登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    if (token) {
      // 这里可以验证token有效性，简化版直接视为已登录
      this.globalData.hasLogin = true;
      
      // 获取用户信息
      this.getUserInfo();
    }
  },
  
  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },
  
  // 用户登录
  login(callback) {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 code 到后台进行登录验证
          // 实际项目中应调用后端API，这里使用模拟数据
          setTimeout(() => {
            // 模拟登录成功
            const mockUserInfo = {
              id: 'user_' + Date.now(),
              nickname: '游客' + Math.floor(Math.random() * 1000),
              avatar: '/assets/icons/default_avatar.png'
            };
            
            // 保存用户信息
            this.globalData.userInfo = mockUserInfo;
            this.globalData.hasLogin = true;
            
            wx.setStorageSync('token', 'mock_token_' + Date.now());
            wx.setStorageSync('userInfo', mockUserInfo);
            
            if (callback) callback(true, mockUserInfo);
          }, 300);
        } else {
          console.error('微信登录失败', res);
          if (callback) callback(false);
        }
      },
      fail: err => {
        console.error('登录接口调用失败', err);
        if (callback) callback(false);
      }
    });
  },
  
  // 用户登出
  logout(callback) {
    // 清除本地存储
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    
    // 重置全局数据
    this.globalData.userInfo = null;
    this.globalData.hasLogin = false;
    
    if (callback) callback(true);
  },
  
  // 应用显示事件
  onShow: function(options) {
    console.log('App onShow', options);
    
    // 记录应用显示性能
    performance.performanceMonitor.recordAppShow();
  },
  
  // 应用隐藏事件
  onHide: function() {
    console.log('App onHide');
    
    // 记录应用隐藏性能
    performance.performanceMonitor.recordAppHide();
  },
  
  // 应用错误事件
  onError: function(err) {
    console.error('App onError', err);
    
    // 记录错误信息
    performance.performanceMonitor.recordError('app', err);
  },
  
  // 页面不存在事件
  onPageNotFound: function(res) {
    console.error('App onPageNotFound', res);
    
    // 记录页面不存在错误
    performance.performanceMonitor.recordError('pageNotFound', res.path);
    
    // 导航到首页
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  
  // 预加载重要页面模板
  preloadPages() {
    // 预加载核心子包
    if (this.globalData.performanceConfig.enablePreload) {
      performance.renderOptimizer.preloadSubpackages(['ticket', 'guide']);
      
      // 预加载关键图片
      const criticalImages = [
        '/assets/images/banner.jpg',
        '/assets/images/map_preview.jpg'
      ];
      
      performance.imageOptimizer.preloadImages(criticalImages)
        .then(results => {
          console.log('预加载关键图片完成', results);
        });
    }
  },
  
  // 设置性能监控
  setupPerformanceMonitor() {
    // 记录到本地性能数据，便于后续分析
    performance.performanceMonitor.mark('app_cold_start');
    
    // 记录首屏渲染时间
    setTimeout(() => {
      performance.performanceMonitor.mark('app_first_render');
      const duration = performance.performanceMonitor.measure('app_cold_start', 'app_first_render');
      console.log(`首屏渲染耗时: ${duration}ms`);
    }, 1000);
    
    // 5分钟后上报一次性能数据
    setTimeout(() => {
      performance.performanceMonitor.reportPerformanceData();
    }, 5 * 60 * 1000);
  },
  
  // 检查网络状态并缓存
  checkNetworkStatus() {
    wx.getNetworkType({
      success: res => {
        this.globalData.networkType = res.networkType;
        
        // 如果是弱网络，预先提示用户并加载离线资源
        if (res.networkType === '2g' || res.networkType === 'none') {
          this.globalData.isWeakNetwork = true;
          // 加载离线数据
          this.loadOfflineData();
        }
      }
    });
    
    // 监听网络状态变化
    wx.onNetworkStatusChange(res => {
      this.globalData.networkType = res.networkType;
      this.globalData.isConnected = res.isConnected;
      
      // 网络恢复后，同步本地数据
      if (res.isConnected && this.globalData.isWeakNetwork) {
        this.globalData.isWeakNetwork = false;
        this.syncOfflineData();
      }
    });
  },
  
  // 加载离线数据
  loadOfflineData() {
    // 从本地缓存加载基础数据
    const cachedData = wx.getStorageSync('offlineData') || {};
    this.globalData.offlineData = cachedData;
    console.log('已加载离线数据缓存');
  },
  
  // 恢复网络后同步本地数据
  syncOfflineData() {
    const offlineActions = wx.getStorageSync('offlineActions') || [];
    
    // 如果有离线操作，提示用户
    if (offlineActions.length > 0) {
      wx.showModal({
        title: '网络已恢复',
        content: '是否同步离线期间的操作？',
        success: (res) => {
          if (res.confirm) {
            // TODO: 同步离线数据到服务器
            console.log('同步离线数据', offlineActions);
            // 同步完成后清除
            wx.removeStorageSync('offlineActions');
          }
        }
      });
    }
  }
})
