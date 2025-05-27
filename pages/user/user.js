// pages/user/user.js
const config = require('../../utils/config');
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    userId: '12345678',
    pendingCount: 2, // 待使用订单数量
    
    // 添加CDN图标路径
    icons: config.ICONS
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    const userInfo = this.data.userInfo;
    userInfo.avatarUrl = avatarUrl;
    
    this.setData({
      userInfo: userInfo
    });
    
    // 如果已有昵称，则设置为已登录状态
    if (userInfo.nickName) {
      this.setData({
        hasUserInfo: true
      });
      
      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo);
    }
  },

  // 获取用户信息
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        // 如果已选择头像，则使用已选择的头像
        if (this.data.userInfo.avatarUrl !== defaultAvatarUrl) {
          userInfo.avatarUrl = this.data.userInfo.avatarUrl;
        }
        
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
        
        // 保存用户信息
        wx.setStorageSync('userInfo', userInfo);
      },
      fail: (res) => {
        wx.showToast({
          title: '授权失败',
          icon: 'error'
        });
      }
    });
  },

  // 导航到全部订单
  navigateToAllOrders() {
    wx.navigateTo({
      url: '/pages/user/orders/orders'
    });
  },

  // 导航到指定状态的订单列表
  navigateToOrders(e) {
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/user/orders/orders?status=${status}`
    });
  },

  // 导航到其他功能页面
  navigateToFeature(e) {
    const feature = e.currentTarget.dataset.feature;
    let url = '';
    
    switch(feature) {
      case 'favorites':
        url = '/pages/user/favorites/favorites';
        break;
      case 'feedback':
        url = '/pages/user/feedback/feedback';
        break;
      case 'settings':
        url = '/pages/user/settings/settings';
        break;
      default:
        url = '/pages/user/index/index';
    }
    
    wx.navigateTo({
      url: url
    });
  },

  // 导航到帮助页面
  navigateToHelp(e) {
    const help = e.currentTarget.dataset.help;
    let url = '';
    
    switch(help) {
      case 'faq':
        url = '/pages/user/help/faq';
        break;
      case 'emergency':
        url = '/pages/user/help/emergency';
        break;
      case 'about':
        url = '/pages/user/help/about';
        break;
      default:
        url = '/pages/user/help/index';
    }
    
    wx.navigateTo({
      url: url
    });
  },

  // 拨打客服电话
  callCustomerService() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
      fail() {
        wx.showToast({
          title: '拨号失败',
          icon: 'error'
        });
      }
    });
  }
}) 