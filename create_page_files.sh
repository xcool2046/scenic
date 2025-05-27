#!/bin/bash

# 创建页面基本文件函数
create_page_files() {
  local page_path=$1
  local page_name=$2
  local page_title=$3
  
  # 创建JS文件
  echo "// ${page_path}/${page_name}.js
Page({
  data: {
    pageTitle: '${page_title}'
  },
  onLoad(options) {
    console.log('页面加载: ${page_name}', options);
  }
});" > "${page_path}/${page_name}.js"
  
  # 创建WXML文件
  echo "<!-- ${page_path}/${page_name}.wxml -->
<view class=\"container\">
  <view class=\"page-title\">{{pageTitle}}</view>
  <view class=\"content\">
    <!-- ${page_title}页面内容 -->
    <view class=\"placeholder\">页面开发中...</view>
  </view>
</view>" > "${page_path}/${page_name}.wxml"
  
  # 创建WXSS文件
  echo "/* ${page_path}/${page_name}.wxss */
.container {
  padding: 30rpx;
  min-height: 100vh;
  background-color: #f8f8f8;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #333;
}

.content {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.placeholder {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  padding: 100rpx 0;
}" > "${page_path}/${page_name}.wxss"
  
  # 创建JSON文件
  echo "{
  \"navigationBarTitleText\": \"${page_title}\",
  \"navigationBarBackgroundColor\": \"#1AAD19\",
  \"navigationBarTextStyle\": \"white\",
  \"usingComponents\": {}
}" > "${page_path}/${page_name}.json"
  
  echo "Created files for ${page_path}/${page_name}"
}

# 票务相关页面
create_page_files "packages/ticket/pages/ticket" "ticket" "景区门票"
create_page_files "packages/ticket/pages/ticket/detail" "detail" "门票详情"
create_page_files "packages/ticket/pages/ticket/success" "success" "购票成功"

# 导览相关页面
create_page_files "packages/guide/pages/guide/map" "map" "景区地图"
create_page_files "packages/guide/pages/guide/spot" "spot" "景点详情"
create_page_files "packages/guide/pages/guide/parking" "parking" "停车场"
create_page_files "packages/guide/pages/guide/nearby" "nearby" "附近设施"
create_page_files "packages/guide/pages/guide/transport" "transport" "交通信息"
create_page_files "packages/guide/pages/guide/services" "services" "全部服务"

# 实时信息页面
create_page_files "packages/realtime/pages/realtime-info" "realtime-info" "实时信息"

echo "All page files created successfully!" 