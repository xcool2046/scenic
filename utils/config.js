// utils/config.js

/**
 * 景区小程序资源配置
 * 
 * 本地开发环境: 使用相对路径引用本地资源 (示例： "/assets/icons/xxx.png")
 * 生产环境: 可将资源上传至CDN，再将下面路径替换为CDN URL
 * 
 * 注意：tabBar图标必须使用本地资源，不可使用网络图片
 */

const env = require('./env');

// 获取资源基础路径
const getResourceBase = () => {
  return env.getCdnBase();
};

// 构建资源路径
const buildResourcePath = (relativePath) => {
  const base = getResourceBase();
  return base + relativePath.replace(/^\//, '');
};

const config = {
  // 动态获取CDN基础路径
  get CDN_BASE() {
    return getResourceBase();
  },
  
  // CDN图标资源（仅在生产环境使用）
  CDN_ICONS: {
    // 基础设施图标
    TOILET: 'https://img.icons8.com/fluency/96/toilet-bowl.png',
    REST_AREA: 'https://img.icons8.com/fluency/96/park-bench.png',
    FOOD: 'https://img.icons8.com/fluency/96/restaurant.png',
    MEDICAL: 'https://img.icons8.com/fluency/96/hospital.png',
    TRANSPORT: 'https://img.icons8.com/fluency/96/bus.png',
    MORE: 'https://img.icons8.com/fluency/96/more.png',
    TICKET: 'https://img.icons8.com/fluency/96/ticket.png',
    MAP: 'https://img.icons8.com/fluency/96/map.png',
    PARKING: 'https://img.icons8.com/fluency/96/parking.png',
    SCAN: 'https://img.icons8.com/fluency/96/qr-code.png',
    SOS: 'https://img.icons8.com/fluency/96/emergency-exit.png',
    ROUTE: 'https://img.icons8.com/fluency/96/route.png',
    
    // 活动和公告图标
    NOTICE: 'https://img.icons8.com/fluency/96/announcement.png',
    LECTURE: 'https://img.icons8.com/fluency/96/classroom.png',
    PERFORMANCE: 'https://img.icons8.com/fluency/96/theater-mask.png',
    ACTIVITY: 'https://img.icons8.com/fluency/96/calendar.png',
    
    // 底部导航栏图标
    HOME: 'https://img.icons8.com/fluency/96/home.png',
    HOME_SELECTED: 'https://img.icons8.com/fluency/96/home-filled.png',
    GUIDE: 'https://img.icons8.com/fluency/96/map-marker.png',
    GUIDE_SELECTED: 'https://img.icons8.com/fluency/96/map-marker-filled.png',
    TICKET_SELECTED: 'https://img.icons8.com/fluency/96/ticket-filled.png',
    USER: 'https://img.icons8.com/fluency/96/user.png',
    USER_SELECTED: 'https://img.icons8.com/fluency/96/user-filled.png',
    
    // 门票相关图标
    ARROW_LEFT: 'https://img.icons8.com/fluency/96/left-arrow.png',
    CHECKED: 'https://img.icons8.com/fluency/96/checkmark.png',
    EMPTY_ORDER: 'https://img.icons8.com/fluency/96/empty-box.png',
    
    // 用户相关图标
    PENDING: 'https://img.icons8.com/fluency/96/clock.png',
    USED: 'https://img.icons8.com/fluency/96/checked.png',
    REFUND: 'https://img.icons8.com/fluency/96/refund.png',
    FAVORITE: 'https://img.icons8.com/fluency/96/heart.png',
    FEEDBACK: 'https://img.icons8.com/fluency/96/feedback.png',
    SETTINGS: 'https://img.icons8.com/fluency/96/settings.png',
    FAQ: 'https://img.icons8.com/fluency/96/help.png',
    SERVICE: 'https://img.icons8.com/fluency/96/customer-service.png',
    EMERGENCY: 'https://img.icons8.com/fluency/96/emergency-exit.png',
    ABOUT: 'https://img.icons8.com/fluency/96/info.png',
    
    // 景点卡片图标
    DISTANCE: 'https://img.icons8.com/fluency/96/distance.png',
    TIME_ICON: 'https://img.icons8.com/fluency/96/time.png',
    HOT_TAG: 'https://img.icons8.com/fluency/96/fire.png',
    
    // 通用功能图标
    WARNING: 'https://img.icons8.com/fluency/96/warning-shield.png',
    TIP: 'https://img.icons8.com/fluency/96/info.png',
    PULL: 'https://img.icons8.com/fluency/96/refresh.png',
    NAVIGATE: 'https://img.icons8.com/fluency/96/navigation.png',
    LOADING: 'https://img.icons8.com/fluency/96/spinner-frame-1.png',
    PREVIEW: 'https://img.icons8.com/fluency/96/preview-pane.png',
    DOWNLOAD: 'https://img.icons8.com/fluency/96/download.png',
    ARROW: 'https://img.icons8.com/fluency/96/right-arrow.png',
    ARROW_RIGHT: 'https://img.icons8.com/fluency/96/right-arrow.png',
    LOCATION: 'https://img.icons8.com/fluency/96/location.png',
    
    // 评分和收藏图标
    HEART: 'https://img.icons8.com/fluency/96/heart.png',
    HEART_FILLED: 'https://img.icons8.com/fluency/96/heart-filled.png',
    STAR: 'https://img.icons8.com/fluency/96/star.png',
    STAR_FILLED: 'https://img.icons8.com/fluency/96/star-filled.png',
    STAR_HALF: 'https://img.icons8.com/fluency/96/star-half-empty.png',
    
    // 天气图标完整映射
    WEATHER_SUNNY: 'https://img.icons8.com/fluency/96/sun.png',
    WEATHER_CLOUDY: 'https://img.icons8.com/fluency/96/partly-cloudy-day.png',
    WEATHER_OVERCAST: 'https://img.icons8.com/fluency/96/clouds.png',
    WEATHER_LIGHT_RAIN: 'https://img.icons8.com/fluency/96/light-rain.png',
    WEATHER_MODERATE_RAIN: 'https://img.icons8.com/fluency/96/rain.png',
    WEATHER_HEAVY_RAIN: 'https://img.icons8.com/fluency/96/heavy-rain.png',
    WEATHER_THUNDERSTORM: 'https://img.icons8.com/fluency/96/storm.png',
    WEATHER_LIGHT_SNOW: 'https://img.icons8.com/fluency/96/light-snow.png',
    WEATHER_MODERATE_SNOW: 'https://img.icons8.com/fluency/96/snow.png',
    WEATHER_HEAVY_SNOW: 'https://img.icons8.com/fluency/96/blizzard.png',
    WEATHER_UNKNOWN: 'https://img.icons8.com/fluency/96/question-mark.png',
    
    // 地图标记图标
    MARKER_SCENIC: 'https://img.icons8.com/fluency/96/mountain.png',
    MARKER_ENTRANCE: 'https://img.icons8.com/fluency/96/entrance.png',
    MARKER_FACILITY: 'https://img.icons8.com/fluency/96/building.png',
    MARKER_FOOD: 'https://img.icons8.com/fluency/96/restaurant.png',
    MARKER_DEFAULT: 'https://img.icons8.com/fluency/96/marker.png',
    USER_LOCATION: 'https://img.icons8.com/fluency/96/user-location.png',
    
    // 附近设施图标
    RESTAURANT: 'https://img.icons8.com/fluency/96/restaurant.png',
    CAFE: 'https://img.icons8.com/fluency/96/cafe.png',
    FOOD_STALL: 'https://img.icons8.com/fluency/96/food-truck.png',
    REST: 'https://img.icons8.com/fluency/96/bench.png',
    PAVILION: 'https://img.icons8.com/fluency/96/gazebo.png',
    FIRST_AID: 'https://img.icons8.com/fluency/96/first-aid-kit.png',
    
    // 用户头像
    DEFAULT_AVATAR: 'https://img.icons8.com/fluency/96/user-male-circle.png'
  },
  
  // CDN轮播图资源
  CDN_BANNERS: {
    SCENIC_1: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    SCENIC_2: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    SCENIC_3: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    ACTIVITY_1: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80',
    ACTIVITY_2: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=750&q=80'
  },
  
  // 图标资源
  ICONS: {
    // 底部导航栏图标 - 使用CDN资源
    get HOME() { return config.CDN_ICONS.HOME; },
    get HOME_SELECTED() { return config.CDN_ICONS.HOME_SELECTED; },
    get GUIDE() { return config.CDN_ICONS.GUIDE; },
    get GUIDE_SELECTED() { return config.CDN_ICONS.GUIDE_SELECTED; },
    get TICKET() { return config.CDN_ICONS.TICKET; },
    get TICKET_SELECTED() { return config.CDN_ICONS.TICKET_SELECTED; },
    get USER() { return config.CDN_ICONS.USER; },
    get USER_SELECTED() { return config.CDN_ICONS.USER_SELECTED; },
    
    // 首页功能图标 - 使用CDN资源
    get WEATHER() { return buildResourcePath('icons/home/weather.png'); },
    get CROWD() { return buildResourcePath('icons/home/crowd.png'); },
    get NOTICE() { return buildResourcePath('icons/home/notice.png'); },
    get ACTIVITY() { return buildResourcePath('icons/home/activity.png'); },
    get PARKING() { return config.CDN_ICONS.PARKING; },
    get SCAN() { return config.CDN_ICONS.SCAN; },
    get SOS() { return config.CDN_ICONS.SOS; },
    get ROUTE() { return config.CDN_ICONS.ROUTE; },
    get TOILET() { return config.CDN_ICONS.TOILET; },
    get FOOD() { return config.CDN_ICONS.FOOD; },
    get REST() { return config.CDN_ICONS.REST_AREA; },
    get MEDICAL() { return config.CDN_ICONS.MEDICAL; },
    get TRANSPORT() { return config.CDN_ICONS.TRANSPORT; },
    get MORE() { return config.CDN_ICONS.MORE; },
    
    // 导览页图标 - 动态路径
    get SORT() { return buildResourcePath('icons/guide/sort.png'); },
    get LOCATION() { return buildResourcePath('icons/guide/location.png'); },
    get TIME() { return buildResourcePath('icons/guide/time.png'); },
    get ARROW_RIGHT() { return buildResourcePath('icons/guide/arrow_right.png'); },
    
    // 门票相关图标
    get QR_CODE() { return buildResourcePath('icons/ticket/qr_code.png'); },
    get CALENDAR() { return buildResourcePath('icons/ticket/calendar.png'); },
    get CLOCK() { return buildResourcePath('icons/ticket/clock.png'); },
    get PERSON() { return buildResourcePath('icons/ticket/person.png'); },
    get PRICE() { return buildResourcePath('icons/ticket/price.png'); },
    get ARROW_LEFT() { return config.CDN_ICONS.ARROW_LEFT; },
    get CHECKED() { return config.CDN_ICONS.CHECKED; },
    get EMPTY_ORDER() { return config.CDN_ICONS.EMPTY_ORDER; },
    
    // 用户相关图标 - 动态路径
    get AVATAR() { return buildResourcePath('icons/user/avatar.png'); },
    get HELP() { return buildResourcePath('icons/user/help.png'); },
    get PENDING() { return config.CDN_ICONS.PENDING; },
    get USED() { return config.CDN_ICONS.USED; },
    get REFUND() { return config.CDN_ICONS.REFUND; },
    get FAVORITE() { return buildResourcePath('icons/user/favorite.png'); },
    get FEEDBACK() { return buildResourcePath('icons/user/feedback.png'); },
    get SETTINGS() { return buildResourcePath('icons/user/settings.png'); },
    get FAQ() { return buildResourcePath('icons/user/faq.png'); },
    get SERVICE() { return buildResourcePath('icons/user/service.png'); },
    get EMERGENCY() { return buildResourcePath('icons/user/emergency.png'); },
    get ABOUT() { return buildResourcePath('icons/user/about.png'); },
    get DEFAULT_AVATAR() { return buildResourcePath('icons/user/default_avatar.png'); },
    
    // 景点卡片图标 - 使用CDN资源
    get DISTANCE() { return config.CDN_ICONS.DISTANCE; },
    get TIME_ICON() { return config.CDN_ICONS.TIME_ICON; },
    get HOT_TAG() { return config.CDN_ICONS.HOT_TAG; },
    
    // 底部功能按钮图标 - 使用CDN资源
    get PARKING_BTN() { return config.CDN_ICONS.PARKING; },
    get SCAN_BTN() { return config.CDN_ICONS.SCAN; },
    get SOS_BTN() { return config.CDN_ICONS.SOS; },
    get ROUTE_BTN() { return config.CDN_ICONS.ROUTE; },
    
    // 电子门票和景区地图图标 - 使用CDN资源
    get ETICKET() { return config.CDN_ICONS.TICKET; },
    get MAP_ICON() { return config.CDN_ICONS.MAP; },
    
    // 设施图标 - 使用CDN资源
    get TOILET_ICON() { return config.CDN_ICONS.TOILET; },
    get FOOD_ICON() { return config.CDN_ICONS.FOOD; },
    get REST_ICON() { return config.CDN_ICONS.REST_AREA; },
    get MEDICAL_ICON() { return config.CDN_ICONS.MEDICAL; },
    get TRANSPORT_ICON() { return config.CDN_ICONS.TRANSPORT; },
    get MORE_ICON() { return config.CDN_ICONS.MORE; },
    
    // 活动和公告图标 - 使用CDN资源
    get LECTURE_ICON() { return config.CDN_ICONS.LECTURE; },
    get PERFORMANCE_ICON() { return config.CDN_ICONS.PERFORMANCE; },
    get NOTICE_ICON() { return config.CDN_ICONS.NOTICE; },
    get ACTIVITY_ICON() { return config.CDN_ICONS.ACTIVITY; },
    get ANNOUNCEMENT_ICON() { return config.CDN_ICONS.NOTICE; },
    
    // 通用图标 - 动态路径
    get BACK() { return buildResourcePath('icons/common/back.png'); },
    get SHARE() { return buildResourcePath('icons/common/share.png'); },
    get STAR() { return buildResourcePath('icons/common/star.png'); },
    get STAR_FILLED() { return buildResourcePath('icons/common/star_filled.png'); },
    get PHONE() { return buildResourcePath('icons/common/phone.png'); },
    get LOCATION_PIN() { return buildResourcePath('icons/common/location_pin.png'); },
    get CLOCK() { return buildResourcePath('icons/common/clock.png'); },
    get WEATHER_SUNNY() { return buildResourcePath('icons/common/weather_sunny.png'); },
    get WEATHER_CLOUDY() { return buildResourcePath('icons/common/weather_cloudy.png'); },
    get WEATHER_RAINY() { return buildResourcePath('icons/common/weather_rainy.png'); },
    get LOADING() { return buildResourcePath('icons/common/loading.gif'); },
    get ERROR() { return buildResourcePath('icons/common/error.png'); },
    get SUCCESS() { return buildResourcePath('icons/common/success.png'); },
    get WARNING() { return buildResourcePath('icons/common/warning.png'); },
    get INFO() { return buildResourcePath('icons/common/info.png'); },
    
    // 便利设施图标 - 使用CDN资源
    get WC_ICON() { return config.CDN_ICONS.TOILET; },  // 更直观的卫生间图标
    get REST_AREA_ICON() { return config.CDN_ICONS.REST_AREA; }  // 更直观的休息区图标
  },
  
  // 景区图片资源
  IMAGES: {
    // 首页轮播图 - 动态路径
    get BANNER_1() { return buildResourcePath('images/banners/banner1.jpg'); },
    get BANNER_2() { return buildResourcePath('images/banners/banner2.jpg'); },
    get BANNER_3() { return buildResourcePath('images/banners/banner3.jpg'); },
    
    // 景点图片 - 动态路径
    get SPOT_DEFAULT() { return buildResourcePath('images/spots/default.jpg'); },
    
    // 用户头像 - 动态路径
    get AVATAR_DEFAULT() { return buildResourcePath('images/user/avatar_default.png'); },
    
    // 背景图片 - 动态路径
    get HOME_BG() { return buildResourcePath('images/backgrounds/home_bg.jpg'); },
    get GUIDE_BG() { return buildResourcePath('images/backgrounds/guide_bg.jpg'); },
    get BANNER() { return buildResourcePath('images/banner.jpg'); },
    get MAP_PREVIEW() { return buildResourcePath('images/map_preview.jpg'); },
    
    // 景点图片 - 动态路径
    get SPOTS() {
      return [
        buildResourcePath('images/spots/spot1.jpg'),
        buildResourcePath('images/spots/spot2.jpg'),
        buildResourcePath('images/spots/spot3.jpg'),
        buildResourcePath('images/spots/spot4.jpg')
      ];
    },
    
    // 景区实景图片 - 动态路径
    SCENIC_SPOTS: {
      get LAKE() { return buildResourcePath('images/scenic_spots/lake.jpg'); }, // 松月湖
      get OLD_TREES() { return buildResourcePath('images/scenic_spots/old_trees.jpg'); }, // 古樟园
      get WATERFALL() { return buildResourcePath('images/scenic_spots/waterfall.jpg'); } // 飞瀑溪
    },
    
    // 路线图片 - 动态路径
    get ROUTES() {
      return [
        buildResourcePath('images/routes/route1.jpg'),
        buildResourcePath('images/routes/route2.jpg'),
        buildResourcePath('images/routes/route3.jpg')
      ];
    },
    
    // 特定路线图片 - 动态路径
    ROUTE_IMAGES: {
      get CLASSIC() { return buildResourcePath('images/routes/classic_route.jpg'); }, // 经典全景游
      get FAMILY() { return buildResourcePath('images/routes/family_route.jpg'); }, // 休闲亲子游
      get PHOTO() { return buildResourcePath('images/routes/photo_route.jpg'); } // 摄影精选线
    },
    
    // 服务卡片背景图片 - 动态路径
    CARDS: {
      get TICKET() { return buildResourcePath('images/cards/ticket_card.jpg'); }, // 电子门票卡片
      get MAP() { return buildResourcePath('images/cards/map_card.jpg'); } // 景区地图卡片
    }
  },

  // 图片资源优化配置
  IMAGE_OPTIMIZATION: {
    // 启用图片懒加载
    LAZY_LOAD: true,
    
    // 轮播图默认图片（小体积占位图）- 动态路径
    get DEFAULT_BANNER() { return buildResourcePath('images/default_banner.jpg'); },
    
    // 图片尺寸配置
    SIZES: {
      THUMBNAIL: '?imageView2/1/w/200/h/200', // 缩略图后缀
      MEDIUM: '?imageView2/1/w/400/h/400',    // 中等图片后缀
      BANNER: '?imageView2/1/w/750/h/360'     // 轮播图后缀
    }
  }
};

/**
 * 上传资源至CDN的步骤：
 * 1. 将assets目录下的所有资源上传至您的CDN服务
 * 2. 替换上面的CDN_BASE为您的CDN基础URL (例如: "https://cdn.example.com/scenic-app/")
 * 3. 对应修改各图片路径以匹配CDN目录结构
 * 
 * 注意：tabBar图标仍需保留在本地，app.json中的路径不受本配置影响
 */

// 天气图标映射表（统一管理所有天气相关图标）
const WEATHER_ICON_MAP = {
  '晴': 'https://img.icons8.com/fluency/96/sun.png',
  '多云': 'https://img.icons8.com/fluency/96/partly-cloudy-day.png',
  '阴': 'https://img.icons8.com/fluency/96/clouds.png',
  '小雨': 'https://img.icons8.com/fluency/96/light-rain.png',
  '中雨': 'https://img.icons8.com/fluency/96/rain.png',
  '大雨': 'https://img.icons8.com/fluency/96/heavy-rain.png',
  '暴雨': 'https://img.icons8.com/fluency/96/heavy-rain.png',
  '雷阵雨': 'https://img.icons8.com/fluency/96/storm.png',
  '阵雨': 'https://img.icons8.com/fluency/96/light-rain.png',
  '小雪': 'https://img.icons8.com/fluency/96/light-snow.png',
  '中雪': 'https://img.icons8.com/fluency/96/snow.png',
  '大雪': 'https://img.icons8.com/fluency/96/blizzard.png',
  '暴雪': 'https://img.icons8.com/fluency/96/blizzard.png',
  '雨夹雪': 'https://img.icons8.com/fluency/96/light-snow.png',
  '冻雨': 'https://img.icons8.com/fluency/96/light-rain.png',
  '浮尘': 'https://img.icons8.com/fluency/96/clouds.png',
  '扬沙': 'https://img.icons8.com/fluency/96/clouds.png',
  '沙尘暴': 'https://img.icons8.com/fluency/96/clouds.png',
  '强沙尘暴': 'https://img.icons8.com/fluency/96/clouds.png',
  '雾': 'https://img.icons8.com/fluency/96/clouds.png',
  '霾': 'https://img.icons8.com/fluency/96/clouds.png'
};

// 获取天气图标的统一方法
const getWeatherIcon = (weatherText) => {
  return WEATHER_ICON_MAP[weatherText] || 'https://img.icons8.com/fluency/96/question-mark.png';
};

// 导出配置和工具方法
module.exports = {
  ...config,
  buildResourcePath,
  WEATHER_ICON_MAP,
  getWeatherIcon
};