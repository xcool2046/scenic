/**
 * 数据缓存工具模块
 * 提供统一的缓存读写、过期管理、版本控制和自动清理
 */

// 全局配置
const CACHE_CONFIG = {
  DEFAULT_EXPIRATION: 30 * 60 * 1000, // 30分钟
  MAX_CACHE_SIZE: 50 * 1024 * 1024,   // 50MB
  MAX_CACHE_ENTRIES: 1000,             // 最大缓存条目数
  VERSION: '1.0.0',                    // 缓存版本
  CLEANUP_INTERVAL: 5 * 60 * 1000,     // 自动清理间隔 5分钟
  STORAGE_QUOTA_WARNING: 0.8           // 存储空间警告阈值 80%
};

// 缓存前缀，用于区分不同版本的缓存
const CACHE_PREFIX = 'scenic_app_';
const VERSION_KEY = `${CACHE_PREFIX}version`;
const KEYS_LIST_KEY = `${CACHE_PREFIX}keys`;
const STATS_KEY = `${CACHE_PREFIX}stats`;

// 购物车专用缓存键
const CART_ITEMS_KEY = 'shopping_cart_items';

// 缓存统计信息
let cacheStats = {
  totalSize: 0,
  entryCount: 0,
  hitCount: 0,
  missCount: 0,
  cleanupCount: 0,
  lastCleanup: 0
};

// 自动清理定时器
let cleanupTimer = null;

