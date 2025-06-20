// components/amap/amap.js
const amapKey = require('../../utils/mapKey').AMAP_KEY;

Component({
  properties: {
    // 地图中心点经纬度
    latitude: {
      type: Number,
      value: 39.908823
    },
    longitude: {
      type: Number,
      value: 116.397470
    },
    // 缩放级别
    scale: {
      type: Number,
      value: 16
    },
    // 标记点
    markers: {
      type: Array,
      value: []
    },
    // 路线
    polyline: {
      type: Array,
      value: []
    },
    // 显示用户位置
    showLocation: {
      type: Boolean,
      value: true
    },
    // 高度设置
    height: {
      type: String,
      value: '100%'
    },
    // 是否使用web-view加载高德H5地图
    useWebView: {
      type: Boolean,
      value: false
    }
  },
  
  data: {
    mapId: 'amapContainer',
    mapLoaded: false,
    amapInstance: null,
    markerInstances: [],
    amapUrl: '',   // web-view加载的地图URL
    sdkLoaded: false,
    canvasContext: null,
    useCanvas: false,  // 是否使用canvas绘制地图
    userLocationMarker: null, // 用户位置标记
    clusterMarkers: false,  // 是否聚合标记点
    mapRotation: 0,  // 地图旋转角度
    isIndoor: false, // 是否处于室内地图
    trafficVisible: false, // 是否显示交通状况
    weatherVisible: false, // 是否显示天气图层
    pathDistance: 0,  // 路径距离（米）
    pathDuration: 0,  // 路径时长（秒）
    // 室内地图建筑物数据
    indoorBuildingInfo: null
  },
  
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.initMap();
      
      // 如果使用web-view加载高德地图H5，构建地图URL
      if (this.properties.useWebView) {
        this.buildAmapUrl();
      }
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      if (this.data.amapInstance) {
        this.data.amapInstance.destroy();
      }
    }
  },
  
  methods: {
    // 初始化地图
    initMap() {
      // 直接设置地图加载完成状态
      this.setData({
        mapLoaded: true
      });
      
      // 尝试获取当前位置
      if (this.properties.showLocation) {
        wx.getLocation({
          type: 'gcj02',
          success: (res) => {
            this.setData({
              latitude: res.latitude,
              longitude: res.longitude
            });
            // 更新标记点
            this.updateMarkers();
          },
          fail: (err) => {
            console.error('获取位置失败', err);
          }
        });
      } else {
        // 更新标记点
        this.updateMarkers();
      }
      
      // 触发地图加载完成事件
      this.triggerEvent('mapLoaded', {
        latitude: this.properties.latitude,
        longitude: this.properties.longitude
      });
    },
    
    // 构建高德地图H5 URL
    buildAmapUrl() {
      // 高德地图URL构建
      const baseUrl = 'https://m.amap.com/navi/';
      const params = {
        key: amapKey,
        center: `${this.properties.longitude},${this.properties.latitude}`,
        zoom: this.properties.scale,
        traffic: this.data.trafficVisible ? 1 : 0,
        userLocation: this.properties.showLocation ? 1 : 0
      };
      
      let url = baseUrl + '?';
      for (const key in params) {
        url += `${key}=${params[key]}&`;
      }
      
      // 添加标记点
      if (this.properties.markers.length > 0) {
        const markerParams = this.properties.markers.map(marker => {
          return `${marker.longitude},${marker.latitude},${encodeURIComponent(marker.title || '')}`;
        }).join('|');
        url += `markers=${markerParams}&`;
      }
      
      // 添加路线
      if (this.properties.polyline.length > 0) {
        const polylineParams = this.properties.polyline.map(line => {
          const points = line.points.map(point => `${point.longitude},${point.latitude}`).join(';');
          return `${points},${line.color.replace('#', '')},${line.width}`;
        }).join('|');
        url += `polylines=${polylineParams}&`;
      }
      
      // 设置URL
      this.setData({
        amapUrl: url,
        mapLoaded: true
      });
      
      // 触发地图加载完成事件
      this.triggerEvent('mapLoaded');
    },
    
    // 创建地图上下文
    createMapContext(width, height) {
      // 如果使用web-view，已在buildAmapUrl处理
      if (this.properties.useWebView) {
        return;
      }
      
      if (this.data.useCanvas) {
        // 使用canvas绘制地图时的实现
        this.initCanvasMap(width, height);
      } else {
        // 模拟地图实现
        this.initSimulateMap();
      }
    },
    
    // 使用Canvas初始化地图（实际项目中实现）
    initCanvasMap(width, height) {
      // 在正式项目中，这里会实现canvas绘制高德地图
      // 1. 创建canvas上下文
      // 2. 加载高德地图SDK
      // 3. 绘制地图底图
      // 4. 添加标记、路线等图层
      
      this.setData({
        mapLoaded: true,
        canvasContext: {
          width,
          height
        }
      });
      
      // 添加标记点
      this.updateMarkers();
      
      // 添加路线
      this.updatePolyline();
      
      // 模拟触发地图加载完成事件
      setTimeout(() => {
        this.triggerEvent('mapLoaded');
      }, 500);
    },
    
    // 初始化模拟地图
    initSimulateMap() {
      // 由于无法直接在小程序中集成完整高德地图
      // 这里使用模拟方式，仅展示基本效果
      
      this.setData({
        mapLoaded: true
      });
      
      // 添加标记点
      this.updateMarkers();
      
      // 添加路线
      this.updatePolyline();
      
      // 触发地图加载完成事件
      this.triggerEvent('mapLoaded');
    },
    
    // 更新标记点
    updateMarkers() {
      // 实现标记点更新逻辑
      
      // 触发标记点更新事件
      this.triggerEvent('markersUpdate', {
        markers: this.properties.markers
      });
    },
    
    // 更新路线
    updatePolyline() {
      // 实现路线更新逻辑
      
      // 计算路线距离和时间
      if (this.properties.polyline.length > 0 && this.properties.polyline[0].points) {
        const points = this.properties.polyline[0].points;
        
        // 计算路径总距离
        let distance = 0;
        for (let i = 1; i < points.length; i++) {
          const p1 = points[i-1];
          const p2 = points[i];
          
          // 使用工具函数计算两点间距离（实际项目中可使用高德API计算）
          const segmentDistance = this.calculateDistance(
            p1.latitude, p1.longitude,
            p2.latitude, p2.longitude
          );
          
          distance += segmentDistance;
        }
        
        // 估算行走时间（假设步行速度为1.2m/s）
        const duration = Math.round(distance / 1.2);
        
        this.setData({
          pathDistance: distance,
          pathDuration: duration
        });
      }
      
      // 触发路线更新事件
      this.triggerEvent('polylineUpdate', {
        polyline: this.properties.polyline,
        distance: this.data.pathDistance,
        duration: this.data.pathDuration
      });
    },
    
    // 计算两点间距离
    calculateDistance(lat1, lng1, lat2, lng2) {
      const EARTH_RADIUS = 6378.137; // 地球半径，单位：千米
      
      // 角度转弧度
      const radLat1 = lat1 * Math.PI / 180.0;
      const radLat2 = lat2 * Math.PI / 180.0;
      const radLng1 = lng1 * Math.PI / 180.0;
      const radLng2 = lng2 * Math.PI / 180.0;
      
      // 计算
      const a = radLat1 - radLat2;
      const b = radLng1 - radLng2;
      let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2), 2) + 
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b/2), 2)));
      s = s * EARTH_RADIUS;
      
      // 返回结果，单位：米
      return Math.round(s * 1000);
    },
    
    // 标记点点击事件
    onMarkerTap(e) {
      // 触发标记点点击事件
      const markerId = e.currentTarget.dataset.markerId;
      this.triggerEvent('markerTap', {
        markerId: markerId
      });
    },
    
    // 地图点击事件
    onMapTap() {
      // 触发地图点击事件
      this.triggerEvent('mapTap');
    },
    
    // 移动到当前位置
    moveToLocation() {
      if (this.properties.useWebView) {
        // web-view方式无法直接控制地图
        // 可以通过重新构建URL实现
        this.buildAmapUrl();
        return;
      }
      
      // 模拟移动到当前位置
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          // 设置中心点为用户当前位置
          this.setData({
            'latitude': res.latitude,
            'longitude': res.longitude
          });
          
          // 触发位置更新事件
          this.triggerEvent('locationChanged', {
            latitude: res.latitude,
            longitude: res.longitude
          });
        },
        fail: () => {
          wx.showToast({
            title: '获取位置失败',
            icon: 'none'
          });
        }
      });
    },
    
    // 切换交通状况图层
    toggleTraffic() {
      this.setData({
        trafficVisible: !this.data.trafficVisible
      });
      
      // 在实际项目中，这里会调用高德地图API切换交通状况图层
      
      // 如果使用web-view方式，需要重新构建URL
      if (this.properties.useWebView) {
        this.buildAmapUrl();
      }
    },
    
    // 切换室内地图
    toggleIndoorMap() {
      this.setData({
        isIndoor: !this.data.isIndoor
      });
      
      // 在实际项目中，这里会调用高德地图API切换室内地图
    },
    
    // 获取周边兴趣点
    searchNearbyPOI(types, radius = 1000) {
      // 在实际项目中，这里会调用高德地图API搜索周边兴趣点
      // 例如搜索周边的餐厅、厕所、停车场等
      
      // 模拟返回结果
      setTimeout(() => {
        const pois = [
          {
            id: 'poi_1',
            name: '示例兴趣点1',
            type: 'restaurant',
            distance: 200,
            latitude: this.properties.latitude + 0.001,
            longitude: this.properties.longitude + 0.001
          },
          {
            id: 'poi_2',
            name: '示例兴趣点2',
            type: 'toilet',
            distance: 300,
            latitude: this.properties.latitude - 0.001,
            longitude: this.properties.longitude - 0.001
          }
        ];
        
        // 触发搜索结果事件
        this.triggerEvent('searchResult', {
          pois: pois
        });
      }, 500);
    },
    
    // 规划路线
    planRoute(from, to, mode = 'walking') {
      // from, to: {latitude, longitude}
      // mode: 出行方式，walking步行/driving驾车/transit公交/riding骑行
      
      // 在实际项目中，这里会调用高德地图API规划路线
      
      // 模拟规划结果
      setTimeout(() => {
        // 规划一条简单路线
        const route = {
          distance: 1200, // 距离，单位米
          duration: 900,  // 时间，单位秒
          points: [
            { latitude: from.latitude, longitude: from.longitude },
            { latitude: (from.latitude + to.latitude) / 2, longitude: (from.longitude + to.longitude) / 2 },
            { latitude: to.latitude, longitude: to.longitude }
          ]
        };
        
        // 更新路线显示
        this.setData({
          'polyline[0].points': route.points,
          pathDistance: route.distance,
          pathDuration: route.duration
        });
        
        // 触发路线规划完成事件
        this.triggerEvent('routePlanned', {
          route: route
        });
      }, 800);
    }
  },
  
  observers: {
    'markers': function(newMarkers) {
      // 当标记点数据变化时，更新地图上的标记
      if (this.data.mapLoaded) {
        this.updateMarkers();
      }
    },
    'polyline': function(newPolyline) {
      // 当路线数据变化时，更新地图上的路线
      if (this.data.mapLoaded) {
        this.updatePolyline();
      }
    },
    'latitude, longitude': function(newLat, newLng) {
      // 当中心点变化时，更新地图中心
      if (this.data.mapLoaded && this.properties.useWebView) {
        // 如果使用web-view方式，需要重新构建URL
        this.buildAmapUrl();
      }
    },
    'scale': function(newScale) {
      // 当缩放级别变化时，更新地图缩放
      if (this.data.mapLoaded && this.properties.useWebView) {
        // 如果使用web-view方式，需要重新构建URL
        this.buildAmapUrl();
      }
    }
  }
}); 