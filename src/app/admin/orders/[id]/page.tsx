"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error) {
        console.log("Error fetching order:", error);
      } else {
        setOrder(data);
      }

      setLoading(false);
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-black text-white p-10">
          <div className="max-w-6xl mx-auto">
            <p className="text-gray-400 text-lg">
              Loading order...
            </p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-black text-white p-10">
          <div className="max-w-6xl mx-auto">

            <button
              onClick={() => router.push("/admin/orders")}
              className="mb-8 bg-gray-800 px-5 py-3 rounded-lg hover:bg-gray-700 transition"
            >
              ← Back to Orders
            </button>

            <div className="border border-gray-800 rounded-2xl p-8">
              <h1 className="text-3xl font-bold">
                Order Not Found
              </h1>

              <p className="text-gray-400 mt-3">
                The requested order could not be found.
              </p>
            </div>

          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white p-10">

        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">

            <div>
              <button
                onClick={() => router.push("/admin/orders")}
                className="text-gray-400 hover:text-white mb-5 transition"
              >
                ← Back to Orders
              </button>

              <h1 className="text-5xl font-extrabold">
                Order #DS{String(order.id).padStart(4, "0")}
              </h1>

              <p className="text-gray-400 mt-3">
                {order.created_at
                  ? new Date(order.created_at).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>

            <div className="bg-gray-800 px-5 py-3 rounded-xl">
              <span className="text-gray-400 mr-2">
                Status:
              </span>

              <span className="font-bold">
                {order.status || "Pending"}
              </span>
            </div>

          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-2xl font-bold mb-6">
                Customer Details
              </h2>

              <div className="space-y-5">

                <div>
                  <p className="text-gray-400 text-sm">
                    Full Name
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {order.customer_name}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">
                    Email
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {order.customer_email}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">
                    Phone
                  </p>

                  <p className="text-lg font-semibold mt-1">
                    {order.customer_phone}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">
                    Shipping Address
                  </p>

                  <p className="text-lg font-semibold mt-1 whitespace-pre-line">
                    {order.address}
                  </p>
                </div>

              </div>

            </div>

            {/* Order Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

              <h2 className="text-2xl font-bold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">

                {Array.isArray(order.products) &&
                  order.products.map(
                    (product: any, index: number) => (

                      <div
                        key={index}
                        className="flex justify-between items-center border-b border-gray-800 pb-4"
                      >

                        <div>
                          <p className="font-semibold">
                            {product.title}
                          </p>

                          <p className="text-gray-400 text-sm mt-1">
                            Quantity: {product.quantity}
                          </p>
                        </div>

                        <p className="font-semibold">
                          ₹
                          {(
                            Number(product.price) *
                            Number(product.quantity)
                          ).toLocaleString("en-IN")}
                        </p>

                      </div>

                    )
                  )}

              </div>

              <div className="flex justify-between border-t border-gray-700 mt-8 pt-6">

                <span className="text-2xl font-bold">
                  Total
                </span>

                <span className="text-3xl font-bold text-yellow-400">
                  ₹
                  {Number(order.total_price).toLocaleString("en-IN")}
                </span>

              </div>

            </div>

          </div>

        </div>

      </main>
    </ProtectedRoute>
  );
}
