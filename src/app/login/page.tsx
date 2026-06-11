"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { login } from "@/lib/api"; // 登录态由后端 Session 管理，前端不存储

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      // 登录态由后端 Session 通过 Cookie 管理，前端不存储任何信息
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">登录</h1>
        <p className="mt-2 text-sm text-slate-600">登录后即可使用 AI 问答。</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">用户名</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          required
        />

        <label className="mt-4 block text-sm font-medium text-slate-700">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          required
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "登录中..." : "登录"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          没有账号？
          <Link href="/register" className="text-slate-900 underline">
            立即注册
          </Link>
        </p>
      </form>
    </main>
  );
}