"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {

  const { cart, clearCart } = useCart();

const router = useRouter();

  const totalPrice = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <h1 className="text-5xl font-bold mb-12">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Billing Form */}
        <div>

          <h2 className="text-3xl font-bold mb-8">
            Billing Details
          </h2>

          <div className="space-y-6">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

            <textarea
              placeholder="Shipping Address"
              rows={5}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

          </div>

        </div>

        {/* Order Summary */}
        <div>

          <h2 className="text-3xl font-bold mb-8">
            Order Summary
          </h2>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">

            <div className="space-y-6">

              {cart.map((item, index) => (

                <div
                  key={index}
                  className="flex justify-between border-b border-gray-800 pb-4"
                >

                  <div>

                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <p className="text-gray-400 text-sm mt-1">
                      Quantity: {item.quantity}
                    </p>

                  </div>

                  <div className="font-bold">
                    ₹
                    {Number(item.price) *
                      item.quantity}
                  </div>

                </div>

              ))}

            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-800">

              <h3 className="text-2xl font-bold">
                Total
              </h3>

              <div className="text-3xl font-bold">
                ₹{totalPrice}
              </div>

            </div>

            {/* Place Order */}
            <button
  onClick={() => {

    clearCart();

    toast.success("Order placed successfully");

    router.push("/success");

  }}
  className="w-full mt-10 bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition"
>

  Place Order

</button>

          </div>

        </div>

      </div>

    </main>
  );
}