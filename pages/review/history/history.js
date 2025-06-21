// pages/review/history/history.js
const interaction = require('../../../utils/interaction');
const performance = require('../../../utils/performance');

Page({
  data: {
    // 评价历史列表
    reviewList: [],
    
    // 加载状态
    loading: true,
    hasMore: true,
    
    // 筛选状态
    filterRating: 0, // 0-全部，1-5表示筛选特定评分
    
    // 统计信息
    stats: {
      totalReviews: 0,
      averageRating: 0,
      bestRating: 0,
      worstRating: 0
    },
    
    // 动画状态
    animationStates: {
      headerVisible: false,
      statsVisible: false,
      listVisible: false
    }
  },

  async onLoad(options) {
    try {
      performance.mark('history_page_start');
      
      console.log('评价历史页面加载');
      
      // 初始化渐进式动画
      this.initProgressiveAnimation();
      
      // 先计算统计信息
      this.calculateStats();
      
      // 再加载评价历史
      await this.loadReviewHistory();
      
      performance.mark('history_page_loaded');
      performance.measure('history_page_load', 'history_page_start', 'history_page_loaded');
      
    } catch (error) {
      console.error('评价历史页面加载失败:', error);
      interaction.showToast('页面加载失败');
    }
  },

  /**
   * 初始化渐进式动画
   */
  initProgressiveAnimation() {
    // 立即显示列表，避免动画延迟导致的问题
    this.setData({
      'animationStates.headerVisible': true,
      'animationStates.statsVisible': true,
      'animationStates.listVisible': true
    });
  },

  /**
   * 加载评价历史
   */
  async loadReviewHistory() {
    try {
      this.setData({ loading: true });
      
      // 从本地存储获取评价历史
      const reviews = wx.getStorageSync('user_reviews') || [];
      
      // 按时间倒序排序
      const sortedReviews = reviews.sort((a, b) => {
        return new Date(b.submitTime) - new Date(a.submitTime);
      });
      
      // 格式化评价数据
      const formattedReviews = sortedReviews.map((review, index) => {
        try {
          const submitDate = new Date(review.submitTime);
          const avgRating = ((review.overallRating + review.serviceRating + review.environmentRating) / 3).toFixed(1);
          
          const formatted = {
            id: review.id || `review_${index}_${Date.now()}`,
            date: this.formatDate(submitDate),
            time: this.formatTime(submitDate),
            overallRating: review.overallRating || 0,
            serviceRating: review.serviceRating || 0,
            environmentRating: review.environmentRating || 0,
            averageRating: parseFloat(avgRating),
            textReview: review.textReview || '',
            tags: review.tags || [],
            spotId: review.spotId || 'default'
          };
          

          return formatted;
        } catch (error) {
          console.error(`格式化第${index + 1}条评价失败:`, error, review);
          return null;
        }
      }).filter(item => item !== null); // 过滤掉格式化失败的项
      
      this.setData({
        reviewList: formattedReviews,
        loading: false
      });
      

      
    } catch (error) {
      console.error('加载评价历史失败:', error);
      this.setData({ loading: false });
      interaction.showToast('加载失败');
    }
  },

  /**
   * 计算统计信息
   */
  calculateStats() {
    // 直接从本地存储获取原始数据进行统计
    const reviews = wx.getStorageSync('user_reviews') || [];
    
    if (reviews.length === 0) {
      this.setData({
        stats: {
          totalReviews: 0,
          averageRating: 0,
          bestRating: 0,
          worstRating: 0
        }
      });
      return;
    }
    
    const totalReviews = reviews.length;
    const ratings = reviews.map(review => {
      return ((review.overallRating + review.serviceRating + review.environmentRating) / 3);
    });
    
    const averageRating = (ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews).toFixed(1);
    const bestRating = Math.max(...ratings).toFixed(1);
    const worstRating = Math.min(...ratings).toFixed(1);
    
    this.setData({
      stats: {
        totalReviews,
        averageRating: parseFloat(averageRating),
        bestRating: parseFloat(bestRating),
        worstRating: parseFloat(worstRating)
      }
    });
    

  },

  /**
   * 格式化日期
   */
  formatDate(date) {
    try {
      if (!date || isNaN(date.getTime())) {
        return '未知日期';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}/${month}/${day}`;
    } catch (error) {
      console.error('日期格式化失败:', error, date);
      return '格式错误';
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    try {
      if (!date || isNaN(date.getTime())) {
        return '未知时间';
      }
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('时间格式化失败:', error, date);
      return '格式错误';
    }
  },

  /**
   * 筛选评分
   */
  onFilterRating(e) {
    const rating = parseInt(e.currentTarget.dataset.rating);
    
    this.setData({ filterRating: rating });
    
    // 重新加载并筛选数据
    this.loadReviewHistory().then(() => {
      if (rating > 0) {
        const filteredList = this.data.reviewList.filter(review => {
          return Math.ceil(review.averageRating) === rating;
        });
        this.setData({ reviewList: filteredList });
      }
    });
    
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  /**
   * 删除评价
   */
  onDeleteReview(e) {
    const reviewId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评价记录吗？',
      confirmText: '删除',
      confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          this.deleteReview(reviewId);
        }
      }
    });
  },

  /**
   * 执行删除评价
   */
  deleteReview(reviewId) {
    try {
      // 从本地存储中删除
      const reviews = wx.getStorageSync('user_reviews') || [];
      const updatedReviews = reviews.filter(review => review.id !== reviewId);
      wx.setStorageSync('user_reviews', updatedReviews);
      
      // 重新加载页面数据
      this.loadReviewHistory();
      this.calculateStats();
      
      interaction.showToast('删除成功', 'success');
      
      // 触觉反馈
      wx.vibrateShort({ type: 'heavy' });
      
    } catch (error) {
      console.error('删除评价失败:', error);
      interaction.showToast('删除失败');
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    try {
      await this.loadReviewHistory();
      this.calculateStats();
      wx.stopPullDownRefresh();
    } catch (error) {
      console.error('刷新失败:', error);
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 返回评价页面
   */
  onBackToReview() {
    wx.navigateBack();
  },

  /**
   * 新建评价
   */
  onNewReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  }
}); 