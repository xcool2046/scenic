// pages/map/map.js - Apple 风格极简地图逻辑
const app = getApp();
const config = require('../../utils/config');
const performance = require('../../utils/performance');

Page({
  data: {
    // 地图基础配置
    latitude: 39.9042,
    longitude: 116.4074,
    scale: 16,
    mapType: 'standard',
    
    // 标记点数据
    markers: [],
    selectedMarker: null,
    
    // 路线数据
    polyline: [],
    
    // UI状态
    loading: true,
    error: false,
    errorMessage: '',
    
    // 地图实例
    mapCtx: null,

    // 简化的景点数据（避免复杂的MapManager依赖）
    spotsData: [
      {
        id: 1,
        name: '望海亭',
        type: 'scenic',
        category: '景点',
        latitude: 39.909000,
        longitude: 116.398000,
        description: '位于景区最高点，可俯瞰整个景区美景，是拍摄日出和全景的最佳地点',
        features: ['观景', '摄影', '日出'],
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 2,
        name: '松月湖',
        type: 'scenic',
        category: '景点',
        latitude: 39.907500,
        longitude: 116.396500,
        description: '景区最大的湖泊，湖水清澈见底，四周绿树环绕',
        features: ['湖泊', '划船', '休闲'],
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 3,
        name: '古樟园',
        type: 'scenic',
        category: '景点',
        latitude: 39.906000,
        longitude: 116.395000,
        description: '百年古樟树群落，树荫蔽日，夏季凉爽宜人',
        features: ['古树', '避暑', '休憩'],
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 4,
        name: '飞瀑溪',
        type: 'scenic',
        category: '景点',
        latitude: 39.908500,
        longitude: 116.394500,
        description: '山涧飞瀑，水声潺潺，溪边设有观景平台',
        features: ['瀑布', '观景台', '自然'],
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 5,
        name: '游客中心',
        type: 'facility',
        category: '设施',
        latitude: 39.908000,
        longitude: 116.397000,
        description: '提供咨询服务、导览图和休息区',
        features: ['服务', '休息', '咨询'],
        iconPath: '/assets/icons/markers/facility.png'
      },
      {
        id: 6,
        name: '东大门',
        type: 'entrance',
        category: '入口',
        latitude: 39.910000,
        longitude: 116.399000,
        description: '景区主要入口，提供检票和导览服务',
        features: ['入口', '检票', '停车'],
        iconPath: '/assets/icons/markers/entrance.png'
      }
    ]
  },

  async onLoad(options) {
    try {
      console.log('地图页面加载:', options);
      
      // 创建地图上下文
      this.mapCtx = wx.createMapContext('map', this);
      
      // 初始化地图数据
      await this.initializeMap();
      
      // 处理页面参数（支持从导览页面跳转）
      if (options.spotId) {
        this.locateToSpot(parseInt(options.spotId));
      }
      
      this.setData({ loading: false });
      
    } catch (error) {
      console.error('地图页面加载失败:', error);
      this.setData({ 
        loading: false,
        error: true,
        errorMessage: '地图初始化失败，请检查网络连接'
      });
    }
  },

  onShow() {
    performance.performanceMonitor.recordPageShow('map');
  },

  // 初始化地图
  async initializeMap() {
    try {
      // 获取用户位置
      await this.getCurrentLocation();
      
      // 初始化标记点
      this.initializeMarkers();
      
    } catch (error) {
      console.warn('地图初始化部分功能失败:', error);
      // 使用默认位置和数据，确保地图能正常显示
      this.initializeMarkers();
    }
  },

  // 获取当前位置
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('定位成功:', res);
          this.setData({
            latitude: res.latitude,
            longitude: res.longitude
          });
          resolve(res);
        },
        fail: (error) => {
          console.warn('定位失败，使用默认位置:', error);
          // 不阻塞流程，使用默认位置
          resolve(null);
        }
      });
    });
  },

  // 初始化标记点
  initializeMarkers() {
    const markers = this.data.spotsData.map(spot => ({
      id: spot.id,
      latitude: spot.latitude,
      longitude: spot.longitude,
      title: spot.name,
      iconPath: this.getMarkerIcon(spot.type),
      width: 32,
      height: 32,
      callout: {
        content: spot.name,
        display: 'BYCLICK',
        fontSize: 14,
        borderRadius: 8,
        padding: 8,
        bgColor: '#ffffff',
        color: '#333333',
        textAlign: 'center'
      },
      // 保存完整的景点数据
      ...spot
    }));

    this.setData({ markers });
  },

  // 获取标记图标
  getMarkerIcon(type) {
    const iconMap = {
      'scenic': '/assets/icons/markers/scenic.png',
      'facility': '/assets/icons/markers/facility.png',
      'entrance': '/assets/icons/markers/entrance.png',
      'food': '/assets/icons/markers/food.png',
      'toilet': '/assets/icons/markers/toilet.png',
      'rest': '/assets/icons/markers/rest.png'
    };
    return iconMap[type] || '/assets/icons/markers/default.png';
  },

  // 定位到指定景点
  locateToSpot(spotId) {
    const spot = this.data.spotsData.find(s => s.id === spotId);
    if (spot) {
      this.setData({
        latitude: spot.latitude,
        longitude: spot.longitude,
        scale: 18,
        selectedMarker: spot
      });
      
      // 延迟移动到指定位置，确保地图已渲染
      setTimeout(() => {
        if (this.mapCtx) {
          this.mapCtx.moveToLocation({
            latitude: spot.latitude,
            longitude: spot.longitude
          });
        }
      }, 500);
    }
  },

  // 标记点击事件
  onMarkerTap(e) {
    const markerId = e.detail.markerId;
    const marker = this.data.markers.find(m => m.id === markerId);
    
    if (marker) {
      this.setData({ selectedMarker: marker });
    }
  },

  // 地图点击事件
  onMapTap() {
    // 点击地图空白区域时关闭信息面板
    this.setData({ selectedMarker: null });
  },

  // 地图区域变化
  onRegionChange(e) {
    if (e.type === 'end') {
      console.log('地图区域改变:', e.detail);
    }
  },

  // 关闭信息面板
  closeInfoPanel() {
    this.setData({ selectedMarker: null });
  },

  // 切换地图类型
  switchMapType() {
    const newType = this.data.mapType === 'standard' ? 'satellite' : 'standard';
    this.setData({ mapType: newType });
  },

  // 放大地图
  zoomIn() {
    const newScale = Math.min(this.data.scale + 2, 20);
    this.setData({ scale: newScale });
  },

  // 缩小地图
  zoomOut() {
    const newScale = Math.max(this.data.scale - 2, 5);
    this.setData({ scale: newScale });
  },

  // 导航到标记点
  navigateToMarker() {
    const marker = this.data.selectedMarker;
    if (!marker) return;

    wx.showActionSheet({
      itemList: ['使用微信导航', '使用第三方地图'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 使用微信内置导航
          wx.openLocation({
            latitude: marker.latitude,
            longitude: marker.longitude,
            name: marker.name,
            address: marker.description
          });
        } else if (res.tapIndex === 1) {
          // 调用第三方地图
          this.openThirdPartyMap(marker);
        }
      }
    });
  },

  // 调用第三方地图
  openThirdPartyMap(marker) {
    const url = `https://uri.amap.com/navigation?to=${marker.longitude},${marker.latitude}&toname=${marker.name}`;
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '地址已复制',
          icon: 'success'
        });
      }
    });
  },

  // 查看标记详情
  viewMarkerDetail() {
    const marker = this.data.selectedMarker;
    if (!marker) return;

    // 跳转到景点详情页面
    if (marker.type === 'scenic') {
      wx.navigateTo({
        url: `/pages/guide/spot/spot?id=${marker.id}`
      });
    } else {
      wx.showToast({
        title: '暂无详情页面',
        icon: 'none'
      });
    }
  },

  // 重新加载
  retryLoad() {
    this.setData({
      loading: true,
      error: false,
      errorMessage: ''
    });
    
    this.initializeMap().then(() => {
      this.setData({ loading: false });
    }).catch(() => {
      this.setData({
        loading: false,
        error: true,
        errorMessage: '重新加载失败，请检查网络连接'
      });
    });
  },

  // 分享功能
  onShareAppMessage() {
    const marker = this.data.selectedMarker;
    if (marker) {
      return {
        title: `【景区地图】${marker.name}`,
        path: `/pages/map/map?spotId=${marker.id}`,
        imageUrl: '/assets/images/map_preview.jpg'
      };
    }
    
    return {
      title: '景区地图 - 智能导览',
      path: '/pages/map/map',
      imageUrl: '/assets/images/map_preview.jpg'
    };
  }
});