const app = getApp();
const { userManager } = require('../../utils/user');
const payment = require('../../utils/payment');
const interaction = require('../../utils/interaction');

Page({
  data: {
    pageTitle: '我的订单',
    orders: [],
    loading: true,
    isEmpty: false
  },
  
  onLoad(options) {
    console.log('订单页面加载:', options);
    
    // 检查登录状态
    if (!userManager.getCurrentUser()) {
      this.redirectToLogin();
      return;
    }
    
    // 加载订单数据
    this.loadOrders();
    
    // 处理成功支付的提示
    if (options.success === 'true' && options.orderId) {
      setTimeout(() => {
        interaction.showToast('支付成功！');
      }, 500);
    }
  },
  
  onShow() {
    // 页面显示时刷新订单
    if (userManager.getCurrentUser()) {
      this.loadOrders();
    }
  },
  
  // 重定向到登录页面
  redirectToLogin() {
    wx.showModal({
      title: '提示',
      content: '请先登录查看订单',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/user/user'
          });
        } else {
          wx.navigateBack();
        }
      }
    });
  },
  
  // 加载订单列表
  async loadOrders() {
    try {
      this.setData({ loading: true });
      
      // 从本地缓存和远程服务器加载订单
      const orders = await this.fetchOrders();
      
      this.setData({
        orders,
        isEmpty: orders.length === 0,
        loading: false
      });
    } catch (error) {
      console.error('加载订单失败:', error);
      this.setData({
        loading: false,
        isEmpty: true
      });
    }
  },
  
  // 获取订单数据
  async fetchOrders() {
    try {
      // 优先从本地缓存获取
      const localOrders = payment.loadUserOrders();
      
      // 尝试同步远程订单
      try {
        const remoteOrders = await payment.syncRemoteOrders();
        return remoteOrders;
      } catch (error) {
        // 远程同步失败，使用本地数据
        console.warn('远程订单同步失败，使用本地数据:', error);
        return localOrders;
      }
    } catch (error) {
      console.error('获取订单数据失败:', error);
      return [];
    }
  },
  
  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/orders/detail?id=${orderId}`
    });
  },
  
  // 查看二维码
  viewTicketCode(e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({
      url: `/pages/orders/code?id=${order.order_id}&code=${order.qr_code || order.ticket_code}`
    });
  },
  
  // 申请退款
  requestRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    const order = this.data.orders.find(item => item.order_id === orderId);
    
    if (!order) return;
    
    wx.showModal({
      title: '申请退款',
      content: `确定要申请退款吗？\n订单：${order.ticket_name} × ${order.quantity}\n金额：¥${order.total_price}`,
      confirmText: '确定退款',
      confirmColor: '#FF3B30',
      success: async (res) => {
        if (res.confirm) {
          await this.processRefund(orderId);
        }
      }
    });
  },
  
  // 处理退款
  async processRefund(orderId) {
    try {
      interaction.showLoading('申请退款中');
      
      const result = await payment.requestRefund(orderId, '用户主动申请');
      
      interaction.hideLoading();
      
      if (result.success) {
        interaction.showToast('退款申请已提交');
        // 刷新订单列表
        this.loadOrders();
      } else {
        interaction.showToast(result.message || '退款申请失败');
      }
    } catch (error) {
      interaction.hideLoading();
      console.error('退款申请失败:', error);
      interaction.showToast('退款申请失败，请稍后重试');
    }
  },
  
  // 继续支付
  continuePay(e) {
    const orderId = e.currentTarget.dataset.id;
    // 这里可以重新发起支付流程
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },
  
  // 删除订单
  deleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '删除订单',
      content: '确定要删除这个订单吗？删除后无法恢复。',
      confirmText: '删除',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          this.performDeleteOrder(orderId);
        }
      }
    });
  },
  
  // 执行删除订单
  performDeleteOrder(orderId) {
    const orders = this.data.orders.filter(order => order.order_id !== orderId);
    
    this.setData({
      orders,
      isEmpty: orders.length === 0
    });
    
    // 更新本地缓存
    payment.updateLocalOrderStatus(orderId, 'DELETED');
    
    interaction.showToast('订单已删除');
  },
  
  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadOrders();
    wx.stopPullDownRefresh();
  },
  
  // 去购票
  goToBuyTickets() {
    wx.navigateTo({
      url: '/pages/ticket/ticket'
    });
  },
  
  // 获取订单状态文本
  getOrderStatusText(status) {
    const statusMap = {
      'UNPAID': '待支付',
      'PAID': '待使用',
      'USED': '已使用',
      'REFUNDING': '退款中',
      'REFUNDED': '已退款',
      'CANCELLED': '已取消',
      'EXPIRED': '已过期'
    };
    return statusMap[status] || '未知状态';
  },
  
  // 获取订单状态样式类
  getOrderStatusClass(status) {
    const classMap = {
      'UNPAID': 'status-unpaid',
      'PAID': 'status-paid',
      'USED': 'status-used',
      'REFUNDING': 'status-refunding',
      'REFUNDED': 'status-refunded',
      'CANCELLED': 'status-cancelled',
      'EXPIRED': 'status-expired'
    };
    return classMap[status] || 'status-unknown';
  },
  
  // 页面分享
  onShareAppMessage() {
    return {
      title: '景区门票订单',
      path: '/pages/ticket/ticket',
      imageUrl: '/assets/images/cards/ticket_card.jpg'
    };
  }
}); 