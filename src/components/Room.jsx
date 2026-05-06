import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, computeResult } from "../firebase";
import VoteCards from "./VoteCards";
import Results from "./Results";
import StoryInput from "./StoryInput";
import "../layout.css";

/* ── Participant card with 3D flip ── */
function ParticipantCard({ name, voted, revealed, vote }) {
  const flipped = voted && !revealed;
  return (
    <div className="card-flip">
      <div className={`card-inner ${flipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className="card-face">
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "#12121f",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700,
          }}>
            {name[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", textAlign: "center" }}>
            {name}
          </div>
          {revealed ? (
            voted ? (
              <div style={{ fontSize: 26, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{vote}</div>
            ) : (
              <div style={{ fontSize: 18, color: "#9ca3af" }}>—</div>
            )
          ) : (
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: "inline-block", width: 5, height: 5, borderRadius: "50%",
                  background: "#d1d5db",
                  animation: `pulse-dot 1.4s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Back */}
        <div className="card-face back">
          <div style={{ fontSize: 28, opacity: 0.6 }}>🂠</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, letterSpacing: 0.5 }}>
            A VOTÉ
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Room component ── */
export default function Room({ code, isPO, name }) {
  const [room, setRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, "rooms", code), (snap) => {
      if (snap.exists()) setRoom(snap.data());
    });
  }, [code]);

  if (!room) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
        Chargement…
      </div>
    );
  }

  const participants = room.participants || {};
  const votes = room.votes || {};
  const revealed = room.revealed || false;
  const status = room.status || "waiting";
  const joinedPlayers = Object.entries(participants).filter(([, p]) => p.joined);
  const myData = participants[name];
  const hasVoted = myData?.voted ?? false;
  const voteCount = Object.keys(votes).length;
  const results = revealed && voteCount > 0 ? computeResult(votes) : null;

  const shareUrl = `${window.location.origin}/room/${code}`;

  /* ── PO actions ── */
  async function startStory(storyName) {
    const resetVoted = {};
    Object.keys(participants).forEach((n) => {
      resetVoted[`participants.${n}.voted`] = false;
    });
    await updateDoc(doc(db, "rooms", code), {
      currentStory: storyName,
      status: "voting",
      votes: {},
      revealed: false,
      ...resetVoted,
    });
  }

  async function reveal() {
    await updateDoc(doc(db, "rooms", code), { revealed: true, status: "revealed" });
  }

  async function nextStory() {
    const resetVoted = {};
    Object.keys(participants).forEach((n) => {
      resetVoted[`participants.${n}.voted`] = false;
    });
    await updateDoc(doc(db, "rooms", code), {
      currentStory: "",
      status: "waiting",
      votes: {},
      revealed: false,
      ...resetVoted,
    });
  }

  /* ── Participant vote ── */
  async function castVote(value) {
    if (hasVoted || revealed || status !== "voting") return;
    await updateDoc(doc(db, "rooms", code), {
      [`participants.${name}.voted`]: true,
      [`votes.${name}`]: value,
    });
  }

  return (
    <div className="app-shell">
      {/* Mobile topbar */}
      <div className="topbar">
        <span className="topbar-title">{code}</span>
        <button className="burger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <a href="/" style={{ color: "#fff", fontWeight: 700, fontSize: 16, textDecoration: "none", marginBottom: 4, display: "block" }}>
          Poker Planning
        </a>
        <div style={{ color: "#9999bb", fontSize: 12, marginBottom: 24 }}>
          Room <strong style={{ color: "#fff", letterSpacing: 1 }}>{code}</strong>
        </div>

        {/* Connected participants */}
        {joinedPlayers.length > 0 && (
          <>
            <div style={{ color: "#9999bb", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
              Connectés ({joinedPlayers.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
              {joinedPlayers.map(([playerName, data]) => (
                <div key={playerName} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.05)",
                }}>
                  <span style={{ fontSize: 13, color: "#d1d5db" }}>{playerName}</span>
                  {revealed && votes[playerName] !== undefined ? (
                    <span style={{ background: "#2563eb", color: "#fff", padding: "1px 8px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                      {votes[playerName]}
                    </span>
                  ) : data.voted ? (
                    <span style={{ color: "#4ade80", fontSize: 11 }}>✓</span>
                  ) : (
                    <span style={{ color: "#6b7280", fontSize: 11 }}>…</span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: "auto" }}>
          <div style={{ color: "#9999bb", fontSize: 11, marginBottom: 6 }}>Lien de partage</div>
          <input
            readOnly value={shareUrl}
            onClick={(e) => { e.target.select(); navigator.clipboard.writeText(shareUrl); }}
            title="Cliquer pour copier"
            style={{
              width: "100%", background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
              padding: "6px 8px", fontSize: 10, color: "#9999bb", cursor: "pointer",
            }}
          />
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 4 }}>
              <a href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Accueil</a> › Room {code}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>
              {room.currentStory || (isPO ? "Aucune story en cours" : "En attente du PO…")}
            </h1>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 999,
            background: status === "voting" ? "#dbeafe" : status === "revealed" ? "#dcfce7" : "#f3f4f6",
            color: status === "voting" ? "#2563eb" : status === "revealed" ? "#16a34a" : "#6b7280",
          }}>
            {status === "voting" ? "Vote en cours" : status === "revealed" ? "Votes révélés" : "En attente"}
          </span>
        </div>

        {/* PO: add story */}
        {isPO && status === "waiting" && (
          <StoryInput onAdd={startStory} disabled={false} />
        )}

        {/* Participant cards grid */}
        {joinedPlayers.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
              Participants
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
              {joinedPlayers.map(([playerName, data]) => (
                <ParticipantCard
                  key={playerName}
                  name={playerName}
                  voted={data.voted}
                  revealed={revealed}
                  vote={votes[playerName]}
                />
              ))}
            </div>
          </div>
        )}

        {joinedPlayers.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: 10, padding: "32px", border: "1px solid #e5e7eb",
            textAlign: "center", color: "#9ca3af", fontSize: 14, marginBottom: 24,
          }}>
            En attente des participants… Partagez le lien de la room.
          </div>
        )}

        {/* Participant: vote cards */}
        {!isPO && status === "voting" && !hasVoted && (
          <div style={{ background: "#fff", borderRadius: 10, padding: "20px 22px", border: "1px solid #e5e7eb", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>
              Votre vote pour <em>{room.currentStory}</em>
            </div>
            <VoteCards onVote={castVote} selectedVote={undefined} disabled={false} />
          </div>
        )}

        {!isPO && status === "voting" && hasVoted && (
          <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "16px 22px", border: "1px solid #86efac", marginBottom: 20, fontSize: 14, color: "#15803d", fontWeight: 600 }}>
            ✓ Vote enregistré — en attente des autres participants
          </div>
        )}

        {/* PO: reveal controls */}
        {isPO && status === "voting" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#6b7280" }}>
              {voteCount} / {joinedPlayers.length} vote{voteCount > 1 ? "s" : ""} reçu{voteCount > 1 ? "s" : ""}
            </div>
            <button
              onClick={reveal}
              disabled={voteCount === 0}
              style={{
                background: voteCount === joinedPlayers.length ? "#16a34a" : "#2563eb",
                color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 22px", fontWeight: 600, fontSize: 14,
                cursor: voteCount === 0 ? "not-allowed" : "pointer",
                opacity: voteCount === 0 ? 0.4 : 1,
                transition: "background 0.3s",
              }}
            >
              {voteCount === joinedPlayers.length ? "✓ Révéler tous les votes" : `Révéler (${voteCount}/${joinedPlayers.length})`}
            </button>
          </div>
        )}

        {/* Results */}
        {revealed && results && (
          <>
            <Results
              average={results.average}
              recommendation={results.recommendation}
              needsDiscussion={results.needsDiscussion}
              votes={votes}
            />
            {isPO && (
              <button
                onClick={nextStory}
                style={{
                  marginTop: 16, background: "#16a34a", color: "#fff",
                  border: "none", borderRadius: 8, padding: "11px 24px",
                  fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
                }}
              >
                Story suivante →
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
