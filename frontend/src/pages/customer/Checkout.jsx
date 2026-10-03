import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MapPin, Store, Clock } from "lucide-react";
import { useOrderDraft } from "../../context/OrderDraftContext";
import { useAuth } from "../../context/AuthContext";
import settingsService from "../../services/settingsService";
import schedulingService from "../../services/schedulingService";
import paymentAccountService from "../../services/paymentAccountService";
import orderService from "../../services/orderService";
import FulfillmentSelector from "../../components/common/FulfillmentSelector";
import DateSelector from "../../components/common/DateSelector";
import TimeSlotSelector from "../../components/common/TimeSlotSelector";
import PaymentMethodCard from "../../components/common/PaymentMethodCard";
import PaymentAccountCard from "../../components/common/PaymentAccountCard";
import ReceiptUploader from "../../components/common/ReceiptUploader";
import LoadingScreen from "../../components/common/LoadingScreen";
import { calculateLocalPrice, formatPKR } from "../../utils/priceCalculator";
import useDocumentTitle from "../../hooks/useDocumentTitle";

// A small numbered section header used throughout — gives the single-
// page checkout a clear sense of progress without forcing a rigid
// multi-page wizard the existing order-draft architecture wasn't built for.
const SectionHeader = ({ step, title }) => (
  <div className="mb-4 flex items-center gap-2.5">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
      {step}
    </span>
    <h2 className="font-display text-lg font-semibold text-berry-500">{title}</h2>
  </div>
);

