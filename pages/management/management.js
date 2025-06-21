Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 核心统计数据 - 优化版
    statistics: {
      todayVisitors: 0, // 从0开始，实现滚动效果
      targetVisitors: 1286, // 目标数字，用于动画
      systemStatus: 'normal',
      statusText: '系统正常', // 直接在data中计算
      activeServiceCount: 4 // 直接在data中计算
    },
    
    // 精简的4个核心服务
    services: [
      { id: 'ticket', name: '门票系统', status: 'normal' },
      { id: 'guide', name: '语音导览', status: 'normal' },
      { id: 'scan', name: '扫码验证', status: 'normal' },
      { id: 'payment', name: '支付系统', status: 'normal' }
    ],
    
    // 动画和状态
    isAnimating: false,
    isLoading: false,
    hasError: false,
    errorMessage: '',
    lastUpdateTime: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initData();
  },

  /**
   * 页面显示时触发
   */
  onShow() {
    if (!this.data.isAnimating) {
      this.startNumberAnimation();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 800);
  },

  /**
   * 初始化数据
   */
  async initData() {
    try {
      this.setData({ isLoading: true, hasError: false });
      
      // 并行获取数据
      await Promise.all([
        this.fetchTodayVisitors(),
        this.fetchServiceStatus()
      ]);
      
      // 更新最后更新时间
      this.setData({
        lastUpdateTime: this.formatCurrentTime(),
        isLoading: false
      });
      
    } catch (error) {
      console.error('初始化数据失败:', error);
      this.handleError('数据加载失败，请稍后重试');
    }
  },

  /**
   * 获取今日访客数据 - 真实API调用
   */
  async fetchTodayVisitors() {
    try {
      // TODO: 替换为真实API调用
      // const response = await wx.request({
      //   url: 'https://your-api.com/statistics/visitors/today',
      //   method: 'GET',
      //   header: {
      //     'Authorization': 'Bearer ' + wx.getStorageSync('token')
      //   }
      // });
      
      // 暂时使用模拟数据，模拟网络延迟
      await this.mockApiDelay(500);
      
      // 模拟真实数据范围和波动
      const baseVisitors = 800;
      const timeVariation = this.getTimeBasedVariation();
      const randomVariation = Math.floor(Math.random() * 400) - 200;
      const realVisitorCount = Math.max(0, baseVisitors + timeVariation + randomVariation);
      
      this.setData({
        'statistics.targetVisitors': realVisitorCount
      });
      
      return realVisitorCount;
      
    } catch (error) {
      console.error('获取访客数据失败:', error);
      throw new Error('访客数据获取失败');
    }
  },

  /**
   * 获取服务状态 - 真实检查
   */
  async fetchServiceStatus() {
    try {
      // TODO: 替换为真实服务状态检查API
      // const response = await wx.request({
      //   url: 'https://your-api.com/services/status',
      //   method: 'GET',
      //   header: {
      //     'Authorization': 'Bearer ' + wx.getStorageSync('token')
      //   }
      // });
      
      // 暂时使用模拟检查，模拟网络延迟
      await this.mockApiDelay(300);
      
      // 模拟真实的服务状态检查
      const services = this.data.services.map(service => ({
        ...service,
        status: this.checkServiceHealth(service.id)
      }));

      this.setData({ services });
      this.updateSystemStatus(services);
      
      return services;
      
    } catch (error) {
      console.error('获取服务状态失败:', error);
      throw new Error('服务状态检查失败');
    }
  },

  /**
   * 模拟真实的服务健康检查
   */
  checkServiceHealth(serviceId) {
    // 模拟基于时间和服务类型的状态检查
    const now = new Date();
    const hour = now.getHours();
    
    // 根据不同时段和服务类型模拟不同的健康状态
    const healthConfig = {
      'ticket': {
        normalProbability: hour >= 8 && hour <= 18 ? 0.95 : 0.85,
        warningProbability: 0.05
      },
      'guide': {
        normalProbability: 0.90,
        warningProbability: 0.08
      },
      'scan': {
        normalProbability: 0.92,
        warningProbability: 0.06
      },
      'payment': {
        normalProbability: hour >= 9 && hour <= 17 ? 0.88 : 0.75,
        warningProbability: 0.15
      }
    };
    
    const config = healthConfig[serviceId] || { normalProbability: 0.90, warningProbability: 0.08 };
    const random = Math.random();
    
    if (random < config.normalProbability) {
      return 'normal';
    } else if (random < config.normalProbability + config.warningProbability) {
      return 'warning';
    } else {
      return 'error';
    }
  },

  /**
   * 基于时间的访客变化模拟
   */
  getTimeBasedVariation() {
    const now = new Date();
    const hour = now.getHours();
    
    // 模拟景区访客的时间分布规律
    if (hour >= 6 && hour <= 8) return Math.floor(Math.random() * 100); // 早晨少量
    if (hour >= 9 && hour <= 11) return Math.floor(Math.random() * 600) + 200; // 上午高峰
    if (hour >= 12 && hour <= 14) return Math.floor(Math.random() * 400) + 100; // 中午中等
    if (hour >= 15 && hour <= 17) return Math.floor(Math.random() * 800) + 300; // 下午高峰
    if (hour >= 18 && hour <= 20) return Math.floor(Math.random() * 200); // 傍晚减少
    return Math.floor(Math.random() * 50); // 夜间极少
  },

  /**
   * Apple式数字滚动动画
   */
  startNumberAnimation() {
    if (this.data.isAnimating) return;
    
    this.setData({ isAnimating: true });
    
    const target = this.data.statistics.targetVisitors;
    const duration = 2000; // 2秒动画
    const steps = 60; // 60帧
    const increment = target / steps;
    
    let current = 0;
    let step = 0;
    
    const animate = () => {
      if (step >= steps) {
        this.setData({
          'statistics.todayVisitors': target,
          isAnimating: false
        });
        return;
      }
      
      // 使用easeOut曲线，模拟Apple的动画感觉
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      current = Math.floor(target * easeOut);
      
      this.setData({
        'statistics.todayVisitors': current
      });
      
      step++;
      setTimeout(animate, duration / steps);
    };
    
    animate();
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    try {
      this.setData({ hasError: false });
      
      // 重新获取数据
      await Promise.all([
        this.fetchTodayVisitors(),
        this.fetchServiceStatus()
      ]);
      
      // 更新时间
      this.setData({
        lastUpdateTime: this.formatCurrentTime()
      });
      
      // 重新触发数字动画
      setTimeout(() => {
        this.setData({
          'statistics.todayVisitors': 0,
          isAnimating: false
        });
        this.startNumberAnimation();
      }, 300);
      
      // 显示刷新成功提示
      wx.showToast({
        title: '数据已更新',
        icon: 'success',
        duration: 1500
      });
      
    } catch (error) {
      console.error('刷新数据失败:', error);
      this.handleError('刷新失败，请检查网络连接');
    }
  },

  /**
   * 更新系统整体状态
   */
  updateSystemStatus(services) {
    const hasError = services.some(service => service.status === 'error');
    const hasWarning = services.some(service => service.status === 'warning');
    const activeCount = services.filter(service => service.status === 'normal').length;
    
    let systemStatus = 'normal';
    let statusText = '系统正常';
    
    if (hasError) {
      systemStatus = 'error';
      statusText = '服务异常';
    } else if (hasWarning) {
      systemStatus = 'warning';
      statusText = '需要关注';
    }
    
    this.setData({
      'statistics.systemStatus': systemStatus,
      'statistics.statusText': statusText,
      'statistics.activeServiceCount': activeCount
    });
  },

  /**
   * 错误处理
   */
  handleError(message) {
    this.setData({
      hasError: true,
      errorMessage: message,
      isLoading: false
    });
    
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });
  },

  /**
   * 格式化当前时间
   */
  formatCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  /**
   * 模拟API延迟
   */
  mockApiDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 重试数据获取
   */
  async retryFetch() {
    if (this.data.isLoading) return;
    
    try {
      await this.initData();
      wx.showToast({
        title: '重试成功',
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('重试失败:', error);
      wx.showToast({
        title: '重试失败，请稍后再试',
        icon: 'none',
        duration: 2000
      });
    }
  }
}); 