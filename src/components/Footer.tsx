
import Link from "next/link";

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
  { label: "Business with us", href: "/business-with-us" },
  { label: "Become A Partner", href: "/become-a-partner" },
];

const policyLinks = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund & Return", href: "/refund-return" },
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

export default function Footer() {
  return (
    <footer className="bg-[#080b12] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {/* Company */}
          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-yellow-400">
              Company info
            </h2>

            <nav aria-label="Company links">
              <ul className="space-y-3">
                {companyLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-300 transition hover:text-yellow-400 sm:text-lg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Policies */}
          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-yellow-400">
              Quick Links
            </h2>

            <nav aria-label="Policies and information">
              <ul className="space-y-3">
                {policyLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-base text-gray-300 transition hover:text-yellow-400 sm:text-lg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Newsletter and social links */}
          <div>
            <h2 className="text-lg font-extrabold uppercase text-white">
              Sign Up for Newsletter
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Subscribe to receive the latest product updates, offers and news
              from Dealstack.
            </p>

            <form
              action="/newsletter"
              method="get"
              className="mt-5 flex flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-white px-4 py-3 text-sm text-black outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
              />

              <button
                type="submit"
                className="rounded-lg bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-300">
                Follow us
              </p>

              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-lg font-bold text-white transition hover:scale-110"
                >
                  ◎
                </a>

                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white transition hover:scale-110"
                >
                  f
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t border-white/15 pt-6 text-center sm:mt-12">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-wide text-white transition hover:text-yellow-400"
          >
            Dealstack
          </Link>

          <p className="mt-2 text-sm text-gray-400">
            © {new Date().getFullYear()} Dealstack. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
