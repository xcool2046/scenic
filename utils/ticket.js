/**
 * 票务系统管理模块
 * 处理门票购买、订单管理、二维码生成等功能
 */

const env = require('./env');
const cache = require('./cache');
const { request } = require('./api');
const { userManager } = require('./user');

class TicketManager {
  constructor() {
    this.ticketTypes = [];
    this.currentOrder = null;
  }

  /**
   * 初始化票务系统
   */
  async init() {
    try {
      await this.loadTicketTypes();
    } catch (error) {
      console.error('票务系统初始化失败:', error);
    }
  }

  /**
   * 加载门票类型
   */
  async loadTicketTypes() {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        this.ticketTypes = [
          {
            id: 'adult_ticket',
            name: '成人票',
            price: 120,
            originalPrice: 150,
            description: '适用于18-60岁成人',
            validDays: 1,
            features: ['景区内所有景点', '免费停车', '免费WiFi'],
            restrictions: ['一人一票', '当日有效', '不可退款'],
            available: true,
            stock: 999,
            image: '/assets/images/tickets/adult_ticket.jpg'
          },
          {
            id: 'student_ticket',
            name: '学生票',
            price: 60,
            originalPrice: 75,
            description: '适用于全日制在校学生（需出示学生证）',
            validDays: 1,
            features: ['景区内所有景点', '免费停车'],
            restrictions: ['需出示学生证', '一人一票', '当日有效'],
            available: true,
            stock: 500,
            image: '/assets/images/tickets/student_ticket.jpg'
          },
          {
            id: 'child_ticket',
            name: '儿童票',
            price: 30,
            originalPrice: 40,
            description: '适用于6-17岁儿童',
            validDays: 1,
            features: ['景区内所有景点', '免费停车'],
            restrictions: ['需成人陪同', '一人一票', '当日有效'],
            available: true,
            stock: 300,
            image: '/assets/images/tickets/child_ticket.jpg'
          },
          {
            id: 'senior_ticket',
            name: '老人票',
            price: 60,
            originalPrice: 75,
            description: '适用于60岁以上老人（需出示身份证）',
            validDays: 1,
            features: ['景区内所有景点', '免费停车', '优先通道'],
            restrictions: ['需出示身份证', '一人一票', '当日有效'],
            available: true,
            stock: 200,
            image: '/assets/images/tickets/senior_ticket.jpg'
          },
          {
            id: 'family_package',
            name: '家庭套票',
            price: 280,
            originalPrice: 350,
            description: '2成人+1儿童套票',
            validDays: 1,
            features: ['景区内所有景点', '免费停车', '家庭合影服务'],
            restrictions: ['限定人数使用', '当日有效', '不可拆分'],
            available: true,
            stock: 100,
            image: '/assets/images/tickets/family_package.jpg'
          }
        ];
        
        // 缓存门票类型
        cache.set('ticket_types', this.ticketTypes, 60 * 60 * 1000); // 1小时
        return this.ticketTypes;
      }

      // 生产环境API调用
      const result = await request({
        url: '/tickets/types',
        method: 'GET'
      });
      
      this.ticketTypes = result.ticketTypes || [];
      cache.set('ticket_types', this.ticketTypes, 60 * 60 * 1000);
      
