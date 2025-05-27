// components/toast/toast.js
Component({
  properties: {
    // 显示的文字
    text: {
      type: String,
      value: ''
    },
    // 显示的图标类型：none/success/error/loading/custom
    icon: {
      type: String,
      value: 'none'
    },
    // 自定义图标的路径
    image: {
      type: String,
      value: ''
    },
    // 提示显示的时长(ms)
    duration: {
      type: Number,
      value: 1500
    },
    // 是否显示遮罩
    mask: {
      type: Boolean,
      value: false
    },
    // 是否显示
    show: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          this.startHideTimer();
        } else {
          this.clearHideTimer();
        }
      }
    },
    // 提示的位置：top/center/bottom
    position: {
      type: String,
      value: 'center'
    }
  },

  data: {
    timer: null
  },

  lifetimes: {
    detached() {
      this.clearHideTimer();
    }
  },

  methods: {
    // 显示Toast
    showToast(options = {}) {
      // 合并配置
      const config = Object.assign({}, {
        text: '',
        icon: 'none',
        image: '',
        duration: 1500,
        mask: false,
        position: 'center'
      }, options);
      
      this.clearHideTimer();
      
      this.setData({
        text: config.text,
        icon: config.icon,
        image: config.image,
        duration: config.duration,
        mask: config.mask,
        position: config.position,
        show: true
      });
      
      return this;
    },
    
    // 隐藏Toast
    hideToast() {
      this.clearHideTimer();
      this.setData({ show: false });
      
      return this;
    },
    
    // 开始自动隐藏定时器
    startHideTimer() {
      this.clearHideTimer();
      
      if (this.data.duration > 0) {
        this.data.timer = setTimeout(() => {
          this.hideToast();
        }, this.data.duration);
      }
    },
    
    // 清除自动隐藏定时器
    clearHideTimer() {
      if (this.data.timer) {
        clearTimeout(this.data.timer);
        this.data.timer = null;
      }
    },
    
    // 点击遮罩
    onMaskTap() {
      this.triggerEvent('maskClick');
    }
  }
}); 