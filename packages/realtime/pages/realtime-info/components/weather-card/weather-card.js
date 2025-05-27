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
    weatherIcons: {
      '晴': '/assets/icons/weather/sunny.png',
      '多云': '/assets/icons/weather/cloudy.png',
      '阴': '/assets/icons/weather/overcast.png',
      '小雨': '/assets/icons/weather/light_rain.png',
      '中雨': '/assets/icons/weather/moderate_rain.png',
      '大雨': '/assets/icons/weather/heavy_rain.png',
      '暴雨': '/assets/icons/weather/heavy_rain.png',
      '雷阵雨': '/assets/icons/weather/thunderstorm.png',
      '阵雨': '/assets/icons/weather/light_rain.png',
      '小雪': '/assets/icons/weather/light_snow.png',
      '中雪': '/assets/icons/weather/moderate_snow.png',
      '大雪': '/assets/icons/weather/heavy_snow.png',
      '暴雪': '/assets/icons/weather/heavy_snow.png',
      '雨夹雪': '/assets/icons/weather/light_snow.png',
      '冻雨': '/assets/icons/weather/light_rain.png',
      '浮尘': '/assets/icons/weather/cloudy.png',
      '扬沙': '/assets/icons/weather/cloudy.png',
      '沙尘暴': '/assets/icons/weather/cloudy.png',
      '强沙尘暴': '/assets/icons/weather/cloudy.png',
      '雾': '/assets/icons/weather/overcast.png',
      '霾': '/assets/icons/weather/overcast.png'
    },
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
    
    // 获取天气图标
    getWeatherIcon(weatherText) {
      return this.data.weatherIcons[weatherText] || '/assets/icons/weather/unknown.png';
    }
  }
}); 