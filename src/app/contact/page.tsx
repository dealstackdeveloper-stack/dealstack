
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090d15] px-4 py-3.5 text-white placeholder:text-gray-500 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to send enquiry.");
      }

      setStatus("success");

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <>
      {/* Navbar */}
      <Navbar />

      <main className="bg-white text-gray-900">
        {/* ================= HERO SECTION ================= */}
        <section className="bg-[#101621] px-4 py-10 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Hero Heading */}
            <header className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-yellow-400">
                We are here to help
              </p>

              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                <span className="text-white-400">Let’s talk.</span>{" "}
                <span className="text-yellow-400">We’re listening.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
                Questions about a product, an order, delivery, or a business
                enquiry? Contact our team and we’ll help you find the right
                solution.
              </p>
            </header>
          </div>
        </section>

        {/* ================= CONTACT SECTION ================= */}
        <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
              {/* Contact Information */}
              <aside className="space-y-5 lg:col-span-2">
                <section className="rounded-2xl border border-white/10 bg-[#101621] p-6 text-white sm:p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-400">
                    Contact information
                  </p>

                  <h2 className="mt-3 text-2xl font-bold">Get in touch</h2>

                  <p className="mt-3 text-sm leading-7 text-gray-400">
                    Choose the right enquiry type. For order-related questions,
                    include your order ID in your message.
                  </p>

                  <div className="mt-8 space-y-6">
                    {/* Email */}
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-lg text-yellow-400">
                        @
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Customer support & sales
                        </p>

                        <a
                          href="mailto:developer.dealstack@gmail.com"
                          className="mt-1 block break-all font-semibold transition hover:text-yellow-400"
                        >
                          dealstack.developer@gmail.com
                        </a>
                      </div>
                    </div>

                    {/* Website */}
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-lg text-yellow-400">
                        ↗
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Website
                        </p>

                        <Link
                          href="/"
                          className="mt-1 block font-semibold transition hover:text-yellow-400"
                        >
                          www.dealstack.in
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Assistance */}
                  <div className="mt-8 rounded-xl border border-white/10 bg-[#090d15] p-5">
                    <h3 className="font-bold">Need order assistance?</h3>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      Check your order history and keep your order ID handy
                      before contacting support.
                    </p>

                    <Link
                      href="/account"
                      className="mt-4 inline-flex items-center gap-2 font-semibold text-yellow-400 transition hover:text-yellow-300"
                    >
                      View my orders <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </section>
              </aside>

              {/* Enquiry Form */}
              <section className="rounded-2xl border border-gray-200 bg-[#101621] p-6 text-white sm:p-8 lg:col-span-3">
                <div className="mb-8">
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-400">
                    Send an enquiry
                  </p>

                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                    How can we help?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    Fill in the details below. Your enquiry will be sent
                    directly to our team.
                  </p>
                </div>

                {/* Success Message */}
                {status === "success" && (
                  <div
                    role="status"
                    className="mb-6 rounded-xl border border-green-400/30 bg-green-400/10 p-4 text-sm text-green-200"
                  >
                    Your enquiry has been sent successfully. Thank you for
                    contacting Dealstack!
                  </div>
                )}

                {/* Error Message */}
                {status === "error" && (
                  <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
                  >
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Full name *
                      </label>

                      <input
                        id="contact-name"
                        required
                        maxLength={100}
                        autoComplete="name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Enter your name"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Email address *
                      </label>

                      <input
                        id="contact-email"
                        required
                        type="email"
                        maxLength={254}
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Phone & Enquiry Type */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Phone number
                      </label>

                      <input
                        id="contact-phone"
                        type="tel"
                        maxLength={20}
                        autoComplete="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="Your contact number"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Enquiry type *
                      </label>

                      <select
                        id="contact-subject"
                        required
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        className={inputClass}
                      >
                        <option value="" disabled>
                          Select enquiry type
                        </option>

                        <option value="Product Enquiry">
                          Product enquiry
                        </option>

                        <option value="Order Status">
                          Order status
                        </option>

                        <option value="Shipping and Delivery">
                          Shipping and delivery
                        </option>

                        <option value="Return or Replacement">
                          Return or replacement
                        </option>

                        <option value="Payment Enquiry">
                          Payment enquiry
                        </option>

                        <option value="Business Enquiry">
                          Business enquiry
                        </option>

                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label
                        htmlFor="contact-message"
                        className="text-sm font-medium text-gray-300"
                      >
                        Your message *
                      </label>

                      <span className="text-xs text-gray-500">
                        {form.message.length}/5000
                      </span>
                    </div>

                    <textarea
                      id="contact-message"
                      required
                      minLength={10}
                      maxLength={5000}
                      rows={7}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Tell us how we can help..."
                      className={`${inputClass} resize-y`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "loading"
                      ? "Sending enquiry..."
                      : "Send Enquiry →"}
                  </button>

                  <p className="text-xs leading-5 text-gray-500">
                    Your enquiry will be emailed securely to our team.
                  </p>
                </form>
              </section>
            </div>

            {/* Back to Shopping */}
            <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
              <Link href="/" className="transition hover:text-yellow-400">
                ← Back to shopping
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
