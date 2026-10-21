"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { supabase } from "@/lib/supabase";

type Customer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  orders: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const response = await fetch("/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to load customers.");
      }

      setCustomers(result.customers ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-8 sm:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10">
            <Link
              href="/admin"
              className="mb-8 inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-5 py-3 font-semibold transition hover:border-yellow-400 hover:text-yellow-400"
            >
              <span aria-hidden="true">←</span>
              Back to Admin Dashboard
            </Link>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-3 font-medium text-yellow-400">
                  DEALSTACK ADMIN
                </p>

                <h1 className="text-3xl font-extrabold sm:text-5xl">
                  Customers Management
                </h1>

                <p className="mt-4 text-gray-400">
                  View registered customers and their actual order counts.
                </p>
              </div>

              <button
                type="button"
                onClick={loadCustomers}
                disabled={loading}
                className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Loading..." : "Refresh Customers"}
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Registered Customers</p>
            <p className="mt-2 text-4xl font-extrabold">
              {loading ? "—" : customers.length}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300"
            >
              <p>{error}</p>
              <button
                type="button"
                onClick={loadCustomers}
                className="mt-3 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Customer table */}
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-gray-900">
                <tr>
                  <th className="p-5">Customer ID</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Email</th>
                  <th className="p-5">Orders</th>
                  <th className="p-5">Registered</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-400"
                    >
                      Loading registered customers...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-400"
                    >
                      Customers could not be loaded.
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-10 text-center text-gray-400"
                    >
                      No registered customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-gray-800 transition hover:bg-gray-900/70"
                    >
                      <td className="p-5 font-mono text-sm text-gray-300">
                        {customer.id.slice(0, 8).toUpperCase()}
                      </td>

                      <td className="p-5 font-semibold">
                        {customer.name}
                      </td>

                      <td className="p-5 text-gray-400">
                        {customer.email || "No email"}
                      </td>

                      <td className="p-5 font-bold">
                        {customer.orders}
                      </td>

                      <td className="p-5 text-gray-400">
                        {new Date(customer.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            Customer records are retrieved from Supabase Auth. Order counts
            include orders linked through the customer's user ID.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}