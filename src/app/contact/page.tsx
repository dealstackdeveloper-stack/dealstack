
"use client";

import { useState } from "react";
import Link from "next/link";

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

  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const subject = encodeURIComponent(
      form.subject || "Customer Enquiry - Dealstack"
    );

    const body = encodeURIComponent(
      `Name: ${form.name}\n` +
        `Email: ${form.email}\n` +
        `Phone: ${form.phone || "Not provided"}\n\n` +
        `Message:\n${form.message}`
    );

    window.location.href =
      `mailto:support@dealstack.in?subject=${subject}&body=${body}`;

    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-12 inline-flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 text-lg font-black text-black">
            D
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            dealstack<span className="text-yellow-400">.</span>
          </span>
        </Link>

        <header className="mb-12 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-yellow-400">
            We are here to help
          </p>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Let’s talk.
            <span className="text-yellow-400"> We’re listening.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Questions about a product, an order, delivery, or a business
            enquiry? Contact our team and we’ll help you find the right
            solution.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          <aside className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-white/10 bg-[#101621] p-6 sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-400">
                Contact information
              </p>

              <h2 className="mt-3 text-2xl font-bold">Get in touch</h2>

              <p className="mt-3 text-sm leading-7 text-gray-400">
                Choose the right contact for your enquiry. For order-related
                questions, include your order ID in your message.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-lg text-yellow-400">
                    @
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Customer support
                    </p>
                    <a
                      href="mailto:support@dealstack.in"
                      className="mt-1 block break-all font-semibold transition hover:text-yellow-400"
                    >
                      support@dealstack.in
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10 text-lg text-yellow-400">
                    ↗
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Sales enquiries
                    </p>
                    <a
                      href="mailto:sales@dealstack.in"
                      className="mt-1 block break-all font-semibold transition hover:text-yellow-400"
                    >
                      sales@dealstack.in
                    </a>
                  </div>
                </div>

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

              <div className="mt-8 rounded-xl border border-white/10 bg-[#090d15] p-5">
                <h3 className="font-bold">Need order assistance?</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Check your order history and keep your order ID handy before
                  contacting support.
                </p>
                <Link
                  href="/account"
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-yellow-400 transition hover:text-yellow-300"
                >
                  View my orders <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>

            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/[0.06] p-6">
              <p className="text-sm font-bold text-yellow-300">
                A quick note
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Submitting this form opens your default email application.
                Your enquiry is sent only after you send that email.
              </p>
            </div>
          </aside>

          <section className="rounded-2xl border border-white/10 bg-[#101621] p-6 sm:p-8 lg:col-span-3">
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-yellow-400">
                Send an enquiry
              </p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                How can we help?
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-400">
                Fill in the details below to prepare your email to our support
                team.
              </p>
            </div>

            {submitted && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4 text-sm leading-6 text-yellow-200"
              >
                Your email application should have opened. Please send the
                prepared email to submit your enquiry.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
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
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

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
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
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
                    onChange={(event) =>
                      setForm({ ...form, subject: event.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Select enquiry type
                    </option>
                    <option value="Product Enquiry">Product enquiry</option>
                    <option value="Order Status">Order status</option>
                    <option value="Shipping and Delivery">
                      Shipping and delivery
                    </option>
                    <option value="Return or Replacement">
                      Return or replacement
                    </option>
                    <option value="Payment Enquiry">Payment enquiry</option>
                    <option value="Business Enquiry">Business enquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

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
                  onChange={(event) =>
                    setForm({ ...form, message: event.target.value })
                  }
                  placeholder="Tell us how we can help..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black transition hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-[#101621]"
              >
                Prepare enquiry email <span aria-hidden="true">→</span>
              </button>

              <p className="text-xs leading-5 text-gray-500">
                This form does not send data directly to a server. Your default
                email application will open with the enquiry details.
              </p>
            </form>
          </section>
        </div>

        <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Dealstack. All rights reserved.</p>
          <Link
            href="/"
            className="transition hover:text-yellow-400"
          >
            ← Back to shopping
          </Link>
        </footer>
      </div>
    </main>
  );
}
