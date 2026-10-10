"use client";

type CategoryCardProps = {
  title: string;
  onClick: () => void;
};

export default function CategoryCard({
  title,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-gray-800 bg-gray-900 p-10 text-white transition duration-300 hover:scale-105 hover:border-gray-600"
    >
      <h3 className="text-center text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-center text-sm text-gray-400">
        Explore Products →
      </p>
    </button>
  );
}
