Page({
  /**
   * 页面的初始数据
   */
  data: {
    merchants: [],
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadMerchants();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadMerchants();
  },

  /**
   * 加载商家列表 - 极简数据结构
   */
  loadMerchants: function() {
    this.setData({ loading: true });
    
    // 精简商家数据 - 核心信息+配图
    const coremerchants = [
      {
        id: '1',
        name: '景区餐厅',
        description: '正宗本地菜，环境优雅',
        rating: 4.8,
        distance: '100m',
        phone: '0571-88888888',
        location: '景区中心广场',
        image: '/assets/images/scenic_spots/lake.jpg'
      },
      {
        id: '2',
        name: '纪念品商店',
        description: '特色纪念品，游客必选',
        rating: 4.6,
        distance: '200m',
        phone: '0571-88888889',
        location: '景区入口处',
        image: '/assets/images/scenic_spots/old_trees.jpg'
      },
      {
        id: '3',
        name: '观光巴士站',
        description: '环保观光巴士，舒适便捷',
        rating: 4.5,
        distance: '50m',
        phone: '0571-88888890',
        location: '景区南门',
        image: '/assets/images/scenic_spots/waterfall.jpg'
      }
    ];

    // 模拟加载延迟 - Apple风格体验
    setTimeout(() => {
      this.setData({
        merchants: coremerchants,
        loading: false
      });
      wx.stopPullDownRefresh();
    }, 600);
  },

  /**
   * 商家操作选择 - 简化交互
   */
  viewMerchantActions: function(e) {
    const merchantId = e.currentTarget.dataset.id;
    const merchant = this.data.merchants.find(m => m.id === merchantId);
    
    if (merchant) {
      // Apple风格的操作选择
      wx.showActionSheet({
        itemList: ['拨打电话', '导航前往'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.callMerchant({ currentTarget: { dataset: { phone: merchant.phone } } });
          } else if (res.tapIndex === 1) {
            this.navigateToMerchant({ currentTarget: { dataset: { location: merchant.location } } });
          }
        }
      });
    }
  },

  /**
   * 拨打电话 - 直接操作
   */
  callMerchant: function(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      success: () => {
        // 成功调起拨号界面
        console.log('成功调起拨号界面');
      },
      fail: () => {
        wx.showToast({
          title: '拨打失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 导航到商家 - 直接操作
   */
  navigateToMerchant: function(e) {
    const location = e.currentTarget.dataset.location;
    
    // 精确的商家坐标
    const coordinates = {
      '景区中心广场': { lat: 30.2741, lng: 120.1551 },
      '景区入口处': { lat: 30.2750, lng: 120.1540 },
      '景区南门': { lat: 30.2730, lng: 120.1560 }
    };
    
    const coord = coordinates[location] || { lat: 30.2741, lng: 120.1551 };
    
    wx.openLocation({
      latitude: coord.lat,
      longitude: coord.lng,
      name: location,
      address: '杭州市西湖区',
      scale: 18,
      fail: () => {
        wx.showToast({
          title: '导航失败',
          icon: 'error'
        });
      }
    });
  },

  /**
   * 页面分享设置
   */
  onShareAppMessage: function () {
    return {
      title: '码上合作 - 优质服务',
      path: '/pages/merchant/merchant'
    };
  }
}); 