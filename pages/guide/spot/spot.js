const config = require('../../../utils/config');

Page({
  data: {
    spotId: null,
    spot: null,
    loading: true,
    
    // 轮播图配置
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    
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
    
    // 景点数据示例（实际应该从API获取）
    spotData: [
      {
        id: 1,
        name: '望海亭',
        type: 'scenery',
        images: [
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg'
        ],
        description: '望海亭位于景区最高点，建于明代嘉靖年间，是观赏日出日落的绝佳地点。亭内碑刻"海天一色"四字，笔力遒劲。站在亭中，可俯瞰整个景区美景，是拍摄全景照片的最佳位置。每到清晨，云海缭绕，景色尤为壮丽。',
        openTime: '全天开放',
        location: '景区东北角高处',
        popularity: 4.8,
        features: ['摄影圣地', '观景台', '历史建筑'],
        nearbySpots: [2, 4],
        latitude: 39.909000,
        longitude: 116.398000
      },
      {
        id: 2,
        name: '松月湖',
        type: 'scenery',
        images: [
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg'
        ],
        description: '松月湖是景区最大的湖泊，湖水清澈见底，四周绿树环绕，环湖步道风景秀丽。湖中有小岛，岛上古松参天。湖面倒映着蓝天白云和翠绿山色，如诗如画。湖畔设有休息亭，游客可在此小憩，欣赏湖光山色。',
        openTime: '全天开放',
        location: '景区中央',
        popularity: 4.7,
        features: ['湖泊', '步道', '划船'],
        nearbySpots: [1, 4, 5],
        latitude: 39.907500,
        longitude: 116.396500
      },
      {
        id: 3,
        name: '东大门',
        type: 'entrance',
        images: [
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg'
        ],
        description: '东大门是景区的主要入口，建筑风格古朴典雅，牌楼上刻有"自然胜境"四字。门内设有游客服务中心，提供地图、租赁、问询等服务。出入口处设有检票闸机，游客须凭有效门票入园。',
        openTime: '08:30-17:30',
        location: '景区东侧',
        popularity: 4.5,
        features: ['主入口', '游客服务', '停车场'],
        nearbySpots: [4],
        latitude: 39.910000,
        longitude: 116.399000
      },
      {
        id: 4,
        name: '游客中心',
        type: 'facility',
        images: [
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg'
        ],
        description: '游客中心位于景区中心位置，提供综合性服务，包括景区介绍、路线推荐、物品寄存、失物招领、医疗救助等。中心内设有休息区、洗手间、饮水处等便民设施，还有景区文创产品销售区。',
        openTime: '09:00-17:00',
        location: '景区中心',
        popularity: 4.6,
        features: ['服务设施', '休息区', '文创产品'],
        nearbySpots: [2, 3, 5],
        latitude: 39.908000,
        longitude: 116.397000
      },
      {
        id: 5,
        name: '湖畔茶室',
        type: 'food',
        images: [
          '/assets/images/spots/spot1.jpg',
          '/assets/images/spots/spot1.jpg'
        ],
        description: '湖畔茶室临水而建，环境雅致，是品茗休憩的好去处。茶室提供各种名优茶品及精美点心，最有特色的是用景区山泉水冲泡的高山云雾茶，清香四溢。茶室设有室内区和露台区，可一边品茶一边欣赏湖景。',
        openTime: '09:30-16:30',
        location: '松月湖南岸',
        popularity: 4.5,
        features: ['茶馆', '点心', '湖景'],
        nearbySpots: [2, 4],
        latitude: 39.907000,
        longitude: 116.398500
      }
    ]
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
      // 查找对应ID的景点数据
      const spot = this.data.spotData.find(item => item.id === spotId);
      
      if (spot) {
        // 模拟获取实时人流量数据
        this.getRealtimeCrowdInfo(spotId);
        
        this.setData({
          spot: spot,
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
      imageUrl: spot.images[0]
    };
  },

  // 查看图片大图
  previewImage: function(e) {
    const current = e.currentTarget.dataset.src;
    const urls = this.data.spot.images;
    
    wx.previewImage({
      current: current,
      urls: urls
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