let app;
let loadError = null;

try {
  const dotenv = require('dotenv');
  dotenv.config();

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
  }
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = "postgresql://postgres.qhxbmtokfulafggynutn:bangashsaim1214@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";
  }

  app = require('../backend/src/server');
} catch (err) {
  loadError = err;
  console.error('Fatal API Load Error:', err);
}

module.exports = (req, res) => {
  if (loadError) {
    return res.status(500).json({
      success: false,
      error: loadError.message,
      stack: loadError.stack
    });
  }
  return app(req, res);
};
