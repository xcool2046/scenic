Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedTab: 0, // 0: 可领取, 1: 我的优惠券
    
    // 可领取优惠券列表
    coupons: [
      {
        id: 'coupon_001',
        title: '新用户专享优惠券',
        description: '景区门票及商品通用',
        discount: 50,
        minAmount: 199,
        expireTime: '2025-12-31',
        remainCount: 256,
        showCurrency: true,
        displayAmount: '50'
      },
      {
        id: 'coupon_002', 
        title: '餐饮折扣券',
        description: '景区内所有餐厅通用',
        discount: 20,
        minAmount: 100,
        expireTime: '2025-06-30',
        remainCount: 89,
        showCurrency: true,
        displayAmount: '20'
      },
      {
        id: 'coupon_003',
        title: '商品满减券',
        description: '纪念品商店专用',
        discount: 30,
        minAmount: 150,
        expireTime: '2025-09-30',
        remainCount: 124,
        showCurrency: true,
        displayAmount: '30'
      }
    ],
    
    // 已领取优惠券列表
    receivedCoupons: [
      {
        id: 'received_001',
        title: '餐饮优惠券',
        description: '景区内所有餐厅通用',
        discount: 20,
        minAmount: 100,
        expireTime: '2025-12-31',
        showCurrency: true,
        displayAmount: '20'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('优惠券页面加载');
    this.initializeCouponData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshCoupons();
  },

  /**
   * 初始化优惠券数据
   */
  initializeCouponData: function() {
    // 获取已领取的优惠券列表
    const receivedCoupons = wx.getStorageSync('receivedCouponsList') || [];
    const claimedOriginalIds = receivedCoupons.map(rc => rc.originalId);
    
    // 更新可领取优惠券的状态
    const coupons = this.data.coupons.map(coupon => ({
      ...coupon,
      isClaimed: claimedOriginalIds.includes(coupon.id)
    }));
    
    this.setData({
      coupons,
      receivedCoupons
    });
  },

  /**
   * 切换Tab
   */
  switchTab: function(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      selectedTab: index
    });
    
    // 根据Tab加载对应数据
    if (index === 0) {
      this.loadCoupons();
    } else if (index === 1) {
      this.loadReceivedCoupons();
    }
  },

  /**
   * 加载可领取优惠券
   */
  loadCoupons: function() {
    // 直接初始化数据，无加载延迟
    this.initializeCouponData();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载已领取优惠券
   */
  loadReceivedCoupons: function() {
    // 从本地存储加载已领取的优惠券
    const receivedCoupons = wx.getStorageSync('receivedCouponsList') || [];
    this.setData({ receivedCoupons });
  },

  /**
   * 领取优惠券
   */
  claimCoupon: function(e) {
    const couponId = e.currentTarget.dataset.id;
    const coupon = this.data.coupons.find(c => c.id === couponId);
    
    if (!coupon) return;

    // 检查是否已经领取过
    const receivedCoupons = wx.getStorageSync('receivedCouponsList') || [];
    const isAlreadyClaimed = receivedCoupons.some(rc => rc.originalId === couponId);
    
    if (isAlreadyClaimed) {
      wx.showToast({
        title: '已领取过该优惠券',
        icon: 'none'
      });
      return;
    }

    // 显示领取确认
    wx.showModal({
      title: '领取优惠券',
      content: `确定要领取"${coupon.title}"吗？`,
      confirmText: '领取',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.processCouponClaim(coupon);
        }
      }
    });
  },

  /**
   * 处理优惠券领取
   */
  processCouponClaim: function(coupon) {
    // 模拟API调用
    wx.showLoading({ title: '领取中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 创建已领取的优惠券对象
      const claimedCoupon = {
        ...coupon,
        id: `received_${Date.now()}`,
        originalId: coupon.id, // 保存原始ID用于状态检查
        claimTime: new Date().toISOString(), // 领取时间
        status: 'claimed' // 状态标识
      };
      
      // 更新本地存储 - 保存完整的已领取优惠券列表
      const receivedCoupons = wx.getStorageSync('receivedCouponsList') || [];
      receivedCoupons.unshift(claimedCoupon);
      wx.setStorageSync('receivedCouponsList', receivedCoupons);
      
      // 减少剩余数量并标记已领取状态
      const coupons = this.data.coupons.map(c => {
        if (c.id === coupon.id) {
          return { 
            ...c, 
            remainCount: c.remainCount - 1,
            isClaimed: true // 添加已领取标识
          };
        }
        return c;
      });
      
      // 更新页面数据
      this.setData({
        receivedCoupons,
        coupons
      });
      
      wx.showToast({
        title: '领取成功',
        icon: 'success'
      });
    }, 1000);
  },

  /**
   * 使用优惠券
   */
  useCoupon: function(e) {
    const couponId = e.currentTarget.dataset.id;
    const coupon = this.data.receivedCoupons.find(c => c.id === couponId);
    
    if (!coupon) return;

    wx.showModal({
      title: '使用优惠券',
      content: `确定要使用"${coupon.title}"吗？使用后将无法恢复。`,
      confirmText: '使用',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.processCouponUse(coupon);
        }
      }
    });
  },

  /**
   * 处理优惠券使用
   */
  processCouponUse: function(coupon) {
    wx.showLoading({ title: '使用中...' });
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 从已领取列表中移除
      const receivedCoupons = this.data.receivedCoupons.filter(c => c.id !== coupon.id);
      
      this.setData({ receivedCoupons });
      
      wx.showToast({
        title: '使用成功',
        icon: 'success'
      });
      
      // 可以在这里跳转到支付页面或其他业务逻辑
      console.log('优惠券使用成功:', coupon);
    }, 800);
  },

  /**
   * 查看优惠券详情
   */
  viewCouponDetail: function(e) {
    const couponId = e.currentTarget.dataset.id;
    const isReceived = this.data.selectedTab === 1;
    
    let coupon;
    if (isReceived) {
      coupon = this.data.receivedCoupons.find(c => c.id === couponId);
    } else {
      coupon = this.data.coupons.find(c => c.id === couponId);
    }
    
    if (!coupon) return;

    // 显示优惠券详情
    const content = `${coupon.description}\n\n优惠金额：¥${coupon.displayAmount}\n使用条件：满¥${coupon.minAmount}可用\n有效期：${coupon.expireTime}${!isReceived ? `\n剩余数量：${coupon.remainCount}张` : ''}`;
    
    wx.showModal({
      title: coupon.title,
      content: content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  /**
   * 刷新优惠券
   */
  refreshCoupons: function() {
    if (this.data.selectedTab === 0) {
      this.loadCoupons();
    } else {
      this.loadReceivedCoupons();
    }
  },

  /**
   * 格式化价格显示
   */
  formatPrice: function(price) {
    return price.toFixed(2);
  },

  /**
   * 检查优惠券是否即将过期
   */
  isExpiringSoon: function(expireTime) {
    const expire = new Date(expireTime);
    const now = new Date();
    const diffDays = Math.ceil((expire - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // 7天内过期
  },

  /**
   * 获取优惠券状态文本
   */
  getCouponStatusText: function(coupon) {
    if (this.isExpiringSoon(coupon.expireTime)) {
      return '即将过期';
    }
    return '正常';
  },

  /**
   * 分享优惠券
   */
  shareCoupon: function(coupon) {
    return {
      title: `限时优惠：${coupon.title}`,
      path: `/pages/coupon/coupon?shareId=${coupon.id}`,
      imageUrl: '/assets/images/share/coupon-share.jpg'
    };
  }
}); 