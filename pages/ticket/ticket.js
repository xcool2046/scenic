// packages/ticket/pages/ticket/ticket.js
const app = getApp();
const env = require('../../utils/env');
const { ticketManager } = require('../../utils/ticket');
const { userManager } = require('../../utils/user');
const api = require('../../utils/api');
const config = require('../../utils/config');
const performance = require('../../utils/performance');
const payment = require('../../utils/payment');
const interaction = require('../../utils/interaction');

Page({
  data: {
    config,
    pageTitle: '景区门票',
    activeTab: 'tickets', // tickets, orders
    // 门票类型
    ticketTypes: [],
    tickets: [
      {
        id: 'adult',
        name: '成人票',
        price: 120,
        originalPrice: 150,
        discount: '8折',
        description: '适用于18-60周岁游客',
        notice: '入园需出示有效身份证件',
        selected: true,
        features: ['所有景点', '免费停车', '免费WiFi']
      },
      {
        id: 'student',
        name: '学生票',
        price: 90,
        originalPrice: 150,
        discount: '6折',
        description: '全日制在校学生专享',
        notice: '入园需出示学生证',
        selected: false,
        features: ['所有景点', '免费停车']
      },
      {
        id: 'child',
        name: '儿童票',
        price: 60,
        originalPrice: 75,
        discount: '8折',
        description: '6-17周岁儿童专享',
        notice: '需成人陪同入园',
        selected: false,
        features: ['所有景点', '免费停车']
      },
      {
        id: 'senior',
        name: '老人票',
        price: 60,
        originalPrice: 75,
        discount: '8折',
        description: '60周岁以上老人专享',
        notice: '入园需出示身份证或老年证',
        selected: false,
        features: ['所有景点', '免费停车', '优先通道']
      },
      {
        id: 'family',
        name: '家庭套票',
        price: 280,
        originalPrice: 360,
        discount: '7.8折',
        description: '2大1小家庭组合，畅享全景区',
        notice: '限定3人同时入园',
        selected: false,
        features: ['所有景点', '免费停车', '家庭合影服务']
      }
    ],
    orders: [],
    quantity: 1,
    visitDate: '',
    totalPrice: 120,
    autoScroll: false,
    
    // 联系人信息
    contactName: '',
    contactPhone: '',
    idCard: '',
    
    // 控制表单显示
    showContactForm: false,
    
    // 支付相关
    paymentInProgress: false,
    selectedTicket: null,
    showPurchaseForm: false,
    contactInfo: {
      name: '',
      phone: ''
    }
  },
  
  onLoad(options) {
    console.log('票务页面加载:', options);
    this.initializePageData(options);
  },
  
  // 初始化页面数据
  initializePageData(options) {
    // 设置默认游览日期（明天）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const visitDate = tomorrow.toISOString().split('T')[0];
    
    // 获取选中的票种
    const selectedTicket = this.data.tickets.find(ticket => ticket.selected);
    
    this.setData({
      visitDate,
      selectedTicket,
      totalPrice: selectedTicket ? selectedTicket.price * this.data.quantity : 120
    });
    
    // 处理URL参数
    if (options && options.type) {
      this.selectTicketByType(options.type);
    }
  },
  
  // 选择票种
  selectTicket(e) {
    const ticketId = e.currentTarget.dataset.id;
    const tickets = this.data.tickets.map(ticket => ({
      ...ticket,
      selected: ticket.id === ticketId
    }));
    
    const selectedTicket = tickets.find(ticket => ticket.selected);
    const totalPrice = selectedTicket.price * this.data.quantity;
    
    this.setData({
      tickets,
      selectedTicket,
      totalPrice
    });
    
    // 添加触觉反馈
    wx.vibrateShort();
  },
  
  // 根据类型选择票种
  selectTicketByType(type) {
    const tickets = this.data.tickets.map(ticket => ({
      ...ticket,
      selected: ticket.id === type
    }));
    
    const selectedTicket = tickets.find(ticket => ticket.selected);
    if (selectedTicket) {
      const totalPrice = selectedTicket.price * this.data.quantity;
      this.setData({
        tickets,
        selectedTicket,
        totalPrice
      });
    }
  },
  
  // 修改数量
  changeQuantity(e) {
    const type = e.currentTarget.dataset.type;
    let quantity = this.data.quantity;
    
    if (type === 'minus' && quantity > 1) {
      quantity--;
    } else if (type === 'add' && quantity < 10) {
      quantity++;
    }
    
    const totalPrice = this.data.selectedTicket.price * quantity;
    
    this.setData({
      quantity,
      totalPrice
    });
    
    // 添加触觉反馈
    wx.vibrateShort();
  },
  
  // 选择游览日期
  bindDateChange(e) {
    this.setData({
      visitDate: e.detail.value
    });
  },
  
  // 立即购买
  buyNow() {
    // 检查登录状态
    if (!userManager.getCurrentUser()) {
      this.showLoginPrompt();
      return;
    }
    
    // 显示购买表单
    this.setData({
      showPurchaseForm: true
    });
  },
  
  // 显示登录提示
  showLoginPrompt() {
    wx.showModal({
      title: '提示',
      content: '请先登录后购买门票',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({
            url: '/pages/user/user'
          });
        }
      }
    });
  },
  
  // 联系人信息输入
  onContactInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`contactInfo.${field}`]: value
    });
  },
  
  // 确认支付
  async confirmPayment() {
    const { selectedTicket, quantity, visitDate, totalPrice, contactInfo } = this.data;
    
    // 简单验证
    if (!contactInfo.name || !contactInfo.phone) {
      interaction.showToast('请填写联系人信息');
      return;
    }
    
    if (!this.isValidPhone(contactInfo.phone)) {
      interaction.showToast('请输入正确的手机号');
      return;
    }
    
    // 构建订单数据
    const orderData = {
      ticketId: selectedTicket.id,
      ticketName: selectedTicket.name,
      quantity,
      unitPrice: selectedTicket.price,
      totalPrice,
      visitDate,
      contactName: contactInfo.name,
      contactPhone: contactInfo.phone
    };
    
    try {
      // 调用支付流程
      const result = await payment.payOrder(orderData);
      
      if (result.success) {
        // 支付成功，跳转到订单页面
        wx.redirectTo({
          url: `/pages/orders/orders?success=true&orderId=${result.orderId}`
        });
      } else if (result.cancelled) {
        // 用户取消支付
        interaction.showToast('支付已取消');
      } else {
        // 支付失败
        interaction.showToast(result.message || '支付失败，请重试');
      }
    } catch (error) {
      console.error('支付过程出错:', error);
      interaction.showToast('支付过程中出现错误，请重试');
    }
  },
  
  // 取消购买
  cancelPurchase() {
    this.setData({
      showPurchaseForm: false,
      contactInfo: {
        name: '',
        phone: ''
      }
    });
  },
  
  // 查看我的订单
  viewMyOrders() {
    wx.navigateTo({
      url: '/pages/orders/orders'
    });
  },
  
  // 验证手机号
  isValidPhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  },
  
  // 页面分享
  onShareAppMessage() {
    return {
      title: '景区门票预订',
      path: '/pages/ticket/ticket',
      imageUrl: '/assets/images/cards/ticket_card.jpg'
    };
  }
});
