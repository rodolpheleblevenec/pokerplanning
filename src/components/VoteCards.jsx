const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function VoteCards({ onVote, selectedVote, disabled }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
      {VALUES.map((v) => {
        const selected = selectedVote === v;
        return (
          <button
            key={v}
            onClick={() => onVote(v)}
            disabled={disabled}
            style={{
              width: 56,
              height: 80,
              borderRadius: 10,
              border: `2px solid ${selected ? "#2563eb" : "#e5e7eb"}`,
              background: selected ? "#2563eb" : "#fff",
              color: selected ? "#fff" : "#111827",
              fontSize: 22,
              fontWeight: 700,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              transition: "all 0.12s",
              boxShadow: selected ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
