import Link from "next/link";
import Image from "next/image";
type ProductCardProps = {
  title: string;
  price: string;
  image: string;
  slug: string;
};

export default function ProductCard({
  title,
  price,
image,
slug,
}: ProductCardProps) {
  return (
  <Link href={`/products/${slug}`}>

    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition hover:scale-105 duration-300">

      <div className="w-full h-56 overflow-hidden">

  <Image
    src={image}
    alt={title}
    width={500}
    height={300}
    loading="eager"
    className="w-full object-cover h-auto"
  />

</div>

      <div className="p-5">

        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        <p className="text-gray-400 mt-2">
          Premium quality technology product.
        </p>

        <div className="flex items-center justify-between mt-5">

          <span className="text-2xl font-bold">
            ₹{price}
          </span>

          <button className="bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
            Buy
          </button>

        </div>

      </div>

    </div>

  </Link>
);
}