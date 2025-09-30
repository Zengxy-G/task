# 网络调查系统后台服务部署指南

## 服务器环境准备

在云服务器（IP: 175.178.89.88）上，请确保已安装以下软件：

- Node.js (推荐 v14+)
- MySQL 数据库

## 数据库配置

1. 在MySQL中创建数据库：

```sql
CREATE DATABASE network_survey DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 创建必要的数据表（使用项目根目录下的 `sql.sql` 文件）：

```bash
mysql -u root -p network_survey < sql.sql
```

3. 确保数据库用户 `root` 具有正确的权限，并且密码设置为 `xuan0918`

## 部署步骤

1. 将 `server` 文件夹上传到云服务器

2. 进入服务器目录：

```bash
cd /path/to/server
```

3. 运行启动脚本（确保脚本有执行权限）：

```bash
chmod +x start.sh
./start.sh
```

## 手动启动方式（如果不使用启动脚本）

1. 安装依赖：

```bash
npm install
```

2. 创建上传目录：

```bash
mkdir -p upload
```

3. 启动服务：

```bash
# 直接启动（仅用于测试）
node server.js

# 或使用PM2进行管理（推荐生产环境）
npm install -g pm2
pm2 start server.js --name network_survey_api
pm2 save
```

## 服务访问信息

- 服务运行端口：4001
- 健康检查地址：http://175.178.89.88:4001/health
- API 地址：http://175.178.89.88:4001/api/forms
- 文件上传地址：http://175.178.89.88:4001/api/upload
- 上传文件访问地址：http://175.178.89.88:4001/uploads/[filename]

## 常见问题排查

1. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 确认数据库用户名和密码正确
   - 确保 `network_survey` 数据库已创建

2. **502 Bad Gateway错误**
   - 检查Node.js服务是否正常运行
   - 查看PM2日志：`pm2 logs network_survey_api`
   - 确保服务器防火墙允许4001端口访问

3. **文件上传失败**
   - 检查upload目录权限
   - 确认上传的文件大小不超过5MB限制

4. **PM2相关命令**
   ```bash
   # 查看所有进程状态
   pm2 status
   
   # 重启服务
   pm2 restart network_survey_api
   
   # 停止服务
   pm2 stop network_survey_api
   
   # 查看服务日志
   pm2 logs network_survey_api
   ```