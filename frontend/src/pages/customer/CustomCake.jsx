import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { ImagePlus, Sparkles, X, RefreshCw } from "lucide-react";
import customOrderService from "../../services/customOrderService";
import FulfillmentSelector from "../../components/common/FulfillmentSelector";
import { useAuth } from "../../context/AuthContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const SectionHeader = ({ step, title }) => (
  <div className="mb-4 flex items-center gap-2.5">
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
      {step}
    </span>
    <h2 className="font-display text-lg font-semibold text-berry-500">{title}</h2>
  </div>
);

const CustomCake = () => {
  useDocumentTitle("Custom Cake");
  const { user } = useAuth();
  const [fulfillmentType, setFulfillmentType] = useState("delivery");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { contactPhone: user?.phone || "", contactWhatsapp: user?.whatsapp || "" },
  });

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    setProgress(0);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => formData.append(key, val));
      formData.append("fulfillmentType", fulfillmentType);
      if (imageFile) formData.append("referenceImage", imageFile);

      await customOrderService.create(formData, setProgress);
      setSubmitted(true);
      reset();
      removeImage();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-4xl">
          🎂
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-berry-500">
          Your request is in our hands
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mauve-500">
          We'll review your vision and send you a personal quotation soon —
          you can track its status any time from My Orders.
        </p>
        <button onClick={() => setSubmitted(false)} className="btn-primary mt-6">
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 pb-16 sm:px-6 sm:py-12">
      <div className="mb-8 text-center">
        <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-blush-100 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-600">
          <Sparkles className="h-3 w-3" /> Bespoke &amp; Made for You
        </span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-berry-500">
          Design Your Custom Cake
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-mauve-500">
          Share your inspiration and vision — we'll review it personally and
          send you a quotation.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* --- Inspiration image --- */}
        <div className="card p-5">
          <SectionHeader step={1} title="Your Inspiration" />
          {imagePreview ? (
            <div className="relative w-fit">
              <img src={imagePreview} alt="Reference" className="h-40 w-40 rounded-xl2 object-cover shadow-soft" />
              <div className="absolute -right-2 -top-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => document.getElementById("custom-cake-image-input").click()}
                  className="btn-icon touch-target !h-8 !w-8 bg-white shadow-soft"
                  aria-label="Replace image"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="btn-icon touch-target !h-8 !w-8 bg-white text-red-500 shadow-soft"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <label className="touch-target flex cursor-pointer flex-col items-center gap-2 rounded-xl2 border-2 border-dashed border-berry-500/15 p-8 text-center hover:border-rose-300">
              <ImagePlus className="h-8 w-8 text-rose-400" />
              <span className="text-sm text-berry-600">Upload a reference image (optional)</span>
              <span className="text-xs text-mauve-400">A photo, sketch, or something similar you love</span>
            </label>
          )}
          <input
            id="custom-cake-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageChange}
          />
        </div>

        {/* --- Cake details --- */}
        <div className="card p-5">
          <SectionHeader step={2} title="Cake Details" />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Desired Weight (e.g. 2 Pounds)"
              {...register("desiredWeight", { required: "Required" })}
            />
            <input className="input-field" placeholder="Shape" {...register("shape")} />
            <input className="input-field" placeholder="Flavor" {...register("flavor")} />
            <input className="input-field" placeholder="Filling" {...register("filling")} />
          </div>
          {errors.desiredWeight && <p className="field-error">{errors.desiredWeight.message}</p>}

          <div className="mt-3 space-y-3">
            <input className="input-field" placeholder="Cake Message (optional)" {...register("cakeMessage")} />
            <input className="input-field" placeholder="Color / Theme (optional)" {...register("colorTheme")} />
          </div>
        </div>

        {/* --- Description --- */}
        <div className="card p-5">
          <SectionHeader step={3} title="Describe Your Vision" />
          <textarea
            className="input-field"
            rows={4}
            placeholder="Tell us about the occasion, style, and any details that matter to you..."
            {...register("description", { required: "Please describe your cake" })}
          />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>

        {/* --- Fulfillment & timing --- */}
        <div className="card p-5">
          <SectionHeader step={4} title="Fulfillment & Timing" />
          <FulfillmentSelector
            value={fulfillmentType}
            onChange={setFulfillmentType}
            settings={{ delivery: { enabled: true }, pickup: { enabled: true } }}
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <input
              type="date"
              className="input-field"
              min={new Date().toISOString().slice(0, 10)}
              {...register("preferredDate", { required: "Required" })}
            />
            <input className="input-field" placeholder="Preferred time (e.g. afternoon)" {...register("preferredTimeNote")} />
          </div>
          {errors.preferredDate && <p className="field-error">{errors.preferredDate.message}</p>}
        </div>

        {/* --- Contact --- */}
        <div className="card p-5">
          <SectionHeader step={5} title="Contact Information" />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input-field"
              placeholder="Contact Phone"
              {...register("contactPhone", { required: "Required" })}
            />
            <input className="input-field" placeholder="WhatsApp (optional)" {...register("contactWhatsapp")} />
          </div>
          {errors.contactPhone && <p className="field-error">{errors.contactPhone.message}</p>}
        </div>

        {submitting && progress > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-blush-100">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Submitting your request..." : "Submit Custom Cake Request"}
        </button>
      </form>
    </div>
  );
};

export default CustomCake;
