
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";

const BUSINESS_DETAILS = {
  name: "Dealstack",
  gstin: "[ADD GSTIN HERE]",
  address: "[ADD REGISTERED BUSINESS ADDRESS HERE]",
};

type OrderProduct = {
  title?: string;
  name?: string;
  price: number | string;
  quantity: number;
};

type Order = {
  id: number;
  user_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  address: string;
  products: OrderProduct[];
  total_price: number;
  status: string;
  created_at: string;
};

function formatINR(value: number) {
  return `Rs. ${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId || !/^\d+$/.test(orderId)) {
        setErrorMessage("The order number is missing or invalid.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        router.replace("/customer-login");
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          "id, user_id, customer_name, customer_email, customer_phone, address, products, total_price, status, created_at"
        )
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (!active) return;

      if (error || !data) {
        console.error("Loading order failed:", error);
        setErrorMessage(
          "We could not find this order in your account. Please check My Account or contact support."
        );
        setLoading(false);
        return;
      }

      setOrder(data as Order);
      setLoading(false);
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId, router]);

  async function downloadPDF() {
    if (!order || generatingPDF) return;

    setGeneratingPDF(true);

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = 20;

      function addText(
        value: string,
        x: number,
        yPosition: number,
        maxWidth = contentWidth
      ) {
        const lines = pdf.splitTextToSize(value, maxWidth);
        pdf.text(lines, x, yPosition);
        return lines.length * 6;
      }

      function ensureSpace(requiredHeight: number) {
        if (y + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.text(BUSINESS_DETAILS.name, margin, y);
      y += 9;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      y += addText(`Business address: ${BUSINESS_DETAILS.address}`, margin, y);
      y += addText(`GSTIN: ${BUSINESS_DETAILS.gstin}`, margin, y);
      y += 5;

      pdf.setDrawColor(190);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 9;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("ORDER CONFIRMATION", margin, y);
      y += 8;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("NOT A GST TAX INVOICE", margin, y);
      y += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      y += addText(`Order number: ${order.id}`, margin, y);
      y += addText(
        `Order date: ${new Date(order.created_at).toLocaleString("en-IN")}`,
        margin,
        y
      );
      y += addText(`Order status: ${order.status}`, margin, y);
      y += 7;

      pdf.setFont("helvetica", "bold");
      pdf.text("CUSTOMER DETAILS", margin, y);
      y += 7;

      pdf.setFont("helvetica", "normal");
      y += addText(`Name: ${order.customer_name}`, margin, y);
      y += addText(
        `Email: ${order.customer_email || "Not provided"}`,
        margin,
        y
      );
      y += addText(
        `Phone: ${order.customer_phone || "Not provided"}`,
        margin,
        y
      );
      y += addText(`Delivery address: ${order.address}`, margin, y);
      y += 7;

      pdf.setFont("helvetica", "bold");
      pdf.text("ORDER ITEMS", margin, y);
      y += 7;

      pdf.setFontSize(9);
      pdf.text("Product", margin, y);
      pdf.text("Qty", pageWidth - margin - 65, y);
      pdf.text("Unit price", pageWidth - margin - 45, y);
      pdf.text("Amount", pageWidth - margin, y, { align: "right" });

      y += 3;
      pdf.line(margin, y, pageWidth - margin, y);
      y += 6;

      pdf.setFont("helvetica", "normal");

      const products = Array.isArray(order.products)
        ? order.products
        : [];

      for (const product of products) {
        const title = product.title || product.name || "Product";
        const quantity = Number(product.quantity) || 0;
        const unitPrice = Number(product.price) || 0;
        const amount = quantity * unitPrice;
        const titleLines = pdf.splitTextToSize(title, 78);
        const rowHeight = Math.max(8, titleLines.length * 5 + 3);

        ensureSpace(rowHeight + 5);

        pdf.text(titleLines, margin, y);
        pdf.text(String(quantity), pageWidth - margin - 65, y);
        pdf.text(
          formatINR(unitPrice),
          pageWidth - margin - 45,
          y
        );
        pdf.text(
          formatINR(amount),
          pageWidth - margin,
          y,
          { align: "right" }
        );

        y += rowHeight;
      }

      y += 3;
      ensureSpace(35);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 9;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text("Order total:", margin, y);
      pdf.text(formatINR(Number(order.total_price)), pageWidth - margin, y, {
        align: "right",
      });

      y += 12;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      y += addText(
        "This document confirms that an order was recorded by Dealstack. It is not a GST tax invoice or proof of payment.",
        margin,
        y
      );

      y += 4;
      addText(
        "GST treatment, applicable taxes, and the final tax invoice must be confirmed separately by Dealstack.",
        margin,
        y
      );

      // Add page numbers to every page.
      const pageCount = pdf.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        pdf.setPage(page);
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          `Order ${order.id} | Page ${page} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );
      }

      pdf.save(`Dealstack-Order-${order.id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      window.alert("Could not generate the PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <p>Loading your order...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <h1 className="text-3xl font-bold">Order Confirmation</h1>
        <p className="mt-4 max-w-xl text-gray-400">
          {errorMessage || "The order could not be loaded."}
        </p>
        <Link
          href="/account"
          className="mt-8 rounded-xl bg-white px-6 py-3 font-bold text-black"
        >
          Go to My Account
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 py-12 text-center text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-950 p-6 md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500 text-3xl text-green-400">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-extrabold md:text-5xl">
          Order Placed Successfully
        </h1>

        <p className="mt-5 text-lg text-gray-400">
          Thank you for shopping with Dealstack. Your order has been received.
        </p>

        <div className="mt-8 rounded-xl border border-gray-800 bg-black p-5 text-left">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Order number</span>
            <span className="font-bold">#{order.id}</span>
          </div>

          <div className="mt-4 flex justify-between gap-4">
            <span className="text-gray-400">Order status</span>
            <span className="font-semibold">{order.status}</span>
          </div>

          <div className="mt-4 flex justify-between gap-4">
            <span className="text-gray-400">Order total</span>
            <span className="font-bold">
              {formatINR(Number(order.total_price))}
            </span>
          </div>

          <p className="mt-5 text-sm text-gray-500">
            This confirmation does not verify payment and is not a GST tax invoice.
          </p>
        </div>

        <button
          type="button"
          onClick={downloadPDF}
          disabled={generatingPDF}
          className="mt-8 w-full rounded-xl bg-white px-6 py-4 font-bold text-black transition hover:bg-gray-200 disabled:opacity-50"
        >
          {generatingPDF ? "Generating PDF..." : "Download Order Confirmation PDF"}
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="mt-3 w-full rounded-xl border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-900"
        >
          Print This Page
        </button>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-gray-200"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account"
            className="rounded-xl border border-gray-700 px-6 py-3 font-semibold hover:bg-gray-900"
          >
            My Account
          </Link>
        </div>
      </div>
    </main>
  );
}
