import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Printer, CheckCircle2, XCircle, Phone, MessageCircle, Lightbulb, Maximize2 } from "lucide-react";
import adminService from "../../services/adminService";
import StatusBadge from "../../components/common/StatusBadge";
import OrderTimeline from "../../components/common/OrderTimeline";
import LoadingScreen from "../../components/common/LoadingScreen";
import FormField from "../../components/admin/FormField";
import useConfirm from "../../hooks/useConfirm";
import { formatPKR } from "../../utils/priceCalculator";
import { friendlyDate, telLink, whatsappLink, STATUS_WORDS } from "../../utils/friendly";

const DELIVERY_FLOW = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed"];
const PICKUP_FLOW = ["pending", "confirmed", "preparing", "ready_for_pickup", "picked_up", "completed"];

// What the big button says for each step, in everyday words.
const BUTTON_WORDS = {
  confirmed: "Confirm this order",
  preparing: "I've started preparing it",
  ready: "It's ready",
  out_for_delivery: "It's out for delivery",
  ready_for_pickup: "It's ready for pickup",
  picked_up: "Customer picked it up",
  completed: "Mark as completed",
};

const AdminOrderDetail = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [expectedTime, setExpectedTime] = useState("");
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    adminService
      .getOrder(orderNumber)
      .then(({ order: o }) => {
        setOrder(o);
        // Pre-fill with the time the customer already picked.
        setExpectedTime(o.expectedFulfillmentTime || o.timeSlotLabelSnapshot || "");
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };
  useEffect(load, [orderNumber]);

  if (loading) return <LoadingScreen />;
  if (!order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-4xl">🔎</p>
        <p className="mt-3 text-berry-600">We couldn't find that order.</p>
        <Link to="/admin/orders" className="btn-primary mt-5 inline-flex">Back to orders</Link>
      </div>
    );
  }

  const flow = order.fulfillmentType === "delivery" ? DELIVERY_FLOW : PICKUP_FLOW;
  const nextStatus = flow[flow.indexOf(order.status) + 1] || "";
  const isOnline = order.paymentMethod === "online";
  const cancelled = order.status === "cancelled";
  const done = order.status === "completed";
  const needsPaymentCheck = isOnline && order.paymentStatus === "pending_verification";
  const paymentRejected = isOnline && order.paymentStatus === "rejected";
  const blockedByPayment = nextStatus === "confirmed" && isOnline && order.paymentStatus !== "verified";
  const opts = order.selectedOptions || {};
  const customer = order.customer || {};
  const contactNumber = customer.whatsapp || customer.phone;

  const run = async (fn, successMessage) => {
    setBusy(true);
    try {
      await fn();
      toast.success(successMessage);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handlePayment = async (action) => {
    const verify = action === "verify";
    const { confirmed } = await confirm({
      title: verify ? "Payment received?" : "Reject this payment?",
      message: verify
        ? "Only tap yes if you can see the money in your account. The customer will be told their payment is confirmed."
        : "The customer will be told their payment couldn't be verified and asked to contact you.",
      confirmLabel: verify ? "Yes, payment received" : "Yes, reject it",
      cancelLabel: "Go back",
      danger: !verify,
    });
    if (!confirmed) return;
    run(() => adminService.verifyPayment(order._id, action), verify ? "Payment marked as received" : "Payment rejected");
  };

  const handleAdvance = async () => {
    const { confirmed } = await confirm({
      title: `${BUTTON_WORDS[nextStatus]}?`,
      message: "The customer will see this update on their order page. You can't go back a step afterwards.",
      confirmLabel: "Yes, do it",
    });
    if (!confirmed) return;
    run(
      () => adminService.updateOrderStatus(order._id, nextStatus, nextStatus === "confirmed" ? expectedTime || undefined : undefined),
      "Order updated"
    );
  };

  const handleCancel = async () => {
    const { confirmed, reason } = await confirm({
      title: "Cancel this order?",
      message: "The customer will see that the order was cancelled. This can't be undone.",
      confirmLabel: "Yes, cancel the order",
      cancelLabel: "No, keep it",
      danger: true,
      withReason: true,
      reasonLabel: "Why are you cancelling? (optional)",
      reasonPlaceholder: "e.g. We're fully booked that day",
    });
    if (!confirmed) return;
    run(() => adminService.cancelOrder(order._id, reason || "Cancelled by the bakery"), "Order cancelled");
  };

  // ---- The single "what to do now" message ----
  let guide;
  if (cancelled) guide = { tone: "gray", title: "This order was cancelled.", text: order.cancellation?.reason ? `Reason: ${order.cancellation.reason}` : "" };
  else if (done) guide = { tone: "green", title: "All done — this order is complete. 🎉", text: "" };
  else if (needsPaymentCheck)
    guide = { tone: "amber", title: "Step 1: Check the payment", text: "The customer uploaded a payment receipt (see below). Look at your account — if the money is there, tap “Payment received”." };
  else if (paymentRejected)
    guide = { tone: "red", title: "You rejected this payment", text: "This order can't go ahead unless the customer pays. You can contact them, or cancel the order." };
  else if (nextStatus === "confirmed")
    guide = { tone: "rose", title: "Next: confirm the order", text: "Tell the customer when it will be ready (already filled in below), then confirm." };
  else if (nextStatus)
    guide = { tone: "rose", title: `Next: ${BUTTON_WORDS[nextStatus].toLowerCase()}`, text: "Tap the button below when it's done, so the customer can follow along." };

  const tone = {
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-700",
    green: "border-green-200 bg-green-50 text-green-700",
    gray: "border-berry-500/10 bg-white text-mauve-500",
    rose: "border-rose-200 bg-blush-50 text-berry-600",
  };

  return (
    <div className="mx-auto max-w-3xl">
      {confirmDialog}

      <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-mauve-500 hover:text-rose-600">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-mauve-400">Order {order.orderNumber}</p>
          <h2 className="font-display text-2xl font-semibold text-berry-500">{order.productNameSnapshot}</h2>
          <p className="mt-1 text-sm text-mauve-500">
            {STATUS_WORDS[order.status] || order.status} · {friendlyDate(order.scheduledDate)}, {order.timeSlotLabelSnapshot}
          </p>
        </div>
        <button onClick={() => window.print()} className="btn-secondary touch-target !px-4 !py-2 text-sm">
          <Printer className="h-4 w-4" /> Print order
        </button>
      </div>

      {/* ---------- What to do now ---------- */}
      {guide && (
        <div className={`mt-5 rounded-xl3 border p-5 ${tone[guide.tone]}`}>
          <p className="flex items-center gap-2 font-semibold">
            <Lightbulb className="h-5 w-5 shrink-0" /> {guide.title}
          </p>
          {guide.text && <p className="mt-1.5 text-sm leading-relaxed opacity-90">{guide.text}</p>}

          {needsPaymentCheck && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => handlePayment("verify")} disabled={busy} className="btn-primary touch-target flex-1">
                <CheckCircle2 className="h-4 w-4" /> Payment received
              </button>
              <button
                onClick={() => handlePayment("reject")}
                disabled={busy}
                className="btn-secondary touch-target flex-1 !border-red-200 !text-red-500 hover:!bg-red-50"
              >
                <XCircle className="h-4 w-4" /> Payment not received
              </button>
            </div>
          )}

          {!needsPaymentCheck && nextStatus && !blockedByPayment && !cancelled && !done && (
            <div className="mt-4">
              {nextStatus === "confirmed" && (
                <FormField
                  label="When will it be ready?"
                  hint="This is what the customer will see. It's already filled in with the time they chose — only change it if needed."
                >
                  <input
                    className="input-field bg-white"
                    value={expectedTime}
                    onChange={(e) => setExpectedTime(e.target.value)}
                    placeholder="e.g. 4:00 PM – 6:00 PM"
                  />
                </FormField>
              )}
              <button onClick={handleAdvance} disabled={busy} className="btn-primary touch-target mt-3 w-full">
                {BUTTON_WORDS[nextStatus]}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- Progress ---------- */}
      <div className="card-flat mt-4 p-5">
        <OrderTimeline status={order.status} fulfillmentType={order.fulfillmentType} />
      </div>

      {/* ---------- Customer ---------- */}
      <div className="card-flat mt-4 p-5 text-sm">
        <h3 className="mb-2 font-semibold text-berry-600">Who ordered</h3>
        <p className="text-base font-medium text-berry-600">{customer.name}</p>
        {customer.phone && <p className="text-mauve-500">Phone: {customer.phone}</p>}
        {customer.whatsapp && <p className="text-mauve-500">WhatsApp: {customer.whatsapp}</p>}
        {contactNumber && (
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={telLink(contactNumber)} className="btn-secondary touch-target !px-4 !py-2 text-sm">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={whatsappLink(contactNumber)} target="_blank" rel="noreferrer" className="btn-secondary touch-target !px-4 !py-2 text-sm">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        )}
      </div>

      {/* ---------- Delivery / pickup ---------- */}
      <div className="card-flat mt-4 p-5 text-sm">
        <h3 className="mb-2 font-semibold text-berry-600">{order.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}</h3>
        <p className="text-base font-medium text-berry-600">
          {friendlyDate(order.scheduledDate)} · {order.timeSlotLabelSnapshot}
        </p>
        {order.fulfillmentType === "delivery" && order.deliveryAddress && (
          <>
            <p className="mt-2 text-mauve-500">Deliver to: {order.deliveryAddress.addressLine}</p>
            {order.deliveryAddress.instructions && <p className="text-mauve-500">Note: {order.deliveryAddress.instructions}</p>}
          </>
        )}
        {order.fulfillmentType === "pickup" && (
          <p className="mt-2 text-mauve-500">The customer will collect it from your shop.</p>
        )}
      </div>

      {/* ---------- What they ordered ---------- */}
      <div className="card-flat mt-4 p-5 text-sm">
        <h3 className="mb-2 font-semibold text-berry-600">What they ordered</h3>
        {opts.weight && <p className="flex justify-between text-mauve-500"><span>Size: {opts.weight.label}</span><span>{formatPKR(opts.weight.price)}</span></p>}
        {opts.shape && <p className="flex justify-between text-mauve-500"><span>Shape: {opts.shape.label}</span><span>{opts.shape.priceModifier ? `+${formatPKR(opts.shape.priceModifier)}` : ""}</span></p>}
        {opts.flavor && <p className="flex justify-between text-mauve-500"><span>Flavor: {opts.flavor.label}</span><span>{opts.flavor.priceModifier ? `+${formatPKR(opts.flavor.priceModifier)}` : ""}</span></p>}
        {opts.filling && <p className="flex justify-between text-mauve-500"><span>Filling: {opts.filling.label}</span><span>{opts.filling.priceModifier ? `+${formatPKR(opts.filling.priceModifier)}` : ""}</span></p>}
        {(opts.extras || []).map((ex, i) => (
          <p key={i} className="flex justify-between text-mauve-500"><span>{ex.groupName}: {ex.label}</span><span>{ex.priceModifier ? `+${formatPKR(ex.priceModifier)}` : ""}</span></p>
        ))}
        <p className="flex justify-between text-mauve-500"><span>How many</span><span>{order.quantity}</span></p>
        <p className="flex justify-between text-mauve-500"><span>Delivery charge</span><span>{formatPKR(order.deliveryCharge)}</span></p>
        {order.customerNotes && (
          <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-amber-800">
            <strong>Customer's note:</strong> {order.customerNotes}
          </p>
        )}
        <div className="mt-3 flex justify-between border-t border-berry-500/8 pt-3 text-base font-semibold text-berry-600">
          <span>Total to receive</span><span>{formatPKR(order.totalAmount)}</span>
        </div>
      </div>

      {/* ---------- Payment ---------- */}
      <div className="card-flat mt-4 p-5 text-sm">
        <h3 className="mb-2 font-semibold text-berry-600">Payment</h3>
        <div className="flex items-center justify-between">
          <span className="text-berry-600">{isOnline ? "Paid online" : "Pays with cash"}</span>
          <StatusBadge status={order.paymentStatus} />
        </div>
        {order.paymentAccount && (
          <p className="mt-1 text-mauve-500">Sent to: {order.paymentAccount.provider} — {order.paymentAccount.accountNumber}</p>
        )}
        {order.paymentReceipt?.url && (
          <a href={order.paymentReceipt.url} target="_blank" rel="noreferrer" className="group relative mt-3 block w-fit">
            <img src={order.paymentReceipt.url} alt="Payment receipt" className="max-h-72 rounded-xl border border-berry-500/10 object-contain" />
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-berry-600 shadow-soft">
              <Maximize2 className="h-3 w-3" /> Tap to see full size
            </span>
          </a>
        )}
      </div>

      {!cancelled && !done && (
        <button onClick={handleCancel} disabled={busy} className="btn-secondary touch-target mt-6 w-full !border-red-200 !text-red-500 hover:!bg-red-50">
          Cancel this order
        </button>
      )}
    </div>
  );
};

export default AdminOrderDetail;
