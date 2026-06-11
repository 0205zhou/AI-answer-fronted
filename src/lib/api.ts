export type AuthResponse = {
  username: string;
};

export type ChatResponse = {
  answer: string;
};

// 游客聊天响应：携带剩余试用次数 + 会话 ID
export type GuestChatResponse = {
  answer: string;
  remainingUses: number;
  conversationId: number;
};

export type ConversationItem = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageItem = {
  id: number;
  role: string;
  content: string;
  createdAt: string;
};

export type ConversationDetail = {
  id: number;
  title: string;
  messages: MessageItem[];
};

export type MessageResponse = {
  message: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080/api";

// 游客默认最多免费试用次数（仅前端展示用，实际以服务端为准）
export const GUEST_MAX_USES = 3;

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    // 关键：让浏览器自动带上 session cookie（登录态由后端管理）
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message ?? "请求失败");
  }

  return data as T;
}

/** 注册：写入后端数据库 */
export async function register(username: string, password: string) {
  return request<{ message: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/** 登录：后端校验数据库后写入 session，浏览器自动保存 session cookie */
export async function login(username: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

/** 获取当前登录用户（从后端 session 读取） */
export async function getCurrentUser() {
  return request<AuthResponse>("/auth/me", {
    method: "GET",
  });
}

/** 退出登录：销毁后端 session */
export async function logout() {
  return request<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

/** 登录用户聊天：可选 conversationId，后端自动创建或追加 */
export async function chat(message: string, conversationId?: number) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, conversationId }),
  });
}

/** 获取游客剩余试用次数 */
export async function getGuestRemainingUses(visitorId: string): Promise<{ remainingUses: number }> {
  return request<{ remainingUses: number }>(
    `/guest/remaining?visitorId=${encodeURIComponent(visitorId)}`,
    { method: "GET" },
  );
}

/** 游客聊天：visitorId 做 3 次试用限制；可选 conversationId */
export async function guestChat(
  message: string,
  visitorId: string,
  conversationId?: number,
) {
  return request<GuestChatResponse>("/guest/chat", {
    method: "POST",
    body: JSON.stringify({ message, visitorId, conversationId }),
  });
}

/** 拉取对话历史列表：isLoggedIn=true 走 /conversations，false 走 /guest/conversations */
export async function fetchConversations(
  isLoggedIn: boolean,
  visitorId: string,
): Promise<ConversationItem[]> {
  if (isLoggedIn) {
    return request<ConversationItem[]>("/conversations", { method: "GET" });
  }
  return request<ConversationItem[]>(
    `/guest/conversations?visitorId=${encodeURIComponent(visitorId)}`,
    { method: "GET" },
  );
}

/** 拉取单个会话的消息详情 */
export async function fetchConversationDetail(
  isLoggedIn: boolean,
  visitorId: string,
  conversationId: number,
): Promise<ConversationDetail> {
  if (isLoggedIn) {
    return request<ConversationDetail>(`/conversations/${conversationId}`, { method: "GET" });
  }
  return request<ConversationDetail>(
    `/guest/conversations/${conversationId}?visitorId=${encodeURIComponent(visitorId)}`,
    { method: "GET" },
  );
}

/** 删除单个会话 */
export async function deleteConversationApi(
  isLoggedIn: boolean,
  visitorId: string,
  conversationId: number,
): Promise<MessageResponse> {
  if (isLoggedIn) {
    return request<MessageResponse>(`/conversations/${conversationId}`, { method: "DELETE" });
  }
  return request<MessageResponse>(
    `/guest/conversations/${conversationId}?visitorId=${encodeURIComponent(visitorId)}`,
    { method: "DELETE" },
  );
}

// ============ 游客本地管理（localStorage） ============

const VISITOR_ID_KEY = "chat_visitor_id";

/** 获取或生成游客唯一 ID（永久） */
export function getVisitorId(): string {
  if (typeof localStorage === "undefined") return "";
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = "v_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}