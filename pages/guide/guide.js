// pages/guide/guide.js
const config = require('../../utils/config');

Page({
  data: {
    sortText: '距离优先',
    sortType: 'distance', // 可选值：distance, popular
    spots: [
      {
        id: 1,
        name: '望海亭',
        desc: '位于景区最高点，可俯瞰整个景区美景，是拍摄日出和全景的最佳地点',
        image: config.IMAGES.SPOTS[0],
        distance: '200米',
        duration: '15分钟',
        hot: true
      },
      {
        id: 2,
        name: '松月湖',
        desc: '景区最大的湖泊，湖水清澈见底，四周绿树环绕，环湖步道风景秀丽',
        image: config.IMAGES.SCENIC_SPOTS.LAKE,
        distance: '500米',
        duration: '30分钟',
        hot: true
      },
      {
        id: 3,
        name: '古樟园',
        desc: '百年古樟树群落，树荫蔽日，夏季凉爽宜人，是休憩和体验自然的好去处',
        image: config.IMAGES.SCENIC_SPOTS.OLD_TREES,
        distance: '850米',
        duration: '20分钟',
        hot: false
      },
      {
        id: 4,
        name: '飞瀑溪',
        desc: '山涧飞瀑，水声潺潺，溪边设有观景平台，可近距离感受大自然的魅力',
        image: config.IMAGES.SCENIC_SPOTS.WATERFALL,
        distance: '1.2公里',
        duration: '25分钟',
        hot: false
      }
    ],
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
    // 可以根据传入参数加载不同数据
    this.sortByDistance(); // 初始化时按距离排序
  },

  // 切换排序方式
  toggleSortOption() {
    if (this.data.sortType === 'distance') {
      this.setData({
        sortType: 'popular',
        sortText: '热门优先',
        spots: this.data.spots.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0))
      });
    } else {
      this.sortByDistance();
    }
  },

  // 按距离排序
  sortByDistance() {
    this.setData({
      sortType: 'distance',
      sortText: '距离优先',
      spots: this.data.spots.sort((a, b) => {
        const distA = parseFloat(a.distance.replace(/[^0-9\.]/g, ''));
        const distB = parseFloat(b.distance.replace(/[^0-9\.]/g, ''));
        return distA - distB;
      })
    });
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