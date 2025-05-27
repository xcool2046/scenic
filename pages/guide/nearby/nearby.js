// nearby.js
const interaction = require('../../../utils/interaction');
const performance = require('../../../utils/performance');

Page({
  data: {
    type: '',
    title: '附近设施',
    facilities: [],
    loading: true,
    location: null
  },
  
  onLoad(options) {
    const { type, title } = options;
    
    // 记录页面性能
    performance.performanceMonitor.recordPagePerformance('nearby');
    
    // 设置页面标题
    if (title) {
      this.setData({ title });
      wx.setNavigationBarTitle({ title });
    }
    
    // 设置设施类型
    if (type) {
      this.setData({ type });
    }
    
    // 获取位置并加载设施
    this.getLocation();
  },
  
  onShow() {
    // 记录页面显示性能
    performance.performanceMonitor.recordPageShow('nearby');
  },
  
  getLocation() {
    // 显示加载中
    interaction.showLoading('定位中');
    
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 保存位置信息
        this.setData({ 
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });
        
        // 加载附近设施
        this.loadFacilities();
      },
      fail: (err) => {
        console.error('获取位置失败', err);
        interaction.hideLoading();
        
        // 加载默认设施数据
        this.loadDefaultFacilities();
        
        // 提示用户
        interaction.showToast('获取位置失败，显示默认数据');
      }
    });
  },
  
  loadFacilities() {
    // 根据设施类型获取不同数据
    const { type, location } = this.data;
    
    if (!location) {
      this.loadDefaultFacilities();
      return;
    }
    
    // 显示加载中
    interaction.showLoading('加载设施');
    
    // 模拟延时加载
    setTimeout(() => {
      // 准备不同类型的设施数据
      let facilities = [];
      
      switch(type) {
        case 'toilet':
          facilities = this.getMockToilets();
          break;
        case 'food':
          facilities = this.getMockFoodOptions();
          break;
        case 'rest':
          facilities = this.getMockRestAreas();
          break;
        case 'medical':
          facilities = this.getMockMedicalPoints();
          break;
        default:
          facilities = this.getMockAllFacilities();
      }
      
      // 更新数据
      this.setData({
        facilities,
        loading: false
      });
      
      interaction.hideLoading();
    }, 1000);
  },
  
  loadDefaultFacilities() {
    const { type } = this.data;
    
    // 准备默认数据
    let facilities = [];
    
    switch(type) {
      case 'toilet':
        facilities = this.getMockToilets();
        break;
      case 'food':
        facilities = this.getMockFoodOptions();
        break;
      case 'rest':
        facilities = this.getMockRestAreas();
        break;
      case 'medical':
        facilities = this.getMockMedicalPoints();
        break;
      default:
        facilities = this.getMockAllFacilities();
    }
    
    // 更新数据
    this.setData({
      facilities,
      loading: false
    });
  },
  
  // 获取厕所模拟数据
  getMockToilets() {
    return [
      { id: 1, name: '游客中心卫生间', distance: 120, icon: '/assets/icons/toilet.png', open: true },
      { id: 2, name: '中心广场卫生间', distance: 250, icon: '/assets/icons/toilet.png', open: true },
      { id: 3, name: '东区卫生间', distance: 480, icon: '/assets/icons/toilet.png', open: true },
      { id: 4, name: '西区卫生间', distance: 650, icon: '/assets/icons/toilet.png', open: false }
    ];
  },
  
  // 获取餐饮模拟数据
  getMockFoodOptions() {
    return [
      { id: 1, name: '游客中心餐厅', distance: 150, icon: '/assets/icons/restaurant.png', rating: 4.5 },
      { id: 2, name: '景区咖啡厅', distance: 200, icon: '/assets/icons/cafe.png', rating: 4.3 },
      { id: 3, name: '东区小吃摊', distance: 350, icon: '/assets/icons/food_stall.png', rating: 4.0 },
      { id: 4, name: '中心广场餐厅', distance: 500, icon: '/assets/icons/restaurant.png', rating: 4.2 }
    ];
  },
  
  // 获取休息区模拟数据
  getMockRestAreas() {
    return [
      { id: 1, name: '中心休息区', distance: 180, icon: '/assets/icons/rest.png', seats: 20 },
      { id: 2, name: '湖边休息区', distance: 320, icon: '/assets/icons/rest.png', seats: 15 },
      { id: 3, name: '东区凉亭', distance: 450, icon: '/assets/icons/pavilion.png', seats: 8 }
    ];
  },
  
  // 获取医疗点模拟数据
  getMockMedicalPoints() {
    return [
      { id: 1, name: '游客中心医疗站', distance: 120, icon: '/assets/icons/medical.png', level: '主要' },
      { id: 2, name: '东区急救点', distance: 550, icon: '/assets/icons/first_aid.png', level: '辅助' }
    ];
  },
  
  // 获取所有设施
  getMockAllFacilities() {
    return [
      ...this.getMockToilets().slice(0, 2),
      ...this.getMockFoodOptions().slice(0, 2),
      ...this.getMockRestAreas().slice(0, 1),
      ...this.getMockMedicalPoints().slice(0, 1)
    ];
  },
  
  // 查看设施详情
  viewFacilityDetail(e) {
    const id = e.currentTarget.dataset.id;
    const facility = this.data.facilities.find(item => item.id === id);
    
    if (!facility) return;
    
    // 打开设施详情
    wx.showModal({
      title: facility.name,
      content: `距离您: ${facility.distance}米${facility.rating ? '\n评分: ' + facility.rating + '分' : ''}${facility.seats ? '\n可用座位: ' + facility.seats : ''}${facility.level ? '\n级别: ' + facility.level : ''}${facility.open !== undefined ? '\n状态: ' + (facility.open ? '开放' : '维护中') : ''}`,
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 导航到设施
  navigateToFacility(e) {
    const id = e.currentTarget.dataset.id;
    const facility = this.data.facilities.find(item => item.id === id);
    
    if (!facility) return;
    
    interaction.showToast('导航功能开发中');
  },
  
  onShareAppMessage() {
    return {
      title: this.data.title + ' - 智慧景区',
      path: `/pages/guide/nearby/nearby?type=${this.data.type}&title=${this.data.title}`
    };
  }
}) 