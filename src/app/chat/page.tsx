"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  chat,
  guestChat,
  getGuestRemainingUses,
  getCurrentUser,
  logout as apiLogout,
  GUEST_MAX_USES,
  getVisitorId,
  fetchConversations,
  fetchConversationDetail,
  deleteConversationApi,
  type ConversationItem,
  type MessageItem,
} from "@/lib/api";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [guestRemaining, setGuestRemaining] = useState(GUEST_MAX_USES);
  const [visitorId, setVisitorId] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [history, setHistoryState] = useState<ConversationItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 刷新历史列表
  async function refreshHistory() {
    setLoadingHistory(true);
    try {
      const list = await fetchConversations(isLoggedIn, visitorId);
      setHistoryState(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoadingHistory(false);
    }
  }

  // 初始化
  useEffect(() => {
    const vid = getVisitorId();
    setVisitorId(vid);

    getCurrentUser()
      .then((res) => {
        setUsername(res.username);
        setIsLoggedIn(true);
      })
      .catch(async () => {
        setIsLoggedIn(false);
        // 获取游客真实剩余次数
        try {
          const res = await getGuestRemainingUses(vid);
          setGuestRemaining(res.remainingUses);
        } catch {
          // 如果接口调用失败，保持默认值
        }
      })
      .finally(() => setCheckingLogin(false));
  }, []);

  // 登录状态确定后：拉历史列表 + 选首个会话
  useEffect(() => {
    if (checkingLogin) return;
    refreshHistory().then((list) => {
      if (list.length > 0) {
        setCurrentConversationId(list[0].id);
        loadConversation(list[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    });
  }, [checkingLogin, visitorId]);

  async function loadConversation(id: number) {
    try {
      const detail = await fetchConversationDetail(isLoggedIn, visitorId, id);
      setMessages(detail.messages);
      setCurrentConversationId(id);
      setError("");
    } catch (err) {
      console.error("加载会话失败", err);
    }
  }

  async function onSwitchConversation(id: number) {
    loadConversation(id);
  }

  function onNewChat() {
    setCurrentConversationId(null);
    setMessages([]);
    setError("");
  }

  async function onDeleteConversation(id: number) {
    try {
      await deleteConversationApi(isLoggedIn, visitorId, id);
      const list = await refreshHistory();
      if (id === currentConversationId) {
        if (list.length === 0) {
          setCurrentConversationId(null);
          setMessages([]);
        } else {
          loadConversation(list[0].id);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "删除失败";
      setError(msg);
    }
  }

  async function onSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setInput("");
    setError("");
    setLoading(true);

    // 先把用户消息渲染到界面
    const userItem: MessageItem = {
      id: 0,
      role: "user",
      content: userMsg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userItem]);

    try {
      let answer = "";
      let newConvId: number | null = currentConversationId;

      if (isLoggedIn) {
        const res = await chat(userMsg, currentConversationId ?? undefined);
        answer = res.answer;
        // 后端已经保存消息，刷新
        const list = await refreshHistory();
        if (list.length > 0) {
          // 如果是新会话，后端会新建一个；取最新的
          if (currentConversationId == null) {
            newConvId = list[0].id;
          }
          const detail = await fetchConversationDetail(true, "", newConvId ?? list[0].id);
          setMessages(detail.messages);
          setCurrentConversationId(newConvId);
        }
      } else {
        // 游客：先前端检查次数，再调 /api/guest/chat
        if (guestRemaining <= 0) {
          setError(`免费试用次数已用完（共 ${GUEST_MAX_USES} 次），请登录后继续使用。`);
          setLoading(false);
          return;
        }
        const res = await guestChat(userMsg, visitorId, currentConversationId ?? undefined);
        answer = res.answer;
        setGuestRemaining(res.remainingUses);
        newConvId = res.conversationId;
        // 刷新历史 & 当前会话
        const list = await refreshHistory();
        if (list.length > 0) {
          const detail = await fetchConversationDetail(false, visitorId, newConvId ?? list[0].id);
          setMessages(detail.messages);
          setCurrentConversationId(newConvId);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "对话失败";
      if (msg.includes("未登录") || msg.includes("登录") || msg.toLowerCase().includes("unauthorized")) {
        setIsLoggedIn(false);
        setError("需要登录才能继续使用，请先登录。");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    await apiLogout().catch(() => {});
    router.push("/login");
  }

  function onGotoLogin() {
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl gap-4">
        {/* 侧边栏：对话历史 */}
        <aside
          className={`${sidebarOpen ? "block" : "hidden"} w-full md:block md:w-72 shrink-0`}
        >
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">对话历史</h2>
              <button
                onClick={onNewChat}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
              >
                + 新对话
              </button>
            </div>

            <div className="mt-3 max-h-[70vh] space-y-1.5 overflow-y-auto pr-1">
              {loadingHistory ? (
                <p className="py-6 text-center text-xs text-slate-400">加载中...</p>
              ) : history.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">暂无历史记录</p>
              ) : (
                history.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => onSwitchConversation(conv.id)}
                    className={`group flex cursor-pointer items-start justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                      conv.id === currentConversationId
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{conv.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("确定删除这条对话？")) onDeleteConversation(conv.id);
                      }}
                      className="rounded px-1.5 py-0.5 text-xs text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* 主聊天区域 */}
        <section className="flex min-w-0 flex-1 flex-col rounded-2xl bg-white shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen((s) => !s)}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs md:hidden"
              >
                ☰
              </button>
              <h1 className="text-lg font-semibold text-slate-900">AI 对话</h1>
            </div>
            <div className="flex items-center gap-3 text-sm">
              {checkingLogin ? (
                <span className="text-slate-500">检查状态中...</span>
              ) : isLoggedIn ? (
                <>
                  <span className="text-slate-600">你好，{username}</span>
                  <button
                    onClick={onLogout}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                    游客模式 · 剩余 {guestRemaining}/{GUEST_MAX_USES} 次
                  </span>
                  <button
                    onClick={onGotoLogin}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                  >
                    登录 / 注册
                  </button>
                </>
              )}
            </div>
          </header>

          <div className="h-[55vh] space-y-3 overflow-y-auto px-6 py-4">
            {messages.length === 0 ? (
              <div className="space-y-2 py-8 text-center">
                <p className="text-sm text-slate-500">开始提问吧，例如：请介绍一下你自己。</p>
                {!isLoggedIn && !checkingLogin && guestRemaining > 0 && (
                  <p className="text-xs text-slate-400">
                    游客可免费试用 {GUEST_MAX_USES} 次，登录后可无限使用并永久保存对话历史。
                  </p>
                )}
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={`${m.id}-${idx}`}
                  className={`max-w-[85%] rounded-xl px-4 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
          </div>

          <form onSubmit={onSend} className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的问题..."
                disabled={loading}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-slate-300 focus:ring disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "发送中..." : "发送"}
              </button>
            </div>
            {error ? (
              <div className="mt-2 flex items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <span>{error}</span>
                {(!isLoggedIn || error.includes("登录")) && (
                  <button
                    onClick={onGotoLogin}
                    className="shrink-0 rounded bg-amber-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-800"
                  >
                    去登录
                  </button>
                )}
              </div>
            ) : null}
            {!isLoggedIn && guestRemaining <= 0 && !error ? (
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <span>免费试用次数已用完，请登录后继续。</span>
                <button
                  onClick={onGotoLogin}
                  className="shrink-0 rounded bg-amber-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-amber-800"
                >
                  去登录
                </button>
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}