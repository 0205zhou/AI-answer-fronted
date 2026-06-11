// Keep the schema entrypoint present so models can define tables and run
// `npx drizzle-kit push` without bootstrapping Drizzle config first.
//
// 本项目的数据表实际由 Java Spring Boot 后端管理，这里仅作参考说明：
//
// 1) users        —— 用户表（id / username / password_hash / created_at）
// 2) sessions     —— 登录会话表（由 Spring Session 管理）
// 3) conversations —— 对话历史（user_id / title / created_at）
// 4) messages     —— 消息表（conversation_id / role / content / created_at）
// 5) visitors     —— 游客表（visitor_id / uses / remaining / created_at）
//
// 游客试用规则：每个 visitorId 可免费试用 3 次；超过需登录。
export {};