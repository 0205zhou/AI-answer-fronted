import { drizzle } from "drizzle-orm/mysql2";
import { createPool, type Pool } from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// mysql2 不接受完整 URL，需要解析主机/端口/用户/密码/数据库
function parseMySqlUrl(url: string) {
  const u = new URL(url);
  if (u.protocol !== "mysql:" && u.protocol !== "mysql2:") {
    throw new Error("DATABASE_URL 协议必须是 mysql:// 或 mysql2://");
  }
  return {
    host: u.hostname || "127.0.0.1",
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username || "root"),
    password: decodeURIComponent(u.password || ""),
    database: decodeURIComponent(u.pathname.replace(/^\//, "") || ""),
  };
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsMySqlPool?: Pool;
};

const poolOptions = parseMySqlUrl(databaseUrl);

export const pool =
  globalForDb.__arenaNextJsMySqlPool ??
  createPool({
    ...poolOptions,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsMySqlPool = pool;
}

export const db = drizzle(pool, { mode: "default" });