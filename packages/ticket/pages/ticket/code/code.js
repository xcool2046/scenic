// packages/ticket/pages/ticket/code/code.js
const interaction = require('../../../../../utils/interaction');
const payment = require('../../../../../utils/payment');
const { ticketManager } = require('../../../../../utils/ticket');

Page({
  data: {
    orderId: '',
    qrCode: '',
    orderInfo: null,
    loading: true,
    brightness: 0.8,
    showOrderDetail: false
  },

  onLoad(options) {
    console.log('电子票码页面加载:', options);
    
    const { orderId, qrCode } = options;
    if (!orderId || !qrCode) {
      this.handleError('票务信息丢失');
      return;
    }
    
    this.setData({ 
      orderId,
      qrCode: decodeURIComponent(qrCode)
    });
    
    this.loadTicketInfo();
    this.adjustScreenBrightness();
  },

  onShow() {
    // 页面显示时调整屏幕亮度
    this.adjustScreenBrightness();
    // 刷新票务状态
    if (this.data.orderId) {
      this.refreshTicketStatus();
    }
  },

  onHide() {
    // 恢复系统亮度
    wx.setScreenBrightness({
      value: 0.5
    });
  },

  // 调整屏幕亮度便于扫码
  adjustScreenBrightness() {
    wx.setScreenBrightness({
      value: this.data.brightness,
      success: () => {
        console.log('屏幕亮度已调整');
      }
    });
  },

  // 加载票务信息
  async loadTicketInfo() {
    try {
      this.setData({ loading: true });
      
      const orderInfo = await this.getOrderInfo();
      
      if (orderInfo) {
        this.setData({
          orderInfo,
          loading: false
        });
      } else {
        this.handleError('票务信息获取失败');
      }
    } catch (error) {
      console.error('加载票务信息失败:', error);
      this.handleError('票务信息加载异常');
    }
  },

  // 获取订单信息
  async getOrderInfo() {
    try {
      // 从本地缓存获取
      const localOrders = payment.loadUserOrders();
      let orderInfo = localOrders.find(order => order.order_id === this.data.orderId);
      
      if (orderInfo) {
        return orderInfo;
      }
      
      // 从远程同步
      const remoteOrders = await payment.syncRemoteOrders();
      orderInfo = remoteOrders.find(order => order.order_id === this.data.orderId);
      
      return orderInfo || this.createFallbackOrderInfo();
    } catch (error) {
      console.error('获取订单信息异常:', error);
      return this.createFallbackOrderInfo();
    }
  },

  // 创建备用订单信息
  createFallbackOrderInfo() {
    return {
      order_id: this.data.orderId,
      ticket_name: '景区门票',
      quantity: 1,
      total_price: 0,
      visit_date: new Date().toISOString().split('T')[0],
      pay_status: 'SUCCESS',
      ticket_status: 'VALID',
      qr_code: this.data.qrCode,
      create_time: new Date().toISOString()
    };
  },

  // 刷新票务状态
  async refreshTicketStatus() {
    try {
      // 这里可以调用API检查票务状态
      // 暂时使用本地数据
      const orderInfo = await this.getOrderInfo();
      if (orderInfo && orderInfo.ticket_status !== this.data.orderInfo?.ticket_status) {
        this.setData({ orderInfo });
      }
    } catch (error) {
      console.error('刷新票务状态失败:', error);
    }
  },

  // 处理错误
  handleError(message) {
    this.setData({ loading: false });
    interaction.showToast(message);
    
    setTimeout(() => {
      wx.navigateBack({
        delta: 1,
        fail: () => {
          wx.switchTab({
            url: '/pages/ticket/ticket'
          });
        }
      });
    }, 2000);
  },

  // 调整亮度
  adjustBrightness(e) {
    const brightness = e.detail.value;
    this.setData({ brightness });
    this.adjustScreenBrightness();
  },

  // 保存二维码到相册
  saveQrCode() {
    wx.showModal({
      title: '保存二维码',
      content: '是否将电子票二维码保存到相册？',
      success: (res) => {
        if (res.confirm) {
          this.performSaveQrCode();
        }
      }
    });
  },

  // 执行保存二维码
  performSaveQrCode() {
    // 生成二维码图片并保存
    // 这里需要用到二维码生成库或API
    interaction.showToast('保存功能开发中');
  },

  // 显示订单详情
  toggleOrderDetail() {
    this.setData({
      showOrderDetail: !this.data.showOrderDetail
    });
  },

  // 查看订单详情页
  viewOrderDetail() {
    wx.navigateTo({
      url: `../detail/detail?orderId=${this.data.orderId}`
    });
  },

  // 联系客服
  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '如果您在使用电子票时遇到问题，可以联系我们的客服团队获得帮助。',
      confirmText: '呼叫客服',
      success: (res) => {
        if (res.confirm) {
          // 这里可以跳转到客服页面或拨打电话
          interaction.showToast('客服功能开发中');
        }
      }
    });
  },

  // 返回订单列表
  goToOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    });
  },

  // 分享电子票
  onShareAppMessage() {
    return {
      title: '我的景区电子门票',
      path: '/pages/ticket/ticket'
    };
  }
});