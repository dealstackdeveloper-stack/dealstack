"use client";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddProductPage() {

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  async function handleSubmit(
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
      .insert([
        {
          title,
          price,
          image,
          slug,
          category,
        },
      ]);

  if (error) {

    console.log(error);

    alert("Failed to add product");

  } else {

    alert("Product added successfully");

    setTitle("");
    setPrice("");
    setImage("");
    setCategory("");
  }
}

  return (

      <ProtectedRoute>

    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-5xl font-extrabold">
          Add New Product
        </h1>

        <p className="text-gray-400 mt-4 text-lg">
          Create new inventory items for Dealstack.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 space-y-8"
        >

          <div>

            <label className="block mb-3 text-lg">
              Product Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter product title"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

          </div>

          <div>

            <label className="block mb-3 text-lg">
              Price
            </label>

            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

          </div>

          <div>

            <label className="block mb-3 text-lg">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            >

              <option value="">
                Select Category
              </option>

              <option value="Surveillance Systems">
                Surveillance Systems
              </option>

              <option value="Networking Switches & Routers">
                Networking Switches & Routers
              </option>

              <option value="Surveillance Hard Disk">
                Surveillance Hard Disk
              </option>

              <option value="Gadget & Accessories">
                Gadget & Accessories
              </option>

            </select>

          </div>

          <div>

            <label className="block mb-3 text-lg">
              Product Image URL
            </label>

            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/images/product-name.jpg"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 outline-none focus:border-white"
            />

          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 transition"
          >

            Add Product

          </button>

        </form>

      </div>

    </main>

    </ProtectedRoute>
    
  );
}