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
        console.log("Error fetching orders:", error);
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
      .update({
        status: newStatus,
      })
      .eq("id", orderId);

    if (error) {
      console.log("Error updating order status:", error);
      alert("Failed to update order status");
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
      <main className="min-h-screen bg-black text-white p-10">

        <div className="mb-12">
          <h1 className="text-5xl font-extrabold">
            Orders Management
          </h1>

          <p className="text-gray-400 mt-4 text-lg">
            Track and manage customer orders.
          </p>
        </div>

        {loading ? (
          <div className="text-gray-400 text-lg">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-gray-800 rounded-2xl p-8 text-gray-400">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-800 rounded-2xl">

            <table className="w-full">

              <thead className="bg-gray-900">
                <tr className="text-left">

                  <th className="p-6">
                    Order ID
                  </th>

                  <th className="p-6">
                    Customer
                  </th>

                  <th className="p-6">
                    Phone
                  </th>

                  <th className="p-6">
                    Total
                  </th>

                  <th className="p-6">
                    Status
                  </th>

                  <th className="p-6">
                    Date
                  </th>

                  <th className="p-6">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {orders.map((order) => (

                  <tr
                    key={order.id}
                    className="border-t border-gray-800 hover:bg-gray-950"
                  >

                    {/* ORDER ID */}
                    <td className="p-6 font-bold">

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-500 hover:text-blue-400 hover:underline transition"
                      >
                        #DS{String(order.id).padStart(4, "0")}
                      </Link>

                    </td>

                    {/* CUSTOMER */}
                    <td className="p-6">
                      <div className="font-semibold">
                        {order.customer_name}
                      </div>

                      <div className="text-gray-400 text-sm">
                        {order.customer_email}
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="p-6">
                      {order.customer_phone}
                    </td>

                    {/* TOTAL */}
                    <td className="p-6 font-semibold">
                      ₹
                      {Number(order.total_price).toLocaleString("en-IN")}
                    </td>

                    {/* STATUS */}
                    <td className="p-6">

                      <select
                        value={order.status || "Pending"}
                        disabled={updatingId === order.id}
                        onChange={(e) =>
                          updateOrderStatus(
                            order.id,
                            e.target.value
                          )
                        }
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:border-white"
                      >
                        {ORDER_STATUSES.map((status) => (
                          <option
                            key={status}
                            value={status}
                          >
                            {status}
                          </option>
                        ))}
                      </select>

                    </td>

                    {/* DATE */}
                    <td className="p-6 text-gray-400">
                      {order.created_at
                        ? new Date(
                            order.created_at
                          ).toLocaleString("en-IN")
                        : "-"}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-6">

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition inline-block"
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

      </main>
    </ProtectedRoute>
  );
}
