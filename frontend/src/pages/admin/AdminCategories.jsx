import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, ArrowLeft, ArrowUp, ArrowDown, ImagePlus, X } from "lucide-react";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import ToggleSwitch from "../../components/admin/ToggleSwitch";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useConfirm from "../../hooks/useConfirm";

const emptyForm = { name: "", description: "", isActive: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list, "new" or a category = form
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    adminService.getCategories().then(({ categories: list }) => setCategories(list)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const preview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const startEdit = (cat) => {
    setForm(cat === "new" ? emptyForm : { name: cat.name, description: cat.description || "", isActive: cat.isActive });
    setImageFile(null);
    setEditing(cat);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please type a name for this section.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("description", form.description);
      fd.append("isActive", String(form.isActive));
      if (editing === "new") fd.append("displayOrder", categories.length + 1); // new sections go to the end
      if (imageFile) fd.append("image", imageFile);

      if (editing === "new") {
        await adminService.createCategory(fd);
        toast.success("Menu section added 🎉");
      } else {
        await adminService.updateCategory(editing._id, fd);
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

  const handleDelete = async (cat) => {
    const { confirmed } = await confirm({
      title: `Delete “${cat.name}”?`,
      message: "You can only delete a section that has no items in it. If it still has items, we'll let you know.",
      confirmLabel: "Yes, delete it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.deleteCategory(cat._id);
      toast.success("Section deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Move a section up/down by re-numbering the whole list 1, 2, 3…
  const move = async (index, direction) => {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    try {
      await Promise.all(
        next.map((cat, i) => {
          if (cat.displayOrder === i + 1) return null;
          const fd = new FormData();
          fd.append("displayOrder", i + 1);
          return adminService.updateCategory(cat._id, fd);
        })
      );
      load();
    } catch (err) {
      toast.error(err.message);
      load();
    }
  };

  if (editing) {
    const currentImage = editing !== "new" ? editing.image?.url : null;
    return (
      <form onSubmit={handleSave} className="mx-auto max-w-xl space-y-5">
        {confirmDialog}
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-mauve-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> Back to menu sections
        </button>
        <h2 className="font-display text-2xl font-semibold text-berry-500">
          {editing === "new" ? "Add a menu section" : `Edit “${editing.name}”`}
        </h2>

        <div className="card-flat space-y-4 p-5 sm:p-6">
          <FormField label="Section name" required htmlFor="c-name">
            <input id="c-name" className="input-field" placeholder="e.g. Birthday Cakes" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Short description" optional htmlFor="c-desc" hint="Shown at the top of this section on your website.">
            <textarea id="c-desc" rows={2} className="input-field" placeholder="e.g. Freshly baked cakes for every celebration." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </FormField>

          <FormField label="Photo" optional hint="A nice photo makes this section stand out on your home page.">
            <div className="flex items-center gap-3">
              {(preview || currentImage) && (
                <div className="relative h-20 w-20 overflow-hidden rounded-xl2">
                  <img src={preview || currentImage} alt="" className="h-full w-full object-cover" />
                  {preview && (
                    <button type="button" onClick={() => setImageFile(null)} aria-label="Remove new photo" className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-red-500">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
              <label className="touch-target inline-flex cursor-pointer items-center gap-2 rounded-full border border-berry-500/15 bg-white px-4 text-sm font-medium text-berry-600 hover:border-rose-300">
                <ImagePlus className="h-4 w-4 text-rose-500" /> {preview || currentImage ? "Choose a different photo" : "Choose a photo"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </FormField>

          <ToggleSwitch checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
            label="Show this section on my website" description="Turn off to hide it without deleting anything." onText="Showing" offText="Hidden" />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setEditing(null)} className="btn-secondary touch-target">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary touch-target flex-1">{saving ? "Saving…" : editing === "new" ? "Add this section" : "Save changes"}</button>
        </div>
      </form>
    );
  }

  return (
    <div>
      {confirmDialog}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-[15px] text-mauve-500">
          Sections group your items on the website — like <em>Cakes</em>, <em>Cupcakes</em> or <em>Fast Food</em>. Use the arrows to change the order they appear in.
        </p>
        <button onClick={() => startEdit("new")} className="btn-primary touch-target"><Plus className="h-4 w-4" /> Add a section</button>
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
        ) : categories.length === 0 ? (
          <EmptyState icon="🗂️" title="No menu sections yet" description="Create your first section, like “Cakes”. Then you can add items to it."
            action={<button onClick={() => startEdit("new")} className="btn-primary"><Plus className="h-4 w-4" /> Add my first section</button>} />
        ) : (
          categories.map((cat, i) => (
            <div key={cat._id} className={`card-flat flex items-center gap-3 p-3 sm:p-4 ${cat.isActive ? "" : "opacity-70"}`}>
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="btn-icon !h-8 !w-8 disabled:opacity-25" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => move(i, 1)} disabled={i === categories.length - 1} className="btn-icon !h-8 !w-8 disabled:opacity-25" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
              </div>
              <button onClick={() => startEdit(cat)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                  {cat.image?.url && <img src={cat.image.url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-berry-600">{cat.name}</p>
                  <p className="text-sm text-mauve-500">{cat.isActive ? "Showing on website" : "Hidden"}</p>
                </div>
              </button>
              <button onClick={() => startEdit(cat)} className="btn-icon touch-target" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(cat)} className="btn-icon touch-target hover:!text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
