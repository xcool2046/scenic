/**
 * 优惠券工具类
 * 提供优惠券的管理、验证和使用功能
 */

class CouponManager {
  constructor() {
    this.storageKey = 'userCoupons';
    this.pointsKey = 'userPoints';
  }

  /**
   * 获取用户优惠券列表
   */
  getUserCoupons() {
    try {
      const coupons = wx.getStorageSync(this.storageKey) || [];
      return coupons.map(coupon => ({
        ...coupon,
        isExpired: this.isCouponExpired(coupon.expireTime)
      }));
    } catch (error) {
      console.error('获取用户优惠券失败:', error);
      return [];
    }
  }

  /**
   * 保存用户优惠券
   */
  saveUserCoupons(coupons) {
    try {
      wx.setStorageSync(this.storageKey, coupons);
      return true;
    } catch (error) {
      console.error('保存用户优惠券失败:', error);
      return false;
    }
  }

  /**
   * 领取优惠券
   */
  claimCoupon(coupon, userId = 'user123') {
    return new Promise((resolve, reject) => {
      try {
        const userCoupons = this.getUserCoupons();
        
        // 检查是否已经领取过
        const hasReceived = userCoupons.some(uc => uc.couponId === coupon.id);
        if (hasReceived) {
          reject(new Error('已领取过该优惠券'));
          return;
        }

        // 创建用户优惠券
        const userCoupon = {
          id: Date.now().toString(),
          couponId: coupon.id,
          userId: userId,
          title: coupon.title,
          description: coupon.description,
          discount: coupon.discount,
          minAmount: coupon.minAmount,
          type: coupon.type,
          status: 'unused', // unused, used, expired
          receiveTime: new Date().toISOString(),
          expireTime: this.calculateExpireTime(coupon.validDays),
          useConditions: coupon.useConditions || []
        };

        // 保存到用户优惠券列表
        const newUserCoupons = [...userCoupons, userCoupon];
        const saved = this.saveUserCoupons(newUserCoupons);
        
        if (saved) {
          resolve(userCoupon);
        } else {
          reject(new Error('保存优惠券失败'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 使用优惠券
   */
  useCoupon(userCouponId, orderAmount = 0) {
    return new Promise((resolve, reject) => {
      try {
        const userCoupons = this.getUserCoupons();
        const couponIndex = userCoupons.findIndex(uc => uc.id === userCouponId);
        
        if (couponIndex === -1) {
          reject(new Error('优惠券不存在'));
          return;
        }

        const coupon = userCoupons[couponIndex];

        // 验证优惠券状态
        if (coupon.status !== 'unused') {
          reject(new Error('优惠券已使用或已过期'));
          return;
        }

        // 验证是否过期
        if (this.isCouponExpired(coupon.expireTime)) {
          reject(new Error('优惠券已过期'));
          return;
        }

        // 验证使用条件
        if (coupon.minAmount > 0 && orderAmount < coupon.minAmount) {
          reject(new Error(`订单金额不满足最低使用条件(¥${coupon.minAmount})`));
          return;
        }

        // 标记为已使用
        userCoupons[couponIndex] = {
          ...coupon,
          status: 'used',
          useTime: new Date().toISOString(),
          orderAmount: orderAmount
        };

        const saved = this.saveUserCoupons(userCoupons);
        
        if (saved) {
          resolve({
            coupon: userCoupons[couponIndex],
            discountAmount: this.calculateDiscount(coupon, orderAmount)
          });
        } else {
          reject(new Error('使用优惠券失败'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 计算优惠金额
   */
  calculateDiscount(coupon, orderAmount) {
    if (typeof coupon.discount === 'number') {
      if (coupon.discount < 1) {
        // 折扣券 (如0.8表示8折)
        return orderAmount * (1 - coupon.discount);
      } else {
        // 减现券 (如20表示减20元)
        return Math.min(coupon.discount, orderAmount);
      }
    }
    return 0;
  }

  /**
   * 获取可用优惠券
   */
  getAvailableCoupons(orderAmount = 0, couponType = null) {
    const userCoupons = this.getUserCoupons();
    
    return userCoupons.filter(coupon => {
      // 必须是未使用状态
      if (coupon.status !== 'unused') return false;
      
      // 不能过期
      if (this.isCouponExpired(coupon.expireTime)) return false;
      
      // 满足最低使用金额
      if (coupon.minAmount > 0 && orderAmount < coupon.minAmount) return false;
      
      // 类型匹配
      if (couponType && coupon.type !== couponType) return false;
      
      return true;
    });
  }

  /**
   * 计算优惠券过期时间
   */
  calculateExpireTime(validDays) {
    const now = new Date();
    const expireDate = new Date(now.getTime() + validDays * 24 * 60 * 60 * 1000);
    return expireDate.toISOString();
  }

  /**
   * 检查优惠券是否过期
   */
  isCouponExpired(expireTime) {
    return new Date(expireTime) < new Date();
  }

  /**
   * 格式化时间显示
   */
  formatTime(timeStr) {
    const date = new Date(timeStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取优惠券类型标签
   */
  getCouponTypeLabel(type) {
    const typeMap = {
      'ticket': '门票',
      'food': '餐饮',
      'souvenir': '纪念品',
      'transport': '交通',
      'hotel': '住宿',
      'entertainment': '娱乐',
      'other': '其他'
    };
    return typeMap[type] || '通用';
  }

  /**
   * 获取优惠券状态标签
   */
  getCouponStatusLabel(status) {
    const statusMap = {
      'unused': '未使用',
      'used': '已使用',
      'expired': '已过期'
    };
    return statusMap[status] || '未知';
  }

  /**
   * 清理过期优惠券
   */
  cleanExpiredCoupons() {
    const userCoupons = this.getUserCoupons();
    const validCoupons = userCoupons.filter(coupon => {
      if (coupon.status === 'unused' && this.isCouponExpired(coupon.expireTime)) {
        // 将过期的未使用优惠券标记为过期
        coupon.status = 'expired';
      }
      return true;
    });
    
    this.saveUserCoupons(validCoupons);
    return validCoupons;
  }

  /**
   * 获取优惠券统计信息
   */
  getCouponStats() {
    const userCoupons = this.getUserCoupons();
    const stats = {
      total: userCoupons.length,
      unused: 0,
      used: 0,
      expired: 0,
      totalSaved: 0
    };

    userCoupons.forEach(coupon => {
      switch (coupon.status) {
        case 'unused':
          if (this.isCouponExpired(coupon.expireTime)) {
            stats.expired++;
          } else {
            stats.unused++;
          }
          break;
        case 'used':
          stats.used++;
          // 计算节省金额
          if (coupon.orderAmount) {
            stats.totalSaved += this.calculateDiscount(coupon, coupon.orderAmount);
          }
          break;
        case 'expired':
          stats.expired++;
          break;
      }
    });

    return stats;
  }
}

// 积分管理类
class PointsManager {
  constructor() {
    this.storageKey = 'userPoints';
    this.pointsHistoryKey = 'pointsHistory';
  }

  /**
   * 获取用户积分
   */
  getUserPoints() {
    try {
      return wx.getStorageSync(this.storageKey) || 0;
    } catch (error) {
      console.error('获取用户积分失败:', error);
      return 0;
    }
  }

  /**
   * 更新用户积分
   */
  updateUserPoints(points) {
    try {
      wx.setStorageSync(this.storageKey, Math.max(0, points));
      return true;
    } catch (error) {
      console.error('更新用户积分失败:', error);
      return false;
    }
  }

  /**
   * 增加积分
   */
  addPoints(points, reason = '获得积分') {
    return new Promise((resolve, reject) => {
      try {
        const currentPoints = this.getUserPoints();
        const newPoints = currentPoints + points;
        
        if (this.updateUserPoints(newPoints)) {
          // 记录积分历史
          this.addPointsHistory({
            type: 'earn',
            points: points,
            reason: reason,
            balance: newPoints,
            time: new Date().toISOString()
          });
          
          resolve(newPoints);
        } else {
          reject(new Error('更新积分失败'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 消费积分
   */
  spendPoints(points, reason = '消费积分') {
    return new Promise((resolve, reject) => {
      try {
        const currentPoints = this.getUserPoints();
        
        if (currentPoints < points) {
          reject(new Error('积分不足'));
          return;
        }

        const newPoints = currentPoints - points;
        
        if (this.updateUserPoints(newPoints)) {
          // 记录积分历史
          this.addPointsHistory({
            type: 'spend',
            points: points,
            reason: reason,
            balance: newPoints,
            time: new Date().toISOString()
          });
          
          resolve(newPoints);
        } else {
          reject(new Error('消费积分失败'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 积分兑换优惠券
   */
  exchangeCoupon(couponTemplate, pointsCost) {
    return new Promise(async (resolve, reject) => {
      try {
        // 检查积分是否充足
        const currentPoints = this.getUserPoints();
        if (currentPoints < pointsCost) {
          reject(new Error('积分不足'));
          return;
        }

        // 消费积分
        await this.spendPoints(pointsCost, `兑换${couponTemplate.title}`);

        // 生成优惠券
        const couponManager = new CouponManager();
        const userCoupon = await couponManager.claimCoupon(couponTemplate);

        resolve({
          coupon: userCoupon,
          remainingPoints: this.getUserPoints()
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取积分历史
   */
  getPointsHistory() {
    try {
      return wx.getStorageSync(this.pointsHistoryKey) || [];
    } catch (error) {
      console.error('获取积分历史失败:', error);
      return [];
    }
  }

  /**
   * 添加积分历史记录
   */
  addPointsHistory(record) {
    try {
      const history = this.getPointsHistory();
      history.unshift(record);
      
      // 只保留最近100条记录
      if (history.length > 100) {
        history.splice(100);
      }
      
      wx.setStorageSync(this.pointsHistoryKey, history);
    } catch (error) {
      console.error('添加积分历史失败:', error);
    }
  }
}

// 导出实例
const couponManager = new CouponManager();
const pointsManager = new PointsManager();

module.exports = {
  couponManager,
  pointsManager,
  CouponManager,
  PointsManager
};
