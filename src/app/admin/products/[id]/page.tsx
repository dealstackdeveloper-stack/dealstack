"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function EditProductPage() {

  const params = useParams();

  const router = useRouter();

  const id = params.id;

  const [title, setTitle] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [image, setImage] =
    useState("");

  const [category, setCategory] =
    useState("");

  useEffect(() => {

    async function fetchProduct() {

      const { data, error } =
        await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

      if (data) {

        setTitle(data.title);

        setPrice(data.price);

        setImage(data.image);

        setCategory(data.category);
      }

      if (error) {

        console.log(error);
      }
    }

    if (id) {

      fetchProduct();
    }

  }, [id]);

  async function updateProduct(
    e: React.FormEvent
  ) {

    e.preventDefault();

    const slug =
      title
        .toLowerCase()
        .replace(/\s+/g, "-");

    const { error } =
      await supabase
        .from("products")
        .update({
          title,
          price,
          image,
          category,
          slug,
        })
        .eq("id", id);

    if (error) {

      console.log(error);

      alert("Failed to update");

    } else {

      alert("Product updated");

      router.push("/admin/products");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">

      <div className="max-w-2xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">

          Edit Product

        </h1>

        <form
          onSubmit={updateProduct}
          className="space-y-6"
        >

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700"
          />

          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700"
          />

          <input
            type="text"
            placeholder="/images/product.jpg"
            value={image}
            onChange={(e) =>
              setImage(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700"
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full p-4 rounded-xl bg-gray-900 border border-gray-700"
          />

          <button
            type="submit"
            className="bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-300 transition"
          >

            Update Product

          </button>

        </form>

      </div>

    </main>
  );
}