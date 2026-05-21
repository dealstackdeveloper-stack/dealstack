"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type CartItem = {
  id: number;
  title: string;
  price: string;
  image: string;
  slug: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (index: number) => void;
  increaseQuantity: (id: number) => void;
decreaseQuantity: (id: number) => void;
clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(
  null
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [cart, setCart] = useState<CartItem[]>([]);
  useEffect(() => {

  const savedCart = localStorage.getItem("dealstack-cart");

  if (savedCart) {
    setCart(JSON.parse(savedCart));
  }

}, []);

useEffect(() => {

  localStorage.setItem(
    "dealstack-cart",
    JSON.stringify(cart)
  );

}, [cart]);

  function addToCart(product: CartItem) {

  setCart((prev) => {

    const existingProduct = prev.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {

      return prev.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      );
    }

    return [
      ...prev,
      {
        ...product,
        quantity: 1,
      },
    ];
  });
}

  function removeFromCart(index: number) {

    setCart((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function increaseQuantity(id: number) {

  setCart((prev) =>
    prev.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    )
  );
}

function decreaseQuantity(id: number) {

  setCart((prev) =>
    prev
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
}
function clearCart() {

  setCart([]);
}
  return (
    <CartContext.Provider
      value={{
  cart,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
}}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}