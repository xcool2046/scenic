// components/loading/loading.js
Component({
  properties: {
    // 加载文字
    text: {
      type: String,
      value: '加载中...'
    },
    // 加载图标颜色
    color: {
      type: String,
      value: '#1AAD19'
    },
    // 加载图标大小
    size: {
      type: Number,
      value: 40
    },
    // 是否显示蒙层
    mask: {
      type: Boolean,
      value: false
    },
    // 是否正在加载
    loading: {
      type: Boolean,
      value: true
    },
    // 动画类型: spinner/dot
    type: {
      type: String,
      value: 'spinner'
    }
  },

  data: {
    // 组件内部数据
  },

  methods: {
    // 点击蒙层
    onTapMask() {
      // 触发点击事件
      this.triggerEvent('maskTap');
    }
  }
}); 