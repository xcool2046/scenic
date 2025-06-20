// pages/realtime-info/realtime-info.js
const api = require('../../utils/api');
const interaction = require('../../utils/interaction');
const config = require('../../utils/config');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    config,
    weatherData: {},
    weatherForecast: [],
    crowdInfo: {},
    spotsCongestInfo: [],
    // 页面加载状态
    loadingWeather: true,
    loadingCrowd: true,
    loadingSpots: true,
    refreshing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.refreshData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkDataNeedsRefresh();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData(true);
  },

  /**
   * 检查数据是否需要刷新
   * 如果上次刷新时间超过5分钟，则自动刷新
   */
  checkDataNeedsRefresh() {
    const lastUpdateTime = wx.getStorageSync('lastInfoUpdateTime');
    if (!lastUpdateTime) {
      this.refreshData();
      return;
    }

    const now = new Date().getTime();
    const diff = now - lastUpdateTime;
    
    // 如果超过5分钟，自动刷新
    if (diff > 5 * 60 * 1000) {
      this.refreshData();
    }
  },

  /**
   * 刷新所有数据
   */
  refreshData(showToast = false) {
    if (showToast) {
      interaction.showLoading('刷新数据中');
    }
    
    this.setData({
      refreshing: true,
      loadingWeather: true,
      loadingCrowd: true,
      loadingSpots: true
    });

    const location = '116.40,39.90'; // 默认位置，北京

    // 获取当前位置
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = `${res.longitude},${res.latitude}`;
        // 获取天气数据
        this.fetchWeatherData(location);
      },
      fail: () => {
        // 使用默认位置获取天气
        this.fetchWeatherData(location);
      }
    });

    // 获取人流量和景点拥堵数据
    this.fetchCrowdData();
    this.fetchSpotsCongestData();
    
    // 记录最后更新时间
    wx.setStorageSync('lastInfoUpdateTime', new Date().getTime());
  },

  /**
   * 获取天气数据
   */
  fetchWeatherData(location) {
    Promise.all([
      api.getWeather(location),
      api.getWeatherForecast(location)
    ]).then(([weatherRes, forecastRes]) => {
      if (weatherRes.code === '200') {
        this.setData({
          weatherData: weatherRes.now,
          loadingWeather: false
        });
      }
      
      if (forecastRes.code === '200') {
        this.setData({
          weatherForecast: forecastRes.daily,
          loadingWeather: false
        });
      }
    }).catch(err => {
      console.error('获取天气数据失败', err);
    }).finally(() => {
      this.setData({
        loadingWeather: false
      });
      this.checkAllDataLoaded();
    });
  },

  /**
   * 获取人流量数据
   */
  fetchCrowdData() {
    api.getCrowdInfo().then(res => {
      if (res.code === 200) {
        this.setData({
          crowdInfo: res.data,
          loadingCrowd: false
        });
      }
    }).catch(err => {
      console.error('获取人流量数据失败', err);
    }).finally(() => {
      this.setData({
        loadingCrowd: false
      });
      this.checkAllDataLoaded();
    });
  },

  /**
   * 获取景点拥堵数据
   */
  fetchSpotsCongestData() {
    api.getSpotsCongestInfo().then(res => {
      if (res.code === 200) {
        this.setData({
          spotsCongestInfo: res.data.spots,
          updateTime: res.data.timestamp,
          loadingSpots: false
        });
      }
    }).catch(err => {
      console.error('获取景点拥堵数据失败', err);
    }).finally(() => {
      this.setData({
        loadingSpots: false
      });
      this.checkAllDataLoaded();
    });
  },

  /**
   * 检查所有数据是否加载完成
   */
  checkAllDataLoaded() {
    if (!this.data.loadingWeather && !this.data.loadingCrowd && !this.data.loadingSpots) {
      this.setData({
        refreshing: false
      });
      
      wx.stopPullDownRefresh();
      interaction.hideLoading();
    }
  },

  /**
   * 点击景点事件
   */
  onSpotTap(e) {
    const spot = e.detail.spot;
    
    interaction.navigateTo(`/pages/guide/spot/spot?id=${spot.id}`);
  }
});