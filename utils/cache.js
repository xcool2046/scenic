/**
 * 数据缓存工具模块
 * 提供统一的缓存读写、过期管理和自动清理
 */

// 全局过期配置(30分钟)
const DEFAULT_EXPIRATION = 30 * 60 * 1000;
const DEFAULT_VERSION = '1.0.0';

// 缓存前缀，用于区分不同版本的缓存
const CACHE_PREFIX = 'scenic_app_';

const cache = {
  /**
   * 设置缓存，支持过期时间
   * @param {String} key - 缓存键名
   * @param {*} data - 要缓存的数据
   * @param {Number} expireSeconds - 过期时间(秒)，默认24小时
   */
  setCache(key, data, expireSeconds = 24 * 60 * 60) {
    if (!key) return;
    
    try {
      // 构建缓存对象，包含数据和过期时间
      const cacheData = {
        data: data,
        expire: Date.now() + expireSeconds * 1000
      };
      
      // 存储缓存
      wx.setStorageSync(key, cacheData);
      
      // 维护缓存键列表以便清理
      this.addCacheKey(key);
    } catch (e) {
      console.error('缓存数据失败', e);
    }
  },
  
  /**
   * 获取缓存，自动处理过期
   * @param {String} key - 缓存键名
   * @returns {*} - 缓存的数据，如果过期或不存在则返回null
   */
  getCache(key) {
    if (!key) return null;
    
    try {
      const cacheData = wx.getStorageSync(key);
      
      // 如果缓存不存在
      if (!cacheData) return null;
      
      // 如果缓存已过期
      if (cacheData.expire && cacheData.expire < Date.now()) {
        this.removeCache(key);
        return null;
      }
      
      // 返回缓存数据
      return cacheData.data;
    } catch (e) {
      console.error('获取缓存失败', e);
      return null;
    }
  },
  
  /**
   * 移除缓存
   * @param {String} key - 要移除的缓存键名
   */
  removeCache(key) {
    if (!key) return;
    
    try {
      wx.removeStorageSync(key);
      this.removeCacheKey(key);
    } catch (e) {
      console.error('移除缓存失败', e);
    }
  },
  
  /**
   * 清理所有缓存
   */
  clearAllCache() {
    try {
      wx.clearStorageSync();
      this.clearCacheKeys();
    } catch (e) {
      console.error('清理所有缓存失败', e);
    }
  },
  
  /**
   * 清理过期缓存
   */
  clearExpiredCache() {
    try {
      const cacheKeys = this.getCacheKeys();
      
      cacheKeys.forEach(key => {
        // 检查是否过期
        const cacheData = wx.getStorageSync(key);
        if (cacheData && cacheData.expire && cacheData.expire < Date.now()) {
          this.removeCache(key);
        }
      });
    } catch (e) {
      console.error('清理过期缓存失败', e);
    }
  },
  
  /**
   * 添加缓存键到键列表
   * @param {String} key - 缓存键名
   */
  addCacheKey(key) {
    try {
      let keys = this.getCacheKeys();
      
      if (!keys.includes(key)) {
        keys.push(key);
        wx.setStorageSync('__cache_keys__', keys);
      }
    } catch (e) {
      console.error('添加缓存键失败', e);
    }
  },
  
  /**
   * 从键列表移除缓存键
   * @param {String} key - 缓存键名
   */
  removeCacheKey(key) {
    try {
      let keys = this.getCacheKeys();
      
      const index = keys.indexOf(key);
      if (index !== -1) {
        keys.splice(index, 1);
        wx.setStorageSync('__cache_keys__', keys);
      }
    } catch (e) {
      console.error('移除缓存键失败', e);
    }
  },
  
  /**
   * 获取所有缓存键
   * @returns {Array} - 缓存键列表
   */
  getCacheKeys() {
    try {
      return wx.getStorageSync('__cache_keys__') || [];
    } catch (e) {
      console.error('获取缓存键失败', e);
      return [];
    }
  },
  
  /**
   * 清空缓存键列表
   */
  clearCacheKeys() {
    try {
      wx.setStorageSync('__cache_keys__', []);
    } catch (e) {
      console.error('清空缓存键列表失败', e);
    }
  },
  
  /**
   * 获取缓存统计信息
   * @returns {Object} - 缓存统计信息
   */
  getCacheStats() {
    try {
      const keys = this.getCacheKeys();
      let validCacheCount = 0;
      let expiredCacheCount = 0;
      let totalSize = 0;
      
      keys.forEach(key => {
        const cacheData = wx.getStorageSync(key);
        if (!cacheData) return;
        
        // 计算大小（粗略估计）
        const sizeEstimate = JSON.stringify(cacheData).length;
        totalSize += sizeEstimate;
        
        // 判断是否过期
        if (cacheData.expire && cacheData.expire < Date.now()) {
          expiredCacheCount++;
        } else {
          validCacheCount++;
        }
      });
      
      return {
        totalCacheCount: keys.length,
        validCacheCount,
        expiredCacheCount,
        totalSize: (totalSize / 1024).toFixed(2) + 'KB'
      };
    } catch (e) {
      console.error('获取缓存统计失败', e);
      return {
        totalCacheCount: 0,
        validCacheCount: 0,
        expiredCacheCount: 0,
        totalSize: '0KB'
      };
    }
  }
};

// 缓存API请求结果
const cacheApiResult = async (apiFunc, cacheKey, params = {}, expiration = DEFAULT_EXPIRATION) => {
  // 先尝试从缓存获取
  const cachedData = cache.getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  
  // 没有缓存，调用API
  try {
    const result = await apiFunc(params);
    
    // 缓存成功结果
    if (result && (
        (result.code === 200) || 
        (result.code === '200') || 
        (result.status === 'ok'))) {
      cache.setCache(cacheKey, result, expiration);
    }
    
    return result;
  } catch (e) {
    console.error('API请求失败', e);
    throw e;
  }
};

// 导出工具函数
module.exports = {
  ...cache,
  cacheApiResult
}; 