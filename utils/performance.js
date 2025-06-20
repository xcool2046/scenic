/**
 * 性能优化工具模块
 * 包含图片懒加载、预渲染和性能监控功能
 */

// 性能标记点
const PERFORMANCE_MARKS = {
  APP_LAUNCH: 'app_launch',
  FIRST_RENDER: 'first_render',
  DATA_LOADED: 'data_loaded',
  PAGE_INTERACTIVE: 'page_interactive'
};

// 性能监控
const performanceMonitor = {
  // 记录性能标记点
  mark(name, data = {}) {
    if (wx.canIUse('performance.mark')) {
      wx.performance.mark(name, data);
      console.log(`[Performance] Mark: ${name}`);
    }
    
    // 记录到本地，用于分析
    const marks = wx.getStorageSync('performance_marks') || {};
    marks[name] = {
      time: Date.now(),
      data
    };
    wx.setStorageSync('performance_marks', marks);
  },
  
  // 计算两个标记点之间的时间差
  measure(startMark, endMark) {
    const marks = wx.getStorageSync('performance_marks') || {};
    
    if (marks[startMark] && marks[endMark]) {
      const duration = marks[endMark].time - marks[startMark].time;
      console.log(`[Performance] ${startMark} to ${endMark}: ${duration}ms`);
      return duration;
    }
    
    return -1;
  },
  
  // 记录页面性能数据
  recordPagePerformance(pageName) {
    this.mark(`${pageName}_load_start`);
    
    // 页面加载完成时记录
    setTimeout(() => {
      this.mark(`${pageName}_load_end`);
      
      // 计算加载时间
      const loadTime = this.measure(`${pageName}_load_start`, `${pageName}_load_end`);
      
      // 存储性能数据用于分析
      const perfData = wx.getStorageSync('page_performance') || {};
      perfData[pageName] = perfData[pageName] || [];
      
      perfData[pageName].push({
        time: Date.now(),
        loadTime
      });
      
      // 只保留最近10条记录
      if (perfData[pageName].length > 10) {
        perfData[pageName] = perfData[pageName].slice(-10);
      }
      
      wx.setStorageSync('page_performance', perfData);
    }, 500);
  },
  
  // 发送性能数据到服务器
  reportPerformanceData() {
    const pagePerf = wx.getStorageSync('page_performance') || {};
    const marks = wx.getStorageSync('performance_marks') || {};
    
    // TODO: 实际项目中需要对接后端接口
    console.log('[Performance] 性能数据准备上报', { pagePerf, marks });
    
    // 上报成功后清理旧数据
    // wx.removeStorageSync('page_performance');
  }
};

// 图片加载优化
const imageOptimizer = {
  // 预加载关键图片
  preloadImages(imageList) {
    if (!Array.isArray(imageList) || imageList.length === 0) {
      return Promise.resolve([]);
    }
    
    const promises = imageList.map(imgUrl => {
      return new Promise((resolve) => {
        wx.getImageInfo({
          src: imgUrl,
          success: () => resolve({ url: imgUrl, status: 'success' }),
          fail: () => resolve({ url: imgUrl, status: 'fail' })
        });
      });
    });
    
    return Promise.all(promises);
  },
  
  // 获取适合当前设备的图片尺寸
  getOptimizedImageSize(originalUrl) {
    // 获取设备信息
    // 使用新的API替换废弃的wx.getSystemInfoSync
const deviceInfo = wx.getDeviceInfo ? wx.getDeviceInfo() : {};
const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : {};
const appBaseInfo = wx.getAppBaseInfo ? wx.getAppBaseInfo() : {};
const systemInfo = { ...deviceInfo, ...windowInfo, ...appBaseInfo };
    const { windowWidth } = systemInfo;
    
    // 根据屏幕宽度选择合适的图片尺寸
    let sizeSuffix = '';
    
    if (windowWidth <= 375) {
      sizeSuffix = '?x-oss-process=image/resize,w_375';
    } else if (windowWidth <= 414) {
      sizeSuffix = '?x-oss-process=image/resize,w_414';
    } else {
      sizeSuffix = '?x-oss-process=image/resize,w_750';
    }
    
    // 检查URL是否已有参数
    if (originalUrl.includes('?')) {
      return originalUrl + '&' + sizeSuffix.substring(1);
    }
    
    return originalUrl + sizeSuffix;
  }
};

// 预加载和渲染优化
const renderOptimizer = {
  // 分批次渲染列表数据
  batchRender(page, dataKey, fullData, batchSize = 10, delay = 50) {
    const total = fullData.length;
    let rendered = 0;
    
    // 初始渲染第一批
    const initialBatch = fullData.slice(0, batchSize);
    const updateData = {};
    updateData[dataKey] = initialBatch;
    page.setData(updateData);
    
    rendered += initialBatch.length;
    
    // 如果数据已全部渲染，直接返回
    if (rendered >= total) {
      return;
    }
    
    // 分批渲染剩余数据
    const renderNextBatch = () => {
      if (rendered >= total) return;
      
      const end = Math.min(rendered + batchSize, total);
      const nextBatch = fullData.slice(rendered, end);
      
      // 追加新数据
      const appendData = {};
      appendData[`${dataKey}[${rendered}]`] = nextBatch;
      page.setData(appendData);
      
      rendered = end;
      
      // 继续渲染下一批
      if (rendered < total) {
        setTimeout(renderNextBatch, delay);
      }
    };
    
    // 开始批量渲染
    setTimeout(renderNextBatch, delay);
  },
  
  // 预加载子包
  preloadSubpackages(subpackageNames) {
    if (!Array.isArray(subpackageNames) || subpackageNames.length === 0) {
      return;
    }
    
    subpackageNames.forEach(name => {
      wx.loadSubpackage({
        name,
        success: () => {
          console.log(`[Performance] 预加载子包成功: ${name}`);
        },
        fail: (err) => {
          console.error(`[Performance] 预加载子包失败: ${name}`, err);
        }
      });
    });
  }
};

// 便捷方法：直接从模块导出常用方法
const mark = performanceMonitor.mark.bind(performanceMonitor);
const measure = performanceMonitor.measure.bind(performanceMonitor);

// 记录系统信息（app.js 中使用）
const recordSystemInfo = (systemInfo) => {
  console.log('[Performance] 系统信息记录:', systemInfo);
  wx.setStorageSync('system_info', {
    ...systemInfo,
    recordTime: Date.now()
  });
};

// 记录错误信息（app.js 中使用）
const recordError = (errorInfo) => {
  console.error('[Performance] 错误记录:', errorInfo);
  
  const errors = wx.getStorageSync('app_errors') || [];
  errors.push({
    ...errorInfo,
    timestamp: Date.now()
  });
  
  // 只保留最近20条错误记录
  if (errors.length > 20) {
    errors.splice(0, errors.length - 20);
  }
  
  wx.setStorageSync('app_errors', errors);
};

module.exports = {
  performanceMonitor,
  imageOptimizer,
  renderOptimizer,
  PERFORMANCE_MARKS,
  mark,
  measure,
  recordSystemInfo,
  recordError
}; 