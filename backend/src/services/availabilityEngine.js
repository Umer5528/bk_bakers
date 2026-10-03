import TimeSlot from "../models/TimeSlot.js";
import BlockedDate from "../models/BlockedDate.js";
import Order from "../models/Order.js";
import BusinessSettings from "../models/BusinessSettings.js";
import ApiError from "../utils/ApiError.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const toHHMM = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

// The Smart Availability Engine (spec section 32). Considers: product
// preparation time, fulfillment-type availability, product-specific vs.
// global time slots, per-slot and per-day capacity, blocked dates/
// holidays, the same-day cutoff time, and the minimum advance notice —
// then returns only dates/slots that can actually be fulfilled. The
// frontend never has to (and never should) work this logic out itself.
export const getAvailability = async ({ product, fulfillmentType }) => {
  if (!["delivery", "pickup"].includes(fulfillmentType)) {
    throw new ApiError(400, "fulfillmentType must be 'delivery' or 'pickup'");
  }

  const settings = await BusinessSettings.getSingleton();

  if (fulfillmentType === "delivery" && !settings.delivery.enabled) {
    throw new ApiError(400, "Delivery is currently unavailable");
  }
  if (fulfillmentType === "pickup" && !settings.pickup.enabled) {
    throw new ApiError(400, "Self-pickup is currently unavailable");
  }

  // --- Which slots apply to this product? ---
  const slotFilter = { isActive: true, fulfillmentTypes: fulfillmentType };
  if (product.customTimeSlotIds?.length) {
    slotFilter._id = { $in: product.customTimeSlotIds };
  }
  const slots = await TimeSlot.find(slotFilter).sort({ displayOrder: 1, startTime: 1 });

  if (!slots.length) {
    return { earliestDate: null, horizonDays: settings.schedulingHorizonDays, days: [] };
  }

  // --- Earliest fulfillable moment, from prep time + advance notice ---
  const now = new Date();
  const advanceHours = Math.max(
    product.preparationTimeHours || 0,
    settings.minAdvanceNoticeHours || 0
  );
  const earliestMoment = new Date(now.getTime() + advanceHours * 60 * 60 * 1000);

  // --- Same-day cutoff: if "now" is already past the cutoff time,
  //     today's slots are dropped entirely regardless of prep time. ---
  let cutoffPassedToday = false;
  if (settings.sameDayCutoffTime) {
    const [ch, cm] = settings.sameDayCutoffTime.split(":").map(Number);
    const cutoffToday = new Date(now);
    cutoffToday.setHours(ch, cm, 0, 0);
    cutoffPassedToday = now > cutoffToday;
  }

  // --- Blocked dates / holidays in the horizon window ---
  const horizonStart = startOfDay(now);
  const horizonEnd = startOfDay(new Date(now.getTime() + settings.schedulingHorizonDays * DAY_MS));
  const blocked = await BlockedDate.find({
    date: { $gte: horizonStart, $lte: horizonEnd },
  });
  const blockedMap = new Map(blocked.map((b) => [startOfDay(b.date).getTime(), b]));

  // --- Existing bookings in the window, grouped by date+slot and by date ---
  const existingOrders = await Order.find({
    scheduledDate: { $gte: horizonStart, $lte: horizonEnd },
    status: { $ne: "cancelled" },
  }).select("scheduledDate timeSlot");

  const countByDateSlot = new Map(); // `${dateMs}_${slotId}` -> count
  const countByDate = new Map(); // dateMs -> count
  for (const order of existingOrders) {
    const dateMs = startOfDay(order.scheduledDate).getTime();
    countByDate.set(dateMs, (countByDate.get(dateMs) || 0) + 1);
    if (order.timeSlot) {
      const key = `${dateMs}_${order.timeSlot}`;
      countByDateSlot.set(key, (countByDateSlot.get(key) || 0) + 1);
    }
  }

  const days = [];

  for (let i = 0; i < settings.schedulingHorizonDays; i++) {
    const date = startOfDay(new Date(horizonStart.getTime() + i * DAY_MS));
    const dateMs = date.getTime();
    const isToday = dateMs === startOfDay(now).getTime();

    const blockedEntry = blockedMap.get(dateMs);
    if (blockedEntry) {
      days.push({
        date: date.toISOString().slice(0, 10),
        status: "closed",
        reason: blockedEntry.reason || (blockedEntry.isHoliday ? "Holiday" : "Unavailable"),
        slots: [],
      });
      continue;
    }

    if (isToday && cutoffPassedToday) {
      days.push({ date: date.toISOString().slice(0, 10), status: "closed", reason: "Past today's order cutoff", slots: [] });
      continue;
    }

    const dayOrderCount = countByDate.get(dateMs) || 0;
    if (dayOrderCount >= settings.maxOrdersPerDay) {
      days.push({ date: date.toISOString().slice(0, 10), status: "full", reason: "Fully booked", slots: [] });
      continue;
    }

    const daySlots = [];
    for (const slot of slots) {
      // Does this slot's start time clear the earliest-fulfillable moment?
      const [sh, sm] = slot.startTime.split(":").map(Number);
      const slotMoment = new Date(date);
      slotMoment.setHours(sh, sm, 0, 0);
      if (slotMoment < earliestMoment) continue;

      const booked = countByDateSlot.get(`${dateMs}_${slot._id}`) || 0;
      const remaining = slot.capacity - booked;
      if (remaining <= 0) {
        daySlots.push({
          id: slot._id,
          label: slot.label,
          startTime: slot.startTime,
          endTime: slot.endTime,
          remaining: 0,
          status: "full",
        });
        continue;
      }

      daySlots.push({
        id: slot._id,
        label: slot.label,
        startTime: slot.startTime,
        endTime: slot.endTime,
        remaining,
        status: remaining <= Math.max(1, Math.ceil(slot.capacity * 0.3)) ? "limited" : "available",
      });
    }

    if (!daySlots.length) {
      days.push({ date: date.toISOString().slice(0, 10), status: "closed", reason: "No slots available", slots: [] });
      continue;
    }

    const anyAvailable = daySlots.some((s) => s.status !== "full");
    days.push({
      date: date.toISOString().slice(0, 10),
      status: anyAvailable ? "available" : "full",
      slots: daySlots,
    });
  }

  return {
    earliestDate: earliestMoment.toISOString().slice(0, 10),
    horizonDays: settings.schedulingHorizonDays,
    days,
  };
};

export default getAvailability;
