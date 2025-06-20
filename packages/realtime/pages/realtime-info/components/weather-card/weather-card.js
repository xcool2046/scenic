const config = require('../../../../../../utils/config');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    weatherData: {
      type: Object,
      value: {}
    },
    forecastData: {
      type: Array,
      value: []
    },
    showForecast: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    expanded: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    toggleExpand() {
      this.setData({
        expanded: !this.data.expanded
      });
    },
    
    // 获取天气图标 - 使用统一配置
    getWeatherIcon(weatherText) {
      return config.getWeatherIcon(weatherText);
    }
  }
}); 