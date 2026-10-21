
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090d15] px-4 py-3.5 text-white placeholder:text-gray-500 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function CustomerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Enter your email address first.");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("If the account exists, a password reset email will be sent.");
    } catch {
      toast.error("Unable to request a password reset. Please try again.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b12] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-yellow-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0e131d] shadow-2xl lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-[#171e2b] via-[#101621] to-[#0a0e15] p-10 lg:flex xl:p-14">
          <Link href="/" className="inline-flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-xl font-black text-black">
              D
            </span>
            <span className="text-2xl font-extrabold tracking-tight">
              dealstack<span className="text-yellow-400">.</span>
            </span>
          </Link>

          <div className="my-12">
            <span className="rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-yellow-300">
              Welcome back
            </span>
            <h1 className="mt-7 text-5xl font-extrabold leading-tight">
              Your account.
              <br />
              <span className="text-yellow-400">Your convenience.</span>
            </h1>
            <p className="mt-6 max-w-sm leading-7 text-gray-400">
              Sign in to view your orders, manage your account, and continue
              shopping on Dealstack.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Good to have you back.
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-black text-black">
              D
            </span>
            <span className="text-xl font-extrabold">
              dealstack<span className="text-yellow-400">.</span>
            </span>
          </Link>

          <div className="mb-9">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Customer account
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Sign in
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-yellow-400 transition hover:text-yellow-300"
                >
                  Forgot password?
                </button>
              </div>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />

              <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="accent-yellow-400"
                />
                Show password
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in to Dealstack →"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-500">NEW TO DEALSTACK?</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Link
            href="/signup"
            className="block w-full rounded-xl border border-white/15 px-5 py-3.5 text-center font-semibold transition hover:border-yellow-400 hover:text-yellow-300"
          >
            Create an account
          </Link>

          <Link href="/" className="mt-7 block text-center text-sm text-gray-400 transition hover:text-white">
            ← Back to shopping
          </Link>
        </section>
      </div>
    </main>
  );
}
