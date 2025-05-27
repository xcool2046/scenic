// map.js
const interaction = require('../../utils/interaction');
const api = require('../../utils/api');
const performance = require('../../utils/performance');

Page({
  data: {
    mapUrl: '/assets/images/map_preview.jpg',
    spots: [],
    loading: true,
    error: false
  },

  onLoad() {
    // 记录页面性能
    performance.performanceMonitor.recordPagePerformance('map');
    
    // 加载地图数据
    this.loadMapData();
  },
  
  onShow() {
    // 记录页面显示性能
    performance.performanceMonitor.recordPageShow('map');
  },
  
  loadMapData() {
    interaction.showLoading('加载中');
    
    // 获取景点数据
    setTimeout(() => {
      // 模拟数据
      const mockSpots = [
        { id: 1, name: '中心广场', x: 35, y: 40 },
        { id: 2, name: '瀑布景观', x: 65, y: 30 },
        { id: 3, name: '休息区', x: 45, y: 70 }
      ];
      
      this.setData({
        spots: mockSpots,
        loading: false
      });
      
      interaction.hideLoading();
    }, 800);
  },
  
  previewMap() {
    wx.previewImage({
      urls: [this.data.mapUrl],
      current: this.data.mapUrl,
      fail() {
        interaction.showToast('预览失败');
      }
    });
  },
  
  onSaveMap() {
    wx.showLoading({
      title: '保存中',
    });
    
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.saveMapToAlbum();
            },
            fail: () => {
              wx.hideLoading();
              interaction.showToast('保存失败，需要相册权限');
            }
          });
        } else {
          this.saveMapToAlbum();
        }
      }
    });
  },
  
  saveMapToAlbum() {
    wx.getImageInfo({
      src: this.data.mapUrl,
      success: (res) => {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: () => {
            wx.hideLoading();
            interaction.showSuccess('保存成功');
          },
          fail: () => {
            wx.hideLoading();
            interaction.showToast('保存失败');
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        interaction.showToast('获取图片信息失败');
      }
    });
  },
  
  onSpotTap(e) {
    const id = e.currentTarget.dataset.id;
    const spot = this.data.spots.find(s => s.id === id);
    
    if (spot) {
      wx.navigateTo({
        url: `/packages/guide/pages/guide/spot/spot?id=${id}&name=${spot.name}`,
        fail: () => {
          interaction.showToast('景点详情开发中');
        }
      });
    }
  },
  
  onShareAppMessage() {
    return {
      title: '景区地图 - 智慧景区',
      path: '/pages/map/map'
    };
  }
}) 