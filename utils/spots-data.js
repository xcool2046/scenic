const config = require('./config');

/**
 * 统一的景点数据源
 * 包含导览页面和详情页面需要的所有景点信息
 */

const SPOTS_DATA = [
  {
    id: 1,
    name: '望海亭',
    type: 'scenery',
    desc: '位于景区最高点，可俯瞰整个景区美景，是拍摄日出和全景的最佳地点',
    description: '望海亭位于景区最高点，建于明代嘉靖年间，是观赏日出日落的绝佳地点。亭内碑刻"海天一色"四字，笔力遒劲。站在亭中，可俯瞰整个景区美景，是拍摄全景照片的最佳位置。每到清晨，云海缭绕，景色尤为壮丽。',
    image: config.IMAGES.SPOTS[0],
    distance: '200米',
    duration: '15分钟',
    openTime: '全天开放',
    location: '景区东北角高处',
    popularity: 4.8,
    features: ['摄影圣地', '观景台', '历史建筑'],
    nearbySpots: [2, 4],
    latitude: 39.909000,
    longitude: 116.398000,
    hot: true
  },
  {
    id: 2,
    name: '松月湖',
    type: 'scenery',
    desc: '景区最大的湖泊，湖水清澈见底，四周绿树环绕，环湖步道风景秀丽',
    description: '松月湖是景区最大的湖泊，湖水清澈见底，四周绿树环绕，环湖步道风景秀丽。湖中有小岛，岛上古松参天。湖面倒映着蓝天白云和翠绿山色，如诗如画。湖畔设有休息亭，游客可在此小憩，欣赏湖光山色。',
    image: config.IMAGES.SCENIC_SPOTS.LAKE,
    distance: '500米',
    duration: '30分钟',
    openTime: '全天开放',
    location: '景区中央',
    popularity: 4.7,
    features: ['湖泊', '步道', '划船'],
    nearbySpots: [1, 4],
    latitude: 39.907500,
    longitude: 116.396500,
    hot: true
  },
  {
    id: 3,
    name: '古樟园',
    type: 'scenery',
    desc: '百年古樟树群落，树荫蔽日，夏季凉爽宜人，是休憩和体验自然的好去处',
    description: '古樟园内百年古樟树群落，树荫蔽日，夏季凉爽宜人，是休憩和体验自然的好去处。园内古樟参天，有些树龄超过三百年，见证了景区的历史变迁。林间小径曲折幽深，鸟语花香，是避暑纳凉的绝佳场所。',
    image: config.IMAGES.SCENIC_SPOTS.OLD_TREES,
    distance: '850米',
    duration: '20分钟',
    openTime: '全天开放',
    location: '景区西南角',
    popularity: 4.4,
    features: ['古树群', '避暑胜地', '生态体验'],
    nearbySpots: [2, 4],
    latitude: 39.906000,
    longitude: 116.395000,
    hot: false
  },
  {
    id: 4,
    name: '飞瀑溪',
    type: 'scenery',
    desc: '山涧飞瀑，水声潺潺，溪边设有观景平台，可近距离感受大自然的魅力',
    description: '飞瀑溪山涧飞瀑，水声潺潺，溪边设有观景平台，可近距离感受大自然的魅力。瀑布从30米高的悬崖倾泻而下，水雾飞溅，在阳光照射下常现彩虹。溪水清澈甘甜，两岸青山如黛，是摄影和观景的热门地点。',
    image: config.IMAGES.SCENIC_SPOTS.WATERFALL,
    distance: '1.2公里',
    duration: '25分钟',
    openTime: '全天开放',
    location: '景区北部山谷',
    popularity: 4.6,
    features: ['瀑布景观', '观景台', '摄影胜地'],
    nearbySpots: [1, 2, 3],
    latitude: 39.911000,
    longitude: 116.394000,
    hot: false
  }
];

/**
 * 获取所有景点数据
 */
const getAllSpots = () => {
  return SPOTS_DATA;
};

/**
 * 根据ID获取景点数据
 */
const getSpotById = (id) => {
  return SPOTS_DATA.find(spot => spot.id === parseInt(id));
};

/**
 * 获取导览页面显示的景点列表
 */
const getSpotsForGuide = () => {
  return SPOTS_DATA.map(spot => ({
    id: spot.id,
    name: spot.name,
    desc: spot.desc,
    image: spot.image,
    distance: spot.distance,
    duration: spot.duration,
    hot: spot.hot
  }));
};

/**
 * 根据排序类型获取景点列表
 */
const getSortedSpots = (sortType = 'distance') => {
  const spots = getSpotsForGuide();
  
  if (sortType === 'popular') {
    return spots.sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
  } else {
    // 按距离排序
    return spots.sort((a, b) => {
      const distA = parseFloat(a.distance.replace(/[^0-9\.]/g, ''));
      const distB = parseFloat(b.distance.replace(/[^0-9\.]/g, ''));
      return distA - distB;
    });
  }
};

/**
 * 获取指定景点的附近景点数据
 */
const getNearbySpots = (spotId) => {
  const spot = getSpotById(spotId);
  if (!spot || !spot.nearbySpots) return [];
  
  return spot.nearbySpots
    .map(id => getSpotById(id))
    .filter(nearbySpot => nearbySpot)
    .map(nearbySpot => ({
      id: nearbySpot.id,
      name: nearbySpot.name,
      image: nearbySpot.image
    }));
};

module.exports = {
  getAllSpots,
  getSpotById,
  getSpotsForGuide,
  getSortedSpots,
  getNearbySpots,
  SPOTS_DATA
}; 