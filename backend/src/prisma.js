const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
}

const prisma = global.prismaClient || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma;
}

module.exports = prisma;
