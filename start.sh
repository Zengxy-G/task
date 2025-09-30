#!/bin/bash

# 确保脚本在错误时退出
set -e

echo "===== 开始启动网络调查后台服务 ====="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: npm 未安装，请先安装npm"
    exit 1
fi

# 安装依赖
echo "正在安装依赖..."
npm install

# 检查是否已安装PM2，如果没有则安装
if ! command -v pm2 &> /dev/null; then
    echo "PM2 未安装，正在全局安装..."
    npm install -g pm2
fi

# 创建上传目录
mkdir -p upload

# 启动应用
echo "正在启动应用..."
pm2 start server.js --name network_survey_api

# 保存当前PM2配置，确保服务器重启后自动启动应用
echo "保存PM2配置..."
pm2 save

# 配置PM2开机自启
echo "配置PM2开机自启..."
if command -v pm2 startup &> /dev/null; then
    pm2 startup
fi

echo "===== 服务启动完成 ====="
echo "服务名称: network_survey_api"
echo "健康检查地址: http://175.178.89.88:4001/health"
echo "API 地址: http://175.178.89.88:4001/api/forms"
echo "PM2 管理命令:"
echo "  - 查看状态: pm2 status network_survey_api"
echo "  - 重启服务: pm2 restart network_survey_api"
echo "  - 停止服务: pm2 stop network_survey_api"
echo "  - 查看日志: pm2 logs network_survey_api"