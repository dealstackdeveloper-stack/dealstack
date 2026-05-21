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
  (total, item) =>
    total + Number(item.price) * item.quantity,
  0
);

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-bold mb-10">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (

        <p className="text-gray-400 text-xl">
          Your cart is empty.
        </p>

      ) : (

        <div className="space-y-6">

          {cart.map((item, index) => (

            <div
              key={index}
              className="flex items-center gap-6 bg-gray-900 p-5 rounded-2xl border border-gray-800"
            >

              {/* Image */}
              <div className="w-32 h-32 overflow-hidden rounded-xl">

                <Image
                  src={item.image}
                  alt={item.title}
                  width={200}
                  height={200}
                  className="w-full h-auto object-cover"
                />

              </div>

              {/* Details */}
              <div className="flex-1">

                <h2 className="text-2xl font-bold">
                  {item.title}
                </h2>

                <p className="text-gray-400 mt-2">
                  Premium technology product.
                </p>
                <div className="flex items-center gap-4 mt-4">

  <button
    onClick={() => decreaseQuantity(item.id)}
    className="bg-gray-800 w-10 h-10 rounded-lg text-xl"
  >
    -
  </button>

  <span className="text-xl font-bold">
    {item.quantity}
  </span>

  <button
    onClick={() => increaseQuantity(item.id)}
    className="bg-gray-800 w-10 h-10 rounded-lg text-xl"
  >
    +
  </button>

</div>

              </div>

              <div className="flex flex-col items-end gap-4">

  {/* Price */}
  <div className="text-2xl font-bold">
    ₹{item.price}
  </div>

  {/* Remove Button */}
  <button
    onClick={() => removeFromCart(index)}
    className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
  >
    Remove
  </button>

</div>

            </div>

          ))}

          {/* Total */}
          <div className="flex justify-between items-center mt-10 border-t border-gray-800 pt-8">

            <h2 className="text-3xl font-bold">
              Total
            </h2>

            <div className="text-4xl font-bold">
              ₹{totalPrice}
            </div>

          </div>

          <Link href="/checkout">

  <button className="mt-8 w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition">

    Proceed to Checkout

  </button>

</Link>

        </div>

      )}

    </main>
  );
}