
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  const totalPrice = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      {/* Page header */}
      <section className="border-b border-white/10 bg-gradient-to-b from-[#131927] to-[#080a0f]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-yellow-400">
              Home
            </Link>
            <span>/</span>
            <span className="text-yellow-400">Shopping Cart</span>
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                Your selections
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
                Shopping Cart
              </h1>
              <p className="mt-3 text-sm text-gray-400 sm:text-base">
                Review your products before proceeding to checkout.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-gray-400">Items in your cart</p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        {cart.length === 0 ? (
          /* Empty cart */
          <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#111722] px-6 py-14 text-center shadow-xl sm:px-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                className="h-10 w-10"
                aria-hidden="true"
              >
                <path
                  d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.5L22 8H6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is waiting
            </h2>
            <p className="mt-3 leading-7 text-gray-400">
              You haven&apos;t added any products yet. Explore our collection
              and find the right technology for your needs.
            </p>

            <Link
              href="/products"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 font-bold text-black transition hover:bg-yellow-300"
            >
              Continue Shopping <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_390px]">
            {/* Cart items */}
            <section className="min-w-0">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">
                  Cart Items
                </h2>
                <Link
                  href="/products"
                  className="text-sm font-semibold text-yellow-400 transition hover:text-yellow-300"
                >
                  + Add more
                </Link>
              </div>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <article
                    key={`${item.id}-${index}`}
                    className="group rounded-2xl border border-white/10 bg-[#111722] p-4 transition duration-200 hover:border-yellow-400/40 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      {/* Product image */}
                      <Link
                        href={`/products/${item.id}`}
                        className="relative flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-3 sm:h-32 sm:w-32"
                      >
                        <Image
                          src={item.image || "/images/placeholder.png"}
                          alt={item.title}
                          width={200}
                          height={200}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                        />
                      </Link>

                      {/* Product details */}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.id}`}
                          className="inline-block text-lg font-bold transition hover:text-yellow-400 sm:text-xl"
                        >
                          {item.title}
                        </Link>

                        <p className="mt-2 text-sm text-gray-400">
                          Quality technology from Dealstack
                        </p>

                        <p className="mt-3 text-sm text-gray-500">
                          Unit price:{" "}
                          <span className="font-semibold text-gray-300">
                            {formatPrice(Number(item.price))}
                          </span>
                        </p>

                        {/* Quantity controls */}
                        <div className="mt-4 flex items-center gap-3">
                          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Qty
                          </span>

                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease quantity of ${item.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#202938] text-lg font-bold transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            −
                          </button>

                          <span
                            className="min-w-6 text-center font-bold tabular-nums"
                            aria-live="polite"
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            aria-label={`Increase quantity of ${item.title}`}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#202938] text-lg font-bold transition hover:border-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price and remove */}
                      <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Item total
                          </p>
                          <p className="mt-1 text-xl font-black text-yellow-400 sm:text-2xl">
                            {formatPrice(
                              Number(item.price) * item.quantity
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 px-3 py-2 text-sm font-semibold text-red-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 6h18M8 6V4h8v2m-11 0 1 14h12l1-14M10 10v6m4-6v6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-yellow-400"
              >
                <span aria-hidden="true">←</span> Continue shopping
              </Link>
            </section>

            {/* Order summary */}
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111722]">
                <div className="border-b border-white/10 px-5 py-5 sm:px-6">
                  <h2 className="text-xl font-bold">Order Summary</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Check your total before checkout.
                  </p>
                </div>

                <div className="space-y-4 px-5 py-6 sm:px-6">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="font-semibold">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-400">Delivery</span>
                    <span className="text-gray-400">Calculated at checkout</span>
                  </div>

                  <div className="border-t border-dashed border-white/15 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-2xl font-black text-yellow-400">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Final delivery charges and applicable taxes, if any,
                      will be confirmed during checkout.
                    </p>
                  </div>

                  <Link
                    href="/checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-4 font-extrabold text-black shadow-lg shadow-yellow-400/10 transition hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-yellow-400/20"
                  >
                    Proceed to Checkout
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 12h14m-6-6 6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-gray-500">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-4 w-4 text-yellow-400"
                      aria-hidden="true"
                    >
                      <rect x="4" y="10" width="16" height="11" rx="2" />
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    </svg>
                    Your order details are handled securely.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Footer accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-70" />
    </main>
  );
}
