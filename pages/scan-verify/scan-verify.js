const { ticketManager } = require('../../utils/ticket');
const { userManager } = require('../../utils/user');
const api = require('../../utils/api');
const config = require('../../utils/config');
const interaction = require('../../utils/interaction');
const performance = require('../../utils/performance');

Page({
  data: {
    config,
    // 扫码结果
    scanResult: '',
    
    // 验证状态
    verifyStatus: 'verifying', // verifying, success, failed, expired, used
    verifyMessage: '正在验证...',
    
    // 票务信息
    ticketInfo: null,
    
    // 入园信息
    entryInfo: {
      entryTime: '',
      gateName: '',
      staffName: '系统验证'
    },
    
    // 页面状态
    loading: true,
    showRetry: false,
    
    // 验证结果图标
    statusIcons: {
      verifying: config.CDN_ICONS.LOADING,
      success: config.CDN_ICONS.SUCCESS,
      failed: config.CDN_ICONS.ERROR,
      expired: config.CDN_ICONS.WARNING,
      used: config.CDN_ICONS.WARNING
    },
    
    // 状态文案
    statusMessages: {
      verifying: '正在验证票务信息...',
      success: '验证成功，欢迎入园！',
      failed: '验证失败，请联系工作人员',
      expired: '票务已过期，请重新购买',
      used: '票务已使用，请勿重复入园'
    }
  },

  async onLoad(options) {
    try {
      // 记录页面性能
      performance.mark('scan_verify_start');
      
      console.log('扫码验证页面参数:', options);
      
      // 获取扫码结果
      const scanResult = options.result || '';
      if (!scanResult) {
        this.handleVerifyError('未获取到扫码结果');
        return;
      }
      
      this.setData({ scanResult });
      
      // 开始验证
      await this.verifyTicket(scanResult);
      
    } catch (error) {
      console.error('扫码验证页面加载失败:', error);
      this.handleVerifyError('页面加载失败');
    }
  },

  /**
   * 验证票务信息
   */
  async verifyTicket(scanResult) {
    try {
      // 显示验证状态
      this.setData({
        verifyStatus: 'verifying',
        verifyMessage: this.data.statusMessages.verifying,
        loading: true
      });

      // 调用票务验证API
      const verifyResult = await ticketManager.validateTicketCode(scanResult);
      
      if (verifyResult.success) {
        // 验证成功
        await this.handleVerifySuccess(verifyResult);
      } else {
        // 验证失败
        this.handleVerifyFailure(verifyResult);
      }
      
    } catch (error) {
      console.error('票务验证失败:', error);
      this.handleVerifyError(error.message || '验证服务异常');
    }
  },

  /**
   * 处理验证成功
   */
  async handleVerifySuccess(verifyResult) {
    try {
      const ticketInfo = verifyResult.ticket;
      const now = new Date();
      
      // 检查票务状态
      if (ticketInfo.status === 'used') {
        this.setData({
          verifyStatus: 'used',
          verifyMessage: this.data.statusMessages.used,
          ticketInfo,
          loading: false,
          showRetry: false
        });
        return;
      }
      
      if (ticketInfo.status === 'expired') {
        this.setData({
          verifyStatus: 'expired',
          verifyMessage: this.data.statusMessages.expired,
          ticketInfo,
          loading: false,
          showRetry: false
        });
        return;
      }
      
      // 票务有效，记录入园信息
      const entryInfo = {
        entryTime: this.formatTime(now),
        gateName: '主入口', // 可以根据扫码设备位置动态设置
        staffName: '系统验证'
      };
      
      // 更新票务状态为已使用
      await ticketManager.updateTicketStatus(ticketInfo.id, 'used', {
        entryTime: now.toISOString(),
        entryGate: entryInfo.gateName
      });
      
      // 显示验证成功
      this.setData({
        verifyStatus: 'success',
        verifyMessage: this.data.statusMessages.success,
        ticketInfo,
        entryInfo,
        loading: false,
        showRetry: false
      });
      
      // 记录性能
      performance.mark('scan_verify_success');
      performance.measure('scan_verify_duration', 'scan_verify_start', 'scan_verify_success');
      
      // 播放成功提示音
      wx.vibrateShort();
      
    } catch (error) {
      console.error('处理验证成功失败:', error);
      this.handleVerifyError('入园记录更新失败');
    }
  },

  /**
   * 处理验证失败
   */
  handleVerifyFailure(verifyResult) {
    const errorCode = verifyResult.code;
    let status = 'failed';
    let message = this.data.statusMessages.failed;
    
    // 根据错误码设置具体状态
    switch (errorCode) {
      case 'TICKET_EXPIRED':
        status = 'expired';
        message = this.data.statusMessages.expired;
        break;
      case 'TICKET_USED':
        status = 'used';
        message = this.data.statusMessages.used;
        break;
      case 'INVALID_FORMAT':
        message = '二维码格式无效';
        break;
      case 'TICKET_NOT_FOUND':
        message = '票务信息不存在';
        break;
      default:
        message = verifyResult.message || this.data.statusMessages.failed;
    }
    
    this.setData({
      verifyStatus: status,
      verifyMessage: message,
      ticketInfo: verifyResult.ticket || null,
      loading: false,
      showRetry: status === 'failed' // 只有失败时显示重试按钮
    });
  },

  /**
   * 处理验证错误
   */
  handleVerifyError(errorMessage) {
    this.setData({
      verifyStatus: 'failed',
      verifyMessage: errorMessage,
      loading: false,
      showRetry: true
    });
  },

  /**
   * 重试验证
   */
  onRetry() {
    if (this.data.scanResult) {
      this.verifyTicket(this.data.scanResult);
    } else {
      // 重新扫码
      this.onScanAgain();
    }
  },

  /**
   * 重新扫码
   */
  onScanAgain() {
    wx.scanCode({
      success: (res) => {
        console.log('重新扫码结果:', res);
        if (res.result) {
          this.setData({ scanResult: res.result });
          this.verifyTicket(res.result);
        }
      },
      fail: (err) => {
        console.error('重新扫码失败:', err);
        interaction.showToast('扫码失败，请重试');
      }
    });
  },

  /**
   * 联系客服
   */
  onContactService() {
    wx.showModal({
      title: '联系客服',
      content: '如需帮助，请拨打客服电话：400-123-4567',
      showCancel: true,
      cancelText: '取消',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: '400-123-4567',
            fail: () => {
              interaction.showToast('拨号失败');
            }
          });
        }
      }
    });
  },

  /**
   * 返回首页
   */
  onBackHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  /**
   * 查看票务详情
   */
  onViewTicketDetail() {
    if (this.data.ticketInfo && this.data.ticketInfo.id) {
              wx.navigateTo({
          url: `/pages/orders/detail?id=${this.data.ticketInfo.id}`
        });
    }
  },

  /**
   * 格式化时间
   */
  formatTime(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  /**
   * 分享功能
   */
  onShareAppMessage() {
    return {
      title: '景悦达智慧景区',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share-logo.jpg'
    };
  },

  /**
   * 页面隐藏
   */
  onHide() {
    // 清理定时器等资源
  },

  /**
   * 页面卸载
   */
  onUnload() {
    // 记录页面卸载性能
    performance.performanceMonitor?.recordPageUnload('scan-verify');
  }
}); 