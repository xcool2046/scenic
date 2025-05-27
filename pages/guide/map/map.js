// pages/guide/map/map.js
const config = require('../../../utils/config');
const util = require('../../../utils/util');
const mapKey = require('../../../utils/mapKey');
const interaction = require('../../../utils/interaction');

Page({
  data: {
    // 地图配置
    latitude: 39.908823, // 默认纬度 (示例: 北京天安门)
    longitude: 116.397470, // 默认经度
    scale: 16, // 缩放级别，3-20
    markers: [],
    polyline: [],
    currentLocation: null,
    showCompass: true,
    enableBuilding: true,
    enableZoom: true,
    enableScroll: true,
    enableRotate: true,
    showLocation: true,
    showScale: true,
    subkey: "6WNBZ-5IUK3-64A3K-RTYQS-CVYR2-R4FOQ", // 硬编码腾讯地图密钥
    useWebView: false, // 是否使用web-view方式加载高德地图
    
    // UI数据
    activeSpotsFilter: 'all', // 筛选类型: all, scenery, facility, entrance, etc
    spotTypes: [
      { id: 'all', name: '全部' },
      { id: 'scenery', name: '景点' },
      { id: 'facility', name: '设施' },
      { id: 'entrance', name: '出入口' },
      { id: 'food', name: '餐饮' }
    ],
    
    // 景点数据 (实际项目中应从API获取)
    spots: [
      {
        id: 1,
        type: 'scenery',
        name: '望海亭',
        latitude: 39.909000,
        longitude: 116.398000,
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 2,
        type: 'scenery',
        name: '松月湖',
        latitude: 39.907500,
        longitude: 116.396500,
        iconPath: '/assets/icons/markers/scenic.png'
      },
      {
        id: 3,
        type: 'entrance',
        name: '东大门',
        latitude: 39.910000,
        longitude: 116.399000,
        iconPath: '/assets/icons/markers/entrance.png'
      },
      {
        id: 4,
        type: 'facility',
        name: '游客中心',
        latitude: 39.908000,
        longitude: 116.397000,
        iconPath: '/assets/icons/markers/facility.png'
      },
      {
        id: 5,
        type: 'food',
        name: '湖畔茶室',
        latitude: 39.907000,
        longitude: 116.398500,
        iconPath: '/assets/icons/markers/food.png'
      }
    ],
    
    // 推荐路线 (实际项目中应从API获取)
    routes: [
      {
        id: 1,
        name: '经典路线',
        color: '#FF4500',
        width: 4,
        points: [
          {
            latitude: 39.910000,
            longitude: 116.399000
          },
          {
            latitude: 39.908000,
            longitude: 116.397000
          },
          {
            latitude: 39.907500,
            longitude: 116.396500
          },
          {
            latitude: 39.909000,
            longitude: 116.398000
          }
        ]
      }
    ],
    
    // 路线类型
    routeTypes: [
      { id: 'walking', name: '步行' },
      { id: 'driving', name: '驾车' },
      { id: 'transit', name: '公交' },
      { id: 'riding', name: '骑行' }
    ],
    
    // 当前路线类型
    currentRouteType: 'walking',
    
    // 当前选中的路线ID
    activeRouteId: 0,
    
    // 当前选中的景点信息
    selectedSpot: null,
    
    // 控制底部信息面板显示
    showInfoPanel: false,
    
    // 周边兴趣点
    nearbyPOIs: [],
    
    // 交通状况显示
    showTraffic: false,
    
    // 是否显示室内地图
    showIndoorMap: false
  },

  onLoad: function (options) {
    // 获取并设置设备信息
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      controls: this.getMapControls(systemInfo),
      windowHeight: systemInfo.windowHeight,
      windowWidth: systemInfo.windowWidth
    });
    
    // 初始化地图
    this.initMap();
    
    // 初始化地图标记
    this.initMapMarkers();
    
    // 获取用户当前位置
    this.getUserLocation();
    
    // 如果有选定的景点ID参数
    if (options.spotId) {
      this.showSpotDetail(parseInt(options.spotId));
    }
    
    // 如果有选定的路线ID参数
    if (options.routeId) {
      this.showRoute(parseInt(options.routeId));
    }
  },

  // 初始化地图标记点
  initMapMarkers: function() {
    // 使用默认图标，如果没有自定义图标
    const defaultIcons = {
      'scenery': '/assets/icons/markers/scenic.png',
      'facility': '/assets/icons/markers/facility.png',
      'entrance': '/assets/icons/markers/entrance.png',
      'food': '/assets/icons/markers/food.png'
    };
    
    const markers = this.data.spots.map(spot => {
      return {
        id: spot.id,
        latitude: spot.latitude,
        longitude: spot.longitude,
        title: spot.name,
        iconPath: spot.iconPath || defaultIcons[spot.type] || '/assets/icons/markers/default.png',
        width: 30,
        height: 30,
        callout: {
          content: spot.name,
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'BYCLICK'
        },
        // 添加自定义气泡样式
        customCallout: {
          anchorY: 0,
          anchorX: 0,
          display: 'BYCLICK'
        },
        // 添加标签样式
        label: {
          content: spot.name,
          color: '#333333',
          fontSize: 12,
          anchorX: -15,
          anchorY: -35,
          borderWidth: 1,
          borderColor: '#ffffff',
          borderRadius: 5,
          bgColor: '#ffffff',
          padding: 5,
          textAlign: 'center'
        }
      };
    });
    
    this.setData({ markers });
  },

  // 根据筛选类型更新显示的标记点
  filterMarkers: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ activeSpotsFilter: type });
    
    let markers;
    if (type === 'all') {
      markers = this.data.spots;
    } else {
      markers = this.data.spots.filter(spot => spot.type === type);
    }
    
    this.setData({
      markers: markers.map(spot => ({
        id: spot.id,
        latitude: spot.latitude,
        longitude: spot.longitude,
        title: spot.name,
        iconPath: spot.iconPath || '/assets/icons/home.png',
        width: 30,
        height: 30,
        callout: {
          content: spot.name,
          color: '#000000',
          fontSize: 12,
          borderRadius: 4,
          bgColor: '#ffffff',
          padding: 5,
          display: 'BYCLICK'
        }
      }))
    });
  },

  // 获取用户当前位置
  getUserLocation: function() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        
        // 向标记点数组添加用户当前位置
        const markers = this.data.markers;
        markers.push({
          id: 999, // 用一个特殊ID表示用户位置
          latitude,
          longitude,
          iconPath: '/assets/icons/user_location.png',
          width: 30,
          height: 30,
          zIndex: 99
        });
        
        this.setData({
          latitude,
          longitude,
          markers,
          currentLocation: { latitude, longitude }
        });
        
        // 如果已有选中的景点，计算与当前位置的距离
        if (this.data.selectedSpot) {
          this.calculateSpotDistance(this.data.selectedSpot);
        }
      },
      fail: (error) => {
        console.error('获取位置失败', error);
        wx.showToast({
          title: '无法获取您的位置',
          icon: 'none'
        });
      }
    });
  },

  // 计算景点与用户当前位置的距离
  calculateSpotDistance: function(spot) {
    if (!this.data.currentLocation) return;
    
    const userLat = this.data.currentLocation.latitude;
    const userLng = this.data.currentLocation.longitude;
    const spotLat = spot.latitude;
    const spotLng = spot.longitude;
    
    // 使用工具函数计算距离
    const distance = util.calculateDistance(userLat, userLng, spotLat, spotLng);
    
    // 计算步行时间 (假设平均步行速度为1.2m/s)
    const walkingSpeed = 1.2; // 米/秒
    const walkingSeconds = Math.round(distance / walkingSpeed);
    
    // 格式化步行时间
    let walkingTimeText = '';
    if (walkingSeconds < 60) {
      walkingTimeText = walkingSeconds + '秒';
    } else if (walkingSeconds < 3600) {
      walkingTimeText = Math.floor(walkingSeconds / 60) + '分钟';
    } else {
      const hours = Math.floor(walkingSeconds / 3600);
      const minutes = Math.floor((walkingSeconds % 3600) / 60);
      walkingTimeText = hours + '小时' + (minutes > 0 ? minutes + '分钟' : '');
    }
    
    // 更新当前选中景点的距离信息
    spot.distance = distance;
    spot.distanceText = util.formatDistance(distance);
    spot.walkingTime = walkingTimeText;
    
    this.setData({
      selectedSpot: spot
    });
    
    return distance;
  },

  // 展示路线
  showRoute: function(routeId) {
    const route = this.data.routes.find(r => r.id === routeId);
    if (!route) return;
    
    this.setData({
      activeRouteId: routeId,
      polyline: [{
        points: route.points,
        color: route.color || '#FF4500',
        width: route.width || 4,
        dottedLine: false,
        arrowLine: true
      }]
    });
  },

  // 隐藏路线
  hideRoute: function() {
    this.setData({
      activeRouteId: 0,
      polyline: []
    });
  },

  // 标记点点击事件
  markerTap: function(e) {
    const markerId = e.markerId;
    if (markerId === 999) return; // 忽略用户位置标记
    
    this.showSpotDetail(markerId);
  },

  // 显示景点详情
  showSpotDetail: function(spotId) {
    const spot = this.data.spots.find(s => s.id === spotId);
    if (!spot) return;
    
    // 如果有当前位置，计算距离
    if (this.data.currentLocation) {
      this.calculateSpotDistance(spot);
    }
    
    this.setData({
      selectedSpot: spot,
      showInfoPanel: true,
      latitude: spot.latitude,
      longitude: spot.longitude
    });
  },

  // 关闭景点详情面板
  closeInfoPanel: function() {
    this.setData({
      showInfoPanel: false,
      selectedSpot: null
    });
  },

  // 导航到当前位置
  moveToLocation: function() {
    if (this.data.currentLocation) {
      this.mapCtx.moveToLocation();
    } else {
      this.getUserLocation();
    }
  },

  // 导航到景点页面
  navigateToSpotDetail: function() {
    if (!this.data.selectedSpot) return;
    
    wx.navigateTo({
      url: `/pages/guide/spot/spot?id=${this.data.selectedSpot.id}`
    });
  },

  // 导航到景点位置
  navigateToSpot: function() {
    if (!this.data.selectedSpot) return;
    
    const spot = this.data.selectedSpot;
    
    // 如果有当前位置，规划路线
    if (this.data.currentLocation) {
      // 规划路线
      this.planRoute(
        this.data.currentLocation,
        {
          latitude: spot.latitude,
          longitude: spot.longitude
        },
        this.data.currentRouteType
      );
    } else {
      // 直接打开微信内置导航
      wx.openLocation({
        latitude: spot.latitude,
        longitude: spot.longitude,
        name: spot.name,
        address: spot.type === 'scenery' ? '景点' :
                spot.type === 'facility' ? '设施' :
                spot.type === 'entrance' ? '出入口' :
                spot.type === 'food' ? '餐饮' : '景区位置',
        scale: 18
      });
    }
  },

  // 获取地图控件配置
  getMapControls: function(systemInfo) {
    const controls = [
      {
        id: 1,
        position: {
          left: 10,
          top: systemInfo.windowHeight - 100,
          width: 40,
          height: 40
        },
        iconPath: '/assets/icons/location.png',
        clickable: true
      }
    ];
    
    return controls;
  },

  // 控件点击事件
  controlTap: function(e) {
    const controlId = e.controlId;
    if (controlId === 1) {
      this.moveToLocation();
    }
  },

  // 切换到全屏地图
  toggleFullMap: function() {
    // 根据实际需求实现全屏切换逻辑
  },

  // 页面显示时初始化地图上下文
  onShow: function() {
    // 初始化微信地图上下文
    this.initMap();
  },

  // 页面卸载
  onUnload: function() {
    // 清理资源
  },

  // 地图加载完成回调 (map组件的bindupdated事件)
  onMapLoaded: function(e) {
    console.log('地图加载事件', e);
    
    // 检查地图是否加载成功
    if (e && e.detail && e.detail.errMsg) {
      if (e.detail.errMsg.indexOf('fail') !== -1) {
        console.error('地图加载失败', e.detail.errMsg);
        interaction.showError('地图加载失败: ' + e.detail.errMsg);
        
        // 尝试重新初始化地图
        setTimeout(() => {
          this.initMap();
        }, 1000);
        return;
      }
    }
    
    // 地图加载成功
    console.log('地图加载完成');
    interaction.showSuccess('地图加载完成');
  },
  
  // 初始化地图
  initMap: function() {
    console.log('初始化地图...');
    
    // 确保使用正确的Key
    this.setData({
      subkey: "6WNBZ-5IUK3-64A3K-RTYQS-CVYR2-R4FOQ"
    });
    
    this.mapCtx = wx.createMapContext('guideMap', this);
    
    if (!this.mapCtx) {
      console.log('地图上下文创建失败，请检查地图ID是否正确');
    }
  },
  
  // 地图区域改变事件
  onMapRegionChange: function(e) {
    // 区域改变结束时触发
    if (e.type === 'end' && e.causedBy === 'drag') {
      console.log('地图区域已更改', e);
    }
  },
  
  // 点击POI点时触发
  onPoiTap: function(e) {
    console.log('点击了POI', e);
    // 可以获取POI信息并显示详情
    if (e.detail && e.detail.name) {
      interaction.showToast(`点击了${e.detail.name}`);
    }
  },
  
  // 地图气泡点击事件
  onCalloutTap: function(e) {
    const markerId = e.detail.markerId;
    this.showSpotDetail(markerId);
  },
  
  // 地图标签点击事件
  onLabelTap: function(e) {
    const markerId = e.detail.markerId;
    this.showSpotDetail(markerId);
  },

  // 切换路线类型
  switchRouteType: function(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentRouteType: type
    });
    
    // 如果有选中景点，重新规划路线
    if (this.data.selectedSpot && this.data.currentLocation) {
      this.planRoute(this.data.currentLocation, {
        latitude: this.data.selectedSpot.latitude,
        longitude: this.data.selectedSpot.longitude
      }, type);
    }
  },
  
  // 规划路线
  planRoute: function(from, to, mode = 'walking') {
    // from, to: {latitude, longitude}
    // mode: 出行方式: walking(步行)/driving(驾车)/transit(公交)/riding(骑行)
    if (!from || !to) {
      interaction.showToast('起点或终点不能为空');
      return;
    }
    
    interaction.showLoading('路线规划中...');
    
    // 清除旧路线
    this.setData({
      polyline: []
    });
    
    // 使用微信小程序提供的接口规划路线
    let routeFunc;
    switch (mode) {
      case 'driving':
        routeFunc = wx.getDrivingRoute;
        break;
      case 'transit':
        routeFunc = wx.getTransitRoute;
        break;
      case 'riding':
        routeFunc = wx.getRidingRoute;
        break;
      case 'walking':
      default:
        routeFunc = wx.getWalkingRoute;
        break;
    }
    
    if (!routeFunc) {
      // 如果不支持某种出行方式，则使用步行
      routeFunc = wx.getWalkingRoute;
    }
    
    // 定义路线颜色
    const routeColors = {
      'walking': '#1AAD19',
      'driving': '#FF6B6B',
      'transit': '#4285F4',
      'riding': '#FF9800'
    };
    
    // 由于微信小程序的接口限制，这里模拟路线规划
    // 实际项目中应使用腾讯位置服务规划路线
    // 这里为简化处理，直接连接起点和终点
    const points = [
      { latitude: from.latitude, longitude: from.longitude },
      { latitude: (from.latitude + to.latitude) / 2, longitude: (from.longitude + to.longitude) / 2 },
      { latitude: to.latitude, longitude: to.longitude }
    ];
    
    // 计算距离
    const distance = util.calculateDistance(
      from.latitude, from.longitude,
      to.latitude, to.longitude
    );
    
    // 计算时间（不同交通方式有不同速度）
    let speed; // 单位：米/秒
    switch (mode) {
      case 'driving':
        speed = 8.5; // 约30km/h
        break;
      case 'transit':
        speed = 5.5; // 约20km/h，考虑等待时间
        break;
      case 'riding':
        speed = 3.0; // 约10km/h
        break;
      case 'walking':
      default:
        speed = 1.2; // 约4km/h
        break;
    }
    
    const duration = Math.round(distance / speed);
    
    // 显示路线
    setTimeout(() => {
      interaction.hideLoading();
      
      this.setData({
        polyline: [{
          points: points,
          color: routeColors[mode] || '#1AAD19',
          width: 4,
          dottedLine: false,
          arrowLine: true
        }]
      });
      
      // 封装路线信息
      const route = {
        distance: distance,
        duration: duration,
        mode: mode
      };
      
      // 触发路线规划完成事件
      this.onRoutePlanned({ detail: { route: route } });
    }, 1000);
  },
  
  // 路线规划完成回调
  onRoutePlanned: function(e) {
    const route = e.detail.route;
    
    // 格式化距离和时间
    let distanceText, durationText;
    
    if (route.distance < 1000) {
      distanceText = `${route.distance}米`;
    } else {
      distanceText = `${(route.distance / 1000).toFixed(1)}公里`;
    }
    
    if (route.duration < 60) {
      durationText = `${route.duration}秒`;
    } else if (route.duration < 3600) {
      durationText = `${Math.floor(route.duration / 60)}分钟`;
    } else {
      const hours = Math.floor(route.duration / 3600);
      const minutes = Math.floor((route.duration % 3600) / 60);
      durationText = `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`;
    }
    
    // 提示规划结果
    interaction.showToast(`路线规划成功，距离${distanceText}，预计${durationText}`);
  },
  
  // 位置变化回调
  onLocationChanged: function(e) {
    const { latitude, longitude } = e.detail;
    this.setData({
      currentLocation: { latitude, longitude }
    });
    
    // 如果已有选中的景点，重新计算距离
    if (this.data.selectedSpot) {
      this.calculateSpotDistance(this.data.selectedSpot);
    }
  },

  // 切换交通状况显示
  toggleTraffic: function() {
    if (!this.mapCtx) return;
    
    const newStatus = !this.data.showTraffic;
    this.setData({
      showTraffic: newStatus
    });
    
    this.mapCtx.toggleTraffic();
    
    wx.showToast({
      title: newStatus ? '已显示交通状况' : '已隐藏交通状况',
      icon: 'none'
    });
  },
  
  // 切换室内地图显示
  toggleIndoorMap: function() {
    if (!this.mapCtx) return;
    
    const newStatus = !this.data.showIndoorMap;
    this.setData({
      showIndoorMap: newStatus
    });
    
    this.mapCtx.toggleIndoorMap();
    
    wx.showToast({
      title: newStatus ? '已切换到室内地图' : '已切换到室外地图',
      icon: 'none'
    });
  },
  
  // 搜索周边兴趣点
  searchNearby: function(e) {
    const type = e.currentTarget.dataset.type;
    if (!type || !this.data.currentLocation) return;
    
    interaction.showLoading('搜索周边设施...');
    
    // 定义搜索关键词
    const keywords = {
      'toilet': '厕所',
      'food': '餐饮',
      'rest': '休息区',
      'parking': '停车场',
      'medical': '医疗'
    };
    
    const keyword = keywords[type] || '设施';
    
    // 模拟POI搜索
    // 在实际项目中，应调用腾讯位置服务的周边搜索接口
    setTimeout(() => {
      interaction.hideLoading();
      
      // 模拟搜索结果
      const pois = [
        {
          id: `poi_${type}_1`,
          name: `${keyword}1`,
          type: type,
          distance: 200,
          latitude: this.data.currentLocation.latitude + 0.001,
          longitude: this.data.currentLocation.longitude + 0.001
        },
        {
          id: `poi_${type}_2`,
          name: `${keyword}2`,
          type: type,
          distance: 350,
          latitude: this.data.currentLocation.latitude - 0.001,
          longitude: this.data.currentLocation.longitude - 0.001
        },
        {
          id: `poi_${type}_3`,
          name: `${keyword}3`,
          type: type,
          distance: 500,
          latitude: this.data.currentLocation.latitude + 0.002,
          longitude: this.data.currentLocation.longitude - 0.002
        }
      ];
      
      // 显示POI标记
      const poiMarkers = pois.map((poi, index) => {
        return {
          id: 1000 + index, // 使用1000以上的ID避免与景点ID冲突
          latitude: poi.latitude,
          longitude: poi.longitude,
          title: poi.name,
          iconPath: `/assets/icons/markers/${type}.png`,
          width: 30,
          height: 30,
          callout: {
            content: poi.name,
            color: '#000000',
            fontSize: 12,
            borderRadius: 4,
            bgColor: '#ffffff',
            padding: 5,
            display: 'BYCLICK'
          }
        };
      });
      
      // 更新标记点，保留用户位置标记
      const userMarker = this.data.markers.find(m => m.id === 999);
      const spotMarkers = this.data.spots.map(spot => {
        return {
          id: spot.id,
          latitude: spot.latitude,
          longitude: spot.longitude,
          title: spot.name,
          iconPath: spot.iconPath,
          width: 30,
          height: 30,
          callout: {
            content: spot.name,
            color: '#000000',
            fontSize: 12,
            borderRadius: 4,
            bgColor: '#ffffff',
            padding: 5,
            display: 'BYCLICK'
          }
        };
      });
      
      // 合并标记点
      const allMarkers = [...spotMarkers];
      if (userMarker) allMarkers.push(userMarker);
      allMarkers.push(...poiMarkers);
      
      this.setData({
        markers: allMarkers,
        nearbyPOIs: pois
      });
      
      interaction.showSuccess(`找到${pois.length}个${keyword}`);
    }, 1000);
  },

  // 地图点击事件
  mapTap: function() {
    console.log('地图点击');
    // 关闭景点信息面板
    this.closeInfoPanel();
  }
}); 