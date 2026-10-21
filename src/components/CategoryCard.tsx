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
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-10 text-gray-900 transition duration-300 hover:-translate-y-1 hover:border-yellow-400 hover:bg-white hover:shadow-lg"
    >
      <h3 className="text-center text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-3 text-center text-sm text-gray-500 transition-colors hover:text-yellow-700">
        Explore Products →
      </p>
    </button>
  );
}