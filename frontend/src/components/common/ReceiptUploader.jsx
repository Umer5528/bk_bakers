import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle2, X } from "lucide-react";

const ReceiptUploader = ({ file, onChange }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file && previewUrl) {
    return (
      <div className="rounded-xl2 border-2 border-green-200 bg-green-50 p-4">
        <div className="flex items-center gap-3">
          <img src={previewUrl} alt="Receipt preview" className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-medium text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> Receipt uploaded
            </p>
            <p className="truncate text-xs text-mauve-500">{file.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn-icon touch-target shrink-0"
            aria-label="Remove receipt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="touch-target flex w-full flex-col items-center gap-2 rounded-xl2 border-2 border-dashed border-berry-500/15 p-6 text-center transition-colors hover:border-rose-300"
      >
        <Upload className="h-7 w-7 text-rose-400" />
        <span className="text-sm text-berry-600">Upload your payment receipt</span>
        <span className="text-xs text-mauve-400">JPG, PNG or WEBP</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  );
};

export default ReceiptUploader;
