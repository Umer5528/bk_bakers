import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => (
  <Link
    to={`/category/${category.slug}`}
    className="group relative block overflow-hidden rounded-xl3 bg-blush-100 shadow-soft transition-all duration-300 ease-soft-out hover:shadow-lift"
  >
    <div className="aspect-square w-full overflow-hidden sm:aspect-[4/5]">
      {category.image?.url ? (
        <img
          src={category.image.url}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-soft-out group-hover:scale-[1.06]"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-100 to-peach-100 text-5xl">
          🍰
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-berry-800/55 via-berry-800/0 to-transparent" />
    </div>
    <div className="absolute inset-x-0 bottom-0 p-4">
      <h3 className="font-display text-xl font-semibold text-white drop-shadow-sm">
        {category.name}
      </h3>
    </div>
  </Link>
);

export default CategoryCard;
