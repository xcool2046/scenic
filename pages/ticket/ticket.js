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
    
    // 简化票种数据 - 只保留核心信息
    tickets: [
      {
        id: 'adult',
        name: '成人票',
        price: 120,
        originalPrice: 150,
        tag: '热门',
        description: '18-60周岁游客',
        selected: true
      },
      {
        id: 'student',
        name: '学生票', 
        price: 90,
        originalPrice: 150,
        tag: '优惠',
        description: '需出示学生证',
        selected: false
      },
      {
        id: 'family',
        name: '家庭票',
        price: 280,
        originalPrice: 360,
        tag: '超值',
        description: '2大1小套票',
        selected: false
      },
      {
        id: 'senior',
        name: '老人票',
        price: 60,
        originalPrice: 75,
        tag: '敬老',
        description: '60周岁以上',
        selected: false
      }
    ],
    
    quantity: 1,
    visitDate: '',
    totalPrice: 120,
    selectedTicket: null,
    
    // 购买表单
    showPurchaseForm: false,
    contactInfo: {
      name: '',
      phone: ''
    },
    paymentInProgress: false
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
    
    // 获取默认选中的票种
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
    
    // 触觉反馈
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
    
    wx.vibrateShort();
  },
  
  // 选择游览日期
  bindDateChange(e) {
    this.setData({
      visitDate: e.detail.value
    });
  },
  
  // 一键购买 - 简化流程
  buyNow() {
    // 检查登录状态
    if (!userManager.getCurrentUser()) {
      this.showLoginPrompt();
      return;
    }
    
    // 验证必要信息
    if (!this.data.selectedTicket) {
      interaction.showToast('请选择门票类型');
      return;
    }
    
    if (!this.data.visitDate) {
      interaction.showToast('请选择游览日期');
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
      title: '需要登录',
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
    const { contactInfo, selectedTicket, quantity, visitDate, totalPrice } = this.data;
    
    // 验证联系人信息
    if (!contactInfo.name.trim()) {
      interaction.showToast('请输入联系人姓名');
      return;
    }
    
    if (!contactInfo.phone.trim() || !this.isValidPhone(contactInfo.phone)) {
      interaction.showToast('请输入正确的手机号码');
      return;
    }
    
    if (this.data.paymentInProgress) {
      return;
    }
    
    this.setData({ paymentInProgress: true });
    
    try {
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
      
      // 发起支付
      const paymentResult = await payment.payOrder(orderData);
      
      if (paymentResult.success) {
        // 支付成功，跳转到成功页面
        wx.redirectTo({
          url: `/packages/ticket/pages/ticket/success/success?orderId=${paymentResult.orderId}`
        });
      } else if (paymentResult.cancelled) {
        // 用户取消支付
        interaction.showToast('已取消支付');
      } else {
        // 支付失败
        interaction.showToast(paymentResult.message || '支付失败，请重试');
      }
    } catch (error) {
      console.error('支付过程出错:', error);
      interaction.showToast('支付失败，请稍后重试');
    } finally {
      this.setData({ paymentInProgress: false });
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
  
  // 分享
  onShareAppMessage() {
    return {
      title: '景区门票优惠购买',
      path: '/pages/ticket/ticket'
    };
  }
});
