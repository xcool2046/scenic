// packages/ticket/pages/ticket/success/success.js
const interaction = require('../../../../../utils/interaction');
const { userManager } = require('../../../../../utils/user');
const payment = require('../../../../../utils/payment');

Page({
  data: {
    orderId: '',
    orderInfo: null,
    loading: true,
    showOrderDetail: false
  },

  onLoad(options) {
    console.log('购票成功页面加载:', options);
    
    const orderId = options.orderId;
    if (!orderId) {
      this.handleError('订单信息丢失');
      return;
    }
    
    this.setData({ orderId });
    this.loadOrderInfo(orderId);
  },

  // 加载订单信息
  async loadOrderInfo(orderId) {
    try {
      this.setData({ loading: true });
      
      // 从支付结果或本地缓存获取订单信息
      const orderInfo = await this.getOrderInfo(orderId);
      
      if (orderInfo) {
        this.setData({
          orderInfo,
          loading: false
        });
      } else {
        this.handleError('订单信息获取失败');
      }
    } catch (error) {
      console.error('加载订单信息失败:', error);
      this.handleError('订单信息加载异常');
    }
  },

  // 获取订单信息
  async getOrderInfo(orderId) {
    try {
      // 先从本地缓存查找
      const localOrders = payment.loadUserOrders();
      let orderInfo = localOrders.find(order => order.order_id === orderId);
      
      if (orderInfo) {
        return orderInfo;
      }
      
      // 本地没有，尝试从远程获取
      const remoteOrders = await payment.syncRemoteOrders();
      orderInfo = remoteOrders.find(order => order.order_id === orderId);
      
      if (orderInfo) {
        return orderInfo;
      }
      
      // 如果都没有，构造基本信息
      return {
        order_id: orderId,
        ticket_name: '门票',
        quantity: 1,
        total_price: 0,
        create_time: new Date().toISOString(),
        pay_status: 'SUCCESS',
        qr_code: `TICKET_${orderId}`,
        visit_date: new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('获取订单信息异常:', error);
      return null;
    }
  },

  // 处理错误情况
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

  // 查看电子票
  viewTicketCode() {
    const { orderInfo } = this.data;
    if (!orderInfo) return;
    
    wx.navigateTo({
      url: `../code/code?orderId=${orderInfo.order_id}&qrCode=${orderInfo.qr_code || orderInfo.ticket_code}`
    });
  },

  // 查看订单详情
  viewOrderDetail() {
    const { orderInfo } = this.data;
    if (!orderInfo) return;
    
    wx.navigateTo({
      url: `../detail/detail?orderId=${orderInfo.order_id}`
    });
  },

  // 继续购票
  continueBuying() {
    wx.navigateTo({
      url: '/pages/ticket/ticket'
    });
  },

  // 查看我的订单
  viewMyOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    });
  },

  // 返回首页
  goHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 分享订单
  onShareAppMessage() {
    return {
      title: '我刚购买了景区门票',
      path: '/pages/ticket/ticket'
    };
  }
});