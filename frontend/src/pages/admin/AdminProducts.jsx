import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, ArrowLeft, ImagePlus, ChevronDown, Search } from "lucide-react";
import adminService from "../../services/adminService";
import FormField from "../../components/admin/FormField";
import ToggleSwitch from "../../components/admin/ToggleSwitch";
import Skeleton from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import useConfirm from "../../hooks/useConfirm";
import { formatPKR } from "../../utils/priceCalculator";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  ingredients: "",
  allergens: "",
  specialInstructions: "",
  preparationTimeHours: "",
  isCustomizable: false,
  isFeatured: false,
  isActive: true,
};

const SectionCard = ({ step, title, subtitle, children }) => (
  <section className="card-flat p-5 sm:p-6">
    <div className="mb-4 flex items-start gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">{step}</span>
      <div>
        <h3 className="font-display text-xl font-semibold text-berry-500">{title}</h3>
        {subtitle && <p className="text-sm text-mauve-500">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

// Optional choices live inside an expandable box so the form stays short.
const Collapsible = ({ title, hint, count, children }) => {
  const [open, setOpen] = useState(count > 0);
  return (
    <div className="rounded-xl2 border border-berry-500/10">
      <button type="button" onClick={() => setOpen((o) => !o)} className="touch-target flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span>
          <span className="block text-sm font-semibold text-berry-600">
            {title} {count > 0 && <span className="ml-1 rounded-full bg-blush-100 px-2 py-0.5 text-xs text-rose-600">{count} added</span>}
          </span>
          <span className="block text-xs text-mauve-500">{hint}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-mauve-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="border-t border-berry-500/8 p-4">{children}</div>}
    </div>
  );
};

const RemoveBtn = ({ onClick, label = "Remove" }) => (
  <button type="button" onClick={onClick} aria-label={label} className="btn-icon touch-target shrink-0 hover:!text-red-500">
    <X className="h-4 w-4" />
  </button>
);

const AddLink = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="touch-target inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600">
    <Plus className="h-4 w-4" /> {children}
  </button>
);

// ---- Sizes & prices (required) ----
const SizeEditor = ({ items, onChange }) => (
  <div className="space-y-3">
    {items.map((it, i) => (
      <div key={i} className="flex items-end gap-2">
        <FormField label={i === 0 ? "Size or weight" : ""} className="flex-1">
          <input className="input-field" placeholder="e.g. 1 Pound" value={it.label}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
        </FormField>
        <FormField label={i === 0 ? "Price (Rs.)" : ""} className="w-32 sm:w-40">
          <input type="number" inputMode="numeric" min="0" className="input-field" placeholder="e.g. 1500" value={it.price}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
        </FormField>
        {items.length > 1 && <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />}
      </div>
    ))}
    <AddLink onClick={() => onChange([...items, { label: "", price: "" }])}>Add another size</AddLink>
  </div>
);

// ---- Simple "extra choice" lists (shape / flavor / filling) ----
const ChoiceEditor = ({ items, onChange, example }) => (
  <div className="space-y-3">
    {items.map((it, i) => (
      <div key={i} className="flex items-end gap-2">
        <FormField label={i === 0 ? "Name" : ""} className="flex-1">
          <input className="input-field" placeholder={`e.g. ${example}`} value={it.label}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
        </FormField>
        <FormField label={i === 0 ? "Extra cost (Rs.)" : ""} className="w-32 sm:w-40">
          <input type="number" inputMode="numeric" min="0" className="input-field" placeholder="0 = free" value={it.priceModifier}
            onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, priceModifier: e.target.value } : x)))} />
        </FormField>
        <RemoveBtn onClick={() => onChange(items.filter((_, j) => j !== i))} />
      </div>
    ))}
    <AddLink onClick={() => onChange([...items, { label: "", priceModifier: "" }])}>Add a choice</AddLink>
  </div>
);

