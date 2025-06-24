// pages/guide/guide.js
const config = require('../../utils/config');
const spotsData = require('../../utils/spots-data');

Page({
  data: {
    sortText: '距离优先',
    sortType: 'distance', // 可选值：distance, popular
    spots: [],
    routes: [
      {
        id: 1,
        name: '经典全景游',
        spotCount: 8,
        duration: '3小时',
        image: config.IMAGES.ROUTE_IMAGES.CLASSIC,
        description: '涵盖景区所有主要景点，适合首次游览的游客，全程约3小时，可深度体验景区精华。'
      },
      {
        id: 2,
        name: '休闲亲子游',
        spotCount: 5,
        duration: '2小时',
        image: config.IMAGES.ROUTE_IMAGES.FAMILY,
        description: '专为家庭设计的轻松路线，路程相对较短，适合带老人和小孩的家庭游览。'
      },
      {
        id: 3,
        name: '摄影精选线',
        spotCount: 6,
        duration: '2.5小时',
        image: config.IMAGES.ROUTE_IMAGES.PHOTO,
        description: '精选最佳拍摄点位，适合摄影爱好者，每个景点都有独特的拍摄角度和光线条件。'
      }
    ],
    // 添加CDN图标路径
    icons: config.ICONS,
    images: config.IMAGES,
    
    // 路线详情弹窗数据
    showRouteModal: false,
    selectedRoute: null
  },

  onLoad(options) {
    // 加载景点数据
    this.loadSpotsData();
  },

  // 加载景点数据
  loadSpotsData() {
    const spots = spotsData.getSortedSpots(this.data.sortType);
    this.setData({
      spots: spots
    });
  },

  // 切换排序方式
  toggleSortOption() {
    if (this.data.sortType === 'distance') {
      this.setData({
        sortType: 'popular',
        sortText: '热门优先'
      });
    } else {
      this.setData({
        sortType: 'distance',
        sortText: '距离优先'
      });
    }
    
    // 重新加载排序后的数据
    this.loadSpotsData();
  },

  // 打开完整地图
  navigateToFullMap() {
    wx.navigateTo({
      url: '/pages/map/map'
    });
  },

  // 导航到景点详情
  navigateToSpotDetail(e) {
    const spotId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/guide/spot/spot?id=${spotId}`
    });
  },

  // 显示路线详情（改为弹窗展示）
  showRouteDetail(e) {
    const routeId = e.currentTarget.dataset.id;
    const route = this.data.routes.find(r => r.id === routeId);
    
    if (route) {
      this.setData({
        selectedRoute: route,
        showRouteModal: true
      });
    }
  },

  // 关闭路线详情弹窗
  hideRouteModal() {
    this.setData({
      showRouteModal: false,
      selectedRoute: null
    });
  },

  // 设施相关功能提示（改为跳转到附近页面）
  navigateToNearby() {
    wx.navigateTo({
      url: '/pages/guide/nearby/nearby'
    });
  }
}) 