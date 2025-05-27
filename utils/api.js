/**
 * API工具模块，用于处理景区实时信息相关API请求
 */

// 基础请求函数
const request = (url, method = 'GET', data = {}, header = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

// API基础URL
const BASE_API_URL = 'https://api.yourscenic.com/v1'; // 实际项目中需要替换为真实的API地址

// 获取请求头，添加授权信息
const getHeaders = () => {
  const token = wx.getStorageSync('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 高德地图天气API密钥
const AMAP_KEY = 'ff4fe7650c6f228431922e91706b6ab5'; 
const AMAP_WEATHER_URL = 'https://restapi.amap.com/v3/weather/weatherInfo';

// 检查是否使用模拟数据（在开发环境中始终使用模拟数据）
const shouldUseMockData = () => {
  // 在微信小程序中检测开发环境
  const accountInfo = wx.getAccountInfoSync && wx.getAccountInfoSync();
  const env = accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : 'release';
  
  // 在开发环境中使用模拟数据
  return env === 'develop' || env === 'trial';
};

// 获取实时天气信息
const getWeather = (location) => {
  // 始终使用模拟数据，确保小程序可以正常运行
  if (shouldUseMockData()) {
    console.log('使用模拟天气数据');
    return Promise.resolve(getMockWeather());
  }
  
  // 解析位置信息，高德天气API需要城市编码或经纬度
  let city = location;
  
  // 如果传入的是经纬度，需要先通过逆地理编码接口获取城市编码
  if (location.includes(',')) {
    const [longitude, latitude] = location.split(',');
    // 直接使用经纬度调用天气API，高德支持经纬度格式如：116.41,39.92
    city = location;
  }
  
  // 使用高德地图天气API: https://lbs.amap.com/api/webservice/guide/api/weatherinfo
  const url = `${AMAP_WEATHER_URL}?key=${AMAP_KEY}&city=${city}&extensions=base`;
  
  return request(url).then(res => {
    // 转换高德天气API返回数据格式为应用所需格式
    if (res.status === '1' && res.lives && res.lives.length > 0) {
      return {
        code: '200',
        now: formatAmapWeather(res.lives[0]),
        updateTime: new Date().toISOString()
      };
    } else {
      // 如果API调用失败，返回模拟数据
      console.warn('高德天气API返回异常，使用模拟数据');
      return getMockWeather();
    }
  }).catch(err => {
    console.error('获取天气数据失败', err);
    return getMockWeather();
  });
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
const getWeatherForecast = (location) => {
  // 解析位置信息，同上
  let city = location;
  
  if (location.includes(',')) {
    city = location;
  }
  
  // 使用高德地图天气预报API
  const url = `${AMAP_WEATHER_URL}?key=${AMAP_KEY}&city=${city}&extensions=all`;
  
  // 使用模拟数据
  if (process.env.NODE_ENV === 'development' && false) { // 将false改为true可启用模拟数据
    return Promise.resolve(getMockWeatherForecast());
  }
  
  return request(url).then(res => {
    // 转换高德天气预报API返回数据格式为应用所需格式
    if (res.status === '1' && res.forecasts && res.forecasts.length > 0 && res.forecasts[0].casts) {
      return {
        code: '200',
        daily: formatAmapForecast(res.forecasts[0].casts),
        updateTime: new Date().toISOString()
      };
    } else {
      // 如果API调用失败，返回模拟数据
      console.warn('高德天气预报API返回异常，使用模拟数据');
      return getMockWeatherForecast();
    }
  }).catch(err => {
    console.error('获取天气预报数据失败', err);
    return getMockWeatherForecast();
  });
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
const getCrowdInfo = () => {
  // 实际项目中应对接景区自己的API
  // const url = `${BASE_API_URL}/crowd/realtime`;
  
  // 始终使用模拟数据以确保稳定运行
  console.log('使用模拟人流量数据');
  return Promise.resolve(getMockCrowdInfo());
};

// 获取景点拥堵信息（需接入景区实际API）
const getSpotsCongestInfo = () => {
  // 实际项目中应对接景区自己的API
  // const url = `${BASE_API_URL}/spots/congestion`;
  
  // 使用模拟数据
  console.log('使用模拟拥堵数据');
  return Promise.resolve(getMockSpotsCongestInfo());
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
            linkUrl: '/packages/ticket/pages/ticket/ticket?type=daytour'
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