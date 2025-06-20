/**
 * 评价系统管理模块
 * 处理评价提交、评价查询、评价统计等功能
 */

const env = require('./env');
const cache = require('./cache');
const { request } = require('./api');
const { userManager } = require('./user');

class ReviewManager {
  constructor() {
    this.reviews = [];
    this.reviewStats = {};
  }

  /**
   * 提交评价
   */
  async submitReview(reviewData) {
    try {
      console.log('提交评价:', reviewData);
      
      // 检查用户登录状态
      await userManager.requireLogin();
      
      // 验证评价数据
      this.validateReviewData(reviewData);
      
      if (env.shouldUseMock()) {
        // 开发环境模拟提交
        await this.simulateDelay(1000);
        
        const reviewId = 'review_' + Date.now();
        const review = {
          id: reviewId,
          ...reviewData,
          status: 'published',
          likes: 0,
          replies: [],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        };
        
        // 保存到本地存储
        this.saveReviewToLocal(review);
        
        return {
          success: true,
          reviewId,
          review
        };
      }

      // 生产环境API调用
      const result = await request({
        url: '/reviews/submit',
        method: 'POST',
        data: reviewData
      });
      
      return result;
    } catch (error) {
      console.error('提交评价失败:', error);
      throw error;
    }
  }

  /**
   * 获取评价列表
   */
  async getReviews(options = {}) {
    try {
      const {
        spotId = 'default',
        page = 1,
        pageSize = 20,
        sortBy = 'createTime',
        order = 'desc',
        ratingFilter = null
      } = options;
      
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        await this.simulateDelay(500);
        
        let reviews = this.getLocalReviews();
        
        // 筛选景点
        if (spotId !== 'default') {
          reviews = reviews.filter(review => review.spotId === spotId);
        }
        
        // 评分筛选
        if (ratingFilter) {
          reviews = reviews.filter(review => review.overallRating >= ratingFilter);
        }
        
        // 排序
        reviews.sort((a, b) => {
          if (order === 'desc') {
            return new Date(b[sortBy]) - new Date(a[sortBy]);
          } else {
            return new Date(a[sortBy]) - new Date(b[sortBy]);
          }
        });
        
        // 分页
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedReviews = reviews.slice(startIndex, endIndex);
        
        return {
          success: true,
          data: paginatedReviews,
          total: reviews.length,
          page,
          pageSize,
          hasMore: endIndex < reviews.length
        };
      }

      // 生产环境API调用
      const result = await request({
        url: '/reviews/list',
        method: 'GET',
        data: options
      });
      
      return result;
    } catch (error) {
      console.error('获取评价列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取评价统计信息
   */
  async getReviewStats(spotId = 'default') {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟统计数据
        await this.simulateDelay(300);
        
        const reviews = this.getLocalReviews().filter(
          review => spotId === 'default' || review.spotId === spotId
        );
        
        if (reviews.length === 0) {
          return {
            success: true,
            stats: {
              totalReviews: 0,
              averageRating: 0,
              ratingDistribution: [0, 0, 0, 0, 0],
              serviceRating: 0,
              environmentRating: 0,
              facilityRating: 0
            }
          };
        }
        
        const totalReviews = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
        const averageRating = totalRating / totalReviews;
        
        // 评分分布统计
        const ratingDistribution = [0, 0, 0, 0, 0];
        reviews.forEach(review => {
          const rating = Math.floor(review.overallRating);
          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating - 1]++;
          }
        });
        
        // 各维度平均评分
        const serviceRating = reviews.reduce((sum, review) => sum + review.serviceRating, 0) / totalReviews;
        const environmentRating = reviews.reduce((sum, review) => sum + review.environmentRating, 0) / totalReviews;
        const facilityRating = reviews.reduce((sum, review) => sum + review.facilityRating, 0) / totalReviews;
        
        return {
          success: true,
          stats: {
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
            serviceRating: Math.round(serviceRating * 10) / 10,
            environmentRating: Math.round(environmentRating * 10) / 10,
            facilityRating: Math.round(facilityRating * 10) / 10
          }
        };
      }

      // 生产环境API调用
      const result = await request({
        url: `/reviews/stats/${spotId}`,
        method: 'GET'
      });
      
