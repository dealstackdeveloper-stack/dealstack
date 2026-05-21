type CategoryCardProps = {
  title: string;
};

export default function CategoryCard({
  title,
}: CategoryCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 hover:border-gray-600 transition cursor-pointer hover:scale-105 duration-300">

      <h3 className="text-2xl font-bold text-center">
        {title}
      </h3>

    </div>
  );
}