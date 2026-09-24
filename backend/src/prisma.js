const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
}

// Global Prisma singleton to reuse connections across serverless invocations
const prisma = global.prismaClient || new PrismaClient({
  log: ['error']
});

global.prismaClient = prisma;

module.exports = prisma;
