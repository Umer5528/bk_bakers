import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import adminService from "../../services/adminService";
import EmptyState from "../../components/common/EmptyState";
import Skeleton from "../../components/common/Skeleton";
import useConfirm from "../../hooks/useConfirm";

const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

const AdminAvailability = () => {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => { const d = startOfToday(); d.setDate(1); return d; });
  const [picking, setPicking] = useState(null); // a Date being turned into a day off
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    adminService.getBlockedDates().then(({ dates: list }) => setDates(list)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const byKey = useMemo(() => {
    const m = new Map();
    dates.forEach((d) => m.set(toKey(new Date(d.date)), d));
    return m;
  }, [dates]);

  const today = startOfToday();

  const addDaysOff = async (dateList, why) => {
    setSaving(true);
    try {
      for (const d of dateList) {
        if (!byKey.has(toKey(d))) await adminService.blockDate({ date: toKey(d), reason: why });
      }
      toast.success(dateList.length > 1 ? "Days off added 🎉" : "Day off added");
      setPicking(null); setReason("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const quickTomorrowOff = () => {
    const t = new Date(today); t.setDate(t.getDate() + 1);
    addDaysOff([t], "Day off");
  };

  const removeDay = async (entry) => {
    const { confirmed } = await confirm({
      title: "Open this date again?",
      message: "Customers will be able to order for this date again.",
      confirmLabel: "Yes, open it",
    });
    if (!confirmed) return;
    try {
      await adminService.unblockDate(entry._id);
      toast.success("Date is open again");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ---- Build the calendar grid for the shown month ----
  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const upcoming = dates
    .map((d) => ({ ...d, dateObj: new Date(d.date) }))
    .filter((d) => d.dateObj >= today)
    .sort((a, b) => a.dateObj - b.dateObj);

  return (
    <div className="mx-auto max-w-2xl">
      {confirmDialog}
      <p className="text-[15px] text-mauve-500">
        Tap any date to close it — customers won't be able to order for that day. Tap it again to open it back up.
      </p>

      <button onClick={quickTomorrowOff} disabled={saving} className="btn-secondary touch-target mt-4">
        I'm taking tomorrow off
      </button>

      {/* ---------- Calendar ---------- */}
      <div className="card-flat mt-5 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="btn-icon touch-target" aria-label="Previous month"><ChevronLeft className="h-5 w-5" /></button>
          <p className="font-display text-lg font-semibold text-berry-500">{month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
          <button onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="btn-icon touch-target" aria-label="Next month"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-mauve-400">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;
            const key = toKey(date);
            const off = byKey.get(key);
            const isPast = date < today;
            return (
              <button
                key={key}
                disabled={isPast}
                onClick={() => (off ? removeDay(off) : setPicking(date))}
                className={`touch-target aspect-square rounded-xl text-sm font-medium transition-colors ${
                  isPast ? "text-mauve-300" : off ? "bg-red-100 text-red-600" : "text-berry-600 hover:bg-blush-50"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-mauve-500">
          <span className="h-3 w-3 rounded bg-red-100" /> Closed to orders
        </p>
      </div>

      {/* ---------- Confirm a new day off, with an optional reason ---------- */}
      {picking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-berry-800/50" onClick={() => setPicking(null)} />
          <div className="pb-safe relative w-full max-w-md rounded-t-xl3 bg-white p-6 shadow-lift sm:rounded-xl3">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl font-semibold text-berry-500">
                Close {picking.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}?
              </h3>
              <button onClick={() => setPicking(null)} className="btn-icon touch-target" aria-label="Cancel"><X className="h-5 w-5" /></button>
            </div>
            <p className="mt-1 text-sm text-mauve-500">Customers won't be able to choose this date.</p>
            <label className="form-label mt-4">Why? (optional)</label>
            <input className="input-field" placeholder="e.g. Eid holiday, fully booked, day off" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
            <button onClick={() => addDaysOff([picking], reason || "Day off")} disabled={saving} className="btn-primary touch-target mt-4 w-full">
              {saving ? "Saving…" : "Yes, close this date"}
            </button>
          </div>
        </div>
      )}

      {/* ---------- Upcoming list, for a quick read ---------- */}
      <h3 className="mb-3 mt-8 font-display text-xl font-semibold text-berry-500">Upcoming days off</h3>
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : upcoming.length === 0 ? (
        <EmptyState icon="📅" title="No upcoming days off" description="Every date from today onward is open for orders." />
      ) : (
        <div className="space-y-2">
          {upcoming.map((d) => (
            <div key={d._id} className="card-flat flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-berry-600">{d.dateObj.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
                <p className="text-sm text-mauve-500">{d.reason || "Day off"}</p>
              </div>
              <button onClick={() => removeDay(d)} className="btn-secondary touch-target !px-4 !py-2 text-sm">Open this date</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAvailability;
