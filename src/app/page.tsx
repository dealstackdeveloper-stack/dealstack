"use client";

export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");
  const [products, setProducts] = useState<any[]>([]);

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
    }

    fetchProducts();
  }, []);

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === "low-high") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOption === "high-low") {
        return Number(b.price) - Number(a.price);
      }

      if (sortOption === "a-z") {
        return a.title.localeCompare(b.title);
      }

      return 0;
    });

  function selectCategory(category: string) {
    setSelectedCategory(category);

    document.getElementById("featured-products")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

        <div className="mt-10 flex gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("All");
              document.getElementById("featured-products")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="rounded-xl bg-white px-8 py-4 font-bold text-black transition hover:bg-gray-200"
          >
            Shop Now
          </button>

          <button
            type="button"
            onClick={() => {
              document.getElementById("shop-categories")?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }}
            className="rounded-xl border border-gray-700 px-8 py-4 transition hover:border-white"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* Search */}
      <section className="px-8 py-10">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-gray-800 bg-gray-900 px-6 py-4 text-white outline-none transition focus:border-white"
        />
      </section>

      {/* Category Filters */}
      <section className="flex flex-wrap gap-4 px-8 pb-10">
        {[
          "All",
          "Surveillance Systems",
          "Networking Switches & Routers",
          "Surveillance Hard Disk",
          "Gadget & Accessories",
        ].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-xl border px-6 py-3 transition ${
              selectedCategory === category
                ? "border-white bg-white text-black"
                : "border-gray-800 bg-gray-900 text-white hover:border-gray-600"
            }`}
          >
            {category}
          </button>
        ))}
      </section>

      {/* Sorting */}
      <section className="px-8 pb-10">
        <select
          aria-label="Sort products"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-3 text-white outline-none"
        >
          <option value="default">Default Sorting</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="a-z">Alphabetical: A-Z</option>
        </select>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="scroll-mt-6 px-8 pb-20">
        <h2 className="mb-4 text-4xl font-bold">
          Featured Products
        </h2>

        <p className="mb-10 text-gray-400">
          {selectedCategory === "All"
            ? `Showing ${filteredProducts.length} products`
            : `${selectedCategory} · ${filteredProducts.length} products`}
        </p>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
                slug={product.slug}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-10 text-center">
            <p className="text-lg text-gray-300">
              No products found in this selection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearch("");
              }}
              className="mt-5 rounded-xl bg-white px-6 py-3 font-semibold text-black hover:bg-gray-200"
            >
              Show All Products
            </button>
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section
        id="shop-categories"
        className="scroll-mt-6 px-8 pb-24"
      >
        <h2 className="mb-10 text-4xl font-bold">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <CategoryCard
            title="Surveillance Systems"
            onClick={() => selectCategory("Surveillance Systems")}
          />

          <CategoryCard
            title="Networking Switches & Routers"
            onClick={() =>
              selectCategory("Networking Switches & Routers")
            }
          />

          <CategoryCard
            title="Surveillance Hard Disk"
            onClick={() => selectCategory("Surveillance Hard Disk")}
          />

          <CategoryCard
            title="Gadget & Accessories"
            onClick={() => selectCategory("Gadget & Accessories")}
          />
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
