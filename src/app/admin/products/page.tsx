"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import Link from "next/link";

import { supabase } from "@/lib/supabase";

export default function AdminProductsPage() {

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

        setProducts(data || []);
      }
    }

    fetchProducts();

  }, []);

  async function deleteProduct(id: number) {

  const confirmDelete =
    confirm("Delete this product?");

  if (!confirmDelete) return;

  const { error } =
    await supabase
      .from("products")
      .delete()
      .eq("id", id);

  if (error) {

    console.log(error);

    alert("Failed to delete product");

  } else {

    setProducts(
      products.filter(
        (product) =>
          product.id !== id
      )
    );

    alert("Product deleted");
  }
}

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-10">

          <h1 className="text-4xl font-bold">

            Product Management

          </h1>

          <Link
            href="/admin/add-product"
            className="bg-yellow-400 text-black px-5 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition"
          >

            Add Product

          </Link>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {products.map((product) => (

            <div
              key={product.id}
              className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
            >

              <div className="p-6">

                <div className="bg-black rounded-xl p-4 mb-5">

                  <Image
                     src={
                    product.image ||
                     "/images/CP-GPC-DA24PL2C-SE-V2-dealstack.jpg"
                    }
                      alt={product.title}
                      width={400}
                      height={300}
                      className="w-full h-56 object-contain"
                    />

                </div>

                <p className="text-yellow-400 mb-2">

                  {product.category}

                </p>

                <h2 className="text-2xl font-bold">

                  {product.title}

                </h2>

                <p className="text-2xl font-semibold mt-4">

                  ₹{product.price}

                </p>

              </div>

              <div className="mt-6 flex gap-3">

<Link
  href={`/admin/products/${product.id}`}
  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold transition"
>

  Edit

</Link>

  <button
    onClick={() =>
      deleteProduct(product.id)
    }
    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
  >

    Delete

  </button>

</div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}