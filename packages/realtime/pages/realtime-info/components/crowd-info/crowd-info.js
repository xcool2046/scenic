Component({
  /**
   * 组件的属性列表
   */
  properties: {
    crowdInfo: {
      type: Object,
      value: {}
    },
    showTotalCount: {
      type: Boolean,
      value: true
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
    getLevelColor() {
      const level = this.properties.crowdInfo.level || '一般';
      return this.data.levelColors[level] || '#67C23A';
    }
  }
}); 