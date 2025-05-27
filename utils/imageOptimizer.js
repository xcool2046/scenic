/**
 * 图片资源优化工具
 * 提供WebP格式检测、图片优化和预加载功能
 */

const imageOptimizer = {
  // 检测环境是否支持webp
  checkWebpSupport() {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => { resolve(img.width > 0 && img.height > 0); };
        img.onerror = () => { resolve(false); };
        img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      } catch (e) {
        resolve(false);
      }
    });
  },

  // 获取最佳图片URL（自动选择webp或原格式）
  getOptimizedImageUrl(url) {
    // 如果已缓存了是否支持webp的结果，直接使用
    const supportWebp = wx.getStorageSync('supportWebp');
    
    if (supportWebp === '') {
      // 未缓存结果，检测并缓存
      this.checkWebpSupport().then(support => {
        wx.setStorageSync('supportWebp', support);
      });
      return url; // 首次检测返回原URL
    }
    
    if (supportWebp && !url.includes('.webp')) {
      // 替换图片URL为webp版本
      return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    
    return url;
  },
  
  // 预加载图片
  preloadImages(urls) {
    const promises = urls.map(url => {
      return new Promise((resolve, reject) => {
        const optimizedUrl = this.getOptimizedImageUrl(url);
        wx.getImageInfo({
          src: optimizedUrl,
          success: res => resolve(res),
          fail: err => reject(err)
        });
      });
    });
    return Promise.all(promises);
  },
  
  // 懒加载图片管理
  lazyLoader: {
    // 观察器实例
    observer: null,
    
    // 初始化懒加载
    init() {
      if (this.observer) return;
      
      // 创建观察器
      this.observer = wx.createIntersectionObserver();
      
      // 观察图片元素
      this.observer.relativeToViewport({
        bottom: 100, // 提前100px开始加载
        top: -50     // 向上偏移50px
      });
    },
    
    // 观察单个图片
    observe(selector, callback) {
      this.init();
      
      this.observer.observe(selector, (res) => {
        if (res.intersectionRatio > 0) { // 元素进入可视区域
          callback(res);
          this.observer.disconnect(); // 取消观察
        }
      });
    },
    
    // 销毁观察器
    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  },
  
  // 图片压缩
  compressImage(tempFilePath, quality = 80) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: tempFilePath,
        quality,
        success: res => resolve(res.tempFilePath),
        fail: err => reject(err)
      });
    });
  }
};

module.exports = imageOptimizer; 