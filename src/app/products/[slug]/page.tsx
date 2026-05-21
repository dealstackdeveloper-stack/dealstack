"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function ProductPage() {

  const params = useParams();

  const slug = params.slug as string;

  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.slug === slug
  );

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-4xl font-bold">
          Product Not Found
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* Product Image */}
        <div className="w-full h-[500px] overflow-hidden rounded-3xl">

          <Image
  src={product.image}
  alt={product.title}
  width={800}
  height={500}
  loading="eager"
  className="w-full object-cover h-auto"
/>

        </div>

        {/* Product Details */}
        <div>

          <h1 className="text-5xl font-bold">
            {product.title}
          </h1>

          <p className="text-4xl font-bold mt-6">
            ₹{product.price}
          </p>

          <p className="text-gray-400 text-lg mt-8 leading-relaxed">
            {product.description}
          </p>

          <button
            onClick={() => {

  addToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    slug: product.slug,
    quantity: 1,
  });

  toast.success("Product added to cart");

}}
            className="mt-10 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
          >
            Add to Cart
          </button>

        </div>

      </div>

    </main>
  );
}