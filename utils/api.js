/**
 * API工具模块，用于处理景区实时信息相关API请求
 */

const env = require('./env');
const cache = require('./cache');

// 请求配置
const API_CONFIG = {
  timeout: env.getRequestTimeout() || 10000,
  retryCount: 3,
  retryDelay: 1000
};

// 请求状态枚举
const RequestStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  TIMEOUT: 'timeout'
};

// 统一请求拦截器
class RequestInterceptor {
  constructor() {
    this.requestQueue = new Map();
    this.retryDelays = [1000, 2000, 3000]; // 递增延迟
  }

  // 生成请求ID
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 统一的请求方法
  async request(url, options = {}) {
    const requestId = this.generateRequestId();
    const config = {
      method: 'GET',
      data: {},
      header: {},
      timeout: API_CONFIG.timeout,
      retryCount: API_CONFIG.retryCount,
      cache: false,
      cacheTime: 300,
      ...options
    };

    // 检查缓存
    if (config.cache && config.method === 'GET') {
      const cacheKey = this.getCacheKey(url, config.data);
      const cachedData = cache.getCache(cacheKey);
      if (cachedData) {
        env.debugLog(`使用缓存数据: ${url}`, cachedData);
        return cachedData;
      }
    }

    // 添加到请求队列
    this.requestQueue.set(requestId, {
      url,
      config,
      status: RequestStatus.PENDING,
      startTime: Date.now()
    });

    return this.executeRequest(requestId, url, config);
  }

  // 执行请求，支持重试
  async executeRequest(requestId, url, config, retryCount = 0) {
    const request = this.requestQueue.get(requestId);
    
    try {
      const result = await this.performRequest(url, config);
      
      // 更新请求状态
      if (request) {
        request.status = RequestStatus.SUCCESS;
        request.endTime = Date.now();
        request.duration = request.endTime - request.startTime;
      }
      
      // 缓存结果
      if (config.cache && config.method === 'GET') {
        const cacheKey = this.getCacheKey(url, config.data);
        cache.setCache(cacheKey, result, config.cacheTime);
      }
      
      // 记录成功日志
      env.debugLog(`API请求成功: ${config.method} ${url}`, {
        duration: request?.duration,
        result: result
      });
      
      // 清理请求队列
      this.requestQueue.delete(requestId);
      
      return result;
      
    } catch (error) {
      // 记录错误
      env.errorLog('API请求失败', {
        requestId,
        url,
        method: config.method,
        retryCount,
        error: error.message
      });
      
      // 判断是否需要重试
      if (retryCount < config.retryCount && this.shouldRetry(error)) {
        const delay = this.retryDelays[retryCount] || API_CONFIG.retryDelay;
        
        env.debugLog(`API请求重试 (${retryCount + 1}/${config.retryCount}): ${url}`, {
          delay,
          error: error.message
        });
        
        // 延迟后重试
        await this.sleep(delay);
        return this.executeRequest(requestId, url, config, retryCount + 1);
      }
      
      // 更新请求状态
      if (request) {
        request.status = RequestStatus.FAILED;
        request.endTime = Date.now();
        request.error = error.message;
      }
      
      throw error;
    }
  }

