// packages/realtime/pages/realtime-info/realtime-info.js
const api = require('../../../../utils/api');
const cache = require('../../../../utils/cache');
const performance = require('../../../../utils/performance');

Page({
  data: {
    pageTitle: '实时信息',
    // 人流量信息
    crowdLevel: '一般',
    crowdStatus: 'normal',
    crowdPercentage: 45,
    crowdColor: '#1AAD19',
    crowdTips: '当前景区客流量适中，游览体验良好',
    
    // 景点等待时间
    spots: [
      { id: 1, name: '中心景点', waitTime: 15, waitLevel: 'normal' },
      { id: 2, name: '松月湖', waitTime: 5, waitLevel: 'low' },
      { id: 3, name: '飞瀑溪', waitTime: 30, waitLevel: 'high' }
    ],
    
    // 天气信息
    temperature: '26°C',
    weatherDesc: '晴朗',
    humidity: 65,
    windPower: '3级'
  },
  
  onLoad(options) {
    console.log('页面加载: realtime-info', options);
    // 记录页面性能
    performance.performanceMonitor.recordPagePerformance('realtime');
    
    // 加载数据
    this.loadRealtimeData();
  },
  
  // 加载实时数据
  loadRealtimeData() {
    wx.showLoading({ title: '加载中' });
    
    // 获取实时数据
    Promise.all([
      this.getCrowdData(),
      this.getSpotWaitData(),
      this.getWeatherData()
    ]).then(() => {
      wx.hideLoading();
    }).catch(err => {
      console.error('加载实时数据失败', err);
      wx.hideLoading();
      
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
    });
  },
  
  // 获取人流量数据
  getCrowdData() {
    return api.getCrowdInfo().then(res => {
      if (res.code === 200) {
        // 人流量级别和对应状态
        let status = 'normal';
        let color = '#1AAD19';
        let tips = '当前景区客流量适中，游览体验良好';
        
        if (res.data.levelValue >= 4) {
          status = 'high';
          color = '#E64340';
          tips = '当前景区客流量较大，请合理安排游览路线，避开热门景点';
        } else if (res.data.levelValue <= 2) {
          status = 'low';
          color = '#1882DB';
          tips = '当前景区客流量较少，是游览的好时机';
        }
        
        this.setData({
          crowdLevel: res.data.level,
          crowdStatus: status,
          crowdPercentage: res.data.percentage,
          crowdColor: color,
          crowdTips: tips
        });
      }
    });
  },
  
  // 获取景点等待时间
  getSpotWaitData() {
    return api.getSpotsCongestInfo().then(res => {
      if (res.code === 200) {
        const spots = res.data.spots.map(spot => {
          let waitLevel = 'normal';
          
          if (spot.waitTime >= 30) {
            waitLevel = 'high';
          } else if (spot.waitTime <= 10) {
            waitLevel = 'low';
          }
          
          return {
            id: spot.id,
            name: spot.name,
            waitTime: spot.waitTime,
            waitLevel
          };
        });
        
        this.setData({ spots });
      }
    });
  },
  
  // 获取天气数据
  getWeatherData() {
    return api.getWeather().then(res => {
      if (res.code === '200') {
        this.setData({
          temperature: res.now.temp + '°C',
          weatherDesc: res.now.text,
          humidity: res.now.humidity,
          windPower: res.now.windScale + '级'
        });
      }
    });
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadRealtimeData().then(() => {
      wx.stopPullDownRefresh();
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    });
  }
})
