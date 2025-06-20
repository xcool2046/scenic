/**
 * 环境配置管理模块
 * 统一管理不同环境下的配置参数
 * 
 * 注意：所有环境都使用本地资源路径 '/assets/'，确保图片在各个环境下都能正常显示
 * 如需使用CDN，请确保CDN服务可用且资源已正确上传
 */

// 获取当前环境
const getCurrentEnv = () => {
  // 在微信小程序中检测环境
  const accountInfo = wx.getAccountInfoSync && wx.getAccountInfoSync();
  const env = accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : 'release';
  
  // 环境映射
  const envMap = {
    'develop': 'development',
    'trial': 'testing', 
    'release': 'production'
  };
  
  return envMap[env] || 'production';
};

// 环境配置
const ENV_CONFIG = {
  development: {
    // 开发环境配置
    API_BASE: 'http://localhost:3000/api',
    USE_MOCK: true,
    AMAP_KEY: 'ff4fe7650c6f228431922e91706b6ab5', // 开发环境高德Key
    CDN_BASE: '/assets/',
    CLOUD_ENV: 'cloud1-0grmnwqfdee9eb9d', // 云开发环境ID (开发环境)
    ENABLE_DEBUG: true,
    CACHE_DURATION: 5 * 60 * 1000, // 5分钟缓存
    REQUEST_TIMEOUT: 10000, // 10秒超时
    PERFORMANCE_MONITOR: true
  },
  
  testing: {
    // 测试环境配置
    API_BASE: 'https://test-api.yourscenic.com/v1',
    USE_MOCK: false,
    AMAP_KEY: 'your_test_amap_key',
    CDN_BASE: '/assets/',
    CLOUD_ENV: 'cloud1-0grmnwqfdee9eb9d', // 云开发环境ID (测试环境)
    ENABLE_DEBUG: true,
    CACHE_DURATION: 15 * 60 * 1000, // 15分钟缓存
    REQUEST_TIMEOUT: 8000,
    PERFORMANCE_MONITOR: true
  },
  
  production: {
    // 生产环境配置
    API_BASE: 'https://api.yourscenic.com/v1',
    USE_MOCK: false,
    AMAP_KEY: 'your_prod_amap_key',
    CDN_BASE: '/assets/',
    CLOUD_ENV: 'cloud1-0grmnwqfdee9eb9d', // 云开发环境ID (生产环境)
    ENABLE_DEBUG: false,
    CACHE_DURATION: 30 * 60 * 1000, // 30分钟缓存
    REQUEST_TIMEOUT: 5000,
    PERFORMANCE_MONITOR: false
  }
};

// 获取当前环境配置
const getConfig = () => {
  const currentEnv = getCurrentEnv();
  const config = ENV_CONFIG[currentEnv];
  
  if (!config) {
    console.warn(`未找到环境 ${currentEnv} 的配置，使用生产环境配置`);
    return ENV_CONFIG.production;
  }
  
  return {
    ...config,
    CURRENT_ENV: currentEnv
  };
};

// 检查是否为开发环境
const isDevelopment = () => {
  return getCurrentEnv() === 'development';
};

// 检查是否为生产环境
const isProduction = () => {
  return getCurrentEnv() === 'production';
};

// 获取API基础URL
const getApiBase = () => {
  return getConfig().API_BASE;
};

// 获取CDN基础URL
const getCdnBase = () => {
  return getConfig().CDN_BASE;
};

// 是否使用模拟数据
const shouldUseMock = () => {
  return getConfig().USE_MOCK;
};

// 获取高德地图Key
const getAmapKey = () => {
  return getConfig().AMAP_KEY;
};

// 获取云开发环境ID
const getCloudEnv = () => {
  return getConfig().CLOUD_ENV;
};

// 获取缓存时长
const getCacheDuration = () => {
  return getConfig().CACHE_DURATION;
};

// 获取请求超时时间
const getRequestTimeout = () => {
  return getConfig().REQUEST_TIMEOUT;
};

// 是否启用调试
const isDebugEnabled = () => {
  return getConfig().ENABLE_DEBUG;
};

// 是否启用性能监控
const isPerformanceMonitorEnabled = () => {
  return getConfig().PERFORMANCE_MONITOR;
};

// 调试日志
const debugLog = (message, data = null) => {
  if (isDebugEnabled()) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

// 错误日志
const errorLog = (message, error = null) => {
  console.error(`[ERROR] ${message}`, error || '');
  
  // 在生产环境中可以上报错误
  if (isProduction()) {
    // TODO: 实现错误上报逻辑
  }
};

// 初始化环境配置
const init = () => {
  const currentEnv = getCurrentEnv();
  debugLog(`环境初始化: ${currentEnv}`);
  
  // 设置全局调试状态
  if (typeof global !== 'undefined') {
    global.DEBUG_MODE = isDebugEnabled();
  }
  
  return getConfig();
};

module.exports = {
  init,
  getCurrentEnv,
  getConfig,
  isDevelopment,
  isProduction,
  getApiBase,
  getCdnBase,
  shouldUseMock,
  getAmapKey,
  getCloudEnv,
  getCacheDuration,
  getRequestTimeout,
  isDebugEnabled,
  isPerformanceMonitorEnabled,
  debugLog,
  errorLog
};