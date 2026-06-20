/*
  Contrôle segmenté générique.
  options: [{ value, label, icon? }], value, onChange.
*/
export default function Segmented({ options, value, onChange, full = false }) {
  return (
    <div className={`segmented ${full ? "full" : ""}`} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented-item ${value === opt.value ? "active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
