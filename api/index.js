const dotenv = require('dotenv');
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
}

const app = require('../backend/src/server');

module.exports = app;
