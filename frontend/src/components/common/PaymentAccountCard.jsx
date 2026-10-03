const PaymentAccountCard = ({ account, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(account._id)}
    className={`w-full rounded-xl2 border-2 p-4 text-left transition-all duration-150 ${
      selected ? "border-rose-500 bg-blush-50 shadow-soft" : "border-berry-500/10 bg-white hover:border-rose-300"
    }`}
  >
    <p className="text-sm font-semibold text-berry-600">{account.provider}</p>
    {selected && (
      <div className="mt-2 space-y-0.5 text-xs text-mauve-500">
        <p>{account.accountTitle}</p>
        <p className="font-mono">{account.accountNumber}</p>
        {account.bankName && <p>{account.bankName}</p>}
        {account.iban && <p className="font-mono">{account.iban}</p>}
        {account.instructions && <p className="mt-1 text-mauve-400">{account.instructions}</p>}
      </div>
    )}
  </button>
);

export default PaymentAccountCard;
