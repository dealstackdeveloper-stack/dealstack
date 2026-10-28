"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  price: number | string;
  image: string;
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category") ?? "";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("title", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("Error fetching products:", error);
        setLoadError(true);
        setLoading(false);
        return;
      }

      const productList = (data ?? []) as Product[];

      setProducts(productList);

      const uniqueCategories = Array.from(
        new Set(
          productList
            .map((product) => product.category)
            .filter((category): category is string => Boolean(category))
        )
      ).sort();

      setCategories(["All", ...uniqueCategories]);
      setLoading(false);
    }

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl || "All");
  }, [categoryFromUrl]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      !searchText ||
      String(product.title ?? "").toLowerCase().includes(searchText) ||
      String(product.category ?? "").toLowerCase().includes(searchText);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Compact catalogue header with filters on the right */}
      <section className="border-b border-slate-800 bg-gradient-to-br from-[#101827] to-[#080a0f] text-white">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-yellow-300"
          >
            <span aria-hidden="true">←</span>
            Back to Home
          </Link>

          <div className="mt-4 grid items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
            {/* Left: Catalogue title */}
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
                Dealstack Store
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl xl:text-5xl">
                Product Catalogue
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Explore surveillance systems, networking equipment,
                storage solutions and technology accessories.
              </p>

              {!loading && !loadError && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  {products.length}{" "}
                  {products.length === 1 ? "product available" : "products available"}
                </div>
              )}
            </div>

            {/* Right: Search and category filters */}
            <div className="min-w-0 rounded-2xl border border-white/15 bg-white/5 p-4 shadow-xl backdrop-blur-sm sm:p-5">
              <label
                htmlFor="product-search"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Find your product
              </label>

              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500"
                  aria-hidden="true"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                </svg>

                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-white">
                  {selectedCategory === "All"
                    ? "Browse categories"
                    : selectedCategory}
                </h2>

                {!loading && !loadError && (
                  <span className="shrink-0 text-xs text-slate-300">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "result" : "results"}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const active = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      aria-pressed={active}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                        active
                          ? "border-yellow-400 bg-yellow-400 text-black shadow-md shadow-yellow-400/10"
                          : "border-white/20 bg-white/10 text-slate-200 hover:border-yellow-300/60 hover:text-yellow-300"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              {(search || selectedCategory !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                  className="mt-3 text-xs font-semibold text-yellow-300 transition hover:text-white"
                >
                  Clear filters ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product results */}
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow-700">
                {selectedCategory === "All"
                  ? "Explore our collection"
                  : "Selected category"}
              </p>

              <h2 className="mt-1 text-xl font-black sm:text-2xl">
                {selectedCategory === "All"
                  ? "All Products"
                  : selectedCategory}
              </h2>
            </div>

            {!loading && !loadError && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-square animate-pulse bg-slate-100" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-400">
                !
              </div>

              <h2 className="mt-5 text-xl font-bold">
                Unable to load products
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Please check your connection and try again.
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="h-8 w-8"
                  aria-hidden="true"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No products found
              </h2>

              <p className="mt-3 text-slate-500">
                Try a different search term or select another category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
                className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-400 hover:shadow-xl hover:shadow-slate-900/10"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-50 p-5">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={500}
                        height={500}
                        className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        Image unavailable
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-lg bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      Dealstack
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                      {product.category || "Technology"}
                    </p>

                    <h3 className="mt-2 min-h-[3.5rem] text-lg font-bold leading-7 text-slate-900 transition group-hover:text-yellow-700">
                      {product.title}
                    </h3>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="mt-1 text-xl font-black text-slate-950">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-800 transition group-hover:bg-yellow-400 group-hover:text-slate-950">
                        View Details
                        <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Contact assistance */}
        {!loading && !loadError && filteredProducts.length > 0 && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-gradient-to-r from-[#101827] to-[#080a0f] p-6 text-white shadow-lg sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">
                Need help choosing the right product?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Contact our team for product and compatibility assistance.
              </p>
            </div>

            <Link
              href="/contact"
              className="mt-5 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-yellow-300 sm:mt-0"
            >
              Contact Us <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}