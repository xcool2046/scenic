// pages/user/user.js
const app = getApp();
const env = require('../../utils/env');
const { userManager } = require('../../utils/user');
const { ticketManager } = require('../../utils/ticket');
const api = require('../../utils/api');
const config = require('../../utils/config');
const performance = require('../../utils/performance');

Page({
  data: {
    userInfo: null,
    isLoggedIn: false,
    orderStats: {
      pending: 0,
      used: 0,
      refund: 0
    },
    
    // 图标资源配置
    icons: config.ICONS
  },

  async onLoad() {
    try {
      // 记录页面性能
      performance.mark('user_page_load_start');
      
      // 检查登录状态
      await this.checkLoginStatus();
      
      // 如果已登录，加载用户数据
      if (this.data.isLoggedIn) {
        await this.loadUserData();
      }
      
      // 记录页面加载结束时间
      performance.mark('user_page_load_end');
      const duration = performance.measure('user_page_load', 'user_page_load_start', 'user_page_load_end');
      console.log(`用户页面加载耗时: ${duration.duration}ms`);
      
    } catch (error) {
      console.error('用户页面加载失败:', error);
      this.showToast('页面加载失败，请重试');
    }
  },

  onShow() {
    // 每次显示页面时刷新用户状态
    if (this.data.isLoggedIn) {
      this.loadUserData();
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    if (!avatarUrl) return;
    
    // 添加交互反馈
    wx.vibrateShort({ type: 'light' });
    
    const userInfo = { ...this.data.userInfo };
    userInfo.avatarUrl = avatarUrl;
    
    this.setData({ userInfo });
    
    // 保存用户信息
    if (this.data.isLoggedIn) {
      userManager.updateUserInfo({ avatarUrl })
        .then(() => {
          this.showToast('头像更新成功');
        })
        .catch(() => {
          this.showToast('头像更新失败');
        });
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      const isLoggedIn = userManager.checkLoginStatus();
      const currentUser = userManager.getCurrentUser();
      
      this.setData({
        isLoggedIn,
        userInfo: currentUser || {}
      });
      
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  },

  // 加载用户数据
  async loadUserData() {
    try {
      this.showLoading('加载中...');
      
      // 并行加载用户统计和订单信息
      const [statsResult, ordersResult] = await Promise.allSettled([
        userManager.getUserStats(),
        userManager.getUserOrders()
      ]);
      
      // 处理统计数据
      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        const stats = statsResult.value.data;
        this.setData({
          orderStats: {
            pending: stats.pendingOrders || 0,
            used: stats.usedOrders || 0,
            refund: stats.refundOrders || 0
          }
        });
      }
      
      // 处理订单数据
      if (ordersResult.status === 'fulfilled' && ordersResult.value.success) {
        this.setData({
          userOrders: ordersResult.value.data
        });
      }
      
      this.hideLoading();
      
    } catch (error) {
      console.error('加载用户数据失败:', error);
      this.hideLoading();
      this.showToast('数据加载失败');
    }
  },

  // 处理登录
  async handleLogin() {
    try {
      console.log('点击登录按钮');
      
      // 添加触觉反馈
      wx.vibrateShort({ type: 'medium' });
      
      this.showLoading('登录中...');
      
      // 检查userManager是否已初始化
      if (!userManager) {
        console.error('userManager未初始化');
        throw new Error('用户系统未初始化');
      }
      
      console.log('开始调用userManager.wxLogin()');
      const result = await userManager.wxLogin();
      console.log('登录结果:', result);
      
      if (result.success || result.token) {
        this.setData({
          isLoggedIn: true,
          userInfo: result.userInfo || result.data
        });
        
        // 登录成功后加载用户数据
        await this.loadUserData();
        
        this.showToast('登录成功');
      } else {
        throw new Error(result.message || '登录失败');
      }
      
    } catch (error) {
      console.error('登录失败:', error);
      this.showToast(error.message || '登录失败，请重试');
    } finally {
      this.hideLoading();
    }
  },

  // 导航到订单页面
  navigateToOrders(e) {
    if (!this.data.isLoggedIn) {
      this.handleLogin();
      return;
    }
    
    // 添加触觉反馈
    wx.vibrateShort({ type: 'light' });
    
    const status = e.currentTarget.dataset.status || 'all';
    
    // 检查是否是票务包中的订单页面
    const ticketOrderUrl = '/pages/ticket/ticket';
    if (status !== 'all') {
      wx.navigateTo({
        url: `${ticketOrderUrl}?status=${status}`,
        fail: () => {
          // 如果票务包页面不存在，导航到主票务页面
          wx.navigateTo({
            url: '/pages/ticket/ticket',
            fail: () => {
              this.showToast('订单功能暂未开放');
            }
          });
        }
      });
    } else {
      wx.navigateTo({
        url: ticketOrderUrl,
        fail: () => {
          wx.navigateTo({
            url: '/pages/ticket/ticket',
            fail: () => {
              this.showToast('订单功能暂未开放');
            }
          });
        }
      });
    }
  },

  // 导航到收藏页面
  navigateToFavorites() {
    // 添加触觉反馈
    wx.vibrateShort({ type: 'light' });
    
    // 暂时跳转到导览页面，展示收藏的景点
    wx.switchTab({
      url: '/pages/guide/guide',
      success: () => {
        // 可以通过全局数据传递显示收藏列表的标识
        app.globalData.showFavorites = true;
      },
      fail: () => {
        this.showToast('收藏功能暂未开放');
      }
    });
  },

  // 联系客服
  contactService() {
    // 添加触觉反馈
    wx.vibrateShort({ type: 'light' });
    
    wx.showActionSheet({
      itemList: ['电话咨询', '意见反馈'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            // 电话咨询
            wx.makePhoneCall({
              phoneNumber: '400-123-4567',
              fail: () => {
                this.showToast('拨打电话失败');
              }
            });
            break;
          case 1:
            // 意见反馈
            this.provideFeedback();
            break;
        }
      }
    });
  },

  // 意见反馈
  provideFeedback() {
    wx.navigateTo({
      url: '/pages/user/help/feedback',
      fail: () => {
        // 如果反馈页面不存在，显示简单的反馈弹窗
        wx.showModal({
          title: '意见反馈',
          content: '请通过客服电话 400-123-4567 联系我们',
          showCancel: false,
          confirmText: '好的'
        });
      }
    });
  },

  // 导航到设置页面
  navigateToSettings() {
    // 添加触觉反馈
    wx.vibrateShort({ type: 'light' });
    
    wx.navigateTo({
      url: '/pages/user/settings/settings',
      fail: () => {
        // 如果设置页面不存在，显示简单设置选项
        wx.showActionSheet({
          itemList: ['清除缓存', '检查更新', '关于我们'],
          success: (res) => {
            switch (res.tapIndex) {
              case 0:
                this.clearCache();
                break;
              case 1:
                this.checkUpdate();
                break;
              case 2:
                this.navigateToAbout();
                break;
            }
          }
        });
      }
    });
  },

  // 导航到关于页面
  navigateToAbout() {
    wx.navigateTo({
      url: '/pages/user/help/about',
      fail: () => {
        // 如果关于页面不存在，显示简单的关于信息
        wx.showModal({
          title: '关于景悦达',
          content: '景悦达智慧景区管理平台\n版本: 1.0.0\n\n为您提供便捷的景区服务体验',
          showCancel: false,
          confirmText: '确定'
        });
      }
    });
  },

  // 紧急求助
  handleEmergency() {
    // 添加强烈触觉反馈
    wx.vibrateShort({ type: 'heavy' });
    
    wx.showModal({
      title: '紧急求助',
      content: '是否立即拨打景区紧急救援电话？',
      confirmText: '立即拨打',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '110',
            fail: () => {
              this.showToast('拨打电话失败');
            }
          });
        }
      }
    });
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.showToast('缓存清除成功');
          // 重新加载页面数据
          setTimeout(() => {
            this.onLoad();
          }, 1000);
        }
      }
    });
  },

  // 检查更新
  checkUpdate() {
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager();
      updateManager.checkForUpdate({
        success: (res) => {
          if (res.hasUpdate) {
            this.showToast('发现新版本，正在下载...');
          } else {
            this.showToast('当前已是最新版本');
          }
        },
        fail: () => {
          this.showToast('检查更新失败');
        }
      });
    } else {
      this.showToast('当前微信版本过低，无法检查更新');
    }
  },

  // 显示加载状态
  showLoading(title = '加载中...') {
    const loading = this.selectComponent('#loading');
    if (loading) {
      loading.setData({
        text: title,
        loading: true
      });
    } else {
      wx.showLoading({ title, mask: true });
    }
  },

  // 隐藏加载状态
  hideLoading() {
    const loading = this.selectComponent('#loading');
    if (loading) {
      loading.setData({
        loading: false
      });
    } else {
      wx.hideLoading();
    }
  },

  // 显示提示信息
  showToast(title, icon = 'none') {
    const toast = this.selectComponent('#toast');
    if (toast) {
      toast.showToast({ text: title, icon });
    } else {
      wx.showToast({ title, icon, duration: 2000 });
    }
  }
});