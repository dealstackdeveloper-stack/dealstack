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
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setLoadError(false);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("title", { ascending: true });

      if (error) {
        console.error("Error fetching products:", error);
        setLoadError(true);
        setLoading(false);
        return;
      }

      const productList = (data ?? []) as Product[];

      setProducts(productList);

      setCategories([
        "All",
        ...Array.from(
          new Set(
            productList
              .map((product) => product.category)
              .filter(Boolean)
          )
        ).sort(),
      ]);

      setLoading(false);
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory("All");
    }
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
    <main className="min-h-screen bg-black text-white px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto">

        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-gray-300 hover:text-yellow-400 transition"
        >
          <span aria-hidden="true">←</span>
          Back to Home
        </Link>

        {/* Page Heading */}
        <div className="mb-10">
          <p className="text-yellow-400 font-medium mb-3">
            DEALSTACK STORE
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold">
            Product Catalogue
          </h1>

          <p className="text-gray-400 mt-4">
            Explore our complete collection of products.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products or categories..."
            aria-label="Search products"
            className="w-full md:max-w-md bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-yellow-400"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 px-5 py-2.5 rounded-full font-medium transition ${
                selectedCategory === category
                  ? "bg-yellow-400 text-black"
                  : "bg-gray-900 text-gray-300 hover:bg-gray-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Active Selection and Product Count */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            {selectedCategory === "All"
              ? "All Products"
              : selectedCategory}
          </h2>

          {!loading && !loadError && (
            <p className="text-gray-400 mt-2">
              Showing {filteredProducts.length} products
            </p>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading products...
          </div>
        ) : loadError ? (
          <div className="py-20 text-center">
            <p className="text-lg text-red-400">
              Unable to load products. Please try again.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-black hover:bg-yellow-300"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="text-2xl font-bold">
              No products found
            </h2>

            <p className="text-gray-400 mt-3">
              Try another search or category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="mt-5 text-yellow-400 hover:text-yellow-300"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-yellow-400 transition duration-200"
              >
                <div className="relative aspect-square bg-white p-5">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={500}
                      height={500}
                      className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Image unavailable
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <p className="text-sm text-yellow-400 mb-2">
                    {product.category}
                  </p>

                  <h3 className="text-xl font-bold line-clamp-2 min-h-14">
                    {product.title}
                  </h3>

                  <div className="flex items-center justify-between gap-3 mt-5">
                    <p className="text-2xl font-bold">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </p>

                    <span className="text-yellow-400 font-semibold text-sm">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
