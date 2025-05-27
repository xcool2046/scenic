/**
 * 交互反馈工具函数
 * 统一管理应用的各种交互反馈
 */

// 用于追踪Loading状态
let _isLoadingVisible = false;
let _loadingTimer = null;

// 获取页面Toast组件实例
const getToastComponent = () => {
  try {
    const pages = getCurrentPages();
    if (pages.length === 0) return null;
    
    const currentPage = pages[pages.length - 1];
    const toast = currentPage.selectComponent('#toast');
    return toast;
  } catch (e) {
    console.error('获取Toast组件失败', e);
    return null;
  }
};

// 获取页面Loading组件实例
const getLoadingComponent = () => {
  try {
    const pages = getCurrentPages();
    if (pages.length === 0) return null;
    
    const currentPage = pages[pages.length - 1];
    // 注意：组件选择器需要使用ID选择器或类选择器，例如 #loading
    const loading = currentPage.selectComponent('#loading');
    return loading;
  } catch (e) {
    console.error('获取Loading组件失败', e);
    return null;
  }
};

// 显示轻提示
const showToast = (text, icon = 'none', duration = 1500) => {
  if (!text) return;
  
  try {
    const toast = getToastComponent();
    if (toast) {
      // 使用自定义Toast组件
      toast.showToast({
        text: text,
        icon: icon === 'success' ? 'success' : 
              icon === 'error' ? 'error' : 
              icon === 'loading' ? 'loading' : 'none',
        duration: duration
      });
    } else {
      // 回退到系统Toast
      wx.showToast({
        title: text,
        icon: icon,
        duration: duration
      });
    }
  } catch (e) {
    console.error('显示Toast失败', e);
    // 最后保底方案，使用console输出信息
    console.log(`Toast内容: ${text}`);
  }
};

// 显示成功提示
const showSuccess = (text, duration = 1500) => {
  showToast(text, 'success', duration);
};

// 显示错误提示
const showError = (text, duration = 1500) => {
  showToast(text, 'error', duration);
};

// 显示加载提示
const showLoading = (text = '加载中', mask = true) => {
  // 清除已有的定时器，防止重复调用
  if (_loadingTimer) {
    clearTimeout(_loadingTimer);
    _loadingTimer = null;
  }
  
  _isLoadingVisible = true;
  
  try {
    const loading = getLoadingComponent();
    if (loading) {
      // 使用自定义Loading组件
      loading.setData({
        text: text,
        mask: mask,
        loading: true
      });
    } else {
      // 回退到系统Loading
      wx.showLoading({
        title: text,
        mask: mask
      });
    }
    
    // 设置一个安全超时，确保加载提示不会一直显示
    _loadingTimer = setTimeout(() => {
      if (_isLoadingVisible) {
        hideLoading();
        console.warn('加载提示超时自动关闭');
      }
    }, 15000); // 15秒超时
  } catch (e) {
    console.error('显示Loading失败', e);
  }
};

// 隐藏加载提示
const hideLoading = () => {
  // 清除定时器
  if (_loadingTimer) {
    clearTimeout(_loadingTimer);
    _loadingTimer = null;
  }
  
  _isLoadingVisible = false;
  
  try {
    const loading = getLoadingComponent();
    if (loading) {
      // 使用自定义Loading组件
      loading.setData({
        loading: false
      });
    } else {
      // 回退到系统Loading
      wx.hideLoading();
    }
  } catch (e) {
    console.error('隐藏Loading失败', e);
    // 强制使用系统API尝试再次隐藏
    try {
      wx.hideLoading();
    } catch (err) {
      console.error('强制隐藏Loading失败', err);
    }
  }
};

// 检查是否有加载提示在显示
const isLoadingVisible = () => {
  return _isLoadingVisible;
};

// 显示模态对话框
const showModal = (title, content, showCancel = true, successCallback, cancelCallback) => {
  wx.showModal({
    title: title,
    content: content,
    showCancel: showCancel,
    success: (res) => {
      if (res.confirm && typeof successCallback === 'function') {
        successCallback();
      } else if (res.cancel && typeof cancelCallback === 'function') {
        cancelCallback();
      }
    }
  });
};

// 显示操作菜单
const showActionSheet = (itemList, callback) => {
  wx.showActionSheet({
    itemList: itemList,
    success: (res) => {
      if (typeof callback === 'function') {
        callback(res.tapIndex);
      }
    }
  });
};

// 页面导航动画
const navigateTo = (url, animationType = 'slide') => {
  // 为了防止快速多次点击导致的多页面打开
  const pages = getCurrentPages();
  if (pages.length > 9) {
    showToast('页面层级过多，请返回后重试');
    return;
  }
  
  // 配置不同的动画类型
  let animation = {};
  switch (animationType) {
    case 'slide':
      animation = { duration: 300, timingFunc: 'ease' };
      break;
    case 'fade':
      animation = { duration: 400, timingFunc: 'ease-out' };
      break;
    case 'zoom':
      animation = { duration: 300, timingFunc: 'ease-in-out' };
      break;
    default:
      animation = { duration: 300, timingFunc: 'linear' };
  }
  
  wx.navigateTo({
    url: url,
    animationType: animationType,
    animationDuration: animation.duration,
    success: () => {},
    fail: (err) => {
      console.error('导航失败', err);
      showToast('页面跳转失败');
    }
  });
};

// 页面返回
const navigateBack = (delta = 1) => {
  wx.navigateBack({
    delta: delta
  });
};

// 重定向页面
const redirectTo = (url) => {
  wx.redirectTo({
    url: url
  });
};

// 下拉刷新动作结束
const stopPullDownRefresh = () => {
  wx.stopPullDownRefresh();
};

// 振动反馈
const vibrate = (type = 'short') => {
  if (type === 'short') {
    wx.vibrateShort();
  } else {
    wx.vibrateLong();
  }
};

// 导出工具函数
module.exports = {
  showToast,
  showSuccess,
  showError,
  showLoading,
  hideLoading,
  isLoadingVisible,
  showModal,
  showActionSheet,
  navigateTo,
  navigateBack,
  redirectTo,
  stopPullDownRefresh,
  vibrate
}; 