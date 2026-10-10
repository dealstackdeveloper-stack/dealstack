
"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

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

  const goToSection = (sectionId: string) => {
    setMenuOpen(false);

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
    setMenuOpen(false);

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    setUser(null);
    toastLogout();
    router.push("/");
    router.refresh();
  }

  function toastLogout() {
    // Keep logout feedback simple without adding another dependency.
    console.info("Logged out successfully.");
  }

  const navLinkClass =
    "cursor-pointer transition hover:text-white";

  return (
    <nav className="relative z-50 flex items-center justify-between gap-3 border-b border-gray-800 bg-black px-4 py-5 text-white md:px-8">
      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className="shrink-0 text-2xl font-bold tracking-wide md:text-3xl"
      >
        Dealstack
      </Link>

      <ul className="hidden gap-8 text-gray-300 md:flex">
        <li>
          <Link href="/" className={navLinkClass}>Home</Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => goToSection("featured-products")}
            className={navLinkClass}
          >
            Products
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => goToSection("shop-categories")}
            className={navLinkClass}
          >
            Categories
          </button>
        </li>
        <li>
          <Link href="/contact" className={navLinkClass}>Contact</Link>
        </li>
      </ul>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="text-3xl md:hidden"
        >
          {menuOpen ? "×" : "☰"}
        </button>

        <div className="relative">
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="inline-block rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 font-semibold transition hover:border-white md:px-5"
          >
            Cart
          </Link>
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
            {totalItems}
          </span>
        </div>

        {!authLoading && (
          user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/account"
                className="max-w-40 truncate rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold hover:border-white"
                title={user.email ?? "My Account"}
              >
                {user.user_metadata?.full_name ||
                  user.email ||
                  "My Account"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={signingOut}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-50"
              >
                {signingOut ? "Logging out..." : "Log out"}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/customer-login"
                className="rounded-lg border border-gray-700 px-4 py-2 font-semibold hover:border-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-4 py-2 font-semibold text-black hover:bg-gray-200"
              >
                Sign up
              </Link>
            </div>
          )
        )}
      </div>

      {menuOpen && (
        <div className="absolute left-0 top-full w-full border-t border-gray-800 bg-black px-6 py-6 shadow-lg md:hidden">
          <ul className="flex flex-col gap-6 text-lg text-gray-300">
            <li>
              <Link href="/" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                Home
              </Link>
            </li>
            <li>
              <button type="button" onClick={() => goToSection("featured-products")} className={navLinkClass}>
                Products
              </button>
            </li>
            <li>
              <button type="button" onClick={() => goToSection("shop-categories")} className={navLinkClass}>
                Categories
              </button>
            </li>
            <li>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                Contact
              </Link>
            </li>

            {!authLoading && (
              user ? (
                <>
                  <li className="break-all border-t border-gray-800 pt-4 text-sm text-gray-400">
                    Signed in as {user.email}
                  </li>
                  <li>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                      My Account
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={handleLogout} disabled={signingOut} className={navLinkClass}>
                      {signingOut ? "Logging out..." : "Log out"}
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/customer-login" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                      Customer Log in
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                      Customer Sign up
                    </Link>
                  </li>
                </>
              )
            )}

            <li className="border-t border-gray-800 pt-4">
              <Link href="/login" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                Admin Login
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
