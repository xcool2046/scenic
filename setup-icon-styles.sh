#!/bin/bash

# 创建图标样式相关目录结构

echo "设置图标样式目录结构..."

# 确保 assets/styles 目录存在
mkdir -p assets/styles

# 确保图标目录结构完整
mkdir -p assets/icons/markers
mkdir -p assets/icons/home
mkdir -p assets/icons/guide
mkdir -p assets/icons/ticket
mkdir -p assets/icons/user
mkdir -p assets/icons/buttons
mkdir -p assets/icons/tickets
mkdir -p assets/icons/notices
mkdir -p assets/icons/activities
mkdir -p assets/icons/facilities
mkdir -p assets/icons/scenic

# 创建默认头像图标
if [ ! -f assets/icons/user/default_avatar.png ]; then
  echo "下载默认头像..."
  curl -s -o assets/icons/user/default_avatar.png "https://img.icons8.com/fluency/96/user-male-circle.png"
fi

# 运行现有的下载脚本
echo "运行资源下载脚本..."
if [ -f download-resources.sh ]; then
  bash download-resources.sh
fi

if [ -f download-specific-icons.sh ]; then
  bash download-specific-icons.sh
fi

if [ -f download-additional-resources.sh ]; then
  bash download-additional-resources.sh
fi

echo "图标样式设置完成！" 