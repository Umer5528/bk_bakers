import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Truck, Store as StoreIcon, CalendarClock, ArrowRight, Sparkles } from "lucide-react";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import galleryService from "../../services/galleryService";
import CategoryCard from "../../components/common/CategoryCard";
import ProductCard from "../../components/common/ProductCard";
import Skeleton from "../../components/common/Skeleton";
import BrandLogo from "../../components/common/BrandLogo";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

const features = [
  { icon: Sparkles, title: "Made to Order", desc: "Every cake baked fresh, never from a shelf." },
  { icon: Truck, title: "Delivery or Pickup", desc: "Whichever suits your celebration best." },
  { icon: CalendarClock, title: "Scheduled Slots", desc: "Pick the exact time that works for you." },
];

const Home = () => {
  useDocumentTitle(null);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryService.getAll(),
      productService.getAll({ featured: "true", limit: 8 }),
      galleryService.getAll().catch(() => ({ items: [] })),
    ])
      .then(([catData, prodData, galleryData]) => {
        setCategories(catData.categories);
        setFeatured(prodData.products);
        setGallery((galleryData.items || []).slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ============ HERO ============ */}
      {/* Mobile: compact stacked layout that gets to products fast.
          Desktop: asymmetrical editorial layout with room to breathe. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-cream-100 to-cream-100">
        <div className="mx-auto grid max-w-content gap-8 px-5 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-14 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-10 lg:pb-24 lg:pt-16">
          <motion.div
            initial="hidden"
            animate="show"
            className="relative z-10 text-center lg:text-left"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative mx-auto mb-5 flex w-fit justify-center lg:mx-0"
            >
              {/* A soft, matching-toned glow behind the badge — the logo
                 itself now has its background removed, but this warm
                 halo is what keeps a circular emblem from ever reading
                 as a sticker dropped onto the page, on any surface. */}
              <div className="absolute inset-0 -z-10 scale-125 rounded-full bg-rose-200/40 blur-2xl" />
              <BrandLogo size={116} />
            </motion.div>

            <motion.span
              variants={fadeUp}
              custom={0.5}
              className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-600 shadow-soft lg:mx-0"
            >
              <Sparkles className="h-3 w-3" /> Handcrafted daily
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-display-md leading-[1.05] text-berry-500 sm:text-display-lg lg:text-display-xl"
            >
              Cakes worth
              <br />
              <span className="italic text-rose-500">celebrating.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 font-display text-lg italic text-rose-500 sm:text-xl"
            >
              Artistry You Can Taste
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-mauve-500 lg:mx-0"
            >
              Premium, home-baked cakes and treats — customized to your taste
              and ready exactly when you need them.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link to="/shop" className="btn-primary touch-target">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/custom-cake" className="btn-secondary touch-target">
                Order a Custom Cake
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-first lg:order-last"
          >
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl3 shadow-lift sm:max-w-md lg:max-w-none">
              {featured[0]?.images?.[0]?.url ? (
                <img
                  src={featured[0].images[0].url}
                  alt="Signature cake"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-200 via-blush-100 to-peach-200 text-7xl">
                  🍰
                </div>
              )}
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl bg-white px-5 py-3 shadow-card sm:block lg:-left-6">
              <p className="font-display text-lg font-semibold text-berry-500">100% Fresh</p>
              <p className="text-xs text-mauve-400">Baked to order, every time</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-flat flex items-center gap-4 p-5 sm:flex-col sm:p-6 sm:text-center"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blush-100">
                <Icon className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-berry-500">{title}</h3>
                <p className="mt-0.5 text-sm text-mauve-500">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="mx-auto max-w-content px-5 py-6 sm:px-6 lg:px-10">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-berry-500 sm:text-3xl">
            Shop by Category
          </h2>
          <Link to="/shop" className="flex items-center gap-1 text-sm font-medium text-rose-600">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full sm:aspect-[4/5]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {categories.map((c, i) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <CategoryCard category={c} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      {(loading || featured.length > 0) && (
        <section className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-berry-500 sm:text-3xl">
              Featured Favorites
            </h2>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5.5] w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {featured.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============ CUSTOM CAKE — bespoke consultation callout ============ */}
      <section className="mx-auto max-w-content px-5 py-6 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-xl3 bg-berry-500 px-6 py-10 text-center sm:px-12 sm:py-14 lg:text-left"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/25 via-transparent to-transparent" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5 lg:mx-0 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-peach-200">
                Bespoke &amp; Made for You
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                Have something specific in mind?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-blush-100 lg:mx-0">
                Share your inspiration image and vision — we'll craft a
                personalized cake and send you a quotation.
              </p>
            </div>
            <Link
              to="/custom-cake"
              className="btn-primary shrink-0 !bg-white !text-berry-600 hover:!bg-blush-50"
            >
              Start Designing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ============ GALLERY PREVIEW — real admin-managed photos ============ */}
      {!loading && gallery.length > 0 && (
        <section className="mx-auto max-w-content px-5 py-10 sm:px-6 sm:py-14 lg:px-10">
          <h2 className="mb-5 font-display text-2xl font-semibold text-berry-500 sm:text-3xl">
            From Our Kitchen
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
            {gallery.map((item) => (
              <div key={item._id} className="aspect-square overflow-hidden rounded-xl2">
                <img src={item.image.url} alt={item.caption || ""} className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
