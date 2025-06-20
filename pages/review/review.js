// pages/review/review.js
const config = require('../../utils/config');
const interaction = require('../../utils/interaction');
const performance = require('../../utils/performance');
const { userManager } = require('../../utils/user');

Page({
  data: {
    config,
    
    // 核心评价数据（精简为3个维度）
    rating: {
      overall: 0,      // 总体满意度
      service: 0,      // 服务质量  
      environment: 0   // 环境设施
    },
    
    // 评价维度配置（Apple风格简洁设计）
    ratingDimensions: [
      {
        key: 'overall',
        name: '总体满意度',
        icon: '⭐',
        description: '整体体验感受'
      },
      {
        key: 'service', 
        name: '服务质量',
        icon: '👥',
        description: '服务态度与专业度'
      },
      {
        key: 'environment',
        name: '环境设施',
        icon: '🏢',
        description: '环境与设施完善度'
      }
    ],
    
    // 快捷评价标签（精选6个核心标签）
    quickTags: [
      '景色优美', '服务贴心', '设施完善',
      '交通便利', '值得推荐', '还会再来'
    ],
    selectedTags: [],
    
    // 详细评价文本
    reviewText: '',
    
    // 页面状态
    isSubmitting: false,
    
    // 用户信息
    userInfo: null,
    spotId: null,
    fromPage: null,
    
    // 动画状态
    animationStates: {
      headerVisible: false,
      ratingVisible: false,
      tagsVisible: false,
      textVisible: false,
      submitVisible: false
    }
  },

  async onLoad(options) {
    try {
      // 记录页面性能
      performance.mark('review_page_start');
      
      console.log('评价页面参数:', options);
      
      // 获取用户信息
      await this.loadUserInfo();
      
      // 处理页面参数
      if (options.spotId) {
        this.setData({ spotId: options.spotId });
      }
      
      if (options.from) {
        this.setData({ fromPage: options.from });
      }
      
      // 初始化渐进式动画
      this.initProgressiveAnimation();
      
      // 页面加载完成
      performance.mark('review_page_loaded');
      performance.measure('review_page_load', 'review_page_start', 'review_page_loaded');
      
    } catch (error) {
      console.error('评价页面加载失败:', error);
      interaction.showToast('页面加载失败');
    }
  },

  onShow() {
    wx.setNavigationBarTitle({
      title: '码上评价'
    });
  },

  /**
   * 初始化渐进式动画
   */
  initProgressiveAnimation() {
    const delays = [100, 200, 300, 400, 500];
    const states = ['headerVisible', 'ratingVisible', 'tagsVisible', 'textVisible', 'submitVisible'];
    
    states.forEach((state, index) => {
      setTimeout(() => {
        this.setData({
          [`animationStates.${state}`]: true
        });
      }, delays[index]);
    });
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      const userInfo = await userManager.getCurrentUser();
      this.setData({ userInfo });
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  /**
   * 星级评分点击处理（Apple风格弹性动画）
   */
  onRatingTap(e) {
    const { dimension, value } = e.currentTarget.dataset;
    const rating = { ...this.data.rating };
    rating[dimension] = parseInt(value);
    
    this.setData({ rating });
    
    console.log('星级评分更新:', rating);
    
    // Apple风格触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
  },

  /**
   * 快捷标签选择（Apple风格交互）
   */
  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag;
    let selectedTags = [...this.data.selectedTags];
    
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter(t => t !== tag);
    } else {
      selectedTags.push(tag);
    }
    
    this.setData({ selectedTags });
    
    console.log('快捷标签更新:', selectedTags);
    
    // Apple风格触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
  },

  /**
   * 评价文本输入
   */
  onReviewInput(e) {
    this.setData({
      reviewText: e.detail.value
    });
  },

  /**
   * 表单验证（精简版）
   */
  validateReview() {
    const { rating, reviewText, selectedTags } = this.data;
    
    // 检查是否至少有一个评分
    const hasRating = Object.values(rating).some(score => score > 0);
    if (!hasRating) {
      interaction.showToast('请至少给一个评分');
      return false;
    }
    
    // 检查是否有评价内容（文字或标签）
    if (!reviewText.trim() && selectedTags.length === 0) {
      interaction.showToast('请填写评价内容或选择标签');
      return false;
    }
    
    return true;
  },

  /**
   * 提交评价（Apple风格流畅体验）
   */
  async onSubmitReview() {
    try {
      // 验证表单
      if (!this.validateReview()) {
        return;
      }
      
      this.setData({ isSubmitting: true });
      
      // 构建提交数据
      const submitData = this.buildSubmitData();
      
      // 提交评价
      await this.submitReview(submitData);
      
      // Apple风格成功反馈
      interaction.showToast('评价提交成功', 'success');
      
      // 成功触觉反馈
      wx.vibrateShort({
        type: 'heavy'
      });
      
      // 延迟返回，给用户充分的成功反馈
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
    } catch (error) {
      console.error('提交评价失败:', error);
      interaction.showToast(error.message || '提交失败，请重试');
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  /**
   * 构建提交数据
   */
  buildSubmitData() {
    const { rating, reviewText, selectedTags, spotId, userInfo } = this.data;
    
    return {
      spotId: spotId || 'default',
      overallRating: rating.overall,
      serviceRating: rating.service,
      environmentRating: rating.environment,
      textReview: reviewText.trim(),
      tags: selectedTags,
      submitTime: new Date().toISOString(),
      userInfo: userInfo
    };
  },

  /**
   * 提交评价API
   */
  async submitReview(reviewData) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('提交评价数据:', reviewData);
    
    // 本地存储（开发环境）
    try {
      const existingReviews = wx.getStorageSync('user_reviews') || [];
      existingReviews.push({
        id: Date.now().toString(),
        ...reviewData
      });
      wx.setStorageSync('user_reviews', existingReviews);
    } catch (error) {
      console.error('保存评价到本地失败:', error);
    }
    
    // 生产环境API调用
    // return api.submitReview(reviewData);
  },

  /**
   * 重置表单（Apple风格确认）
   */
  onResetForm() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空当前的评价内容吗？',
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            rating: { overall: 0, service: 0, environment: 0 },
            selectedTags: [],
            reviewText: '',
            isSubmitting: false
          });
          
          // 重置成功触觉反馈
          wx.vibrateShort({
            type: 'light'
          });
        }
      }
    });
  },

  /**
   * 查看评价历史
   */
  viewReviewHistory() {
    try {
      const reviews = wx.getStorageSync('user_reviews') || [];
      
      if (reviews.length === 0) {
        interaction.showToast('暂无评价历史');
        return;
      }
      
      // 显示历史评价列表
      const reviewList = reviews.map((review, index) => {
        const date = new Date(review.submitTime).toLocaleDateString();
        const avgRating = ((review.overallRating + review.serviceRating + review.environmentRating) / 3).toFixed(1);
        return `${index + 1}. ${date} - 平均${avgRating}分`;
      }).join('\n');
      
      wx.showModal({
        title: '我的评价历史',
        content: reviewList,
        showCancel: false,
        confirmText: '知道了'
      });
      
    } catch (error) {
      console.error('获取评价历史失败:', error);
      interaction.showToast('获取历史失败');
    }
  },

  /**
   * 页面分享
   */
  onShareAppMessage() {
    return {
      title: '一起来评价景区吧',
      path: '/pages/review/review',
      imageUrl: '/assets/images/share-review.jpg'
    };
  }
}); 