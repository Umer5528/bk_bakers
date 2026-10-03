import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useConfirm from "../../hooks/useConfirm";
import { slotLabel } from "../../utils/friendly";

const AUDIENCES = [
  { key: "both", label: "Delivery and pickup", types: ["delivery", "pickup"] },
  { key: "delivery", label: "Delivery only", types: ["delivery"] },
  { key: "pickup", label: "Pickup only", types: ["pickup"] },
];
const audienceOf = (types) => AUDIENCES.find((a) => a.types.length === types.length && a.types.every((t) => types.includes(t))) || AUDIENCES[0];

const emptyForm = { startTime: "10:00", endTime: "12:00", capacity: "", audience: "both" };

const AdminTimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    adminService.getTimeSlots().then(({ slots: list }) => setSlots(list)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const startEdit = (slot) => {
    setForm(slot === "new" ? emptyForm : { startTime: slot.startTime, endTime: slot.endTime, capacity: slot.capacity, audience: audienceOf(slot.fulfillmentTypes).key });
    setEditing(slot);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.startTime || !form.endTime) return toast.error("Please choose a start and end time.");
    if (form.startTime >= form.endTime) return toast.error("The end time must be later than the start time.");
    if (!form.capacity || Number(form.capacity) < 1) return toast.error("Please say how many orders you can take in this time (at least 1).");
    setSaving(true);
    try {
      const payload = {
        label: slotLabel(form.startTime, form.endTime), // written for her — no typing needed
        startTime: form.startTime,
        endTime: form.endTime,
        capacity: Number(form.capacity),
        fulfillmentTypes: AUDIENCES.find((a) => a.key === form.audience).types,
      };
      if (editing === "new") {
        await adminService.createTimeSlot({ ...payload, displayOrder: slots.length + 1 });
        toast.success("Time added 🎉");
      } else {
        await adminService.updateTimeSlot(editing._id, payload);
        toast.success("Changes saved");
      }
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (slot) => {
    try {
      await adminService.updateTimeSlot(slot._id, { isActive: !slot.isActive });
      toast.success(slot.isActive ? "Customers can't pick this time now" : "Customers can pick this time again");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (slot) => {
    const { confirmed } = await confirm({
      title: `Delete ${slot.label}?`,
      message: "Customers won't be able to choose it any more. Orders already booked for this time are not affected.",
      confirmLabel: "Yes, delete it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.deleteTimeSlot(slot._id);
      toast.success("Time deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (editing) {
    return (
      <form onSubmit={handleSave} className="mx-auto max-w-xl space-y-5">
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-mauve-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-display text-2xl font-semibold text-berry-500">{editing === "new" ? "Add a time window" : `Edit ${editing.label}`}</h2>

        <div className="card-flat space-y-4 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="From" htmlFor="ts-start"><input id="ts-start" type="time" className="input-field" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} /></FormField>
            <FormField label="Until" htmlFor="ts-end"><input id="ts-end" type="time" className="input-field" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} /></FormField>
          </div>
          {form.startTime && form.endTime && form.startTime < form.endTime && (
            <p className="rounded-xl bg-blush-50 px-4 py-2.5 text-sm text-berry-600">
              Customers will see: <strong>{slotLabel(form.startTime, form.endTime)}</strong>
            </p>
          )}
          <FormField label="How many orders can you take in this time?" required hint="When this many orders are booked, customers can't pick it any more.">
            <input type="number" inputMode="numeric" min="1" className="input-field sm:w-40" placeholder="e.g. 3" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
          </FormField>
          <FormField label="This time is for">
            <div className="grid gap-2 sm:grid-cols-3">
              {AUDIENCES.map((a) => (
                <button key={a.key} type="button" onClick={() => setForm((f) => ({ ...f, audience: a.key }))}
                  className={`touch-target rounded-xl2 border-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.audience === a.key ? "border-rose-500 bg-blush-50 text-berry-600" : "border-berry-500/10 bg-white text-mauve-500 hover:border-rose-300"
                  }`}>
                  {a.label}
                </button>
              ))}
            </div>
          </FormField>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setEditing(null)} className="btn-secondary touch-target">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary touch-target flex-1">{saving ? "Saving…" : editing === "new" ? "Add this time" : "Save changes"}</button>
        </div>
      </form>
    );
  }

  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="mx-auto max-w-3xl">
      {confirmDialog}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-[15px] text-mauve-500">
          These are the time windows customers choose from when they order — for example “10:00 AM – 12:00 PM”.
        </p>
        <button onClick={() => startEdit("new")} className="btn-primary touch-target"><Plus className="h-4 w-4" /> Add a time</button>
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : sorted.length === 0 ? (
          <EmptyState icon="🕒" title="No times set up yet" description="Without at least one time window, customers can't finish an order. Add the times you're available."
            action={<button onClick={() => startEdit("new")} className="btn-primary"><Plus className="h-4 w-4" /> Add my first time</button>} />
        ) : (
          sorted.map((slot) => (
            <div key={slot._id} className={`card-flat flex flex-wrap items-center gap-3 p-4 ${slot.isActive ? "" : "opacity-70"}`}>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-berry-600">{slot.label}</p>
                <p className="text-sm text-mauve-500">{audienceOf(slot.fulfillmentTypes).label} · up to {slot.capacity} order{slot.capacity === 1 ? "" : "s"}</p>
              </div>
              <button onClick={() => toggleActive(slot)} className="touch-target flex items-center gap-2 rounded-full px-2 text-sm font-medium" aria-label={slot.isActive ? "Stop offering this time" : "Offer this time"}>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${slot.isActive ? "bg-rose-500" : "bg-mauve-300"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${slot.isActive ? "left-[22px]" : "left-0.5"}`} />
                </span>
                <span className={slot.isActive ? "text-rose-600" : "text-mauve-400"}>{slot.isActive ? "Offered" : "Paused"}</span>
              </button>
              <div className="flex">
                <button onClick={() => startEdit(slot)} className="btn-icon touch-target" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(slot)} className="btn-icon touch-target hover:!text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTimeSlots;
