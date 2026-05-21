"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";

export default function AdminProductsPage() {

  return (
    <ProtectedRoute>

    <main className="min-h-screen bg-black text-white p-10">

      <div className="flex items-center justify-between mb-12">

        <div>

          <h1 className="text-5xl font-extrabold">
            Product Management
          </h1>

          <p className="text-gray-400 mt-4 text-lg">
            Manage Dealstack inventory products.
          </p>

        </div>

        <Link href="/admin/add-product">

  <button className="bg-white text-black px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition">

    + Add Product

  </button>

</Link>

      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border border-gray-800 rounded-2xl">

        <table className="w-full">

          <thead className="bg-gray-900">

            <tr className="text-left">

              <th className="p-6">Image</th>

              <th className="p-6">Title</th>

              <th className="p-6">Category</th>

              <th className="p-6">Price</th>

              <th className="p-6">Actions</th>

            </tr>

          </thead>

          <tbody>

            {products.map((product) => (

              <tr
                key={product.id}
                className="border-t border-gray-800"
              >

                <td className="p-6">

                  <Image
                    src={product.image}
                    alt={product.title}
                    width={80}
                    height={80}
                    className="rounded-xl object-cover"
                  />

                </td>

                <td className="p-6 font-semibold">

                  {product.title}

                </td>

                <td className="p-6 text-gray-400">

                  {product.category}

                </td>

                <td className="p-6 font-bold">

                  ₹{product.price}

                </td>

                <td className="p-6">

                  <div className="flex gap-4">

                    <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition">

                      Edit

                    </button>

                    <button className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-500 transition">

                      Delete

                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>

    </ProtectedRoute>
    
  );
}