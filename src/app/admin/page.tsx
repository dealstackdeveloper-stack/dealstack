"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {

  const salesData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 14000 },
  { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 28000 },
  { month: "Jun", revenue: 35000 },
];

  return (

  <ProtectedRoute>

    <main className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}
      <aside className="w-72 bg-gray-950 border-r border-gray-800 p-8">

        <h1 className="text-3xl font-extrabold mb-12">
          Dealstack Admin
        </h1>

        <nav className="flex flex-col gap-4">

          <Link href="/admin">
            <button className="w-full text-left bg-white text-black px-5 py-4 rounded-xl font-semibold">
              Dashboard
            </button>
          </Link>

          <Link href="/admin/products">
            <button className="w-full text-left bg-gray-900 border border-gray-800 px-5 py-4 rounded-xl hover:border-white transition">
              Products
            </button>
          </Link>

          <Link href="/admin/orders">
            <button className="w-full text-left bg-gray-900 border border-gray-800 px-5 py-4 rounded-xl hover:border-white transition">
              Orders
            </button>
          </Link>

          <Link href="/admin/customers">
            <button className="w-full text-left bg-gray-900 border border-gray-800 px-5 py-4 rounded-xl hover:border-white transition">
              Customers
            </button>
          </Link>

          <Link href="/">
            <button className="w-full text-left bg-gray-900 border border-gray-800 px-5 py-4 rounded-xl hover:border-white transition">
              Back to Store
            </button>
          </Link>

        </nav>

      </aside>

      {/* Main Content */}
      <section className="flex-1 p-10">

        <h2 className="text-5xl font-extrabold">
          Dashboard Overview
        </h2>

        <p className="text-gray-400 mt-4 text-lg">
          Welcome to the Dealstack management panel.
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            <h3 className="text-gray-400 text-lg">
              Total Products
            </h3>

            <p className="text-5xl font-extrabold mt-4">
              24
            </p>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            <h3 className="text-gray-400 text-lg">
              Total Orders
            </h3>

            <p className="text-5xl font-extrabold mt-4">
              156
            </p>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            <h3 className="text-gray-400 text-lg">
              Customers
            </h3>

            <p className="text-5xl font-extrabold mt-4">
              89
            </p>

          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            <h3 className="text-gray-400 text-lg">
              Revenue
            </h3>

            <p className="text-5xl font-extrabold mt-4">
              ₹1.2L
            </p>

          </div>

        </div>

        {/* Revenue Analytics */}
<div className="mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8">

  <h3 className="text-3xl font-bold mb-10">
    Revenue Analytics
  </h3>

  <div className="h-[400px]">

    <ResponsiveContainer width="100%" height="100%">

      <LineChart data={salesData}>

        <XAxis dataKey="month" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#facc15"
          strokeWidth={4}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>

</div>

        {/* Recent Activity */}
        <div className="mt-16 bg-gray-900 border border-gray-800 rounded-2xl p-8">

          <h3 className="text-3xl font-bold mb-8">
            Recent Activity
          </h3>

          <div className="space-y-6 text-gray-300">

            <div className="border-b border-gray-800 pb-4">
              New order received from customer.
            </div>

            <div className="border-b border-gray-800 pb-4">
              Product inventory updated.
            </div>

            <div className="border-b border-gray-800 pb-4">
              New customer account created.
            </div>

            <div>
              Payment successfully processed.
            </div>

          </div>

        </div>

      </section>

        </main>

  </ProtectedRoute>

);

}