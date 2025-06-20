/**
 * 收藏功能管理模块
 * 处理用户收藏的景点、路线等内容
 * 支持云开发和本地存储模式
 */

const cache = require('./cache');

class FavoritesManager {
  constructor() {
    this.cloudEnabled = false;
    this.favorites = {
      spots: [],
      routes: [],
      activities: []
    };
  }

  /**
   * 初始化收藏管理器
   */
  init() {
    // 检查云开发状态
    const app = getApp();
    this.cloudEnabled = app.globalData.cloudEnabled;
    
    // 从缓存中恢复收藏数据
    this.loadFavoritesFromCache();
    
    console.log(`收藏管理初始化完成，云开发${this.cloudEnabled ? '已启用' : '未启用'}`);
  }

  /**
   * 从缓存加载收藏数据
   */
  loadFavoritesFromCache() {
    try {
      const cachedFavorites = cache.get('user_favorites');
      if (cachedFavorites) {
        this.favorites = {
          spots: cachedFavorites.spots || [],
          routes: cachedFavorites.routes || [],
          activities: cachedFavorites.activities || []
        };
      }
    } catch (error) {
      console.error('加载缓存收藏数据失败:', error);
      this.favorites = {
        spots: [],
        routes: [],
        activities: []
      };
    }
  }

  /**
   * 添加收藏
   * @param {string} type - 类型：'spot', 'route', 'activity'
   * @param {Object} item - 收藏项目信息
   */
  async addFavorite(type, item) {
    try {
      const favoriteItem = {
        id: item.id,
        title: item.title || item.name,
        subtitle: item.subtitle || item.description,
        image: item.image || item.cover,
        type: type,
        addTime: new Date().toISOString(),
        ...item
      };

      // 检查是否已收藏
      if (this.isFavorited(type, item.id)) {
        return {
          success: false,
          message: '已经收藏过了'
        };
      }

      // 添加到本地收藏列表
      const typeKey = type + 's'; // spot -> spots
      this.favorites[typeKey].unshift(favoriteItem);

      // 保存到缓存
      cache.set('user_favorites', this.favorites, 30 * 24 * 60 * 60 * 1000); // 30天

      // 如果启用云开发，同步到云端
      if (this.cloudEnabled) {
        await this.syncFavoriteToCloud('add', type, favoriteItem);
      }

      return {
        success: true,
        message: '收藏成功',
        data: favoriteItem
      };
    } catch (error) {
      console.error('添加收藏失败:', error);
      return {
        success: false,
        message: error.message || '收藏失败'
      };
    }
  }

  /**
   * 取消收藏
   * @param {string} type - 类型
   * @param {string} itemId - 项目ID
   */
  async removeFavorite(type, itemId) {
    try {
      const typeKey = type + 's';
      const index = this.favorites[typeKey].findIndex(item => item.id === itemId);
      
      if (index === -1) {
        return {
          success: false,
          message: '未找到收藏项目'
        };
      }

      // 从本地列表移除
      const removedItem = this.favorites[typeKey].splice(index, 1)[0];

      // 更新缓存
      cache.set('user_favorites', this.favorites, 30 * 24 * 60 * 60 * 1000);

      // 如果启用云开发，同步到云端
      if (this.cloudEnabled) {
        await this.syncFavoriteToCloud('remove', type, removedItem);
      }

      return {
        success: true,
        message: '取消收藏成功',
        data: removedItem
      };
    } catch (error) {
      console.error('取消收藏失败:', error);
      return {
        success: false,
        message: error.message || '取消收藏失败'
      };
    }
  }

  /**
   * 检查是否已收藏
   * @param {string} type - 类型
   * @param {string} itemId - 项目ID
   */
  isFavorited(type, itemId) {
    const typeKey = type + 's';
    return this.favorites[typeKey].some(item => item.id === itemId);
  }

  /**
   * 切换收藏状态
   * @param {string} type - 类型
   * @param {Object} item - 项目信息
   */
  async toggleFavorite(type, item) {
    if (this.isFavorited(type, item.id)) {
      return await this.removeFavorite(type, item.id);
    } else {
      return await this.addFavorite(type, item);
    }
  }

  /**
   * 获取收藏列表
   * @param {string} type - 类型，为空时返回所有类型
   */
  getFavorites(type = null) {
    if (type) {
      const typeKey = type + 's';
      return this.favorites[typeKey] || [];
    } else {
      return this.favorites;
    }
  }

