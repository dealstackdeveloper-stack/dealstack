
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";

type Product = {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  model_number: string | null;
  sku: string | null;
  category: string | null;
  subcategory: string | null;
  price: number | null;
  mrp: number | null;
  stock: number | null;
  image: string | null;
  is_active: boolean | null;
};

type ProductRating = {
  average: number;
  count: number;
};

const PAGE_SIZES = [12, 24, 48];

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ratings, setRatings] = useState<Record<string, ProductRating>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: productError } = await supabase
        .from("products")
        .select(
          "id,title,slug,brand,model_number,sku,category,subcategory,price,mrp,stock,image,is_active"
        )
        .order("title", { ascending: true });

      if (productError) throw productError;

      const productList = (data ?? []) as Product[];
      setProducts(productList);

      // Ratings are stored in product_reviews, not products.
      setRatingError("");

      const { data: reviewData, error: reviewError } = await supabase
        .from("product_reviews")
        .select("product_id,rating");

      if (reviewError) {
        setRatingError("Ratings could not be loaded.");
        setRatings({});
      } else {
        const ratingMap: Record<
          string,
          { total: number; count: number }
        > = {};

        (reviewData ?? []).forEach((review: any) => {
          const id = String(review.product_id);
          const rating = Number(review.rating);

          if (!Number.isFinite(rating)) return;

          if (!ratingMap[id]) {
            ratingMap[id] = { total: 0, count: 0 };
          }

          ratingMap[id].total += rating;
          ratingMap[id].count += 1;
        });

        const finalRatings: Record<string, ProductRating> = {};

        Object.entries(ratingMap).forEach(([id, value]) => {
          finalRatings[id] = {
            average: value.total / value.count,
            count: value.count,
          };
        });

        setRatings(finalRatings);
      }
    } catch (err: any) {
      console.error("Admin products loading error:", err);
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.category)
            .filter((v): v is string => Boolean(v))
        )
      ).sort(),
    [products]
  );

  const subcategories = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .filter(
              (p) =>
                categoryFilter === "all" ||
                p.category === categoryFilter
            )
            .map((p) => p.subcategory)
            .filter((v): v is string => Boolean(v))
        )
      ).sort(),
    [products, categoryFilter]
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((p) => p.brand)
            .filter((v): v is string => Boolean(v))
        )
      ).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        [
          product.title,
          product.brand,
          product.model_number,
          product.sku,
          product.category,
          product.subcategory,
        ].some((value) => value?.toLowerCase().includes(term));

      const matchesCategory =
        categoryFilter === "all" ||
        product.category === categoryFilter;

      const matchesSubcategory =
        subcategoryFilter === "all" ||
        product.subcategory === subcategoryFilter;

      const matchesBrand =
        brandFilter === "all" || product.brand === brandFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active === true) ||
        (statusFilter === "inactive" && product.is_active === false);

      const productRating = ratings[String(product.id)];

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "rated" && Boolean(productRating)) ||
        (ratingFilter === "unrated" && !productRating) ||
        (productRating &&
          productRating.average >= Number(ratingFilter));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesBrand &&
        matchesStatus &&
        matchesRating
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
    statusFilter,
    ratingFilter,
    ratings,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    categoryFilter,
    subcategoryFilter,
    brandFilter,
    statusFilter,
    ratingFilter,
    pageSize,
  ]);

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.title}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product.id);

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) throw deleteError;

      setProducts((previous) =>
        previous.filter((p) => p.id !== product.id)
      );

      setRatings((previous) => {
        const updated = { ...previous };
        delete updated[String(product.id)];
        return updated;
      });
    } catch (err: any) {
      console.error("Product deletion error:", err);
      window.alert(
        err.message ||
          "Unable to delete product. Check database permissions or related records."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setSubcategoryFilter("all");
    setBrandFilter("all");
    setStatusFilter("all");
    setRatingFilter("all");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Product Management
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Manage, edit and delete products from your store.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold hover:bg-blue-700"
          >
            + Add New Product
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Total Products</p>
            <p className="mt-2 text-2xl font-bold">{products.length}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Active</p>
            <p className="mt-2 text-2xl font-bold text-green-400">
              {products.filter((p) => p.is_active === true).length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Inactive</p>
            <p className="mt-2 text-2xl font-bold text-yellow-400">
              {products.filter((p) => p.is_active === false).length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <p className="text-sm text-gray-400">Low Stock (≤ 5)</p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              {products.filter((p) => p.stock !== null && p.stock <= 5).length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, model number or brand..."
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setSubcategoryFilter("all");
            }}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-3"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-3"
          >
            <option value="all">All Subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-3"
          >
            <option value="all">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-3"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-3"
          >
            <option value="all">All Ratings</option>
            <option value="rated">Rated Products</option>
            <option value="unrated">No Reviews</option>
            <option value="3">3★ and above</option>
            <option value="4">4★ and above</option>
            <option value="4.5">4.5★ and above</option>
          </select>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={resetFilters}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Reset Filters
          </button>

          <p className="text-sm text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {ratingError && (
          <p className="mb-4 text-sm text-yellow-400">{ratingError}</p>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-20 text-center">
            <p className="text-gray-300">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-8 text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={loadProducts}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 py-20 text-center">
            <p className="text-lg text-gray-300">No products found.</p>
            <p className="mt-2 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Product Catalogue */}
        {!loading && !error && paginatedProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProducts.map((product) => {
              const productRating = ratings[String(product.id)];

              return (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900 transition hover:border-gray-600"
                >
                  {/* Image */}
                  <div className="relative flex h-48 items-center justify-center bg-white p-4">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-4"
                      />
                    ) : (
                      <div className="text-sm text-gray-500">
                        No product image
                      </div>
                    )}

                    <span
                      className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        product.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-4">
                    <h2 className="line-clamp-2 min-h-[48px] text-base font-semibold">
                      {product.title}
                    </h2>

                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      <p>Brand: {product.brand || "—"}</p>
                      <p>SKU: {product.sku || "—"}</p>
                      <p>Model: {product.model_number || "—"}</p>
                      <p>
                        Category: {product.category || "—"}
                        {product.subcategory
                          ? ` / ${product.subcategory}`
                          : ""}
                      </p>
                      <p>
                        Stock:{" "}
                        <span
                          className={
                            (product.stock ?? 0) <= 5
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {product.stock ?? 0}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-lg font-bold text-white">
                        ₹{Number(product.price ?? 0).toLocaleString("en-IN")}
                      </p>

                      {product.mrp &&
                        product.mrp > (product.price ?? 0) && (
                          <p className="text-sm text-gray-500 line-through">
                            ₹{Number(product.mrp).toLocaleString("en-IN")}
                          </p>
                        )}

                      <p className="mt-1 text-sm text-yellow-400">
                        {productRating
                          ? `★ ${productRating.average.toFixed(1)} (${productRating.count})`
                          : "No reviews"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <Link
                        href={`/admin/products/${product.id}/`}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-semibold hover:bg-blue-700"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === product.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Products per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-white"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-gray-700 px-4 py-2 disabled:opacity-30"
              >
                Previous
              </button>

              <span className="text-sm text-gray-400">
                Page {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                className="rounded-lg border border-gray-700 px-4 py-2 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AdminProductsPage() {
  return (
    <ProtectedRoute>
      <AdminProductsContent />
    </ProtectedRoute>
  );
}