const Checkout = () => {
  useDocumentTitle("Checkout");
  const { draft, clearDraft } = useOrderDraft();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [paymentAccounts, setPaymentAccounts] = useState([]);
  const [fulfillmentType, setFulfillmentType] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      phone: user?.phone || "",
      whatsapp: user?.whatsapp || "",
    },
  });

  useEffect(() => {
    Promise.all([settingsService.get(), paymentAccountService.getAll()])
      .then(([settingsData, accountsData]) => {
        setSettings(settingsData.settings);
        setPaymentAccounts(accountsData.accounts);
        setFulfillmentType(settingsData.settings.delivery.enabled ? "delivery" : "pickup");
        setPaymentMethod(
          settingsData.settings.payments.onlineEnabled
            ? "online"
            : settingsData.settings.payments.cashEnabled
            ? "cash"
            : null
        );
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    if (!draft || !fulfillmentType) return;
    setLoadingAvailability(true);
    setSelectedDate(null);
    setSelectedSlotId(null);
    schedulingService
      .getAvailability(draft.product.slug, fulfillmentType)
      .then((data) => setAvailability(data))
      .catch(() => setAvailability({ days: [] }))
      .finally(() => setLoadingAvailability(false));
  }, [draft, fulfillmentType]);

  const { total: productUnitPrice, breakdown } = useMemo(
    () => calculateLocalPrice(draft?.product, draft?.selections),
    [draft]
  );

  const productTotal = productUnitPrice * (draft?.quantity || 1);
  const deliveryCharge = fulfillmentType === "pickup" ? 0 : settings?.delivery?.defaultFee || 0;
  const grandTotal = productTotal + deliveryCharge;

  const selectedDay = availability?.days?.find((d) => d.date === selectedDate);
  const selectedSlot = selectedDay?.slots?.find((s) => s.id === selectedSlotId);

  if (!draft) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 font-display text-xl font-semibold text-berry-500">
          Nothing to check out yet
        </h1>
        <p className="mt-2 text-sm text-mauve-500">
          Pick a product first and choose your options.
        </p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">
          Browse the Shop
        </Link>
      </div>
    );
  }

  if (loadingSettings) return <LoadingScreen />;

  const onSubmit = async (values) => {
    if (!selectedDate || !selectedSlotId) {
      toast.error("Please select a date and time slot");
      return;
    }
    if (fulfillmentType === "delivery" && !values.addressLine) {
      toast.error("Please enter your delivery address");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (paymentMethod === "online") {
      if (!selectedAccountId) {
        toast.error("Please select where you're paying from");
        return;
      }
      if (!receiptFile) {
        toast.error("Please upload your payment receipt");
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", draft.product._id);
      if (draft.selections.weightOptionId) formData.append("weightOptionId", draft.selections.weightOptionId);
      if (draft.selections.shapeOptionId) formData.append("shapeOptionId", draft.selections.shapeOptionId);
      if (draft.selections.flavorOptionId) formData.append("flavorOptionId", draft.selections.flavorOptionId);
      if (draft.selections.fillingOptionId) formData.append("fillingOptionId", draft.selections.fillingOptionId);
      formData.append("extraOptionGroups", JSON.stringify(draft.selections.extraOptionGroups || []));
      formData.append("quantity", draft.quantity);
      formData.append("fulfillmentType", fulfillmentType);
      if (fulfillmentType === "delivery") {
        formData.append(
          "deliveryAddress",
          JSON.stringify({
            addressLine: values.addressLine,
            phone: values.phone,
            whatsapp: values.whatsapp,
            instructions: values.instructions,
          })
        );
      }
      formData.append("scheduledDate", selectedDate);
      formData.append("timeSlotId", selectedSlotId);
      formData.append("paymentMethod", paymentMethod);
      if (paymentMethod === "online") {
        formData.append("paymentAccountId", selectedAccountId);
        formData.append("receipt", receiptFile);
      }
      formData.append("customerNotes", values.customerNotes || "");
      formData.append("idempotencyKey", `${draft.product._id}-${Date.now()}-${Math.random().toString(36).slice(2)}`);

      const { order } = await orderService.create(formData);
      clearDraft();
      toast.success("Order placed successfully!");
      navigate(`/orders/${order.orderNumber}`, { state: { justPlaced: true } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 pb-32 sm:px-6 sm:py-10 lg:pb-10">
      <h1 className="font-display text-2xl font-semibold text-berry-500 sm:text-3xl">Checkout</h1>

      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        {/* --- Order summary --- */}
        <div className="card p-5">
          <SectionHeader step={1} title="Your Order" />
          <div className="flex gap-3">
            {draft.product.images?.[0] && (
              <img
                src={draft.product.images[0].url}
                alt={draft.product.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-berry-600">{draft.product.name}</p>
              <p className="text-xs text-mauve-400">Quantity: {draft.quantity}</p>
            </div>
            <p className="font-semibold text-berry-600">{formatPKR(productTotal)}</p>
          </div>
        </div>

        {/* --- Fulfillment --- */}
        <div className="card p-5">
          <SectionHeader step={2} title="Fulfillment" />
          <FulfillmentSelector value={fulfillmentType} onChange={setFulfillmentType} settings={settings} />

          {fulfillmentType === "delivery" && (
            <div className="mt-4 space-y-3">
              <div>
                <input
                  className="input-field"
                  placeholder="Delivery Address"
                  {...register("addressLine", { required: fulfillmentType === "delivery" })}
                />
                {errors.addressLine && <p className="field-error">Address is required</p>}
              </div>
              <input className="input-field" placeholder="Phone" {...register("phone")} />
              <input className="input-field" placeholder="WhatsApp (optional)" {...register("whatsapp")} />
              <textarea
                className="input-field"
                rows={2}
                placeholder="Delivery instructions (optional)"
                {...register("instructions")}
              />
              {settings?.delivery?.instructions && (
                <p className="text-xs text-mauve-400">{settings.delivery.instructions}</p>
              )}
            </div>
          )}

          {fulfillmentType === "pickup" && settings?.pickup && (
            <div className="mt-4 space-y-2 rounded-xl2 bg-blush-50 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-berry-600">
                <Store className="h-4 w-4 text-rose-500" /> Pickup Location
              </p>
              <p className="flex items-start gap-2 text-mauve-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mauve-400" />
                {settings.pickup.address}
              </p>
              <p className="flex items-center gap-2 text-mauve-500">
                <Clock className="h-4 w-4 text-mauve-400" /> {settings.pickup.hours}
              </p>
              {settings.pickup.instructions && (
                <p className="text-xs text-mauve-400">{settings.pickup.instructions}</p>
              )}
            </div>
          )}
        </div>

        {/* --- Scheduling --- */}
        <div className="card p-5">
          <SectionHeader step={3} title="Choose Date & Time" />
          {loadingAvailability ? (
            <p className="text-sm text-mauve-400">Checking availability...</p>
          ) : (
            <DateSelector days={availability?.days || []} value={selectedDate} onChange={setSelectedDate} />
          )}

          {selectedDay && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold text-berry-600">Time Slot</h3>
              <TimeSlotSelector slots={selectedDay.slots} value={selectedSlotId} onChange={setSelectedSlotId} />
            </div>
          )}
        </div>

        {/* --- Payment --- */}
        <div className="card p-5">
          <SectionHeader step={4} title="Payment" />
          <PaymentMethodCard
            value={paymentMethod}
            onChange={setPaymentMethod}
            onlineEnabled={settings?.payments?.onlineEnabled}
            cashEnabled={settings?.payments?.cashEnabled}
          />

          {paymentMethod === "online" && (
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-berry-600">Pay to</p>
              <div className="space-y-2">
                {paymentAccounts.map((acc) => (
                  <PaymentAccountCard
                    key={acc._id}
                    account={acc}
                    selected={selectedAccountId === acc._id}
                    onSelect={setSelectedAccountId}
                  />
                ))}
              </div>
              {selectedAccountId && (
                <ReceiptUploader file={receiptFile} onChange={setReceiptFile} />
              )}
            </div>
          )}

          {paymentMethod === "cash" && (
            <p className="mt-4 text-sm text-mauve-500">
              You'll pay in cash on {fulfillmentType === "delivery" ? "delivery" : "pickup"}.
            </p>
          )}

          <textarea
            className="input-field mt-4"
            rows={2}
            placeholder="Any notes for us? (optional)"
            {...register("customerNotes")}
          />
        </div>

        {/* --- Review --- */}
        <div className="card p-5">
          <SectionHeader step={5} title="Review" />
          <div className="space-y-1 text-sm text-mauve-500">
            {breakdown.map((line, i) => (
              <div key={i} className="flex justify-between">
                <span>{line.label}{draft.quantity > 1 ? ` × ${draft.quantity}` : ""}</span>
                <span>{formatPKR(line.amount * draft.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{fulfillmentType === "pickup" ? "Rs. 0" : formatPKR(deliveryCharge)}</span>
            </div>
            {selectedDate && (
              <div className="flex justify-between pt-1 text-berry-600">
                <span>Scheduled</span>
                <span>
                  {new Date(selectedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {selectedSlot ? ` • ${selectedSlot.label}` : ""}
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-berry-500/8 pt-3">
            <span className="text-sm font-medium text-berry-600">Total</span>
            <span className="font-display text-2xl font-semibold text-berry-500">{formatPKR(grandTotal)}</span>
          </div>

          {/* Desktop submit lives in the card; mobile uses the sticky bar below */}
          <button type="submit" disabled={submitting} className="btn-primary mt-4 hidden w-full lg:flex">
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>

      {/* --- Mobile sticky checkout bar --- */}
      <div className="pb-safe fixed inset-x-0 bottom-16 z-30 border-t border-berry-500/8 bg-white/95 px-4 py-3 shadow-lift backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[11px] text-mauve-400">Total</p>
            <p className="font-display text-xl font-semibold text-berry-500">{formatPKR(grandTotal)}</p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="btn-primary touch-target flex-1"
          >
            {submitting ? "Placing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
