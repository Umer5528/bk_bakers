import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Phone, MessageCircle, Calendar, Truck, Store } from "lucide-react";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useConfirm from "../../hooks/useConfirm";
import { friendlyDate, telLink, whatsappLink } from "../../utils/friendly";

const TABS = [
  { key: "reply", label: "Needs your reply", match: (r) => r.status === "pending_review" },
  { key: "waiting", label: "Waiting for customer", match: (r) => r.status === "quoted" },
  { key: "accepted", label: "Customer said yes", match: (r) => r.status === "accepted" || r.status === "converted" },
  { key: "closed", label: "Closed", match: (r) => r.status === "rejected" },
];

const STATUS_NOTE = {
  pending_review: { text: "Waiting for your price", cls: "bg-amber-100 text-amber-700" },
  quoted: { text: "Price sent — waiting for the customer", cls: "bg-blush-100 text-rose-600" },
  accepted: { text: "Customer accepted your price", cls: "bg-green-100 text-green-700" },
  converted: { text: "Turned into an order", cls: "bg-green-100 text-green-700" },
  rejected: { text: "Closed", cls: "bg-cream-200 text-mauve-500" },
};

const AdminCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reply");
  const [quoting, setQuoting] = useState(null);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    adminService.getCustomOrders().then(({ customOrders }) => setRequests(customOrders)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openQuote = (r) => {
    setQuoting(r._id);
    setPrice(r.quotedPrice || "");
    setNotes(r.adminNotes || "");
  };

  const sendPrice = async (e, r) => {
    e.preventDefault();
    if (!price || Number(price) <= 0) return toast.error("Please type the price for this cake.");
    setBusy(true);
    try {
      await adminService.quoteCustomOrder(r._id, Number(price), notes);
      toast.success("Price sent to the customer 🎉");
      setQuoting(null);
      setTab("waiting");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const decline = async (r) => {
    const { confirmed } = await confirm({
      title: "Decline this request?",
      message: "The customer will see that you can't make this cake. This can't be undone.",
      confirmLabel: "Yes, decline it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.rejectCustomOrder(r._id);
      toast.success("Request declined");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const current = TABS.find((t) => t.key === tab);
  const list = requests.filter(current.match);

  return (
    <div>
      {confirmDialog}
      <p className="text-[15px] text-mauve-500">
        Customers describe the cake they dream of. You look at it, tell them your price, and they say yes or no.
      </p>

      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {TABS.map((t) => {
          const n = requests.filter(t.match).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`touch-target shrink-0 rounded-full border px-4 text-sm font-medium ${
                tab === t.key ? "border-rose-500 bg-rose-500 text-white" : "border-berry-500/12 bg-white text-berry-600"
              }`}
            >
              {t.label} {n > 0 && <span className={tab === t.key ? "opacity-90" : "text-rose-600"}>({n})</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
        ) : list.length === 0 ? (
          <EmptyState icon="🎂" title="Nothing here right now"
            description={tab === "reply" ? "New custom cake requests will show up here for you to answer." : "No requests in this list."} />
        ) : (
          list.map((r) => {
            const note = STATUS_NOTE[r.status];
            const contact = r.contactWhatsapp || r.contactPhone;
            return (
              <div key={r._id} className="card-flat p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-berry-600">{r.customer?.name}</p>
                    <p className="text-sm text-mauve-500">Wants it for {friendlyDate(r.preferredDate)}{r.preferredTimeNote ? `, ${r.preferredTimeNote}` : ""}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${note.cls}`}>{note.text}</span>
                </div>

                <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                  {r.referenceImage?.url && (
                    <a href={r.referenceImage.url} target="_blank" rel="noreferrer" className="shrink-0">
                      <img src={r.referenceImage.url} alt="Customer's inspiration" className="h-32 w-32 rounded-xl2 object-cover" />
                    </a>
                  )}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="whitespace-pre-line text-berry-600">{r.description}</p>
                    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-mauve-500">
                      <div><dt className="inline">Size: </dt><dd className="inline font-medium text-berry-600">{r.desiredWeight}</dd></div>
                      {r.shape && <div><dt className="inline">Shape: </dt><dd className="inline font-medium text-berry-600">{r.shape}</dd></div>}
                      {r.flavor && <div><dt className="inline">Flavor: </dt><dd className="inline font-medium text-berry-600">{r.flavor}</dd></div>}
                      {r.filling && <div><dt className="inline">Filling: </dt><dd className="inline font-medium text-berry-600">{r.filling}</dd></div>}
                      {r.colorTheme && <div className="col-span-2"><dt className="inline">Colours / theme: </dt><dd className="inline font-medium text-berry-600">{r.colorTheme}</dd></div>}
                      {r.cakeMessage && <div className="col-span-2"><dt className="inline">Message on cake: </dt><dd className="inline font-medium text-berry-600">“{r.cakeMessage}”</dd></div>}
                    </dl>
                    <p className="mt-3 flex items-center gap-1.5 text-mauve-500">
                      {r.fulfillmentType === "delivery" ? <Truck className="h-4 w-4 text-rose-500" /> : <Store className="h-4 w-4 text-rose-500" />}
                      {r.fulfillmentType === "delivery" ? "Delivery" : "Pickup"}
                      <Calendar className="ml-2 h-4 w-4 text-rose-500" /> {friendlyDate(r.preferredDate)}
                    </p>
                  </div>
                </div>

                {r.status === "quoted" && (
                  <p className="mt-4 rounded-xl bg-blush-50 px-4 py-3 text-sm text-berry-600">
                    You quoted <strong>Rs. {Number(r.quotedPrice).toLocaleString("en-PK")}</strong>{r.quotedAt ? ` on ${new Date(r.quotedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}. We'll show the customer this price so they can accept or decline.
                  </p>
                )}
                {r.status === "accepted" && (
                  <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                    The customer accepted <strong>Rs. {Number(r.quotedPrice).toLocaleString("en-PK")}</strong>{r.respondedAt ? ` on ${new Date(r.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}. Contact them to arrange payment and how they'll get the cake.
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {contact && (
                    <>
                      <a href={telLink(contact)} className="btn-secondary touch-target !px-4 !py-2 text-sm"><Phone className="h-4 w-4" /> Call</a>
                      <a href={whatsappLink(contact)} target="_blank" rel="noreferrer" className="btn-secondary touch-target !px-4 !py-2 text-sm"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                    </>
                  )}
                  {(r.status === "pending_review" || r.status === "quoted") && quoting !== r._id && (
                    <button onClick={() => openQuote(r)} className="btn-primary touch-target !px-5 !py-2 text-sm">
                      {r.status === "quoted" ? "Change my price" : "Reply with a price"}
                    </button>
                  )}
                  {r.status === "pending_review" && (
                    <button onClick={() => decline(r)} className="btn-secondary touch-target !px-4 !py-2 text-sm !border-red-200 !text-red-500 hover:!bg-red-50">
                      I can't make this
                    </button>
                  )}
                </div>

                {quoting === r._id && (
                  <form onSubmit={(e) => sendPrice(e, r)} className="mt-4 space-y-3 rounded-xl2 bg-cream-100 p-4">
                    <FormField label="Your price for this cake (Rs.)" required hint="The total the customer would pay for this cake.">
                      <input type="number" inputMode="numeric" min="0" className="input-field bg-white" placeholder="e.g. 4500" value={price} onChange={(e) => setPrice(e.target.value)} autoFocus />
                    </FormField>
                    <FormField label="Message for the customer" optional>
                      <textarea rows={2} className="input-field bg-white" placeholder="e.g. Includes fondant decoration and delivery" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </FormField>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setQuoting(null)} className="btn-secondary touch-target">Cancel</button>
                      <button type="submit" disabled={busy} className="btn-primary touch-target flex-1">{busy ? "Sending…" : "Send price to customer"}</button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminCustomRequests;
