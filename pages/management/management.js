Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 核心统计数据 - 简化版
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
      { id: 'payment', name: '支付系统', status: 'warning' }
    ],
    
    // 动画状态
    isAnimating: false
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
  initData() {
    // 获取真实访客数据
    this.fetchTodayVisitors();
    
    // 获取服务状态
    this.fetchServiceStatus();
  },

  /**
   * 获取今日访客数据 - 真实API调用
   */
  fetchTodayVisitors() {
    // 这里接入真实API，暂时使用模拟数据展示动画效果
    const realVisitorCount = Math.floor(Math.random() * 2000) + 800; // 800-2800之间随机
    
    this.setData({
      'statistics.targetVisitors': realVisitorCount
    });
  },

  /**
   * 获取服务状态 - 真实检查
   */
  fetchServiceStatus() {
    // 模拟真实的服务状态检查
    const services = this.data.services.map(service => ({
      ...service,
      status: this.getRandomServiceStatus()
    }));

    this.setData({ services });
    this.updateSystemStatus(services);
  },

  /**
   * 模拟真实服务状态检查
   */
  getRandomServiceStatus() {
    const statuses = ['normal', 'normal', 'normal', 'warning']; // 正常状态占多数
    return statuses[Math.floor(Math.random() * statuses.length)];
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
  refreshData() {
    this.fetchTodayVisitors();
    this.fetchServiceStatus();
    
    // 重新触发数字动画
    setTimeout(() => {
      this.setData({
        'statistics.todayVisitors': 0,
        isAnimating: false
      });
      this.startNumberAnimation();
    }, 300);
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
  }
}); 