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
        image: config.IMAGES.ROUTE_IMAGES.CLASSIC
      },
      {
        id: 2,
        name: '休闲亲子游',
        spotCount: 5,
        duration: '2小时',
        image: config.IMAGES.ROUTE_IMAGES.FAMILY
      },
      {
        id: 3,
        name: '摄影精选线',
        spotCount: 6,
        duration: '2.5小时',
        image: config.IMAGES.ROUTE_IMAGES.PHOTO
      }
    ],
    // 添加CDN图标路径
    icons: config.ICONS,
    images: config.IMAGES
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
      url: '/pages/guide/map/map'
    });
  },

  // 导航到景点详情
  navigateToSpotDetail(e) {
    const spotId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/guide/spot/spot?id=${spotId}`
    });
  },

  // 导航到路线详情
  navigateToRouteDetail(e) {
    const routeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/guide/route/route?id=${routeId}`
    });
  },

  // 导航到设施页面
  navigateToFacility(e) {
    const type = e.currentTarget.dataset.type;
    let title = '';
    
    switch(type) {
      case 'toilet':
        title = '洗手间';
        break;
      case 'food':
        title = '餐饮服务';
        break;
      case 'rest':
        title = '休息区';
        break;
      case 'parking':
        title = '停车场';
        break;
      case 'medical':
        title = '医疗服务';
        break;
      case 'transport':
        title = '接驳车';
        break;
      default:
        title = '设施信息';
    }
    
    wx.navigateTo({
      url: `/pages/guide/facility/facility?type=${type}&title=${title}`
    });
  }
}) 