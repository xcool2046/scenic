Component({
  /**
   * 组件的属性列表
   */
  properties: {
    spotsData: {
      type: Array,
      value: []
    },
    updateTime: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    levelColors: {
      '舒适': '#1AAD19',
      '一般': '#67C23A',
      '较拥挤': '#E6A23C',
      '拥挤': '#F56C6C',
      '非常拥挤': '#CC0033'
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 点击景点，触发事件
    onSpotTap(e) {
      const spotId = e.currentTarget.dataset.id;
      const spot = this.properties.spotsData.find(s => s.id == spotId);
      if (spot) {
        this.triggerEvent('spotTap', { spot });
      }
    }
  }
}); 