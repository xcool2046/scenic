# 景区游客小程序

这是一款面向景区游客的C端微信小程序，MVP版本专注于满足游客最核心、最高频的需求，确保基础游玩体验顺畅。

## 项目结构

```
├── assets/                # 本地资源文件
│   ├── icons/             # 图标文件 (包括tabBar图标)
│   │   ├── home/          # 首页专用图标
│   │   ├── guide/         # 导览页专用图标
│   │   ├── ticket/        # 票务页专用图标
│   │   ├── user/          # 用户页专用图标
│   │   └── markers/       # 地图标记点图标
│   └── images/            # 图片资源
│       ├── spots/         # 景点图片
│       └── routes/        # 路线图片
├── pages/                 # 页面文件
│   ├── index/             # 首页
│   ├── guide/             # 导览页
│   ├── ticket/            # 票务页
│   └── user/              # 用户页
├── utils/                 # 工具类
│   ├── config.js          # 配置文件 (资源路径配置)
│   └── cdn-config-example.js # CDN配置示例文件
├── app.js                 # 应用入口文件
├── app.json               # 应用配置文件
└── app.wxss               # 应用样式文件
```

## 主要功能

1. **首页**：天气/人流量信息、电子门票入口、景区地图入口、便捷服务查找
2. **导览**：景区地图预览、景点列表、推荐路线、便利设施
3. **票务**：门票购买、日期选择、订单管理
4. **我的**：个人信息管理、订单查询、功能入口、帮助与客服

## 资源管理说明

本项目使用本地资源文件，所有图标和图片都存放在assets目录下：

### 1. TabBar图标

微信小程序的tabBar图标必须使用本地资源，在app.json中配置：

```json
"tabBar": {
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页",
      "iconPath": "assets/icons/home.png",
      "selectedIconPath": "assets/icons/home_selected.png"
    },
    // ...其他导航项
  ]
}
```

### 2. 其他资源

其他图标和图片资源通过utils/config.js文件统一管理路径：

```javascript
const config = {
  // 资源基础路径
  CDN_BASE: '/assets/',
  
  // 图标资源
  ICONS: {
    HOME: '/assets/icons/home.png',
    // ...其他图标
  },
  
  // 图片资源
  IMAGES: {
    BANNER: '/assets/images/banner.jpg',
    // ...其他图片
  }
};
```

### 3. 图标目录结构

项目按功能模块组织图标：

- home/ - 首页专用图标（如地图、票务、便捷服务等）
- guide/ - 导览页专用图标（如排序、位置、路线等）
- ticket/ - 票务页专用图标（如箭头、选中图标等）
- user/ - 用户页专用图标（如订单状态、功能图标等）
- markers/ - 地图标记点图标（景点、设施等）

### 使用方法

1. 在页面JS文件中引入config模块：

```javascript
const config = require('../../utils/config');

Page({
  data: {
    // 将图标和图片路径添加到页面数据中
    icons: config.ICONS,
    images: config.IMAGES
  }
})
```

2. 在WXML中使用图标和图片：

```html
<image src="{{icons.HOME}}"></image>
<image src="{{images.BANNER}}"></image>
```

## 资源更新说明

项目已使用真实的图标和图片资源替换了占位文件：

1. **图标资源**：所有图标均来自Icons8（https://icons8.com/）的Fluency风格图标集，使用了96x96像素的PNG格式。这些图标拥有统一的设计风格，色彩鲜明，符合小程序的现代UI设计理念。

2. **景点图片**：景点图片来自Unsplash（https://unsplash.com/），都是高质量的景区和自然风光照片，分辨率为800像素宽，经过裁剪优化适合小程序使用。

3. **其他图片**：包括banner和地图预览图也来自Unsplash，经过优化以适应应用需求。

### 资源许可说明

- **Icons8图标**：免费使用需要在应用中提供归属链接。如需商业使用且不提供归属链接，请购买适当的许可证。
  - 归属示例：`Icons by Icons8 (https://icons8.com)`

- **Unsplash图片**：根据Unsplash许可协议，这些照片可以免费用于商业和非商业用途，无需归属，但提供归属是对摄影师工作的尊重。

## CDN迁移说明

项目提供了CDN迁移的示例配置文件(utils/cdn-config-example.js)，可按以下步骤操作：

1. 将assets目录下的所有资源上传至您的CDN服务
2. 配置微信小程序业务域名白名单，添加您的CDN域名
3. 参考cdn-config-example.js文件，修改config.js中的路径为CDN路径:
   ```javascript
   CDN_BASE: 'https://your-cdn-domain.com/scenic-app/'
   ```
4. 按需调整资源路径以匹配CDN目录结构
5. 注意tabBar图标必须保留在本地，不受config.js影响

## 微信小程序资源限制说明

1. **TabBar图标**：必须使用本地资源，不可使用网络图片
2. **页面内图片**：
   - 默认只能使用本地图片或已配置的CDN域名图片
   - 使用网络图片需要在小程序管理后台配置业务域名白名单

## 资源下载脚本

项目包含一个`download-resources.sh`脚本，用于从网络下载并替换所有图标和图片资源。如需重新下载或更新资源，可执行以下命令：

```bash
chmod +x download-resources.sh
./download-resources.sh
```

## 开发团队

- 产品经理：[产品经理姓名]
- 设计师：[设计师姓名]
- 开发者：[开发者姓名] 