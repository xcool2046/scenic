Component({
  properties: {
    // 列表数据
    listData: {
      type: Array,
      value: []
    },
    // 每页条数
    pageSize: {
      type: Number,
      value: 10
    },
    // 是否正在加载
    loading: {
      type: Boolean,
      value: false
    },
    // 是否还有更多数据
    hasMore: {
      type: Boolean,
      value: true
    },
    // 是否开启下拉刷新
    enablePullDown: {
      type: Boolean,
      value: true
    },
    // 是否开启上拉加载更多
    enableLoadMore: {
      type: Boolean,
      value: true
    },
    // 下拉刷新提示文字
    refreshText: {
      type: String,
      value: "下拉刷新"
    },
    // 释放刷新提示文字
    releaseText: {
      type: String,
      value: "释放刷新"
    },
    // 正在刷新提示文字
    loadingText: {
      type: String,
      value: "正在刷新..."
    },
    // 加载更多提示文字
    loadMoreText: {
      type: String,
      value: "加载更多"
    },
    // 没有更多数据提示文字
    noMoreText: {
      type: String,
      value: "没有更多数据了"
    },
    // 空列表提示文字
    emptyText: {
      type: String,
      value: "暂无数据"
    },
    // 列表高度
    height: {
      type: String,
      value: "100vh"
    },
    // 底部安全区域高度
    bottomGap: {
      type: Number,
      value: 0
    }
  },

  data: {
    // 下拉状态：0-初始状态，1-下拉中，2-释放刷新，3-刷新中
    pullState: 0,
    // 触摸开始Y坐标
    startY: 0,
    // 下拉距离
    distance: 0,
    // 刷新临界值
    threshold: 60,
    // 是否正在上拉加载
    isLoadingMore: false,
    // 列表滚动到底部的距离阈值
    bottomThreshold: 50,
    // 组件高度
    componentHeight: 0
  },

  lifetimes: {
    attached() {
      // 获取组件高度
      const query = wx.createSelectorQuery().in(this);
      query.select('.refresh-list-container').boundingClientRect(rect => {
        if (rect) {
          this.setData({
            componentHeight: rect.height
          });
        }
      }).exec();
    }
  },

  methods: {
    // 触摸开始事件
    handleTouchStart(e) {
      if (!this.properties.enablePullDown || this.data.pullState === 3) return;
      
      // 记录触摸开始位置
      this.setData({
        startY: e.touches[0].clientY,
        pullState: 1
      });
    },

    // 触摸移动事件
    handleTouchMove(e) {
      if (!this.properties.enablePullDown || this.data.pullState === 3) return;
      
      const scrollTop = e.currentTarget.dataset.scrollTop || 0;
      // 只有在顶部才能下拉
      if (scrollTop > 0) return;
      
      const currentY = e.touches[0].clientY;
      const moveDistance = currentY - this.data.startY;
      
      // 下拉才触发
      if (moveDistance <= 0) {
        this.setData({
          distance: 0,
          pullState: 0
        });
        return;
      }
      
      // 计算下拉距离，使用递减函数让拉动有阻尼效果
      let distance = Math.min(moveDistance * 0.4, this.data.threshold * 2);
      
      // 更新状态
      this.setData({
        distance: distance,
        pullState: distance >= this.data.threshold ? 2 : 1
      });
    },

    // 触摸结束事件
    handleTouchEnd() {
      if (!this.properties.enablePullDown || this.data.pullState === 0 || this.data.pullState === 3) return;
      
      // 如果拉动距离超过阈值，触发刷新
      if (this.data.distance >= this.data.threshold) {
        this.setData({
          distance: this.data.threshold,
          pullState: 3
        });
        
        // 触发下拉刷新事件
        this.triggerEvent('refresh');
      } else {
        // 回弹
        this.setData({
          distance: 0,
          pullState: 0
        });
      }
    },

    // 列表滚动事件
    handleScroll(e) {
      this.triggerEvent('scroll', e.detail);
    },

    // 滚动到底部事件
    handleScrollToLower() {
      if (!this.properties.enableLoadMore || 
          this.data.isLoadingMore || 
          !this.properties.hasMore || 
          this.properties.loading) return;
      
      this.setData({
        isLoadingMore: true
      });
      
      // 触发加载更多事件
      this.triggerEvent('loadmore');
    },

    // 外部调用，结束下拉刷新
    finishPullDown() {
      this.setData({
        distance: 0,
        pullState: 0
      });
    },

    // 外部调用，结束上拉加载更多
    finishLoadMore() {
      this.setData({
        isLoadingMore: false
      });
    }
  }
}); 