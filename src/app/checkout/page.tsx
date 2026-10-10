
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  "w-full min-w-0 rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 outline-none focus:border-white";

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

    loadCustomer();

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

      // Keep the order ID in the URL so the success page can load it.
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
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p>Verifying your account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-5 text-white md:p-8">
      <h1 className="mb-12 text-4xl font-bold md:text-5xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <section>
          <h2 className="mb-8 text-3xl font-bold">Billing Details</h2>

          <div className="space-y-5">
            {savedAddresses.length > 0 && (
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Choose a Saved Address
                </label>

                <select
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

                <p className="mt-2 text-sm text-gray-400">
                  Select an address to fill in your details.
                </p>
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSelectedAddressId("");
              }}
              required
              className={fieldClass}
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              readOnly
              className={`${fieldClass} cursor-not-allowed bg-gray-800 text-gray-400`}
            />

            <input
              type="tel"
              placeholder="Phone Number"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSelectedAddressId("");
              }}
              required
              className={fieldClass}
            />

            <h3 className="pt-2 text-xl font-semibold">
              Shipping Address
            </h3>

            <input
              type="text"
              placeholder="Address Line 1 / House No. / Street"
              autoComplete="address-line1"
              value={addressFields.address_line1}
              onChange={(e) =>
                updateAddress("address_line1", e.target.value)
              }
              required
              className={fieldClass}
            />

            <input
              type="text"
              placeholder="Address Line 2 (Optional)"
              autoComplete="address-line2"
              value={addressFields.address_line2}
              onChange={(e) =>
                updateAddress("address_line2", e.target.value)
              }
              className={fieldClass}
            />

            <input
              type="text"
              placeholder="City"
              autoComplete="address-level2"
              value={addressFields.city}
              onChange={(e) => updateAddress("city", e.target.value)}
              required
              className={fieldClass}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <input
                type="text"
                placeholder="State"
                autoComplete="address-level1"
                value={addressFields.state}
                onChange={(e) => updateAddress("state", e.target.value)}
                required
                className={fieldClass}
              />

              <input
                type="text"
                placeholder="PIN Code"
                autoComplete="postal-code"
                value={addressFields.postal_code}
                onChange={(e) =>
                  updateAddress("postal_code", e.target.value)
                }
                required
                className={fieldClass}
              />
            </div>

            <input
              type="text"
              placeholder="Country"
              autoComplete="country-name"
              value={addressFields.country}
              onChange={(e) => updateAddress("country", e.target.value)}
              required
              className={fieldClass}
            />

            <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => {
                    setSaveAddress(e.target.checked);
                    if (!e.target.checked) setMakeDefault(false);
                    setSelectedAddressId("");
                  }}
                  className="mt-1 h-4 w-4 accent-white"
                />

                <span>
                  <span className="block font-semibold">
                    Save this address for future orders
                  </span>
                  <span className="mt-1 block text-sm text-gray-400">
                    This address will be available at your next checkout.
                  </span>
                </span>
              </label>

              {saveAddress && (
                <label className="flex cursor-pointer items-center gap-3 pl-7">
                  <input
                    type="checkbox"
                    checked={makeDefault}
                    onChange={(e) => setMakeDefault(e.target.checked)}
                    className="h-4 w-4 accent-white"
                  />
                  <span className="text-sm">
                    Make this my default address
                  </span>
                </label>
              )}

              <p className="text-sm text-gray-400">
                Manage your saved addresses from{" "}
                <button
                  type="button"
                  onClick={() => router.push("/account")}
                  className="text-white underline underline-offset-4"
                >
                  My Account
                </button>
                .
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-8 text-3xl font-bold">Order Summary</h2>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 md:p-8">
            <div className="space-y-6">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-4 border-b border-gray-800 pb-4"
                >
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <div className="whitespace-nowrap font-bold">
                    ₹
                    {(
                      Number(item.price) * item.quantity
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-800 pt-6">
              <h3 className="text-2xl font-bold">Total</h3>
              <div className="text-2xl font-bold md:text-3xl">
                ₹{totalPrice.toLocaleString("en-IN")}
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || checkingAuth || cart.length === 0}
              className="mt-10 w-full rounded-xl bg-white py-4 font-bold text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
