#!/bin/bash

# 创建下载脚本 - 用于补充智慧景区小程序的图标和图片

echo "开始下载景区小程序额外所需资源..."

# 创建临时目录
mkdir -p temp_downloads

# 下载景点卡片图标资源
echo "下载景点卡片图标资源..."
curl -s -o temp_downloads/distance_icon.png "https://img.icons8.com/fluency/96/distance.png"
curl -s -o temp_downloads/time_icon.png "https://img.icons8.com/fluency/96/clock.png"
curl -s -o temp_downloads/hot_tag.png "https://img.icons8.com/fluency/96/fire-element.png"

# 下载功能按钮图标资源
echo "下载功能按钮图标资源..."
curl -s -o temp_downloads/ticket_icon.png "https://img.icons8.com/fluency/96/ticket.png"
curl -s -o temp_downloads/map_icon.png "https://img.icons8.com/fluency/96/map.png"
curl -s -o temp_downloads/scan_code.png "https://img.icons8.com/fluency/96/qr-code.png"
curl -s -o temp_downloads/sos_icon.png "https://img.icons8.com/fluency/96/sos.png"
curl -s -o temp_downloads/navigation.png "https://img.icons8.com/fluency/96/navigation.png"

# 下载底部导航栏图标资源
echo "下载底部导航栏图标资源..."
curl -s -o temp_downloads/home_tab.png "https://img.icons8.com/fluency/96/home.png"
curl -s -o temp_downloads/guide_tab.png "https://img.icons8.com/fluency/96/map-marker.png"
curl -s -o temp_downloads/ticket_tab.png "https://img.icons8.com/fluency/96/ticket.png"
curl -s -o temp_downloads/user_tab.png "https://img.icons8.com/fluency/96/user.png"

# 下载便捷设施图标资源
echo "下载便捷设施图标资源..."
curl -s -o temp_downloads/toilet_icon.png "https://img.icons8.com/fluency/96/toilet.png"
curl -s -o temp_downloads/food_icon.png "https://img.icons8.com/fluency/96/restaurant.png"
curl -s -o temp_downloads/rest_icon.png "https://img.icons8.com/fluency/96/bench.png"
curl -s -o temp_downloads/medical_icon.png "https://img.icons8.com/fluency/96/hospital.png"
curl -s -o temp_downloads/transport_icon.png "https://img.icons8.com/fluency/96/bus.png"
curl -s -o temp_downloads/more_icon.png "https://img.icons8.com/fluency/96/more.png"

# 下载今日活动图标资源
echo "下载今日活动图标资源..."
curl -s -o temp_downloads/activity_icon.png "https://img.icons8.com/fluency/96/calendar.png"
curl -s -o temp_downloads/announcement_icon.png "https://img.icons8.com/fluency/96/megaphone.png"

# 下载景区实景图片资源
echo "下载景区实景图片资源..."
# 松月湖
curl -s -o temp_downloads/lake.jpg "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop"
# 古樟园
curl -s -o temp_downloads/old_trees.jpg "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop"
# 飞瀑溪
curl -s -o temp_downloads/waterfall.jpg "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=800&auto=format&fit=crop"

# 下载推荐路线图标和图片
echo "下载推荐路线图标和图片资源..."
curl -s -o temp_downloads/classic_route.jpg "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/family_route.jpg "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/photo_route.jpg "https://images.unsplash.com/photo-1417716146732-918825b83fa0?w=800&auto=format&fit=crop"

# 创建必要的目录
mkdir -p assets/icons/scenic
mkdir -p assets/icons/facilities
mkdir -p assets/icons/activities
mkdir -p assets/icons/navigation
mkdir -p assets/images/scenic_spots

# 替换景点卡片图标
echo "替换景点卡片图标..."
cp temp_downloads/distance_icon.png assets/icons/scenic/distance_icon.png
cp temp_downloads/time_icon.png assets/icons/scenic/time_icon.png
cp temp_downloads/hot_tag.png assets/icons/scenic/hot_tag.png

# 替换功能按钮图标
echo "替换功能按钮图标..."
cp temp_downloads/ticket_icon.png assets/icons/navigation/ticket_icon.png
cp temp_downloads/map_icon.png assets/icons/navigation/map_icon.png
cp temp_downloads/scan_code.png assets/icons/navigation/scan_code.png
cp temp_downloads/sos_icon.png assets/icons/navigation/sos_icon.png
cp temp_downloads/navigation.png assets/icons/navigation/navigation.png

# 替换底部导航栏图标
echo "替换底部导航栏图标..."
cp temp_downloads/home_tab.png assets/icons/home_tab.png
cp temp_downloads/guide_tab.png assets/icons/guide_tab.png
cp temp_downloads/ticket_tab.png assets/icons/ticket_tab.png
cp temp_downloads/user_tab.png assets/icons/user_tab.png

# 替换便捷设施图标
echo "替换便捷设施图标..."
cp temp_downloads/toilet_icon.png assets/icons/facilities/toilet_icon.png
cp temp_downloads/food_icon.png assets/icons/facilities/food_icon.png
cp temp_downloads/rest_icon.png assets/icons/facilities/rest_icon.png
cp temp_downloads/medical_icon.png assets/icons/facilities/medical_icon.png
cp temp_downloads/transport_icon.png assets/icons/facilities/transport_icon.png
cp temp_downloads/more_icon.png assets/icons/facilities/more_icon.png

# 替换今日活动图标
echo "替换今日活动图标..."
cp temp_downloads/activity_icon.png assets/icons/activities/activity_icon.png
cp temp_downloads/announcement_icon.png assets/icons/activities/announcement_icon.png

# 替换景区实景图片
echo "替换景区实景图片..."
cp temp_downloads/lake.jpg assets/images/scenic_spots/lake.jpg
cp temp_downloads/old_trees.jpg assets/images/scenic_spots/old_trees.jpg
cp temp_downloads/waterfall.jpg assets/images/scenic_spots/waterfall.jpg

# 替换推荐路线图片
echo "替换推荐路线图片..."
cp temp_downloads/classic_route.jpg assets/images/routes/classic_route.jpg
cp temp_downloads/family_route.jpg assets/images/routes/family_route.jpg
cp temp_downloads/photo_route.jpg assets/images/routes/photo_route.jpg

# 清理临时文件
echo "清理临时文件..."
rm -rf temp_downloads

echo "额外资源替换完成！"
echo "注意：这些图片资源都来自免费图库，如果用于商业目的，请检查相应的许可协议。"
echo "图标资源来自Icons8，请在应用中注明来源或购买适当的许可证。" 