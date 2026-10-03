// Small helpers that turn technical values into plain words.

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// "Today", "Tomorrow", or "Sat, 3 Oct"
export const friendlyDate = (value) => {
  const date = startOfDay(value);
  const today = startOfDay(new Date());
  const diffDays = Math.round((date - today) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

// "16:00" -> "4:00 PM"
export const to12Hour = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const slotLabel = (start, end) => `${to12Hour(start)} – ${to12Hour(end)}`;

// Plain names for the technical order/payment statuses.
export const STATUS_WORDS = {
  pending: "New",
  confirmed: "Confirmed",
  preparing: "Being prepared",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  ready_for_pickup: "Ready for pickup",
  picked_up: "Picked up",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Phone helpers — turn a saved number into tap-to-call / WhatsApp links.
// Numbers starting with 0 are treated as Pakistani local numbers (+92).
export const digitsOnly = (v = "") => String(v).replace(/\D/g, "");
export const telLink = (v) => `tel:${digitsOnly(v)}`;
export const whatsappLink = (v) => {
  let d = digitsOnly(v);
  if (d.startsWith("0")) d = `92${d.slice(1)}`;
  return `https://wa.me/${d}`;
};
