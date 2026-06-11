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

功能主要实现了用户注册,用户登录,游客访问(限三次,如果超过三次就需要登录),问题历史记录(如果账号的话历史记录也会跟着改变);
