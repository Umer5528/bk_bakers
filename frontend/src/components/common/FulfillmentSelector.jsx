import { Truck, Store } from "lucide-react";

// The top-level Delivery vs. Self-Pickup choice — deliberately prominent,
// since it changes the entire rest of checkout (address vs. pickup info,
// delivery fee vs. Rs. 0, and which time slots are offered).
const FulfillmentSelector = ({ value, onChange, settings }) => {
  const deliveryEnabled = settings?.delivery?.enabled;
  const pickupEnabled = settings?.pickup?.enabled;

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={!deliveryEnabled}
        onClick={() => onChange("delivery")}
        className={`touch-target flex flex-col items-center gap-2 rounded-xl2 border-2 py-4 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
          value === "delivery"
            ? "border-rose-500 bg-blush-50 shadow-soft"
            : "border-berry-500/10 bg-white hover:border-rose-300"
        }`}
      >
        <Truck className="h-6 w-6 text-rose-500" />
        <span className="text-sm font-semibold text-berry-600">Delivery</span>
      </button>
      <button
        type="button"
        disabled={!pickupEnabled}
        onClick={() => onChange("pickup")}
        className={`touch-target flex flex-col items-center gap-2 rounded-xl2 border-2 py-4 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
          value === "pickup"
            ? "border-rose-500 bg-blush-50 shadow-soft"
            : "border-berry-500/10 bg-white hover:border-rose-300"
        }`}
      >
        <Store className="h-6 w-6 text-rose-500" />
        <span className="text-sm font-semibold text-berry-600">Self-Pickup</span>
      </button>
    </div>
  );
};

export default FulfillmentSelector;
