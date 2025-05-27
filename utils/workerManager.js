/**
 * Worker工作线程管理工具
 * 封装Worker创建、消息传递和回调处理
 */

const workerManager = {
  worker: null,
  callbacks: {},
  
  /**
   * 初始化Worker
   * @return {Worker} - Worker实例
   */
  init() {
    if (this.worker) return this.worker;
    
    // 创建Worker对象
    try {
      this.worker = wx.createWorker('workers/compute-worker.js');
      
      // 监听Worker消息
      this.worker.onMessage(res => {
        const { type, result, error } = res;
        
        if (error) {
          console.error('Worker错误:', error);
          if (this.callbacks['error']) {
            this.callbacks['error'](error);
          }
          return;
        }
        
        // 执行回调
        const callbackType = type.replace(/Result$/, ''); // 移除Result后缀
        if (this.callbacks[type]) {
          this.callbacks[type](result);
          delete this.callbacks[type];
        }
      });
      
      return this.worker;
    } catch (e) {
      console.error('创建Worker失败:', e);
      return null;
    }
  },
  
  /**
   * 处理大数据集
   * @param {Array} data - 需要处理的数据
   * @param {Function} callback - 处理完成回调
   * @param {Function} errorCallback - 错误回调
   */
  processData(data, callback, errorCallback) {
    if (!this.init()) {
      console.warn('Worker未初始化，在主线程中处理数据');
      // 降级到主线程处理
      try {
        // 这里应实现与worker中相同的处理逻辑
        const processed = data.map(item => ({...item, processed: true}));
        callback(processed);
      } catch (err) {
        if (errorCallback) errorCallback(err);
      }
      return;
    }
    
    this.callbacks['processDataResult'] = callback;
    if (errorCallback) this.callbacks['error'] = errorCallback;
    
    this.worker.postMessage({
      type: 'processData',
      data
    });
  },
  
  /**
   * 筛选数据
   * @param {Array} list - 数据列表
   * @param {Object} criteria - 筛选条件
   * @param {Function} callback - 筛选完成回调
   * @param {Function} errorCallback - 错误回调
   */
  filterData(list, criteria, callback, errorCallback) {
    if (!this.init()) {
      console.warn('Worker未初始化，在主线程中筛选数据');
      // 降级到主线程处理
      try {
        // 简单实现筛选逻辑
        const filtered = list.filter(item => {
          // 基本匹配逻辑
          for (const key in criteria) {
            if (item[key] !== criteria[key]) return false;
          }
          return true;
        });
        callback(filtered);
      } catch (err) {
        if (errorCallback) errorCallback(err);
      }
      return;
    }
    
    this.callbacks['filterDataResult'] = callback;
    if (errorCallback) this.callbacks['error'] = errorCallback;
    
    this.worker.postMessage({
      type: 'filterData',
      data: { list, criteria }
    });
  },
  
  /**
   * 计算最佳游览路线
   * @param {Array} spots - 景点列表
   * @param {Object} preferences - 用户偏好
   * @param {Function} callback - 计算完成回调
   * @param {Function} errorCallback - 错误回调
   */
  calculateRoute(spots, preferences, callback, errorCallback) {
    if (!this.init()) {
      console.warn('Worker未初始化，无法计算路线');
      if (errorCallback) {
        errorCallback(new Error('Worker未初始化'));
      }
      return;
    }
    
    this.callbacks['routeResult'] = callback;
    if (errorCallback) this.callbacks['error'] = errorCallback;
    
    this.worker.postMessage({
      type: 'calculateRoute',
      data: { spots, preferences }
    });
  },
  
  /**
   * 发送自定义任务到Worker
   * @param {String} type - 任务类型
   * @param {Object} data - 任务数据
   * @param {Function} callback - 任务完成回调
   * @param {Function} errorCallback - 错误回调
   */
  postTask(type, data, callback, errorCallback) {
    if (!this.init()) {
      console.warn(`Worker未初始化，无法执行任务: ${type}`);
      if (errorCallback) {
        errorCallback(new Error('Worker未初始化'));
      }
      return;
    }
    
    const resultType = `${type}Result`;
    this.callbacks[resultType] = callback;
    if (errorCallback) this.callbacks['error'] = errorCallback;
    
    this.worker.postMessage({
      type,
      data
    });
  },
  
  /**
   * 销毁Worker并清理资源
   */
  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.callbacks = {};
    }
  }
};

module.exports = workerManager; 