const cache = {
  /**
   * 初始化缓存系统
   */
  init() {
    try {
      // 检查缓存版本
      this.checkVersion();
      
      // 加载缓存统计
      this.loadStats();
      
      // 启动自动清理
      this.startAutoCleanup();
      
      console.log('缓存系统初始化完成');
    } catch (error) {
      console.error('缓存系统初始化失败:', error);
    }
  },

  /**
   * 检查缓存版本，版本不匹配时清理旧缓存
   */
  checkVersion() {
    const currentVersion = wx.getStorageSync(VERSION_KEY);
    
    if (currentVersion !== CACHE_CONFIG.VERSION) {
      console.log(`缓存版本更新: ${currentVersion} -> ${CACHE_CONFIG.VERSION}`);
      this.clearAllCache();
      wx.setStorageSync(VERSION_KEY, CACHE_CONFIG.VERSION);
    }
  },

  /**
   * 加载缓存统计信息
   */
  loadStats() {
    try {
      const savedStats = wx.getStorageSync(STATS_KEY);
      if (savedStats) {
        cacheStats = { ...cacheStats, ...savedStats };
      }
      
      // 重新计算实际大小和数量
      this.recalculateStats();
    } catch (error) {
      console.error('加载缓存统计失败:', error);
    }
  },

  /**
   * 保存缓存统计信息
   */
  saveStats() {
    try {
      wx.setStorageSync(STATS_KEY, cacheStats);
    } catch (error) {
      console.error('保存缓存统计失败:', error);
    }
  },

  /**
   * 重新计算缓存统计
   */
  recalculateStats() {
    const keys = this.getCacheKeys();
    let totalSize = 0;
    let validCount = 0;

    keys.forEach(key => {
      try {
        const data = wx.getStorageSync(key);
        if (data) {
          totalSize += JSON.stringify(data).length * 2; // 粗略估算字节大小
          validCount++;
        }
      } catch (error) {
        // 忽略读取错误的键
      }
    });

    cacheStats.totalSize = totalSize;
    cacheStats.entryCount = validCount;
    this.saveStats();
  },

  /**
   * 设置缓存，支持过期时间和大小限制
   * @param {String} key - 缓存键名
   * @param {*} data - 要缓存的数据
   * @param {Number} expireSeconds - 过期时间(秒)，默认30分钟
   */
  setCache(key, data, expireSeconds = 30 * 60) {
    if (!key || data === undefined) {
      console.warn('缓存键或数据无效');
      return false;
    }
    
    try {
      // 检查缓存大小限制
      if (!this.checkSizeLimit(data)) {
        console.warn('缓存数据过大，执行清理后重试');
        this.smartCleanup();
        
        if (!this.checkSizeLimit(data)) {
          console.error('缓存数据仍然过大，放弃缓存');
          return false;
        }
      }

      // 构建缓存对象，包含数据和元信息
      const cacheData = {
        data: data,
        expire: Date.now() + expireSeconds * 1000,
        created: Date.now(),
        accessed: Date.now(),
        size: JSON.stringify(data).length * 2, // 粗略估算
        version: CACHE_CONFIG.VERSION
      };
      
      // 存储缓存
      const fullKey = this.getFullKey(key);
      wx.setStorageSync(fullKey, cacheData);
      
      // 维护缓存键列表
      this.addCacheKey(fullKey);
      
      // 更新统计信息
      cacheStats.totalSize += cacheData.size;
      cacheStats.entryCount++;
      this.saveStats();
      
      return true;
    } catch (error) {
      console.error('缓存数据失败:', error);
      return false;
    }
  },

  /**
   * 获取缓存，自动处理过期和访问统计
   * @param {String} key - 缓存键名
   * @returns {*} - 缓存的数据，如果过期或不存在则返回null
   */
  getCache(key) {
    if (!key) return null;
    
    try {
      const fullKey = this.getFullKey(key);
      const cacheData = wx.getStorageSync(fullKey);
      
      // 如果缓存不存在
      if (!cacheData) {
        cacheStats.missCount++;
        return null;
      }
      
      // 检查版本兼容性
      if (cacheData.version && cacheData.version !== CACHE_CONFIG.VERSION) {
        this.removeCache(key);
        cacheStats.missCount++;
        return null;
      }
      
      // 如果缓存已过期
      if (cacheData.expire && cacheData.expire < Date.now()) {
        this.removeCache(key);
        cacheStats.missCount++;
        return null;
      }
      
      // 更新访问时间和统计
      cacheData.accessed = Date.now();
      wx.setStorageSync(fullKey, cacheData);
      cacheStats.hitCount++;
      
      return cacheData.data;
    } catch (error) {
      console.error('获取缓存失败:', error);
      cacheStats.missCount++;
      return null;
    }
  },

  /**
   * 删除指定缓存
   * @param {String} key - 缓存键名
   */
  removeCache(key) {
    try {
      const fullKey = this.getFullKey(key);
      const cacheData = wx.getStorageSync(fullKey);
      
      wx.removeStorageSync(fullKey);
      this.removeCacheKey(fullKey);
      
      // 更新统计信息
      if (cacheData && cacheData.size) {
        cacheStats.totalSize -= cacheData.size;
        cacheStats.entryCount--;
        this.saveStats();
      }
      
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  },

  /**
   * 清空所有缓存
   */
  clearAllCache() {
    try {
      const keys = this.getCacheKeys();
      
      keys.forEach(key => {
        try {
          wx.removeStorageSync(key);
        } catch (error) {
          console.warn(`删除缓存键 ${key} 失败:`, error);
        }
      });
      
      // 清空键列表和统计
      this.clearCacheKeys();
      cacheStats = {
        totalSize: 0,
        entryCount: 0,
        hitCount: 0,
        missCount: 0,
        cleanupCount: 0,
        lastCleanup: Date.now()
      };
      this.saveStats();
      
      console.log('所有缓存已清空');
      return true;
    } catch (error) {
      console.error('清空缓存失败:', error);
      return false;
    }
  },

  /**
   * 智能清理缓存
   * 根据访问频率、大小和时间进行清理
   */
  smartCleanup() {
    try {
      const keys = this.getCacheKeys();
      const candidates = [];
      
      // 收集清理候选项
      keys.forEach(key => {
        try {
          const cacheData = wx.getStorageSync(key);
          if (cacheData) {
            const age = Date.now() - cacheData.created;
            const lastAccess = Date.now() - cacheData.accessed;
            const size = cacheData.size || 0;
            
            // 计算清理优先级分数（越高越应该被清理）
            let score = 0;
            score += age / (24 * 60 * 60 * 1000); // 按天计算年龄
            score += lastAccess / (60 * 60 * 1000); // 按小时计算最后访问
            score += size / (1024 * 1024); // 按MB计算大小
            
            candidates.push({
              key,
              score,
              size,
              data: cacheData
            });
          }
        } catch (error) {
          // 损坏的缓存直接删除
          wx.removeStorageSync(key);
          this.removeCacheKey(key);
        }
      });
      
      // 按分数排序，优先清理分数高的
      candidates.sort((a, b) => b.score - a.score);
      
      // 清理直到达到目标大小
      const targetSize = CACHE_CONFIG.MAX_CACHE_SIZE * 0.6; // 清理到60%
      let currentSize = cacheStats.totalSize;
      let cleanedCount = 0;
      
      for (const candidate of candidates) {
        if (currentSize <= targetSize) break;
        
        wx.removeStorageSync(candidate.key);
        this.removeCacheKey(candidate.key);
        currentSize -= candidate.size;
        cleanedCount++;
      }
      
      // 更新统计
      cacheStats.totalSize = currentSize;
      cacheStats.entryCount -= cleanedCount;
      cacheStats.cleanupCount++;
      cacheStats.lastCleanup = Date.now();
      this.saveStats();
      
      console.log(`智能清理完成，清理了${cleanedCount}个缓存项`);
    } catch (error) {
      console.error('智能清理失败:', error);
    }
  },

  /**
   * 启动自动清理定时器
   */
  startAutoCleanup() {
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
    }
    
    cleanupTimer = setInterval(() => {
      this.clearExpiredCache();
      
      // 检查是否需要智能清理
      if (cacheStats.totalSize > CACHE_CONFIG.MAX_CACHE_SIZE * CACHE_CONFIG.STORAGE_QUOTA_WARNING ||
          cacheStats.entryCount > CACHE_CONFIG.MAX_CACHE_ENTRIES * CACHE_CONFIG.STORAGE_QUOTA_WARNING) {
        this.smartCleanup();
      }
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  },

  /**
   * 停止自动清理
   */
  stopAutoCleanup() {
    if (cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  },

  /**
   * 清理过期缓存
   */
  clearExpiredCache() {
    try {
      const keys = this.getCacheKeys();
      const now = Date.now();
      let cleanedCount = 0;
      
      keys.forEach(key => {
        try {
          const cacheData = wx.getStorageSync(key);
          if (cacheData && cacheData.expire && cacheData.expire < now) {
            wx.removeStorageSync(key);
            this.removeCacheKey(key);
            
            if (cacheData.size) {
              cacheStats.totalSize -= cacheData.size;
              cacheStats.entryCount--;
            }
            cleanedCount++;
          }
        } catch (error) {
          // 清理读取失败的键
          wx.removeStorageSync(key);
          this.removeCacheKey(key);
        }
      });
      
      if (cleanedCount > 0) {
        this.saveStats();
        console.log(`清理了${cleanedCount}个过期缓存项`);
      }
    } catch (error) {
      console.error('清理过期缓存失败:', error);
    }
  },

  /**
   * 检查数据大小是否超限
   */
  checkSizeLimit(data) {
    const dataSize = JSON.stringify(data).length * 2;
    return cacheStats.totalSize + dataSize <= CACHE_CONFIG.MAX_CACHE_SIZE && 
           cacheStats.entryCount < CACHE_CONFIG.MAX_CACHE_ENTRIES;
  },

  /**
   * 生成完整的缓存键名
   */
  getFullKey(key) {
    return `${CACHE_PREFIX}${key}`;
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
        wx.setStorageSync(KEYS_LIST_KEY, keys);
      }
    } catch (error) {
      console.error('添加缓存键失败:', error);
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
        wx.setStorageSync(KEYS_LIST_KEY, keys);
      }
    } catch (error) {
      console.error('移除缓存键失败:', error);
    }
  },

  /**
   * 获取所有缓存键
   * @returns {Array} - 缓存键列表
   */
  getCacheKeys() {
    try {
      return wx.getStorageSync(KEYS_LIST_KEY) || [];
    } catch (error) {
      console.error('获取缓存键失败:', error);
      return [];
    }
  },

  /**
   * 清空缓存键列表
   */
  clearCacheKeys() {
    try {
      wx.setStorageSync(KEYS_LIST_KEY, []);
    } catch (error) {
      console.error('清空缓存键列表失败:', error);
    }
  },

  /**
   * 获取缓存统计信息
   * @returns {Object} - 缓存统计信息
   */
  getCacheStats() {
    return {
      ...cacheStats,
      hitRate: cacheStats.hitCount + cacheStats.missCount > 0 
        ? (cacheStats.hitCount / (cacheStats.hitCount + cacheStats.missCount) * 100).toFixed(2) + '%'
        : '0%',
      sizeMB: (cacheStats.totalSize / (1024 * 1024)).toFixed(2) + 'MB',
      sizeUsage: ((cacheStats.totalSize / CACHE_CONFIG.MAX_CACHE_SIZE) * 100).toFixed(2) + '%',
      countUsage: ((cacheStats.entryCount / CACHE_CONFIG.MAX_CACHE_ENTRIES) * 100).toFixed(2) + '%'
    };
  },

  /**
   * 获取购物车商品列表
   * @returns {Array} - 购物车商品数组
   */
  getCartItems() {
    try {
      return wx.getStorageSync(CART_ITEMS_KEY) || [];
    } catch (error) {
      console.error('获取购物车数据失败:', error);
      return [];
    }
  },

  /**
   * 设置购物车商品列表
   * @param {Array} items - 购物车商品数组
   */
  setCartItems(items) {
    try {
      wx.setStorageSync(CART_ITEMS_KEY, items || []);
      return true;
    } catch (error) {
      console.error('保存购物车数据失败:', error);
      return false;
    }
  },

  /**
   * 清空购物车
   */
  clearCartItems() {
    try {
      wx.removeStorageSync(CART_ITEMS_KEY);
      return true;
    } catch (error) {
      console.error('清空购物车失败:', error);
      return false;
    }
  }
};

// 缓存API请求结果
const cacheApiResult = async (apiFunc, cacheKey, params = {}, expiration = CACHE_CONFIG.DEFAULT_EXPIRATION) => {
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

// 初始化缓存系统
cache.init();

// 导出工具函数
module.exports = {
  ...cache,
  // 添加兼容性方法
  get: cache.getCache,
  set: cache.setCache,
  remove: cache.removeCache,
  clear: cache.clearAllCache,
  cacheApiResult,
  CACHE_CONFIG
}; 