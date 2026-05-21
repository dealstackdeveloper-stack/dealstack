import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Dealstack",
  description: "Modern eCommerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">

      <body>

        <AuthProvider>
  <CartProvider>

  <Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: "#111827",
        color: "#ffffff",
        border: "1px solid #374151",
      },
    }}
  />

  {children}

</CartProvider>
</AuthProvider>

      </body>

    </html>
  );
}