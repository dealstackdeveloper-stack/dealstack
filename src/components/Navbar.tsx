
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type IconName =
  | "home"
  | "package"
  | "grid"
  | "mail"
  | "cart"
  | "user"
  | "logout"
  | "shield";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v12h14V9M9 21v-7h6v7" />
        </svg>
      );
    case "package":
      return (
        <svg {...common}>
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 8 9 5 9-5M3 8v9l9 5 9-5V8M12 13v9" />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "cart":
      return (
        <svg {...common}>
          <path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.5L22 8H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 2.5 21 6v5.5c0 5.3-3.8 8.8-9 10.5-5.2-1.7-9-5.2-9-10.5V6l9-3.5Z" />
          <path d="M7.5 12h2.2l1.4-3 2.1 6 1.3-3h2" />
        </svg>
      );
  }
}

export default function Navbar() {
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (mounted) {
        setUser(error ? null : data.user);
        setAuthLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const closeMenu = () => setMenuOpen(false);

  const goToSection = (sectionId: string) => {
    closeMenu();

    if (pathname !== "/") {
      router.push(`/#${sectionId}`);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  async function handleLogout() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    setSigningOut(false);
    closeMenu();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    setUser(null);
    console.info("Logged out successfully.");
    router.push("/");
    router.refresh();
  }

  const navLinkClass =
    "inline-flex items-center gap-2 whitespace-nowrap text-sm font-medium text-gray-300 transition hover:text-yellow-400";

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black text-white shadow-lg shadow-black/20">
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

        {/* Dealstack brand logo */}
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Dealstack home"
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-400 text-black shadow-md shadow-yellow-400/10 transition duration-300 group-hover:rotate-3 group-hover:scale-105">
            <Icon name="shield" className="h-7 w-7" />
          </span>

          <span className="text-[25px] font-black tracking-tight sm:text-3xl">
            Deal<span className="text-yellow-400">stack</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-5 xl:gap-8 md:flex">
          <li>
            <Link href="/" className={navLinkClass}>
              <Icon name="home" className="h-[18px] w-[18px]" />
              Home
            </Link>
          </li>
          <li>
            <Link href="/products" className={navLinkClass}>
              <Icon name="package" className="h-[18px] w-[18px]" />
              Products
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => goToSection("shop-categories")}
              className={navLinkClass}
            >
              <Icon name="grid" className="h-[18px] w-[18px]" />
              Categories
            </button>
          </li>
          <li>
            <Link href="/contact" className={navLinkClass}>
              <Icon name="mail" className="h-[18px] w-[18px]" />
              Contact
            </Link>
          </li>
        </ul>

        {/* Cart and account actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

          {/* Shopping cart */}
          <Link
            href="/cart"
            onClick={closeMenu}
            aria-label={`Shopping cart, ${totalItems} items`}
            className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 font-semibold transition hover:border-yellow-400 hover:bg-yellow-400/10 sm:px-4"
          >
            <Icon name="cart" className="h-5 w-5 text-yellow-400" />
            <span className="hidden sm:inline">Cart</span>

            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[11px] font-black text-black ring-2 ring-black">
              {totalItems}
            </span>
          </Link>

          {/* Desktop account controls */}
          {!authLoading && (
            user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/account"
                  title={user.email ?? "My Account"}
                  className="flex h-11 max-w-48 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 transition hover:border-yellow-400 hover:bg-white/10"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-black">
                    <Icon name="user" className="h-4 w-4" />
                  </span>
                  <span className="max-w-28 truncate text-sm font-semibold">
                    {user.user_metadata?.full_name ||
                      user.email ||
                      "My Account"}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-black transition hover:bg-yellow-400 disabled:opacity-50"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  <span>{signingOut ? "Logging out..." : "Log out"}</span>
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/customer-login"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-3 text-sm font-semibold transition hover:border-yellow-400 hover:text-yellow-400"
                >
                  <Icon name="user" className="h-4 w-4" />
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-11 items-center rounded-xl bg-yellow-400 px-4 text-sm font-bold text-black transition hover:bg-yellow-300"
                >
                  Sign up
                </Link>
              </div>
            )
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-2xl transition hover:border-yellow-400 hover:text-yellow-400 md:hidden"
          >
            {menuOpen ? "×" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black px-5 py-5 shadow-xl md:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
              >
                <Icon name="home" /> Home
              </Link>
            </li>
            <li>
              <Link
                href="/products"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
              >
                <Icon name="package" /> Products
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => goToSection("shop-categories")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
              >
                <Icon name="grid" /> Categories
              </button>
            </li>
            <li>
              <Link
                href="/contact"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
              >
                <Icon name="mail" /> Contact
              </Link>
            </li>

            <li className="my-2 border-t border-white/10" />

            {!authLoading && (
              user ? (
                <>
                  <li className="px-3 py-2 text-xs text-gray-400">
                    Signed in as
                    <span className="mt-1 block break-all text-sm text-white">
                      {user.email}
                    </span>
                  </li>
                  <li>
                    <Link
                      href="/account"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
                    >
                      <Icon name="user" /> My Account
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={signingOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-gray-200 transition hover:bg-white/5 hover:text-yellow-400 disabled:opacity-50"
                    >
                      <Icon name="logout" />
                      {signingOut ? "Logging out..." : "Log out"}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/customer-login"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
                    >
                      <Icon name="user" /> Customer Log in
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      onClick={closeMenu}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-200 transition hover:bg-white/5 hover:text-yellow-400"
                    >
                      <Icon name="user" /> Customer Sign up
                    </Link>
                  </li>
                </>
              )
            )}

            <li className="mt-2 border-t border-white/10 pt-3">
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-gray-400 transition hover:text-yellow-400"
              >
                <Icon name="shield" /> Admin Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