  /**
   * 获取收藏统计
   */
  getFavoriteStats() {
    return {
      spots: this.favorites.spots.length,
      routes: this.favorites.routes.length,
      activities: this.favorites.activities.length,
      total: this.favorites.spots.length + this.favorites.routes.length + this.favorites.activities.length
    };
  }

  /**
   * 同步收藏到云端
   * @param {string} action - 操作类型：'add', 'remove'
   * @param {string} type - 收藏类型
   * @param {Object} item - 收藏项目
   */
  async syncFavoriteToCloud(action, type, item) {
    try {
      if (!this.cloudEnabled) {
        return;
      }

      // 获取当前用户信息
      const userManager = require('./user').userManager;
      if (!userManager.isLoggedIn) {
        console.log('用户未登录，跳过云端同步');
        return;
      }

      const db = wx.cloud.database();
      const favoritesCollection = db.collection('favorites');

      if (action === 'add') {
        // 添加收藏到云端
        await favoritesCollection.add({
          data: {
            userId: userManager.userInfo.id,
            openid: userManager.userInfo.openid,
            type: type,
            itemId: item.id,
            itemData: item,
            createTime: new Date().toISOString()
          }
        });
        console.log('收藏数据已同步到云端');
      } else if (action === 'remove') {
        // 从云端删除收藏
        const existing = await favoritesCollection.where({
          userId: userManager.userInfo.id,
          type: type,
          itemId: item.id
        }).get();

        if (existing.data.length > 0) {
          await favoritesCollection.doc(existing.data[0]._id).remove();
          console.log('云端收藏数据已删除');
        }
      }
    } catch (error) {
      console.error('云端收藏同步失败:', error);
      // 云端同步失败不影响本地操作
    }
  }

  /**
   * 从云端加载收藏数据
   */
  async loadFavoritesFromCloud() {
    try {
      if (!this.cloudEnabled) {
        return {
          success: false,
          message: '云开发未启用'
        };
      }

      // 获取当前用户信息
      const userManager = require('./user').userManager;
      if (!userManager.isLoggedIn) {
        return {
          success: false,
          message: '用户未登录'
        };
      }

      const db = wx.cloud.database();
      const favoritesCollection = db.collection('favorites');

      // 查询用户的所有收藏
      const result = await favoritesCollection.where({
        userId: userManager.userInfo.id
      }).orderBy('createTime', 'desc').get();

      // 重构收藏数据结构
      const cloudFavorites = {
        spots: [],
        routes: [],
        activities: []
      };

      result.data.forEach(favorite => {
        const typeKey = favorite.type + 's';
        if (cloudFavorites[typeKey]) {
          cloudFavorites[typeKey].push(favorite.itemData);
        }
      });

      // 合并云端和本地数据（以云端为准）
      this.favorites = cloudFavorites;

      // 更新本地缓存
      cache.set('user_favorites', this.favorites, 30 * 24 * 60 * 60 * 1000);

      console.log('从云端加载收藏数据成功:', this.getFavoriteStats());

      return {
        success: true,
        data: this.favorites
      };
    } catch (error) {
      console.error('从云端加载收藏数据失败:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 清空所有收藏
   */
  async clearAllFavorites() {
    try {
      // 清空本地数据
      this.favorites = {
        spots: [],
        routes: [],
        activities: []
      };

      // 清除缓存
      cache.remove('user_favorites');

      // 如果启用云开发，清空云端数据
      if (this.cloudEnabled) {
        const userManager = require('./user').userManager;
        if (userManager.isLoggedIn) {
          const db = wx.cloud.database();
          const favoritesCollection = db.collection('favorites');
          
          // 删除用户的所有收藏
          const existing = await favoritesCollection.where({
            userId: userManager.userInfo.id
          }).get();

          const deletePromises = existing.data.map(item => 
            favoritesCollection.doc(item._id).remove()
          );
          
          await Promise.all(deletePromises);
          console.log('云端收藏数据已清空');
        }
      }

      return {
        success: true,
        message: '已清空所有收藏'
      };
    } catch (error) {
      console.error('清空收藏失败:', error);
      return {
        success: false,
        message: error.message || '清空收藏失败'
      };
    }
  }
}

// 创建全局实例
const favoritesManager = new FavoritesManager();

module.exports = {
  FavoritesManager,
  favoritesManager
}; 