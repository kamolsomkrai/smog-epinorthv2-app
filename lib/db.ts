import mysql from "mysql2/promise";

// ใช้ globalThis เพื่อเก็บ connection pool ไว้
// ป้องกันการสร้าง pool ใหม่ทุกครั้งที่ Next.js ทำ Hot Reload ในโหมด development
declare global {
  var mysqlPool: mysql.Pool | undefined;
}

let pool: mysql.Pool;

if (process.env.NODE_ENV === "production") {
  // ใน Production, สร้าง pool ปกติ
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  // ใน Development, เก็บ pool ไว้ใน globalThis
  if (!globalThis.mysqlPool) {
    globalThis.mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  pool = globalThis.mysqlPool;
}

export const db = pool;
