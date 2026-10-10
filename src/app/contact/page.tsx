"use client";

import { useState } from "react";
import Link from "next/link";

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

  const inputClass =
    "w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-white";

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Heading */}
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
            We are here to help
          </p>

          <h1 className="text-4xl font-extrabold md:text-6xl">
            Contact Dealstack
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-400 md:text-lg">
            Have a question about a product, an order, delivery, or a business
            enquiry? Send us a message and we will help you find the right
            solution.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Contact Information */}
          <section className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">
              <h2 className="text-2xl font-bold">Get in Touch</h2>

              <p className="mt-3 leading-7 text-gray-400">
                Contact our team for assistance with your shopping experience
                and enquiries.
              </p>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-sm text-gray-400">Email Support</p>
                  <a
                    href="mailto:support@dealstack.in"
                    className="mt-1 inline-block break-all font-semibold hover:text-gray-300"
                  >
                    support@dealstack.in
                  </a>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Sales Enquiries</p>
                  <a
                    href="mailto:sales@dealstack.in"
                    className="mt-1 inline-block break-all font-semibold hover:text-gray-300"
                  >
                    sales@dealstack.in
                  </a>
                </div>

                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <Link
                    href="/"
                    className="mt-1 inline-block font-semibold hover:text-gray-300"
                  >
                    www.dealstack.in
                  </Link>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-800 pt-6">
                <p className="text-sm leading-6 text-gray-400">
                  For order-related enquiries, please include your order ID so
                  our team can identify your purchase more easily.
                </p>

                <Link
                  href="/account"
                  className="mt-4 inline-block font-semibold underline underline-offset-4 hover:text-gray-300"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8 lg:col-span-3">
            <h2 className="text-2xl font-bold">Send Us a Message</h2>

            <p className="mt-2 text-sm text-gray-400">
              Complete the form below to prepare an enquiry email.
            </p>

            {submitted && (
              <div className="mt-5 rounded-xl border border-green-800 bg-green-950/40 p-4 text-sm text-green-300">
                Your email application should open with your enquiry details.
                Please send the email to submit your enquiry.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Full Name *
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
                    Email Address *
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
                    Phone Number
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
                    Subject *
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
                    <option value="Product Enquiry">Product Enquiry</option>
                    <option value="Order Status">Order Status</option>
                    <option value="Shipping and Delivery">
                      Shipping and Delivery
                    </option>
                    <option value="Return or Replacement">
                      Return or Replacement
                    </option>
                    <option value="Payment Enquiry">Payment Enquiry</option>
                    <option value="Business Enquiry">Business Enquiry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Your Message *
                </label>

                <textarea
                  id="contact-message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  value={form.message}
                  onChange={(event) =>
                    setForm({ ...form, message: event.target.value })
                  }
                  placeholder="How can we help you?"
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-2 text-right text-xs text-gray-500">
                  {form.message.length}/5000 characters
                </p>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-gray-200"
              >
                Prepare Enquiry Email →
              </button>

              <p className="text-xs leading-5 text-gray-500">
                This form opens your default email application. Your enquiry is
                not submitted to Dealstack until you send the email.
              </p>
            </form>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-sm text-gray-400 underline underline-offset-4 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
