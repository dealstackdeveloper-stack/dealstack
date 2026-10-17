

"use client";



import { useState } from "react";

import { useRouter } from "next/navigation";

import Link from "next/link";

import { supabase } from "@/lib/supabase";

import ProtectedRoute from "@/components/ProtectedRoute";

import toast from "react-hot-toast";



type Specification = {

  name: string;

  value: string;

};



type Variant = {
  name: string;
  value: string;
  sku: string;
  price: string;
  stock: string;
  colorHex: string;
  image: string;
  galleryImages: string;
};



export default function AddProductPage() {

  const router = useRouter();



  const [title, setTitle] = useState("");

  const [brand, setBrand] = useState("");

  const [modelNumber, setModelNumber] = useState("");

  const [sku, setSku] = useState("");

  const [category, setCategory] = useState("");

  const [price, setPrice] = useState("");

  const [mrp, setMrp] = useState("");

  const [gstRate, setGstRate] = useState("18");

  const [stock, setStock] = useState("0");



  const [image, setImage] = useState("");

  const [galleryImages, setGalleryImages] = useState("");

  const [shortDescription, setShortDescription] = useState("");

  const [description, setDescription] = useState("");

  const [features, setFeatures] = useState("");



  const [specifications, setSpecifications] = useState<Specification[]>([

    { name: "", value: "" },

  ]);



  const [variants, setVariants] = useState<Variant[]>([]);



  const [warranty, setWarranty] = useState("");

  const [packageContents, setPackageContents] = useState("");

  const [datasheetUrl, setDatasheetUrl] = useState("");

  const [deliveryInformation, setDeliveryInformation] = useState("");

  const [returnPolicy, setReturnPolicy] = useState("");

  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);



  // Press Enter to move to the next form field.

  function handleEnterToNextField(

    e: React.KeyboardEvent<HTMLFormElement>

  ) {

    if (e.key !== "Enter" || e.shiftKey) return;



    const target = e.target;



    if (!(target instanceof HTMLElement)) return;



    // Preserve multiline text entry.

    if (target instanceof HTMLTextAreaElement) return;



    // Preserve button behavior.

    if (target instanceof HTMLButtonElement) return;



    // Let checkboxes use their normal keyboard behavior.

    if (

      target instanceof HTMLInputElement &&

      target.type === "checkbox"

    ) {

      return;

    }



    const form = e.currentTarget;



    const fields = Array.from(

      form.querySelectorAll<HTMLElement>(

        [

          'input:not([type="hidden"])',

          'input:not([type="checkbox"])',

          'input:not([type="submit"])',

          "select",

          "textarea",

        ].join(",")

      )

    ).filter((field) => {

      if (field.hasAttribute("disabled")) return false;

      if (field.tabIndex === -1) return false;

      if (field instanceof HTMLInputElement) {

        return !["hidden", "checkbox", "submit", "button"].includes(

          field.type

        );

      }

      return true;

    });



    const index = fields.indexOf(target);



    if (index !== -1 && index < fields.length - 1) {

      e.preventDefault();

      fields[index + 1].focus();

    }

  }



  function createSlug(value: string) {

    return value

      .trim()

      .toLowerCase()

      .normalize("NFKD")

      .replace(/[\u0300-\u036f]/g, "")

      .replace(/[^a-z0-9]+/g, "-")

      .replace(/^-+|-+$/g, "");

  }



  function updateSpecification(

    index: number,

    field: keyof Specification,

    value: string

  ) {

    setSpecifications((current) =>

      current.map((item, i) =>

        i === index ? { ...item, [field]: value } : item

      )

    );

  }



  function updateVariant(

    index: number,

    field: keyof Variant,

    value: string

  ) {

    setVariants((current) =>

      current.map((item, i) =>

        i === index ? { ...item, [field]: value } : item

      )

    );

  }



  function linesToArray(value: string) {

    return value

      .split("\n")

      .map((item) => item.trim())

      .filter(Boolean);

  }



  async function handleSubmit(

    e: React.FormEvent<HTMLFormElement>

  ) {

    e.preventDefault();



    if (saving) return;



    const cleanTitle = title.trim();

    const cleanCategory = category.trim();

    const cleanImage = image.trim();

    const numericPrice = Number(price);

    const numericMrp = mrp.trim() === "" ? null : Number(mrp);

    const numericGst = gstRate.trim() === "" ? null : Number(gstRate);

    const numericStock = Number(stock);



    if (!cleanTitle || !cleanCategory || !cleanImage) {

      toast.error("Please enter the product name, category and main image URL.");

      return;

    }



    if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {

      toast.error("Enter a valid selling price greater than zero.");

      return;

    }



    if (

      numericMrp !== null &&

      (!Number.isFinite(numericMrp) || numericMrp < numericPrice)

    ) {

      toast.error("MRP must be greater than or equal to the selling price.");

      return;

    }



    if (

      numericGst !== null &&

      (!Number.isFinite(numericGst) || numericGst < 0 || numericGst > 100)

    ) {

      toast.error("GST rate must be between 0 and 100.");

      return;

    }



    if (

      !Number.isInteger(numericStock) ||

      !Number.isFinite(numericStock) ||

      numericStock < 0

    ) {

      toast.error("Stock must be a non-negative whole number.");

      return;

    }



    const slug = createSlug(cleanTitle);



    if (!slug) {

      toast.error("Please enter a valid product name.");

      return;

    }



    const specificationObject = Object.fromEntries(

      specifications

        .map((item) => ({

          name: item.name.trim(),

          value: item.value.trim(),

        }))

        .filter((item) => item.name && item.value)

        .map((item) => [item.name, item.value])

    );



    const cleanVariants = variants

      .filter((item) => item.name.trim() && item.value.trim())

      .map((item) => ({

        name: item.name.trim(),

        value: item.value.trim(),

        sku: item.sku.trim() || null,

        price: item.price.trim() ? Number(item.price) : null,

        stock: item.stock.trim() ? Number(item.stock) : 0,
        color_hex: item.name.trim().toLowerCase() === "color" ? item.colorHex.trim() || null : null,
        image: item.image.trim() || null,
        gallery_images: linesToArray(item.galleryImages),

      }));



    const invalidVariant = cleanVariants.some(

      (item) =>

        (item.price !== null &&

          (!Number.isFinite(item.price) || item.price <= 0)) ||

        !Number.isInteger(item.stock) ||

        item.stock < 0

    );



    if (invalidVariant) {

      toast.error("Check variant prices and stock quantities.");

      return;

    }



    setSaving(true);



    try {

      const { error } = await supabase.from("products").insert([

        {

          title: cleanTitle,

          brand: brand.trim() || null,

          model_number: modelNumber.trim() || null,

          sku: sku.trim() || null,

          category: cleanCategory,

          price: String(numericPrice),

          mrp: numericMrp,

          gst_rate: numericGst,

          stock: numericStock,

          image: cleanImage,

          slug,

          short_description: shortDescription.trim() || null,

          description: description.trim() || null,

          gallery_images: linesToArray(galleryImages),

          features: linesToArray(features),

          specifications: specificationObject,

          variants: cleanVariants,

          warranty: warranty.trim() || null,

          package_contents: linesToArray(packageContents),

          datasheet_url: datasheetUrl.trim() || null,

          delivery_information: deliveryInformation.trim() || null,

          return_policy: returnPolicy.trim() || null,

          is_active: isActive,

        },

      ]);



      if (error) {

        console.error("Product insert error:", error);



        if (error.code === "23505") {

          toast.error(

            "A product with this slug may already exist. Try a different product name."

          );

        } else {

          toast.error(error.message || "Could not save the product.");

        }



        return;

      }



      toast.success("Product added successfully!");

      router.push("/admin/products");

      router.refresh();

    } catch (error) {

      console.error("Unexpected product error:", error);

      toast.error("An unexpected error occurred while saving.");

    } finally {

      setSaving(false);

    }

  }



  const inputClass =

    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";



  const labelClass = "mb-1 block text-sm font-medium text-gray-300";



  return (

    <ProtectedRoute>

      <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6">

        <div className="mx-auto max-w-5xl">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>

              <h1 className="text-2xl font-bold">Add Product</h1>

              <p className="mt-1 text-sm text-gray-400">

                Enter product information, pricing, specifications and variants.

              </p>

            </div>



            <Link

              href="/admin/products"

              className="rounded-lg border border-slate-700 bg-[#101827] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"

            >

              Back to Products

            </Link>

          </div>



          <form

            onSubmit={handleSubmit}

            onKeyDown={handleEnterToNextField}

            className="space-y-6"

          >

            {/* Basic information */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">

                1. Basic Information

              </h2>



              <div className="grid gap-4 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <label className={labelClass}>Product Name \*</label>

                  <input

                    className={inputClass}

                    value={title}

                    onChange={(e) => setTitle(e.target.value)}

                    placeholder="e.g. 4MP IP Bullet Camera"

                    required

                  />

                </div>



                <div>

                  <label className={labelClass}>Brand</label>

                  <input

                    className={inputClass}

                    value={brand}

                    onChange={(e) => setBrand(e.target.value)}

                    placeholder="e.g. Dahua, D-Link, Netgear"

                  />

                </div>



                <div>

                  <label className={labelClass}>Model Number</label>

                  <input

                    className={inputClass}

                    value={modelNumber}

                    onChange={(e) => setModelNumber(e.target.value)}

                    placeholder="Manufacturer model"

                  />

                </div>



                <div>

                  <label className={labelClass}>SKU / Item Code</label>

                  <input

                    className={inputClass}

                    value={sku}

                    onChange={(e) => setSku(e.target.value)}

                    placeholder="Internal product code"

                  />

                </div>



                <div>

                  <label className={labelClass}>Category \*</label>

                  <select

                    className={inputClass}

                    value={category}

                    onChange={(e) => setCategory(e.target.value)}

                    required

                  >

                    <option value="">Select category</option>

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

              </div>

            </section>



            {/* Pricing */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">

                2. Pricing & Inventory

              </h2>



              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div>

                  <label className={labelClass}>Selling Price (₹) \*</label>

                  <input

                    className={inputClass}

                    type="number"

                    min="0.01"

                    step="0.01"

                    value={price}

                    onChange={(e) => setPrice(e.target.value)}

                    required

                  />

                </div>



                <div>

                  <label className={labelClass}>MRP (₹)</label>

                  <input

                    className={inputClass}

                    type="number"

                    min="0"

                    step="0.01"

                    value={mrp}

                    onChange={(e) => setMrp(e.target.value)}

                    placeholder="Maximum retail price"

                  />

                </div>



                <div>

                  <label className={labelClass}>GST Rate (%)</label>

                  <input

                    className={inputClass}

                    type="number"

                    min="0"

                    max="100"

                    step="0.01"

                    value={gstRate}

                    onChange={(e) => setGstRate(e.target.value)}

                  />

                </div>



                <div>

                  <label className={labelClass}>Available Stock \*</label>

                  <input

                    className={inputClass}

                    type="number"

                    min="0"

                    step="1"

                    value={stock}

                    onChange={(e) => setStock(e.target.value)}

                    required

                  />

                </div>

              </div>

            </section>



            {/* Product content */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">

                3. Product Description

              </h2>



              <div className="space-y-4">

                <div>

                  <label className={labelClass}>Short Description</label>

                  <textarea

                    className={inputClass}

                    rows={2}

                    value={shortDescription}

                    onChange={(e) => setShortDescription(e.target.value)}

                    placeholder="A short summary for product cards"

                  />

                </div>



                <div>

                  <label className={labelClass}>Full Description</label>

                  <textarea

                    className={inputClass}

                    rows={5}

                    value={description}

                    onChange={(e) => setDescription(e.target.value)}

                    placeholder="Detailed product description, applications and benefits"

                  />

                </div>



                <div>

                  <label className={labelClass}>

                    Features (one per line)

                  </label>

                  <textarea

                    className={inputClass}

                    rows={4}

                    value={features}

                    onChange={(e) => setFeatures(e.target.value)}

                    placeholder={"4MP resolution\nNight vision\nWeather-resistant design"}

                  />

                </div>

              </div>

            </section>



            {/* Images */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">

                4. Product Images

              </h2>



              <div className="space-y-4">

                <div>

                  <label className={labelClass}>Main Image URL \*</label>

                  <input

                    className={inputClass}

                    type="url"

                    value={image}

                    onChange={(e) => setImage(e.target.value)}

                    placeholder="https\://example.com/product.jpg"

                    required

                  />

                  {image.trim() && (

                    <div className="mt-3">

                      {/* eslint-disable-next-line @next/next/no-img-element */}

                      <img

                        src={image}

                        alt="Product preview"

                        className="h-32 w-32 rounded-lg border border-slate-700 bg-white object-contain"

                      />

                    </div>

                  )}

                </div>



                <div>

                  <label className={labelClass}>

                    Additional Image URLs (one URL per line)

                  </label>

                  <textarea

                    className={inputClass}

                    rows={3}

                    value={galleryImages}

                    onChange={(e) => setGalleryImages(e.target.value)}

                    placeholder={"https\://example.com/image-2.jpg\nhttps\://example.com/image-3.jpg"}

                  />

                </div>

              </div>

            </section>



            {/* Specifications */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

                <h2 className="text-lg font-semibold">

                  5. Technical Specifications

                </h2>



                <button

                  type="button"

                  onClick={() =>

                    setSpecifications((current) => [

                      ...current,

                      { name: "", value: "" },

                    ])

                  }

                  className="rounded-lg border border-[#FFCC00] px-3 py-2 text-sm font-medium text-[#FFCC00] hover:bg-[#FFCC00]/10"

                >

                  + Add Specification

                </button>

              </div>



              <div className="space-y-3">

                {specifications.map((specification, index) => (

                  <div

                    key={index}

                    className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"

                  >

                    <input

                      className={inputClass}

                      value={specification.name}

                      onChange={(e) =>

                        updateSpecification(index, "name", e.target.value)

                      }

                      placeholder="Specification name (e.g. Resolution)"

                      aria-label={`Specification ${index + 1} name`}

                    />



                    <input

                      className={inputClass}

                      value={specification.value}

                      onChange={(e) =>

                        updateSpecification(index, "value", e.target.value)

                      }

                      placeholder="Value (e.g. 4MP)"

                      aria-label={`Specification ${index + 1} value`}

                    />



                    <button

                      type="button"

                      onClick={() =>

                        setSpecifications((current) =>

                          current.filter((_, i) => i !== index)

                        )

                      }

                      className="rounded-lg border border-red-800 px-3 py-2 text-sm text-red-400 hover:bg-red-950"

                    >

                      Remove

                    </button>

                  </div>

                ))}

              </div>

            </section>



            {/* Variants */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

                <h2 className="text-lg font-semibold">

                  6. Variants (Color / Size / Type)

                </h2>



                <button

                  type="button"

                  onClick={() =>

                    setVariants((current) => [

                      ...current,

                      {

                        name: "Color",

                        value: "",

                        sku: "",

                        price: "",

                        stock: "0",
                        colorHex: "",
                        image: "",
                        galleryImages: "",

                      },

                    ])

                  }

                  className="rounded-lg border border-[#FFCC00] px-3 py-2 text-sm font-medium text-[#FFCC00] hover:bg-[#FFCC00]/10"

                >

                  + Add Variant

                </button>

              </div>



              {variants.length === 0 && (

                <p className="text-sm text-gray-400">

                  No variants added. Use this section for different colors,

                  sizes or product configurations.

                </p>

              )}



              <div className="space-y-4">

                {variants.map((variant, index) => (

                  <div

                    key={index}

                    className="rounded-lg border border-slate-700 p-4"

                  >

                    <div className="mb-3 flex items-center justify-between">

                      <h3 className="font-medium">

                        Variant {index + 1}

                      </h3>



                      <button

                        type="button"

                        onClick={() =>

                          setVariants((current) =>

                            current.filter((_, i) => i !== index)

                          )

                        }

                        className="text-sm text-red-400 hover:underline"

                      >

                        Remove

                      </button>

                    </div>



                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

                      <div>

                        <label className={labelClass}>Variant Type</label>

                        <select

                          className={inputClass}

                          value={variant.name}

                          onChange={(e) =>

                            updateVariant(index, "name", e.target.value)

                          }

                        >

                          <option value="Color">Color</option>

                          <option value="Size">Size</option>

                          <option value="Storage">Storage</option>

                          <option value="Length">Length</option>

                          <option value="Model">Model</option>

                          <option value="Other">Other</option>

                        </select>

                      </div>



                      <div>

                        <label className={labelClass}>Variant Value</label>

                        <input

                          className={inputClass}

                          value={variant.value}

                          onChange={(e) =>

                            updateVariant(index, "value", e.target.value)

                          }

                          placeholder="e.g. Black, 1TB, Large"

                        />

                      </div>



                      {variant.name.toLowerCase() === "color" && (
                        <div>
                          <label className={labelClass}>Color Swatch (optional)</label>
                          <div className="flex items-center gap-2">
                            <input
                              className="h-11 w-14 cursor-pointer rounded border border-slate-700 bg-transparent p-1"
                              type="color"
                              value={/^#[0-9a-fA-F]{6}$/.test(variant.colorHex) ? variant.colorHex : "#000000"}
                              onChange={(e) => updateVariant(index, "colorHex", e.target.value)}
                              aria-label="Choose color swatch"
                            />
                            <input
                              className={inputClass}
                              value={variant.colorHex}
                              onChange={(e) => updateVariant(index, "colorHex", e.target.value)}
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className={labelClass}>Variant Main Image URL</label>
                        <input
                          className={inputClass}
                          type="url"
                          value={variant.image}
                          onChange={(e) => updateVariant(index, "image", e.target.value)}
                          placeholder="https://example.com/black-product.jpg"
                        />
                      </div>

                      <div className="sm:col-span-2 lg:col-span-3">
                        <label className={labelClass}>Variant Gallery Image URLs (one per line)</label>
                        <textarea
                          className={inputClass}
                          rows={3}
                          value={variant.galleryImages}
                          onChange={(e) => updateVariant(index, "galleryImages", e.target.value)}
                          placeholder={"https://example.com/black-side.jpg\nhttps://example.com/black-back.jpg"}
                        />
                        <p className="mt-1 text-xs text-gray-400">These images appear when a customer selects this color. The main image URL is included automatically.</p>
                      </div>

                      <div>

                        <label className={labelClass}>Variant SKU</label>

                        <input

                          className={inputClass}

                          value={variant.sku}

                          onChange={(e) =>

                            updateVariant(index, "sku", e.target.value)

                          }

                          placeholder="Optional SKU"

                        />

                      </div>



                      <div>

                        <label className={labelClass}>

                          Variant Price (₹)

                        </label>

                        <input

                          className={inputClass}

                          type="number"

                          min="0.01"

                          step="0.01"

                          value={variant.price}

                          onChange={(e) =>

                            updateVariant(index, "price", e.target.value)

                          }

                          placeholder="Leave blank for base price"

                        />

                      </div>



                      <div>

                        <label className={labelClass}>Variant Stock</label>

                        <input

                          className={inputClass}

                          type="number"

                          min="0"

                          step="1"

                          value={variant.stock}

                          onChange={(e) =>

                            updateVariant(index, "stock", e.target.value)

                          }

                        />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>



            {/* Additional details */}

            <section className="rounded-xl border border-slate-800 bg-[#101827] p-5 shadow-sm">

              <h2 className="mb-4 text-lg font-semibold">

                7. Warranty & Other Details

              </h2>



              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className={labelClass}>Warranty</label>

                  <input

                    className={inputClass}

                    value={warranty}

                    onChange={(e) => setWarranty(e.target.value)}

                    placeholder="e.g. 3 years manufacturer warranty"

                  />

                </div>



                <div>

                  <label className={labelClass}>Datasheet URL</label>

                  <input

                    className={inputClass}

                    type="url"

                    value={datasheetUrl}

                    onChange={(e) => setDatasheetUrl(e.target.value)}

                    placeholder="https\://example.com/datasheet.pdf"

                  />

                </div>



                <div className="sm:col-span-2">

                  <label className={labelClass}>

                    Package Contents (one item per line)

                  </label>

                  <textarea

                    className={inputClass}

                    rows={3}

                    value={packageContents}

                    onChange={(e) => setPackageContents(e.target.value)}

                    placeholder={"1 x Camera\n1 x Mounting kit\n1 x User manual"}

                  />

                </div>



                <div>

                  <label className={labelClass}>Delivery Information</label>

                  <textarea

                    className={inputClass}

                    rows={3}

                    value={deliveryInformation}

                    onChange={(e) => setDeliveryInformation(e.target.value)}

                    placeholder="Delivery timelines and conditions"

                  />

                </div>



                <div>

                  <label className={labelClass}>Return Policy</label>

                  <textarea

                    className={inputClass}

                    rows={3}

                    value={returnPolicy}

                    onChange={(e) => setReturnPolicy(e.target.value)}

                    placeholder="Return and replacement conditions"

                  />

                </div>

              </div>



              <label className="mt-5 flex items-center gap-3 text-sm font-medium">

                <input

                  type="checkbox"

                  checked={isActive}

                  onChange={(e) => setIsActive(e.target.checked)}

                  className="h-4 w-4 rounded"

                />

                Publish product and make it active

              </label>

            </section>



            {/* Actions */}

            <div className="flex flex-wrap justify-end gap-3 pb-8">

              <Link

                href="/admin/products"

                className="rounded-lg border border-slate-700 bg-[#101827] px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"

              >

                Cancel

              </Link>



              <button

                type="submit"

                disabled={saving}

                className="rounded-lg bg-[#FFCC00] px-6 py-3 text-sm font-semibold text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-60"

              >

                {saving ? "Saving Product..." : "Save Product"}

              </button>

            </div>

          </form>

        </div>

      </main>

    </ProtectedRoute>

  );

}
