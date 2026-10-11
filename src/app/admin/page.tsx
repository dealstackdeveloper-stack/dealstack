"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  async function deleteProduct(id: number) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
      return;
    }

    setProducts((current) =>
      current.filter((product) => product.id !== id)
    );

    alert("Product deleted successfully.");
  }

  const filteredProducts = products.filter((product) => {
    const searchText = search.toLowerCase();

    return (
      String(product.title || "").toLowerCase().includes(searchText) ||
      String(product.category || "").toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
          >
            <span aria-hidden="true">←</span>
            Back to Admin Dashboard
          </Link>
        </div>

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Product Management
            </h1>
            <p className="mt-2 text-gray-400">
              Manage your Dealstack product catalogue.
            </p>
          </div>

          <Link
            href="/admin/add-product"
            className="inline-flex items-center justify-center rounded-xl bg-yellow-400 px-5 py-3 font-semibold text-black transition hover:bg-yellow-300"
          >
            + Add Product
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
              aria-label="Search products"
            />
          </div>

          <p className="text-sm text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-800 p-8 text-gray-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 p-8 text-gray-400">
            {products.length === 0
              ? "No products found. Add your first product."
              : "No products match your search."}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 transition hover:border-gray-600"
              >
                <div className="m-5 flex h-56 items-center justify-center rounded-xl bg-black p-4">
                  <Image
                    src={
                      product.image ||
                      "/images/CP-GPC-DA24PL2C-SE-V2-dealstack.jpg"
                    }
                    alt={product.title || "Dealstack product"}
                    width={400}
                    height={300}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="flex flex-1 flex-col px-5 pb-5">
                  <p className="mb-2 text-sm text-yellow-400">
                    {product.category || "Uncategorised"}
                  </p>

                  <h2 className="text-xl font-bold">
                    {product.title || "Untitled Product"}
                  </h2>

                  <p className="mt-3 text-2xl font-semibold">
                    ₹{Number(product.price || 0).toLocaleString("en-IN")}
                  </p>

                  <div className="mt-auto flex gap-3 pt-6">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center font-semibold transition hover:bg-blue-500"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() => deleteProduct(product.id)}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold transition hover:bg-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
