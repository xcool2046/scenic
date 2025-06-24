const config = require('../../../utils/config');
const spotsData = require('../../../utils/spots-data');

Page({
  data: {
    spotId: null,
    spot: null,
    loading: true,
    nearbySpots: [],
    
    // 喜欢状态
    isLiked: false,
    
    // 实时人流量信息
    crowdInfo: {
      level: 2, // 1: 空闲, 2: 适中, 3: 拥挤, 4: 非常拥挤
      levelText: '适中',
      percentFull: 55,
      updateTime: '10:30', // 更新时间
      waitTime: 10 // 预计等待时间（分钟）
    },
    
    // 最佳游览时间
    bestVisitTimes: [
      { period: '上午', time: '8:30-10:30', status: 'best' },
      { period: '中午', time: '11:30-13:30', status: 'good' },
      { period: '下午', time: '14:30-16:30', status: 'normal' },
      { period: '傍晚', time: '17:00-18:30', status: 'good' }
    ],
    

  },

  onLoad: function (options) {
    if (options.id) {
      const spotId = parseInt(options.id);
      this.setData({
        spotId: spotId
      });
      
      // 加载景点数据
      this.loadSpotData(spotId);
    } else {
      wx.showToast({
        title: '景点信息不存在',
        icon: 'error'
      });
      
      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载景点数据
  loadSpotData: function(spotId) {
    // 模拟数据加载延迟
    wx.showLoading({
      title: '加载中...',
    });
    
    setTimeout(() => {
      // 从统一数据源获取景点数据
      const spot = spotsData.getSpotById(spotId);
      
      if (spot) {
        // 获取附近景点数据
        const nearbySpots = spotsData.getNearbySpots(spotId);
        
        // 模拟获取实时人流量数据
        this.getRealtimeCrowdInfo(spotId);
        
        this.setData({
          spot: spot,
          nearbySpots: nearbySpots,
          loading: false
        });
      } else {
        wx.showToast({
          title: '景点信息不存在',
          icon: 'error'
        });
        
        // 延迟返回
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
      
      wx.hideLoading();
    }, 800);
  },
  
  // 获取实时人流量数据（模拟）
  getRealtimeCrowdInfo: function(spotId) {
    // 实际项目中应该从服务器API获取实时数据
    // 这里仅做模拟
    const levels = ['空闲', '适中', '拥挤', '非常拥挤'];
    const randomLevel = Math.floor(Math.random() * 4) + 1;
    const randomPercent = Math.floor(Math.random() * 30) + (randomLevel - 1) * 25;
    const randomWaitTime = Math.floor(Math.random() * 10) + (randomLevel - 1) * 10;
    
    // 获取当前时间
    const now = new Date();
    const updateTime = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    
    this.setData({
      crowdInfo: {
        level: randomLevel,
        levelText: levels[randomLevel - 1],
        percentFull: randomPercent,
        updateTime: updateTime,
        waitTime: randomWaitTime
      }
    });
  },

  // 收藏/取消收藏
  toggleLike: function() {
    this.setData({
      isLiked: !this.data.isLiked
    });
    
    wx.showToast({
      title: this.data.isLiked ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
    
    // 实际应用中，应该将收藏状态保存到后端或本地存储
  },

  // 分享功能
  onShareAppMessage: function() {
    const spot = this.data.spot;
    if (!spot) return {};
    
    return {
      title: `【景区导览】${spot.name}`,
      path: `/pages/guide/spot/spot?id=${spot.id}`,
      imageUrl: spot.image
    };
  },

  // 查看图片大图
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src;
    
    wx.previewImage({
      current: current,
      urls: [current] // 单张图片预览
    });
  },

  // 导航到地图页面
  navigateToMap: function() {
    const spot = this.data.spot;
    if (!spot) return;
    
    wx.navigateTo({
      url: `/pages/map/map?spotId=${spot.id}`
    });
  },

  // 导航到附近景点
  navigateToNearbySpot: function(e) {
    const spotId = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/guide/spot/spot?id=${spotId}`
    });
  }
}) 