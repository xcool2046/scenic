// utils/config.js

/**
 * 景区小程序资源配置
 * 
 * 本地开发环境: 使用相对路径引用本地资源 (示例： "/assets/icons/xxx.png")
 * 生产环境: 可将资源上传至CDN，再将下面路径替换为CDN URL
 * 
 * 注意：tabBar图标必须使用本地资源，不可使用网络图片
 */

const config = {
  // 开发环境: 使用本地资源，生产环境: 可替换为CDN基础路径
  CDN_BASE: '/assets/',
  
  // CDN图标资源
  CDN_ICONS: {
    TOILET: 'https://img.icons8.com/color/96/000000/toilet.png',
    REST_AREA: 'https://img.icons8.com/color/96/000000/bench.png',
    FOOD: 'https://img.icons8.com/color/96/000000/restaurant.png',
    MEDICAL: 'https://img.icons8.com/color/96/000000/hospital.png',
    TRANSPORT: 'https://img.icons8.com/color/96/000000/bus.png',
    MORE: 'https://img.icons8.com/color/96/000000/more.png',
    TICKET: 'https://img.icons8.com/color/96/000000/ticket.png',  // 绿色电子门票图标
    MAP: 'https://img.icons8.com/color/96/000000/map.png'  // 绿色地图图标
  },
  
  // 图标资源
  ICONS: {
    // 底部导航图标 - 必须使用本地资源 (已在app.json中配置)
    HOME: '/assets/icons/home.png',
    HOME_SELECTED: '/assets/icons/home_selected.png',
    GUIDE: '/assets/icons/guide.png',
    GUIDE_SELECTED: '/assets/icons/guide_selected.png',
    TICKET: '/assets/icons/ticket.png',
    TICKET_SELECTED: '/assets/icons/ticket_selected.png',
    USER: '/assets/icons/user.png',
    USER_SELECTED: '/assets/icons/user_selected.png',
    
    // 首页图标
    TICKET_LARGE: '/assets/icons/home/ticket_large.png',
    MAP_LARGE: '/assets/icons/home/map_large.png',
    PARKING: '/assets/icons/home/parking.png',
    SCAN: '/assets/icons/home/scan.png',
    SOS: '/assets/icons/home/sos.png',
    ROUTES: '/assets/icons/home/routes.png',
    TOILET: '/assets/icons/home/toilet.png',
    FOOD: '/assets/icons/home/food.png',
    REST: '/assets/icons/home/rest.png',
    MEDICAL: '/assets/icons/home/medical.png',
    BUS: '/assets/icons/home/bus.png',
    MORE: '/assets/icons/home/more.png',
    
    // 导览页图标
    SORT: '/assets/icons/guide/sort.png',
    LOCATION: '/assets/icons/guide/location.png',
    TIME: '/assets/icons/guide/time.png',
    ROUTE: '/assets/icons/guide/route.png',
    ARROW_RIGHT: '/assets/icons/guide/arrow_right.png',
    
    // 票务页图标
    ARROW_LEFT: '/assets/icons/ticket/arrow_left.png',
    CHECKED: '/assets/icons/ticket/checked.png',
    EMPTY_ORDER: '/assets/icons/ticket/empty_order.png',
    
    // 用户页图标
    PENDING: '/assets/icons/user/pending.png',
    USED: '/assets/icons/user/used.png',
    REFUND: '/assets/icons/user/refund.png',
    FAVORITE: '/assets/icons/user/favorite.png',
    FEEDBACK: '/assets/icons/user/feedback.png',
    SETTINGS: '/assets/icons/user/settings.png',
    FAQ: '/assets/icons/user/faq.png',
    SERVICE: '/assets/icons/user/service.png',
    EMERGENCY: '/assets/icons/user/emergency.png',
    ABOUT: '/assets/icons/user/about.png',
    
    // 景点卡片图标
    DISTANCE: '/assets/icons/scenic/distance_icon.png',
    TIME_ICON: '/assets/icons/scenic/time_icon.png',
    HOT_TAG: '/assets/icons/scenic/hot_tag.png',
    
    // 底部功能按钮图标
    PARKING_BTN: '/assets/icons/buttons/parking_button.png',
    SCAN_BTN: '/assets/icons/buttons/scan_button.png',
    SOS_BTN: '/assets/icons/buttons/sos_button.png',
    ROUTE_BTN: '/assets/icons/buttons/route_button.png',
    
    // 电子门票和景区地图图标
    ETICKET: '/assets/icons/tickets/eticket_icon.png',
    MAP_ICON: '/assets/icons/tickets/map_icon_large.png',
    
    // 设施图标
    TOILET_ICON: '/assets/icons/facilities/toilet_icon.png',
    FOOD_ICON: '/assets/icons/facilities/food_icon.png',
    REST_ICON: '/assets/icons/facilities/rest_icon.png',
    MEDICAL_ICON: '/assets/icons/facilities/medical_icon.png',
    TRANSPORT_ICON: '/assets/icons/facilities/transport_icon.png',
    MORE_ICON: '/assets/icons/facilities/more_icon.png',
    
    // 活动和公告图标
    LECTURE_ICON: '/assets/icons/notices/lecture_icon.png',
    PERFORMANCE_ICON: '/assets/icons/notices/performance_icon.png',
    NOTICE_ICON: '/assets/icons/notices/notice_icon.png',
    ACTIVITY_ICON: '/assets/icons/activities/activity_icon.png',
    ANNOUNCEMENT_ICON: '/assets/icons/activities/announcement_icon.png',
    
    // 更新后的便利设施图标
    WC_ICON: '/assets/icons/home/toilet.png',  // 更直观的卫生间图标
    REST_AREA_ICON: '/assets/icons/facilities/rest_icon.png'  // 更直观的休息区图标
  },
  
  // 景区图片资源
  IMAGES: {
    BANNER: '/assets/images/banner.jpg',
    MAP_PREVIEW: '/assets/images/map_preview.jpg',
    
    // 景点图片
    SPOTS: [
      '/assets/images/spots/spot1.jpg',
      '/assets/images/spots/spot2.jpg',
      '/assets/images/spots/spot3.jpg',
      '/assets/images/spots/spot4.jpg'
    ],
    
    // 景区实景图片
    SCENIC_SPOTS: {
      LAKE: '/assets/images/scenic_spots/lake.jpg', // 松月湖
      OLD_TREES: '/assets/images/scenic_spots/old_trees.jpg', // 古樟园
      WATERFALL: '/assets/images/scenic_spots/waterfall.jpg' // 飞瀑溪
    },
    
    // 路线图片
    ROUTES: [
      '/assets/images/routes/route1.jpg',
      '/assets/images/routes/route2.jpg',
      '/assets/images/routes/route3.jpg'
    ],
    
    // 特定路线图片
    ROUTE_IMAGES: {
      CLASSIC: '/assets/images/routes/classic_route.jpg', // 经典全景游
      FAMILY: '/assets/images/routes/family_route.jpg', // 休闲亲子游
      PHOTO: '/assets/images/routes/photo_route.jpg' // 摄影精选线
    },
    
    // 服务卡片背景图片
    CARDS: {
      TICKET: '/assets/images/cards/ticket_card.jpg', // 电子门票卡片
      MAP: '/assets/images/cards/map_card.jpg' // 景区地图卡片
    }
  },

  // 图片资源优化配置
  IMAGE_OPTIMIZATION: {
    // 启用图片懒加载
    LAZY_LOAD: true,
    
    // 轮播图默认图片（小体积占位图）
    DEFAULT_BANNER: '/assets/images/default_banner.jpg',
    
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

module.exports = config; 