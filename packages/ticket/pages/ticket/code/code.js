Page({
  data: {
    ticketCode: '',
    ticketInfo: {},
    validTime: '',
    isExpired: false
  },
  
  onLoad(options) {
    // 获取票务信息
    const ticketId = options.id || '';
    
    if (ticketId) {
      this.loadTicketInfo(ticketId);
    } else {
      wx.showToast({
        title: '无效的票务ID',
        icon: 'error'
      });
    }
  },
  
  // 加载票务信息
  loadTicketInfo(ticketId) {
    // 模拟加载数据
    // 实际项目中应从服务器获取
    const mockTicket = {
      id: ticketId,
      name: '成人票',
      code: 'TK' + Math.random().toString().slice(2, 10),
      validDate: '2023年5月30日',
      validTime: '全天',
      price: '120.00',
      status: 'valid' // valid, used, expired
    };
    
    setTimeout(() => {
      this.setData({
        ticketInfo: mockTicket,
        ticketCode: mockTicket.code,
        validTime: mockTicket.validDate + ' ' + mockTicket.validTime,
        isExpired: mockTicket.status === 'expired'
      });
    }, 500);
  },
  
  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
}) 