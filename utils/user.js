/**
 * 用户系统管理模块
 * 处理用户登录、注册、个人信息管理等功能
 * 支持云开发和本地模拟模式
 */

const env = require('./env');
const cache = require('./cache');
const { request } = require('./api');

class UserManager {
  constructor() {
    this.userInfo = null;
    this.isLoggedIn = false;
    this.loginCallbacks = [];
    this.logoutCallbacks = [];
    this.cloudEnabled = false;
  }

  /**
   * 初始化用户系统
   */
  init() {
    // 检查云开发状态
    const app = getApp();
    this.cloudEnabled = app.globalData.cloudEnabled;
    
    // 从缓存中恢复用户信息
    const cachedUser = cache.get('user_info');
    const token = cache.get('user_token');
    
    if (cachedUser && token) {
      this.userInfo = cachedUser;
      this.isLoggedIn = true;
      this.validateToken(token);
    }
    
    console.log(`用户管理初始化完成，云开发${this.cloudEnabled ? '已启用' : '未启用'}`);
  }

  /**
   * 微信登录
   */
  async wxLogin() {
    try {
      console.log('开始微信登录流程...');
      
      // 获取微信登录凭证
      const loginRes = await this.getWxLoginCode();
      if (!loginRes.code) {
        throw new Error('获取微信登录凭证失败');
      }

      let userProfile = null;
      
      // 尝试获取用户信息（在用户允许的情况下）
      try {
        userProfile = await this.getWxUserProfile();
      } catch (error) {
        console.log('用户未授权获取个人信息，使用默认信息');
        userProfile = {
          nickName: '微信用户',
          avatarUrl: '/assets/icons/user/default_avatar.png'
        };
      }
      
      // 认证并保存用户信息
      const authResult = await this.authenticateWithBackend({
        code: loginRes.code,
        userInfo: userProfile
      });

      // 保存用户信息
      await this.saveUserInfo(authResult);
      
      return {
        success: true,
        userInfo: this.userInfo,
        message: '登录成功'
      };
    } catch (error) {
      console.error('微信登录失败:', error);
      return {
        success: false,
        message: error.message || '登录失败，请重试'
      };
    }
  }

