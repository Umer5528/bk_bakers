import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import ProductCard from "../../components/common/ProductCard";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name" },
  { value: "popular", label: "Most Popular" },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const sort = searchParams.get("sort") || "newest";

  useDocumentTitle(category?.name || "Shop");

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const load = async () => {
      try {
        const [{ category: cat }, { products: prods }] = await Promise.all([
          categoryService.getBySlug(slug),
          productService.getAll({
            category: slug,
            search: searchParams.get("search") || undefined,
            sort,
          }),
        ]);
        if (!ignore) {
          setCategory(cat);
          setProducts(prods);
        }
      } catch {
        if (!ignore) {
          setCategory(null);
          setProducts([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [slug, searchParams, sort]);

  const submitSearch = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      search ? next.set("search", search) : next.delete("search");
      return next;
    });
  };

  return (
    <div>
      {/* --- Editorial category banner --- */}
      <div className="relative overflow-hidden bg-blush-100">
        <div className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
          <div className="relative z-10 max-w-lg">
            <h1 className="font-display text-3xl font-semibold text-berry-500 sm:text-4xl">
              {category?.name || "Products"}
            </h1>
            {category?.description && (
              <p className="mt-2 text-[15px] leading-relaxed text-mauve-500">{category.description}</p>
            )}
          </div>
        </div>
        {category?.image?.url && (
          <img
            src={category.image.url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-15"
          />
        )}
      </div>

      <div className="mx-auto max-w-content px-5 py-6 sm:px-6 lg:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={submitSearch} className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search this category..."
              className="input-field pl-10"
            />
          </form>

          <select
            value={sort}
            onChange={(e) =>
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set("sort", e.target.value);
                return next;
              })
            }
            className="input-field w-full sm:w-56"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5.5] w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon="🍰" title="No cakes found" description="Try a different search or check back soon." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
