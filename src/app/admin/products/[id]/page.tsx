"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Specification = { name: string; value: string };
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

const inputClass = "w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-white placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none";
const labelClass = "mb-2 block text-sm font-medium text-gray-200";
const sectionClass = "space-y-5 rounded-2xl border border-gray-800 bg-[#101827] p-6";

function toLines(value: unknown): string {
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : "").filter(Boolean).join("\n");
  return "";
}
function toSpecifications(value: unknown): Specification[] {
  if (Array.isArray(value)) return value.map((item: any) => ({ name: String(item?.name ?? ""), value: String(item?.value ?? "") }));
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>).map(([name, val]) => ({ name, value: String(val ?? "") }));
  return [{ name: "", value: "" }];
}
function toVariants(value: unknown): Variant[] {
  if (!Array.isArray(value)) return [];
  return value.map((item: any) => ({
    name: String(item?.name ?? "Color"),
    value: String(item?.value ?? ""),
    sku: String(item?.sku ?? ""),
    price: item?.price == null ? "" : String(item.price),
    stock: String(item?.stock ?? "0"),
    colorHex: String(item?.color_hex ?? item?.colorHex ?? ""),
    image: String(item?.image ?? ""),
    galleryImages: toLines(item?.gallery_images ?? item?.galleryImages),
  }));
}

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Surveillance Systems");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [stock, setStock] = useState("0");
  const [image, setImage] = useState("");
  const [galleryImages, setGalleryImages] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [specifications, setSpecifications] = useState<Specification[]>([{ name: "", value: "" }]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [warranty, setWarranty] = useState("");
  const [packageContents, setPackageContents] = useState("");
  const [datasheetUrl, setDatasheetUrl] = useState("");
  const [deliveryInformation, setDeliveryInformation] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function fetchProduct() {
      setLoading(true);
      const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
      if (cancelled) return;
      if (error || !data) {
        console.error("Failed to load product:", error);
        alert("Failed to load product. Please return to the product list and try again.");
        setLoading(false);
        return;
      }
      setTitle(String(data.title ?? ""));
      setBrand(String(data.brand ?? ""));
      setModelNumber(String(data.model_number ?? ""));
      setSku(String(data.sku ?? ""));
      setCategory(String(data.category ?? "Surveillance Systems"));
      setPrice(String(data.price ?? ""));
      setMrp(data.mrp == null ? "" : String(data.mrp));
      setGstRate(data.gst_rate == null ? "18" : String(data.gst_rate));
      setStock(String(data.stock ?? "0"));
      setImage(String(data.image ?? ""));
      setGalleryImages(toLines(data.gallery_images));
      setShortDescription(String(data.short_description ?? ""));
      setDescription(String(data.description ?? ""));
      setFeatures(toLines(data.features));
      setSpecifications(toSpecifications(data.specifications));
      setVariants(toVariants(data.variants));
      setWarranty(String(data.warranty ?? ""));
      setPackageContents(toLines(data.package_contents));
      setDatasheetUrl(String(data.datasheet_url ?? ""));
      setDeliveryInformation(String(data.delivery_information ?? ""));
      setReturnPolicy(String(data.return_policy ?? ""));
      setIsActive(data.is_active !== false);
      setLoading(false);
    }
    fetchProduct();
    return () => { cancelled = true; };
  }, [id]);

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((current) => current.map((variant, i) => i === index ? { ...variant, [field]: value } : variant));
  }
  function linesToArray(value: string) {
    return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  }

  async function updateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    const numericPrice = Number(price);
    const numericMrp = mrp.trim() ? Number(mrp) : null;
    const numericGst = gstRate.trim() ? Number(gstRate) : null;
    const numericStock = Number(stock);
    if (!title.trim() || !category.trim() || !image.trim() || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) {
      alert("Please check the required fields, price and stock quantity.");
      return;
    }
    if (numericMrp !== null && (!Number.isFinite(numericMrp) || numericMrp < 0)) {
      alert("Please enter a valid MRP."); return;
    }
    if (numericGst !== null && (!Number.isFinite(numericGst) || numericGst < 0)) {
      alert("Please enter a valid GST rate."); return;
    }

    const cleanVariants = variants.filter((v) => v.name.trim() && v.value.trim()).map((v) => ({
      name: v.name.trim(), value: v.value.trim(), sku: v.sku.trim() || null,
      price: v.price.trim() ? Number(v.price) : null,
      stock: v.stock.trim() ? Number(v.stock) : 0,
      color_hex: v.name.trim().toLowerCase() === "color" ? v.colorHex.trim() || null : null,
      image: v.image.trim() || null,
      gallery_images: linesToArray(v.galleryImages),
    }));
    if (cleanVariants.some((v) => (v.price !== null && (!Number.isFinite(v.price) || v.price < 0)) || !Number.isInteger(v.stock) || v.stock < 0)) {
      alert("Please check variant prices and stock quantities."); return;
    }
    const specificationObject = Object.fromEntries(specifications.map((s) => [s.name.trim(), s.value.trim()]).filter(([name, value]) => name && value));
    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setSaving(true);
    const { error } = await supabase.from("products").update({
      title: title.trim(), brand: brand.trim() || null, model_number: modelNumber.trim() || null,
      sku: sku.trim() || null, category: category.trim(), price: String(numericPrice), mrp: numericMrp,
      gst_rate: numericGst, stock: numericStock, image: image.trim(), slug,
      short_description: shortDescription.trim() || null, description: description.trim() || null,
      gallery_images: linesToArray(galleryImages), features: linesToArray(features),
      specifications: specificationObject, variants: cleanVariants, warranty: warranty.trim() || null,
      package_contents: linesToArray(packageContents), datasheet_url: datasheetUrl.trim() || null,
      delivery_information: deliveryInformation.trim() || null, return_policy: returnPolicy.trim() || null,
      is_active: isActive,
    }).eq("id", id);
    setSaving(false);
    if (error) {
      console.error("Failed to update product:", error);
      alert(`Failed to update product: ${error.message}`);
      return;
    }
    alert("Product updated successfully.");
    router.push("/admin/products");
    router.refresh();
  }

  if (loading) return <main className="min-h-screen bg-black p-8 text-white"><div className="mx-auto max-w-4xl">Loading product...</div></main>;

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-4xl font-bold">Edit Product</h1><p className="mt-2 text-sm text-gray-400">Update product details, images and variants.</p></div>
          <Link href="/admin/products" className="rounded-xl border border-gray-700 px-4 py-3 font-semibold hover:border-yellow-400">← Back to Products</Link>
        </div>
        <form onSubmit={updateProduct} className="space-y-6">
          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-yellow-400">1. Basic Information</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2"><label className={labelClass}>Product Title *</label><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div><label className={labelClass}>Brand</label><input className={inputClass} value={brand} onChange={(e) => setBrand(e.target.value)} /></div>
              <div><label className={labelClass}>Model Number</label><input className={inputClass} value={modelNumber} onChange={(e) => setModelNumber(e.target.value)} /></div>
              <div><label className={labelClass}>SKU</label><input className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} /></div>
              <div><label className={labelClass}>Category *</label><select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)} required><option>Surveillance Systems</option><option>Networking Switches &amp; Routers</option><option>Surveillance Hard Disk</option><option>Gadget &amp; Accessories</option><option value={category}>{category}</option></select></div>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-yellow-400">2. Pricing &amp; Inventory</h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div><label className={labelClass}>Selling Price (₹) *</label><input className={inputClass} type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required /></div>
              <div><label className={labelClass}>MRP (₹)</label><input className={inputClass} type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} /></div>
              <div><label className={labelClass}>GST Rate (%)</label><input className={inputClass} type="number" min="0" step="0.01" value={gstRate} onChange={(e) => setGstRate(e.target.value)} /></div>
              <div><label className={labelClass}>Stock Quantity *</label><input className={inputClass} type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required /></div>
              <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-yellow-400" /> Product is active and visible in the store</label>
            </div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-yellow-400">3. Product Images</h2>
            <div><label className={labelClass}>Main Image URL *</label><input className={inputClass} type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="/images/product.jpg or https://..." required />{image.trim() && <div className="mt-3"><p className="mb-2 text-xs text-gray-400">Image preview</p>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={image} alt="Product preview" className="h-36 w-36 rounded-xl border border-gray-700 bg-white object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>}</div>
            <div><label className={labelClass}>Additional Image URLs (one per line)</label><textarea className={inputClass} rows={4} value={galleryImages} onChange={(e) => setGalleryImages(e.target.value)} placeholder={'https://example.com/image-2.jpg\nhttps://example.com/image-3.jpg'} /></div>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-yellow-400">4. Descriptions &amp; Features</h2>
            <div><label className={labelClass}>Short Description</label><textarea className={inputClass} rows={2} value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} /></div>
            <div><label className={labelClass}>Full Description</label><textarea className={inputClass} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div><label className={labelClass}>Features (one per line)</label><textarea className={inputClass} rows={4} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Feature 1\nFeature 2" /></div>
          </section>

          <section className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-yellow-400">5. Specifications</h2><button type="button" onClick={() => setSpecifications((current) => [...current, { name: "", value: "" }])} className="rounded-lg border border-yellow-400 px-3 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-400/10">+ Add Specification</button></div>
            {specifications.map((spec, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input className={inputClass} placeholder="Specification name" value={spec.name} onChange={(e) => setSpecifications((current) => current.map((s, i) => i === index ? { ...s, name: e.target.value } : s))} /><input className={inputClass} placeholder="Value" value={spec.value} onChange={(e) => setSpecifications((current) => current.map((s, i) => i === index ? { ...s, value: e.target.value } : s))} /><button type="button" onClick={() => setSpecifications((current) => current.filter((_, i) => i !== index))} className="rounded-lg border border-red-800 px-3 py-2 text-sm text-red-300 hover:bg-red-950">Remove</button></div>)}
          </section>

          <section className={sectionClass}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-yellow-400">6. Variants (Color / Size / Type)</h2><button type="button" onClick={() => setVariants((current) => [...current, { name: "Color", value: "", sku: "", price: "", stock: "0", colorHex: "", image: "", galleryImages: "" }])} className="rounded-lg border border-yellow-400 px-3 py-2 text-sm font-semibold text-yellow-400 hover:bg-yellow-400/10">+ Add Variant</button></div>
            {variants.length === 0 && <p className="text-sm text-gray-400">No variants added. Add a color variant to give it its own swatch and image gallery.</p>}
            {variants.map((variant, index) => <div key={index} className="space-y-4 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between"><h3 className="font-semibold">Variant {index + 1}</h3><button type="button" onClick={() => setVariants((current) => current.filter((_, i) => i !== index))} className="text-sm font-semibold text-red-400 hover:text-red-300">Remove Variant</button></div>
              <div className="grid gap-4 md:grid-cols-2"><div><label className={labelClass}>Variant Type</label><select className={inputClass} value={variant.name} onChange={(e) => updateVariant(index, "name", e.target.value)}><option>Color</option><option>Size</option><option>Type</option><option>Storage</option><option>Other</option></select></div><div><label className={labelClass}>Variant Value *</label><input className={inputClass} value={variant.value} onChange={(e) => updateVariant(index, "value", e.target.value)} placeholder="e.g. White, Black, 128GB" /></div><div><label className={labelClass}>Variant SKU</label><input className={inputClass} value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} /></div><div><label className={labelClass}>Override Price (₹)</label><input className={inputClass} type="number" min="0" step="0.01" value={variant.price} onChange={(e) => updateVariant(index, "price", e.target.value)} placeholder="Leave blank to use product price" /></div><div><label className={labelClass}>Variant Stock</label><input className={inputClass} type="number" min="0" step="1" value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)} /></div>
                {variant.name.toLowerCase() === "color" && <div><label className={labelClass}>Swatch Color</label><div className="flex gap-3"><input aria-label="Choose swatch color" type="color" value={/^#[0-9a-fA-F]{6}$/.test(variant.colorHex) ? variant.colorHex : "#ffffff"} onChange={(e) => updateVariant(index, "colorHex", e.target.value)} className="h-14 w-16 cursor-pointer rounded-lg border border-gray-700 bg-gray-900 p-1" /><input className={inputClass} value={variant.colorHex} onChange={(e) => updateVariant(index, "colorHex", e.target.value)} placeholder="#ffffff" /></div></div>}
                <div className="md:col-span-2"><label className={labelClass}>Variant Main Image URL</label><input className={inputClass} value={variant.image} onChange={(e) => updateVariant(index, "image", e.target.value)} placeholder="Image URL for this color/variant" />{variant.image.trim() && <div className="mt-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={variant.image} alt={`${variant.value || "Variant"} preview`} className="h-28 w-28 rounded-lg border border-gray-700 bg-white object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>}</div>
                <div className="md:col-span-2"><label className={labelClass}>Variant Gallery URLs (one URL per line)</label><textarea className={inputClass} rows={3} value={variant.galleryImages} onChange={(e) => updateVariant(index, "galleryImages", e.target.value)} placeholder={'https://example.com/color-view-2.jpg\nhttps://example.com/color-view-3.jpg'} /></div>
              </div>
            </div>)}
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-bold text-yellow-400">7. Additional Information</h2>
            <div><label className={labelClass}>Warranty</label><input className={inputClass} value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 2 Years" /></div>
            <div><label className={labelClass}>Package Contents (one per line)</label><textarea className={inputClass} rows={3} value={packageContents} onChange={(e) => setPackageContents(e.target.value)} /></div>
            <div><label className={labelClass}>Datasheet URL</label><input className={inputClass} value={datasheetUrl} onChange={(e) => setDatasheetUrl(e.target.value)} placeholder="https://..." /></div>
            <div><label className={labelClass}>Delivery Information</label><textarea className={inputClass} rows={3} value={deliveryInformation} onChange={(e) => setDeliveryInformation(e.target.value)} /></div>
            <div><label className={labelClass}>Return Policy</label><textarea className={inputClass} rows={3} value={returnPolicy} onChange={(e) => setReturnPolicy(e.target.value)} /></div>
          </section>

          <div className="flex flex-wrap gap-3 pb-8"><button type="submit" disabled={saving} className="rounded-xl bg-yellow-400 px-8 py-4 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving Changes..." : "Update Product"}</button><Link href="/admin/products" className="rounded-xl border border-gray-700 px-8 py-4 font-semibold hover:border-yellow-400">Cancel</Link></div>
        </form>
      </div>
    </main>
  );
}
