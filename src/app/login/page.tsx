"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import toast from "react-hot-toast";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {

  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  function handleLogin(
    e: React.FormEvent
  ) {

    e.preventDefault();

    const success = login(
      email,
      password
    );

    if (success) {

      toast.success("Login successful");

      router.push("/admin");

    } else {

      toast.error("Invalid credentials");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-10">

        <h1 className="text-4xl font-extrabold mb-8">
          Admin Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-black border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
          />

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition"
          >

            Login

          </button>

        </form>

      </div>

    </main>
  );
}