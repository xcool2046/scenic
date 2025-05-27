const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 计算两个坐标点之间的距离（单位：米）
 * @param {number} lat1 - 坐标1纬度
 * @param {number} lng1 - 坐标1经度
 * @param {number} lat2 - 坐标2纬度
 * @param {number} lng2 - 坐标2经度
 * @return {number} - 两点间的距离（米）
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const EARTH_RADIUS = 6378.137; // 地球半径，单位：千米
  
  // 角度转弧度
  const radLat1 = lat1 * Math.PI / 180.0;
  const radLat2 = lat2 * Math.PI / 180.0;
  const radLng1 = lng1 * Math.PI / 180.0;
  const radLng2 = lng2 * Math.PI / 180.0;
  
  // 计算
  const a = radLat1 - radLat2;
  const b = radLng1 - radLng2;
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2), 2) + 
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b/2), 2)));
  s = s * EARTH_RADIUS;
  
  // 保留2位小数并返回，单位：米
  return Math.round(s * 1000);
}

/**
 * 格式化距离显示
 * @param {number} distance - 距离（米）
 * @return {string} - 格式化后的距离字符串
 */
const formatDistance = (distance) => {
  if (distance < 1000) {
    return distance + ' 米';
  } else {
    return (distance / 1000).toFixed(1) + ' 公里';
  }
}

module.exports = {
  formatTime,
  calculateDistance,
  formatDistance
}
