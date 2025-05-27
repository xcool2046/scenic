/**
 * CDN配置示例文件
 * 项目迁移到生产环境时，可参照此文件配置CDN资源
 */

const config = {
  // 生产环境: 替换为真实CDN基础路径
  CDN_BASE: 'https://cdn.example.com/scenic-app/',
  
  // 图标资源
  ICONS: {
    // 底部导航图标 - 必须使用本地资源 (已在app.json中配置)
    HOME: '/assets/icons/home.png',  // 这些仍然需要保留在本地
    HOME_SELECTED: '/assets/icons/home_selected.png',
    GUIDE: '/assets/icons/guide.png',
    GUIDE_SELECTED: '/assets/icons/guide_selected.png',
    TICKET: '/assets/icons/ticket.png',
    TICKET_SELECTED: '/assets/icons/ticket_selected.png',
    USER: '/assets/icons/user.png',
    USER_SELECTED: '/assets/icons/user_selected.png',
    
    // 首页图标 - 可使用CDN路径
    TICKET_LARGE: 'https://cdn.example.com/scenic-app/icons/home/ticket_large.png',
    MAP_LARGE: 'https://cdn.example.com/scenic-app/icons/home/map_large.png',
    PARKING: 'https://cdn.example.com/scenic-app/icons/home/parking.png',
    SCAN: 'https://cdn.example.com/scenic-app/icons/home/scan.png',
    SOS: 'https://cdn.example.com/scenic-app/icons/home/sos.png',
    ROUTES: 'https://cdn.example.com/scenic-app/icons/home/routes.png',
    TOILET: 'https://cdn.example.com/scenic-app/icons/home/toilet.png',
    FOOD: 'https://cdn.example.com/scenic-app/icons/home/food.png',
    REST: 'https://cdn.example.com/scenic-app/icons/home/rest.png',
    MEDICAL: 'https://cdn.example.com/scenic-app/icons/home/medical.png',
    BUS: 'https://cdn.example.com/scenic-app/icons/home/bus.png',
    MORE: 'https://cdn.example.com/scenic-app/icons/home/more.png',
    
    // 导览页图标
    SORT: 'https://cdn.example.com/scenic-app/icons/guide/sort.png',
    LOCATION: 'https://cdn.example.com/scenic-app/icons/guide/location.png',
    TIME: 'https://cdn.example.com/scenic-app/icons/guide/time.png',
    ROUTE: 'https://cdn.example.com/scenic-app/icons/guide/route.png',
    ARROW_RIGHT: 'https://cdn.example.com/scenic-app/icons/guide/arrow_right.png',
    
    // 票务页图标
    ARROW_LEFT: 'https://cdn.example.com/scenic-app/icons/ticket/arrow_left.png',
    CHECKED: 'https://cdn.example.com/scenic-app/icons/ticket/checked.png',
    EMPTY_ORDER: 'https://cdn.example.com/scenic-app/icons/ticket/empty_order.png',
    
    // 用户页图标
    PENDING: 'https://cdn.example.com/scenic-app/icons/user/pending.png',
    USED: 'https://cdn.example.com/scenic-app/icons/user/used.png',
    REFUND: 'https://cdn.example.com/scenic-app/icons/user/refund.png',
    FAVORITE: 'https://cdn.example.com/scenic-app/icons/user/favorite.png',
    FEEDBACK: 'https://cdn.example.com/scenic-app/icons/user/feedback.png',
    SETTINGS: 'https://cdn.example.com/scenic-app/icons/user/settings.png',
    FAQ: 'https://cdn.example.com/scenic-app/icons/user/faq.png',
    SERVICE: 'https://cdn.example.com/scenic-app/icons/user/service.png',
    EMERGENCY: 'https://cdn.example.com/scenic-app/icons/user/emergency.png',
    ABOUT: 'https://cdn.example.com/scenic-app/icons/user/about.png'
  },
  
  // 景区图片资源
  IMAGES: {
    BANNER: 'https://cdn.example.com/scenic-app/images/banner.jpg',
    MAP_PREVIEW: 'https://cdn.example.com/scenic-app/images/map_preview.jpg',
    
    // 景点图片
    SPOTS: [
      'https://cdn.example.com/scenic-app/images/spots/spot1.jpg',
      'https://cdn.example.com/scenic-app/images/spots/spot2.jpg',
      'https://cdn.example.com/scenic-app/images/spots/spot3.jpg',
      'https://cdn.example.com/scenic-app/images/spots/spot4.jpg'
    ],
    
    // 路线图片
    ROUTES: [
      'https://cdn.example.com/scenic-app/images/routes/route1.jpg',
      'https://cdn.example.com/scenic-app/images/routes/route2.jpg',
      'https://cdn.example.com/scenic-app/images/routes/route3.jpg'
    ]
  }
};

/**
 * CDN迁移步骤：
 * 1. 将assets目录下的所有资源上传至您的CDN服务
 * 2. 配置微信小程序业务域名白名单，添加您的CDN域名
 * 3. 复制本文件内容到config.js，并修改为您实际的CDN域名
 * 4. 确保路径正确，根据您的CDN目录结构可能需要调整
 * 
 * 注意：tabBar图标路径仍需保留在本地，app.json中的图标路径不受此配置影响
 * 注意：CDN域名必须在小程序管理后台的业务域名白名单中，否则无法加载图片
 */

module.exports = config; 