"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";

const FEATURED_PRODUCTS_LIMIT = 4;

const categories = [
  "Surveillance Systems",
  "Networking Switches & Routers",
  "Surveillance Hard Disk",
  "Gadget & Accessories",
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) {
        console.error("Failed to fetch products:", error);
      } else {
        setProducts(data ?? []);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const title = String(product.title ?? "").toLowerCase();
      const category = String(product.category ?? "").toLowerCase();
      const searchText = search.trim().toLowerCase();

      return (
        title.includes(searchText) ||
        category.includes(searchText)
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
    });

  const featuredProducts = filteredProducts.slice(
    0,
    FEATURED_PRODUCTS_LIMIT
  );

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function selectCategory(category: string) {
    window.location.href = `/products?category=${encodeURIComponent(
      category
    )}`;
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="max-w-4xl text-5xl font-extrabold leading-tight md:text-7xl">
          Modern Tech Marketplace for Smart Shopping
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Explore premium electronics, networking devices,
          CCTV systems, accessories, and future-ready
          technology products.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
          href="/products" 
          className="rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:bg-gray-200"
          >  
            Shop Now
          </Link>

          <button
            type="button"
            onClick={() => scrollToSection("shop-categories")}
            className="rounded-xl border border-gray-700 px-8 py-4 transition hover:border-white"
          >
            Shop by Category
          </button>
        </div>
      </section>

      {/* Featured Product Search */}
      <section className="px-4 py-10 sm:px-8">
        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-2xl border border-gray-800 bg-gray-900 px-6 py-4 text-white outline-none transition focus:border-yellow-400"
        />
      </section>

      {/* Featured Product Sorting */}
      <section className="px-4 pb-8 sm:px-8">
        <select
          aria-label="Sort featured products"
          value={sortOption}
          onChange={(event) => setSortOption(event.target.value)}
          className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3 text-white outline-none"
        >
          <option value="default">Default Sorting</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="a-z">Alphabetical: A-Z</option>
        </select>
      </section>

      {/* Featured Products: Maximum 4 */}
      <section
        id="featured-products"
        className="scroll-mt-6 px-4 pb-20 sm:px-8"
      >
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Featured Products
            </h2>

            <p className="mt-3 text-gray-400">
              Discover a selection of products from Dealstack.
            </p>
          </div>

          <Link
            href="/products"
            className="font-semibold text-yellow-400 transition hover:text-yellow-300"
          >
            View All Products →
          </Link>
        </div>

        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading featured products...
          </p>
        ) : featuredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  slug={product.slug}
                />
              ))}
            </div>

            {filteredProducts.length > FEATURED_PRODUCTS_LIMIT && (
              <div className="mt-10 text-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black transition hover:bg-yellow-300"
                >
                  Explore All Products
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-lg text-gray-300">
              No matching products found.
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-5 text-yellow-400 hover:text-yellow-300"
              >
                Clear Search
              </button>
            )}

            <div className="mt-5">
              <Link
                href="/products"
                className="text-yellow-400 hover:text-yellow-300"
              >
                Browse All Products →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section
        id="shop-categories"
        className="scroll-mt-6 px-4 pb-24 sm:px-8"
      >
        <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
          Shop by Category
        </h2>

        <p className="mb-10 text-gray-400">
          Browse products by category to find what you need.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard
              key={category}
              title={category}
              onClick={() => selectCategory(category)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl border border-gray-700 px-8 py-4 font-semibold transition hover:border-yellow-400 hover:text-yellow-400"
          >
            View Complete Catalogue →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-8 py-10 text-center text-gray-500">
        <h3 className="text-2xl font-bold text-white">
          Dealstack
        </h3>

        <p className="mt-4">
          Modern eCommerce platform for future-ready
          technology products.
        </p>

        <p className="mt-6 text-sm">
          © 2026 Dealstack. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