  /**
   * 获取微信登录凭证
   */
  getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 获取微信用户信息
   */
  getWxUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: reject
      });
    });
  }

  /**
   * 后端认证（云开发或传统API）
   */
  async authenticateWithBackend(data) {
    if (this.cloudEnabled) {
      return await this.cloudAuthenticate(data);
    } else {
      return await this.mockAuthenticate(data);
    }
  }

  /**
   * 云开发认证
   */
  async cloudAuthenticate(data) {
    try {
      console.log('使用云开发进行用户认证...');
      
      // 调用云函数进行登录
      const result = await wx.cloud.callFunction({
        name: 'userLogin',
        data: {
          code: data.code,
          userInfo: data.userInfo,
          timestamp: Date.now()
        }
      });

      if (result.result && result.result.success) {
        return {
          token: result.result.token,
          userInfo: {
            id: result.result.openid,
            openid: result.result.openid,
            nickname: data.userInfo.nickName || '微信用户',
            avatar: data.userInfo.avatarUrl || '/assets/icons/user/default_avatar.png',
            phone: '',
            email: '',
            vipLevel: 0,
            points: 100,
            visitCount: 1,
            lastVisit: new Date().toISOString(),
            createTime: result.result.createTime || new Date().toISOString()
          },
          permissions: ['basic']
        };
      } else {
        throw new Error(result.result?.message || '云端认证失败');
      }
    } catch (error) {
      console.error('云开发认证失败:', error);
      // 降级到模拟认证
      console.log('降级到模拟认证模式...');
      return await this.mockAuthenticate(data);
    }
  }

  /**
   * 模拟认证（用于开发环境或云开发不可用时）
   */
  async mockAuthenticate(data) {
    console.log('使用模拟认证模式...');
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      token: 'mock_token_' + Date.now(),
      userInfo: {
        id: 'mock_user_' + Date.now(),
        openid: 'mock_openid_' + Date.now(),
        nickname: data.userInfo.nickName || '游客',
        avatar: data.userInfo.avatarUrl || '/assets/icons/user/default_avatar.png',
        phone: '',
        email: '',
        vipLevel: 0,
        points: 100,
        visitCount: 1,
        lastVisit: new Date().toISOString(),
        createTime: new Date().toISOString()
      },
      permissions: ['basic']
    };
  }

  /**
   * 保存用户信息
   */
  async saveUserInfo(authResult) {
    this.userInfo = authResult.userInfo;
    this.isLoggedIn = true;
    
    // 缓存用户信息和token
    cache.set('user_info', authResult.userInfo, 7 * 24 * 60 * 60 * 1000); // 7天
    cache.set('user_token', authResult.token, 7 * 24 * 60 * 60 * 1000);
    cache.set('user_permissions', authResult.permissions, 7 * 24 * 60 * 60 * 1000);
    
    // 如果使用云开发，同步用户数据到云端
    if (this.cloudEnabled) {
      try {
        await this.syncUserToCloud(authResult.userInfo);
      } catch (error) {
        console.error('用户数据云端同步失败:', error);
        // 同步失败不影响登录流程
      }
    }
    
    // 触发登录回调
    this.loginCallbacks.forEach(callback => {
      try {
        callback(this.userInfo);
      } catch (error) {
        console.error('登录回调执行失败:', error);
      }
    });
  }

  /**
   * 同步用户数据到云端
   */
  async syncUserToCloud(userInfo) {
    try {
      const db = wx.cloud.database();
      const usersCollection = db.collection('users');
      
      // 检查用户是否已存在
      const existing = await usersCollection.where({
        openid: userInfo.openid
      }).get();
      
      if (existing.data.length > 0) {
        // 更新用户信息
        await usersCollection.doc(existing.data[0]._id).update({
          data: {
            ...userInfo,
            lastVisit: new Date().toISOString(),
            visitCount: existing.data[0].visitCount + 1
          }
        });
      } else {
        // 创建新用户
        await usersCollection.add({
          data: {
            ...userInfo,
            createTime: new Date().toISOString()
          }
        });
      }
      
      console.log('用户数据同步到云端成功');
    } catch (error) {
      console.error('云端用户数据同步失败:', error);
      throw error;
    }
  }

  /**
   * 验证token有效性
   */
  async validateToken(token) {
    try {
      if (!this.cloudEnabled) {
        return true; // 本地模式跳过验证
      }

      const result = await wx.cloud.callFunction({
        name: 'validateToken',
        data: { token }
      });
      
      if (result.result && result.result.valid) {
        return true;
      } else {
        await this.logout();
        return false;
      }
    } catch (error) {
      console.error('Token验证失败:', error);
      // 验证失败时登出用户
      await this.logout();
      return false;
    }
  }

  /**
   * 退出登录
   */
  async logout() {
    this.userInfo = null;
    this.isLoggedIn = false;
    
    // 清除缓存
    cache.remove('user_info');
    cache.remove('user_token');
    cache.remove('user_permissions');
    
    // 触发退出回调
    this.logoutCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('退出回调执行失败:', error);
      }
    });
  }

  /**
   * 更新用户信息
   */
  async updateUserInfo(updates) {
    try {
      if (!this.isLoggedIn) {
        throw new Error('用户未登录');
      }

      // 更新本地用户信息
      this.userInfo = { ...this.userInfo, ...updates };
      cache.set('user_info', this.userInfo, 7 * 24 * 60 * 60 * 1000);

      // 如果使用云开发，同步到云端
      if (this.cloudEnabled) {
        await this.syncUserToCloud(this.userInfo);
      }

      return {
        success: true,
        data: this.userInfo
      };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats() {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        return {
          success: true,
          data: {
            pendingOrders: 2,
            usedOrders: 5,
            refundOrders: 1,
            totalVisits: 8,
            favoriteCount: 12,
            pointsBalance: 150
          }
        };
      }

      return await request({
        url: '/user/stats',
        method: 'GET'
      });
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return {
        success: false,
        data: {
          pendingOrders: 0,
          usedOrders: 0,
          refundOrders: 0,
          totalVisits: 0,
          favoriteCount: 0,
          pointsBalance: 0
        }
      };
    }
  }

  /**
   * 获取用户订单
   */
  async getUserOrders(status = 'all', page = 1, limit = 10) {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        return {
          orders: [
            {
              id: 'order_001',
              type: 'ticket',
              title: '成人票',
              price: 120,
              quantity: 2,
              status: 'paid',
              createTime: '2024-01-15 10:30:00',
              useTime: '2024-01-16 09:00:00',
              qrCode: 'mock_qr_code_001'
            },
            {
              id: 'order_002',
              type: 'ticket',
              title: '学生票',
              price: 60,
              quantity: 1,
              status: 'used',
              createTime: '2024-01-10 14:20:00',
              useTime: '2024-01-12 11:30:00',
              qrCode: 'mock_qr_code_002'
            }
          ],
          total: 2,
          hasMore: false
        };
      }

      return await request({
        url: '/user/orders',
        method: 'GET',
        data: { status, page, limit }
      });
    } catch (error) {
      console.error('获取用户订单失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户收藏
   */
  async getUserFavorites(type = 'all', page = 1, limit = 10) {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        return {
          favorites: [
            {
              id: 'fav_001',
              type: 'spot',
              title: '松月湖',
              image: '/assets/images/spots/spot1.jpg',
              description: '湖光山色，美不胜收',
              addTime: '2024-01-15 16:20:00'
            },
            {
              id: 'fav_002',
              type: 'route',
              title: '经典全景游',
              image: '/assets/images/routes/route1.jpg',
              description: '最受欢迎的游览路线',
              addTime: '2024-01-12 09:15:00'
            }
          ],
          total: 2,
          hasMore: false
        };
      }

      return await request({
        url: '/user/favorites',
        method: 'GET',
        data: { type, page, limit }
      });
    } catch (error) {
      console.error('获取用户收藏失败:', error);
      throw error;
    }
  }

  /**
   * 添加收藏
   */
  async addFavorite(item) {
    try {
      if (env.shouldUseMock()) {
        return { success: true, message: '收藏成功' };
      }

      return await request({
        url: '/user/favorites',
        method: 'POST',
        data: item
      });
    } catch (error) {
      console.error('添加收藏失败:', error);
      throw error;
    }
  }

  /**
   * 移除收藏
   */
  async removeFavorite(favoriteId) {
    try {
      if (env.shouldUseMock()) {
        return { success: true, message: '取消收藏成功' };
      }

      return await request({
        url: `/user/favorites/${favoriteId}`,
        method: 'DELETE'
      });
    } catch (error) {
      console.error('移除收藏失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户权限
   */
  getUserPermissions() {
    return cache.get('user_permissions') || ['basic'];
  }

  /**
   * 检查用户权限
   */
  hasPermission(permission) {
    const permissions = this.getUserPermissions();
    return permissions.includes(permission) || permissions.includes('admin');
  }

  /**
   * 注册登录回调
   */
  onLogin(callback) {
    this.loginCallbacks.push(callback);
  }

  /**
   * 注册退出回调
   */
  onLogout(callback) {
    this.logoutCallbacks.push(callback);
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    return this.userInfo;
  }

  /**
   * 检查是否已登录
   */
  checkLoginStatus() {
    return this.isLoggedIn;
  }

  /**
   * 强制登录检查
   */
  async requireLogin() {
    if (!this.isLoggedIn) {
      const result = await this.showLoginModal();
      if (!result) {
        throw new Error('用户取消登录');
      }
    }
    return this.userInfo;
  }

  /**
   * 显示登录模态框
   */
  showLoginModal() {
    return new Promise((resolve) => {
      wx.showModal({
        title: '登录提示',
        content: '此功能需要登录后使用，是否立即登录？',
        confirmText: '立即登录',
        cancelText: '暂不登录',
        success: async (res) => {
          if (res.confirm) {
            try {
              await this.wxLogin();
              resolve(true);
            } catch (error) {
              wx.showToast({
                title: '登录失败',
                icon: 'error'
              });
              resolve(false);
            }
          } else {
            resolve(false);
          }
        }
      });
    });
  }
}

// 创建单例实例
const userManager = new UserManager();

// 导出实例和类
module.exports = {
  userManager,
  UserManager
};