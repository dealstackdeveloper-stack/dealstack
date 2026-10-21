
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090d15] px-4 py-3.5 text-white placeholder:text-gray-500 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please complete all your details.");
      return;
    }

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
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.session) {
        toast.success("Your account has been created!");
        router.push("/");
        router.refresh();
      } else {
        toast.success(
          "Registration submitted. Please confirm your email before logging in."
        );
        router.push("/customer-login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Unable to register. Please try again.");
    } finally {
      setLoading(false);
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
              Your next upgrade starts here
            </span>
            <h1 className="mt-7 text-5xl font-extrabold leading-tight">
              Smart products.
              <br />
              <span className="text-yellow-400">Better choices.</span>
            </h1>
            <p className="mt-6 max-w-sm leading-7 text-gray-400">
              Create your Dealstack account to manage your orders and enjoy a
              more convenient shopping experience.
            </p>
          </div>

          <p className="text-sm text-gray-500">
            Technology and accessories, all in one place.
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

          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-yellow-400">
              Join Dealstack
            </p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              Create account
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              Enter your details to get started.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-300">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </div>

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
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-300">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-300">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
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
                Show passwords
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-yellow-400 px-5 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create my account →"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/customer-login" className="font-semibold text-yellow-400 hover:text-yellow-300">
              Log in
            </Link>
          </p>

          <div className="my-6 border-t border-white/10" />

          <Link href="/" className="block text-center text-sm text-gray-400 transition hover:text-white">
            ← Back to shopping
          </Link>
        </section>
      </div>
    </main>
  );
}
