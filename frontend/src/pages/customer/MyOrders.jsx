import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import orderService from "../../services/orderService";
import customOrderService from "../../services/customOrderService";
import OrderCard from "../../components/common/OrderCard";
import StatusBadge from "../../components/common/StatusBadge";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const CustomRequestCard = ({ request, onRespond }) => (
  <div className="card p-4">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-display text-lg font-semibold text-berry-500">
          Custom Cake — {request.desiredWeight}
        </p>
        <p className="mt-0.5 text-xs text-mauve-400">
          {new Date(request.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <StatusBadge status={request.status === "pending_review" ? "pending" : request.status} />
    </div>

    <p className="mt-2 line-clamp-2 text-sm text-mauve-500">{request.description}</p>

    {request.status === "quoted" && (
      <div className="mt-3 rounded-xl2 bg-blush-50 p-3.5">
        <p className="text-sm font-semibold text-berry-600">
          Quoted Price: Rs. {request.quotedPrice?.toLocaleString("en-PK")}
        </p>
        {request.adminNotes && <p className="mt-1 text-xs text-mauve-500">{request.adminNotes}</p>}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onRespond(request._id, true)}
            className="btn-primary touch-target flex-1 !py-2 text-xs"
          >
            Accept Quote
          </button>
          <button
            onClick={() => onRespond(request._id, false)}
            className="btn-secondary touch-target flex-1 !py-2 text-xs !border-red-200 !text-red-500"
          >
            Decline
          </button>
        </div>
      </div>
    )}
  </div>
);

const MyOrders = () => {
  useDocumentTitle("My Orders");
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [customRequests, setCustomRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([orderService.getMine(), customOrderService.getMine()])
      .then(([orderData, customData]) => {
        setOrders(orderData.orders);
        setCustomRequests(customData.customOrders);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRespond = async (id, accept) => {
    try {
      await customOrderService.respond(id, accept);
      toast.success(accept ? "Quote accepted — we'll be in touch!" : "Quote declined");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-3xl font-semibold text-berry-500">My Orders</h1>

      <div className="mt-5 flex gap-2">
        <button
          onClick={() => setTab("orders")}
          className={`touch-target rounded-full border px-4 text-sm font-medium ${
            tab === "orders" ? "border-rose-500 bg-rose-500 text-white" : "border-berry-500/12 bg-white text-berry-600"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setTab("custom")}
          className={`touch-target rounded-full border px-4 text-sm font-medium ${
            tab === "custom" ? "border-rose-500 bg-rose-500 text-white" : "border-berry-500/12 bg-white text-berry-600"
          }`}
        >
          Custom Requests
          {customRequests.some((r) => r.status === "quoted") && (
            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : tab === "orders" ? (
          orders.length === 0 ? (
            <EmptyState icon="🍰" title="No orders yet" description="Your placed orders will show up here." />
          ) : (
            orders.map((order) => <OrderCard key={order._id} order={order} />)
          )
        ) : customRequests.length === 0 ? (
          <EmptyState icon="🎂" title="No custom requests yet" description="Design a custom cake to see it here." />
        ) : (
          customRequests.map((r) => (
            <CustomRequestCard key={r._id} request={r} onRespond={handleRespond} />
          ))
        )}
      </div>
    </div>
  );
};

export default MyOrders;
