const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function VoteCards({ onVote, selectedVote, disabled }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {VALUES.map((v) => {
        const selected = selectedVote === v;
        return (
          <button
            key={v}
            onClick={() => !disabled && onVote(v)}
            disabled={disabled}
            style={{
              width: 42,
              height: 58,
              borderRadius: 8,
              border: `2px solid ${selected ? "#2563eb" : "#e5e7eb"}`,
              background: selected ? "#2563eb" : "#ffffff",
              color: selected ? "#ffffff" : "#111827",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "Inter, system-ui, sans-serif",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              transition: "all 0.12s",
              boxShadow: selected ? "0 2px 8px rgba(37,99,235,0.35)" : "none",
              flexShrink: 0,
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
