# 前后端分离 AI 问答项目（Next.js + Java + MySQL + 百炼）

## 架构

- 前端：Next.js（`src/app`）
  - `/register` 注册
  - `/login` 登录
  - `/chat` AI 对话
- 后端：Spring Boot（`backend-java`）
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/chat`（Bearer Token）
- 数据库：MySQL（用户表 `users`）
- 大模型：阿里云百炼（DashScope 兼容接口）

---

## 一键运行（Docker）

### 1) 准备环境变量
在项目根目录创建 `.env`（供 docker compose 使用）：

```env
BAILIAN_API_KEY=你的百炼API_KEY
```

### 2) 启动

```bash
docker compose up --build
```

启动后访问：
- 前端：http://localhost:3000
- Java后端健康检查：http://localhost:8080/api/health

---

## 本地分别启动（不使用 Docker）

### 启动 MySQL
确保本地有 MySQL，并创建数据库 `ai_chat`。

### 启动 Java 后端
```bash
cd backend-java
# Windows: set BAILIAN_API_KEY=xxx
# macOS/Linux:
export BAILIAN_API_KEY=你的百炼API_KEY
mvn spring-boot:run
```

### 启动 Next.js 前端
```bash
# 回到项目根目录
export NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
npm install
npm run dev
```

---

## 打包

### Java 后端打包
```bash
cd backend-java
mvn clean package -DskipTests
# 产物：target/ai-chat-backend-1.0.0.jar
```

运行 jar：
```bash
java -jar target/ai-chat-backend-1.0.0.jar
```

### 前端生产构建
```bash
npm run build
npm run start
```

---

## 说明

- 登录注册数据在 MySQL 中存储（密码 BCrypt 加密）。
- 登录成功后返回 JWT，前端携带 `Authorization: Bearer <token>` 访问 `/api/chat`。
- `BAILIAN_API_KEY` 必须配置，否则聊天接口会报错。
