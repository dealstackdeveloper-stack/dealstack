"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type CustomerOrder = {
  id: number;
  customer_name: string | null;
  customer_email: string | null;
  total_price: number | string | null;
  status: string | null;
  created_at: string | null;
};

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
  created_at: string;
};

const emptyAddress = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

export default function CustomerAccountPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(
    null
  );
  const [addressForm, setAddressForm] = useState(emptyAddress);

  async function loadAddresses() {
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Address loading error:", error);
      toast.error("Unable to load saved addresses.");
      return;
    }

    setAddresses((data ?? []) as CustomerAddress[]);
  }

  useEffect(() => {
    async function loadAccount() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/customer-login");
          return;
        }

        setEmail(user.email ?? "");

        const [ordersResult, addressesResult] = await Promise.all([
          supabase
            .from("orders")
            .select(
              "id, customer_name, customer_email, total_price, status, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),

          supabase
            .from("customer_addresses")
            .select("*")
            .order("is_default", { ascending: false })
            .order("created_at", { ascending: false }),
        ]);

        if (ordersResult.error) {
          console.error("Order history error:", ordersResult.error);
          toast.error("Unable to load your orders.");
        } else {
          setOrders((ordersResult.data ?? []) as CustomerOrder[]);
        }

        if (addressesResult.error) {
          console.error("Address loading error:", addressesResult.error);
          toast.error("Unable to load saved addresses.");
        } else {
          setAddresses((addressesResult.data ?? []) as CustomerAddress[]);
        }
      } catch (error) {
        console.error("Account loading error:", error);
        toast.error("Unable to load your account.");
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [router]);

  async function handleLogout() {
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      toast.error("Unable to log out. Please try again.");
      setLoggingOut(false);
      return;
    }

    toast.success("Logged out successfully.");
    router.replace("/customer-login");
    router.refresh();
  }

  function startAddAddress() {
    setEditingAddressId(null);
    setAddressForm(emptyAddress);
    setShowAddressForm(true);
  }

  function startEditAddress(address: CustomerAddress) {
    setEditingAddressId(address.id);
    setAddressForm({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 ?? "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });
    setShowAddressForm(true);
  }

  function updateAddressField(
    field: keyof typeof emptyAddress,
    value: string | boolean
  ) {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSaveAddress(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Please log in again.");
      router.replace("/customer-login");
      return;
    }

    if (
      !addressForm.full_name.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.address_line1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.postal_code.trim() ||
      !addressForm.country.trim()
    ) {
      toast.error("Please complete all required address fields.");
      return;
    }

    setSavingAddress(true);

    try {
      if (addressForm.is_default) {
        const { error: defaultError } = await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);

        if (defaultError) {
          console.error("Default address update error:", defaultError);
          toast.error("Unable to update the default address.");
          return;
        }
      }

      const addressData = {
        full_name: addressForm.full_name.trim(),
        phone: addressForm.phone.trim(),
        address_line1: addressForm.address_line1.trim(),
        address_line2: addressForm.address_line2.trim() || null,
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        postal_code: addressForm.postal_code.trim(),
        country: addressForm.country.trim(),
        is_default: addressForm.is_default,
      };

      const result = editingAddressId
        ? await supabase
            .from("customer_addresses")
            .update(addressData)
            .eq("id", editingAddressId)
            .eq("user_id", user.id)
        : await supabase.from("customer_addresses").insert({
            ...addressData,
            user_id: user.id,
          });

      if (result.error) {
        console.error("Address save error:", result.error);
        toast.error("Unable to save the address.");
        return;
      }

      toast.success(
        editingAddressId
          ? "Address updated successfully."
          : "Address saved successfully."
      );

      setShowAddressForm(false);
      setEditingAddressId(null);
      setAddressForm(emptyAddress);
      await loadAddresses();
    } catch (error) {
      console.error("Address save error:", error);
      toast.error("Something went wrong while saving the address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    const { error } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Address deletion error:", error);
      toast.error("Unable to delete the address.");
      return;
    }

    toast.success("Address deleted.");
    await loadAddresses();
  }

  async function handleSetDefault(id: string) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      toast.error("Please log in again.");
      return;
    }

    const { error: resetError } = await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);

    if (resetError) {
      toast.error("Unable to update the default address.");
      return;
    }

    const { error } = await supabase
      .from("customer_addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Default address error:", error);
      toast.error("Unable to set the default address.");
      return;
    }

    toast.success("Default address updated.");
    await loadAddresses();
  }

  const totalSpent = orders.reduce(
    (sum, order) => sum + Number(order.total_price ?? 0),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <p className="text-gray-300">Loading your account...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold md:text-5xl">My Account</h1>
            <p className="mt-3 break-all text-gray-400">{email}</p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Total Orders</p>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Total Order Value</p>
            <p className="mt-2 text-3xl font-bold">
              ₹{totalSpent.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <p className="text-gray-400">Account</p>
            <p className="mt-2 text-xl font-bold">Customer</p>
            <p className="mt-1 text-sm text-gray-400">Dealstack Member</p>
          </div>
        </div>

        {/* Saved Addresses */}
        <section className="mb-12">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">
                Saved Shipping Addresses
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Save your delivery details for faster checkout.
              </p>
            </div>

            <button
              type="button"
              onClick={startAddAddress}
              className="rounded-xl bg-white px-5 py-3 font-bold text-black hover:bg-gray-200"
            >
              + Add Address
            </button>
          </div>

          {showAddressForm && (
            <form
              onSubmit={handleSaveAddress}
              className="mb-6 space-y-5 rounded-2xl border border-gray-800 bg-gray-900 p-5 md:p-7"
            >
              <h3 className="text-xl font-bold">
                {editingAddressId ? "Edit Address" : "New Shipping Address"}
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  required
                  placeholder="Full Name"
                  autoComplete="name"
                  value={addressForm.full_name}
                  onChange={(e) =>
                    updateAddressField("full_name", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white"
                />

                <input
                  required
                  type="tel"
                  placeholder="Phone Number"
                  autoComplete="tel"
                  value={addressForm.phone}
                  onChange={(e) =>
                    updateAddressField("phone", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white"
                />

                <input
                  required
                  placeholder="Address Line 1 / House, Street"
                  autoComplete="address-line1"
                  value={addressForm.address_line1}
                  onChange={(e) =>
                    updateAddressField("address_line1", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white md:col-span-2"
                />

                <input
                  placeholder="Address Line 2 (Optional)"
                  autoComplete="address-line2"
                  value={addressForm.address_line2}
                  onChange={(e) =>
                    updateAddressField("address_line2", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white md:col-span-2"
                />

                <input
                  required
                  placeholder="City"
                  autoComplete="address-level2"
                  value={addressForm.city}
                  onChange={(e) => updateAddressField("city", e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white"
                />

                <input
                  required
                  placeholder="State"
                  autoComplete="address-level1"
                  value={addressForm.state}
                  onChange={(e) => updateAddressField("state", e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white"
                />

                <input
                  required
                  placeholder="PIN Code"
                  autoComplete="postal-code"
                  value={addressForm.postal_code}
                  onChange={(e) =>
                    updateAddressField("postal_code", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white"
                />

                <input
                  required
                  placeholder="Country"
                  autoComplete="country-name"
                  value={addressForm.country}
                  onChange={(e) =>
                    updateAddressField("country", e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-700 bg-black px-4 py-3 outline-none focus:border-white"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) =>
                    updateAddressField("is_default", e.target.checked)
                  }
                  className="h-4 w-4 accent-white"
                />
                Set as my default shipping address
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-gray-200 disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddressId(null);
                    setAddressForm(emptyAddress);
                  }}
                  className="rounded-xl border border-gray-700 px-6 py-3 font-semibold hover:border-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
              <h3 className="text-xl font-semibold">No saved addresses</h3>
              <p className="mt-2 text-gray-400">
                Add an address to make your next checkout faster.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-5 md:p-6"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-bold">{address.full_name}</h3>
                    {address.is_default && (
                      <span className="rounded-full border border-green-700 px-3 py-1 text-xs text-green-400">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-300">{address.phone}</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">
                    {address.address_line1}
                    {address.address_line2
                      ? `\n${address.address_line2}`
                      : ""}
                    {"\n"}
                    {address.city}, {address.state} {address.postal_code}
                    {"\n"}
                    {address.country}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-800 pt-4">
                    <button
                      type="button"
                      onClick={() => startEditAddress(address)}
                      className="text-sm font-semibold underline underline-offset-4 hover:text-gray-300"
                    >
                      Edit
                    </button>

                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        className="text-sm font-semibold underline underline-offset-4 hover:text-gray-300"
                      >
                        Set as Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-sm font-semibold text-red-400 underline underline-offset-4 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Order History */}
        <section>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold md:text-3xl">
              My Order History
            </h2>

            <Link href="/" className="text-white underline underline-offset-4">
              Continue Shopping
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-center">
              <h3 className="text-xl font-semibold">No orders yet</h3>
              <p className="mt-2 text-gray-400">
                Your orders will appear here after you place an order while
                logged in.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-bold text-black hover:bg-gray-200"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-5 transition hover:border-gray-600 md:p-6"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:items-center">
                    <div>
                      <p className="text-sm text-gray-400">Order ID</p>
                      <p className="text-lg font-bold">
                        #DS{String(order.id).padStart(4, "0")}
                      </p>
                      <p className="mt-2 text-sm text-gray-400">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Date unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Order Status</p>
                      <span className="mt-2 inline-block rounded-full border border-gray-700 px-3 py-1 text-sm">
                        {order.status || "Pending"}
                      </span>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-sm text-gray-400">Order Total</p>
                      <p className="mt-1 text-xl font-bold">
                        ₹
                        {Number(order.total_price ?? 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-800 pt-4">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="rounded-lg bg-white px-4 py-2 font-semibold text-black hover:bg-gray-200"
                    >
                      View Details
                    </Link>

                    <Link
                      href={`/account/orders/${order.id}?download=1`}
                      className="rounded-lg border border-gray-600 px-4 py-2 font-semibold text-white hover:border-white"
                    >
                      Download Order PDF
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
