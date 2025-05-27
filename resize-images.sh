#!/bin/bash

# 创建下载脚本 - 用于下载并调整图片大小，使其适合小程序界面

echo "开始下载并调整景区小程序图片资源..."

# 创建临时目录
mkdir -p temp_downloads

# 下载路线卡片图片资源 - 使用更合适大小的图片
echo "下载路线卡片图片资源..."
# 经典全景游 - 山景图片
curl -s -o temp_downloads/classic_route.jpg "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=300&fit=crop"
# 休闲亲子游 - 人群活动图片
curl -s -o temp_downloads/family_route.jpg "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=300&fit=crop"
# 摄影精选线 - 城市风光图片
curl -s -o temp_downloads/photo_route.jpg "https://images.unsplash.com/photo-1417716146732-918825b83fa0?w=600&h=300&fit=crop"

# 下载景点卡片图片
echo "下载景点卡片图片资源..."
# 望海亭 - 使用更好的观景点图片
curl -s -o temp_downloads/spot1.jpg "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400&h=300&fit=crop"
# 松月湖 - 使用更好的湖景图片
curl -s -o temp_downloads/lake.jpg "https://images.unsplash.com/photo-1580100586938-02822d99c4a8?w=400&h=300&fit=crop"
# 古樟园
curl -s -o temp_downloads/old_trees.jpg "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=300&fit=crop"
# 飞瀑溪
curl -s -o temp_downloads/waterfall.jpg "https://images.unsplash.com/photo-1546587348-d12660c30c50?w=400&h=300&fit=crop"

# 下载首页服务卡片背景图片
echo "下载服务卡片图片资源..."
# 电子门票卡片
curl -s -o temp_downloads/ticket_card.jpg "https://images.unsplash.com/photo-1572555349878-5fc8951fafe7?w=500&h=200&fit=crop"
# 景区地图卡片
curl -s -o temp_downloads/map_card.jpg "https://images.unsplash.com/photo-1476973422084-e0fa66ff9456?w=500&h=200&fit=crop"

# 下载首页轮播图
echo "下载轮播图资源..."
curl -s -o temp_downloads/banner.jpg "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=750&h=400&fit=crop"

# 下载图标资源
echo "下载热门标签图标..."
curl -s -o temp_downloads/hot_tag.png "https://img.icons8.com/emoji/24/star-emoji.png"

# 创建必要的目录
mkdir -p assets/images/cards
mkdir -p assets/images/scenic_spots
mkdir -p assets/images/spots
mkdir -p assets/icons/scenic

# 替换路线图片
echo "替换路线图片..."
cp temp_downloads/classic_route.jpg assets/images/routes/classic_route.jpg
cp temp_downloads/family_route.jpg assets/images/routes/family_route.jpg
cp temp_downloads/photo_route.jpg assets/images/routes/photo_route.jpg

# 替换景点卡片图片
echo "替换景点卡片图片..."
cp temp_downloads/spot1.jpg assets/images/spots/spot1.jpg
cp temp_downloads/lake.jpg assets/images/scenic_spots/lake.jpg
cp temp_downloads/old_trees.jpg assets/images/scenic_spots/old_trees.jpg
cp temp_downloads/waterfall.jpg assets/images/scenic_spots/waterfall.jpg

# 添加服务卡片背景图片
echo "添加服务卡片背景图片..."
cp temp_downloads/ticket_card.jpg assets/images/cards/ticket_card.jpg
cp temp_downloads/map_card.jpg assets/images/cards/map_card.jpg

# 替换轮播图
echo "替换轮播图..."
cp temp_downloads/banner.jpg assets/images/banner.jpg

# 替换图标
echo "替换热门标签图标..."
cp temp_downloads/hot_tag.png assets/icons/scenic/hot_tag.png

# 清理临时文件
echo "清理临时文件..."
rm -rf temp_downloads

echo "图片调整完成！"
echo "注意：图片资源来自Unsplash，遵循Unsplash许可协议使用。" 