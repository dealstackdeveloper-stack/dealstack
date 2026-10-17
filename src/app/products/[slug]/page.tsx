
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";

type Product = {
  id: number;
  title: string;
  slug: string;
  price: string | number;
  image: string;
  category?: string | null;
  stock?: number | null;
  brand?: string | null;
  model_number?: string | null;
  sku?: string | null;
  short_description?: string | null;
  description?: string | null;
  mrp?: number | string | null;
  gst_rate?: number | string | null;
  gallery_images?: unknown;
  specifications?: unknown;
  features?: unknown;
  variants?: unknown;
  warranty?: string | null;
  package_contents?: unknown;
  datasheet_url?: string | null;
  delivery_information?: string | null;
  return_policy?: string | null;
  is_active?: boolean | null;
};

type ProductReview = {
  id: number;
  product_id: number;
  user_id: string;
  rating: number;
  review_title: string;
  review_text: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  return Number(value.replace(/[₹,\s]/g, "")) || 0;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getImageUrl(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;

    for (const key of ["url", "image", "src"]) {
      if (typeof item[key] === "string" && item[key]) {
        return item[key] as string;
      }
    }
  }

  return null;
}

function getArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(
      item.name ?? item.title ?? item.label ?? item.value ?? ""
    );
  }

  return "";
}

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageFrameRef = useRef<HTMLDivElement>(null);

  function handleImageMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const frame = imageFrameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    setZoomPosition({ x, y });
  }
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "specifications" | "delivery"
  >("description");

  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<ProductReview | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setNotFound(false);
      setProduct(null);
      setRelatedProducts([]);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Product fetch error:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }

      if (!data || data.is_active === false) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const currentProduct = data as Product;
      setProduct(currentProduct);

      const productImages = [
        getImageUrl(currentProduct.image),
        ...getArray(currentProduct.gallery_images).map(getImageUrl),
      ].filter((image): image is string => Boolean(image));

      setSelectedImage(productImages[0] || "");
      setQuantity(1);
      setLoading(false);

      if (currentProduct.category) {
        const { data: related, error: relatedError } = await supabase
          .from("products")
          .select(
            "id, title, slug, price, image, category, stock, mrp, is_active"
          )
          .eq("category", currentProduct.category)
          .neq("slug", currentProduct.slug)
          .limit(4);

        if (cancelled) return;

        if (relatedError) {
          console.error("Related products fetch error:", relatedError);
        } else if (related) {
          setRelatedProducts(
            (related as Product[]).filter(
              (item) => item.is_active !== false
            )
          );
        }
      }
    }

    if (slug) {
      fetchProduct();
    } else {
      setLoading(false);
      setNotFound(true);
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    const productId = product?.id;
    if (!productId) {
      setReviewsLoading(true);
      return;
    }

    let cancelled = false;

    async function loadReviews() {
      setReviewsLoading(true);

      try {
        const [userResult, reviewsResult] = await Promise.all([
          supabase.auth.getUser(),
          supabase
            .from("product_reviews")
            .select("*")
            .eq("product_id", productId)
            .eq("status", "approved")
            .order("created_at", { ascending: false }),
        ]);

        if (cancelled) return;

        const user = userResult.data.user;
        if (user) {
          setCurrentUserId(user.id);
          const { data: ownReview, error: ownReviewError } = await supabase
            .from("product_reviews")
            .select("*")
            .eq("product_id", productId)
            .eq("user_id", user.id)
            .maybeSingle();

          if (cancelled) return;
          if (ownReviewError) {
            console.error("Own review loading error:", ownReviewError);
            setMyReview(null);
          } else {
            setMyReview((ownReview as ProductReview | null) ?? null);
          }
        } else {
          setCurrentUserId(null);
          setMyReview(null);
        }

        if (reviewsResult.error) {
          console.error("Reviews loading error:", reviewsResult.error);
          setReviews([]);
        } else {
          setReviews((reviewsResult.data ?? []) as ProductReview[]);
        }
      } catch (error) {
        console.error("Review loading error:", error);
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }

    void loadReviews();

    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  const colorVariants = useMemo(() => {
    if (!product) return [];
    return getArray(product.variants).filter((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const variant = entry as Record<string, unknown>;
      return String(variant.name ?? "").toLowerCase() === "color" && Boolean(String(variant.value ?? "").trim());
    }) as Array<Record<string, unknown>>;
  }, [product]);

  const activeColorVariant = useMemo(() => {
    if (!colorVariants.length) return null;
    return colorVariants.find((variant) => String(variant.value) === selectedColor) ?? colorVariants[0];
  }, [colorVariants, selectedColor]);

  const images = useMemo(() => {
    if (!product) return [];
    const variantImage = getImageUrl(activeColorVariant?.image);
    const variantGallery = getArray(activeColorVariant?.gallery_images).map(getImageUrl);
    const hasVariantGallery = Boolean(variantImage || variantGallery.some(Boolean));
    const imageList = hasVariantGallery
      ? [variantImage, ...variantGallery]
      : [getImageUrl(product.image), ...getArray(product.gallery_images).map(getImageUrl)];
    return Array.from(new Set(imageList.filter((image): image is string => Boolean(image))));
  }, [product, activeColorVariant]);

  useEffect(() => {
    if (!colorVariants.length) {
      setSelectedColor("");
      return;
    }
    if (!colorVariants.some((variant) => String(variant.value) === selectedColor)) {
      setSelectedColor(String(colorVariants[0].value));
    }
  }, [colorVariants, selectedColor]);

  useEffect(() => {
    if (images.length && !images.includes(selectedImage)) setSelectedImage(images[0]);
    else if (!images.length) setSelectedImage("");
  }, [images, selectedImage]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-400" />
          <p className="text-gray-300">Loading product...</p>
        </div>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="max-w-md text-center">
          <p className="text-6xl font-extrabold text-yellow-400">404</p>
          <h1 className="mt-4 text-2xl font-bold">Product not found</h1>
          <p className="mt-3 text-gray-400">
            This product may have been removed or is currently unavailable.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
          >
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  // The early return above guarantees that product is not null here.
  const currentProduct = product;
  const price = toNumber(currentProduct.price);
  const mrp = toNumber(currentProduct.mrp);
  const stock = Number(currentProduct.stock ?? 0);

  const hasStockInformation =
    currentProduct.stock !== null &&
    currentProduct.stock !== undefined;

  const inStock = !hasStockInformation || stock > 0;

  const discount =
    mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  const features = getArray(currentProduct.features);
  const packageContents = getArray(currentProduct.package_contents);
  const variants = getArray(currentProduct.variants);

  const specifications =
    currentProduct.specifications &&
    typeof currentProduct.specifications === "object" &&
    !Array.isArray(currentProduct.specifications)
      ? (currentProduct.specifications as Record<string, unknown>)
      : null;

  function handleAddToCart(buyNow = false) {
    const item = currentProduct;

    if (!inStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (hasStockInformation && quantity > stock) {
      toast.error("Requested quantity exceeds available stock.");
      return;
    }

    try {
      for (let i = 0; i < quantity; i++) {
        addToCart({
          ...item,
          price: String(item.price),
          quantity: 1,
        });
      }

      toast.success(
        `${item.title} ${
          quantity > 1 ? `(${quantity}) ` : ""
        }added to cart`
      );

      if (buyNow) {
        router.push("/cart");
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Unable to add this product to cart.");
    }
  }

  async function handleSubmitReview(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!currentProduct) return;

    if (!currentUserId) {
      toast.error("Please log in to write a review.");
      router.push("/customer-login");
      return;
    }

    if (myReview) {
      toast.error("You have already submitted a review for this product.");
      return;
    }

    const title = reviewTitle.trim();
    const body = reviewText.trim();

    if (title.length < 3 || title.length > 120) {
      toast.error("Review title must be 3–120 characters.");
      return;
    }

    if (body.length < 10 || body.length > 3000) {
      toast.error("Review must be 10–3000 characters.");
      return;
    }

    setSubmittingReview(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        toast.error("Your session has expired. Please log in again.");
        router.push("/customer-login");
        return;
      }

      const { data, error } = await supabase
        .from("product_reviews")
        .insert({
          product_id: currentProduct.id,
          user_id: authData.user.id,
          rating: reviewRating,
          review_title: title,
          review_text: body,
          status: "pending",
        })
        .select("*")
        .single();

      if (error) {
        if (error.code === "23505") {
          toast.error("You have already reviewed this product.");
        } else {
          console.error("Review submission error:", error);
          toast.error("Unable to submit your review. Please try again.");
        }
        return;
      }

      setMyReview(data as ProductReview);
      setReviewTitle("");
      setReviewText("");
      setReviewRating(5);
      toast.success("Review submitted for approval!");
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }

  async function handleShare() {
    const item = currentProduct;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: `Check out ${item.title} on Dealstack`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied!");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      try {
        await navigator.clipboard.writeText(url);
        toast.success("Product link copied!");
      } catch {
        toast.error("Unable to share the product link.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-300 transition hover:text-yellow-400"
        >
          <span className="text-xl" aria-hidden="true">←</span>
          Back to Catalogue
        </Link>

        {/* Product gallery and information */}
        <section className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <div
              ref={imageFrameRef}
              className="group relative flex min-h-[320px] items-center justify-center overflow-visible rounded-3xl border border-gray-800 bg-[#101827] p-5 sm:min-h-[480px] sm:p-10"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleImageMouseMove}
              aria-label="Product image. Move your mouse over the image to zoom."
            >
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt={currentProduct.title}
                    className="max-h-[440px] w-full cursor-crosshair object-contain"
                    fetchPriority="high"
                  />
                  <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-3 py-1 text-xs text-gray-200 opacity-100 transition group-hover:opacity-0">
                    Move cursor over image to zoom
                  </span>
                  {isZooming && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute left-[calc(100%+12px)] top-0 z-30 hidden h-full min-h-[480px] w-full overflow-hidden rounded-2xl border border-gray-700 bg-[#101827] shadow-2xl lg:block"
                      style={{
                        backgroundImage: `url("${selectedImage.replace(/"/g, '\\"')}")`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "220% 220%",
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <span className="text-5xl">▧</span>
                  <p className="mt-3">No product image available</p>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 bg-[#101827] p-2 transition ${
                      selectedImage === image
                        ? "border-yellow-400"
                        : "border-gray-800 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${currentProduct.title} image ${index + 1}`}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0">
            {currentProduct.category && (
              <Link
                href={`/products?category=${encodeURIComponent(
                  currentProduct.category
                )}`}
                className="inline-block rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-sm font-semibold text-yellow-400 hover:bg-yellow-400/20"
              >
                {currentProduct.category}
              </Link>
            )}

            {currentProduct.brand && (
              <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
                {currentProduct.brand}
              </p>
            )}

            <h1 className="mt-3 break-words text-3xl font-extrabold leading-tight sm:text-4xl">
              {currentProduct.title}
            </h1>

            {(currentProduct.model_number || currentProduct.sku) && (
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
                {currentProduct.model_number && (
                  <p>
                    Model:{" "}
                    <span className="text-gray-200">
                      {currentProduct.model_number}
                    </span>
                  </p>
                )}
                {currentProduct.sku && (
                  <p>
                    SKU: <span className="text-gray-200">{currentProduct.sku}</span>
                  </p>
                )}
              </div>
            )}

            {currentProduct.short_description && (
              <p className="mt-5 leading-7 text-gray-300">
                {currentProduct.short_description}
              </p>
            )}

            {colorVariants.length > 0 && (
              <section className="mt-5" aria-label="Choose product color">
                <p className="mb-3 text-sm font-semibold text-gray-200">
                  Color: <span className="font-normal text-gray-400">{selectedColor || String(colorVariants[0].value)}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {colorVariants.map((variant, index) => {
                    const value = String(variant.value ?? `Color ${index + 1}`);
                    const swatch = String(variant.color_hex ?? "").trim() || value.toLowerCase();
                    const isSelected = value === (selectedColor || String(colorVariants[0].value));
                    return (
                      <button
                        key={`${value}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedColor(value);
                          const variantImages = [getImageUrl(variant.image), ...getArray(variant.gallery_images).map(getImageUrl)].filter((image): image is string => Boolean(image));
                          setSelectedImage(variantImages[0] || getImageUrl(currentProduct.image) || "");
                          setIsZooming(false);
                        }}
                        aria-label={`Select ${value} color`}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${isSelected ? "border-yellow-400 bg-yellow-400/10 text-white" : "border-gray-700 text-gray-300 hover:border-gray-500"}`}
                      >
                        <span aria-hidden="true" className="h-5 w-5 rounded-full border border-white/30 shadow-inner" style={{ backgroundColor: swatch }} />
                        {value}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mt-7 rounded-2xl border border-gray-800 bg-[#101827] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl font-extrabold text-white sm:text-4xl">
                  {formatPrice(price)}
                </span>

                {discount > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(mrp)}
                    </span>
                    <span className="rounded-md bg-green-500/15 px-2 py-1 text-sm font-bold text-green-400">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-400">
                {Number(currentProduct.gst_rate) > 0
                  ? `GST rate: ${currentProduct.gst_rate}%`
                  : "Taxes and final charges are subject to checkout details."}
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    inStock ? "bg-green-400" : "bg-red-400"
                  }`}
                />
                <span className={inStock ? "text-green-400" : "text-red-400"}>
                  {!hasStockInformation
                    ? "Contact us to confirm availability"
                    : inStock
                      ? `${stock} unit${stock === 1 ? "" : "s"} available`
                      : "Currently out of stock"}
                </span>
              </div>

              {inStock && (
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="text-sm font-semibold text-gray-300">
                    Quantity
                  </span>

                  <div className="flex items-center overflow-hidden rounded-lg border border-gray-700">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={quantity <= 1}
                      onClick={() =>
                        setQuantity((q) => Math.max(1, q - 1))
                      }
                      className="h-11 w-11 text-xl transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    <span className="min-w-12 text-center font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={hasStockInformation && quantity >= stock}
                      onClick={() =>
                        setQuantity((q) =>
                          hasStockInformation
                            ? Math.min(stock, q + 1)
                            : q + 1
                        )
                      }
                      className="h-11 w-11 text-xl transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => handleAddToCart(false)}
                  className="rounded-xl bg-yellow-400 px-5 py-3.5 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                >
                  Add to Cart
                </button>

                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => handleAddToCart(true)}
                  className="rounded-xl border border-yellow-400 px-5 py-3.5 font-bold text-yellow-400 transition hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
                >
                  Buy Now
                </button>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="mt-4 w-full rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-gray-500 hover:bg-gray-800"
              >
                ↗ Share Product
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {currentProduct.warranty && (
                <div className="rounded-xl border border-gray-800 bg-[#101827] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Warranty
                  </p>
                  <p className="mt-1 font-semibold">
                    {currentProduct.warranty}
                  </p>
                </div>
              )}

              {currentProduct.delivery_information && (
                <div className="rounded-xl border border-gray-800 bg-[#101827] p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Delivery
                  </p>
                  <p className="mt-1 text-sm leading-6 text-gray-200">
                    {currentProduct.delivery_information}
                  </p>
                </div>
              )}
            </div>

            {features.length > 0 && (
              <div className="mt-7">
                <h2 className="text-lg font-bold">Key Features</h2>
                <ul className="mt-3 space-y-3">
                  {features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-6 text-gray-300"
                    >
                      <span className="mt-0.5 text-yellow-400">✓</span>
                      <span>{getText(feature)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Product detail tabs */}
        <section className="mt-14 overflow-hidden rounded-2xl border border-gray-800 bg-[#101827] sm:mt-20">
          <div className="flex flex-wrap border-b border-gray-800">
            {(
              [
                ["description", "Description"],
                ["specifications", "Specifications"],
                ["delivery", "Delivery & Returns"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-4 text-sm font-semibold transition sm:px-7 ${
                  activeTab === tab
                    ? "border-yellow-400 text-yellow-400"
                    : "border-transparent text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-8">
            {activeTab === "description" && (
              <div>
                <h2 className="text-xl font-bold">Product Description</h2>
                <p className="mt-4 whitespace-pre-line leading-8 text-gray-300">
                  {currentProduct.description ||
                    currentProduct.short_description ||
                    "Detailed product description will be available soon."}
                </p>

                {packageContents.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold">Package Contents</h3>
                    <ul className="mt-3 space-y-2 text-gray-300">
                      {packageContents.map((item, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="text-yellow-400">•</span>
                          {getText(item)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentProduct.datasheet_url && (
                  <a
                    href={currentProduct.datasheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex font-semibold text-yellow-400 hover:text-yellow-300"
                  >
                    View Product Datasheet ↗
                  </a>
                )}
              </div>
            )}

            {activeTab === "specifications" && (
              <div>
                <h2 className="text-xl font-bold">
                  Technical Specifications
                </h2>

                {specifications &&
                Object.entries(specifications).length > 0 ? (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <tbody>
                        {Object.entries(specifications).map(([key, value]) => (
                          <tr key={key} className="border-b border-gray-800">
                            <th className="w-2/5 px-3 py-4 font-semibold capitalize text-gray-300 sm:px-5">
                              {key.replace(/[_-]/g, " ")}
                            </th>
                            <td className="px-3 py-4 text-gray-400 sm:px-5">
                              {typeof value === "object" && value !== null
                                ? JSON.stringify(value)
                                : String(value ?? "—")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-400">
                    Technical specifications have not been added yet.
                  </p>
                )}

                {variants.some((variant) => !variant || typeof variant !== "object" || String((variant as Record<string, unknown>).name ?? "").toLowerCase() !== "color") && (
                  <div className="mt-8">
                    <h3 className="font-bold">Available Variants</h3>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {variants.filter((variant) => !variant || typeof variant !== "object" || String((variant as Record<string, unknown>).name ?? "").toLowerCase() !== "color").map((variant, index) => (
                        <div key={index} className="rounded-lg border border-gray-700 px-4 py-3 text-sm text-gray-300">
                          {getText(variant) || `Variant ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "delivery" && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-bold">Delivery Information</h2>
                  <p className="mt-2 whitespace-pre-line leading-7 text-gray-300">
                    {currentProduct.delivery_information ||
                      "Delivery details will be confirmed during order processing."}
                  </p>
                </div>

                <div>
                  <h2 className="font-bold">Return Policy</h2>
                  <p className="mt-2 whitespace-pre-line leading-7 text-gray-300">
                    {currentProduct.return_policy ||
                      "Please contact Dealstack support for return eligibility and applicable terms."}
                  </p>
                </div>

                {currentProduct.warranty && (
                  <div>
                    <h2 className="font-bold">Warranty Information</h2>
                    <p className="mt-2 text-gray-300">
                      {currentProduct.warranty}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Customer reviews and ratings */}
        <section className="mt-14 sm:mt-20" aria-labelledby="reviews-heading">
          <div className="rounded-2xl border border-gray-800 bg-[#101827] p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
                  Customer feedback
                </p>
                <h2 id="reviews-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  Customer Reviews &amp; Ratings
                </h2>
              </div>
              <div className="rounded-xl border border-gray-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white">
                    {reviews.length
                      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                      : "—"}
                  </span>
                  <span className="text-lg tracking-wide text-yellow-400" aria-label={`${reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "No"} out of 5 stars`}>
                    {reviews.length ? "★".repeat(Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)) : "☆☆☆☆☆"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {reviews.length} approved review{reviews.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-7">
              {reviewsLoading ? (
                <p className="text-sm text-gray-400">Loading reviews...</p>
              ) : myReview ? (
                <div className="rounded-xl border border-gray-700 bg-black/30 p-4">
                  <h3 className="font-bold">Your review</h3>
                  <p className="mt-2 text-sm text-gray-300">
                    {myReview.status === "approved"
                      ? "Your review is published. Thank you for your feedback!"
                      : myReview.status === "pending"
                        ? "Your review has been submitted and is awaiting approval."
                        : "Your previous review was not approved. Please contact Dealstack support if you need help."}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="tracking-wide text-yellow-400">{"★".repeat(myReview.rating)}{"☆".repeat(5 - myReview.rating)}</span>
                    <span className="font-semibold">{myReview.review_title}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-300">{myReview.review_text}</p>
                </div>
              ) : currentUserId ? (
                <form onSubmit={handleSubmitReview} className="rounded-xl border border-gray-700 p-4 sm:p-6">
                  <h3 className="text-lg font-bold">Write a review</h3>
                  <p className="mt-1 text-sm text-gray-400">Share your experience with this product. Reviews are published after approval.</p>

                  <fieldset className="mt-5">
                    <legend className="mb-2 text-sm font-semibold text-gray-200">Your rating</legend>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Product rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          role="radio"
                          aria-checked={reviewRating === rating}
                          aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                          onClick={() => setReviewRating(rating)}
                          className={`text-3xl transition ${rating <= reviewRating ? "text-yellow-400" : "text-gray-600 hover:text-yellow-300"}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-400">{reviewRating}/5</span>
                    </div>
                  </fieldset>

                  <label htmlFor="review-title" className="mt-5 block text-sm font-semibold text-gray-200">Review title</label>
                  <input
                    id="review-title"
                    name="review_title"
                    type="text"
                    minLength={3}
                    maxLength={120}
                    required
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    placeholder="Summarize your experience"
                    className="mt-2 w-full rounded-xl border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400"
                  />

                  <label htmlFor="review-text" className="mt-5 block text-sm font-semibold text-gray-200">Your review</label>
                  <textarea
                    id="review-text"
                    name="review_text"
                    minLength={10}
                    maxLength={3000}
                    required
                    rows={5}
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    placeholder="What did you like or dislike about this product?"
                    className="mt-2 w-full resize-y rounded-xl border border-gray-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-yellow-400"
                  />
                  <p className="mt-2 text-xs text-gray-500">{reviewText.length}/3000 characters</p>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="mt-5 rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : "Submit review"}
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-gray-700 p-5">
                  <h3 className="font-bold">Have you used this product?</h3>
                  <p className="mt-2 text-sm text-gray-400">Log in to share your rating and review.</p>
                  <Link href="/customer-login" className="mt-4 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300">
                    Log in to write a review
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-bold">What customers say</h3>
              {!reviewsLoading && reviews.length === 0 ? (
                <p className="rounded-xl border border-gray-800 p-5 text-sm text-gray-400">No approved reviews yet. Be the first to review this product.</p>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-xl border border-gray-800 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-lg tracking-wide text-yellow-400" aria-label={`${review.rating} out of 5 stars`}>
                          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        <h4 className="mt-1 font-bold text-white">{review.review_title}</h4>
                      </div>
                      <time dateTime={review.created_at} className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-300">{review.review_text}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 sm:mt-20">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-yellow-400">
                  You may also like
                </p>
                <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                  Related Products
                </h2>
              </div>

              <Link
                href="/products"
                className="text-sm font-semibold text-yellow-400 hover:text-yellow-300"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => {
                const relatedPrice = toNumber(item.price);
                const relatedMrp = toNumber(item.mrp);
                const relatedDiscount =
                  relatedMrp > relatedPrice && relatedMrp > 0
                    ? Math.round(
                        ((relatedMrp - relatedPrice) / relatedMrp) * 100
                      )
                    : 0;

                const relatedImage = getImageUrl(item.image);

                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-800 bg-[#101827] transition hover:border-yellow-400/60"
                  >
                    <div className="relative flex h-36 items-center justify-center bg-gray-900 p-4 sm:h-48">
                      {relatedImage ? (
                        <img
                          src={relatedImage}
                          alt={item.title}
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-sm text-gray-500">
                          No image
                        </span>
                      )}

                      {relatedDiscount > 0 && (
                        <span className="absolute left-2 top-2 rounded-md bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
                          {relatedDiscount}% OFF
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-white group-hover:text-yellow-400 sm:text-base">
                        {item.title}
                      </h3>
                      <p className="mt-3 font-bold text-yellow-400">
                        {formatPrice(relatedPrice)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
