const STYLES = {
  // order status
  pending: "bg-cream-200 text-mauve-500",
  confirmed: "bg-blush-100 text-rose-600",
  preparing: "bg-peach-100 text-berry-600",
  ready: "bg-amber-100 text-amber-700",
  out_for_delivery: "bg-blue-100 text-blue-700",
  ready_for_pickup: "bg-amber-100 text-amber-700",
  picked_up: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
  // payment status
  pending_verification: "bg-amber-100 text-amber-700",
  verified: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  ready_for_pickup: "Ready for Pickup",
  picked_up: "Picked Up",
  completed: "Completed",
  cancelled: "Cancelled",
  pending_verification: "Pending Verification",
  verified: "Verified",
  rejected: "Rejected",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
      STYLES[status] || "bg-cream-200 text-mauve-500"
    }`}
  >
    {LABELS[status] || status}
  </span>
);

export default StatusBadge;
