const dotenv = require("dotenv");
dotenv.config();

const vaultLogin = require("../vault/vaultAuth");
const { Pool } = require("pg");

let pool = null;

async function initDb() {
  if (pool) return pool;

  console.log("🔄 Connecting to PostgreSQL...");
  console.log(`📍 Host: ${process.env.DB_HOST} | User: ${process.env.DB_USER} | DB: ${process.env.DB_NAME}`);
  await vaultLogin.loginVault(); // Đảm bảo đã login Vault trước khi lấy credential

  try {
    pool = new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 5432,
      max: 10, 
      idleTimeoutMillis: 30000,
      // Tăng cái này lên để tránh bị "đuổi" sớm khi DB đang bận
      connectionTimeoutMillis: 5000, 
      
      // THÊM DÒNG NÀY NẾU BẠN DÙNG CLOUD (Supabase, Render, Azure...)
      // ssl: { rejectUnauthorized: false } 
    });

    // Quan trọng: Lắng nghe lỗi của Pool để tránh sập App nửa chừng
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      pool = null; // Reset để init lại nếu cần
    });

    // Kiểm tra kết nối
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully!");
    client.release();

    return pool;
  } catch (err) {
    console.error("❌ PostgreSQL Connection Failed:", err.message);
    pool = null; 
    throw err;
  }
}

/**
 * Hàm tiện ích để thực hiện query trực tiếp
 */
async function query(text, params) {
  try {
    const db = await initDb();
    return await db.query(text, params);
  } catch (err) {
    console.error("❌ Query Error:", err.message);
    throw err;
  }
}

module.exports = {
  initDb,
  query,
  pool: () => pool 
};


// const sql = require("mssql");
// const { getDbCredential } = require("../vaultconfig/vault");

// let pool = null;
// let leaseExpireAt = 0;

// async function initDb() {
//   const now = Date.now();

//   // reuse connection nếu còn TTL
//   if (pool && now < leaseExpireAt) {
//     return pool;
//   }

//   console.log("🔄 Fetch dynamic DB credential from Vault");

//   const cred = await getDbCredential();

//   leaseExpireAt = now + cred.ttl * 1000 - 5000; // buffer 5s

//   pool = await sql.connect({
//     user: cred.username,
//     password: cred.password,
//     server: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     options: {
//       encrypt: false,
//       trustServerCertificate: true,
//     },
//   });

//   console.log("✅ DB connected with user:", cred.username);
//   return pool;
// }

// module.exports = {
//   sql,
//   initDb,
// };


// Static Key-Value secret retrieval
// const loadDbSecret = require("../vaultconfig/vault");

// let pool; // singleton pool

// async function initDb() {
//   if (pool) return pool; // tránh tạo nhiều pool

//   const dbSecret = await loadDbSecret();

//   const config = {
//     user: dbSecret.user,
//     password: dbSecret.password,
//     server: process.env.DB_HOST, // MSSQL dùng server
//     database: process.env.DB_NAME,
//     options: {
//       encrypt: false, // true nếu Azure
//       trustServerCertificate: true,
//     },
//   };

//   try {
//     pool = await sql.connect(config);
//     console.log("✅ MSSQL connected with user:", config.user);
//     return pool;
//   } catch (err) {
//     console.error("❌ Database Connection Failed:", err);
//     throw err;
//   }
// }

// module.exports = {
//   sql,
//   initDb,
// };