// ---- Other choice groups (e.g. Spice level, Toppings) ----
const GroupsEditor = ({ groups, onChange }) => (
  <div className="space-y-4">
    {groups.map((g, gi) => (
      <div key={gi} className="rounded-xl2 bg-cream-100 p-4">
        <div className="flex items-end gap-2">
          <FormField label="Question for the customer" className="flex-1">
            <input className="input-field bg-white" placeholder="e.g. How spicy?" value={g.name}
              onChange={(e) => onChange(groups.map((x, j) => (j === gi ? { ...x, name: e.target.value } : x)))} />
          </FormField>
          <RemoveBtn onClick={() => onChange(groups.filter((_, j) => j !== gi))} label="Remove this question" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select className="input-field bg-white" value={g.selectionType}
            onChange={(e) => onChange(groups.map((x, j) => (j === gi ? { ...x, selectionType: e.target.value } : x)))}>
            <option value="single">Customer picks one</option>
            <option value="multiple">Customer can pick several</option>
          </select>
          <select className="input-field bg-white" value={g.required ? "yes" : "no"}
            onChange={(e) => onChange(groups.map((x, j) => (j === gi ? { ...x, required: e.target.value === "yes" } : x)))}>
            <option value="no">Customer may skip it</option>
            <option value="yes">Customer must choose</option>
          </select>
        </div>
        <div className="mt-3">
          <ChoiceEditor
            items={g.options}
            example="Medium"
            onChange={(options) => onChange(groups.map((x, j) => (j === gi ? { ...x, options } : x)))}
          />
        </div>
      </div>
    ))}
    <AddLink onClick={() => onChange([...groups, { name: "", selectionType: "single", required: false, options: [{ label: "", priceModifier: "" }] }])}>
      Add a question
    </AddLink>
  </div>
);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, "new" or a product = form view
  const [form, setForm] = useState(emptyProduct);
  const [sizes, setSizes] = useState([{ label: "", price: "" }]);
  const [shapes, setShapes] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [fillings, setFillings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, confirmDialog] = useConfirm();

  const load = () => {
    setLoading(true);
    Promise.all([adminService.getProducts(), adminService.getCategories()])
      .then(([p, c]) => {
        setProducts(p.products);
        setCategories(c.categories);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const previews = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const startEdit = (product) => {
    if (product === "new") {
      setForm(emptyProduct);
      setSizes([{ label: "", price: "" }]);
      setShapes([]); setFlavors([]); setFillings([]); setGroups([]);
      setExistingImages([]);
    } else {
      setForm({
        name: product.name,
        category: product.category?._id || product.category,
        description: product.description || "",
        ingredients: (product.ingredients || []).join(", "),
        allergens: (product.allergens || []).join(", "),
        specialInstructions: product.specialInstructions || "",
        preparationTimeHours: product.preparationTimeHours ?? "",
        isCustomizable: product.isCustomizable,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
      });
      setSizes(product.weightOptions.map((w) => ({ ...w })));
      setShapes(product.shapeOptions.map((o) => ({ ...o })));
      setFlavors(product.flavorOptions.map((o) => ({ ...o })));
      setFillings(product.fillingOptions.map((o) => ({ ...o })));
      setGroups(product.extraOptionGroups.map((g) => ({ ...g, options: g.options.map((o) => ({ ...o })) })));
      setExistingImages(product.images || []);
    }
    setNewFiles([]);
    setEditing(product);
    window.scrollTo({ top: 0 });
  };

  const removeExistingImage = async (img) => {
    const { confirmed } = await confirm({
      title: "Remove this photo?",
      message: "It will be deleted from this item straight away.",
      confirmLabel: "Yes, remove it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.deleteProductImage(editing._id, img._id);
      setExistingImages((imgs) => imgs.filter((i) => i._id !== img._id));
      toast.success("Photo removed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please give this item a name.");
    if (!form.category) return toast.error("Please choose which menu section it belongs to.");
    const goodSizes = sizes.filter((s) => s.label.trim() && s.price !== "");
    if (!goodSizes.length) return toast.error("Please add at least one size with a price.");
    if (sizes.some((s) => (s.label.trim() && s.price === "") || (!s.label.trim() && s.price !== "")))
      return toast.error("Each size needs both a name and a price.");

    const clean = (list) => list.filter((o) => o.label.trim()).map((o) => ({ ...o, priceModifier: Number(o.priceModifier) || 0 }));
    const cleanGroups = groups
      .filter((g) => g.name.trim())
      .map((g) => ({ ...g, options: clean(g.options) }));
    if (cleanGroups.some((g) => !g.options.length)) return toast.error("Each question needs at least one choice.");

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.set("preparationTimeHours", form.preparationTimeHours === "" ? 4 : form.preparationTimeHours);
      fd.set("ingredients", JSON.stringify(form.ingredients.split(",").map((s) => s.trim()).filter(Boolean)));
      fd.set("allergens", JSON.stringify(form.allergens.split(",").map((s) => s.trim()).filter(Boolean)));
      fd.set("weightOptions", JSON.stringify(goodSizes.map((s) => ({ ...s, price: Number(s.price) }))));
      fd.set("shapeOptions", JSON.stringify(clean(shapes)));
      fd.set("flavorOptions", JSON.stringify(clean(flavors)));
      fd.set("fillingOptions", JSON.stringify(clean(fillings)));
      fd.set("extraOptionGroups", JSON.stringify(cleanGroups));
      newFiles.forEach((f) => fd.append("images", f));

      if (editing === "new") {
        await adminService.createProduct(fd);
        toast.success("Your new item has been added 🎉");
      } else {
        await adminService.updateProduct(editing._id, fd);
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

  const toggleVisible = async (p) => {
    try {
      const fd = new FormData();
      fd.append("isActive", String(!p.isActive));
      await adminService.updateProduct(p._id, fd);
      toast.success(p.isActive ? `"${p.name}" is now hidden from customers` : `"${p.name}" is now showing to customers`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (p) => {
    const { confirmed } = await confirm({
      title: `Delete "${p.name}"?`,
      message: "It will disappear from your website for good. Past orders are not affected. If you only want to pause it, use the Show/Hide switch instead.",
      confirmLabel: "Yes, delete it",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await adminService.deleteProduct(p._id);
      toast.success("Item deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // =================== FORM VIEW ===================
  if (editing) {
    return (
      <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-5 pb-24">
        {confirmDialog}
        <button type="button" onClick={() => setEditing(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-mauve-500 hover:text-rose-600">
          <ArrowLeft className="h-4 w-4" /> Back to all items
        </button>
        <h2 className="font-display text-2xl font-semibold text-berry-500">
          {editing === "new" ? "Add a new cake or item" : `Edit “${editing.name}”`}
        </h2>

        <SectionCard step={1} title="The basics">
          <div className="space-y-4">
            <FormField label="Name" required htmlFor="p-name">
              <input id="p-name" className="input-field" placeholder="e.g. Chocolate Dream Cake" value={form.name} onChange={setField("name")} />
            </FormField>
            <FormField label="Which menu section is it in?" required htmlFor="p-cat"
              hint={categories.length === 0 ? "You haven't created a menu section yet. Go to “Menu Sections” first (for example: Cakes)." : undefined}>
              <select id="p-cat" className="input-field" value={form.category} onChange={setField("category")}>
                <option value="">Choose a section…</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Description" optional htmlFor="p-desc" hint="A sentence or two that makes customers want it.">
              <textarea id="p-desc" rows={3} className="input-field" placeholder="e.g. Rich chocolate sponge layered with smooth ganache." value={form.description} onChange={setField("description")} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard step={2} title="Photos" subtitle="The first photo is the one shown on the shop page.">
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img._id} className="relative h-24 w-24 overflow-hidden rounded-xl2">
                <img src={img.url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(img)} aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-soft">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {previews.map((url, i) => (
              <div key={url} className="relative h-24 w-24 overflow-hidden rounded-xl2 ring-2 ring-rose-300">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setNewFiles((f) => f.filter((_, j) => j !== i))} aria-label="Remove photo"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-soft">
                  <X className="h-4 w-4" />
                </button>
                <span className="absolute inset-x-0 bottom-0 bg-rose-500/90 py-0.5 text-center text-[10px] font-medium text-white">New</span>
              </div>
            ))}
            <label className="touch-target flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border-2 border-dashed border-berry-500/20 text-xs font-medium text-mauve-500 hover:border-rose-300">
              <ImagePlus className="h-6 w-6 text-rose-400" /> Add photos
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => setNewFiles((f) => [...f, ...Array.from(e.target.files || [])])} />
            </label>
          </div>
        </SectionCard>

        <SectionCard step={3} title="Sizes and prices" subtitle="Add at least one. Customers choose one size when they order.">
          <SizeEditor items={sizes} onChange={setSizes} />
          <p className="mt-3 text-xs text-mauve-500">Selling something in just one size? Add one row, like “Regular” with its price.</p>
        </SectionCard>

        <SectionCard step={4} title="Extra choices" subtitle="All optional — only add what applies to this item.">
          <div className="space-y-3">
            <Collapsible title="Shapes" hint="e.g. Round, Square, Heart" count={shapes.length}>
              <ChoiceEditor items={shapes} onChange={setShapes} example="Heart" />
            </Collapsible>
            <Collapsible title="Flavors" hint="e.g. Chocolate, Vanilla, Red Velvet" count={flavors.length}>
              <ChoiceEditor items={flavors} onChange={setFlavors} example="Vanilla" />
            </Collapsible>
            <Collapsible title="Fillings" hint="e.g. Nutella, Strawberry, Cream" count={fillings.length}>
              <ChoiceEditor items={fillings} onChange={setFillings} example="Nutella" />
            </Collapsible>
            <Collapsible title="Other questions for the customer" hint="e.g. Spice level, Crust type, Toppings" count={groups.length}>
              <GroupsEditor groups={groups} onChange={setGroups} />
            </Collapsible>
          </div>
        </SectionCard>

        <SectionCard step={5} title="A few more details" subtitle="Optional, but helpful for customers.">
          <div className="space-y-4">
            <FormField label="How many hours do you need to make it?" htmlFor="p-prep"
              hint="Customers won't be able to order sooner than this. Leave empty if you're not sure — we'll use 4 hours.">
              <input id="p-prep" type="number" inputMode="numeric" min="0" className="input-field sm:w-48" placeholder="e.g. 24" value={form.preparationTimeHours} onChange={setField("preparationTimeHours")} />
            </FormField>
            <FormField label="Ingredients" optional hint="Separate with commas.">
              <input className="input-field" placeholder="e.g. Flour, sugar, eggs, butter" value={form.ingredients} onChange={setField("ingredients")} />
            </FormField>
            <FormField label="Allergy warning" optional hint="Separate with commas.">
              <input className="input-field" placeholder="e.g. Eggs, dairy, nuts" value={form.allergens} onChange={setField("allergens")} />
            </FormField>
            <FormField label="Note for customers" optional>
              <input className="input-field" placeholder="e.g. Best eaten within 2 days" value={form.specialInstructions} onChange={setField("specialInstructions")} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard step={6} title="Who can see it?">
          <div className="space-y-3">
            <ToggleSwitch checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
              label="Show this item on my website" description="Turn off to hide it without deleting it (for example when it's sold out)." onText="Showing" offText="Hidden" />
            <ToggleSwitch checked={form.isFeatured} onChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))}
              label="Show it on the home page as a favourite" description="Featured items appear at the top of your website." onText="Yes" offText="No" />
            <ToggleSwitch checked={form.isCustomizable} onChange={(v) => setForm((f) => ({ ...f, isCustomizable: v }))}
              label="Customers can ask for changes" description="Marks this item as one that can be customised." onText="Yes" offText="No" />
          </div>
        </SectionCard>

        {/* Save bar — always within thumb's reach */}
        <div className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-30 border-t border-berry-500/8 bg-white/95 px-4 py-3 backdrop-blur-md md:sticky md:inset-x-auto md:bottom-4 md:rounded-xl3 md:border md:shadow-card">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button type="button" onClick={() => setEditing(null)} className="btn-secondary touch-target">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary touch-target flex-1">
              {saving ? "Saving…" : editing === "new" ? "Add this item" : "Save changes"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  // =================== LIST VIEW ===================
  const shown = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      {confirmDialog}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-mauve-500">Everything you sell. Tap an item to change it.</p>
        <button onClick={() => startEdit("new")} className="btn-primary touch-target">
          <Plus className="h-4 w-4" /> Add a new item
        </button>
      </div>

      {products.length > 4 && (
        <div className="relative mt-4 max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mauve-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find an item by name" className="input-field pl-10" aria-label="Find an item" />
        </div>
      )}

      <div className="mt-5 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
        ) : products.length === 0 ? (
          <EmptyState icon="🍰" title="You haven't added anything yet"
            description="Add your first cake — it only takes a minute. You'll need a photo and at least one size with a price."
            action={<button onClick={() => startEdit("new")} className="btn-primary"><Plus className="h-4 w-4" /> Add my first item</button>} />
        ) : shown.length === 0 ? (
          <EmptyState icon="🔎" title="Nothing matches that name" description="Try a different word." />
        ) : (
          shown.map((p) => (
            <div key={p._id} className={`card-flat flex flex-wrap items-center gap-3 p-4 ${p.isActive ? "" : "opacity-70"}`}>
              <button onClick={() => startEdit(p)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-blush-50">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-berry-600">{p.name}</p>
                  <p className="text-sm text-mauve-500">{p.category?.name} · from {formatPKR(p.startingPrice)}</p>
                </div>
              </button>
              <div className="flex w-full items-center justify-between gap-2 border-t border-berry-500/8 pt-3 sm:w-auto sm:border-0 sm:pt-0">
                <button onClick={() => toggleVisible(p)} className="touch-target flex items-center gap-2 rounded-full px-2 text-sm font-medium" aria-label={p.isActive ? "Hide from customers" : "Show to customers"}>
                  <span className={`relative h-6 w-11 rounded-full transition-colors ${p.isActive ? "bg-rose-500" : "bg-mauve-300"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${p.isActive ? "left-[22px]" : "left-0.5"}`} />
                  </span>
                  <span className={p.isActive ? "text-rose-600" : "text-mauve-400"}>{p.isActive ? "Showing" : "Hidden"}</span>
                </button>
                <div className="flex">
                  <button onClick={() => startEdit(p)} className="btn-icon touch-target" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(p)} className="btn-icon touch-target hover:!text-red-500" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
