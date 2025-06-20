// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    const { token } = event
    
    if (!token) {
      return {
        valid: false,
        message: '缺少token参数'
      }
    }

    // 简单的token格式验证
    // 格式: openid_timestamp_random
    const tokenParts = token.split('_')
    
    if (tokenParts.length !== 3) {
      return {
        valid: false,
        message: 'token格式错误'
      }
    }

    const [tokenOpenid, timestamp, random] = tokenParts

    // 验证openid是否匹配
    if (tokenOpenid !== wxContext.OPENID) {
      return {
        valid: false,
        message: 'token不匹配当前用户'
      }
    }

    // 验证token是否过期（7天有效期）
    const tokenTime = parseInt(timestamp)
    const currentTime = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000

    if (currentTime - tokenTime > sevenDays) {
      return {
        valid: false,
        message: 'token已过期'
      }
    }

    return {
      valid: true,
      openid: wxContext.OPENID,
      message: 'token验证成功'
    }

  } catch (error) {
    console.error('Token验证失败:', error)
    return {
      valid: false,
      message: error.message || 'token验证服务异常'
    }
  }
} 