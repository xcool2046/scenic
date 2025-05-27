/**
 * 计算工作线程
 * 处理复杂计算任务，避免阻塞主线程
 */
worker.onMessage(function(res) {
  const { type, data } = res;
  
  switch(type) {
    case 'processData':
      const result = processLargeData(data);
      worker.postMessage({
        type: 'processDataResult',
        result
      });
      break;
      
    case 'filterData':
      const filtered = filterData(data.list, data.criteria);
      worker.postMessage({
        type: 'filterDataResult',
        result: filtered
      });
      break;
      
    case 'calculateRoute':
      const route = calculateOptimalRoute(data.spots, data.preferences);
      worker.postMessage({
        type: 'routeResult',
        result: route
      });
      break;
      
    default:
      worker.postMessage({
        type: 'error',
        error: '未知的任务类型'
      });
  }
});

/**
 * 处理大数据集
 * @param {Array} data - 需要处理的数据数组
 * @returns {Array} - 处理后的数据
 */
function processLargeData(data) {
  // 这里是计算密集型操作示例
  const result = data.map(item => {
    // 模拟复杂计算
    let processed = { ...item };
    
    // 添加处理标记
    processed.processed = true;
    
    // 执行一些数据转换
    if (processed.value !== undefined) {
      processed.normalizedValue = processed.value / 100;
      processed.category = categorizeByStat(processed.value);
    }
    
    // 如果有统计数据，计算相关指标
    if (processed.stats) {
      processed.average = calculateAverage(processed.stats);
      processed.deviation = calculateStandardDeviation(processed.stats);
      processed.trend = analyzeTrend(processed.stats);
    }
    
    return processed;
  });
  
  return result;
}

/**
 * 根据条件筛选数据
 * @param {Array} list - 数据列表
 * @param {Object} criteria - 筛选条件
 * @returns {Array} - 筛选后的数据
 */
function filterData(list, criteria) {
  return list.filter(item => {
    return matchesCriteria(item, criteria);
  });
}

/**
 * 检查项目是否匹配筛选条件
 * @param {Object} item - 数据项
 * @param {Object} criteria - 筛选条件
 * @returns {Boolean} - 是否匹配
 */
function matchesCriteria(item, criteria) {
  // 遍历所有条件进行匹配
  for (const key in criteria) {
    if (criteria.hasOwnProperty(key)) {
      const criterion = criteria[key];
      
      // 如果项目没有该属性，则不匹配
      if (item[key] === undefined) {
        return false;
      }
      
      // 根据条件类型进行不同匹配
      if (typeof criterion === 'object') {
        // 范围匹配
        if (criterion.min !== undefined && item[key] < criterion.min) {
          return false;
        }
        if (criterion.max !== undefined && item[key] > criterion.max) {
          return false;
        }
        // 包含匹配
        if (criterion.includes && !criterion.includes.includes(item[key])) {
          return false;
        }
        // 排除匹配
        if (criterion.excludes && criterion.excludes.includes(item[key])) {
          return false;
        }
      } else {
        // 直接相等匹配
        if (item[key] !== criterion) {
          return false;
        }
      }
    }
  }
  
  // 所有条件都匹配
  return true;
}

/**
 * 根据景点和用户偏好计算最佳游览路线
 * @param {Array} spots - 景点列表
 * @param {Object} preferences - 用户偏好
 * @returns {Object} - 优化后的路线
 */
function calculateOptimalRoute(spots, preferences) {
  // 实现路线优化算法
  // 这里使用简化版本，实际项目中可能需要更复杂的算法
  
  // 根据用户偏好对景点进行评分
  const scoredSpots = spots.map(spot => {
    let score = 0;
    
    // 根据拥挤度评分
    if (preferences.avoidCrowds && spot.congestionLevel) {
      // 拥挤度越低分数越高
      score += (5 - spot.levelValue) * preferences.avoidCrowds;
    }
    
    // 根据景点类型评分
    if (preferences.preferredTypes && preferences.preferredTypes.includes(spot.type)) {
      score += 2;
    }
    
    // 根据必看景点评分
    if (preferences.mustVisit && preferences.mustVisit.includes(spot.id)) {
      score += 5;
    }
    
    return {
      ...spot,
      score
    };
  });
  
  // 根据评分和位置信息排序景点
  const sortedSpots = sortSpotsByScoreAndDistance(scoredSpots);
  
  // 生成路线
  return {
    spots: sortedSpots,
    totalDistance: calculateTotalDistance(sortedSpots),
    estimatedTime: calculateEstimatedTime(sortedSpots, preferences.pace || 1)
  };
}

// 辅助函数：基于得分和距离对景点进行排序
function sortSpotsByScoreAndDistance(scoredSpots) {
  // 这里是简化实现，实际项目中可能需要考虑更复杂的路径规划算法
  // 例如旅行商问题的近似解法
  
  const result = [...scoredSpots];
  
  // 按评分从高到低进行简单排序
  result.sort((a, b) => b.score - a.score);
  
  return result;
}

// 辅助函数：计算路线总距离
function calculateTotalDistance(spots) {
  if (spots.length <= 1) return 0;
  
  let totalDistance = 0;
  for (let i = 0; i < spots.length - 1; i++) {
    totalDistance += calculateDistance(
      spots[i].latitude, spots[i].longitude,
      spots[i+1].latitude, spots[i+1].longitude
    );
  }
  
  return totalDistance;
}

// 辅助函数：估算游览时间（小时）
function calculateEstimatedTime(spots, pace) {
  // 基本参观时间（每个景点平均）
  const baseTime = spots.length * 0.5;
  
  // 行走时间（假设每公里需要15分钟）
  const walkingTime = calculateTotalDistance(spots) * 0.25;
  
  // 根据游览速度调整
  return (baseTime + walkingTime) / pace;
}

// 辅助函数：计算两点之间的距离（公里）
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  
  const R = 6371; // 地球半径（公里）
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// 辅助函数：角度转弧度
function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// 辅助函数：根据数值分类
function categorizeByStat(value) {
  if (value < 30) return 'low';
  if (value < 70) return 'medium';
  return 'high';
}

// 辅助函数：计算平均值
function calculateAverage(values) {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

// 辅助函数：计算标准差
function calculateStandardDeviation(values) {
  if (!values || values.length <= 1) return 0;
  
  const avg = calculateAverage(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

// 辅助函数：分析趋势
function analyzeTrend(values) {
  if (!values || values.length <= 2) return 'stable';
  
  let increases = 0;
  let decreases = 0;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i-1]) {
      increases++;
    } else if (values[i] < values[i-1]) {
      decreases++;
    }
  }
  
  const total = increases + decreases;
  if (increases / total > 0.7) return 'increasing';
  if (decreases / total > 0.7) return 'decreasing';
  return 'fluctuating';
} 