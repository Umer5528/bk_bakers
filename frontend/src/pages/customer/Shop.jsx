import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
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

const Shop = () => {
  useDocumentTitle("Shop");
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const activeCategory = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const activeSortLabel = sortOptions.find((o) => o.value === sort)?.label;

  useEffect(() => {
    categoryService.getAll().then(({ categories: cats }) => setCategories(cats));
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    productService
      .getAll({
        category: activeCategory || undefined,
        search: searchParams.get("search") || undefined,
        sort,
      })
      .then(({ products: prods }) => {
        if (!ignore) setProducts(prods);
      })
      .catch(() => !ignore && setProducts([]))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [activeCategory, sort, searchParams]);

  const setParam = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      value ? next.set(key, value) : next.delete(key);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-content px-5 py-8 sm:px-6 sm:py-10 lg:px-10">
      <h1 className="font-display text-3xl font-semibold text-berry-500 sm:text-4xl">
        Shop All
      </h1>
      <p className="mt-1 text-sm text-mauve-500">
        Freshly baked, made to order — browse everything we craft.
      </p>

      {/* --- Search --- */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("search", search);
        }}
        className="relative mt-6 w-full sm:max-w-sm"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cakes, treats..."
          className="input-field pl-10"
        />
      </form>

      {/* --- Category chips + sort --- */}
      <div className="mt-5 flex items-center gap-2">
        <div className="scrollbar-none flex flex-1 gap-2 overflow-x-auto py-1">
          <button
            onClick={() => setParam("category", "")}
            className={`touch-target shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
              !activeCategory
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-berry-500/12 bg-white text-berry-600 hover:border-rose-300"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setParam("category", c.slug)}
              className={`touch-target shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                activeCategory === c.slug
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-berry-500/12 bg-white text-berry-600 hover:border-rose-300"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Mobile: opens a bottom sheet. Desktop: inline select. */}
        <button
          onClick={() => setSortSheetOpen(true)}
          className="touch-target flex shrink-0 items-center gap-1.5 rounded-full border border-berry-500/12 bg-white px-4 text-sm font-medium text-berry-600 sm:hidden"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Sort
        </button>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="input-field hidden w-52 shrink-0 sm:block"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* --- Mobile sort bottom sheet --- */}
      {sortSheetOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-berry-800/40"
            onClick={() => setSortSheetOpen(false)}
          />
          <div className="pb-safe absolute inset-x-0 bottom-0 rounded-t-xl3 bg-white p-5 shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-berry-500">Sort By</h3>
              <button onClick={() => setSortSheetOpen(false)} className="btn-icon">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setParam("sort", opt.value);
                    setSortSheetOpen(false);
                  }}
                  className={`touch-target flex w-full items-center rounded-xl px-4 text-left text-sm font-medium ${
                    sort === opt.value ? "bg-blush-100 text-rose-600" : "text-berry-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSortLabel && (
        <p className="mt-3 text-xs text-mauve-400 sm:hidden">Sorted by {activeSortLabel}</p>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5.5] w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon="🍰" title="No cakes found" description="Try a different search or category." />
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

export default Shop;
