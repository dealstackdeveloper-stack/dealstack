"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";

type OrderProduct = {
  id?: string | number;
  title?: string;
  name?: string;
  price?: number | string;
  quantity?: number | string;
};

type CustomerOrder = {
  id: number;
  user_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  address: string | null;
  products: OrderProduct[] | null;
  total_price: number | string | null;
  status: string | null;
  created_at: string | null;
};

export default function CustomerOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = String(params.id ?? "");

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace("/customer-login");
      return;
    }

    const { data, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, user_id, customer_name, customer_email, customer_phone, address, products, total_price, status, created_at"
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !data) {
      console.error("Order details error:", orderError);
      setError("We couldn't find this order in your account.");
      setOrder(null);
    } else {
      setOrder(data as CustomerOrder);
    }

    setLoading(false);
  }, [orderId, router]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      setLoading(false);
      setError("Invalid order ID.");
    }
  }, [orderId, loadOrder]);

  const downloadPDF = useCallback(() => {
    if (!order) return;

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 18;
    const usableWidth = pageWidth - margin * 2;
    let y = 20;

    const addLine = (text: string, size = 10) => {
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(text, usableWidth);
      const requiredHeight = lines.length * (size * 0.45) + 3;

      if (y + requiredHeight > 275) {
        pdf.addPage();
        y = 20;
      }

      pdf.text(lines, margin, y);
      y += requiredHeight;
    };

    pdf.setFont("helvetica", "bold");
    addLine("Dealstack", 22);

    pdf.setFont("helvetica", "normal");
    addLine("ORDER CONFIRMATION", 15);
    addLine("Order ID: DS" + String(order.id).padStart(4, "0"));
    addLine(
      "Order Date: " +
        (order.created_at
          ? new Date(order.created_at).toLocaleString("en-IN")
          : "Unavailable")
    );
    addLine("Order Status: " + (order.status || "Pending"));
    y += 3;

    pdf.setFont("helvetica", "bold");
    addLine("Customer Details", 13);
    pdf.setFont("helvetica", "normal");
    addLine("Name: " + (order.customer_name || "-"));
    addLine("Email: " + (order.customer_email || "-"));
    addLine("Phone: " + (order.customer_phone || "-"));
    addLine("Shipping Address: " + (order.address || "-"));
    y += 4;

    pdf.setFont("helvetica", "bold");
    addLine("Order Items", 13);
    pdf.setFont("helvetica", "normal");

    for (const product of order.products ?? []) {
      const name = product.title || product.name || "Product";
      const quantity = Number(product.quantity || 0);
      const price = Number(product.price || 0);
      const lineTotal = quantity * price;

      addLine(name, 10);
      addLine(
        `Qty: ${quantity} x Rs. ${price.toLocaleString("en-IN")} = Rs. ${lineTotal.toLocaleString("en-IN")}`,
        10
      );
      y += 2;
    }

    y += 3;
    pdf.setFont("helvetica", "bold");
    addLine(
      "Order Total: Rs. " +
        Number(order.total_price || 0).toLocaleString("en-IN"),
      14
    );

    pdf.setFont("helvetica", "normal");
    y += 3;
    addLine("This document is an order confirmation, not a GST tax invoice.", 9);

    pdf.save(`Dealstack-Order-${order.id}.pdf`);
  }, [order]);

  useEffect(() => {
    if (order && searchParams.get("download") === "1") {
      downloadPDF();
      router.replace(`/account/orders/${order.id}`);
    }
  }, [order, searchParams, downloadPDF, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        Loading order details...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <h1 className="text-2xl font-bold">Order unavailable</h1>
          <p className="mt-3 text-gray-400">
            {error || "This order could not be loaded."}
          </p>
          <Link
            href="/account"
            className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-black"
          >
            Back to My Account
          </Link>
        </div>
      </main>
    );
  }

  const products = order.products ?? [];

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account"
          className="text-gray-300 underline underline-offset-4 hover:text-white"
        >
          ← Back to My Account
        </Link>

        <div className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">
              Order #DS{String(order.id).padStart(4, "0")}
            </h1>
            <p className="mt-3 text-gray-400">
              {order.created_at
                ? new Date(order.created_at).toLocaleString("en-IN")
                : "Date unavailable"}
            </p>
          </div>

          <button
            onClick={downloadPDF}
            className="rounded-xl bg-white px-5 py-3 font-bold text-black hover:bg-gray-200"
          >
            Download Order PDF
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-bold">Order Status</h2>
            <span className="mt-3 inline-block rounded-full border border-gray-700 px-4 py-2">
              {order.status || "Pending"}
            </span>

            <h2 className="mt-8 text-xl font-bold">Shipping Details</h2>
            <div className="mt-4 space-y-3 text-gray-300">
              <p>{order.customer_name || "-"}</p>
              <p>{order.customer_email || "-"}</p>
              <p>{order.customer_phone || "-"}</p>
              <p className="whitespace-pre-line">{order.address || "-"}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-xl font-bold">Items Ordered</h2>

            {products.length === 0 ? (
              <p className="mt-4 text-gray-400">
                No product details are available for this order.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-gray-800">
                {products.map((product, index) => {
                  const quantity = Number(product.quantity || 0);
                  const price = Number(product.price || 0);

                  return (
                    <div
                      key={`${product.id ?? product.title ?? product.name ?? "product"}-${index}`}
                      className="flex justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="font-semibold">
                          {product.title || product.name || "Product"}
                        </p>
                        <p className="mt-1 text-sm text-gray-400">
                          Qty: {quantity} × ₹
                          {price.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <p className="font-semibold whitespace-nowrap">
                        ₹{(quantity * price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5 flex justify-between border-t border-gray-700 pt-5">
              <span className="text-lg font-bold">Order Total</span>
              <span className="text-xl font-bold text-yellow-400">
                ₹{Number(order.total_price || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
