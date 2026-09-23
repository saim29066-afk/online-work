const path = require('path');
const fs = require('fs');

if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  const sourceDbPath = path.join(__dirname, '../backend/prisma/dev.db');

  if (!fs.existsSync(tmpDbPath)) {
    try {
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        console.log('✅ SQLite DB copied to /tmp/dev.db for full write access on Vercel');
      }
    } catch (e) {
      console.error('Failed to copy db to /tmp:', e);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const app = require('../backend/src/server');

module.exports = app;
