"use client";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
export default function Navbar() {

  const { cart } = useCart();
  const [menuOpen, setMenuOpen] =
  useState(false);
  const totalItems = cart.reduce(
  (total, item) => total + item.quantity,
  0
);
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">

      {/* Logo */}
      <div className="flex items-center">

  <div className="text-3xl font-bold tracking-wide">
  Dealstack
</div>

</div>

      {/* Menu */}
      <ul className="hidden md:flex gap-8 text-gray-300">
        <li className="hover:text-white cursor-pointer">
          Home
        </li>

        <li className="hover:text-white cursor-pointer">
          Products
        </li>

        <li className="hover:text-white cursor-pointer">
          Categories
        </li>

        <li className="hover:text-white cursor-pointer">
          Contact
        </li>
      </ul>

<button
  onClick={() => setMenuOpen(!menuOpen)}
  className="md:hidden text-3xl"
>
  ☰
</button>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Cart */}
        <div className="relative">

          <Link href="/cart">

  <button className="bg-gray-900 border border-gray-700 px-5 py-2 rounded-lg font-semibold hover:border-white transition">
    Cart
  </button>

</Link>

          <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {totalItems}
          </span>

        </div>

        {/* Login */}
        <button className="bg-white text-black px-5 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
          Login
        </button>

      </div>

{menuOpen && (

  <div className="md:hidden absolute top-20 left-0 w-full bg-black border-t border-gray-800 px-8 py-6 z-50">

    <ul className="flex flex-col gap-6 text-lg text-gray-300">

      <li className="hover:text-white cursor-pointer">
        Home
      </li>

      <li className="hover:text-white cursor-pointer">
        Products
      </li>

      <li className="hover:text-white cursor-pointer">
        Categories
      </li>

      <li className="hover:text-white cursor-pointer">
        Contact
      </li>

    </ul>

  </div>

)}

    </nav>
  );
}