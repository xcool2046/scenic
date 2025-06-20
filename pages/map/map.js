// pages/map/map.js
const app = getApp();
const env = require('../../utils/env');
const { mapManager } = require('../../utils/map');
const { userManager } = require('../../utils/user');
const api = require('../../utils/api');
const config = require('../../utils/config');
const performance = require('../../utils/performance');

Page({
  data: {
    config,
    
    // 地图基础配置
    latitude: 39.9042,
    longitude: 116.4074,
    scale: 16,
    mapType: 'standard', // standard, satellite
    
    // 标记点数据
    markers: [],
    selectedMarker: null,
    
    // 路线数据
    polyline: [],
    
    // 景点和设施数据（将从 MapManager 获取）
    spots: [],
    facilities: [],
    
    // UI状态
    loading: true,
    error: false,
    showLegend: false,
    
    // 地图实例
    mapCtx: null
  },

  async onLoad(options) {
    try {
      console.log('地图页面加载:', options);
      
      // 创建地图上下文
      this.mapCtx = wx.createMapContext('map', this);
      
      // 初始化地图数据
      await this.initializeMapData();
      
      // 处理页面参数
      this.processOptions(options);
      
      this.setData({ loading: false });
      
    } catch (error) {
      console.error('地图页面加载失败:', error);
      this.setData({ 
        loading: false,
        error: true 
      });
    }
  },

  onShow() {
    // 记录页面显示性能
    performance.performanceMonitor.recordPageShow('map');
  },
  
  // 获取当前位置
  getCurrentLocation() {
    wx.showLoading({ title: '正在定位...' });
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('定位成功:', res);
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          loading: false
        });
      },
      fail: (error) => {
        console.error('定位失败:', error);
        // 使用默认位置
        this.setData({ 
          loading: false 
        });
        
        // 提示用户
        wx.showModal({
          title: '提示',
          content: '无法获取您的位置，部分功能可能受限。请授权位置权限并重试。',
          showCancel: false
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  // 初始化地图数据
  async initializeMapData() {
    try {
      console.log('开始初始化地图数据...');
      
      // 先设置默认位置，确保地图能显示
      this.setData({
        latitude: 39.9042, // 北京位置作为默认
        longitude: 116.4074,
        scale: 16,
        loading: false,
        error: false
      });
      
      // 尝试等待 MapManager 就绪（如果失败不影响基本显示）
      try {
        const mapManager = await app.waitForManager('map');
        
        // 从 MapManager 获取数据
        const spots = mapManager.getAllSpots();
        const facilities = mapManager.getAllFacilities();
        const userLocation = mapManager.getCurrentLocation();
        
        console.log('从 MapManager 获取数据:', { spots, facilities, userLocation });

        if (userLocation) {
          this.setData({
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          });
        }

        const markers = [];
        
        // 添加景点标记
        spots.forEach(spot => {
          markers.push({
            id: spot.id,
            latitude: spot.latitude,
            longitude: spot.longitude,
            title: spot.name,
            iconPath: this.getMarkerIcon(spot.category), // 使用 category 字段
            width: 32,
            height: 32,
            callout: {
              content: spot.name,
              display: 'BYCLICK',
              fontSize: 14,
              borderRadius: 6,
              padding: 10,
              bgColor: '#ffffff',
              textAlign: 'center'
            },
            ...spot
          });
        });
        
        // 添加设施标记
        facilities.forEach(facility => {
          markers.push({
            id: facility.id,
            latitude: facility.latitude,
            longitude: facility.longitude,
            title: facility.name,
            iconPath: this.getMarkerIcon(facility.type),
            width: 28,
            height: 28,
            ...facility
          });
        });
        
        this.setData({ 
          spots, 
          facilities,
          markers
        });
        
      } catch (mapManagerError) {
        console.warn('MapManager 加载失败，使用默认配置:', mapManagerError);
        // 即使 MapManager 失败，地图仍然可以显示
      }

    } catch (error) {
      console.error('初始化地图数据失败:', error);
      this.setData({
        loading: false,
        error: true,
        errorMessage: '地图数据加载失败，请稍后重试。'
      });
    }
  },

  // 获取标记图标
  getMarkerIcon(type) {
    const iconMap = {
      'entrance': '/assets/icons/markers/entrance.png',
      'scenic': '/assets/icons/markers/scenic.png',
      'facility': '/assets/icons/markers/facility.png',
      'toilet': '/assets/icons/markers/toilet.png',
      'food': '/assets/icons/markers/food.png',
      'rest': '/assets/icons/markers/rest.png',
      // 新增分类
      'natural': '/assets/icons/markers/scenic.png',
      'cultural': '/assets/icons/markers/scenic.png',
      'viewpoint': '/assets/icons/markers/scenic.png',
      'recreation': '/assets/icons/markers/scenic.png',
    };
    return iconMap[type] || '/assets/icons/markers/default.png';
  },

  // 处理页面参数
  processOptions(options) {
    // 如果传入了特定类型，筛选显示
    if (options.type) {
      const filteredMarkers = this.data.markers.filter(marker => 
        marker.type === options.type
      );
      this.setData({ markers: filteredMarkers });
    }
    
    // 如果传入了景点ID，定位到该景点
    if (options.spotId) {
      this.locateToSpot(options.spotId);
    }
  },

  // 定位到指定景点
  locateToSpot(spotId) {
    const marker = this.data.markers.find(m => m.id == spotId);
    if (marker) {
      this.setData({
        latitude: marker.latitude,
        longitude: marker.longitude,
        scale: 18,
        selectedMarker: marker
      });
    }
  },

  // 标记点击事件
  onMarkerTap(e) {
    const markerId = e.markerId || e.detail.markerId;
    const marker = this.data.markers.find(m => m.id === markerId);
    
    if (marker) {
      console.log('点击标记:', marker);
      this.setData({
        selectedMarker: marker,
        latitude: marker.latitude,
        longitude: marker.longitude,
        scale: 18
      });
    }
  },

  // 地图点击事件
  onMapTap() {
    // 点击空白区域关闭信息面板
    this.setData({ selectedMarker: null });
  },

  // 地区改变事件
  onRegionChange(e) {
    if (e.type === 'end') {
      console.log('地图区域改变:', e.detail);
    }
  },

  // 控件点击事件
  onControlTap(e) {
    console.log('控件点击:', e);
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
    
    wx.openLocation({
      latitude: marker.latitude,
      longitude: marker.longitude,
      name: marker.title,
      address: marker.description || '',
      scale: 18
    });
  },

  // 查看标记详情
  viewMarkerDetail() {
    const marker = this.data.selectedMarker;
    if (!marker || !marker.detailUrl) return;
    
    wx.navigateTo({
      url: marker.detailUrl
    });
  },

  // 关闭信息面板
  closeInfoPanel() {
    this.setData({ selectedMarker: null });
  },

  // 切换图例显示
  toggleLegend() {
    this.setData({ showLegend: !this.data.showLegend });
  },

  // 重试加载
  retryLoad() {
    this.setData({ error: false, loading: true });
    this.onLoad();
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '景区地图 - 智慧导览',
      path: '/pages/map/map',
      imageUrl: '/assets/images/map_preview.jpg'
    };
  }
})