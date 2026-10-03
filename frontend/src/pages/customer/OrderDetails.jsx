import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Truck, Store, Calendar, Clock, XCircle, PartyPopper } from "lucide-react";
import orderService from "../../services/orderService";
import StatusBadge from "../../components/common/StatusBadge";
import OrderTimeline from "../../components/common/OrderTimeline";
import LoadingScreen from "../../components/common/LoadingScreen";
import { formatPKR } from "../../utils/priceCalculator";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import useConfirm from "../../hooks/useConfirm";

const OrderDetails = () => {
  const { orderNumber } = useParams();
  useDocumentTitle(orderNumber);
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    orderService
      .getByNumber(orderNumber)
      .then(({ order: o }) => setOrder(o))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(load, [orderNumber]);

  const handleCancel = async () => {
    const { confirmed } = await confirm({
      title: "Cancel this order?",
      message: "The bakery will be notified. This can't be undone.",
      confirmLabel: "Yes, cancel it",
      cancelLabel: "No, keep it",
      danger: true,
    });
    if (!confirmed) return;
    setCancelling(true);
    try {
      await orderService.cancel(order._id, "Cancelled by customer");
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-5xl">🍰</p>
        <h1 className="mt-4 font-display text-xl font-semibold text-berry-500">Order not found</h1>
        <Link to="/my-orders" className="btn-primary mt-6 inline-flex">
          Back to My Orders
        </Link>
      </div>
    );
  }

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const opts = order.selectedOptions || {};

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      {confirmDialog}
      {location.state?.justPlaced && (
        <div className="mb-6 flex items-center gap-2 rounded-xl2 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          <PartyPopper className="h-4 w-4 shrink-0" />
          Order received! We'll review your payment shortly.
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-mauve-400">{order.orderNumber}</p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold text-berry-500">
            {order.productNameSnapshot}
          </h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="card mt-6 p-5">
        <OrderTimeline status={order.status} fulfillmentType={order.fulfillmentType} />
      </div>

      <div className="card mt-4 space-y-2 p-5 text-sm">
        <p className="flex items-center gap-2 text-berry-600">
          {order.fulfillmentType === "delivery" ? (
            <Truck className="h-4 w-4 text-rose-400" />
          ) : (
            <Store className="h-4 w-4 text-rose-400" />
          )}
          {order.fulfillmentType === "delivery" ? "Delivery" : "Self-Pickup"}
        </p>
        <p className="flex items-center gap-2 text-berry-600">
          <Calendar className="h-4 w-4 text-mauve-400" />
          {new Date(order.scheduledDate).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p className="flex items-center gap-2 text-berry-600">
          <Clock className="h-4 w-4 text-mauve-400" /> {order.timeSlotLabelSnapshot}
        </p>
        {order.expectedFulfillmentTime && (
          <p className="text-mauve-500">Expected: {order.expectedFulfillmentTime}</p>
        )}
        {order.fulfillmentType === "delivery" && order.deliveryAddress && (
          <p className="text-mauve-500">{order.deliveryAddress.addressLine}</p>
        )}
        {order.fulfillmentType === "pickup" && order.pickupLocationSnapshot && (
          <p className="text-mauve-500">{order.pickupLocationSnapshot.address}</p>
        )}
      </div>

      <div className="card mt-4 space-y-1 p-5 text-sm">
        <h2 className="mb-2 text-sm font-semibold text-berry-600">Order Details</h2>
        {opts.weight && <p className="flex justify-between text-mauve-500"><span>{opts.weight.label}</span><span>{formatPKR(opts.weight.price)}</span></p>}
        {opts.shape && <p className="flex justify-between text-mauve-500"><span>Shape: {opts.shape.label}</span><span>{opts.shape.priceModifier ? `+${formatPKR(opts.shape.priceModifier)}` : "—"}</span></p>}
        {opts.flavor && <p className="flex justify-between text-mauve-500"><span>Flavor: {opts.flavor.label}</span><span>{opts.flavor.priceModifier ? `+${formatPKR(opts.flavor.priceModifier)}` : "—"}</span></p>}
        {opts.filling && <p className="flex justify-between text-mauve-500"><span>Filling: {opts.filling.label}</span><span>{opts.filling.priceModifier ? `+${formatPKR(opts.filling.priceModifier)}` : "—"}</span></p>}
        {(opts.extras || []).map((ex, i) => (
          <p key={i} className="flex justify-between text-mauve-500">
            <span>{ex.groupName}: {ex.label}</span>
            <span>{ex.priceModifier ? `+${formatPKR(ex.priceModifier)}` : "—"}</span>
          </p>
        ))}
        <p className="flex justify-between text-mauve-500"><span>Quantity</span><span>×{order.quantity}</span></p>
        <p className="flex justify-between text-mauve-500"><span>Delivery</span><span>{formatPKR(order.deliveryCharge)}</span></p>
        <div className="mt-2 flex justify-between border-t border-berry-500/8 pt-2 font-semibold text-berry-600">
          <span>Total</span>
          <span>{formatPKR(order.totalAmount)}</span>
        </div>
      </div>

      <div className="card mt-4 p-5 text-sm">
        <h2 className="mb-2 text-sm font-semibold text-berry-600">Payment</h2>
        <p className="flex justify-between text-mauve-500">
          <span>Method</span>
          <span>{order.paymentMethod === "online" ? "Online" : "Cash"}</span>
        </p>
        <p className="mt-2 flex items-center justify-between">
          <span className="text-mauve-500">Status</span>
          <StatusBadge status={order.paymentStatus} />
        </p>
      </div>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="btn-secondary touch-target mt-6 flex w-full items-center justify-center gap-2 !border-red-200 !text-red-500 hover:!bg-red-50"
        >
          <XCircle className="h-4 w-4" /> {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
};

export default OrderDetails;
