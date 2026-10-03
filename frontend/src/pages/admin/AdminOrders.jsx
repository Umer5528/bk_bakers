import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Truck, Store, ChevronRight, Clock } from "lucide-react";
import adminService from "../../services/adminService";
import StatusBadge from "../../components/common/StatusBadge";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import { formatPKR } from "../../utils/priceCalculator";
import { friendlyDate } from "../../utils/friendly";

// One row of simple tabs instead of three separate dropdown filters.
const VIEWS = [
  { key: "all", label: "All", params: {} },
  { key: "payments", label: "Payments to check", params: { paymentStatus: "pending_verification" } },
  { key: "new", label: "New", params: { status: "pending" } },
  {
    key: "progress",
    label: "In progress",
    params: { status: "confirmed,preparing,ready,out_for_delivery,ready_for_pickup,picked_up" },
  },
  { key: "done", label: "Completed", params: { status: "completed" } },
  { key: "cancelled", label: "Cancelled", params: { status: "cancelled" } },
];

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const viewKey = searchParams.get("view") || "all";
  const fulfillmentType = searchParams.get("type") || "";
  const view = VIEWS.find((v) => v.key === viewKey) || VIEWS[0];

  useEffect(() => {
    setLoading(true);
    adminService
      .getOrders({
        ...view.params,
        fulfillmentType: fulfillmentType || undefined,
        search: search || undefined,
      })
      .then(({ orders: list }) => setOrders(list))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [viewKey, fulfillmentType, search]);

  const setParam = (key, value) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      value && value !== "all" ? next.set(key, value) : next.delete(key);
      return next;
    });

  return (
    <div>
      {/* --- Simple tabs --- */}
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setParam("view", v.key)}
            className={`touch-target shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
              viewKey === v.key
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-berry-500/12 bg-white text-berry-600 hover:border-rose-300"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find an order — type the order number or cake name"
            className="input-field pl-10"
            aria-label="Find an order"
          />
        </div>
        <select
          value={fulfillmentType}
          onChange={(e) => setParam("type", e.target.value)}
          className="input-field sm:w-52"
          aria-label="Delivery or pickup"
        >
          <option value="">Delivery &amp; Pickup</option>
          <option value="delivery">Delivery only</option>
          <option value="pickup">Pickup only</option>
        </select>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No orders here"
            description={
              viewKey === "all" && !search
                ? "When customers place orders, they will show up here."
                : "Nothing matches this tab right now. Try another tab or clear your search."
            }
          />
        ) : (
          <div className="space-y-2.5">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/admin/orders/${order.orderNumber}`}
                className="card-flat group block p-4 transition-shadow hover:shadow-card sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold text-berry-600">{order.customer?.name}</p>
                      <p className="text-xs text-mauve-400">{order.orderNumber}</p>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-mauve-500">
                      {order.productNameSnapshot} × {order.quantity}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-berry-600">
                      <span className="flex items-center gap-1.5">
                        {order.fulfillmentType === "delivery" ? (
                          <Truck className="h-4 w-4 text-rose-500" />
                        ) : (
                          <Store className="h-4 w-4 text-rose-500" />
                        )}
                        {order.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-rose-500" />
                        {friendlyDate(order.scheduledDate)}, {order.timeSlotLabelSnapshot}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-semibold text-berry-600">{formatPKR(order.totalAmount)}</p>
                    <ChevronRight className="h-4 w-4 text-mauve-300 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-berry-500/8 pt-3 text-xs text-mauve-500">
                  <span>Order:</span> <StatusBadge status={order.status} />
                  <span className="ml-2">Payment:</span> <StatusBadge status={order.paymentStatus} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
