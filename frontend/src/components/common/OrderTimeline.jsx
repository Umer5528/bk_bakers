import { Check } from "lucide-react";

const DELIVERY_FLOW = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "completed", label: "Completed" },
];

const PICKUP_FLOW = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready_for_pickup", label: "Ready for Pickup" },
  { key: "picked_up", label: "Picked Up" },
  { key: "completed", label: "Completed" },
];

const OrderTimeline = ({ status, fulfillmentType }) => {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl2 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
        This order was cancelled.
      </div>
    );
  }

  const flow = fulfillmentType === "delivery" ? DELIVERY_FLOW : PICKUP_FLOW;
  const currentIndex = flow.findIndex((s) => s.key === status);

  return (
    <div className="scrollbar-none flex items-center gap-1 overflow-x-auto pb-1">
      {flow.map((step, i) => {
        const done = i <= currentIndex;
        return (
          <div key={step.key} className="flex shrink-0 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  done ? "bg-rose-500 text-white" : "bg-cream-200 text-mauve-400"
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`w-16 text-center text-[10px] ${done ? "text-berry-600" : "text-mauve-400"}`}>
                {step.label}
              </span>
            </div>
            {i < flow.length - 1 && (
              <div className={`mx-1 h-0.5 w-6 rounded-full ${i < currentIndex ? "bg-rose-500" : "bg-cream-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrderTimeline;
