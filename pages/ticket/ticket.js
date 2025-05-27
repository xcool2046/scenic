// packages/ticket/pages/ticket/ticket.js
const performance = require('../../utils/performance');
const payment = require('../../utils/payment');
const interaction = require('../../utils/interaction');

Page({
  data: {
    pageTitle: '景区门票',
    activeTab: 'tickets', // tickets, orders
    tickets: [
      {
        id: 1,
        name: '成人票',
        price: 120,
        originalPrice: 150,
        discount: '8折',
        description: '适用于18-60周岁游客',
        notice: '需提前一天预订',
        selected: true
      },
      {
        id: 2,
        name: '儿童票',
        price: 60,
        originalPrice: 75,
        discount: '8折',
        description: '适用于1.2米-1.5米儿童',
        notice: '需提前一天预订',
        selected: false
      },
      {
        id: 3,
        name: '老人票',
        price: 60,
        originalPrice: 75,
        discount: '8折',
        description: '适用于60周岁以上老人',
        notice: '需提前一天预订',
        selected: false
      },
      {
        id: 4,
        name: '家庭套票',
        price: 220,
        originalPrice: 300,
        discount: '7.3折',
        description: '2大1小，最多省80元',
        notice: '需提前一天预订',
        selected: false
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
    paymentInProgress: false
  },
  
  onLoad(options) {
    console.log('页面加载: ticket', options);
    
    // 记录页面性能
    performance.performanceMonitor.recordPagePerformance('ticket');
    
    // 如果有ticketId参数，选中对应门票
    if (options.ticketId) {
      this.selectTicket(options.ticketId);
    }
    
    // 如果有tab参数，切换到对应标签页
    if (options.tab) {
      this.setData({
        activeTab: options.tab
      });
    }
    
    // 如果要自动滚动
    if (options.autoScroll === 'true') {
      this.setData({
        autoScroll: true
      });
    }
    
    // 获取今天日期并设置为默认游览日期
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    this.setData({
      visitDate: `${year}-${month}-${day}`
    });
    
    // 获取用户信息并预填充联系人表单
    this.loadUserInfo();
    
    // 加载订单数据
    this.loadOrders();
    
    // 计算总价
    this.calculateTotal();
  },
  
  onShow() {
    // 每次显示页面时刷新订单
    if (this.data.activeTab === 'orders') {
      this.loadOrders();
    }
  },
  
  // 页面显示后自动滚动到选择区域
  onReady() {
    if (this.data.autoScroll) {
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.ticket-selector',
          duration: 300
        });
      }, 500);
    }
  },
  
  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    
    if (userInfo.name && userInfo.phone) {
      this.setData({
        contactName: userInfo.name || '',
        contactPhone: userInfo.phone || '',
        idCard: userInfo.idCard || ''
      });
    }
  },
  
  // 切换选项卡
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    
    if (tab === 'orders') {
      this.loadOrders();
    }
  },
  
  // 选择门票
  selectTicket(id) {
    const ticketId = typeof id === 'object' ? id.currentTarget.dataset.id : id;
    
    const tickets = this.data.tickets.map(ticket => {
      return {
        ...ticket,
        selected: ticket.id == ticketId
      };
    });
    
    this.setData({ tickets }, () => {
      this.calculateTotal();
    });
  },
  
  // 加载订单
  loadOrders() {
    interaction.showLoading('加载订单中');
    
    // 从本地缓存加载订单或从服务器同步
    payment.loadUserOrders().then(orders => {
      this.setData({ orders });
      interaction.hideLoading();
    }).catch(err => {
      console.error('加载订单失败', err);
      interaction.hideLoading();
      
      // 如果加载失败使用空数组
      this.setData({ orders: [] });
    });
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
    
    this.setData({ quantity }, () => {
      this.calculateTotal();
    });
  },
  
  // 选择日期
  bindDateChange(e) {
    this.setData({
      visitDate: e.detail.value
    });
  },
  
  // 输入联系人信息
  onContactNameInput(e) {
    this.setData({
      contactName: e.detail.value
    });
  },
  
  onContactPhoneInput(e) {
    this.setData({
      contactPhone: e.detail.value
    });
  },
  
  onIdCardInput(e) {
    this.setData({
      idCard: e.detail.value
    });
  },
  
  // 计算总价
  calculateTotal() {
    const selectedTicket = this.data.tickets.find(ticket => ticket.selected);
    if (selectedTicket) {
      this.setData({
        totalPrice: selectedTicket.price * this.data.quantity
      });
    }
  },
  
  // 验证手机号
  validatePhone(phone) {
    const phoneReg = /^1[3-9]\d{9}$/;
    return phoneReg.test(phone);
  },
  
  // 验证身份证
  validateIdCard(idCard) {
    // 简单验证18位身份证，实际可能需要更复杂的验证
    const idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return idCardReg.test(idCard);
  },
  
  // 提交订单
  submitOrder() {
    const selectedTicket = this.data.tickets.find(ticket => ticket.selected);
    
    if (!selectedTicket) {
      interaction.showToast('请选择门票');
      return;
    }
    
    if (!this.data.visitDate) {
      interaction.showToast('请选择游览日期');
      return;
    }
    
    // 如果未显示联系人表单，则显示表单
    if (!this.data.showContactForm) {
      this.setData({
        showContactForm: true
      });
      
      // 滚动到表单区域
      setTimeout(() => {
        wx.pageScrollTo({
          selector: '.contact-form',
          duration: 300
        });
      }, 300);
      
      return;
    }
    
    // 验证联系人信息
    if (!this.data.contactName) {
      interaction.showToast('请输入联系人姓名');
      return;
    }
    
    if (!this.data.contactPhone) {
      interaction.showToast('请输入联系电话');
      return;
    }
    
    if (!this.validatePhone(this.data.contactPhone)) {
      interaction.showToast('手机号格式不正确');
      return;
    }
    
    if (this.data.idCard && !this.validateIdCard(this.data.idCard)) {
      interaction.showToast('身份证号格式不正确');
      return;
    }
    
    // 保存联系人信息
    const userInfo = {
      name: this.data.contactName,
      phone: this.data.contactPhone,
      idCard: this.data.idCard
    };
    wx.setStorageSync('userInfo', userInfo);
    
    // 构建订单数据
    const orderData = {
      ticketId: selectedTicket.id,
      ticketName: selectedTicket.name,
      quantity: this.data.quantity,
      unitPrice: selectedTicket.price,
      totalPrice: this.data.totalPrice,
      visitDate: this.data.visitDate,
      contactName: this.data.contactName,
      contactPhone: this.data.contactPhone,
      idCard: this.data.idCard
    };
    
    // 显示确认框
    wx.showModal({
      title: '确认订单',
      content: `您选择了${selectedTicket.name} × ${this.data.quantity}，游览日期: ${this.data.visitDate}，总价: ¥${this.data.totalPrice}`,
      success: (res) => {
        if (res.confirm) {
          this.processPayment(orderData);
        }
      }
    });
  },
  
  // 处理支付流程
  processPayment(orderData) {
    // 防止重复点击
    if (this.data.paymentInProgress) {
      return;
    }
    
    this.setData({ paymentInProgress: true });
    
    // 调用支付流程
    payment.payOrder(orderData)
      .then(result => {
        this.setData({ paymentInProgress: false });
        
        if (result.success) {
          // 支付成功
          // 跳转到成功页面
          wx.navigateTo({
            url: `/packages/ticket/pages/ticket/success/success?orderId=${result.orderId}&ticketName=${orderData.ticketName}&quantity=${orderData.quantity}&totalPrice=${orderData.totalPrice}&visitDate=${orderData.visitDate}`
          });
        } else if (result.cancelled) {
          // 用户取消支付
          interaction.showToast('支付已取消');
        } else {
          // 支付失败
          interaction.showToast(result.message || '支付失败，请重试');
        }
      })
      .catch(err => {
        this.setData({ paymentInProgress: false });
        interaction.showToast('支付过程中出现错误');
        console.error('支付错误', err);
      });
  },
  
  // 查看票码
  viewTicketCode(e) {
    const order = e.currentTarget.dataset.order;
    wx.navigateTo({
      url: `/packages/ticket/pages/ticket/code/code?id=${order.id}&code=${order.qrCode}`
    });
  },
  
  // 查看订单详情
  viewOrderDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packages/ticket/pages/ticket/detail/detail?id=${orderId}`
    });
  },
  
  // 申请退款
  requestRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: (res) => {
        if (res.confirm) {
          // 显示退款原因选择
          wx.showActionSheet({
            itemList: ['计划有变', '重复购买', '其他原因'],
            success: (result) => {
              const reasons = ['计划有变', '重复购买', '其他原因'];
              const reason = reasons[result.tapIndex];
              
              // 申请退款
              payment.requestRefund(orderId, reason)
                .then(() => {
                  // 刷新订单列表
                  this.loadOrders();
                })
                .catch(err => {
                  console.error('退款申请失败', err);
                });
            }
          });
        }
      }
    });
  }
});
