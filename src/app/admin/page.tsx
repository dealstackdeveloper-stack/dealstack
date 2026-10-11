"use client";

import { useCallback, useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Order = {
  id: number | string;
  customer_name?: string | null;
  customer_email?: string | null;
  total_price: number | string | null;
  status: string | null;
  created_at: string;
};

type SalesMonth = {
  month: string;
  revenue: number;
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const successfulStatuses = [
  "paid",
  "completed",
  "delivered",
];

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [salesData, setSalesData] = useState<SalesMonth[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorMessage("");

    try {
      const [
        productsResult,
        ordersResult,
      ] = await Promise.all([
        supabase
          .from("products")
          .select("id", { count: "exact", head: true }),

        supabase
          .from("orders")
          .select(
            "id, customer_name, customer_email, total_price, status, created_at"
          )
          .order("created_at", { ascending: false }),
      ]);

      if (productsResult.error) {
        throw new Error(
          `Products: ${productsResult.error.message}`
        );
      }

      if (ordersResult.error) {
        throw new Error(
          `Orders: ${ordersResult.error.message}`
        );
      }

      const orders = (ordersResult.data ?? []) as Order[];

      setTotalProducts(productsResult.count ?? 0);
      setTotalOrders(orders.length);

      // Count distinct customers who have placed orders.
      const customerEmails = new Set(
        orders
          .map((order) =>
            order.customer_email?.trim().toLowerCase()
          )
          .filter((email): email is string => Boolean(email))
      );

      setTotalCustomers(customerEmails.size);

      // Count only orders with successful/completed statuses.
      const successfulOrders = orders.filter((order) =>
        successfulStatuses.includes(
          String(order.status ?? "").toLowerCase().trim()
        )
      );

      const totalRevenue = successfulOrders.reduce(
        (sum, order) => sum + Number(order.total_price ?? 0),
        0
      );

      setRevenue(totalRevenue);

      // Build monthly revenue for the latest six calendar months.
      const now = new Date();
      const months: SalesMonth[] = [];

      for (let offset = 5; offset >= 0; offset--) {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - offset,
          1
        );

        months.push({
          month: date.toLocaleDateString("en-IN", {
            month: "short",
            year: "2-digit",
          }),
          revenue: 0,
        });
      }

      const monthTotals = new Map<string, number>();

      for (const order of successfulOrders) {
        const orderDate = new Date(order.created_at);

        if (Number.isNaN(orderDate.getTime())) continue;

        const key = `${orderDate.getFullYear()}-${String(
          orderDate.getMonth()
        ).padStart(2, "0")}`;

        monthTotals.set(
          key,
          (monthTotals.get(key) ?? 0) +
            Number(order.total_price ?? 0)
        );
      }

      const chartData = months.map((item, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (5 - index),
          1
        );

        const key = `${date.getFullYear()}-${String(
          date.getMonth()
        ).padStart(2, "0")}`;

        return {
          ...item,
          revenue: monthTotals.get(key) ?? 0,
        };
      });

      setSalesData(chartData);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Dashboard loading failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black text-white md:flex">
        {/* Sidebar */}
        <aside className="w-full border-b border-gray-800 bg-gray-950 p-5 md:min-h-screen md:w-72 md:border-b-0 md:border-r md:p-8">
          <h1 className="mb-6 text-3xl font-extrabold md:mb-12">
            Dealstack Admin
          </h1>

          <nav className="flex flex-wrap gap-3 md:flex-col md:gap-4">
            <Link
              href="/admin"
              className="rounded-xl bg-white px-5 py-4 font-semibold text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/products"
              className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 transition hover:border-white"
            >
              Products
            </Link>

            <Link
              href="/admin/orders"
              className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 transition hover:border-white"
            >
              Orders
            </Link>

            <Link
              href="/admin/customers"
              className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 transition hover:border-white"
            >
              Customers
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 transition hover:border-white"
            >
              Back to Store
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <section className="min-w-0 flex-1 p-5 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold sm:text-5xl">
                Dashboard Overview
              </h2>

              <p className="mt-4 text-lg text-gray-400">
                Welcome to the Dealstack management panel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={loading || refreshing}
              className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-8 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300"
            >
              <p className="font-bold">
                Dashboard data could not be fully loaded.
              </p>
              <p className="mt-2 break-words text-sm">
                {errorMessage}
              </p>
              <p className="mt-2 text-sm">
                Check your Supabase table names, column names,
                and Row Level Security policies.
              </p>
            </div>
          )}

          {/* Statistics */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Products",
                value: totalProducts.toLocaleString("en-IN"),
                href: "/admin/products",
              },
              {
                label: "Total Orders",
                value: totalOrders.toLocaleString("en-IN"),
                href: "/admin/orders",
              },
              {
                label: "Customers with Orders",
                value: totalCustomers.toLocaleString("en-IN"),
                href: "/admin/customers",
              },
              {
                label: "Completed Order Revenue",
                value: currency(revenue),
                href: "/admin/orders",
              },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-yellow-400 sm:p-8"
              >
                <p className="text-gray-400">{stat.label}</p>

                <p className="mt-4 break-words text-3xl font-extrabold sm:text-4xl">
                  {loading ? "..." : stat.value}
                </p>

                <p className="mt-3 text-sm text-yellow-400">
                  View details →
                </p>
              </Link>
            ))}
          </div>

          {/* Revenue Analytics */}
          <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold sm:text-3xl">
                Revenue Analytics
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Monthly revenue from paid, completed, and delivered
                orders over the last six calendar months.
              </p>
            </div>

            <div className="h-[320px] w-full sm:h-[400px]">
              {loading ? (
                <div className="flex h-full items-center justify-center text-gray-400">
                  Loading revenue data...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: 5,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="#374151"
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="month"
                      stroke="#9ca3af"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis
                      stroke="#9ca3af"
                      tickFormatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                      width={85}
                      tick={{ fontSize: 12 }}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #374151",
                        borderRadius: "12px",
                        color: "#ffffff",
                      }}
                      formatter={(value) => [
                        currency(Number(value ?? 0)),
                        "Revenue",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stroke="#facc15"
                      strokeWidth={4}
                      dot={{
                        r: 5,
                        fill: "#facc15",
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold sm:text-3xl">
                  Recent Orders
                </h3>

                <p className="mt-2 text-gray-400">
                  The five most recent orders in your store.
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="font-semibold text-yellow-400 hover:text-yellow-300"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <p className="py-8 text-gray-400">
                Loading recent orders...
              </p>
            ) : recentOrders.length === 0 ? (
              <p className="py-8 text-gray-400">
                No orders found yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead>
                    <tr className="border-b border-gray-800 text-sm text-gray-400">
                      <th className="px-4 py-4">Order ID</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-4 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-gray-800 last:border-0"
                      >
                        <td className="px-4 py-4">
                          #{order.id}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium">
                            {order.customer_name || "Customer"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {order.customer_email || "No email"}
                          </p>
                        </td>

                        <td className="px-4 py-4 text-gray-300">
                          {new Date(order.created_at).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        <td className="px-4 py-4 font-semibold">
                          {currency(Number(order.total_price ?? 0))}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
                            {order.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Dealstack Admin Dashboard
          </p>
        </section>
      </main>
    </ProtectedRoute>
  );
}
