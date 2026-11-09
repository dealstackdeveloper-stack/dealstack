
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

type Product = {
  id: number | string;
  slug: string;
  title: string;
  category: string;
  price: number | string;
  image: string;
  brand?: string | null;
  subcategory?: string | null;
  rating?: number | null;
};

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

const SUBCATEGORY_OPTIONS: Record<string, string[]> = {
  "Surveillance Systems": [
    "All",
    "NVR",
    "DVR",
    "IP Cameras",
    "Analog Cameras",
    "PTZ Cameras",
    "Accessories",
  ],
  "Networking Equipment": [
    "All",
    "Switches",
    "Routers",
    "Access Points",
    "Fiber Optics",
    "SFP Modules",
  ],
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");

  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sortBy, setSortBy] = useState("default");
  const [pageSize, setPageSize] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedCategory(params.get("category") || "All");
  }, []);

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
            .filter(Boolean)
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

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        products
          .map((product) => product.brand)
          .filter((brand): brand is string => Boolean(brand))
      )
    ).sort();
  }, [products]);

  const subcategories = useMemo(() => {
    const databaseSubcategories = Array.from(
      new Set(
        products
          .filter(
            (product) =>
              selectedCategory === "All" ||
              product.category === selectedCategory
          )
          .map((product) => product.subcategory)
          .filter(
            (subcategory): subcategory is string =>
              Boolean(subcategory)
          )
      )
    ).sort();

    if (databaseSubcategories.length > 0) {
      return ["All", ...databaseSubcategories];
    }

    return SUBCATEGORY_OPTIONS[selectedCategory] || ["All"];
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesSubcategory =
        selectedSubcategory === "All" ||
        product.subcategory === selectedSubcategory ||
        product.title
          .toLowerCase()
          .includes(selectedSubcategory.toLowerCase());

      const matchesBrand =
        selectedBrand === "All" ||
        product.brand === selectedBrand ||
        product.title
          .toLowerCase()
          .includes(selectedBrand.toLowerCase());

      const searchText = search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        product.title.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        String(product.brand ?? "").toLowerCase().includes(searchText);

      const price = Number(product.price);

      const matchesMin =
        minPrice === "" || price >= Number(minPrice);

      const matchesMax =
        maxPrice === "" || price <= Number(maxPrice);

      const matchesRating =
        selectedRating === "All" ||
        (product.rating != null &&
          product.rating >= Number(selectedRating));

      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesBrand &&
        matchesSearch &&
        matchesMin &&
        matchesMax &&
        matchesRating
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedRating,
    search,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    selectedRating,
    search,
    minPrice,
    maxPrice,
    sortBy,
    pageSize,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedSubcategory("All");
    setSelectedBrand("All");
    setSelectedRating("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
    setCurrentPage(1);
  }

  const hasActiveFilters =
    search !== "" ||
    selectedCategory !== "All" ||
    selectedSubcategory !== "All" ||
    selectedBrand !== "All" ||
    selectedRating !== "All" ||
    minPrice !== "" ||
    maxPrice !== "";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-slate-900">
        {/* Catalogue header */}
        <section className="border-b border-slate-800 bg-gradient-to-br from-[#101827] to-[#080a0f] text-white">
          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
              <div>
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
                    {products.length} products available
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-xl sm:p-5">
                <label
                  htmlFor="product-search"
                  className="mb-2 block text-sm font-semibold text-slate-200"
                >
                  Find your product
                </label>

                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-yellow-400"
                />

                <p className="mt-3 text-sm text-slate-300">
                  {filteredProducts.length} matching products
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalogue and filters */}
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 sm:py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
            {/* Sidebar */}
            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">Filters</h2>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-yellow-700 hover:text-yellow-900"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mt-5">
                <h3 className="mb-3 text-sm font-bold">Category</h3>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedSubcategory("All");
                      }}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                        selectedCategory === category
                          ? "bg-yellow-400 font-bold text-black"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategories */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold">Subcategory</h3>

                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {subcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold">Brand</h3>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="All">All brands</option>

                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold">Price range (₹)</h3>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="mb-3 text-sm font-bold">Rating</h3>

                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="All">All ratings</option>
                  <option value="4">4★ & above</option>
                  <option value="3">3★ & above</option>
                  <option value="2">2★ & above</option>
                </select>
              </div>
            </aside>

            {/* Products */}
            <section className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">
                    Explore our collection
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    {selectedCategory === "All"
                      ? "All Products"
                      : selectedCategory}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing {filteredProducts.length} products
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="sort-products" className="text-xs text-slate-500">
                    Sort:
                  </label>

                  <select
                    id="sort-products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to high</option>
                    <option value="price-high">Price: High to low</option>
                  </select>

                  <label htmlFor="page-size" className="text-xs text-slate-500">
                    Show:
                  </label>

                  <select
                    id="page-size"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="aspect-square rounded-xl bg-slate-100" />
                      <div className="mt-4 h-4 w-3/4 rounded bg-slate-100" />
                      <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : loadError ? (
                <div className="rounded-xl bg-red-50 p-8 text-center text-red-600">
                  Unable to load products. Please try again.
                  <button
                    onClick={() => window.location.reload()}
                    className="ml-2 font-bold underline"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-12 text-center">
                  <h3 className="text-xl font-bold">No products found</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-5 rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {paginatedProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className="group rounded-xl bg-white text-slate-900 transition duration-300 hover:-translate-y-1"
                      >
                        {/* Clean image area: no grey border/background */}
                        <div className="relative aspect-square overflow-hidden bg-white">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.title}
                              width={600}
                              height={600}
                              className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-400">
                              Image unavailable
                            </div>
                          )}

                          <span className="absolute left-3 top-3 rounded-md bg-black/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                            Dealstack
                          </span>
                        </div>

                        <div className="px-2 pb-4 pt-3">
                          <p className="line-clamp-1 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                            {product.category || "Technology"}
                          </p>

                          <h3 className="mt-2 min-h-[3rem] text-base font-bold leading-6 transition group-hover:text-yellow-700">
                            {product.title}
                          </h3>

                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                            <div>
                              <p className="text-xs text-slate-500">Price</p>
                              <p className="mt-1 text-lg font-black">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <span className="rounded-lg bg-yellow-50 px-3 py-2 text-xs font-bold text-yellow-800 transition group-hover:bg-yellow-400 group-hover:text-black">
                              View Details →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                      <button
                        disabled={safePage === 1}
                        onClick={() => setCurrentPage(safePage - 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                      >
                        ← Previous
                      </button>

                      {Array.from({ length: totalPages }).map((_, index) => {
                        const page = index + 1;

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 min-w-10 rounded-lg px-3 text-sm font-bold ${
                              safePage === page
                                ? "bg-yellow-400 text-black"
                                : "border border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        disabled={safePage === totalPages}
                        onClick={() => setCurrentPage(safePage + 1)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Contact CTA */}
          {!loading && !loadError && filteredProducts.length > 0 && (
            <div className="mt-10 rounded-2xl bg-gradient-to-r from-[#101827] to-[#080a0f] p-6 text-white sm:flex sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 className="text-lg font-bold sm:text-xl">
                  Need help choosing the right product?
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  Contact our team for product and compatibility assistance.
                </p>
              </div>

              <Link
                href="/contact"
                className="mt-5 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 sm:mt-0"
              >
                Contact Us →
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
