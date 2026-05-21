"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
export default function CustomersPage() {

  const customers = [
    {
      id: "#CUS1001",
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      orders: 5,
    },

    {
      id: "#CUS1002",
      name: "Priya Patel",
      email: "priya@gmail.com",
      orders: 2,
    },

    {
      id: "#CUS1003",
      name: "Amit Verma",
      email: "amit@gmail.com",
      orders: 8,
    },

    {
      id: "#CUS1004",
      name: "Sneha Joshi",
      email: "sneha@gmail.com",
      orders: 3,
    },
  ];

  return (
    
    <ProtectedRoute>

    <main className="min-h-screen bg-black text-white p-10">

      <div className="mb-12">

        <h1 className="text-5xl font-extrabold">
          Customers Management
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Manage and monitor Dealstack customers.
        </p>

      </div>

      <div className="overflow-x-auto border border-gray-800 rounded-2xl">

        <table className="w-full">

          <thead className="bg-gray-900">

            <tr className="text-left">

              <th className="p-6">
                Customer ID
              </th>

              <th className="p-6">
                Name
              </th>

              <th className="p-6">
                Email
              </th>

              <th className="p-6">
                Orders
              </th>

              <th className="p-6">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {customers.map((customer, index) => (

              <tr
                key={index}
                className="border-t border-gray-800"
              >

                <td className="p-6 font-bold">
                  {customer.id}
                </td>

                <td className="p-6">
                  {customer.name}
                </td>

                <td className="p-6 text-gray-400">
                  {customer.email}
                </td>

                <td className="p-6 font-semibold">
                  {customer.orders}
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