      return this.ticketTypes;
    } catch (error) {
      console.error('加载门票类型失败:', error);
      // 尝试从缓存加载
      const cachedTypes = cache.get('ticket_types');
      if (cachedTypes) {
        this.ticketTypes = cachedTypes;
        return this.ticketTypes;
      }
      throw error;
    }
  }

  /**
   * 获取门票类型列表
   */
  getTicketTypes() {
    return this.ticketTypes;
  }

  /**
   * 根据ID获取门票类型
   */
  getTicketTypeById(ticketId) {
    return this.ticketTypes.find(ticket => ticket.id === ticketId);
  }

  /**
   * 检查门票库存
   */
  async checkStock(ticketId, quantity = 1) {
    try {
      if (env.shouldUseMock()) {
        const ticket = this.getTicketTypeById(ticketId);
        return {
          available: ticket && ticket.stock >= quantity,
          stock: ticket ? ticket.stock : 0
        };
      }

      const result = await request({
        url: '/tickets/check-stock',
        method: 'POST',
        data: { ticketId, quantity }
      });
      
      return result;
    } catch (error) {
      console.error('检查库存失败:', error);
      throw error;
    }
  }

  /**
   * 创建订单
   */
  async createOrder(orderData) {
    try {
      // 检查用户登录状态
      await userManager.requireLogin();
      
      // 验证订单数据
      this.validateOrderData(orderData);
      
      // 检查库存
      for (const item of orderData.items) {
        const stockCheck = await this.checkStock(item.ticketId, item.quantity);
        if (!stockCheck.available) {
          throw new Error(`${item.ticketName}库存不足`);
        }
      }
      
      if (env.shouldUseMock()) {
        // 开发环境模拟订单创建
        const orderId = 'ORDER_' + Date.now();
        const order = {
          id: orderId,
          userId: userManager.getCurrentUser().id,
          items: orderData.items,
          totalAmount: orderData.totalAmount,
          contactInfo: orderData.contactInfo,
          visitDate: orderData.visitDate,
          status: 'pending',
          createTime: new Date().toISOString(),
          paymentMethod: null,
          paymentTime: null,
          tickets: []
        };
        
        this.currentOrder = order;
        cache.set(`order_${orderId}`, order, 30 * 60 * 1000); // 30分钟
        
        return order;
      }

      // 生产环境API调用
      const result = await request({
        url: '/tickets/create-order',
        method: 'POST',
        data: orderData
      });
      
      this.currentOrder = result.order;
      return result.order;
    } catch (error) {
      console.error('创建订单失败:', error);
      throw error;
    }
  }

  /**
   * 验证订单数据
   */
  validateOrderData(orderData) {
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('订单项不能为空');
    }
    
    if (!orderData.contactInfo || !orderData.contactInfo.name || !orderData.contactInfo.phone) {
      throw new Error('联系信息不完整');
    }
    
    if (!orderData.visitDate) {
      throw new Error('游览日期不能为空');
    }
    
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(orderData.contactInfo.phone)) {
      throw new Error('手机号格式不正确');
    }
    
    // 验证游览日期不能是过去的日期
    const visitDate = new Date(orderData.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (visitDate < today) {
      throw new Error('游览日期不能是过去的日期');
    }
  }

  /**
   * 支付订单
   */
  async payOrder(orderId, paymentMethod = 'wechat') {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟支付
        const order = cache.get(`order_${orderId}`) || this.currentOrder;
        if (!order) {
          throw new Error('订单不存在');
        }
        
        // 模拟支付成功
        order.status = 'paid';
        order.paymentMethod = paymentMethod;
        order.paymentTime = new Date().toISOString();
        
        // 生成门票
        order.tickets = order.items.map((item, index) => {
          const tickets = [];
          for (let i = 0; i < item.quantity; i++) {
            tickets.push({
              id: `TICKET_${orderId}_${index}_${i}`,
              ticketId: item.ticketId,
              ticketName: item.ticketName,
              qrCode: this.generateQRCode(`${orderId}_${index}_${i}`),
              status: 'valid',
              validDate: order.visitDate,
              useTime: null
            });
          }
          return tickets;
        }).flat();
        
        cache.set(`order_${orderId}`, order, 7 * 24 * 60 * 60 * 1000); // 7天
        this.currentOrder = order;
        
        return {
          success: true,
          order,
          paymentResult: {
            transactionId: 'TXN_' + Date.now(),
            paymentTime: order.paymentTime
          }
        };
      }

      // 生产环境支付流程
      const paymentResult = await this.initiatePayment(orderId, paymentMethod);
      
      if (paymentResult.success) {
        const order = await this.getOrderById(orderId);
        return { success: true, order, paymentResult };
      } else {
        throw new Error(paymentResult.message || '支付失败');
      }
    } catch (error) {
      console.error('支付订单失败:', error);
      throw error;
    }
  }

  /**
   * 发起支付
   */
  async initiatePayment(orderId, paymentMethod) {
    try {
      const result = await request({
        url: '/payment/initiate',
        method: 'POST',
        data: { orderId, paymentMethod }
      });
      
      if (paymentMethod === 'wechat') {
        return await this.processWechatPayment(result.paymentParams);
      }
      
      return result;
    } catch (error) {
      console.error('发起支付失败:', error);
      throw error;
    }
  }

  /**
   * 处理微信支付
   */
  processWechatPayment(paymentParams) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...paymentParams,
        success: (res) => {
          resolve({ success: true, result: res });
        },
        fail: (err) => {
          reject(new Error('微信支付失败: ' + err.errMsg));
        }
      });
    });
  }

  /**
   * 获取订单详情
   */
  async getOrderById(orderId) {
    try {
      if (env.shouldUseMock()) {
        const order = cache.get(`order_${orderId}`);
        if (!order) {
          throw new Error('订单不存在');
        }
        return order;
      }

      const result = await request({
        url: `/tickets/orders/${orderId}`,
        method: 'GET'
      });
      
      return result.order;
    } catch (error) {
      console.error('获取订单失败:', error);
      throw error;
    }
  }

  /**
   * 使用门票
   */
  async useTicket(ticketId, qrCode) {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟使用门票
        return {
          success: true,
          message: '门票使用成功',
          ticket: {
            id: ticketId,
            status: 'used',
            useTime: new Date().toISOString()
          }
        };
      }

      const result = await request({
        url: '/tickets/use',
        method: 'POST',
        data: { ticketId, qrCode }
      });
      
      return result;
    } catch (error) {
      console.error('使用门票失败:', error);
      throw error;
    }
  }

  /**
   * 生成二维码
   */
  generateQRCode(data) {
    // 简单的二维码数据生成
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `QR_${data}_${timestamp}_${random}`;
  }

  /**
   * 验证二维码
   */
  async validateQRCode(qrCode) {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟验证
        return {
          valid: qrCode.startsWith('QR_'),
          ticket: qrCode.startsWith('QR_') ? {
            id: 'mock_ticket_001',
            status: 'valid',
            ticketName: '成人票'
          } : null
        };
      }

      const result = await request({
        url: '/tickets/validate-qr',
        method: 'POST',
        data: { qrCode }
      });
      
      return result;
    } catch (error) {
      console.error('验证二维码失败:', error);
      throw error;
    }
  }

  /**
   * 验证票务代码（扫码验证页面专用）
   */
  async validateTicketCode(scanResult) {
    try {
      console.log('开始验证票务代码:', scanResult);
      
      if (env.shouldUseMock()) {
        // 开发环境模拟验证逻辑
        await this.simulateDelay(1000); // 模拟网络延迟
        
        // 模拟不同的验证结果
        if (scanResult.includes('EXPIRED')) {
          return {
            success: false,
            code: 'TICKET_EXPIRED',
            message: '票务已过期',
            ticket: {
              id: 'expired_ticket_001',
              name: '成人票',
              type: '门票',
              status: 'expired',
              ticketNo: 'EXP202412190001',
              price: 120,
              validDate: '2024-12-18',
              purchaseTime: '2024-12-17 14:30:00'
            }
          };
        }
        
        if (scanResult.includes('USED')) {
          return {
            success: false,
            code: 'TICKET_USED',
            message: '票务已使用',
            ticket: {
              id: 'used_ticket_001',
              name: '成人票',
              type: '门票',
              status: 'used',
              ticketNo: 'USD202412190001',
              price: 120,
              validDate: '2024-12-19',
              purchaseTime: '2024-12-18 10:30:00',
              usedTime: '2024-12-19 09:30:00'
            }
          };
        }
        
        if (scanResult.includes('INVALID')) {
          return {
            success: false,
            code: 'INVALID_FORMAT',
            message: '二维码格式无效'
          };
        }
        
        if (scanResult.includes('NOTFOUND')) {
          return {
            success: false,
            code: 'TICKET_NOT_FOUND',
            message: '票务信息不存在'
          };
        }
        
        // 模拟验证成功
        return {
          success: true,
          ticket: {
            id: 'valid_ticket_001',
            name: '成人票',
            type: '门票',
            status: 'valid',
            ticketNo: 'TK202412190001',
            price: 120,
            validDate: '2024-12-19',
            purchaseTime: '2024-12-18 16:30:00',
            userName: '张三',
            userPhone: '138****8888'
          }
        };
      }

      // 生产环境API调用
      const result = await request({
        url: '/tickets/validate',
        method: 'POST',
        data: { 
          scanResult,
          timestamp: Date.now(),
          device: 'mobile'
        }
      });
      
      return result;
    } catch (error) {
      console.error('验证票务代码失败:', error);
      return {
        success: false,
        code: 'NETWORK_ERROR',
        message: error.message || '网络异常，请重试'
      };
    }
  }

  /**
   * 更新票务状态
   */
  async updateTicketStatus(ticketId, status, extraData = {}) {
    try {
      console.log('更新票务状态:', ticketId, status, extraData);
      
      if (env.shouldUseMock()) {
        // 开发环境模拟更新
        await this.simulateDelay(500);
        
        // 模拟成功更新
        return {
          success: true,
          ticketId,
          status,
          updateTime: new Date().toISOString(),
          ...extraData
        };
      }

      // 生产环境API调用
      const result = await request({
        url: `/tickets/${ticketId}/status`,
        method: 'PUT',
        data: { 
          status,
          ...extraData,
          timestamp: Date.now()
        }
      });
      
      return result;
    } catch (error) {
      console.error('更新票务状态失败:', error);
      throw error;
    }
  }

  /**
   * 模拟网络延迟
   */
  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取门票统计信息
   */
  async getTicketStats() {
    try {
      if (env.shouldUseMock()) {
        return {
          totalSold: 1250,
          todaySold: 85,
          revenue: 156000,
          todayRevenue: 10200,
          popularTickets: [
            { name: '成人票', count: 680 },
            { name: '学生票', count: 320 },
            { name: '家庭套票', count: 150 }
          ]
        };
      }

      const result = await request({
        url: '/tickets/stats',
        method: 'GET'
      });
      
      return result;
    } catch (error) {
      console.error('获取门票统计失败:', error);
      throw error;
    }
  }

  /**
   * 计算订单总价
   */
  calculateOrderTotal(items) {
    return items.reduce((total, item) => {
      const ticket = this.getTicketTypeById(item.ticketId);
      return total + (ticket ? ticket.price * item.quantity : 0);
    }, 0);
  }

  /**
   * 获取当前订单
   */
  getCurrentOrder() {
    return this.currentOrder;
  }

  /**
   * 清除当前订单
   */
  clearCurrentOrder() {
    this.currentOrder = null;
  }

  /**
   * 检查门票是否可用
   */
  isTicketAvailable(ticketId) {
    const ticket = this.getTicketTypeById(ticketId);
    return ticket && ticket.available && ticket.stock > 0;
  }

  /**
   * 格式化价格
   */
  formatPrice(price) {
    return `¥${price.toFixed(2)}`;
  }

  /**
   * 获取门票状态文本
   */
  getTicketStatusText(status) {
    const statusMap = {
      'valid': '有效',
      'used': '已使用',
      'expired': '已过期',
      'cancelled': '已取消'
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 获取订单状态文本
   */
  getOrderStatusText(status) {
    const statusMap = {
      'pending': '待支付',
      'paid': '已支付',
      'used': '已使用',
      'expired': '已过期',
      'cancelled': '已取消',
      'refunded': '已退款'
    };
    return statusMap[status] || '未知状态';
  }
}

// 创建单例实例
const ticketManager = new TicketManager();

// 导出实例和类
module.exports = {
  ticketManager,
  TicketManager
};