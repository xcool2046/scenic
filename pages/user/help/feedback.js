const app = getApp();
const config = require('../../../utils/config');
const { userManager } = require('../../../utils/user');

Page({
  data: {
    // 图标资源
    icons: config.ICONS,
    
    // 反馈类型
    feedbackTypes: [
      {
        value: 'bug',
        label: '功能异常',
        icon: '/assets/icons/feedback/bug.png'
      },
      {
        value: 'suggestion',
        label: '功能建议',
        icon: '/assets/icons/feedback/suggestion.png'
      },
      {
        value: 'content',
        label: '内容问题',
        icon: '/assets/icons/feedback/content.png'
      },
      {
        value: 'other',
        label: '其他问题',
        icon: '/assets/icons/feedback/other.png'
      }
    ],
    
    // 表单数据
    selectedType: '',
    feedbackContent: '',
    contactInfo: '',
    uploadedImages: [],
    
    // 状态管理
    canSubmit: false,
    isSubmitting: false,
    
    // 历史反馈
    historyList: []
  },

  onLoad() {
    // 设置导航栏
    wx.setNavigationBarTitle({
      title: '意见反馈'
    });
    
    // 加载历史反馈
    this.loadFeedbackHistory();
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.vibrateShort({ type: 'light' });
    wx.navigateBack();
  },

  /**
   * 选择反馈类型
   */
  selectType(e) {
    const type = e.currentTarget.dataset.type;
    wx.vibrateShort({ type: 'light' });
    
    this.setData({
      selectedType: type
    }, () => {
      this.checkSubmitStatus();
    });
  },

  /**
   * 输入反馈内容
   */
  onContentInput(e) {
    this.setData({
      feedbackContent: e.detail.value
    }, () => {
      this.checkSubmitStatus();
    });
  },

  /**
   * 输入联系方式
   */
  onContactInput(e) {
    this.setData({
      contactInfo: e.detail.value
    });
  },

  /**
   * 选择图片
   */
  chooseImage() {
    wx.vibrateShort({ type: 'light' });
    
    const remainingCount = 3 - this.data.uploadedImages.length;
    
    wx.chooseMedia({
      count: remainingCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        this.uploadImages(res.tempFiles);
      },
      fail: (error) => {
        console.error('选择图片失败:', error);
        this.showToast('选择图片失败');
      }
    });
  },

  /**
   * 上传图片
   */
  async uploadImages(tempFiles) {
    this.showLoading('上传中...');
    
    try {
      const uploadPromises = tempFiles.map(file => this.uploadSingleImage(file));
      const uploadResults = await Promise.allSettled(uploadPromises);
      
      const successResults = uploadResults
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      if (successResults.length > 0) {
        this.setData({
          uploadedImages: [...this.data.uploadedImages, ...successResults]
        });
        this.showToast(`成功上传${successResults.length}张图片`);
      } else {
        this.showToast('图片上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      this.showToast('图片上传失败');
    } finally {
      this.hideLoading();
    }
  },

  /**
   * 上传单张图片
   */
  async uploadSingleImage(file) {
    try {
      // 检查云开发状态
      if (!app.globalData.cloudEnabled) {
        // 本地模式：直接使用临时路径
        return file.tempFilePath;
      }

      // 云开发模式：上传到云存储
      const cloudPath = `feedback/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
      
      const result = await wx.cloud.uploadFile({
        cloudPath,
        filePath: file.tempFilePath
      });

      return result.fileID;
    } catch (error) {
      console.error('单张图片上传失败:', error);
      throw error;
    }
  },

  /**
   * 删除图片
   */
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.vibrateShort({ type: 'light' });
    
    wx.showModal({
      title: '删除图片',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          const uploadedImages = [...this.data.uploadedImages];
          uploadedImages.splice(index, 1);
          this.setData({ uploadedImages });
        }
      }
    });
  },

  /**
   * 检查提交状态
   */
  checkSubmitStatus() {
    const { selectedType, feedbackContent } = this.data;
    const canSubmit = selectedType && feedbackContent.trim().length >= 10;
    
    this.setData({ canSubmit });
  },

  /**
   * 提交反馈
   */
  async submitFeedback() {
    if (!this.data.canSubmit || this.data.isSubmitting) {
      return;
    }

    // 添加触觉反馈
    wx.vibrateShort({ type: 'medium' });

    // 检查用户登录状态
    if (!userManager.checkLoginStatus()) {
      wx.showModal({
        title: '需要登录',
        content: '提交反馈需要先登录，是否现在登录？',
        success: (res) => {
          if (res.confirm) {
            // 跳转到用户页面进行登录
            wx.switchTab({
              url: '/pages/user/user'
            });
          }
        }
      });
      return;
    }

    this.setData({ isSubmitting: true });
    this.showLoading('提交中...');

    try {
      const feedbackData = {
        type: this.data.selectedType,
        content: this.data.feedbackContent.trim(),
        contact: this.data.contactInfo.trim(),
        images: this.data.uploadedImages,
        deviceInfo: wx.getSystemInfoSync(),
        submitTime: new Date().toISOString()
      };

      const result = await this.submitToCloud(feedbackData);

      if (result.success) {
        this.showToast('反馈提交成功');
        
        // 清空表单
        this.resetForm();
        
        // 重新加载历史反馈
        this.loadFeedbackHistory();
      } else {
        throw new Error(result.message || '提交失败');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      this.showToast(error.message || '提交失败，请重试');
    } finally {
      this.setData({ isSubmitting: false });
      this.hideLoading();
    }
  },

  /**
   * 提交到云端
   */
  async submitToCloud(feedbackData) {
    try {
      if (!app.globalData.cloudEnabled) {
        // 本地模式：模拟提交
        return await this.mockSubmit(feedbackData);
      }

      // 云开发模式：调用云函数
      const result = await wx.cloud.callFunction({
        name: 'submitFeedback',
        data: feedbackData
      });

      if (result.result && result.result.success) {
        return {
          success: true,
          data: result.result.data
        };
      } else {
        throw new Error(result.result?.message || '云端提交失败');
      }
    } catch (error) {
      console.error('云端提交失败:', error);
      // 降级到本地模拟
      return await this.mockSubmit(feedbackData);
    }
  },

  /**
   * 模拟提交（本地模式）
   */
  async mockSubmit(feedbackData) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 保存到本地存储
    const feedbackList = wx.getStorageSync('feedback_history') || [];
    const newFeedback = {
      id: 'feedback_' + Date.now(),
      ...feedbackData,
      status: 'pending',
      statusText: '待处理',
      createTime: this.formatTime(new Date())
    };
    
    feedbackList.unshift(newFeedback);
    wx.setStorageSync('feedback_history', feedbackList);
    
    return {
      success: true,
      data: newFeedback
    };
  },

  /**
   * 重置表单
   */
  resetForm() {
    this.setData({
      selectedType: '',
      feedbackContent: '',
      contactInfo: '',
      uploadedImages: [],
      canSubmit: false
    });
  },

  /**
   * 加载历史反馈
   */
  async loadFeedbackHistory() {
    try {
      if (!userManager.checkLoginStatus()) {
        return;
      }

      let historyList = [];

      if (app.globalData.cloudEnabled) {
        // 云开发模式：从云端加载
        const result = await this.loadFromCloud();
        if (result.success) {
          historyList = result.data;
        }
      } else {
        // 本地模式：从本地存储加载
        historyList = wx.getStorageSync('feedback_history') || [];
      }

      // 处理反馈类型名称
      historyList = historyList.map(item => ({
        ...item,
        typeName: this.getTypeName(item.type)
      }));

      this.setData({ historyList });
    } catch (error) {
      console.error('加载历史反馈失败:', error);
    }
  },

  /**
   * 从云端加载历史反馈
   */
  async loadFromCloud() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getFeedbackHistory',
        data: {
          userId: userManager.userInfo.id
        }
      });

      if (result.result && result.result.success) {
        return {
          success: true,
          data: result.result.data
        };
      } else {
        throw new Error('云端加载失败');
      }
    } catch (error) {
      console.error('云端加载历史反馈失败:', error);
      return {
        success: false,
        data: []
      };
    }
  },

  /**
   * 获取反馈类型名称
   */
  getTypeName(type) {
    const typeMap = {
      'bug': '功能异常',
      'suggestion': '功能建议',
      'content': '内容问题',
      'other': '其他问题'
    };
    return typeMap[type] || '其他问题';
  },

  /**
   * 查看反馈详情
   */
  viewFeedbackDetail(e) {
    const feedback = e.currentTarget.dataset.feedback;
    wx.vibrateShort({ type: 'light' });
    
    // 这里可以跳转到反馈详情页面，或者显示详情弹窗
    wx.showModal({
      title: feedback.typeName,
      content: `提交时间：${feedback.createTime}\n状态：${feedback.statusText}\n\n${feedback.content}`,
      showCancel: false,
      confirmText: '确定'
    });
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  },

  /**
   * 显示加载状态
   */
  showLoading(title = '加载中...') {
    const loading = this.selectComponent('#loading');
    if (loading) {
      loading.show(title);
    } else {
      wx.showLoading({ title, mask: true });
    }
  },

  /**
   * 隐藏加载状态
   */
  hideLoading() {
    const loading = this.selectComponent('#loading');
    if (loading) {
      loading.hide();
    } else {
      wx.hideLoading();
    }
  },

  /**
   * 显示提示信息
   */
  showToast(title, icon = 'none') {
    const toast = this.selectComponent('#toast');
    if (toast) {
      toast.show({ title, icon });
    } else {
      wx.showToast({ title, icon, duration: 2000 });
    }
  }
}); 