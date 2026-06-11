"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await register(username, password);
      setSuccess(res.message || "注册成功，请登录");
      setTimeout(() => router.push("/login"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">注册</h1>
        <p className="mt-2 text-sm text-slate-600">创建账号后即可登录使用。</p>

        <label className="mt-6 block text-sm font-medium text-slate-700">用户名</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          required
          minLength={3}
        />

        <label className="mt-4 block text-sm font-medium text-slate-700">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
          required
          minLength={6}
        />

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="mt-3 text-sm text-green-600">{success}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "注册中..." : "注册"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          已有账号？
          <Link href="/login" className="text-slate-900 underline">
            去登录
          </Link>
        </p>
      </form>
    </main>
  );
}
