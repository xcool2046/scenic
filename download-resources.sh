#!/bin/bash

# 创建下载脚本 - 用于获取并替换智慧景区小程序的图标和图片

echo "开始下载景区小程序所需资源..."

# 创建临时目录
mkdir -p temp_downloads

# 下载首页图标资源 - 从免费资源网站获取
echo "下载首页图标资源..."
curl -s -o temp_downloads/ticket_large.png "https://img.icons8.com/fluency/96/ticket.png"
curl -s -o temp_downloads/map_large.png "https://img.icons8.com/fluency/96/map.png"
curl -s -o temp_downloads/parking.png "https://img.icons8.com/fluency/96/parking.png"
curl -s -o temp_downloads/scan.png "https://img.icons8.com/fluency/96/qr-code--v1.png"
curl -s -o temp_downloads/sos.png "https://img.icons8.com/fluency/96/sos.png"
curl -s -o temp_downloads/routes.png "https://img.icons8.com/fluency/96/route.png"
curl -s -o temp_downloads/toilet.png "https://img.icons8.com/fluency/96/toilet.png"
curl -s -o temp_downloads/food.png "https://img.icons8.com/fluency/96/cutlery.png"
curl -s -o temp_downloads/rest.png "https://img.icons8.com/fluency/96/bench.png"
curl -s -o temp_downloads/medical.png "https://img.icons8.com/fluency/96/medical-bag.png"
curl -s -o temp_downloads/bus.png "https://img.icons8.com/fluency/96/bus.png"
curl -s -o temp_downloads/more.png "https://img.icons8.com/fluency/96/more.png"

# 下载导览页图标资源
echo "下载导览页图标资源..."
curl -s -o temp_downloads/sort.png "https://img.icons8.com/fluency/96/sort.png"
curl -s -o temp_downloads/location.png "https://img.icons8.com/fluency/96/marker.png"
curl -s -o temp_downloads/time.png "https://img.icons8.com/fluency/96/time.png"
curl -s -o temp_downloads/route_guide.png "https://img.icons8.com/fluency/96/route-sign.png"
curl -s -o temp_downloads/arrow_right.png "https://img.icons8.com/fluency/96/right-arrow.png"

# 下载票务页图标资源
echo "下载票务页图标资源..."
curl -s -o temp_downloads/arrow_left.png "https://img.icons8.com/fluency/96/left-arrow.png"
curl -s -o temp_downloads/checked.png "https://img.icons8.com/fluency/96/checkmark.png"
curl -s -o temp_downloads/empty_order.png "https://img.icons8.com/fluency/96/receipt.png"

# 下载用户页图标资源
echo "下载用户页图标资源..."
curl -s -o temp_downloads/pending.png "https://img.icons8.com/fluency/96/time-machine.png"
curl -s -o temp_downloads/used.png "https://img.icons8.com/fluency/96/ok.png"
curl -s -o temp_downloads/refund.png "https://img.icons8.com/fluency/96/refund.png"
curl -s -o temp_downloads/favorite.png "https://img.icons8.com/fluency/96/like.png"
curl -s -o temp_downloads/feedback.png "https://img.icons8.com/fluency/96/feedback.png"
curl -s -o temp_downloads/settings.png "https://img.icons8.com/fluency/96/settings.png"
curl -s -o temp_downloads/faq.png "https://img.icons8.com/fluency/96/questionnaire.png"
curl -s -o temp_downloads/service.png "https://img.icons8.com/fluency/96/service.png"
curl -s -o temp_downloads/emergency.png "https://img.icons8.com/fluency/96/emergency.png"
curl -s -o temp_downloads/about.png "https://img.icons8.com/fluency/96/about.png"

# 下载地图标记图标资源
echo "下载地图标记图标资源..."
curl -s -o temp_downloads/marker_scenic.png "https://img.icons8.com/fluency/96/photo-gallery.png"
curl -s -o temp_downloads/marker_facility.png "https://img.icons8.com/fluency/96/building.png"
curl -s -o temp_downloads/marker_entrance.png "https://img.icons8.com/fluency/96/door-opened.png"
curl -s -o temp_downloads/marker_food.png "https://img.icons8.com/fluency/96/restaurant.png"
curl -s -o temp_downloads/marker_default.png "https://img.icons8.com/fluency/96/marker.png"

# 下载景点图片资源 - 从Unsplash等免费图库获取高质量风景照片
echo "下载景点图片资源..."
curl -s -o temp_downloads/spot1.jpg "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/spot2.jpg "https://images.unsplash.com/photo-1518021964703-4b2030f03085?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/spot3.jpg "https://images.unsplash.com/photo-1518873492399-f92b3ed3cc28?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/spot4.jpg "https://images.unsplash.com/photo-1471893370447-2f0063e8f556?w=800&auto=format&fit=crop"

