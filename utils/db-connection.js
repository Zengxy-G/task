const mysql = require('mysql2/promise');
const dbConfig = require('../config/db');

// 创建单个数据库连接
let connection = null;

// 初始化数据库连接
async function initConnection() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功');
    // 设置连接错误处理
    connection.on('error', (err) => {
      console.error('数据库连接错误:', err.message);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // 连接丢失时尝试重新连接
        console.log('尝试重新连接数据库...');
        initConnection();
      } else {
        throw err;
      }
    });
    return connection;
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    return null;
  }
}

// 测试数据库连接
async function testConnection() {
  try {
    if (!connection) {
      await initConnection();
    }
    // 执行简单查询测试连接
    await connection.execute('SELECT 1');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
    return false;
  }
}

// 获取数据库连接
async function getConnection() {
  if (!connection || connection.state !== 'connected') {
    await initConnection();
  }
  return connection;
}

module.exports = {
  getConnection,
  testConnection,
  initConnection
};