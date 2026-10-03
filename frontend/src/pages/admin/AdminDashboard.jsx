import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Sparkles, Truck, Store, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import adminService from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import Skeleton from "../../components/common/Skeleton";
import { formatPKR } from "../../utils/priceCalculator";

// One big, friendly card per thing that might need attention.
const AttentionCard = ({ to, icon: Icon, count, title, whenBusy, whenClear }) => {
  const busy = count > 0;
  return (
    <Link
      to={to}
      className={`group flex items-center gap-4 rounded-xl3 border p-5 transition-all hover:-translate-y-0.5 hover:shadow-card ${
        busy ? "border-amber-200 bg-amber-50" : "border-berry-500/8 bg-white"
      }`}
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold ${
          busy ? "bg-amber-100 text-amber-700" : "bg-blush-100 text-mauve-400"
        }`}
      >
        {count}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[15px] font-semibold text-berry-600">
          <Icon className="h-4 w-4 text-rose-500" /> {title}
        </p>
        <p className="mt-0.5 text-sm text-mauve-500">{busy ? whenBusy : whenClear}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-mauve-300 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [setup, setSetup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(({ stats: s }) => setStats(s))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Which of the "get your shop ready" steps are already done?
    Promise.allSettled([
      adminService.getCategories(),
      adminService.getProducts(),
      adminService.getPaymentAccounts(),
      adminService.getTimeSlots(),
      adminService.getSettings(),
    ]).then(([cats, prods, accounts, slots, settings]) => {
      const len = (r, key) => (r.status === "fulfilled" ? (r.value[key] || []).length : 0);
      const s = settings.status === "fulfilled" ? settings.value.settings : {};
      setSetup({
        sections: len(cats, "categories") > 0,
        items: len(prods, "products") > 0,
        pay: len(accounts, "accounts") > 0,
        times: len(slots, "slots") > 0,
        details: Boolean(s.phone && s.pickup?.address),
      });
    });
  }, []);

  const steps = setup && [
    { done: setup.sections, label: "Create a menu section", help: "For example: Cakes, Cupcakes, Fast Food.", to: "/admin/categories" },
    { done: setup.items, label: "Add your first cake or item", help: "Add a photo, sizes and prices.", to: "/admin/products" },
    { done: setup.pay, label: "Add how customers pay you", help: "Your EasyPaisa, JazzCash or bank account.", to: "/admin/payment-accounts" },
    { done: setup.times, label: "Set your delivery & pickup times", help: "The time windows customers can choose.", to: "/admin/time-slots" },
    { done: setup.details, label: "Fill in your shop details", help: "Phone number and pickup address.", to: "/admin/settings" },
  ];
  const stepsLeft = steps ? steps.filter((s) => !s.done).length : 0;

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="font-display text-2xl font-semibold text-berry-500 sm:text-3xl">
        Hello, {user?.name?.split(" ")[0]} 👋
      </h2>
      <p className="mt-1 text-[15px] text-mauve-500">Here's what needs your attention today.</p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : stats ? (
        <>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <AttentionCard
              to="/admin/orders?view=payments"
              icon={CreditCard}
              count={stats.pendingPaymentVerification}
              title="Payments to check"
              whenBusy="Customers sent a payment receipt. Tap to check it."
              whenClear="Nothing waiting — you're all caught up."
            />
            <AttentionCard
              to="/admin/custom-requests"
              icon={Sparkles}
              count={stats.pendingCustomRequests}
              title="Custom cake requests"
              whenBusy="Someone is waiting for your price. Tap to reply."
              whenClear="No new requests right now."
            />
            <AttentionCard
              to="/admin/orders"
              icon={Truck}
              count={stats.todayDeliveries}
              title="Deliveries today"
              whenBusy="Orders that need to go out today."
              whenClear="No deliveries scheduled today."
            />
            <AttentionCard
              to="/admin/orders"
              icon={Store}
              count={stats.todayPickups}
              title="Pickups today"
              whenBusy="Customers are coming to collect today."
              whenClear="No pickups scheduled today."
            />
          </div>

          {stepsLeft > 0 && (
            <div className="mt-8 rounded-xl3 border border-rose-200 bg-white p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold text-berry-500">Get your shop ready</h3>
              <p className="mt-1 text-sm text-mauve-500">
                {stepsLeft} step{stepsLeft > 1 ? "s" : ""} left before customers can order smoothly.
              </p>
              <ul className="mt-4 divide-y divide-berry-500/8">
                {steps.map((s) => (
                  <li key={s.label}>
                    <Link to={s.to} className="touch-target flex items-center gap-3 py-3">
                      {s.done ? (
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-green-500" />
                      ) : (
                        <Circle className="h-6 w-6 shrink-0 text-mauve-300" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[15px] font-medium ${s.done ? "text-mauve-400 line-through" : "text-berry-600"}`}>
                          {s.label}
                        </span>
                        {!s.done && <span className="block text-xs text-mauve-500">{s.help}</span>}
                      </span>
                      {!s.done && <ArrowRight className="h-4 w-4 shrink-0 text-mauve-300" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="mb-3 mt-8 font-display text-xl font-semibold text-berry-500">Your shop so far</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="card-flat p-5">
              <p className="text-sm text-mauve-500">Orders this week</p>
              <p className="mt-1 font-display text-3xl font-semibold text-berry-500">{stats.ordersThisWeek}</p>
            </div>
            <div className="card-flat p-5">
              <p className="text-sm text-mauve-500">Orders completed</p>
              <p className="mt-1 font-display text-3xl font-semibold text-berry-500">{stats.completedOrders}</p>
            </div>
            <div className="card-flat p-5">
              <p className="text-sm text-mauve-500">Total sales</p>
              <p className="mt-1 font-display text-3xl font-semibold text-berry-500">{formatPKR(stats.totalRevenue)}</p>
            </div>
          </div>

          {stats.popularProducts.length > 0 && (
            <div className="card-flat mt-4 p-5">
              <h4 className="mb-3 text-sm font-semibold text-berry-600">Your most popular items</h4>
              <ul className="space-y-2">
                {stats.popularProducts.map((p) => (
                  <li key={p.name} className="flex justify-between text-sm text-berry-600">
                    <span>{p.name}</span>
                    <span className="text-mauve-500">{p.quantity} sold</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="mt-6 text-sm text-mauve-500">We couldn't load your numbers just now. Please refresh the page.</p>
      )}
    </div>
  );
};

export default AdminDashboard;
