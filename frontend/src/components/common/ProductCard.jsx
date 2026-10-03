import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { formatPKR } from "../../utils/priceCalculator";

const ProductCard = ({ product }) => {
  const primaryImage =
    product.images?.find((i) => i.isPrimary) || product.images?.[0];

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-xl3 bg-white shadow-soft transition-all duration-300 ease-soft-out hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-blush-50">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-soft-out group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blush-50 to-peach-100 text-5xl">
            🍰
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-rose-600 shadow-soft">
            Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">
          {product.category?.name}
        </p>
        <h3 className="mt-1 truncate font-display text-lg font-semibold text-berry-500">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-berry-600">
            From {formatPKR(product.startingPrice)}
          </span>
          {product.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-mauve-400">
              <Star className="h-3.5 w-3.5 fill-peach-300 text-peach-300" />
              {product.ratingAverage?.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
