const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'EduNews',
    version: process.env.APP_VERSION || '1.0.0',
    database: process.env.DYNAMODB_TABLE || 'missing',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