# 下载路线图片资源
echo "下载路线图片资源..."
curl -s -o temp_downloads/route1.jpg "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/route2.jpg "https://images.unsplash.com/photo-1456428199391-a3b1cb5e93ab?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/route3.jpg "https://images.unsplash.com/photo-1458668383970-8ddd3927deed?w=800&auto=format&fit=crop"

# 下载其他图片资源
echo "下载其他图片资源..."
curl -s -o temp_downloads/banner.jpg "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop"
curl -s -o temp_downloads/map_preview.jpg "https://images.unsplash.com/photo-1484312152213-d713e8b7c053?w=800&auto=format&fit=crop"

# 替换首页图标
echo "替换首页图标..."
cp temp_downloads/ticket_large.png assets/icons/home/ticket_large.png
cp temp_downloads/map_large.png assets/icons/home/map_large.png
cp temp_downloads/parking.png assets/icons/home/parking.png
cp temp_downloads/scan.png assets/icons/home/scan.png
cp temp_downloads/sos.png assets/icons/home/sos.png
cp temp_downloads/routes.png assets/icons/home/routes.png
cp temp_downloads/toilet.png assets/icons/home/toilet.png
cp temp_downloads/food.png assets/icons/home/food.png
cp temp_downloads/rest.png assets/icons/home/rest.png
cp temp_downloads/medical.png assets/icons/home/medical.png
cp temp_downloads/bus.png assets/icons/home/bus.png
cp temp_downloads/more.png assets/icons/home/more.png

# 替换导览页图标
echo "替换导览页图标..."
cp temp_downloads/sort.png assets/icons/guide/sort.png
cp temp_downloads/location.png assets/icons/guide/location.png
cp temp_downloads/time.png assets/icons/guide/time.png
cp temp_downloads/route_guide.png assets/icons/guide/route.png
cp temp_downloads/arrow_right.png assets/icons/guide/arrow_right.png

# 替换票务页图标
echo "替换票务页图标..."
cp temp_downloads/arrow_left.png assets/icons/ticket/arrow_left.png
cp temp_downloads/checked.png assets/icons/ticket/checked.png
cp temp_downloads/empty_order.png assets/icons/ticket/empty_order.png

# 替换用户页图标
echo "替换用户页图标..."
cp temp_downloads/pending.png assets/icons/user/pending.png
cp temp_downloads/used.png assets/icons/user/used.png
cp temp_downloads/refund.png assets/icons/user/refund.png
cp temp_downloads/favorite.png assets/icons/user/favorite.png
cp temp_downloads/feedback.png assets/icons/user/feedback.png
cp temp_downloads/settings.png assets/icons/user/settings.png
cp temp_downloads/faq.png assets/icons/user/faq.png
cp temp_downloads/service.png assets/icons/user/service.png
cp temp_downloads/emergency.png assets/icons/user/emergency.png
cp temp_downloads/about.png assets/icons/user/about.png

# 替换地图标记图标
echo "替换地图标记图标..."
cp temp_downloads/marker_scenic.png assets/icons/markers/scenic.png
cp temp_downloads/marker_facility.png assets/icons/markers/facility.png
cp temp_downloads/marker_entrance.png assets/icons/markers/entrance.png
cp temp_downloads/marker_food.png assets/icons/markers/food.png
cp temp_downloads/marker_default.png assets/icons/markers/default.png

# 替换景点图片
echo "替换景点图片..."
cp temp_downloads/spot1.jpg assets/images/spots/spot1.jpg
cp temp_downloads/spot2.jpg assets/images/spots/spot2.jpg
cp temp_downloads/spot3.jpg assets/images/spots/spot3.jpg
cp temp_downloads/spot4.jpg assets/images/spots/spot4.jpg

# 替换路线图片
echo "替换路线图片..."
cp temp_downloads/route1.jpg assets/images/routes/route1.jpg
cp temp_downloads/route2.jpg assets/images/routes/route2.jpg
cp temp_downloads/route3.jpg assets/images/routes/route3.jpg

# 替换其他图片
echo "替换其他图片..."
cp temp_downloads/banner.jpg assets/images/banner.jpg
cp temp_downloads/map_preview.jpg assets/images/map_preview.jpg

# 清理临时文件
echo "清理临时文件..."
rm -rf temp_downloads

echo "资源替换完成！"
echo "注意：这些图片资源都来自免费图库，如果用于商业目的，请检查相应的许可协议。"
echo "图标资源来自Icons8，请在应用中注明来源或购买适当的许可证。" 