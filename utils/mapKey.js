/**
 * 地图API配置
 * 注意：微信小程序地图组件使用的是腾讯位置服务，需要腾讯地图的Key
 */
module.exports = {
  // 高德地图Key在微信小程序原生地图组件中不能直接使用
  AMAP_KEY: '8eaec058102b69e53223e0c592ac6c35', // 高德地图Key，不适用于微信原生地图
  
  // 微信小程序地图需要的腾讯位置服务Key
  MAP_KEY: '6WNBZ-5IUK3-64A3K-RTYQS-CVYR2-R4FOQ', // 腾讯地图Key
  SUBKEY: '6WNBZ-5IUK3-64A3K-RTYQS-CVYR2-R4FOQ'  // 腾讯位置服务Key
} 