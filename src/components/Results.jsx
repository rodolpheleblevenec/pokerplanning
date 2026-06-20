import { IconCheck } from "./Icons";

export default function Results({ average, recommendation, needsDiscussion, votes }) {
  const entries = votes ? Object.entries(votes) : [];

  // Distribution des votes
  const counts = {};
  entries.forEach(([, v]) => { counts[v] = (counts[v] || 0) + 1; });
  const distinct = Object.keys(counts).map(Number).sort((a, b) => a - b);
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div
      className="panel"
      style={{ padding: "20px 22px", marginTop: 18 }}
    >
      {/* Bandeau stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 38, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{average}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>Moyenne</div>
        </div>
        <div style={{ width: 1, height: 44, background: "var(--border)" }} />
        <div>
          <div style={{ fontSize: 38, fontWeight: 800, color: "var(--accent-text)", lineHeight: 1 }}>{recommendation}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>Recommandation</div>
        </div>

        {/* Distribution */}
        {distinct.length > 0 && (
          <>
            <div style={{ width: 1, height: 44, background: "var(--border)" }} />
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 64 }}>
              {distinct.map((val) => {
                const c = counts[val];
                const isReco = val === recommendation;
                return (
                  <div key={val} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>{c}</span>
                    <div
                      title={`${c} vote${c > 1 ? "s" : ""} pour ${val}`}
                      style={{
                        width: 22,
                        height: Math.max(6, (c / maxCount) * 38),
                        borderRadius: 5,
                        background: isReco ? "var(--accent)" : "var(--accent-soft)",
                        border: isReco ? "none" : "1px solid var(--border-strong)",
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 700, color: isReco ? "var(--accent-text)" : "var(--text-muted)" }}>{val}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Détail des votes */}
      {entries.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px", marginTop: 16 }}>
          {entries.map(([name, vote]) => (
            <span
              key={name}
              className="badge badge-muted"
              style={{ fontWeight: 500 }}
            >
              {name}
              <strong style={{ color: "var(--text)", fontWeight: 700 }}>{vote}</strong>
            </span>
          ))}
        </div>
      )}

      {needsDiscussion ? (
        <div className="note note-amber" style={{ marginTop: 16 }}>
          <span>⚠️</span>
          <span style={{ fontWeight: 500 }}>Écart important entre les votes — une discussion est recommandée avant de valider.</span>
        </div>
      ) : (
        <div className="note note-accent" style={{ marginTop: 16 }}>
          <IconCheck size={15} />
          <span style={{ fontWeight: 500 }}>Bon consensus dans l'équipe.</span>
        </div>
      )}
    </div>
  );
}
