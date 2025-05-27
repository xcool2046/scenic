// packages/ticket/pages/ticket/ticket.js
const api = require('../../../../utils/api');
const interaction = require('../../../../utils/interaction');
const cache = require('../../../../utils/cache');

Page({
  data: {
    pageTitle: '景区门票',
    loading: true,
    ticketTypes: [],
    selectedDate: '',
    dateOptions: [],
    selectedTicket: null,
    quantity: 1,
    totalPrice: 0,
    isLogin: false,
    ticketParams: {} // 存储URL参数
  },
  
  onLoad(options) {
    console.log('页面加载: ticket', options);
    
    // 处理从首页传入的参数
    this.setData({
      ticketParams: options || {}
    });
    
    // 生成未来30天的日期选择
    this.generateDateOptions();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 加载票种数据
    this.loadTicketData();
    
    // 如果传入了type参数，自动选择对应票种
    if (options && options.type) {
      this.preSelectTicket(options.type);
    }
    
    // 如果需要自动滚动到购票区域
    if (options && options.autoScroll) {
      // 由于数据可能还未加载完成，延迟执行滚动
      setTimeout(() => {
        this.scrollToTicketArea();
      }, 800);
    }
  },
  
  // 检查登录状态
  checkLoginStatus() {
    const app = getApp();
    const isLogin = app.globalData.hasLogin;
    this.setData({ isLogin });
    
    // 如果未登录，提示用户登录
    if (!isLogin) {
      interaction.showToast('请先登录再购票');
    }
  },
  
  // 生成日期选择列表
  generateDateOptions() {
    const today = new Date();
    const dateOptions = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekday = weekdays[date.getDay()];
      
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      dateOptions.push({
        date: dateStr,
        display: `${month}月${day}日 ${weekday}`,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: i === 0
      });
    }
    
    this.setData({ 
      dateOptions,
      selectedDate: dateOptions[0].date
    });
  },
  
  // 加载票种数据
  loadTicketData() {
    // 显示加载提示
    interaction.showLoading('加载中');
    
    // 先尝试从缓存获取数据
    const cachedData = cache.getCache('ticket_types');
    if (cachedData) {
      this.processTicketData(cachedData);
      interaction.hideLoading();
      return;
    }
    
    // 从API获取票种数据
    setTimeout(() => {
      // 模拟API调用
      const ticketData = {
        code: 200,
        data: [
          {
            id: 'adult',
            name: '成人票',
            description: '成人标准票，享受景区所有基础游玩项目',
            price: 120,
            originalPrice: 150,
            stock: 999,
            tag: '热门',
            limitPerOrder: 10,
            notice: '入园需出示本人有效身份证件'
          },
          {
            id: 'child',
            name: '儿童票',
            description: '6-18周岁儿童或身高1.2-1.5米',
            price: 60,
            originalPrice: 80,
            stock: 999,
            tag: '优惠',
            limitPerOrder: 10,
            notice: '入园可能需要出示证明儿童年龄或身高的有效证件'
          },
          {
            id: 'senior',
            name: '老人票',
            description: '60周岁以上老人专享优惠',
            price: 60,
            originalPrice: 150,
            stock: 999,
            tag: '特惠',
            limitPerOrder: 10,
            notice: '入园需出示本人有效身份证件或老年证'
          },
          {
            id: 'student',
            name: '学生票',
            description: '全日制大学本科及以下学历在校学生',
            price: 90,
            originalPrice: 150,
            stock: 999,
            tag: '特惠',
            limitPerOrder: 10,
            notice: '入园需出示本人有效学生证'
          },
          {
            id: 'family',
            name: '家庭套票',
            description: '2大1小，含3张门票，享受景区所有基础游玩项目',
            price: 280,
            originalPrice: 360,
            stock: 999,
            tag: '套餐',
            limitPerOrder: 5,
            notice: '最多可同时入园3人（2位成人和1位儿童）'
          },
          {
            id: 'daytour',
            name: '一日游套票',
            description: '含门票、讲解器和午餐券，尊享服务',
            price: 180,
            originalPrice: 220,
            stock: 50,
            tag: '特色',
            limitPerOrder: 5,
            notice: '入园请到游客中心兑换讲解器和午餐券'
          }
        ]
      };
      
      if (ticketData.code === 200 && ticketData.data) {
        // 缓存数据1小时
        cache.setCache('ticket_types', ticketData, 60 * 60);
        
        // 处理数据
        this.processTicketData(ticketData);
      } else {
        interaction.showToast('获取票种数据失败');
      }
      
      interaction.hideLoading();
    }, 800);
  },
  
  // 处理票种数据
  processTicketData(ticketData) {
    if (!ticketData || !ticketData.data) return;
    
    this.setData({
      ticketTypes: ticketData.data,
      loading: false
    });
    
    // 默认选中第一种票
    if (ticketData.data.length > 0 && !this.data.selectedTicket) {
      this.selectTicket(0);
    }
  },
  
  // 根据URL参数预选票种
  preSelectTicket(type) {
    // 等待票种数据加载完成
    const checkDataLoaded = setInterval(() => {
      if (!this.data.loading && this.data.ticketTypes.length > 0) {
        clearInterval(checkDataLoaded);
        
        // 找到匹配的票种
        const index = this.data.ticketTypes.findIndex(item => item.id === type);
        if (index !== -1) {
          this.selectTicket(index);
        }
      }
    }, 100);
  },
  
  // 选择票种
  selectTicket(index) {
    const ticket = this.data.ticketTypes[index];
    if (!ticket) return;
    
    this.setData({
      selectedTicket: ticket,
      quantity: 1,
      totalPrice: ticket.price
    });
  },
  
  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ selectedDate: date });
  },
  
  // 改变数量
  changeQuantity(e) {
    const type = e.currentTarget.dataset.type;
    let quantity = this.data.quantity;
    
    if (type === 'minus') {
      if (quantity > 1) {
        quantity--;
      }
    } else if (type === 'plus') {
      const max = this.data.selectedTicket.limitPerOrder || 10;
      if (quantity < max) {
        quantity++;
      } else {
        interaction.showToast(`每单最多购买${max}张`);
        return;
      }
    }
    
    this.setData({
      quantity,
      totalPrice: this.data.selectedTicket.price * quantity
    });
  },
  
  // 立即购买
  buyNow() {
    // 检查登录状态
    if (!this.data.isLogin) {
      interaction.showModal({
        title: '请先登录',
        content: '购票需要先登录账号',
        showCancel: true,
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/user/user'
            });
          }
        }
      });
      return;
    }
    
    // 检查是否选择了票种
    if (!this.data.selectedTicket) {
      interaction.showToast('请选择票种');
      return;
    }
    
    // 显示确认弹窗
    interaction.showModal({
      title: '确认购买',
      content: `${this.data.selectedTicket.name} x ${this.data.quantity}张\n游玩日期: ${this.data.selectedDate}\n合计: ¥${this.data.totalPrice}`,
      showCancel: true,
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          this.createOrder();
        }
      }
    });
  },
  
  // 创建订单
  createOrder() {
    if (!this.data.selectedTicket || !this.data.selectedDate) return;
    
    interaction.showLoading('提交订单中');
    
    // 构建订单数据
    const orderData = {
      ticket_id: this.data.selectedTicket.id,
      ticket_name: this.data.selectedTicket.name,
      unit_price: this.data.selectedTicket.price,
      quantity: this.data.quantity,
      total_price: this.data.totalPrice,
      visit_date: this.data.selectedDate
    };
    
    // 调用创建订单API
    api.createTicketOrder(orderData)
      .then(res => {
        interaction.hideLoading();
        
        if (res.code === 200 && res.data) {
          // 跳转到订单详情页
          wx.navigateTo({
            url: `./detail/detail?order_id=${res.data.order_id}&prepay=1`,
            success: () => {
              // 跳转成功后的处理
            },
            fail: () => {
              interaction.showToast('跳转订单页面失败');
            }
          });
        } else {
          interaction.showToast('创建订单失败');
        }
      })
      .catch(err => {
        interaction.hideLoading();
        interaction.showToast('创建订单失败');
        console.error('创建订单出错:', err);
      });
  },
  
  // 滚动到购票区域
  scrollToTicketArea() {
    wx.createSelectorQuery()
      .select('.ticket-list')
      .boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.top,
            duration: 300
          });
        }
      })
      .exec();
  },
  
  // 查看订单
  goToOrders() {
    wx.navigateTo({
      url: '/pages/user/orders/orders',
      fail: () => {
        interaction.showToast('订单页面开发中');
      }
    });
  },
  
  // 显示图文详情
  showTicketDetails() {
    wx.navigateTo({
      url: './detail/detail',
      fail: () => {
        interaction.showToast('详情页面开发中');
      }
    });
  },
  
  // 页面分享
  onShareAppMessage() {
    return {
      title: '景区门票预订 - 提前购票，快速入园',
      path: '/packages/ticket/pages/ticket/ticket',
      imageUrl: '/assets/images/share/ticket_share.jpg'
    };
  }
});
