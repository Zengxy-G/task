const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const formRoutes = require('./routes/formRoutes');
const { testConnection, initConnection } = require('./utils/db-connection');

const app = express();
const PORT = 4001;

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = req.body.filename || `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为5MB
  },
  fileFilter: function (req, file, cb) {
    // 只允许上传图片文件
    if (!file.mimetype.match(/^image\//)) {
      return cb(new Error('只允许上传图片文件'));
    }
    cb(null, true);
  }
});

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件服务，用于访问上传的图片
app.use('/uploads', express.static(uploadDir));

// 文件上传路由
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    console.log('接收到文件上传请求');
    console.log('请求参数:', req.body);
    
    if (!req.file) {
      console.error('没有文件被上传');
      return res.status(400).json({ success: false, message: '没有文件被上传' });
    }
    
    console.log('文件上传成功:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    // 返回文件在服务器上的相对路径
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
      success: true, 
      message: '文件上传成功',
      filePath: filePath
    });
  } catch (error) {
    console.error('文件上传失败:', error.message);
    res.status(500).json({ 
      success: false, 
      message: '文件上传失败',
      error: error.message 
    });
  }
});

// 路由
app.use('/api', formRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: '服务器运行正常' });
});

// 启动服务器
async function startServer() {
  try {
    // 初始化数据库连接
    console.log('正在连接数据库...');
    await initConnection();
    
    // 测试数据库连接
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('警告: 数据库连接失败，请检查数据库配置。服务器将继续运行，但数据操作可能失败。');
    }
    
    app.listen(PORT,'0.0.0.0', () => {
      console.log(`服务器运行在 http://175.178.89.88:${PORT}`);
      console.log(`健康检查地址: http://175.178.89.88:${PORT}/health`);
      console.log(`API 地址: http://175.178.89.88:${PORT}/api/forms`);
    });
  } catch (err) {
    console.error('服务器启动失败:', err);
  }
}

startServer();