  // 执行实际的网络请求
  performRequest(url, config) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`请求超时: ${config.timeout}ms`));
      }, config.timeout);

      wx.request({
        url,
        method: config.method,
        data: config.data,
        header: {
          'content-type': 'application/json',
          ...this.getCommonHeaders(),
          ...config.header
        },
        success: (res) => {
          clearTimeout(timeout);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            const error = new Error(`HTTP错误: ${res.statusCode}`);
            error.statusCode = res.statusCode;
            error.data = res.data;
            reject(error);
          }
        },
        fail: (err) => {
          clearTimeout(timeout);
          reject(new Error(`网络请求失败: ${err.errMsg || err.message || '未知错误'}`));
        }
      });
    });
  }

  // 获取通用请求头
  getCommonHeaders() {
    const headers = {};
    
    // 添加授权信息
    const token = wx.getStorageSync('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 添加设备信息
    const systemInfo = wx.getStorageSync('systemInfo');
    if (systemInfo) {
      headers['X-Device-Info'] = JSON.stringify({
        platform: systemInfo.platform,
        version: systemInfo.version,
        model: systemInfo.model
      });
    }
    
    // 添加请求ID用于追踪
    headers['X-Request-ID'] = this.generateRequestId();
    
    return headers;
  }

  // 生成缓存键
  getCacheKey(url, data) {
    const dataStr = data ? JSON.stringify(data) : '';
    return `api_${url}_${dataStr}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  // 判断是否应该重试
  shouldRetry(error) {
    // 网络错误、超时错误、5xx服务器错误应该重试
    if (error.message.includes('超时') || 
        error.message.includes('网络') ||
        error.message.includes('fail')) {
      return true;
    }
    
    // HTTP 5xx 错误应该重试
    if (error.statusCode && error.statusCode >= 500) {
      return true;
    }
    
    return false;
  }

  // 延迟函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 获取请求统计
  getRequestStats() {
    const stats = {
      total: 0,
      pending: 0,
      success: 0,
      failed: 0,
      avgDuration: 0
    };
    
    let totalDuration = 0;
    
    this.requestQueue.forEach(request => {
      stats.total++;
      if (request.status === RequestStatus.PENDING) stats.pending++;
      else if (request.status === RequestStatus.SUCCESS) stats.success++;
      else if (request.status === RequestStatus.FAILED) stats.failed++;
      
      if (request.duration) {
        totalDuration += request.duration;
      }
    });
    
    if (stats.success > 0) {
      stats.avgDuration = Math.round(totalDuration / stats.success);
    }
    
    return stats;
  }
}

// 创建全局请求拦截器实例
const requestInterceptor = new RequestInterceptor();

// 便捷的请求方法
const request = (url, method = 'GET', data = {}, options = {}) => {
  return requestInterceptor.request(url, {
    method,
    data,
    ...options
  });
};

// GET请求（支持缓存）
const get = (url, data = {}, options = {}) => {
  return request(url, 'GET', data, {
    cache: true,
    cacheTime: 300,
    ...options
  });
};

// POST请求
const post = (url, data = {}, options = {}) => {
  return request(url, 'POST', data, options);
};

// PUT请求
const put = (url, data = {}, options = {}) => {
  return request(url, 'PUT', data, options);
};

// DELETE请求
const del = (url, data = {}, options = {}) => {
  return request(url, 'DELETE', data, options);
};

// 高德地图天气API配置
const AMAP_WEATHER_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';

// 检查是否使用模拟数据
const shouldUseMockData = () => {
  return env.shouldUseMock();
};

// 获取实时天气信息
const getWeather = async (location) => {
  // 使用模拟数据
  if (shouldUseMockData()) {
    env.debugLog('使用模拟天气数据');
    return getMockWeather();
  }
  
  // 解析位置信息，高德天气API需要城市编码或经纬度
  let city = location;
  
  // 如果传入的是经纬度，直接使用
  if (location.includes(',')) {
    city = location;
  }
  
  // 使用高德地图天气API
  const url = `${AMAP_WEATHER_URL}?key=${env.getAmapKey()}&city=${city}&extensions=base`;
  
  try {
    const res = await get(url, {}, { 
      cache: true, 
      cacheTime: 1800, // 缓存30分钟
      retryCount: 2 
    });
    
    // 转换高德天气API返回数据格式为应用所需格式
    if (res.status === '1' && res.lives && res.lives.length > 0) {
      return {
        code: '200',
        now: formatAmapWeather(res.lives[0]),
        updateTime: new Date().toISOString()
      };
    } else {
      // 如果API调用失败，返回模拟数据
      env.errorLog('高德天气API返回异常，使用模拟数据', res);
      return getMockWeather();
    }
  } catch (err) {
    env.errorLog('获取天气数据失败', err);
    return getMockWeather();
  }
};

// 格式化高德天气数据为应用统一格式
const formatAmapWeather = (amapWeather) => {
  // 高德天气API返回的天气现象映射到对应的中文描述
  const weatherMapping = {
    '晴': '晴',
    '多云': '多云',
    '阴': '阴',
    '阵雨': '小雨',
    '雷阵雨': '雷阵雨',
    '雷阵雨伴有冰雹': '雷阵雨',
    '雨夹雪': '小雪',
    '小雨': '小雨',
    '中雨': '中雨',
    '大雨': '大雨',
    '暴雨': '大雨',
    '大暴雨': '大雨',
    '特大暴雨': '大雨',
    '小雪': '小雪',
    '中雪': '中雪',
    '大雪': '大雪',
    '暴雪': '大雪',
    '冻雨': '小雨',
    '沙尘暴': '多云',
    '浮尘': '多云',
    '扬沙': '多云',
    '强沙尘暴': '多云',
    '霾': '阴',
    '雾': '阴'
  };

  return {
    temp: amapWeather.temperature,
    text: weatherMapping[amapWeather.weather] || amapWeather.weather,
    windDir: amapWeather.winddirection,
    windScale: amapWeather.windpower.replace('级', ''),
    humidity: amapWeather.humidity,
    precip: '0.0', // 高德基础天气API没有降水量，这里给一个默认值
    pressure: '1013' // 高德基础天气API没有气压，这里给一个默认值
  };
};

// 获取天气预报（未来几天）
const getWeatherForecast = async (location) => {
  // 使用模拟数据
  if (shouldUseMockData()) {
    return getMockWeatherForecast();
  }
  
  // 解析位置信息，同上
  let city = location;
  
  if (location.includes(',')) {
    city = location;
  }
  
  // 使用高德地图天气预报API
  const url = `${AMAP_WEATHER_URL}?key=${env.getAmapKey()}&city=${city}&extensions=all`;
  
  try {
    const res = await get(url, {}, { 
      cache: true, 
      cacheTime: 3600, // 缓存1小时
      retryCount: 2 
    });
    
    // 转换高德天气预报API返回数据格式为应用所需格式
    if (res.status === '1' && res.forecasts && res.forecasts.length > 0 && res.forecasts[0].casts) {
      return {
        code: '200',
        daily: formatAmapForecast(res.forecasts[0].casts),
        updateTime: new Date().toISOString()
      };
    } else {
      // 如果API调用失败，返回模拟数据
      env.errorLog('高德天气预报API返回异常，使用模拟数据', res);
      return getMockWeatherForecast();
    }
  } catch (err) {
    env.errorLog('获取天气预报数据失败', err);
    return getMockWeatherForecast();
  }
};

// 格式化高德天气预报数据为应用统一格式
const formatAmapForecast = (amapForecasts) => {
  return amapForecasts.map(forecast => {
    return {
      fxDate: forecast.date,
      tempMax: forecast.daytemp,
      tempMin: forecast.nighttemp,
      textDay: forecast.dayweather,
      textNight: forecast.nightweather,
      windDirDay: forecast.daywind + '风',
      windScaleDay: forecast.daypower,
      humidity: '80', // 高德预报API没有湿度信息，这里给一个默认值
      precip: '0.0'  // 高德预报API没有降水量，这里给一个默认值
    };
  });
};

// 获取景区人流量信息（需接入景区实际API）
const getCrowdInfo = async () => {
  // 使用模拟数据以确保稳定运行
  if (shouldUseMockData()) {
    env.debugLog('使用模拟人流量数据');
    return getMockCrowdInfo();
  }
  
  // 实际项目中应对接景区自己的API
  // const url = `${BASE_API_URL}/crowd/realtime`;
  // try {
  //   const result = await get(url, {}, { cache: true, cacheTime: 60 });
  //   return result;
  // } catch (error) {
  //   env.errorLog('获取人流量数据失败', error);
  //   return getMockCrowdInfo();
  // }
  
  return getMockCrowdInfo();
};

// 获取景点拥堵信息（需接入景区实际API）
const getSpotsCongestInfo = async () => {
  // 使用模拟数据
  if (shouldUseMockData()) {
    env.debugLog('使用模拟拥堵数据');
    return getMockSpotsCongestInfo();
  }
  
  // 实际项目中应对接景区自己的API
  // const url = `${BASE_API_URL}/spots/congestion`;
  // try {
  //   const result = await get(url, {}, { cache: true, cacheTime: 120 });
  //   return result;
  // } catch (error) {
  //   env.errorLog('获取拥堵数据失败', error);
  //   return getMockSpotsCongestInfo();
  // }
  
  return getMockSpotsCongestInfo();
};

// ==========  订单和支付相关 API ==========

/**
 * 创建门票订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise} - 返回订单创建结果的Promise
 */
const createTicketOrder = (orderData) => {
  // 实际项目中应对接景区订单API
  // const url = `${BASE_API_URL}/orders/create`;
  // return request(url, 'POST', orderData, getHeaders());
  
  // 使用模拟数据
  console.log('使用模拟订单创建数据', orderData);
  return Promise.resolve(getMockCreateOrderResult(orderData));
};

/**
 * 查询订单状态
 * @param {String} orderId - 订单ID
 * @returns {Promise} - 返回订单状态的Promise
 */
const queryTicketOrder = (orderId) => {
  // 实际项目中应对接景区订单查询API
  // const url = `${BASE_API_URL}/orders/${orderId}`;
  // return request(url, 'GET', {}, getHeaders());
  
  // 使用模拟数据
  console.log('使用模拟订单查询数据', orderId);
  return Promise.resolve(getMockOrderStatusResult(orderId));
};

/**
 * 获取用户所有订单
 * @returns {Promise} - 返回用户订单列表的Promise
 */
const getUserOrders = () => {
  // 实际项目中应对接景区用户订单API
  // const url = `${BASE_API_URL}/user/orders`;
  // return request(url, 'GET', {}, getHeaders());
  
  // 使用模拟数据
  console.log('使用模拟用户订单列表数据');
  return Promise.resolve(getMockUserOrdersResult());
};

/**
 * 申请退款
 * @param {String} orderId - 订单ID
 * @param {Object} refundData - 退款数据
 * @returns {Promise} - 返回退款申请结果的Promise
 */
const refundTicketOrder = (orderId, refundData) => {
  // 实际项目中应对接景区退款API
  // const url = `${BASE_API_URL}/orders/${orderId}/refund`;
  // return request(url, 'POST', refundData, getHeaders());
  
  // 使用模拟数据
  console.log('使用模拟退款申请数据', orderId, refundData);
  return Promise.resolve(getMockRefundResult(orderId));
};

// ========== 以下为模拟数据 ==========

// 模拟天气数据
const getMockWeather = () => {
  const temps = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const weathers = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '小雪', '中雪', '大雪'];
  
  const randomTemp = temps[Math.floor(Math.random() * temps.length)];
  const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
  
  return {
    code: '200',
    now: {
      temp: randomTemp,
      text: randomWeather,
      windDir: '东南风',
      windScale: '3',
      humidity: '80',
      precip: '0.0',
      pressure: '1020',
    },
    updateTime: new Date().toISOString()
  };
};

// 模拟天气预报数据
const getMockWeatherForecast = () => {
  const temps = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
  const weathers = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '小雪', '中雪', '大雪'];
  
  const daily = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    
    const tempMax = temps[Math.floor(Math.random() * temps.length)];
    const tempMin = tempMax - Math.floor(Math.random() * 10);
    const textDay = weathers[Math.floor(Math.random() * weathers.length)];
    
    daily.push({
      fxDate: forecastDate.toISOString().split('T')[0],
      tempMax,
      tempMin,
      textDay,
      textNight: textDay,
      windDirDay: '东南风',
      windScaleDay: '3-4',
      humidity: '80',
      precip: '0.0'
    });
  }
  
  return {
    code: '200',
    daily,
    updateTime: new Date().toISOString()
  };
};

// 模拟人流量数据
const getMockCrowdInfo = () => {
  const crowdLevels = ['舒适', '一般', '较拥挤', '拥挤', '非常拥挤'];
  const percentages = [30, 45, 60, 75, 90];
  
  const levelIndex = Math.floor(Math.random() * crowdLevels.length);
  
  return {
    code: 200,
    data: {
      level: crowdLevels[levelIndex],
      levelValue: levelIndex + 1,  // 1-5
      percentage: percentages[levelIndex],  // 拥挤百分比
      totalCount: Math.floor(Math.random() * 5000) + 1000,  // 总人数
      timestamp: new Date().toISOString(),
      warning: levelIndex >= 3 ? '景区当前人流量较大，请合理安排游览时间' : ''
    }
  };
};

// 模拟景点拥堵信息
const getMockSpotsCongestInfo = () => {
  const spots = [
    { id: 1, name: '望海亭', desc: '位于景区最高点，可俯瞰整个景区美景' },
    { id: 2, name: '松月湖', desc: '景区最大的湖泊，湖水清澈见底，四周绿树环绕' },
    { id: 3, name: '古樟园', desc: '百年古樟树群落，树荫蔽日，夏季凉爽宜人' },
    { id: 4, name: '飞瀑溪', desc: '山涧飞瀑，水声潺潺，溪边设有观景平台' },
    { id: 5, name: '竹林小径', desc: '翠竹成林，曲径通幽，漫步其中心旷神怡' },
    { id: 6, name: '观景台', desc: '远眺山水，视野辽阔，是拍照的绝佳地点' }
  ];
  
  const levels = ['舒适', '一般', '较拥挤', '拥挤', '非常拥挤'];
  
  const spotsWithCongestion = spots.map(spot => {
    const levelIndex = Math.floor(Math.random() * levels.length);
    
    return {
      ...spot,
      congestionLevel: levels[levelIndex],
      levelValue: levelIndex + 1,  // 1-5
      waitTime: levelIndex * 5 + Math.floor(Math.random() * 5), // 等待时间（分钟）
      warning: levelIndex >= 3 ? '当前景点人流量较大' : ''
    };
  });
  
  return {
    code: 200,
    data: {
      spots: spotsWithCongestion,
      timestamp: new Date().toISOString(),
      updateFrequency: '5分钟'
    }
  };
};

// 模拟创建订单结果
const getMockCreateOrderResult = (orderData) => {
  // 生成随机订单ID
  const order_id = 'ORD' + Date.now().toString().slice(-10);
  
  // 生成随机预支付信息（注：实际项目中需要后端生成真实的预支付信息）
  const prepay_info = {
    appId: 'wx123456789',
    timeStamp: '' + Math.floor(Date.now() / 1000),
    nonceStr: Math.random().toString(36).substr(2, 15),
    package: 'prepay_id=wx123456789',
    signType: 'MD5',
    paySign: Math.random().toString(36).substr(2, 32)
  };
  
  return {
    code: 200,
    message: '订单创建成功',
    data: {
      order_id,
      order_no: 'T' + Date.now(),
      create_time: new Date().toISOString(),
      ticket_name: orderData.ticket_name,
      quantity: orderData.quantity,
      unit_price: orderData.unit_price,
      total_price: orderData.total_price,
      visit_date: orderData.visit_date,
      prepay_info
    }
  };
};

// 模拟订单状态查询结果
const getMockOrderStatusResult = (orderId) => {
  // 生成随机状态
  const statusOptions = ['UNPAID', 'PAID', 'USED', 'REFUNDED', 'CANCELLED'];
  const randIndex = Math.floor(Math.random() * 2); // 让UNPAID和PAID多出现
  const status = statusOptions[randIndex];
  
  // 支付状态
  const payStatusOptions = ['UNPAID', 'SUCCESS', 'FAIL', 'REFUNDED'];
  const payStatus = status === 'UNPAID' ? 'UNPAID' : (status === 'REFUNDED' ? 'REFUNDED' : 'SUCCESS');
  
  return {
    code: 200,
    message: '查询成功',
    data: {
      order_id: orderId,
      order_no: 'T' + orderId.substr(3),
      status,
      pay_status: payStatus,
      create_time: new Date(Date.now() - 3600000).toISOString(),
      pay_time: status === 'UNPAID' ? null : new Date(Date.now() - 3000000).toISOString(),
      ticket_name: '成人票',
      quantity: 2,
      unit_price: 120,
      total_price: 240,
      visit_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      qr_code: 'TK' + Math.random().toString().slice(2, 10)
    }
  };
};

// 模拟用户订单列表
const getMockUserOrdersResult = () => {
  const orders = [];
  const statusOptions = ['UNPAID', 'PAID', 'USED', 'REFUNDED', 'CANCELLED'];
  const ticketNames = ['成人票', '儿童票', '老人票', '家庭套票'];
  
  // 生成5个随机订单
  for (let i = 0; i < 5; i++) {
    const id = 'ORD' + (Date.now() - i * 86400000).toString().slice(-10);
    const randStatusIndex = Math.floor(Math.random() * statusOptions.length);
    const status = statusOptions[randStatusIndex];
    const ticketName = ticketNames[Math.floor(Math.random() * ticketNames.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = ticketName === '家庭套票' ? 220 : (ticketName === '成人票' ? 120 : 60);
    
    orders.push({
      order_id: id,
      order_no: 'T' + id.substr(3),
      status,
      create_time: new Date(Date.now() - i * 86400000).toISOString(),
      ticket_name: ticketName,
      quantity,
      unit_price: unitPrice,
      total_price: unitPrice * quantity,
      visit_date: new Date(Date.now() + 86400000 * (i % 3 + 1)).toISOString().split('T')[0]
    });
  }
  
  return {
    code: 200,
    message: '获取成功',
    data: {
      orders,
      total: orders.length
    }
  };
};

// 模拟退款结果
const getMockRefundResult = (orderId) => {
  return {
    code: 200,
    message: '退款申请已提交',
    data: {
      order_id: orderId,
      refund_id: 'REF' + Date.now().toString().slice(-10),
      refund_status: 'PROCESSING',
      refund_time: new Date().toISOString(),
      refund_amount: 240
    }
  };
};

/**
 * 获取首页轮播图数据
 * @returns {Promise} 轮播图数据
 */
const getBanners = () => {
  return new Promise((resolve) => {
    // 模拟API延时
    setTimeout(() => {
      // 模拟API返回数据
      resolve({
        code: 200,
        data: [
          { 
            id: 1, 
            url: '/assets/images/banner/banner1.jpg', 
            title: '景区一日游特惠', 
            linkUrl: '/pages/ticket/ticket?type=daytour'
          },
          { 
            id: 2, 
            url: '/assets/images/banner/banner2.jpg', 
            title: '花海美景正当时',
            linkUrl: '/pages/guide/spot/spot?id=flower_sea'  
          },
          { 
            id: 3, 
            url: '/assets/images/banner/banner3.jpg', 
            title: '民俗表演预约中',
            linkUrl: '/pages/activity/detail?id=folk_show'
          }
        ]
      });
    }, 500);
  });
};

module.exports = {
  // 基础请求方法
  request,
  get,
  post,
  put,
  del,
  // 请求拦截器实例
  requestInterceptor,
  // 业务API方法
  getWeather,
  getWeatherForecast,
  getCrowdInfo,
  getSpotsCongestInfo,
  // 导出支付相关API
  createTicketOrder,
  queryTicketOrder,
  getUserOrders,
  refundTicketOrder,
  getBanners
};