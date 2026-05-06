export default function Results({ average, recommendation, needsDiscussion, votes }) {
  return (
    <div style={{
      background: "#f8faff",
      borderRadius: 10,
      padding: "20px 24px",
      border: "1px solid #dbeafe",
      marginTop: 20,
    }}>
      <div style={{ display: "flex", gap: 32, marginBottom: needsDiscussion ? 16 : 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
            {average}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Moyenne</div>
        </div>
        <div style={{ width: 1, background: "#dbeafe" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
            {recommendation}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Recommandation</div>
        </div>
        {votes && Object.keys(votes).length > 0 && (
          <>
            <div style={{ width: 1, background: "#dbeafe" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", alignItems: "center" }}>
              {Object.entries(votes).map(([name, vote]) => (
                <span key={name} style={{ fontSize: 13, color: "#374151" }}>
                  <span style={{ fontWeight: 600 }}>{name}</span> {vote}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {needsDiscussion && (
        <div style={{
          background: "#fef3c7",
          color: "#d97706",
          borderRadius: 8,
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 600,
          marginTop: 16,
        }}>
          ⚠️ Écart important entre les votes — discussion recommandée avant de valider
        </div>
      )}
    </div>
  );
}
