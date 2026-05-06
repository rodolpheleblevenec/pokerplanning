export default function PlayersList({ players, votes, revealed }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {players.map((player) => {
        const hasVoted = votes[player] !== undefined;
        return (
          <div
            key={player}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <span style={{ fontSize: 13, color: "#d1d5db" }}>{player}</span>
            {revealed && hasVoted ? (
              <span style={{
                background: "#2563eb",
                color: "#fff",
                padding: "2px 10px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
              }}>
                {votes[player]}
              </span>
            ) : hasVoted ? (
              <span style={{
                background: "rgba(22,163,74,0.2)",
                color: "#4ade80",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
              }}>
                ✓ Voté
              </span>
            ) : (
              <span style={{
                color: "#6b7280",
                fontSize: 11,
              }}>
                en attente…
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
