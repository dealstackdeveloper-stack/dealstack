"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";

type Product = {
  id: number;
  title: string;
  price: string;
  image: string;
  slug: string;
  category: string;
  is_active?: boolean;
};

type Banner = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  button_text: string | null;
  link_url: string | null;
  background_color: string | null;
};

const categories = [
  "Surveillance Systems",
  "Networking Switches & Routers",
  "Surveillance Hard Disk",
  "Gadget & Accessories",
];

const fallbackBanners: Banner[] = [
  {
    id: -1,
    title: "Smarter Security. Better Connectivity.",
    subtitle:
      "Explore CCTV, networking and technology essentials at Dealstack.",
    image_url: "",
    button_text: "Shop Products",
    link_url: "/products",
    background_color: "#101827",
  },
  {
    id: -2,
    title: "Technology That Works for You",
    subtitle:
      "Discover dependable products for homes, offices and businesses.",
    image_url: "",
    button_text: "Explore Catalogue",
    link_url: "/products",
    background_color: "#18181b",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);
  const [activeBanner, setActiveBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function load() {
      const [productResult, bannerResult] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true),
        supabase
          .from("homepage_banners")
          .select(
            "id,title,subtitle,image_url,button_text,link_url,background_color"
          )
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (!alive) return;

      if (productResult.error) {
        // Older product tables may not have is_active; retry without that filter.
        const retry = await supabase.from("products").select("*");

        if (!retry.error) {
          setProducts((retry.data ?? []) as Product[]);
        } else {
          console.error("Failed to fetch products:", productResult.error);
        }
      } else {
        setProducts((productResult.data ?? []) as Product[]);
      }

      if (!bannerResult.error && bannerResult.data?.length) {
        setBanners(bannerResult.data as Banner[]);
      }

      setLoading(false);
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveBanner((i) => (i + 1) % banners.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  const filteredProducts = useMemo(
    () =>
      products
        .filter((p) => {
          const q = search.trim().toLowerCase();

          return (
            String(p.title ?? "").toLowerCase().includes(q) ||
            String(p.category ?? "").toLowerCase().includes(q)
          );
        })
        .sort((a, b) => {
          if (sortOption === "low-high") {
            return Number(a.price) - Number(b.price);
          }

          if (sortOption === "high-low") {
            return Number(b.price) - Number(a.price);
          }

          if (sortOption === "a-z") {
            return String(a.title ?? "").localeCompare(
              String(b.title ?? "")
            );
          }

          return 0;
        }),
    [products, search, sortOption]
  );

  function selectCategory(category: string) {
    window.location.href = `/products?category=${encodeURIComponent(category)}`;
  }

  const banner = banners[activeBanner] ?? fallbackBanners[0];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* Promotional banner slider */}
      <section
        className="relative isolate overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundColor: banner.background_color || "#0f172a",
          backgroundImage: banner.image_url
            ? `linear-gradient(90deg, rgba(2,6,23,.88), rgba(2,6,23,.25)), url("${banner.image_url}")`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="mx-auto grid min-h-[420px] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 md:min-h-[500px] md:grid-cols-[1.1fr_.9fr] md:py-20">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[.2em] text-yellow-300">
              Dealstack • Technology Store
            </p>

            <h1 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
              {banner.title}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              {banner.subtitle ||
                "Explore CCTV, networking devices, storage and accessories for your next project."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={banner.link_url || "/products"}
                className="rounded-xl bg-yellow-400 px-6 py-3.5 font-bold text-slate-950 shadow-lg transition hover:bg-yellow-300"
              >
                {banner.button_text || "Shop Products"}{" "}
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/products"
                className="rounded-xl border border-white/30 px-6 py-3.5 font-semibold transition hover:border-yellow-300 hover:text-yellow-300"
              >
                View Catalogue
              </Link>
            </div>
          </div>

          <div className="hidden md:flex md:justify-end">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-sm">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 text-3xl text-slate-950">
                ✦
              </div>

              <p className="text-sm font-semibold uppercase tracking-[.18em] text-yellow-300">
                Your tech, simplified
              </p>

              <p className="mt-3 max-w-xs text-2xl font-bold leading-snug">
                Security, connectivity and accessories in one place.
              </p>
            </div>
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() =>
                setActiveBanner(
                  (i) => (i - 1 + banners.length) % banners.length
                )
              }
              className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-2xl text-white shadow-lg backdrop-blur transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950 sm:left-6"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Next banner"
              onClick={() =>
                setActiveBanner((i) => (i + 1) % banners.length)
              }
              className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-2xl text-white shadow-lg backdrop-blur transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-slate-950 sm:right-6"
            >
              ›
            </button>

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
              {banners.map((b, i) => (
                <button
                  type="button"
                  key={b.id}
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === activeBanner ? "true" : undefined}
                  onClick={() => setActiveBanner(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activeBanner
                      ? "w-8 bg-yellow-400"
                      : "w-2.5 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Shop by Category */}
      <section
        id="shop-categories"
        className="mx-auto max-w-7xl scroll-mt-6 px-5 py-14 sm:px-8 md:py-16"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em] text-yellow-600">
              Browse the store
            </p>

            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-3 text-slate-500">
              Find the right equipment for your setup.
            </p>
          </div>

          <Link
            href="/products"
            className="font-bold text-slate-800 hover:text-yellow-700"
          >
            All products →
          </Link>
        </div>

        {/* Number badges and CATEGORY labels removed */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category}
              className="[&>button]:h-full [&>button]:border-slate-200 [&>button]:bg-slate-50 [&>button]:text-slate-900 [&>button]:hover:border-yellow-400 [&>button]:hover:bg-yellow-50"
            >
              <CategoryCard
                title={category}
                onClick={() => selectCategory(category)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Search and sorting */}
      <section className="border-y border-slate-200 bg-slate-50 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="home-search">
            Search products
          </label>

          <input
            id="home-search"
            type="search"
            placeholder="Search products by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3.5 outline-none transition focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
          />

          <label className="sr-only" htmlFor="home-sort">
            Sort products
          </label>

          <select
            id="home-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 outline-none focus:border-yellow-400"
          >
            <option value="default">Default sorting</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
            <option value="a-z">Alphabetical: A–Z</option>
          </select>
        </div>
      </section>

      {/* Featured products by category */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:py-16">
        {categories.map((category, idx) => {
          const list = filteredProducts
            .filter((p) => p.category === category)
            .slice(0, 4);

          return (
            <section key={category} className="mb-16 last:mb-0">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-yellow-700">
                    Featured collection 0{idx + 1}
                  </p>

                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                    {category}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Selected products from this category.
                  </p>
                </div>

                <Link
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className="font-bold text-slate-800 hover:text-yellow-700"
                >
                  View category →
                </Link>
              </div>

              {loading ? (
                <p className="py-8 text-slate-500">Loading products...</p>
              ) : list.length ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {list.map((p) => (
                    <div
                      key={p.id}
                      className="[&>a>div]:border-slate-200 [&>a>div]:bg-white [&>a>div]:text-slate-900 [&>a>div]:shadow-sm [&>a>div]:hover:border-yellow-400 [&_p]:text-slate-500"
                    >
                      <ProductCard
                        title={p.title}
                        price={String(p.price ?? "0")}
                        image={
                          p.image ||
                          "/images/CP-GPC-DA24PL2C-SE-V2-dealstack.jpg"
                        }
                        slug={p.slug}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-slate-500">
                  {search
                    ? "No matching products in this category."
                    : "Products in this category will appear here."}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 px-5 py-12 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row">
          <div>
            <Link href="/" className="text-2xl font-black tracking-wide">
              Deal<span className="text-yellow-400">stack</span>
            </Link>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
              Technology products for security, networking and everyday
              connectivity.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            <Link href="/products" className="hover:text-yellow-300">
              Products
            </Link>

            <Link href="/contact" className="hover:text-yellow-300">
              Contact
            </Link>

            <Link href="/account" className="hover:text-yellow-300">
              My Account
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-5 text-xs text-slate-500">
          © 2026 Dealstack. All rights reserved.
        </div>
      </footer>
    </main>
  );
}