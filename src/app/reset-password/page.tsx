
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090d15] px-4 py-3.5 text-white placeholder:text-gray-500 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"request" | "update">("request");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setMode("update");
      } else if (event === "SIGNED_OUT") {
        setMode("request");
      }
    });

    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!error && data.session) {
        // A valid recovery session is established by the email link.
        // A normal signed-in session alone does not prove recovery intent.
        const hash = window.location.hash;
        if (
          hash.includes("type=recovery") ||
          window.location.search.includes("type=recovery")
        ) {
          setMode("update");
        }
      }

      setCheckingSession(false);
    }

    void checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleRequestReset(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "If an account exists for that email, a reset link will be sent."
      );
    } catch {
      toast.error("Unable to send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        toast.error(
          "Your reset link is invalid or expired. Please request a new one."
        );
        setMode("request");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully.");

      await supabase.auth.signOut();
      router.push("/customer-login");
      router.refresh();
    } catch {
      toast.error("Unable to update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 text-white">
        <p className="text-sm text-gray-400">Checking password reset link...</p>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b12] px-4 py-10 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-yellow-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <section className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0e131d] p-6 shadow-2xl sm:p-10">
        <Link href="/" className="mb-10 inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-black text-black">
            D
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            dealstack<span className="text-yellow-400">.</span>
          </span>
        </Link>

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
          Account security
        </p>

        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">
          {mode === "update" ? "Set a new password" : "Forgot your password?"}
        </h1>

        <p className="mt-4 text-sm leading-6 text-gray-400">
          {mode === "update"
            ? "Choose a strong new password for your Dealstack account."
            : "Enter the email address registered to your account. We'll send instructions to reset your password."}
        </p>

        {mode === "request" ? (
          <form onSubmit={handleRequestReset} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="reset-email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending reset link..." : "Send reset link →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                New password
              </label>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                className={inputClass}
              />
            </div>

            <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
                className="accent-yellow-400"
              />
              Show passwords
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update password →"}
            </button>
          </form>
        )}

        <div className="mt-7 border-t border-white/10 pt-6 text-center">
          <Link
            href="/customer-login"
            className="text-sm font-semibold text-yellow-400 transition hover:text-yellow-300"
          >
            ← Back to customer login
          </Link>
        </div>
      </section>
    </main>
  );
}
