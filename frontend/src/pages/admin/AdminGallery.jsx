import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, ImagePlus, X } from "lucide-react";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useConfirm from "../../hooks/useConfirm";

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const load = () => {
    setLoading(true);
    adminService.getGallery().then(({ items: list }) => setItems(list)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const reset = () => { setAdding(false); setFile(null); setCaption(""); };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please choose a photo first.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("caption", caption);
      await adminService.createGalleryItem(fd);
      toast.success("Photo added to your gallery 🎉");
      reset();
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const { confirmed } = await confirm({
      title: "Remove this photo?",
      message: "It will disappear from your website's gallery.",
      confirmLabel: "Yes, remove it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.deleteGalleryItem(id);
      toast.success("Photo removed");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      {confirmDialog}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-mauve-500">Show off your best work. The latest photos appear on your home page.</p>
        {!adding && (
          <button onClick={() => setAdding(true)} className="btn-primary touch-target"><Plus className="h-4 w-4" /> Add a photo</button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="card-flat mt-4 max-w-xl space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-berry-500">Add a photo</h2>
            <button type="button" onClick={reset} className="btn-icon touch-target" aria-label="Cancel"><X className="h-4 w-4" /></button>
          </div>
          {preview ? (
            <img src={preview} alt="" className="h-40 w-40 rounded-xl2 object-cover" />
          ) : null}
          <label className="touch-target inline-flex cursor-pointer items-center gap-2 rounded-full border border-berry-500/15 bg-white px-4 text-sm font-medium text-berry-600 hover:border-rose-300">
            <ImagePlus className="h-4 w-4 text-rose-500" /> {file ? "Choose a different photo" : "Choose a photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <FormField label="Caption" optional hint="A few words shown with the photo.">
            <input className="input-field" placeholder="e.g. Rose & vanilla wedding cake" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </FormField>
          <button type="submit" disabled={saving} className="btn-primary touch-target w-full">{saving ? "Uploading…" : "Add to gallery"}</button>
        </form>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon="📸" title="Your gallery is empty" description="Add photos of cakes you're proud of — they'll show on your website."
            action={!adding && <button onClick={() => setAdding(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add my first photo</button>} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item._id} className="relative aspect-square overflow-hidden rounded-xl2">
                <img src={item.image.url} alt={item.caption} className="h-full w-full object-cover" />
                <button onClick={() => handleDelete(item._id)} aria-label="Remove photo"
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-soft">
                  <Trash2 className="h-4 w-4" />
                </button>
                {item.caption && <p className="absolute inset-x-0 bottom-0 bg-berry-800/60 px-2.5 py-1.5 text-xs text-white">{item.caption}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
