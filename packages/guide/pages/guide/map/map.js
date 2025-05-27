// packages/guide/pages/guide/map/map.js
Page({
  data: {
    pageTitle: '景区地图',
    scale: 14,
    markers: [],
    latitude: 39.915,
    longitude: 116.404
  },
  
  onLoad(options) {
    console.log('页面加载: map', options);
    this.loadMapMarkers();
  },
  
  // 加载地图标记点
  loadMapMarkers() {
    // 模拟数据，实际项目中可从服务器获取
    const markers = [
      {
        id: 1,
        latitude: 39.915,
        longitude: 116.404,
        name: '中心景点',
        iconPath: '/assets/icons/guide/marker.png',
        width: 30,
        height: 30
      },
      {
        id: 2,
        latitude: 39.918,
        longitude: 116.407,
        name: '休息区',
        iconPath: '/assets/icons/facilities/rest_icon.png',
        width: 30,
        height: 30
      },
      {
        id: 3,
        latitude: 39.912,
        longitude: 116.402,
        name: '卫生间',
        iconPath: '/assets/icons/facilities/toilet_icon.png',
        width: 30,
        height: 30
      }
    ];
    
    this.setData({ markers });
  },
  
  // 放大地图
  zoomIn() {
    let scale = this.data.scale;
    if (scale < 18) {
      this.setData({ scale: scale + 1 });
    }
  },
  
  // 缩小地图
  zoomOut() {
    let scale = this.data.scale;
    if (scale > 5) {
      this.setData({ scale: scale - 1 });
    }
  },
  
  // 定位到我的位置
  showMyLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'error'
        });
      }
    });
  },
  
  // 点击标记点
  markertap(e) {
    const markerId = e.markerId;
    const marker = this.data.markers.find(m => m.id === markerId);
    
    if (marker) {
      wx.showActionSheet({
        itemList: ['查看详情', '导航到这里'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 查看详情
            wx.showToast({
              title: `查看${marker.name}详情`,
              icon: 'none'
            });
          } else if (res.tapIndex === 1) {
            // 导航
            wx.openLocation({
              latitude: marker.latitude,
              longitude: marker.longitude,
              name: marker.name,
              scale: 18
            });
          }
        }
      });
    }
  }
})
