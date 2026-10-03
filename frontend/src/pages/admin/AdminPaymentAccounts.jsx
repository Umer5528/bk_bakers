import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import ToggleSwitch from "../../components/admin/ToggleSwitch";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useConfirm from "../../hooks/useConfirm";

const empty = { provider: "EasyPaisa", accountTitle: "", accountNumber: "", bankName: "", iban: "", instructions: "" };

const AdminPaymentAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, "new" or an account
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    Promise.all([adminService.getPaymentAccounts(), adminService.getSettings()])
      .then(([a, s]) => {
        setAccounts(a.accounts);
        setSettings(s.settings);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const setMethod = async (key, value, message) => {
    const payments = { ...settings.payments, [key]: value };
    setSettings((s) => ({ ...s, payments }));
    try {
      await adminService.updateSettings({ payments });
      toast.success(message);
    } catch (err) {
      toast.error(err.message);
      load();
    }
  };

  const startEdit = (acc) => {
    setForm(acc === "new" ? empty : {
      provider: acc.provider, accountTitle: acc.accountTitle, accountNumber: acc.accountNumber,
      bankName: acc.bankName || "", iban: acc.iban || "", instructions: acc.instructions || "",
    });
    setEditing(acc);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.accountTitle.trim() || !form.accountNumber.trim()) return toast.error("Please fill in the account name and number.");
    setSaving(true);
    try {
      if (editing === "new") {
        await adminService.createPaymentAccount(form);
        toast.success("Account added 🎉");
      } else {
        await adminService.updatePaymentAccount(editing._id, form);
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

  const toggleActive = async (acc) => {
    try {
      await adminService.updatePaymentAccount(acc._id, { isActive: !acc.isActive });
      toast.success(acc.isActive ? "Customers won't see this account any more" : "Customers can now pay into this account");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (acc) => {
    const { confirmed } = await confirm({
      title: `Delete your ${acc.provider} account?`,
      message: "Customers won't be able to choose it any more. Past orders are not affected. To just pause it, use the Showing/Hidden switch instead.",
      confirmLabel: "Yes, delete it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.deletePaymentAccount(acc._id);
      toast.success("Account deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // ---------- Add / edit form ----------
  if (editing) {
    const isBank = form.provider === "Bank";
    return (
      <form onSubmit={handleSave} className="mx-auto max-w-xl space-y-5">
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-mauve-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h2 className="font-display text-2xl font-semibold text-berry-500">
          {editing === "new" ? "Add an account" : `Edit your ${editing.provider} account`}
        </h2>
        <div className="card-flat space-y-4 p-5 sm:p-6">
          <FormField label="Which service?" htmlFor="pa-provider">
            <select id="pa-provider" className="input-field" value={form.provider} onChange={setField("provider")}>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Bank">Bank account</option>
              <option value="Other">Something else</option>
            </select>
          </FormField>
          <FormField label="Name on the account" required hint="Customers will see this so they know they're paying the right person.">
            <input className="input-field" placeholder="e.g. Ayesha Khan" value={form.accountTitle} onChange={setField("accountTitle")} />
          </FormField>
          <FormField label={isBank ? "Account number" : "Mobile account number"} required>
            <input className="input-field" inputMode="numeric" placeholder={isBank ? "e.g. 01234567890123" : "e.g. 0300 1234567"} value={form.accountNumber} onChange={setField("accountNumber")} />
          </FormField>
          {isBank && (
            <>
              <FormField label="Bank name">
                <input className="input-field" placeholder="e.g. Meezan Bank" value={form.bankName} onChange={setField("bankName")} />
              </FormField>
              <FormField label="IBAN" optional>
                <input className="input-field" placeholder="e.g. PK00MEZN0001234567890123" value={form.iban} onChange={setField("iban")} />
              </FormField>
            </>
          )}
          <FormField label="A note for customers" optional hint="Shown when they choose this account.">
            <textarea rows={2} className="input-field" placeholder="e.g. Please send the exact amount and upload a screenshot of the receipt." value={form.instructions} onChange={setField("instructions")} />
          </FormField>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => setEditing(null)} className="btn-secondary touch-target">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary touch-target flex-1">{saving ? "Saving…" : editing === "new" ? "Add this account" : "Save changes"}</button>
        </div>
      </form>
    );
  }

  // ---------- Main page ----------
  const activeAccounts = accounts.filter((a) => a.isActive).length;
  const onlineButNoAccount = settings?.payments?.onlineEnabled && activeAccounts === 0;
  const nothingOn = settings && !settings.payments.onlineEnabled && !settings.payments.cashEnabled;

  return (
    <div className="mx-auto max-w-3xl">
      {confirmDialog}
      <p className="text-[15px] text-mauve-500">Choose how customers can pay you, and where they should send their money.</p>

      {loading || !settings ? (
        <div className="mt-5 space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
      ) : (
        <>
          <h3 className="mb-3 mt-6 font-display text-xl font-semibold text-berry-500">1. Ways to pay</h3>
          <div className="space-y-3">
            <ToggleSwitch
              checked={settings.payments.onlineEnabled}
              onChange={(v) => setMethod("onlineEnabled", v, v ? "Online payment is now on" : "Online payment is now off")}
              label="Online payment"
              description="Customers send money to your EasyPaisa, JazzCash or bank account, then upload a screenshot of the receipt."
              onText="Accepting" offText="Not accepting"
            />
            <ToggleSwitch
              checked={settings.payments.cashEnabled}
              onChange={(v) => setMethod("cashEnabled", v, v ? "Cash payment is now on" : "Cash payment is now off")}
              label="Cash"
              description="Customers pay you in cash when they receive or collect their order."
              onText="Accepting" offText="Not accepting"
            />
          </div>

          {(onlineButNoAccount || nothingOn) && (
            <div className="mt-4 flex gap-3 rounded-xl2 border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                {nothingOn
                  ? "Both payment methods are off, so customers can't finish an order. Turn at least one on."
                  : "Online payment is on, but you haven't added an account yet — customers won't know where to send their money. Add one below."}
              </p>
            </div>
          )}

          <div className="mb-3 mt-8 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl font-semibold text-berry-500">2. Where customers send money</h3>
            <button onClick={() => startEdit("new")} className="btn-primary touch-target"><Plus className="h-4 w-4" /> Add an account</button>
          </div>

          {accounts.length === 0 ? (
            <EmptyState icon="💳" title="No accounts yet" description="Add your EasyPaisa, JazzCash or bank account so customers can pay you online."
              action={<button onClick={() => startEdit("new")} className="btn-primary"><Plus className="h-4 w-4" /> Add my first account</button>} />
          ) : (
            <div className="space-y-2.5">
              {accounts.map((acc) => (
                <div key={acc._id} className={`card-flat flex flex-wrap items-center gap-3 p-4 ${acc.isActive ? "" : "opacity-70"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-berry-600">{acc.provider === "Bank" ? acc.bankName || "Bank account" : acc.provider}</p>
                    <p className="text-sm text-mauve-500">{acc.accountTitle} · {acc.accountNumber}</p>
                  </div>
                  <button onClick={() => toggleActive(acc)} className="touch-target flex items-center gap-2 rounded-full px-2 text-sm font-medium" aria-label={acc.isActive ? "Stop showing to customers" : "Show to customers"}>
                    <span className={`relative h-6 w-11 rounded-full transition-colors ${acc.isActive ? "bg-rose-500" : "bg-mauve-300"}`}>
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${acc.isActive ? "left-[22px]" : "left-0.5"}`} />
                    </span>
                    <span className={acc.isActive ? "text-rose-600" : "text-mauve-400"}>{acc.isActive ? "Showing" : "Hidden"}</span>
                  </button>
                  <div className="flex">
                    <button onClick={() => startEdit(acc)} className="btn-icon touch-target" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(acc)} className="btn-icon touch-target hover:!text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPaymentAccounts;
