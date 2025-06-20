// pages/user/help/about.js
const config = require('../../../utils/config');

Page({
  data: {
    config
  },
  
  onLoad: function (options) {
    // 页面加载时的初始化逻辑
  },
  
  // 复制联系方式
  copyContactInfo: function(e) {
    const type = e.currentTarget.dataset.type;
    let content = '';
    
    if (type === 'email') {
      content = 'example@example.com';
    } else if (type === 'phone') {
      content = '400-123-4567';
    }
    
    wx.setClipboardData({
      data: content,
      success: function() {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  }
})