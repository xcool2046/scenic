/**
 * 地图和导览系统管理模块
 * 处理景点信息、路线规划、地图显示等功能
 */

const env = require('./env');
const cache = require('./cache');
const { request } = require('./api');
const config = require('./config');

class MapManager {
  constructor() {
    this.spots = [];
    this.routes = [];
    this.facilities = [];
    this.currentLocation = null;
    this.mapInstance = null;
  }

  /**
   * 初始化地图系统
   */
  async init() {
    console.log('[MapManager] 开始初始化...');
    try {
      // 优先获取用户当前位置，这会阻塞后续流程直到定位完成
      await this.updateCurrentLocation();
      console.log('[MapManager] 定位完成, 当前位置:', this.currentLocation);

      // 并行加载其他数据
      await Promise.all([
        this.loadSpots(),
        this.loadRoutes(),
        this.loadFacilities()
      ]);
      console.log('[MapManager] 景点、路线、设施数据加载完成。');
      
    } catch (error) {
      console.error('地图系统初始化失败:', error);
    }
  }

  /**
   * 加载景点数据
   */
  async loadSpots() {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        this.spots = [
          {
            id: 'spot_001',
            name: '松月湖',
            description: '湖光山色，美不胜收的天然湖泊',
            category: 'natural',
            latitude: 30.2741,
            longitude: 120.1551,
            images: [config.IMAGES.SCENIC_SPOTS.LAKE],
            features: ['观景', '摄影', '休闲'],
            openTime: '06:00-18:00',
            recommendedDuration: 60,
            difficulty: 'easy',
            rating: 4.8,
            reviewCount: 1250,
            tips: ['最佳观景时间：日出日落', '建议携带相机', '湖边有休息亭'],
            facilities: ['restroom', 'parking', 'restaurant'],
            accessibility: true
          },
          {
            id: 'spot_002',
            name: '古樟园',
            description: '千年古樟树群，历史文化底蕴深厚',
            category: 'cultural',
            latitude: 30.2751,
            longitude: 120.1561,
            images: [config.IMAGES.SCENIC_SPOTS.OLD_TREES],
            features: ['历史', '文化', '教育'],
            openTime: '07:00-17:30',
            recommendedDuration: 45,
            difficulty: 'easy',
            rating: 4.6,
            reviewCount: 890,
            tips: ['有专业讲解员', '适合亲子游', '注意保护古树'],
            facilities: ['restroom', 'guide'],
            accessibility: true
          },
          {
            id: 'spot_003',
            name: '飞瀑溪',
            description: '壮观瀑布群，清澈溪流蜿蜒而下',
            category: 'natural',
            latitude: 30.2761,
            longitude: 120.1571,
            images: [config.IMAGES.SCENIC_SPOTS.WATERFALL],
            features: ['瀑布', '溪流', '探险'],
            openTime: '06:30-17:00',
            recommendedDuration: 90,
            difficulty: 'medium',
            rating: 4.9,
            reviewCount: 1580,
            tips: ['雨后水量更大', '注意防滑', '可以戏水'],
            facilities: ['restroom', 'first_aid'],
            accessibility: false
          },
          {
            id: 'spot_004',
            name: '观景台',
            description: '制高点俯瞰全景，视野开阔',
            category: 'viewpoint',
            latitude: 30.2771,
            longitude: 120.1581,
            images: ['/assets/images/spots/viewpoint.jpg'],
            features: ['全景', '摄影', '日出'],
            openTime: '05:30-19:00',
            recommendedDuration: 30,
            difficulty: 'hard',
            rating: 4.7,
            reviewCount: 720,
            tips: ['日出最佳观赏点', '需要爬山', '带好防风衣物'],
            facilities: ['restroom'],
            accessibility: false
          },
          {
            id: 'spot_005',
            name: '竹林小径',
            description: '幽静竹林步道，清新自然',
            category: 'natural',
            latitude: 30.2731,
            longitude: 120.1541,
            images: ['/assets/images/spots/bamboo.jpg'],
            features: ['竹林', '步道', '清新'],
            openTime: '06:00-18:00',
            recommendedDuration: 40,
            difficulty: 'easy',
            rating: 4.5,
            reviewCount: 650,
            tips: ['空气清新', '适合散步', '夏季凉爽'],
            facilities: ['restroom', 'bench'],
            accessibility: true
          }
        ];
        
        cache.set('spots_data', this.spots, 2 * 60 * 60 * 1000); // 2小时
        return this.spots;
      }

