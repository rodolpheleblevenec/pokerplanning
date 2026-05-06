import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, computeResult } from "../firebase";
import StoryInput from "./StoryInput";
import VoteCards from "./VoteCards";
import PlayersList from "./PlayersList";
import Results from "./Results";
import "../layout.css";

function VotingTracker({ players, votes, onReveal }) {
  const voteCount = Object.keys(votes).length;
  const total = players.length;
  const pct = total === 0 ? 0 : Math.round((voteCount / total) * 100);
  const allVoted = total > 0 && voteCount === total;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden" }}>
          <div style={{
            width: `${pct}%`, height: "100%",
            background: allVoted ? "#16a34a" : "#2563eb",
            borderRadius: 999, transition: "width 0.4s ease",
          }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: allVoted ? "#16a34a" : "#2563eb", whiteSpace: "nowrap" }}>
          {voteCount} / {total}
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: 10,
        marginBottom: 24,
      }}>
        {players.map((player) => {
          const hasVoted = votes[player] !== undefined;
          return (
            <div key={player} style={{
              background: hasVoted ? "#f0fdf4" : "#fff",
              border: `2px solid ${hasVoted ? "#86efac" : "#e5e7eb"}`,
              borderRadius: 10,
              padding: "14px 10px",
              textAlign: "center",
              transition: "all 0.25s",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: hasVoted ? "#16a34a" : "#f3f4f6",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 8px", fontSize: 16, transition: "background 0.25s",
              }}>
                {hasVoted ? "✓" : (
                  <span style={{
                    display: "inline-block", width: 8, height: 8,
                    borderRadius: "50%", background: "#d1d5db",
                    animation: "pulse 1.5s infinite",
                  }} />
                )}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: hasVoted ? "#15803d" : "#6b7280" }}>
                {player}
              </div>
              <div style={{ fontSize: 11, color: hasVoted ? "#16a34a" : "#9ca3af", marginTop: 2 }}>
                {hasVoted ? "A voté" : "En attente"}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }`}</style>

      <button
        onClick={onReveal}
        disabled={voteCount === 0}
        style={{
          background: allVoted ? "#16a34a" : "#2563eb",
          color: "#fff", border: "none", borderRadius: 8,
          padding: "11px 24px", fontWeight: 600, fontSize: 14,
          cursor: voteCount === 0 ? "not-allowed" : "pointer",
          opacity: voteCount === 0 ? 0.4 : 1,
          transition: "background 0.3s", width: "100%",
        }}
      >
        {allVoted ? "✓ Tout le monde a voté — Révéler" : `Révéler maintenant (${voteCount}/${total})`}
      </button>
    </div>
  );
}

export default function Room({ sessionId, playerName }) {
  const [session, setSession] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const ref = doc(db, "sessions", sessionId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) setSession({ id: snap.id, ...snap.data() });
    });
  }, [sessionId]);

  if (!session) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", fontFamily: "Inter, sans-serif", color: "#6b7280" }}>
        Chargement de la session…
      </div>
    );
  }

  const isAnimator = playerName === "Rodolphe";
  const voters = (session.participants || []).filter((p) => p !== "Rodolphe");
  const stories = session.stories || [];
  const currentStory = stories.find((s) => s.status === "voting" || s.status === "revealed") ?? null;
  const currentIndex = currentStory ? stories.findIndex((s) => s.id === currentStory.id) : -1;
  const revealed = currentStory?.status === "revealed";
  const myVote = currentStory?.votes?.[playerName];
  const doneStories = stories.filter((s) => s.status === "done");

  async function addStory(name) {
    const newStory = { id: `story_${Date.now()}`, name, status: "voting", votes: {}, average: null, recommendation: null, needsDiscussion: false };
    await updateDoc(doc(db, "sessions", sessionId), { stories: [...stories, newStory] });
  }

  async function vote(value) {
    if (!currentStory || revealed) return;
    const updated = stories.map((s, i) => i === currentIndex ? { ...s, votes: { ...s.votes, [playerName]: value } } : s);
    await updateDoc(doc(db, "sessions", sessionId), { stories: updated });
  }

  async function revealVotes() {
    if (!currentStory || !isAnimator) return;
    const { average, recommendation, needsDiscussion } = computeResult(currentStory.votes || {});
    const updated = stories.map((s, i) => i === currentIndex ? { ...s, status: "revealed", average, recommendation, needsDiscussion } : s);
    await updateDoc(doc(db, "sessions", sessionId), { stories: updated });
  }

  async function markDone() {
    if (!currentStory || !isAnimator) return;
    const updated = stories.map((s, i) => i === currentIndex ? { ...s, status: "done" } : s);
    await updateDoc(doc(db, "sessions", sessionId), { stories: updated });
  }

  const shareUrl = `${window.location.origin}/room/${sessionId}`;

  return (
    <div className="app-shell">
      {/* Mobile topbar */}
      <div className="topbar">
        <span className="topbar-title">{session.title}</span>
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
        <div style={{ color: "#9999bb", fontSize: 12, marginBottom: 24 }}>{session.title}</div>

        {voters.length > 0 && (
          <>
            <div style={{ color: "#9999bb", fontSize: 11, fontWeight: 600, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
              Participants
            </div>
            <PlayersList players={voters} votes={currentStory?.votes || {}} revealed={revealed} />
          </>
        )}

        <div style={{ marginTop: "auto", paddingTop: 20 }}>
          <div style={{ color: "#9999bb", fontSize: 11, marginBottom: 6 }}>Lien de partage</div>
          <input
            readOnly
            value={shareUrl}
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
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>
          <a href="/" style={{ color: "#9ca3af", textDecoration: "none" }}>Accueil</a>
          {" > "}{session.title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>{session.title}</h1>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Connecté en tant que <strong>{playerName}</strong>
          </span>
        </div>

        {isAnimator && !currentStory && <StoryInput onAdd={addStory} disabled={false} />}

        {currentStory ? (
          <div style={{ background: "#fff", borderRadius: 10, padding: "20px 22px", border: "1px solid #e5e7eb", marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
              User story en cours
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 20 }}>
              {currentStory.name}
            </div>

            {!isAnimator && !revealed && (
              <>
                <VoteCards onVote={vote} selectedVote={myVote} disabled={false} />
                {myVote !== undefined && (
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 10 }}>
                    Vote enregistré : <strong>{myVote}</strong> — tu peux encore changer.
                  </div>
                )}
              </>
            )}

            {!isAnimator && revealed && (
              <div style={{ fontSize: 14, color: "#6b7280" }}>
                Votes révélés — en attente de la décision de l'animateur.
              </div>
            )}

            {isAnimator && !revealed && (
              <VotingTracker players={voters} votes={currentStory.votes || {}} onReveal={revealVotes} />
            )}

            {revealed && (
              <>
                <Results
                  average={currentStory.average}
                  recommendation={currentStory.recommendation}
                  needsDiscussion={currentStory.needsDiscussion}
                  votes={currentStory.votes}
                />
                {isAnimator && (
                  <button
                    onClick={markDone}
                    style={{
                      marginTop: 16, background: "#16a34a", color: "#fff",
                      border: "none", borderRadius: 8, padding: "10px 24px",
                      fontWeight: 600, fontSize: 14, cursor: "pointer", width: "100%",
                    }}
                  >
                    Valider et passer à la suite →
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div style={{
            background: "#fff", borderRadius: 10, padding: "32px",
            border: "1px solid #e5e7eb", textAlign: "center", color: "#9ca3af", fontSize: 14, marginBottom: 24,
          }}>
            {isAnimator ? "Ajoutez une user story ci-dessus pour démarrer le vote." : "En attente de la prochaine user story…"}
          </div>
        )}

        {doneStories.length > 0 && (
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 10 }}>
              Stories terminées ({doneStories.length})
            </h2>
            {doneStories.map((s) => (
              <div key={s.id} style={{
                background: "#fff", borderRadius: 8, padding: "12px 16px",
                border: "1px solid #e5e7eb", marginBottom: 8,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 14, color: "#374151", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.name}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: "#6b7280" }}>Moy. {s.average}</span>
                  <span style={{ background: "#dcfce7", color: "#16a34a", padding: "2px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    → {s.recommendation}
                  </span>
                  {s.needsDiscussion && (
                    <span style={{ background: "#fef3c7", color: "#d97706", padding: "2px 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                      ⚠️
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
