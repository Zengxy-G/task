// 数据库配置
module.exports = {
  host: 'localhost',      // 在云服务器上使用本地数据库
  user: 'root',           // 数据库用户名
  password: 'xuan0918',  // 数据库密码
  database: 'network_survey',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};