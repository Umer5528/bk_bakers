import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import ToggleSwitch from "../../components/admin/ToggleSwitch";
import LoadingScreen from "../../components/common/LoadingScreen";

const Card = ({ title, subtitle, children }) => (
  <section className="card-flat p-5 sm:p-6">
    <h3 className="font-display text-xl font-semibold text-berry-500">{title}</h3>
    {subtitle && <p className="mt-0.5 text-sm text-mauve-500">{subtitle}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.getSettings().then(({ settings: s }) => setSettings(s)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const set = (path, value) =>
    setSettings((s) => {
      const next = structuredClone(s);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings({
        businessName: settings.businessName,
        slogan: settings.slogan,
        phone: settings.phone,
        whatsapp: settings.whatsapp,
        email: settings.email,
        aboutText: settings.aboutText,
        minAdvanceNoticeHours: settings.minAdvanceNoticeHours,
        sameDayCutoffTime: settings.sameDayCutoffTime,
        maxOrdersPerDay: settings.maxOrdersPerDay,
        delivery: JSON.stringify(settings.delivery),
        pickup: JSON.stringify(settings.pickup),
      });
      toast.success("Your settings have been saved");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return <LoadingScreen />;

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-5 pb-20">
      <Card title="Your shop" subtitle="Shown across your website.">
        <FormField label="Shop name" htmlFor="s-name"><input id="s-name" className="input-field" value={settings.businessName} onChange={(e) => set(["businessName"], e.target.value)} /></FormField>
        <FormField label="Slogan" optional htmlFor="s-slogan"><input id="s-slogan" className="input-field" value={settings.slogan} onChange={(e) => set(["slogan"], e.target.value)} /></FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Phone number" htmlFor="s-phone"><input id="s-phone" className="input-field" placeholder="e.g. 0300 1234567" value={settings.phone} onChange={(e) => set(["phone"], e.target.value)} /></FormField>
          <FormField label="WhatsApp number" optional htmlFor="s-wa" hint="Customers tap a floating WhatsApp button to message this number. Include the country code if you're outside Pakistan, e.g. +44 7911 123456 — otherwise a number starting with 0 is assumed Pakistani.">
          <input id="s-wa" className="input-field" placeholder="e.g. 0300 1234567" value={settings.whatsapp} onChange={(e) => set(["whatsapp"], e.target.value)} />
        </FormField>
        </div>
        <FormField label="Email" optional htmlFor="s-email"><input id="s-email" type="email" className="input-field" value={settings.email} onChange={(e) => set(["email"], e.target.value)} /></FormField>
        <FormField label="About your shop" optional htmlFor="s-about" hint="A short, friendly paragraph shown on your website.">
          <textarea id="s-about" rows={3} className="input-field" value={settings.aboutText} onChange={(e) => set(["aboutText"], e.target.value)} />
        </FormField>
      </Card>

      <Card title="Delivery">
        <ToggleSwitch checked={settings.delivery.enabled} onChange={(v) => set(["delivery", "enabled"], v)} label="I offer delivery" onText="Yes" offText="No" />
        {settings.delivery.enabled && (
          <>
            <FormField label="Delivery charge (Rs.)" htmlFor="s-fee" hint="Added to the customer's total. Use 0 for free delivery.">
              <input id="s-fee" type="number" inputMode="numeric" min="0" className="input-field sm:w-48" value={settings.delivery.defaultFee} onChange={(e) => set(["delivery", "defaultFee"], Number(e.target.value))} />
            </FormField>
            <FormField label="A note for delivery customers" optional htmlFor="s-dnote">
              <textarea id="s-dnote" rows={2} className="input-field" placeholder="e.g. Please be available at the delivery address during your chosen time." value={settings.delivery.instructions} onChange={(e) => set(["delivery", "instructions"], e.target.value)} />
            </FormField>
          </>
        )}
      </Card>

      <Card title="Pickup">
        <ToggleSwitch checked={settings.pickup.enabled} onChange={(v) => set(["pickup", "enabled"], v)} label="I offer pickup" onText="Yes" offText="No" />
        {settings.pickup.enabled && (
          <>
            <FormField label="Pickup address" htmlFor="s-addr"><input id="s-addr" className="input-field" placeholder="e.g. Shop 12, Bakers Lane, Kohat" value={settings.pickup.address} onChange={(e) => set(["pickup", "address"], e.target.value)} /></FormField>
            <FormField label="Pickup hours" htmlFor="s-hours"><input id="s-hours" className="input-field" placeholder="e.g. 10:00 AM – 8:00 PM, daily" value={settings.pickup.hours} onChange={(e) => set(["pickup", "hours"], e.target.value)} /></FormField>
            <FormField label="Contact number for pickup" optional htmlFor="s-pcontact"><input id="s-pcontact" className="input-field" value={settings.pickup.contactNumber} onChange={(e) => set(["pickup", "contactNumber"], e.target.value)} /></FormField>
            <FormField label="A note for pickup customers" optional htmlFor="s-pnote"><textarea id="s-pnote" rows={2} className="input-field" placeholder="e.g. Please bring your order number." value={settings.pickup.instructions} onChange={(e) => set(["pickup", "instructions"], e.target.value)} /></FormField>
          </>
        )}
      </Card>

      <Card title="Order timing" subtitle="Controls what dates and times customers are allowed to choose.">
        <FormField label="How much notice do you need?" htmlFor="s-notice" hint="Customers can't book sooner than this, in hours. 24 means at least a day ahead.">
          <input id="s-notice" type="number" inputMode="numeric" min="0" className="input-field sm:w-48" value={settings.minAdvanceNoticeHours} onChange={(e) => set(["minAdvanceNoticeHours"], Number(e.target.value))} />
        </FormField>
        <FormField label="Stop taking same-day orders after…" optional htmlFor="s-cutoff" hint="Leave empty to always allow same-day orders (if there's enough notice).">
          <input id="s-cutoff" type="time" className="input-field sm:w-48" value={settings.sameDayCutoffTime || ""} onChange={(e) => set(["sameDayCutoffTime"], e.target.value)} />
        </FormField>
        <FormField label="Most orders you can handle in one day" htmlFor="s-max" hint="Once this many orders are booked for a date, it closes automatically.">
          <input id="s-max" type="number" inputMode="numeric" min="1" className="input-field sm:w-48" value={settings.maxOrdersPerDay} onChange={(e) => set(["maxOrdersPerDay"], Number(e.target.value))} />
        </FormField>
      </Card>

      <div className="sticky bottom-4">
        <button type="submit" disabled={saving} className="btn-primary touch-target w-full shadow-lift">
          {saving ? "Saving…" : "Save all settings"}
        </button>
      </div>
    </form>
  );
};

export default AdminSettings;
