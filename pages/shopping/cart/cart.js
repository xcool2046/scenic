// 导入工具模块
const cache = require('../../../utils/cache');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    cartItems: [],
    totalQuantity: 0,
    totalAmount: 0,
    loading: false,
    checking: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('购物车页面加载');
    this.loadCartData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadCartData();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadCartData();
    wx.stopPullDownRefresh();
  },

  /**
   * 加载购物车数据
   */
  loadCartData: function() {
    this.setData({
      loading: true
    });

    try {
      const cartItems = cache.getCartItems() || [];
      
      // 计算总数量和总金额
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      this.setData({
        cartItems: cartItems,
        totalQuantity: totalQuantity,
        totalAmount: totalAmount.toFixed(2),
        loading: false
      });
    } catch (error) {
      console.error('加载购物车数据失败:', error);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
    }
  },

  /**
   * 增加商品数量
   */
  increaseQuantity: function(e) {
    const productId = e.currentTarget.dataset.id;
    if (!productId) return;

    try {
      const cartItems = [...this.data.cartItems];
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      
      if (itemIndex >= 0) {
        cartItems[itemIndex].quantity += 1;
        
        // 保存到缓存
        cache.setCartItems(cartItems);
        
        // 更新页面数据
        this.updateCartData(cartItems);
        
        // 触觉反馈
        wx.vibrateShort();
      }
    } catch (error) {
      console.error('增加数量失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 减少商品数量
   */
  decreaseQuantity: function(e) {
    const productId = e.currentTarget.dataset.id;
    if (!productId) return;

    try {
      const cartItems = [...this.data.cartItems];
      const itemIndex = cartItems.findIndex(item => item.id === productId);
      
      if (itemIndex >= 0 && cartItems[itemIndex].quantity > 1) {
        cartItems[itemIndex].quantity -= 1;
        
        // 保存到缓存
        cache.setCartItems(cartItems);
        
        // 更新页面数据
        this.updateCartData(cartItems);
        
        // 触觉反馈
        wx.vibrateShort();
      }
    } catch (error) {
      console.error('减少数量失败:', error);
      wx.showToast({
        title: '操作失败',
        icon: 'error'
      });
    }
  },

  /**
   * 移除商品
   */
  removeItem: function(e) {
    const productId = e.currentTarget.dataset.id;
    if (!productId) return;

    wx.showModal({
      title: '确认移除',
      content: '确定要从购物车中移除这件商品吗？',
      confirmText: '移除',
      confirmColor: '#FF3B30',
      success: (res) => {
        if (res.confirm) {
          try {
            const cartItems = this.data.cartItems.filter(item => item.id !== productId);
            
            // 保存到缓存
            cache.setCartItems(cartItems);
            
            // 更新页面数据
            this.updateCartData(cartItems);
            
            wx.showToast({
              title: '已移除',
              icon: 'success'
            });
          } catch (error) {
            console.error('移除商品失败:', error);
            wx.showToast({
              title: '操作失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  /**
   * 更新购物车数据
   */
  updateCartData: function(cartItems) {
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    this.setData({
      cartItems: cartItems,
      totalQuantity: totalQuantity,
      totalAmount: totalAmount.toFixed(2)
    });
  },

  /**
   * 继续购物
   */
  continueShopping: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 结算
   */
  checkout: function() {
    if (this.data.totalQuantity === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      return;
    }

    if (this.data.checking) return;

    this.setData({
      checking: true
    });

    // 模拟结算过程
    setTimeout(() => {
      this.setData({
        checking: false
      });

      wx.showModal({
        title: '结算成功',
        content: `订单总金额：¥${this.data.totalAmount}`,
        showCancel: false,
        confirmText: '确定',
        success: () => {
          // 清空购物车
          cache.setCartItems([]);
          this.setData({
            cartItems: [],
            totalQuantity: 0,
            totalAmount: 0
          });
          
          // 返回商品页面
          wx.navigateBack({
            delta: 1
          });
        }
      });
    }, 2000);
  }
}); 