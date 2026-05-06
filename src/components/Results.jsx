export default function Results({ average, recommendation, needsDiscussion, votes }) {
  const voteEntries = votes ? Object.entries(votes) : [];

  return (
    <div style={{
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: 8,
      padding: "16px 20px",
      marginTop: 16,
    }}>
      {/* Stats row */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", marginBottom: voteEntries.length > 0 ? 14 : 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{average}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>Moyenne</div>
        </div>

        <div style={{ width: 1, height: 40, background: "#bfdbfe" }} />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>{recommendation}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3, fontWeight: 500 }}>Recommandation</div>
        </div>

        {voteEntries.length > 0 && (
          <>
            <div style={{ width: 1, height: 40, background: "#bfdbfe" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", alignItems: "center" }}>
              {voteEntries.map(([name, vote]) => (
                <span key={name} style={{ fontSize: 12, color: "#374151" }}>
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ color: "#6b7280" }}> {vote}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {needsDiscussion && (
        <div className="warning-block" style={{ marginTop: 12 }}>
          <span>⚠️</span>
          <span style={{ fontWeight: 500 }}>Écart important — discussion recommandée avant de valider</span>
        </div>
      )}
    </div>
  );
}
