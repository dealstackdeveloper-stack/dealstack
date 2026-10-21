
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

type CustomerAddress = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

const emptyAddress = {
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
};

const fieldClass =
  "w-full min-w-0 rounded-xl border border-white/10 bg-[#080a0f] px-4 py-3.5 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressFields, setAddressFields] = useState(emptyAddress);

  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(false);
  const [makeDefault, setMakeDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  function updateAddress(
    field: keyof typeof emptyAddress,
    value: string
  ) {
    setAddressFields((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSelectedAddressId("");
  }

  function formatAddress(fields: typeof emptyAddress) {
    return [
      fields.address_line1,
      fields.address_line2,
      fields.city,
      fields.state,
      fields.postal_code,
      fields.country,
    ]
      .filter((part) => part?.trim())
      .join(", ");
  }

  function selectSavedAddress(
    saved: CustomerAddress,
    updateSelection = true
  ) {
    setName(saved.full_name);
    setPhone(saved.phone);

    setAddressFields({
      address_line1: saved.address_line1,
      address_line2: saved.address_line2 ?? "",
      city: saved.city,
      state: saved.state,
      postal_code: saved.postal_code,
      country: saved.country || "India",
    });

    setSelectedAddressId(saved.id);

    if (updateSelection) {
      setSaveAddress(false);
      setMakeDefault(false);
    }
  }

  async function loadSavedAddresses(userId: string) {
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Loading saved addresses failed:", error);
      toast.error("Could not load saved addresses.");
      return;
    }

    const addresses = (data ?? []) as CustomerAddress[];
    setSavedAddresses(addresses);

    const preferredAddress = addresses.find(
      (item) => item.is_default
    );

    if (preferredAddress) {
      selectSavedAddress(preferredAddress, false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        toast.error("Please log in before checkout.");
        router.replace("/customer-login");
        return;
      }

      const user = data.user;

      setEmail(user.email ?? "");
      setName(user.user_metadata?.full_name ?? "");
      setPhone(user.user_metadata?.phone ?? "");

      await loadSavedAddresses(user.id);

      if (active) setCheckingAuth(false);
    }

    void loadCustomer();

    return () => {
      active = false;
    };
  }, [router]);

  const totalPrice = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  async function handlePlaceOrder() {
    if (checkingAuth || loading) return;

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !addressFields.address_line1.trim() ||
      !addressFields.city.trim() ||
      !addressFields.state.trim() ||
      !addressFields.postal_code.trim() ||
      !addressFields.country.trim()
    ) {
      toast.error("Please complete all required details.");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        toast.error("Please log in before placing your order.");
        router.replace("/customer-login");
        return;
      }

      const fullAddress = formatAddress(addressFields);

      // Save the shipping address if requested.
      if (saveAddress) {
        if (makeDefault) {
          const { error: resetError } = await supabase
            .from("customer_addresses")
            .update({ is_default: false })
            .eq("user_id", user.id);

          if (resetError) {
            console.error(resetError);
            toast.error("Could not update your default address.");
            return;
          }
        }

        const { error: addressError } = await supabase
          .from("customer_addresses")
          .insert({
            user_id: user.id,
            full_name: name.trim(),
            phone: phone.trim(),
            address_line1: addressFields.address_line1.trim(),
            address_line2:
              addressFields.address_line2.trim() || null,
            city: addressFields.city.trim(),
            state: addressFields.state.trim(),
            postal_code: addressFields.postal_code.trim(),
            country: addressFields.country.trim(),
            is_default: makeDefault || savedAddresses.length === 0,
          });

        if (addressError) {
          console.error("Saving address failed:", addressError);
          toast.error("Could not save the address. Please try again.");
          return;
        }
      }

      // Create the order and return its database-generated ID.
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          customer_name: name.trim(),
          customer_email: user.email,
          customer_phone: phone.trim(),
          address: fullAddress,
          products: cart,
          total_price: totalPrice,
          status: "Pending",
        })
        .select("id")
        .single();

      if (orderError || !newOrder) {
        console.error("Order insertion failed:", orderError);
        toast.error("Order failed. Please try again.");
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/success?orderId=${newOrder.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080a0f] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-yellow-400" />
          <p className="mt-4 text-sm text-gray-400">
            Verifying your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080a0f] px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-yellow-400"
        >
          <span aria-hidden="true">←</span>
          Back to Cart
        </Link>

        <header className="mb-8 mt-5 border-b border-white/10 pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-400">
            Dealstack Store
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            Checkout
          </h1>
          <p className="mt-3 text-sm text-gray-400 sm:text-base">
            Confirm your delivery details and review your order.
          </p>
        </header>

        {cart.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-[#111722] px-6 py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/10 text-3xl text-yellow-400">
              🛒
            </div>
            <h2 className="mt-5 text-2xl font-bold">
              Your cart is empty
            </h2>
            <p className="mt-3 text-gray-400">
              Add products to your cart before proceeding to checkout.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              Browse Products
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
            {/* Billing and shipping details */}
            <section className="rounded-2xl border border-white/10 bg-[#111722] p-5 sm:p-7 lg:col-span-3">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 font-black text-yellow-400">
                  01
                </span>
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Billing Details
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Enter your contact and delivery information.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {savedAddresses.length > 0 && (
                  <div>
                    <label
                      htmlFor="saved-address"
                      className="mb-2 block text-sm font-semibold text-gray-300"
                    >
                      Choose a Saved Address
                    </label>

                    <select
                      id="saved-address"
                      value={selectedAddressId}
                      onChange={(e) => {
                        const id = e.target.value;

                        if (!id) {
                          setSelectedAddressId("");
                          setAddressFields(emptyAddress);
                          setSaveAddress(false);
                          setMakeDefault(false);
                          return;
                        }

                        const saved = savedAddresses.find(
                          (item) => item.id === id
                        );

                        if (saved) selectSavedAddress(saved);
                      }}
                      className={fieldClass}
                    >
                      <option value="">Enter a new address</option>
                      {savedAddresses.map((saved) => (
                        <option key={saved.id} value={saved.id}>
                          {saved.full_name} — {saved.city}
                          {saved.is_default ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>

                    <p className="mt-2 text-xs text-gray-500">
                      Select an address to fill in your details.
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="checkout-name"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Full Name <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSelectedAddressId("");
                    }}
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-email"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Email Address
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    readOnly
                    className={`${fieldClass} cursor-not-allowed bg-[#171e2b] text-gray-400`}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Your email is linked to your signed-in account.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Phone Number <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setSelectedAddressId("");
                    }}
                    required
                    className={fieldClass}
                  />
                </div>

                <div className="border-t border-white/10 pt-5">
                  <h3 className="text-lg font-bold">
                    Shipping Address
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Where should we deliver your order?
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="address-line1"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Address Line 1 <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    id="address-line1"
                    type="text"
                    placeholder="House number, building, street"
                    autoComplete="address-line1"
                    value={addressFields.address_line1}
                    onChange={(e) =>
                      updateAddress("address_line1", e.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="address-line2"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Address Line 2{" "}
                    <span className="font-normal text-gray-500">
                      (Optional)
                    </span>
                  </label>
                  <input
                    id="address-line2"
                    type="text"
                    placeholder="Area, landmark, locality"
                    autoComplete="address-line2"
                    value={addressFields.address_line2}
                    onChange={(e) =>
                      updateAddress("address_line2", e.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="address-city"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    City <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    id="address-city"
                    type="text"
                    placeholder="Enter your city"
                    autoComplete="address-level2"
                    value={addressFields.city}
                    onChange={(e) =>
                      updateAddress("city", e.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="address-state"
                      className="mb-2 block text-sm font-semibold text-gray-300"
                    >
                      State <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      id="address-state"
                      type="text"
                      placeholder="State"
                      autoComplete="address-level1"
                      value={addressFields.state}
                      onChange={(e) =>
                        updateAddress("state", e.target.value)
                      }
                      required
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="address-pin"
                      className="mb-2 block text-sm font-semibold text-gray-300"
                    >
                      PIN Code <span className="text-yellow-400">*</span>
                    </label>
                    <input
                      id="address-pin"
                      type="text"
                      inputMode="numeric"
                      placeholder="PIN code"
                      autoComplete="postal-code"
                      value={addressFields.postal_code}
                      onChange={(e) =>
                        updateAddress("postal_code", e.target.value)
                      }
                      required
                      className={fieldClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="address-country"
                    className="mb-2 block text-sm font-semibold text-gray-300"
                  >
                    Country <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    id="address-country"
                    type="text"
                    placeholder="Country"
                    autoComplete="country-name"
                    value={addressFields.country}
                    onChange={(e) =>
                      updateAddress("country", e.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </div>

                <div className="space-y-4 rounded-xl border border-white/10 bg-[#080a0f]/70 p-4 sm:p-5">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => {
                        setSaveAddress(e.target.checked);
                        if (!e.target.checked) setMakeDefault(false);
                        setSelectedAddressId("");
                      }}
                      className="mt-1 h-4 w-4 accent-yellow-400"
                    />

                    <span>
                      <span className="block font-semibold text-white">
                        Save this address for future orders
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-gray-400">
                        Use this address again at your next checkout.
                      </span>
                    </span>
                  </label>

                  {saveAddress && (
                    <label className="flex cursor-pointer items-center gap-3 pl-7">
                      <input
                        type="checkbox"
                        checked={makeDefault}
                        onChange={(e) => setMakeDefault(e.target.checked)}
                        className="h-4 w-4 accent-yellow-400"
                      />
                      <span className="text-sm text-gray-300">
                        Make this my default address
                      </span>
                    </label>
                  )}

                  <p className="text-sm text-gray-400">
                    Manage saved addresses from{" "}
                    <button
                      type="button"
                      onClick={() => router.push("/account")}
                      className="font-semibold text-yellow-400 underline underline-offset-4 transition hover:text-yellow-300"
                    >
                      My Account
                    </button>
                    .
                  </p>
                </div>
              </div>
            </section>

            {/* Order summary */}
            <section className="rounded-2xl border border-white/10 bg-[#111722] p-5 sm:p-7 lg:sticky lg:top-6 lg:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 font-black text-yellow-400">
                  02
                </span>
                <div>
                  <h2 className="text-xl font-bold sm:text-2xl">
                    Order Summary
                  </h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Review your items before ordering.
                  </p>
                </div>
              </div>

              <div className="mb-5 flex items-center justify-between rounded-xl border border-white/10 bg-[#080a0f]/70 px-4 py-3">
                <span className="text-sm text-gray-400">
                  Items in your order
                </span>
                <span className="font-bold text-yellow-400">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex justify-between gap-4 border-b border-white/10 pb-4"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-6 text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        ₹{Number(item.price).toLocaleString("en-IN")} each
                      </p>
                    </div>

                    <div className="shrink-0 text-right font-bold text-white">
                      ₹
                      {(
                        Number(item.price) * item.quantity
                      ).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Shipping</span>
                  <span className="text-gray-300">
                    To be confirmed
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                <div>
                  <h3 className="text-lg font-bold">Order Total</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Based on current cart prices
                  </p>
                </div>
                <div className="text-right text-2xl font-black text-yellow-400 sm:text-3xl">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || checkingAuth || cart.length === 0}
                className="mt-7 w-full rounded-xl bg-yellow-400 py-4 font-bold text-black shadow-lg shadow-yellow-400/10 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Placing Order...
                  </span>
                ) : (
                  "Place Order →"
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                Please verify your delivery details before placing your order.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-xs text-gray-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-4 w-4 text-yellow-400"
                  aria-hidden="true"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    strokeLinecap="round"
                  />
                </svg>
                Secure account-based checkout
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
