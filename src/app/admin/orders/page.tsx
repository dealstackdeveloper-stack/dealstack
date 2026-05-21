"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
export default function OrdersPage() {

  const orders = [
    {
      id: "#DS1001",
      customer: "Rahul Sharma",
      total: "₹12,999",
      status: "Processing",
    },

    {
      id: "#DS1002",
      customer: "Amit Verma",
      total: "₹8,499",
      status: "Shipped",
    },

    {
      id: "#DS1003",
      customer: "Priya Patel",
      total: "₹24,999",
      status: "Delivered",
    },

    {
      id: "#DS1004",
      customer: "Karan Singh",
      total: "₹5,999",
      status: "Pending",
    },
  ];

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
                Total
              </th>

              <th className="p-6">
                Status
              </th>

              <th className="p-6">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {orders.map((order, index) => (

              <tr
                key={index}
                className="border-t border-gray-800"
              >

                <td className="p-6 font-bold">
                  {order.id}
                </td>

                <td className="p-6">
                  {order.customer}
                </td>

                <td className="p-6 font-semibold">
                  {order.total}
                </td>

                <td className="p-6">

                  <span className="bg-gray-800 px-4 py-2 rounded-lg text-sm">

                    {order.status}

                  </span>

                </td>

                <td className="p-6">

                  <button className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition">

                    View

                  </button>

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