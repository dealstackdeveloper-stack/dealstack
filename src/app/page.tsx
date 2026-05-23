"use client";

export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";



export default function Home() {

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortOption, setSortOption] =
  useState("default");

  const [products, setProducts] =
  useState<any[]>([]);
  
  useEffect(() => {

  async function fetchProducts() {

    const { data, error } =
      await supabase
        .from("products")
        .select("*");

    if (error) {

      console.log(error);

    } else {

      setProducts(data);
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

  return (
    <main className="min-h-screen bg-black text-white">

      <Navbar />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight max-w-4xl">
          Modern Tech Marketplace for Smart Shopping
        </h1>

        <p className="mt-6 text-gray-400 text-lg max-w-2xl">
          Explore premium electronics, networking devices,
          CCTV systems, accessories, and future-ready
          technology products.
        </p>

        <div className="flex gap-4 mt-10">

          <button className="bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
            Shop Now
          </button>

          <button className="border border-gray-700 px-8 py-4 rounded-xl hover:border-white transition">
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
          className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-white transition"
        />

      </section>

      {/* Categories Filter */}
      <section className="px-8 pb-10 flex flex-wrap gap-4">

        {[
          "All",
          "Surveillance Systems",
          "Networking Switches & Routers",
          "Surveillance Hard Disk",
          "Gadget & Accessories",
        ].map((category) => (

          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-xl border transition ${
              selectedCategory === category
                ? "bg-white text-black border-white"
                : "bg-gray-900 text-white border-gray-800"
            }`}
          >
            {category}
          </button>

        ))}

      </section>

{/* Sorting */}
<section className="px-8 pb-10">

  <select
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-3 text-white outline-none"
  >

    <option value="default">
      Default Sorting
    </option>

    <option value="low-high">
      Price: Low to High
    </option>

    <option value="high-low">
      Price: High to Low
    </option>

    <option value="a-z">
      Alphabetical: A-Z
    </option>

  </select>

</section>

      {/* Featured Products */}
      <section className="px-8 pb-20">

        <h2 className="text-4xl font-bold mb-10">
          Featured Products
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

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

      </section>

      {/* Categories */}
      <section className="px-8 pb-24">

        <h2 className="text-4xl font-bold mb-10">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <CategoryCard title="Surveillance Systems" />

          <CategoryCard title="Networking Switches & Routers" />

          <CategoryCard title="Surveillance Hard Disk" />

          <CategoryCard title="Gadget & Accessories" />

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-10 px-8 text-center text-gray-500">

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