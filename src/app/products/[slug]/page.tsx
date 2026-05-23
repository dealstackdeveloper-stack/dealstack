"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import { useParams } from "next/navigation";

import { supabase } from "@/lib/supabase";

import { useCart } from "@/context/CartContext";

import toast from "react-hot-toast";

export default function ProductPage() {

  const params = useParams();

  const slug = params.slug as string;

  const { addToCart } = useCart();

  const [product, setProduct] =
    useState<any>(null);

  useEffect(() => {

    async function fetchProduct() {

      const { data, error } =
        await supabase
          .from("products")
          .select("*")
          .eq("slug", slug)
          .single();

      if (error) {

        console.log(error);

      } else {

        setProduct(data);
      }
    }

    if (slug) {

      fetchProduct();
    }

  }, [slug]);

  if (!product) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">

        Loading...

      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-6 py-16">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        <div className="bg-gray-900 rounded-3xl p-10">

          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="w-full h-auto object-contain"
            priority
          />

        </div>

        <div>

          <p className="text-yellow-400 text-lg mb-4">

            {product.category}

          </p>

          <h1 className="text-5xl font-extrabold leading-tight">

            {product.title}

          </h1>

          <p className="text-4xl font-bold mt-8">

            ₹{product.price}

          </p>

          <button
            onClick={() => {

              addToCart(product);

              toast.success("Added to cart");
            }}
            className="mt-10 bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 transition"
          >

            Add To Cart

          </button>

        </div>

      </div>

    </main>
  );
}