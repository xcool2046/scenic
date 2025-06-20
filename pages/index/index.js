// index.js
const config = require('../../utils/config');
const app = getApp();

// 交互工具函数
const interaction = {
  showToast: (title, icon = 'none') => {
    wx.showToast({ title, icon, duration: 2000 });
  },
  showSuccess: (title) => {
    wx.showToast({ title, icon: 'success', duration: 2000 });
  }
};

Page({
  data: {
    // 基础信息
    weatherInfo: {
      temperature: '23°C',
      weather: '晴朗',
      humidity: '--',
      windSpeed: '--'
    },
    crowdInfo: {
      level: '一般',
      levelValue: 2,
      percentage: 45,
      count: '--',
      trend: 'stable'
    },
    openStatus: {
      isOpen: true,
      time: '09:00-17:30'
    },
    
    // 活动信息
    activities: [
      {
        title: '【9:30】"探索自然"科普讲座',
        desc: '游客中心二楼，免费参与'
      },
      {
        title: '【14:00】民俗表演',
        desc: '中心广场，持票可观看'
      },
      {
        title: '公告：西区小路维修中',
        desc: '请游客绕行，预计明日恢复'
      }
    ],
    
    // 图标和图片配置
    icons: {
      ...config.ICONS,
      CDN_ICONS: config.CDN_ICONS
    },
    images: config.IMAGES,
    
    // 轮播图配置
    bannerList: [
      { 
        id: 1, 
        url: '/assets/images/banner.jpg', 
        title: '景悦达智慧服务', 
        linkUrl: '/pages/ticket/ticket'
      },
      { 
        id: 2, 
        url: '/assets/images/cards/map_card.jpg', 
        title: '智慧导览',
        linkUrl: '/pages/guide/guide'  
      },
      { 
        id: 3, 
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80', 
        title: '便民服务',
        linkUrl: '/pages/realtime-info/realtime-info'
      }
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 4000,
    duration: 800,
    circular: true,
    previousMargin: '20rpx',
    nextMargin: '20rpx',
    currentBannerIndex: 0,
    
    // UI配置
    uiConfig: {
      showActivities: true,
      showCrowdLevel: true,
      showWeather: true,
      showQuickServices: true,
      showFacilities: true
    },
    
    // 状态管理
    loadingTimeout: false,

    // 服务项配置（核心卡片+智慧服务）
    serviceCards: [
      {
        key: 'ticket',
        type: 'core',
        title: '电子门票',
        desc: '',
        icon: config.CDN_ICONS.TICKET,
        bg: config.IMAGES.CARDS.TICKET,
        alt: '电子门票',
        route: '/pages/ticket/ticket',
        dataType: 'ticket'
      },
      {
        key: 'map',
        type: 'core',
        title: '景区地图',
        desc: '',
        icon: config.CDN_ICONS.MAP,
        bg: config.IMAGES.CARDS.MAP,
        alt: '景区地图',
        route: '/pages/map/map',
        dataType: 'map'
      },
      // 智慧服务项
      {
        key: 'scan',
        type: 'smart',
        title: '扫码进码',
        desc: '二维码验票入园',
        icon: '/assets/icons/home/scan.png',
        alt: '扫码进码',
        route: '/pages/scan-verify/scan-verify',
        dataService: 'scan',
        main: true
      },
      {
        key: 'review',
        type: 'smart',
        title: '码上评价',
        desc: '服务评价反馈',
        icon: '/assets/icons/navigation/ticket_icon.png',
        alt: '码上评价',
        route: '/pages/review/review',
        dataService: 'review'
      },
      {
        key: 'coupon',
        type: 'smart',
        title: '码上惠客',
        desc: '优惠券与积分',
        icon: '/assets/icons/home/ticket_large.png',
        alt: '码上惠客',
        route: '/pages/coupon/coupon',
        dataService: 'coupon'
      },
      {
        key: 'shopping',
        type: 'smart',
        title: '码上消费',
        desc: '在线购买服务',
        icon: '/assets/icons/home/food.png',
        alt: '码上消费',
        route: '/pages/shopping/shopping',
        dataService: 'shopping'
      },
      {
        key: 'audio-guide',
        type: 'smart',
        title: '码上导游',
        desc: '智能语音导览',
        icon: '/assets/icons/home/routes.png',
        alt: '码上导游',
        route: '/pages/audio-guide/audio-guide',
        dataService: 'audio-guide'
      },
      {
        key: 'management',
        type: 'smart',
        title: '码上监管',
        desc: '服务质量监控',
        icon: '/assets/icons/navigation/scan_code.png',
        alt: '码上监管',
        route: '/pages/management/management',
        dataService: 'management'
      },
      {
        key: 'merchant',
        type: 'smart',
        title: '码上合作',
        desc: '商家入驻合作',
        icon: '/assets/icons/user/service.png',
        alt: '码上合作',
        route: '/pages/merchant/merchant',
        dataService: 'merchant'
      }
    ],
  },

  onLoad() {
    console.log('首页加载完成');
    this.initializeData();
  },
  
  // 初始化数据
  async initializeData() {
    try {
      // 模拟加载数据
      setTimeout(() => {
        console.log('首页数据初始化完成');
      }, 500);
    } catch (error) {
      console.error('首页数据初始化失败:', error);
      this.setData({ loadingTimeout: true });
    }
  },

  // 轮播图相关事件
  onBannerChange(e) {
    this.setData({
      currentBannerIndex: e.detail.current
    });
  },

  onBannerTap(e) {
    const id = e.currentTarget.dataset.id;
    const banner = this.data.bannerList.find(item => item.id === id);
    if (banner && banner.linkUrl) {
      wx.navigateTo({
        url: banner.linkUrl,
        fail: () => {
          wx.switchTab({ url: banner.linkUrl });
        }
      });
    }
  },

  onBannerImageLoad() {
    console.log('Banner image loaded');
  },

  onBannerImageError() {
    console.log('Banner image load error');
  },

  onIconError(e) {
    console.log('Icon load error:', e);
    // 可以在这里设置默认图标或进行其他处理
  },

  // 智慧服务点击事件
  onServiceTap(e) {
    const service = e.currentTarget.dataset.service;
    const routes = {
      'scan': '/pages/scan-verify/scan-verify',
      'review': '/pages/review/review',
      'coupon': '/pages/coupon/coupon',
      'shopping': '/pages/shopping/shopping',
      'audio-guide': '/pages/audio-guide/audio-guide',
      'management': '/pages/management/management',
      'merchant': '/pages/merchant/merchant'
    };
    
    if (routes[service]) {
      // 先尝试扫码进码功能
      if (service === 'scan') {
        this.startScan();
      } else {
        wx.navigateTo({
          url: routes[service],
          fail: (err) => {
            console.error('页面跳转失败:', err);
            interaction.showToast('页面正在开发中');
          }
        });
      }
    }
  },

  // 扫码功能
  startScan() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log('扫码结果:', res);
        // 跳转到验证页面
        wx.navigateTo({
          url: `/pages/scan-verify/scan-verify?scanType=${res.scanType}&result=${encodeURIComponent(res.result)}`
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        if (err.errMsg !== 'scanCode:fail cancel') {
          interaction.showToast('扫码失败，请重试');
        }
      }
    });
  },

  // 通用点击事件
  onCommonTap(e) {
    const type = e.currentTarget.dataset.type;
    console.log('点击类型:', type);
    
    switch (type) {
      case 'ticket':
        console.log('正在跳转到票务页面...');
        wx.navigateTo({ 
          url: '/pages/ticket/ticket',
          success: () => {
            console.log('票务页面跳转成功');
          },
          fail: (err) => {
            console.error('票务页面跳转失败:', err);
            // 尝试使用tabBar跳转
            wx.switchTab({ 
              url: '/pages/ticket/ticket',
              success: () => {
                console.log('票务页面(tab)跳转成功');
              },
              fail: (tabErr) => {
                console.error('票务页面(tab)跳转失败:', tabErr);
                interaction.showToast('页面跳转失败，请重试');
              }
            });
          }
        });
        break;
      case 'map':
        wx.navigateTo({ url: '/pages/map/map' });
        break;
      case 'parking':
        interaction.showToast('停车场功能开发中');
        break;
      case 'scan':
        this.startScan();
        break;
      case 'emergency':
        this.handleEmergency();
        break;
      case 'guide':
        wx.navigateTo({ url: '/pages/guide/guide' });
        break;
      case 'transport':
        interaction.showToast('交通信息功能开发中');
        break;
      case 'all':
        interaction.showToast('更多设施功能开发中');
        break;
      default:
        interaction.showToast('功能开发中');
    }
  },

  // 紧急求助
  handleEmergency() {
    wx.showModal({
      title: '紧急求助',
      content: '是否拨打景区救援电话？',
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567',
            fail: () => {
              interaction.showToast('拨号失败');
            }
          });
        }
      }
    });
  },

  // 查找附近设施
  findNearby(e) {
    const type = e.currentTarget.dataset.type;
    console.log('查找附近设施:', type);
    
    // 这里可以集成地图功能
    wx.navigateTo({
      url: `/pages/map/map?type=${type}`,
      fail: () => {
        interaction.showToast('地图功能开发中');
      }
    });
  },

  // 活动点击
  onActivityTap(e) {
    const index = e.currentTarget.dataset.index;
    const activity = this.data.activities[index];
    console.log('点击活动:', activity);
    
    wx.showModal({
      title: activity.title.replace(/【.*?】/, ''),
      content: activity.desc,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 刷新数据
  refreshHomeData() {
    this.setData({ loadingTimeout: false });
    this.initializeData();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshHomeData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  }
}); 