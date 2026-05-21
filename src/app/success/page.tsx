import Link from "next/link";

export default function SuccessPage() {

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-6">

      <h1 className="text-6xl font-extrabold">
        Order Placed Successfully
      </h1>

      <p className="text-gray-400 text-xl mt-6 max-w-2xl">
        Thank you for shopping with Dealstack.
        Your order has been received and is being processed.
      </p>

      <Link href="/">

        <button className="mt-10 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition">

          Continue Shopping

        </button>

      </Link>

    </main>
  );
}