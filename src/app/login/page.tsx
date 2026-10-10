"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error("Admin login error:", error.message);
        toast.error(error.message);
        return;
      }

      if (!data.user) {
        toast.error("Unable to verify account.");
        return;
      }

      toast.success("Signed in successfully");
      router.replace("/admin");
    } catch (error) {
      console.error("Admin login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-10">
        <h1 className="text-4xl font-extrabold mb-3">
          Admin Login
        </h1>

        <p className="text-gray-400 mb-8">
          Sign in with your administrator account.
        </p>

        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
            className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}
