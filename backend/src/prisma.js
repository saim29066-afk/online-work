const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  const sourceDbPath = path.join(__dirname, '../prisma/dev.db');

  if (!fs.existsSync(tmpDbPath)) {
    try {
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
        console.log('✅ SQLite DB copied to /tmp/dev.db');
      }
    } catch (e) {
      console.error('Error copying db to /tmp:', e);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const prisma = global.prismaClient || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

module.exports = prisma;
