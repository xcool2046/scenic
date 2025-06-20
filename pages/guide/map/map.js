// pages/guide/map/map.js
const config = require('../../../utils/config');

Page({
  data: {
    // 地图基础配置
    latitude: 39.908823, // 默认纬度 (示例位置)
    longitude: 116.397470, // 默认经度
    scale: 16, // 缩放级别
    markers: [],
    showCompass: true,
    enableBuilding: true,
    enableZoom: true,
    enableScroll: true,
    enableRotate: true,
    showLocation: true,
    showScale: true,
    
    // 简化的景点数据
    spots: [
      {
        id: 1,
        name: '望海亭',
        desc: '位于景区最高点，可俯瞰整个景区美景',
        latitude: 39.909000,
        longitude: 116.398000,
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 2,
        name: '松月湖',
        desc: '景区最大的湖泊，湖水清澈见底',
        latitude: 39.907500,
        longitude: 116.396500,
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 3,
        name: '古樟园',
        desc: '百年古樟树群落，树荫蔽日',
        latitude: 39.906000,
        longitude: 116.395000,
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 4,
        name: '飞瀑溪',
        desc: '山涧飞瀑，水声潺潺',
        latitude: 39.908500,
        longitude: 116.394500,
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 5,
        name: '游客中心',
        desc: '提供咨询服务、导览图和休息区',
        latitude: 39.908000,
        longitude: 116.397000,
        iconPath: '/assets/icons/markers/facility.png'
      }
    ],
    
    // 当前选中的景点信息
    selectedSpot: null,
    showInfoPanel: false
  },

  onLoad: function (options) {
    // 初始化地图标记
    this.initMapMarkers();
    
    // 获取用户当前位置
    this.getUserLocation();
    
    // 如果有选定的景点ID参数
    if (options.spotId) {
      this.showSpotDetail(parseInt(options.spotId));
    }
  },

  // 初始化地图标记点
  initMapMarkers: function() {
    const markers = this.data.spots.map(spot => {
      return {
        id: spot.id,
        latitude: spot.latitude,
        longitude: spot.longitude,
        title: spot.name,
        iconPath: spot.iconPath,
        width: 40,
        height: 40,
        callout: {
          content: spot.name,
          color: '#1a1a1a',
          fontSize: 14,
          borderRadius: 8,
          bgColor: '#ffffff',
          padding: 8,
          display: 'BYCLICK',
          boxShadow: '0 4rpx 16rpx rgba(0,0,0,0.1)'
        }
      };
    });
    
    this.setData({
      markers: markers
    });
  },

  // 地图点击事件
  onMarkerTap: function(e) {
    const markerId = e.detail.markerId;
    const spot = this.data.spots.find(s => s.id === markerId);
    
    if (spot) {
      this.setData({
        selectedSpot: spot,
        showInfoPanel: true
      });
    }
  },

  // 关闭信息面板
  hideInfoPanel: function() {
    this.setData({
      showInfoPanel: false,
      selectedSpot: null
    });
  },

  // 获取用户当前位置
  getUserLocation: function() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 添加用户位置标记
        const userMarker = {
          id: 999,
          latitude: res.latitude,
          longitude: res.longitude,
          iconPath: '/assets/icons/user_location.png',
          width: 32,
          height: 32,
          title: '我的位置'
        };
        
        const newMarkers = [...this.data.markers, userMarker];
        this.setData({
          markers: newMarkers,
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        console.log('获取位置失败');
      }
    });
  },

  // 跳转到景点详情
  navigateToSpotDetail: function() {
    if (this.data.selectedSpot) {
      wx.navigateTo({
        url: `/pages/guide/spot/spot?id=${this.data.selectedSpot.id}`
      });
    }
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  }
}); 