import { useCallback, useRef, useState } from "react";
import ConfirmDialog from "../components/admin/ConfirmDialog";

// const [confirm, confirmDialog] = useConfirm();
// const { confirmed, reason } = await confirm({ title, message, ... });
// ...and render {confirmDialog} once in the page.
const useConfirm = () => {
  const [options, setOptions] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOptions(opts);
      }),
    []
  );

  const finish = (result) => {
    resolver.current?.(result);
    resolver.current = null;
    setOptions(null);
  };

  const dialog = options ? (
    <ConfirmDialog
      {...options}
      onConfirm={(reason) => finish({ confirmed: true, reason })}
      onCancel={() => finish({ confirmed: false, reason: "" })}
    />
  ) : null;

  return [confirm, dialog];
};

export default useConfirm;
