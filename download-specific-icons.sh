#!/bin/bash

# 创建下载脚本 - 用于补充智慧景区小程序的特定功能图标

echo "开始下载景区小程序特定功能图标资源..."

# 创建临时目录
mkdir -p temp_downloads

# 下载底部功能按钮图标资源
echo "下载底部功能按钮图标资源..."
curl -s -o temp_downloads/parking_button.png "https://img.icons8.com/fluency/96/parking.png"
curl -s -o temp_downloads/scan_button.png "https://img.icons8.com/fluency/96/qr-code--v1.png"
curl -s -o temp_downloads/sos_button.png "https://img.icons8.com/fluency/96/sos.png"
curl -s -o temp_downloads/route_button.png "https://img.icons8.com/fluency/96/route.png"

# 下载电子门票和景区地图图标
echo "下载电子门票和景区地图图标..."
curl -s -o temp_downloads/eticket_icon.png "https://img.icons8.com/fluency/96/ticket.png"
curl -s -o temp_downloads/map_icon_large.png "https://img.icons8.com/fluency/96/map--v1.png"

# 下载活动和公告图标
echo "下载活动和公告图标..."
curl -s -o temp_downloads/lecture_icon.png "https://img.icons8.com/fluency/96/lecture.png"
curl -s -o temp_downloads/performance_icon.png "https://img.icons8.com/fluency/96/micro.png"
curl -s -o temp_downloads/notice_icon.png "https://img.icons8.com/fluency/96/megaphone.png"

# 创建必要的目录
mkdir -p assets/icons/buttons
mkdir -p assets/icons/tickets
mkdir -p assets/icons/notices

# 替换底部功能按钮图标
echo "替换底部功能按钮图标..."
cp temp_downloads/parking_button.png assets/icons/buttons/parking_button.png
cp temp_downloads/scan_button.png assets/icons/buttons/scan_button.png
cp temp_downloads/sos_button.png assets/icons/buttons/sos_button.png
cp temp_downloads/route_button.png assets/icons/buttons/route_button.png

# 替换电子门票和景区地图图标
echo "替换电子门票和景区地图图标..."
cp temp_downloads/eticket_icon.png assets/icons/tickets/eticket_icon.png
cp temp_downloads/map_icon_large.png assets/icons/tickets/map_icon_large.png

# 替换活动和公告图标
echo "替换活动和公告图标..."
cp temp_downloads/lecture_icon.png assets/icons/notices/lecture_icon.png
cp temp_downloads/performance_icon.png assets/icons/notices/performance_icon.png
cp temp_downloads/notice_icon.png assets/icons/notices/notice_icon.png

# 清理临时文件
echo "清理临时文件..."
rm -rf temp_downloads

echo "特定功能图标替换完成！"
echo "注意：图标资源来自Icons8，请在应用中注明来源或购买适当的许可证。" 