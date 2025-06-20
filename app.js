// app.js
const env = require('./utils/env');
const performance = require('./utils/performance');
const preloader = require('./utils/preloader');

// 管理器状态枚举
const ManagerState = {
  PENDING: 'pending',
  LOADING: 'loading', 
  READY: 'ready',
  FAILED: 'failed'
};

// 全局管理器实例
let managers = {
  user: null,
  ticket: null,
  map: null
};

// 管理器状态跟踪
let managerStates = {
  user: ManagerState.PENDING,
  ticket: ManagerState.PENDING,
  map: ManagerState.PENDING
};

App({
  async onLaunch() {
    try {
      // 性能监控开始
      performance.mark('app_launch_start');
      
      // 按职责分离的初始化流程
      await this.initializeEnvironment();
      await this.initializeCloudDevelopment();
      await this.initializeStorage();
      await this.initializeSystemInfo();
      await this.initializeManagers();
      await this.initializeUpdates();
      
      // 性能监控结束
      performance.mark('app_launch_end');
      performance.measure('app_launch', 'app_launch_start', 'app_launch_end');
      
      console.log('应用启动完成');
    } catch (error) {
      console.error('应用启动失败:', error);
      this.handleLaunchError(error);
    }
  },
  
  // 初始化环境配置
  async initializeEnvironment() {
    try {
      env.init();
      console.log('环境配置初始化完成');
    } catch (error) {
      console.error('环境配置初始化失败:', error);
      // 环境配置失败不应阻止应用启动
    }
  },
  
  // 初始化云开发环境
  async initializeCloudDevelopment() {
    try {
      if (!wx.cloud) {
        console.warn('当前微信版本不支持云开发');
        this.globalData.cloudEnabled = false;
        return;
      }

      // 初始化云开发
      wx.cloud.init({
        env: env.getCloudEnv(), // 从环境配置中获取云环境ID
        traceUser: true
      });

      // 验证云开发连接
      const result = await wx.cloud.callFunction({
        name: 'userLogin',
        data: { test: true }
      }).catch(() => null);

      if (result) {
        console.log('云开发初始化成功');
        this.globalData.cloudEnabled = true;
      } else {
        console.warn('云开发连接验证失败，使用本地模拟模式');
        this.globalData.cloudEnabled = false;
      }
    } catch (error) {
      console.error('云开发初始化失败:', error);
      this.globalData.cloudEnabled = false;
      // 云开发失败不应阻止应用启动，可以降级到本地模式
    }
  },
  
  // 初始化本地存储
  async initializeStorage() {
    try {
      // 展示本地存储能力
      const logs = wx.getStorageSync('logs') || [];
      logs.unshift(Date.now());
      wx.setStorageSync('logs', logs);
      
      console.log('本地存储初始化完成');
    } catch (error) {
      console.error('本地存储初始化失败:', error);
      // 存储失败不应阻止应用启动
    }
  },
  
  // 初始化系统信息 
  async initializeSystemInfo() {
    try {
      // 使用新的API替换废弃的wx.getSystemInfoSync
      const [deviceInfo, windowInfo, appBaseInfo] = await Promise.all([
        new Promise((resolve) => {
          try {
            resolve(wx.getDeviceInfo ? wx.getDeviceInfo() : {});
          } catch (e) {
            resolve({});
          }
        }),
        new Promise((resolve) => {
          try {
            resolve(wx.getWindowInfo ? wx.getWindowInfo() : {});
          } catch (e) {
            resolve({});
          }
        }),
        new Promise((resolve) => {
          try {
            resolve(wx.getAppBaseInfo ? wx.getAppBaseInfo() : {});
          } catch (e) {
            resolve({});
          }
        })
      ]);
      
      // 合并系统信息
      const systemInfo = {
        ...deviceInfo,
        ...windowInfo,
        ...appBaseInfo
      };
      
      this.globalData.systemInfo = systemInfo;
      console.log('系统信息获取完成:', systemInfo);
      
      // 记录性能相关参数
      if (performance.recordSystemInfo) {
        performance.recordSystemInfo(systemInfo);
      }
    } catch (error) {
      console.error('获取系统信息失败:', error);
      // 设置默认系统信息
      this.globalData.systemInfo = {
        platform: 'unknown',
        version: '0.0.0',
        model: 'unknown'
      };
    }
  },
  
  // 初始化管理器
  async initializeManagers() {
    // 异步初始化各个管理模块（不阻塞应用启动）
    this.initializeManagersAsync();
  },
  
  // 初始化更新检查
  async initializeUpdates() {
    try {
      this.checkForUpdates();
      console.log('更新检查初始化完成');
    } catch (error) {
      console.error('更新检查初始化失败:', error);
      // 更新检查失败不应阻止应用启动
    }
  },
  
  // 简化的管理器初始化逻辑
  async initializeManagersAsync() {
    // 管理器配置表 - 统一管理所有管理器的导入路径和类名
    const managerConfigs = [
      { name: 'user', path: './utils/user', className: 'UserManager' },
      { name: 'ticket', path: './utils/ticket', className: 'TicketManager' },
      { name: 'map', path: './utils/map', className: 'MapManager' }
    ];

    // 单个管理器初始化函数
    const initSingleManager = async (config) => {
      try {
        managerStates[config.name] = ManagerState.LOADING;
        
        // 标准化的导入逻辑
        const ManagerModule = require(config.path);
        let managerInstance = null;

        // 按优先级尝试不同的导出格式
        if (ManagerModule[config.className]) {
          // 标准类导出 (推荐)
          managerInstance = new ManagerModule[config.className]();
        } else if (typeof ManagerModule === 'function') {
          // 函数/类直接导出
          managerInstance = new ManagerModule();
        } else if (ManagerModule.default) {
          // ES6 默认导出
          managerInstance = new ManagerModule.default();
        } else {
          throw new Error(`${config.name}管理器未找到有效的导出格式`);
        }

        // 调用初始化方法（如果存在）
        if (managerInstance.init && typeof managerInstance.init === 'function') {
          await managerInstance.init();
        }

        managers[config.name] = managerInstance;
        managerStates[config.name] = ManagerState.READY;
        console.log(`${config.name}管理器初始化成功`);

      } catch (error) {
        console.error(`${config.name}管理器初始化失败:`, error);
        managerStates[config.name] = ManagerState.FAILED;
        managers[config.name] = this.createFallbackManager(config.name);
      }
    };

    // 延迟启动，避免阻塞应用启动
    setTimeout(async () => {
      try {
        // 并行初始化所有管理器
        await Promise.allSettled(
          managerConfigs.map(config => initSingleManager(config))
        );

        // 统计初始化结果
        const results = managerConfigs.reduce((acc, config) => {
          const state = managerStates[config.name];
          acc[state === ManagerState.READY ? 'success' : 'failed'].push(config.name);
          return acc;
        }, { success: [], failed: [] });

        // 输出结果日志
        if (results.failed.length > 0) {
          console.warn(`管理器初始化失败: ${results.failed.join(', ')}`);
        }
        if (results.success.length > 0) {
          console.log(`管理器初始化成功: ${results.success.join(', ')}`);
        }

        // 设置全局状态
        this.globalData.managersReady = true;
        this.globalData.managerStates = { ...managerStates };

      } catch (error) {
        console.error('管理器批量初始化过程出错:', error);
      }
    }, 100);
  },

  // 创建降级管理器
  createFallbackManager(managerName) {
    const fallbackManagers = {
      user: {
        checkLoginStatus: () => false,
        validateToken: () => Promise.resolve(false),
        getCurrentUser: () => null,
        isLoggedIn: false,
        userInfo: null,
        login: () => Promise.resolve({ success: false, message: '用户管理器不可用' }),
        logout: () => Promise.resolve({ success: true })
      },
      ticket: {
        getTicketTypes: () => Promise.resolve({ success: false, message: '票务管理器不可用' }),
        createOrder: () => Promise.resolve({ success: false, message: '票务管理器不可用' }),
        getOrders: () => Promise.resolve({ success: false, data: [] })
      },
      map: {
        initialize: () => Promise.resolve(false),
        getCurrentLocation: () => Promise.resolve(null),
        searchNearby: () => Promise.resolve([])
      }
    };
    
    return fallbackManagers[managerName] || {};
  },

  // 安全获取管理器实例，带状态检查
  getUserManager() {
    if (managerStates.user === ManagerState.READY && managers.user) {
      return managers.user;
    }
    
    // 如果管理器未就绪，返回降级管理器
    if (!managers.user) {
      managers.user = this.createFallbackManager('user');
    }
    
    return managers.user;
  },

  getTicketManager() {
    if (managerStates.ticket === ManagerState.READY && managers.ticket) {
      return managers.ticket;
    }
    
    if (!managers.ticket) {
      managers.ticket = this.createFallbackManager('ticket');
    }
    
    return managers.ticket;
  },

  getMapManager() {
    if (managerStates.map === ManagerState.READY && managers.map) {
      return managers.map;
    }
    
    if (!managers.map) {
      managers.map = this.createFallbackManager('map');
    }
    
    return managers.map;
  },

  // 检查管理器是否就绪
  isManagerReady(managerName) {
    return managerStates[managerName] === ManagerState.READY;
  },

  // 等待管理器就绪
  waitForManager(managerName, timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.isManagerReady(managerName)) {
        resolve(managers[managerName]);
        return;
      }
      
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        if (this.isManagerReady(managerName)) {
          clearInterval(checkInterval);
          resolve(managers[managerName]);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`等待${managerName}管理器超时`));
        }
      }, 100);
    });
  },
  
  checkForUpdates() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('发现新版本');
        }
      });
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });
      
      updateManager.onUpdateFailed(() => {
        console.error('新版本下载失败');
      });
    }
  },
  
  handleLaunchError(error) {
    // 记录错误
    console.error('启动错误:', error);
    
    // 显示错误提示
    wx.showToast({
      title: '启动异常，请重试',
      icon: 'error',
      duration: 3000
    });
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
    if (!this.globalData.systemInfo) {
      try {
        // 使用新的API替换废弃的wx.getSystemInfoSync
        const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
        const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
        const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
        
        this.globalData.systemInfo = {
          ...deviceInfo,
          ...windowInfo,
          ...appBaseInfo
        };
      } catch (error) {
        console.error('获取系统信息失败:', error);
        this.globalData.systemInfo = {
          platform: 'unknown',
          screenWidth: 375,
          screenHeight: 667
        };
      }
    }
    return this.globalData.systemInfo;
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
              avatar: 'https://img.icons8.com/fluency/96/user-male-circle.png'
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
  
  onShow() {
    // 应用从后台进入前台时触发
    if (performance && performance.mark) {
      performance.mark('app_show');
    }
    
    // 检查用户登录状态 - 添加安全检查
    try {
      const userManager = this.getUserManager();
      if (userManager && userManager.checkLoginStatus) {
        const token = wx.getStorageSync('user_token');
        if (token && userManager.validateToken) {
          userManager.validateToken(token);
        }
      }
    } catch (error) {
      console.log('用户状态检查失败:', error);
    }
  },
  
  onHide() {
    // 应用从前台进入后台时触发
    performance.mark('app_hide');
    
    // 同步离线数据到服务器
    this.syncOfflineData();
  },
  
  async syncOfflineData() {
    try {
      const offlineData = this.globalData.offlineData;
      if (offlineData.length > 0 && this.getUserManager().checkLoginStatus()) {
        // TODO: 实现离线数据同步逻辑
        console.log('同步离线数据:', offlineData.length, '条');
        
        // 清空已同步的数据
        this.globalData.offlineData = [];
      }
    } catch (error) {
      console.error('离线数据同步失败:', error);
    }
  },
  
  onError(error) {
    // 应用发生脚本错误或 API 调用报错时触发
    console.error('应用错误:', error);
    
    // 记录错误信息
    performance.recordError({
      type: 'app_error',
      message: error,
      timestamp: Date.now()
    });
  },
  
  globalData: {
    userInfo: null,
    hasLogin: false,
    offlineData: [],
    systemInfo: null,
    networkType: 'unknown',
    loadingStatus: {
      isPreloaded: false,
      preloadTime: 0
    },
    managersReady: false,
    managerStates: {},
    cloudEnabled: false
  },
  
  // 获取网络状态
  getNetworkType() {
    wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType;
      },
      fail: (error) => {
        console.error('获取网络状态失败:', error);
      }
    });
    return this.globalData.networkType;
  },
  
  // 添加离线数据
  addOfflineData(data) {
    this.globalData.offlineData.push({
      ...data,
      timestamp: Date.now()
    });
  }
})
