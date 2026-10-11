"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data || []);
      }

      setLoading(false);
    }

    fetchOrders();
  }, []);

  async function updateOrderStatus(
    orderId: number,
    newStatus: string
  ) {
    setUpdatingId(orderId);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
    } else {
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    }

    setUpdatingId(null);
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1600px]">

          <div className="mb-8">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:border-yellow-400 hover:text-yellow-400"
            >
              <span aria-hidden="true">←</span>
              Back to Admin Dashboard
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">
              Orders Management
            </h1>

            <p className="mt-3 text-base text-gray-400 sm:text-lg">
              Track and manage customer orders.
            </p>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">All Orders</h2>
            <span className="rounded-full border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300">
              {orders.length} {orders.length === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-800 p-8 text-gray-400">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 p-8 text-gray-400">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="p-5">Order ID</th>
                    <th className="p-5">Customer</th>
                    <th className="p-5">Phone</th>
                    <th className="p-5">Total</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Date</th>
                    <th className="p-5">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-t border-gray-800 transition hover:bg-gray-950"
                    >
                      <td className="p-5 font-bold">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          #DS{String(order.id).padStart(4, "0")}
                        </Link>
                      </td>

                      <td className="p-5">
                        <div className="font-semibold">
                          {order.customer_name || "—"}
                        </div>
                        <div className="mt-1 text-sm text-gray-400">
                          {order.customer_email || "—"}
                        </div>
                      </td>

                      <td className="p-5">
                        {order.customer_phone || "—"}
                      </td>

                      <td className="whitespace-nowrap p-5 font-semibold">
                        ₹{Number(order.total_price || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="p-5">
                        <select
                          value={order.status || "Pending"}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white outline-none focus:border-yellow-400 disabled:cursor-wait disabled:opacity-60"
                          aria-label={`Status for order ${order.id}`}
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        {updatingId === order.id && (
                          <p className="mt-1 text-xs text-gray-400">
                            Saving...
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap p-5 text-sm text-gray-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-IN")
                          : "—"}
                      </td>

                      <td className="p-5">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold transition hover:bg-blue-500"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
