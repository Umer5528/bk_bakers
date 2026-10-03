import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Info, Clock, AlertTriangle, Minus, Plus, ChevronRight } from "lucide-react";
import productService from "../../services/productService";
import ImageGallery from "../../components/common/ImageGallery";
import OptionSelector from "../../components/common/OptionSelector";
import ProductCard from "../../components/common/ProductCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import { calculateLocalPrice, formatPKR } from "../../utils/priceCalculator";
import { useAuth } from "../../context/AuthContext";
import { useOrderDraft } from "../../context/OrderDraftContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { startDraft } = useOrderDraft();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  useDocumentTitle(product?.name || "Product");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [related, setRelated] = useState([]);

  const [weightOptionId, setWeightOptionId] = useState(null);
  const [shapeOptionId, setShapeOptionId] = useState(null);
  const [flavorOptionId, setFlavorOptionId] = useState(null);
  const [fillingOptionId, setFillingOptionId] = useState(null);
  const [extraSelections, setExtraSelections] = useState({}); // { [groupId]: id | id[] }

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    productService
      .getBySlug(slug)
      .then(({ product: p }) => {
        setProduct(p);
        setWeightOptionId(
          (p.weightOptions.find((w) => w.isDefault) || p.weightOptions[0])?._id
        );
        setShapeOptionId(
          (p.shapeOptions.find((o) => o.isDefault) || p.shapeOptions[0])?._id || null
        );
        setFlavorOptionId(
          (p.flavorOptions.find((o) => o.isDefault) || p.flavorOptions[0])?._id || null
        );
        setFillingOptionId(
          (p.fillingOptions.find((o) => o.isDefault) || p.fillingOptions[0])?._id || null
        );
        const defaults = {};
        for (const group of p.extraOptionGroups || []) {
          const def = group.options.find((o) => o.isDefault);
          defaults[group._id] =
            group.selectionType === "multiple" ? (def ? [def._id] : []) : def?._id || null;
        }
        setExtraSelections(defaults);
        setQuantity(1);

        if (p.category?.slug) {
          productService
            .getAll({ category: p.category.slug, limit: 5 })
            .then(({ products }) => setRelated(products.filter((r) => r._id !== p._id).slice(0, 4)))
            .catch(() => setRelated([]));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const selections = useMemo(
    () => ({
      weightOptionId,
      shapeOptionId,
      flavorOptionId,
      fillingOptionId,
      extraOptionGroups: Object.entries(extraSelections).map(([groupId, val]) => ({
        groupId,
        optionIds: Array.isArray(val) ? val : val ? [val] : [],
      })),
    }),
    [weightOptionId, shapeOptionId, flavorOptionId, fillingOptionId, extraSelections]
  );

  const { total, breakdown } = useMemo(
    () => calculateLocalPrice(product, selections),
    [product, selections]
  );

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast("Please log in to continue your order");
      navigate("/login", { state: { from: { pathname: `/product/${slug}` } } });
      return;
    }
    startDraft(product, selections, quantity);
    navigate("/checkout");
  };

  if (loading) return <LoadingScreen />;

  if (notFound || !product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-5xl">🍰</p>
        <h1 className="mt-4 font-display text-xl font-semibold text-berry-500">Product not found</h1>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Extra bottom padding on mobile clears both the sticky quantity/
         checkout bar AND the bottom tab bar beneath it. */}
      <div className="mx-auto max-w-content px-5 py-6 pb-28 sm:px-6 sm:py-10 lg:px-10 lg:pb-10">
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-mauve-400">
          <Link to="/shop" className="hover:text-rose-600">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/category/${product.category?.slug}`} className="hover:text-rose-600">
            {product.category?.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-berry-500">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <ImageGallery images={product.images} alt={product.name} />
          </div>

          <div>
            <h1 className="font-display text-2xl font-semibold text-berry-500 sm:text-3xl">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-2 text-[15px] leading-relaxed text-mauve-500">
                {product.description}
              </p>
            )}

            <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-mauve-400">
              <Clock className="h-3.5 w-3.5" />
              Preparation time: ~{product.preparationTimeHours}h
            </div>

            <div className="mt-6 space-y-5">
              <OptionSelector
                label="Weight / Size"
                options={product.weightOptions}
                selectedIds={weightOptionId}
                onChange={setWeightOptionId}
                showPriceAsBase
                required
              />
              {product.shapeOptions?.length > 0 && (
                <OptionSelector
                  label="Shape"
                  options={product.shapeOptions}
                  selectedIds={shapeOptionId}
                  onChange={setShapeOptionId}
                />
              )}
              {product.flavorOptions?.length > 0 && (
                <OptionSelector
                  label="Flavor"
                  options={product.flavorOptions}
                  selectedIds={flavorOptionId}
                  onChange={setFlavorOptionId}
                />
              )}
              {product.fillingOptions?.length > 0 && (
                <OptionSelector
                  label="Filling"
                  options={product.fillingOptions}
                  selectedIds={fillingOptionId}
                  onChange={setFillingOptionId}
                />
              )}
              {(product.extraOptionGroups || []).map((group) => (
                <OptionSelector
                  key={group._id}
                  label={group.name}
                  options={group.options}
                  selectionType={group.selectionType}
                  required={group.required}
                  selectedIds={extraSelections[group._id]}
                  onChange={(val) =>
                    setExtraSelections((prev) => ({ ...prev, [group._id]: val }))
                  }
                />
              ))}
            </div>

            {(product.allergens?.length > 0 || product.ingredients?.length > 0) && (
              <div className="mt-6 space-y-2 rounded-xl2 bg-blush-50 p-4 text-sm">
                {product.ingredients?.length > 0 && (
                  <p className="flex gap-2 text-berry-600">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <span><strong>Ingredients:</strong> {product.ingredients.join(", ")}</span>
                  </p>
                )}
                {product.allergens?.length > 0 && (
                  <p className="flex gap-2 text-berry-600">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-peach-300" />
                    <span><strong>Allergens:</strong> {product.allergens.join(", ")}</span>
                  </p>
                )}
              </div>
            )}

            {/* Desktop price summary — sticky while scrolling long option lists */}
            <div className="mt-8 hidden rounded-xl3 border border-berry-500/8 bg-white p-5 shadow-soft lg:sticky lg:top-24 lg:block">
              <QuantityAndPrice
                quantity={quantity}
                setQuantity={setQuantity}
                breakdown={breakdown}
                total={total}
                onCheckout={handleProceedToCheckout}
              />
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-4 font-display text-2xl font-semibold text-berry-500">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile: sticky bottom action bar — never covers content, sits
         above the tab bar's space via MainLayout's pb-20 reservation. */}
      <div className="pb-safe fixed inset-x-0 bottom-16 z-30 border-t border-berry-500/8 bg-white/95 px-4 py-3 shadow-lift backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="touch-target flex items-center justify-center rounded-full border border-berry-500/12 text-berry-600"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-berry-600">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="touch-target flex items-center justify-center rounded-full border border-berry-500/12 text-berry-600"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="btn-primary touch-target flex-1"
          >
            {formatPKR(total * quantity)} · Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

// Shared between the desktop sticky card and could be reused by a
// mobile expandable summary later — kept as one source of truth for the
// price breakdown rendering.
const QuantityAndPrice = ({ quantity, setQuantity, breakdown, total, onCheckout }) => (
  <>
    <div className="mb-4 flex items-center justify-between">
      <span className="text-sm font-semibold text-berry-600">Quantity</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="touch-target flex items-center justify-center rounded-full border border-berry-500/12 text-berry-600 hover:bg-blush-50"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center font-medium text-berry-600">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(20, q + 1))}
          className="touch-target flex items-center justify-center rounded-full border border-berry-500/12 text-berry-600 hover:bg-blush-50"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div className="space-y-1">
      {breakdown.map((line, i) => (
        <div key={i} className="flex justify-between text-sm text-mauve-500">
          <span>{line.label}</span>
          <span>{formatPKR(line.amount)}</span>
        </div>
      ))}
      {quantity > 1 && (
        <div className="flex justify-between text-sm text-mauve-500">
          <span>Quantity ×{quantity}</span>
          <span>{formatPKR(total * quantity)}</span>
        </div>
      )}
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-berry-500/8 pt-3">
      <span className="text-sm font-medium text-berry-600">Total</span>
      <span className="font-display text-2xl font-semibold text-berry-500">
        {formatPKR(total * quantity)}
      </span>
    </div>
    <button type="button" onClick={onCheckout} className="btn-primary mt-4 w-full">
      Proceed to Checkout
    </button>
  </>
);

export default ProductDetails;