      // 生产环境API调用
      const result = await request({
        url: '/map/spots',
        method: 'GET'
      });
      
      this.spots = result.spots || [];
      cache.set('spots_data', this.spots, 2 * 60 * 60 * 1000);
      
      return this.spots;
    } catch (error) {
      console.error('加载景点数据失败:', error);
      // 尝试从缓存加载
      const cachedSpots = cache.get('spots_data');
      if (cachedSpots) {
        this.spots = cachedSpots;
        return this.spots;
      }
      throw error;
    }
  }

  /**
   * 加载路线数据
   */
  async loadRoutes() {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        this.routes = [
          {
            id: 'route_001',
            name: '经典全景游',
            description: '涵盖所有主要景点的经典路线',
            type: 'classic',
            duration: 240,
            distance: 3.5,
            difficulty: 'medium',
            spots: ['spot_001', 'spot_002', 'spot_003', 'spot_004'],
            path: [
              { latitude: 30.2741, longitude: 120.1551 },
              { latitude: 30.2751, longitude: 120.1561 },
              { latitude: 30.2761, longitude: 120.1571 },
              { latitude: 30.2771, longitude: 120.1581 }
            ],
            image: config.IMAGES.ROUTE_IMAGES.CLASSIC,
            features: ['全景观赏', '文化体验', '自然探索'],
            tips: ['建议早上出发', '携带充足水分', '穿舒适鞋子'],
            rating: 4.8,
            reviewCount: 520
          },
          {
            id: 'route_002',
            name: '休闲亲子游',
            description: '适合家庭的轻松路线',
            type: 'family',
            duration: 150,
            distance: 2.0,
            difficulty: 'easy',
            spots: ['spot_001', 'spot_002', 'spot_005'],
            path: [
              { latitude: 30.2741, longitude: 120.1551 },
              { latitude: 30.2751, longitude: 120.1561 },
              { latitude: 30.2731, longitude: 120.1541 }
            ],
            image: config.IMAGES.ROUTE_IMAGES.FAMILY,
            features: ['亲子友好', '教育意义', '轻松愉快'],
            tips: ['适合带小孩', '有教育讲解', '路线平缓'],
            rating: 4.6,
            reviewCount: 380
          },
          {
            id: 'route_003',
            name: '摄影精选线',
            description: '专为摄影爱好者设计的路线',
            type: 'photography',
            duration: 300,
            distance: 4.2,
            difficulty: 'hard',
            spots: ['spot_003', 'spot_004', 'spot_001'],
            path: [
              { latitude: 30.2761, longitude: 120.1571 },
              { latitude: 30.2771, longitude: 120.1581 },
              { latitude: 30.2741, longitude: 120.1551 }
            ],
            image: config.IMAGES.ROUTE_IMAGES.PHOTO,
            features: ['最佳拍摄点', '日出日落', '专业指导'],
            tips: ['携带专业设备', '关注天气', '早起看日出'],
            rating: 4.9,
            reviewCount: 280
          }
        ];
        
        cache.set('routes_data', this.routes, 2 * 60 * 60 * 1000);
        return this.routes;
      }

      // 生产环境API调用
      const result = await request({
        url: '/map/routes',
        method: 'GET'
      });
      
      this.routes = result.routes || [];
      cache.set('routes_data', this.routes, 2 * 60 * 60 * 1000);
      
      return this.routes;
    } catch (error) {
      console.error('加载路线数据失败:', error);
      const cachedRoutes = cache.get('routes_data');
      if (cachedRoutes) {
        this.routes = cachedRoutes;
        return this.routes;
      }
      throw error;
    }
  }

  /**
   * 加载设施数据
   */
  async loadFacilities() {
    try {
      if (env.shouldUseMock()) {
        // 开发环境模拟数据
        this.facilities = [
          {
            id: 'facility_001',
            name: '游客中心',
            type: 'visitor_center',
            latitude: 30.2735,
            longitude: 120.1545,
            description: '提供咨询、导览、休息等服务',
            services: ['信息咨询', '导览服务', '失物招领', '医疗急救'],
            openTime: '08:00-17:00',
            phone: '0571-12345678'
          },
          {
            id: 'facility_002',
            name: '停车场A',
            type: 'parking',
            latitude: 30.2725,
            longitude: 120.1535,
            description: '主要停车区域',
            capacity: 200,
            available: 156,
            fee: '免费',
            features: ['大型车位', '充电桩', '监控']
          },
          {
            id: 'facility_003',
            name: '湖心餐厅',
            type: 'restaurant',
            latitude: 30.2745,
            longitude: 120.1555,
            description: '湖边特色餐厅',
            cuisine: '本地特色菜',
            priceRange: '中等',
            openTime: '11:00-20:00',
            phone: '0571-87654321',
            features: ['湖景用餐', '本地特色', '包厢服务']
          },
          {
            id: 'facility_004',
            name: '公共卫生间',
            type: 'restroom',
            latitude: 30.2755,
            longitude: 120.1565,
            description: '标准公共卫生间',
            features: ['无障碍设施', '母婴室', '24小时开放']
          },
          {
            id: 'facility_005',
            name: '医疗站',
            type: 'medical',
            latitude: 30.2765,
            longitude: 120.1575,
            description: '景区医疗救护站',
            services: ['急救', '常用药品', '健康咨询'],
            openTime: '08:00-18:00',
            phone: '0571-11122333'
          }
        ];
        
        cache.set('facilities_data', this.facilities, 2 * 60 * 60 * 1000);
        return this.facilities;
      }

      // 生产环境API调用
      const result = await request({
        url: '/map/facilities',
        method: 'GET'
      });
      
      this.facilities = result.facilities || [];
      cache.set('facilities_data', this.facilities, 2 * 60 * 60 * 1000);
      
      return this.facilities;
    } catch (error) {
      console.error('加载设施数据失败:', error);
      const cachedFacilities = cache.get('facilities_data');
      if (cachedFacilities) {
        this.facilities = cachedFacilities;
        return this.facilities;
      }
      throw error;
    }
  }

  /**
   * 更新当前位置（这是一个内部调用的异步方法）
   */
  updateCurrentLocation() {
    return new Promise((resolve) => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          this.currentLocation = {
            latitude: res.latitude,
            longitude: res.longitude,
            accuracy: res.accuracy
          };
          console.log('[MapManager] wx.getLocation 成功:', this.currentLocation);
          resolve(this.currentLocation);
        },
        fail: (error) => {
          console.warn('[MapManager] wx.getLocation 失败:', error);
          // 使用默认位置（景区中心）作为降级方案
          this.currentLocation = {
            latitude: 30.2750,
            longitude: 120.1560,
            accuracy: 0,
            isDefault: true // 标记为默认位置
          };
          console.log('[MapManager] 使用默认位置:', this.currentLocation);
          resolve(this.currentLocation);
        }
      });
    });
  }

  /**
   * 获取当前位置（这是一个外部调用的同步方法）
   */
  getCurrentLocation() {
    return this.currentLocation;
  }

  /**
   * 计算两点间距离
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * 角度转弧度
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * 获取附近景点
   */
  getNearbySpots(latitude, longitude, radius = 1) {
    return this.spots.filter(spot => {
      const distance = this.calculateDistance(
        latitude, longitude,
        spot.latitude, spot.longitude
      );
      return distance <= radius;
    }).sort((a, b) => {
      const distanceA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distanceB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
  }

  /**
   * 获取附近设施
   */
  getNearbyFacilities(latitude, longitude, type = null, radius = 0.5) {
    let facilities = this.facilities;
    
    if (type) {
      facilities = facilities.filter(facility => facility.type === type);
    }
    
    return facilities.filter(facility => {
      const distance = this.calculateDistance(
        latitude, longitude,
        facility.latitude, facility.longitude
      );
      return distance <= radius;
    }).sort((a, b) => {
      const distanceA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distanceB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
  }

  /**
   * 搜索景点
   */
  searchSpots(keyword, filters = {}) {
    let results = this.spots;
    
    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(spot => 
        spot.name.toLowerCase().includes(lowerKeyword) ||
        spot.description.toLowerCase().includes(lowerKeyword) ||
        spot.features.some(feature => feature.toLowerCase().includes(lowerKeyword))
      );
    }
    
    // 分类过滤
    if (filters.category) {
      results = results.filter(spot => spot.category === filters.category);
    }
    
    // 难度过滤
    if (filters.difficulty) {
      results = results.filter(spot => spot.difficulty === filters.difficulty);
    }
    
    // 评分过滤
    if (filters.minRating) {
      results = results.filter(spot => spot.rating >= filters.minRating);
    }
    
    // 无障碍过滤
    if (filters.accessibility) {
      results = results.filter(spot => spot.accessibility);
    }
    
    return results;
  }

  /**
   * 获取推荐路线
   */
  getRecommendedRoutes(preferences = {}) {
    let routes = [...this.routes];
    
    // 根据偏好排序
    if (preferences.difficulty) {
      routes = routes.filter(route => route.difficulty === preferences.difficulty);
    }
    
    if (preferences.duration) {
      routes = routes.filter(route => route.duration <= preferences.duration);
    }
    
    if (preferences.type) {
      routes = routes.filter(route => route.type === preferences.type);
    }
    
    // 按评分排序
    return routes.sort((a, b) => b.rating - a.rating);
  }

  /**
   * 创建自定义路线
   */
  createCustomRoute(spots, name = '自定义路线') {
    const selectedSpots = spots.map(spotId => this.getSpotById(spotId)).filter(Boolean);
    
    if (selectedSpots.length < 2) {
      throw new Error('至少需要选择2个景点');
    }
    
    // 计算总距离和时间
    let totalDistance = 0;
    let totalDuration = 0;
    const path = [];
    
    for (let i = 0; i < selectedSpots.length; i++) {
      const spot = selectedSpots[i];
      path.push({ latitude: spot.latitude, longitude: spot.longitude });
      totalDuration += spot.recommendedDuration;
      
      if (i > 0) {
        const prevSpot = selectedSpots[i - 1];
        totalDistance += this.calculateDistance(
          prevSpot.latitude, prevSpot.longitude,
          spot.latitude, spot.longitude
        );
      }
    }
    
    // 添加行走时间（假设步行速度4km/h）
    const walkingTime = (totalDistance / 4) * 60; // 分钟
    totalDuration += walkingTime;
    
    return {
      id: 'custom_' + Date.now(),
      name,
      description: '用户自定义路线',
      type: 'custom',
      duration: Math.round(totalDuration),
      distance: Math.round(totalDistance * 100) / 100,
      difficulty: this.calculateRouteDifficulty(selectedSpots),
      spots: spots,
      path,
      features: ['自定义', '个性化'],
      tips: ['根据个人喜好定制', '注意时间安排'],
      rating: 0,
      reviewCount: 0
    };
  }

  /**
   * 计算路线难度
   */
  calculateRouteDifficulty(spots) {
    const difficultyScores = { easy: 1, medium: 2, hard: 3 };
    const avgScore = spots.reduce((sum, spot) => sum + difficultyScores[spot.difficulty], 0) / spots.length;
    
    if (avgScore <= 1.3) return 'easy';
    if (avgScore <= 2.3) return 'medium';
    return 'hard';
  }

  /**
   * 获取景点详情
   */
  getSpotById(spotId) {
    return this.spots.find(spot => spot.id === spotId);
  }

  /**
   * 获取路线详情
   */
  getRouteById(routeId) {
    return this.routes.find(route => route.id === routeId);
  }

  /**
   * 获取设施详情
   */
  getFacilityById(facilityId) {
    return this.facilities.find(facility => facility.id === facilityId);
  }

  /**
   * 获取所有景点
   */
  getAllSpots() {
    return this.spots;
  }

  /**
   * 获取所有路线
   */
  getAllRoutes() {
    return this.routes;
  }

  /**
   * 获取所有设施
   */
  getAllFacilities() {
    return this.facilities;
  }

  /**
   * 格式化距离
   */
  formatDistance(distance) {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  /**
   * 格式化时间
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }

  /**
   * 获取难度文本
   */
  getDifficultyText(difficulty) {
    const difficultyMap = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    };
    return difficultyMap[difficulty] || '未知';
  }

  /**
   * 获取分类文本
   */
  getCategoryText(category) {
    const categoryMap = {
      'natural': '自然景观',
      'cultural': '文化景观',
      'viewpoint': '观景点',
      'recreation': '休闲娱乐'
    };
    return categoryMap[category] || '其他';
  }

  /**
   * 获取设施类型文本
   */
  getFacilityTypeText(type) {
    const typeMap = {
      'visitor_center': '游客中心',
      'parking': '停车场',
      'restaurant': '餐厅',
      'restroom': '卫生间',
      'medical': '医疗站',
      'shop': '商店',
      'guide': '导览服务'
    };
    return typeMap[type] || '其他设施';
  }
}

// 创建单例实例
const mapManager = new MapManager();

// 导出实例和类
module.exports = {
  mapManager,
  MapManager
};