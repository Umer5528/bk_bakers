import { CreditCard, Banknote } from "lucide-react";

const PaymentMethodCard = ({ value, onChange, onlineEnabled, cashEnabled }) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      disabled={!onlineEnabled}
      onClick={() => onChange("online")}
      className={`touch-target flex flex-col items-center gap-2 rounded-xl2 border-2 py-4 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
        value === "online" ? "border-rose-500 bg-blush-50 shadow-soft" : "border-berry-500/10 bg-white hover:border-rose-300"
      }`}
    >
      <CreditCard className="h-6 w-6 text-rose-500" />
      <span className="text-sm font-semibold text-berry-600">Pay Online</span>
    </button>
    <button
      type="button"
      disabled={!cashEnabled}
      onClick={() => onChange("cash")}
      className={`touch-target flex flex-col items-center gap-2 rounded-xl2 border-2 py-4 text-center transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${
        value === "cash" ? "border-rose-500 bg-blush-50 shadow-soft" : "border-berry-500/10 bg-white hover:border-rose-300"
      }`}
    >
      <Banknote className="h-6 w-6 text-rose-500" />
      <span className="text-sm font-semibold text-berry-600">Pay By Cash</span>
    </button>
  </div>
);

export default PaymentMethodCard;
