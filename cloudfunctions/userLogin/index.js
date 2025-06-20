// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 处理测试请求
    if (event.test) {
      return {
        success: true,
        message: '云开发连接测试成功'
      }
    }
    
    console.log('用户登录请求:', {
      openid: wxContext.OPENID,
      userInfo: event.userInfo
    })

    // 获取用户集合
    const usersCollection = db.collection('users')
    
    // 检查用户是否已存在
    const existingUser = await usersCollection.where({
      openid: wxContext.OPENID
    }).get()

    let userData = null
    const currentTime = new Date().toISOString()

    if (existingUser.data.length > 0) {
      // 用户已存在，更新登录信息
      const user = existingUser.data[0]
      userData = {
        ...user,
        nickname: event.userInfo?.nickName || user.nickname,
        avatar: event.userInfo?.avatarUrl || user.avatar,
        lastVisit: currentTime,
        visitCount: (user.visitCount || 0) + 1
      }

      await usersCollection.doc(user._id).update({
        data: {
          nickname: userData.nickname,
          avatar: userData.avatar,
          lastVisit: currentTime,
          visitCount: userData.visitCount
        }
      })

      console.log('用户信息已更新:', userData.nickname)
    } else {
      // 新用户，创建用户记录
      userData = {
        openid: wxContext.OPENID,
        nickname: event.userInfo?.nickName || '微信用户',
        avatar: event.userInfo?.avatarUrl || '/assets/icons/user/default_avatar.png',
        phone: '',
        email: '',
        vipLevel: 0,
        points: 100,
        visitCount: 1,
        createTime: currentTime,
        lastVisit: currentTime
      }

      const createResult = await usersCollection.add({
        data: userData
      })

      userData._id = createResult._id
      console.log('新用户已创建:', userData.nickname)
    }

    // 生成访问令牌（简化版，实际项目可使用JWT）
    const token = `${wxContext.OPENID}_${Date.now()}_${Math.random().toString(36).slice(2)}`

    // 可以选择将token存储到数据库中进行管理
    // 这里为了简化，直接返回

    return {
      success: true,
      openid: wxContext.OPENID,
      token: token,
      createTime: currentTime,
      message: existingUser.data.length > 0 ? '登录成功' : '注册并登录成功'
    }

  } catch (error) {
    console.error('用户登录失败:', error)
    return {
      success: false,
      message: error.message || '登录服务异常'
    }
  }
} 