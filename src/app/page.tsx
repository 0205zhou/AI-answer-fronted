import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-6 py-16">
      <section className="mx-auto w-full max-w-2xl rounded-3xl bg-white/90 p-10 shadow-xl backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">前后端分离 AI 问答系统</h1>
        <p className="mt-4 text-slate-700">
          前端：Next.js（登录、注册、对话页面）<br />
          后端：Java Spring Boot（MySQL 用户体系 + 百炼大模型问答）
        </p>

        <div className="mt-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5 text-sm">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">NEW</span>
            <p className="font-semibold text-blue-900">🎁 新用户福利</p>
          </div>
          <p className="mt-2 text-blue-800">
            无需注册即可免费试用 <span className="font-bold text-indigo-600">3 次</span> 对话，用完后登录即可无限使用并永久保存对话历史。
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/chat"
            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            🚀 免费试用（游客）
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            🔐 去登录
          </Link>
          <Link
            href="/register"
            className="rounded-xl border-2 border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-300"
          >
            ✨ 去注册
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          请先启动 Java 后端（默认 http://localhost:8080），并在前端配置 NEXT_PUBLIC_API_BASE_URL。
        </p>
      </section>
    </main>
  );
}