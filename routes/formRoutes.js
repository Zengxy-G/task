const express = require('express');
const router = express.Router();
const { getConnection } = require('../utils/db-connection');

// 获取所有表单数据
router.get('/forms', async (req, res) => {
  try {
    const connection = await getConnection();
    
    // 获取主表数据
    const [forms] = await connection.execute(
      'SELECT * FROM network_forms ORDER BY created_at DESC'
    );
    
    // 对于每个表单，获取关联的路由器位置和从光猫测速
    const resultData = [];
    for (const form of forms) {
      const [routerPositions] = await connection.execute(
        'SELECT position FROM router_positions WHERE form_id = ?',
        [form.id]
      );
      
      const [slaveSpeeds] = await connection.execute(
        'SELECT speed FROM slave_speeds WHERE form_id = ? ORDER BY sequence',
        [form.id]
      );
      
      resultData.push({
        id: form.id,
        area: form.area,
        routerPositions: routerPositions.map(item => item.position),
        wiringStatus: form.wiring_status,
        wiringStandard: form.wiring_standard,
        hasInvisibleCable: form.has_invisible_cable,
        isMasterSlaveTogether: form.is_master_slave_together,
        account: form.account,
        bandwidth: form.bandwidth,
        address: form.address,
        mainSpeed: form.main_speed,
        slaveSpeeds: slaveSpeeds.map(item => item.speed),
        ssid: form.ssid,
        signature: form.signature,
        saveTime: form.save_time
      });
    }
    
    res.status(200).json({ success: true, data: resultData });
  } catch (error) {
    console.error('获取表单数据失败:', error.message);
    res.status(500).json({ success: false, message: '获取数据失败', error: error.message });
  }
});

// 插入表单数据
router.post('/forms', async (req, res) => {
  try {
    const formData = req.body;
    const connection = await getConnection();
    
    // 开始事务
    await connection.beginTransaction();
    
    try {
      // 插入主表数据
      const [result] = await connection.execute(
        `INSERT INTO network_forms 
         (area, wiring_status, wiring_standard, has_invisible_cable, 
          is_master_slave_together, account, bandwidth, address, 
          main_speed, ssid, signature, save_time) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          formData.area,
          formData.wiringStatus || null,
          formData.wiringStandard || null,
          formData.hasInvisibleCable,
          formData.isMasterSlaveTogether,
          formData.account || null,
          formData.bandwidth,
          formData.address || null,
          formData.mainSpeed,
          formData.ssid || null,
          formData.signature || null, // 作为文件路径字符串处理
          formData.saveTime || new Date()
        ]
      );
      
      const formId = result.insertId;
      
      // 插入路由器位置数据
      if (formData.routerPositions && formData.routerPositions.length > 0) {
        for (const position of formData.routerPositions) {
          await connection.execute(
            'INSERT INTO router_positions (form_id, position) VALUES (?, ?)',
            [formId, position]
          );
        }
      }
      
      // 插入从光猫测速数据
      if (formData.slaveSpeeds && formData.slaveSpeeds.length > 0) {
        for (let i = 0; i < formData.slaveSpeeds.length; i++) {
          if (formData.slaveSpeeds[i] !== null && formData.slaveSpeeds[i] !== undefined) {
            await connection.execute(
              'INSERT INTO slave_speeds (form_id, speed, sequence) VALUES (?, ?, ?)',
              [formId, formData.slaveSpeeds[i], i + 1]
            );
          }
        }
      }
      
      // 提交事务
      await connection.commit();
      
      res.status(201).json({
        success: true,
        message: '数据插入成功',
        data: { formId, ...formData }
      });
    } catch (error) {
      // 回滚事务
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('插入表单数据失败:', error.message);
    res.status(500).json({ success: false, message: '插入数据失败', error: error.message });
  }
});

module.exports = router;