      return result;
    } catch (error) {
      console.error('获取评价统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的评价记录
   */
  async getUserReviews(userId = null) {
    try {
      if (!userId) {
        const currentUser = await userManager.getCurrentUser();
        userId = currentUser.id;
      }
      
      if (env.shouldUseMock()) {
        // 开发环境从本地存储获取
        const allReviews = this.getLocalReviews();
        const userReviews = allReviews.filter(review => 
          review.userInfo && review.userInfo.id === userId
        );
        
        return {
          success: true,
          data: userReviews
        };
      }

      // 生产环境API调用
      const result = await request({
        url: `/reviews/user/${userId}`,
        method: 'GET'
      });
      
      return result;
    } catch (error) {
      console.error('获取用户评价失败:', error);
      throw error;
    }
  }

  /**
   * 点赞评价
   */
  async likeReview(reviewId) {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟点赞
        const reviews = this.getLocalReviews();
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);
        
        if (reviewIndex >= 0) {
          reviews[reviewIndex].likes = (reviews[reviewIndex].likes || 0) + 1;
          this.saveAllReviewsToLocal(reviews);
          
          return {
            success: true,
            likes: reviews[reviewIndex].likes
          };
        } else {
          throw new Error('评价不存在');
        }
      }

      // 生产环境API调用
      const result = await request({
        url: `/reviews/${reviewId}/like`,
        method: 'POST'
      });
      
      return result;
    } catch (error) {
      console.error('点赞评价失败:', error);
      throw error;
    }
  }

  /**
   * 回复评价
   */
  async replyToReview(reviewId, replyContent) {
    try {
      // 检查用户登录状态
      await userManager.requireLogin();
      
      const replyData = {
        reviewId,
        content: replyContent.trim(),
        createTime: new Date().toISOString()
      };
      
      if (env.shouldUseMock()) {
        // 开发环境模拟回复
        const reviews = this.getLocalReviews();
        const reviewIndex = reviews.findIndex(review => review.id === reviewId);
        
        if (reviewIndex >= 0) {
          const reply = {
            id: 'reply_' + Date.now(),
            ...replyData,
            userInfo: await userManager.getCurrentUser()
          };
          
          reviews[reviewIndex].replies = reviews[reviewIndex].replies || [];
          reviews[reviewIndex].replies.push(reply);
          
          this.saveAllReviewsToLocal(reviews);
          
          return {
            success: true,
            reply
          };
        } else {
          throw new Error('评价不存在');
        }
      }

      // 生产环境API调用
      const result = await request({
        url: `/reviews/${reviewId}/reply`,
        method: 'POST',
        data: replyData
      });
      
      return result;
    } catch (error) {
      console.error('回复评价失败:', error);
      throw error;
    }
  }

  /**
   * 验证评价数据
   */
  validateReviewData(reviewData) {
    if (!reviewData.overallRating || reviewData.overallRating < 1 || reviewData.overallRating > 5) {
      throw new Error('总体评分必须在1-5分之间');
    }
    
    if (!reviewData.textReview || reviewData.textReview.trim().length < 10) {
      throw new Error('评价内容至少需要10个字符');
    }
    
    if (reviewData.textReview.length > 500) {
      throw new Error('评价内容不能超过500个字符');
    }
    
    return true;
  }

  /**
   * 保存评价到本地存储
   */
  saveReviewToLocal(review) {
    try {
      const existingReviews = this.getLocalReviews();
      existingReviews.unshift(review); // 添加到开头
      
      // 限制本地存储数量
      if (existingReviews.length > 100) {
        existingReviews.splice(100);
      }
      
      wx.setStorageSync('user_reviews', existingReviews);
    } catch (error) {
      console.error('保存评价到本地失败:', error);
    }
  }

  /**
   * 保存所有评价到本地存储
   */
  saveAllReviewsToLocal(reviews) {
    try {
      wx.setStorageSync('user_reviews', reviews);
    } catch (error) {
      console.error('保存评价到本地失败:', error);
    }
  }

  /**
   * 从本地存储获取评价
   */
  getLocalReviews() {
    try {
      return wx.getStorageSync('user_reviews') || [];
    } catch (error) {
      console.error('从本地获取评价失败:', error);
      return [];
    }
  }

  /**
   * 模拟网络延迟
   */
  simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清除本地评价数据
   */
  clearLocalReviews() {
    try {
      wx.removeStorageSync('user_reviews');
    } catch (error) {
      console.error('清除本地评价数据失败:', error);
    }
  }
}

// 创建单例实例
const reviewManager = new ReviewManager();

module.exports = {
  reviewManager,
  ReviewManager
}; 