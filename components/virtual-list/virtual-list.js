/**
 * 虚拟滚动列表组件
 * 仅渲染可视区域和缓冲区内容，提高长列表性能
 */
Component({
  properties: {
    dataList: {
      type: Array,
      value: [],
      observer: function(newVal) {
        this.initList(newVal);
      }
    },
    itemHeight: {
      type: Number,
      value: 100
    },
    bufferSize: {
      type: Number,
      value: 5
    }
  },
  
  data: {
    visibleData: [],
    startIndex: 0,
    viewportHeight: 0,
    scrollTop: 0,
    totalHeight: 0
  },
  
  lifetimes: {
    attached() {
      this.getViewportInfo();
    }
  },
  
  methods: {
    getViewportInfo() {
      const query = this.createSelectorQuery();
      query.select('.virtual-list-container').boundingClientRect();
      query.exec(res => {
        if (res[0]) {
          this.setData({
            viewportHeight: res[0].height
          }, () => {
            this.initList(this.data.dataList);
          });
        }
      });
    },
    
    initList(list) {
      if (!list.length) return;
      
      // 计算总高度
      const totalHeight = list.length * this.data.itemHeight;
      
      // 计算可视范围能显示的项目数
      const visibleCount = Math.ceil(this.data.viewportHeight / this.data.itemHeight);
      
      // 计算缓冲区大小
      const bufferCount = this.data.bufferSize;
      
      // 计算起始索引和结束索引
      const startIndex = 0;
      const endIndex = Math.min(startIndex + visibleCount + bufferCount, list.length);
      
      // 计算可视数据
      const visibleData = list.slice(startIndex, endIndex);
      
      this.setData({
        visibleData,
        startIndex,
        totalHeight
      });
    },
    
    onScroll(e) {
      const scrollTop = e.detail.scrollTop;
      
      // 计算当前滚动位置对应的起始索引
      const startIndex = Math.floor(scrollTop / this.data.itemHeight);
      
      // 如果起始索引变化不大，不更新
      if (Math.abs(startIndex - this.data.startIndex) < this.data.bufferSize / 2) {
        return;
      }
      
      // 计算可视范围能显示的项目数
      const visibleCount = Math.ceil(this.data.viewportHeight / this.data.itemHeight);
      
      // 计算缓冲区大小
      const bufferCount = this.data.bufferSize;
      
      // 计算结束索引
      const endIndex = Math.min(startIndex + visibleCount + bufferCount, this.data.dataList.length);
      
      // 计算可视数据
      const visibleData = this.data.dataList.slice(Math.max(0, startIndex - bufferCount), endIndex);
      
      this.setData({
        visibleData,
        startIndex: Math.max(0, startIndex - bufferCount),
        scrollTop
      });
    },
    
    // 重置滚动位置
    resetScroll() {
      this.setData({
        scrollTop: 0,
        startIndex: 0
      }, () => {
        this.initList(this.data.dataList);
      });
    },
    
    // 滚动到指定索引
    scrollToIndex(index) {
      const scrollTop = index * this.data.itemHeight;
      this.setData({ scrollTop });
    }
  }
}); 