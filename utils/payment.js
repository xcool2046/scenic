/**
 * 微信支付工具模块
 * 处理门票预订、支付和订单相关功能
 */

// 导入工具模块
const interaction = require('./interaction');
const api = require('./api');
const cache = require('./cache');

// 订单缓存键
const ORDERS_CACHE_KEY = 'user_ticket_orders';

/**
 * 创建订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise} - 返回包含订单ID和预支付信息的Promise
 */
const createOrder = (orderData) => {
  // 显示加载提示
  interaction.showLoading('订单创建中');
  
  return new Promise((resolve, reject) => {
    // 构建订单参数
    const params = {
      ticket_id: orderData.ticketId,
      ticket_name: orderData.ticketName,
      quantity: orderData.quantity,
      unit_price: orderData.unitPrice,
      total_price: orderData.totalPrice,
      visit_date: orderData.visitDate,
      contact_name: orderData.contactName || '',
      contact_phone: orderData.contactPhone || '',
      id_card: orderData.idCard || ''
    };
    
    // 调用创建订单API
    api.createTicketOrder(params)
      .then(res => {
        interaction.hideLoading();
        
        if (res.code === 200) {
          // 返回订单ID和预支付信息
          resolve({
            orderId: res.data.order_id,
            prepayInfo: res.data.prepay_info
          });
        } else {
          interaction.showToast(res.message || '创建订单失败，请重试');
          reject(new Error(res.message || '创建订单失败'));
        }
      })
      .catch(err => {
        interaction.hideLoading();
        console.error('创建订单失败', err);
        interaction.showToast('创建订单失败，请检查网络连接');
        reject(err);
      });
  });
};

/**
 * 发起微信支付
 * @param {Object} prepayInfo - 预支付信息，包含appId、timeStamp、nonceStr、package、signType、paySign
 * @returns {Promise} - 返回支付结果的Promise
 */
const requestPayment = (prepayInfo) => {
  return new Promise((resolve, reject) => {
    wx.requestPayment({
      ...prepayInfo,
      success: res => {
        console.log('支付成功', res);
        resolve(res);
      },
      fail: err => {
        console.error('支付失败', err);
        // 判断是用户取消还是支付失败
        if (err.errMsg === 'requestPayment:fail cancel') {
          reject(new Error('用户取消支付'));
        } else {
          reject(new Error('支付失败，请重试'));
        }
      }
    });
  });
};

/**
 * 查询订单状态
 * @param {String} orderId - 订单ID
 * @returns {Promise} - 返回订单状态的Promise
 */
const queryOrderStatus = (orderId) => {
  return new Promise((resolve, reject) => {
    api.queryTicketOrder(orderId)
      .then(res => {
        if (res.code === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.message || '查询订单失败'));
        }
      })
      .catch(err => {
        console.error('查询订单失败', err);
        reject(err);
      });
  });
};

/**
 * 完整的支付流程：创建订单 -> 发起支付 -> 查询订单状态
 * @param {Object} orderData - 订单数据
 * @returns {Promise} - 返回整个支付流程的Promise
 */
const payOrder = async (orderData) => {
  try {
    // 1. 创建订单并获取预支付信息
    const { orderId, prepayInfo } = await createOrder(orderData);
    
    // 2. 发起微信支付
    await requestPayment(prepayInfo);
    
    // 3. 支付成功后，查询订单状态确认
    const orderStatus = await queryOrderStatus(orderId);
    
    // 4. 如果订单支付成功，添加到本地缓存
    if (orderStatus.pay_status === 'SUCCESS') {
      addOrderToLocalCache(orderStatus);
    }
    
    return {
      success: true,
      orderId,
      orderStatus
    };
  } catch (error) {
    console.error('支付流程异常', error);
    
    // 用户取消支付，不算错误
    if (error.message === '用户取消支付') {
      return {
        success: false,
        cancelled: true,
        message: '用户取消支付'
      };
    }
    
    return {
      success: false,
      message: error.message || '支付过程中出现错误'
    };
  }
};

/**
 * 从本地缓存加载用户订单
 * @returns {Array} 用户订单列表
 */
const loadUserOrders = () => {
  return cache.getCache(ORDERS_CACHE_KEY) || [];
};

/**
 * 添加订单到本地缓存
 * @param {Object} order - 订单信息
 */
const addOrderToLocalCache = (order) => {
  // 从缓存获取现有订单
  const existingOrders = loadUserOrders();
  
  // 检查是否已存在该订单
  const orderExists = existingOrders.some(item => item.order_id === order.order_id);
  
  if (!orderExists) {
    // 添加新订单到列表头部
    existingOrders.unshift(order);
    
    // 只保留最近20个订单
    const ordersToCache = existingOrders.slice(0, 20);
    
    // 更新缓存
    cache.setCache(ORDERS_CACHE_KEY, ordersToCache);
  }
};

/**
 * 同步远程订单到本地缓存
 * @returns {Promise} - 同步结果的Promise
 */
const syncRemoteOrders = () => {
  return new Promise((resolve, reject) => {
    api.getUserOrders()
      .then(res => {
        if (res.code === 200 && res.data && Array.isArray(res.data.orders)) {
          // 更新本地缓存
          cache.setCache(ORDERS_CACHE_KEY, res.data.orders);
          resolve(res.data.orders);
        } else {
          reject(new Error(res.message || '同步订单失败'));
        }
      })
      .catch(err => {
        console.error('同步订单失败', err);
        reject(err);
      });
  });
};

/**
 * 退款申请
 * @param {String} orderId - 订单ID
 * @param {String} reason - 退款原因
 * @returns {Promise} - 退款结果的Promise
 */
const requestRefund = (orderId, reason) => {
  return new Promise((resolve, reject) => {
    interaction.showLoading('申请退款中');
    
    api.refundTicketOrder(orderId, { reason })
      .then(res => {
        interaction.hideLoading();
        
        if (res.code === 200) {
          interaction.showSuccess('退款申请已提交');
          resolve(res.data);
          
          // 更新本地缓存中的订单状态
          updateLocalOrderStatus(orderId, 'REFUNDING');
        } else {
          interaction.showToast(res.message || '退款申请失败');
          reject(new Error(res.message || '退款申请失败'));
        }
      })
      .catch(err => {
        interaction.hideLoading();
        interaction.showToast('退款申请失败，请重试');
        console.error('退款申请失败', err);
        reject(err);
      });
  });
};

/**
 * 更新本地订单状态
 * @param {String} orderId - 订单ID
 * @param {String} status - 新状态
 */
const updateLocalOrderStatus = (orderId, status) => {
  const orders = loadUserOrders();
  
  const updatedOrders = orders.map(order => {
    if (order.order_id === orderId) {
      return {
        ...order,
        status
      };
    }
    return order;
  });
  
  cache.setCache(ORDERS_CACHE_KEY, updatedOrders);
};

module.exports = {
  createOrder,
  requestPayment,
  queryOrderStatus,
  payOrder,
  loadUserOrders,
  syncRemoteOrders,
  requestRefund
}; 