import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, computeResult } from "../firebase";
import { useToast } from "./Toast";
import VoteCards from "./VoteCards";
import Results from "./Results";
import StoryInput from "./StoryInput";
import "../layout.css";

/* ── Icons ── */
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* ── Participant card (flip 3D) ── */
function ParticipantCard({ name, voted, revealed, vote, offline }) {
  const flipped = voted && !revealed;
  const showVote = revealed && voted;

  return (
    <div className="card-flip" style={{ opacity: offline ? 0.4 : 1, transition: "opacity 0.3s" }}>
      <div className={`card-inner ${flipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className={`card-face ${showVote ? "voted-revealed" : ""}`}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: showVote ? "#dcfce7" : "#1e3a5f",
            color: showVote ? "#16a34a" : "#93c5fd",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
          }}>
            {name[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", textAlign: "center", lineHeight: 1.2 }}>
            {name}
          </div>
          {revealed ? (
            voted
              ? <div style={{ fontSize: 22, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{vote}</div>
              : <div style={{ fontSize: 16, color: "#9ca3af" }}>—</div>
          ) : (
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  display: "inline-block", width: 4, height: 4, borderRadius: "50%",
                  background: "#d1d5db", animation: `pulse-dot 1.4s ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
        </div>
        {/* Back */}
        <div className="card-face back">
          <div style={{ fontSize: 24, opacity: 0.5 }}>🂠</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Voté</div>
        </div>
      </div>
    </div>
  );
}

/* ── Session closed view ── */
function ClosedView({ history, code }) {
  const [copied, setCopied] = useState(false);
  const total = history.length;
  const avg = total > 0 ? (history.reduce((s, h) => s + h.estimate, 0) / total).toFixed(1) : "—";
  const disputed = history.filter((h) => h.needsDiscussion).length;

  function copyRecap() {
    const date = new Date().toLocaleDateString("fr-FR");
    const lines = history.map((h, i) => `${i + 1}. ${h.story} → ${h.estimate} pts`).join("\n");
    navigator.clipboard.writeText(`=== POKER PLANNING ${code} — ${date} ===\n\n${lines}\n\nTotal : ${total} stories · Moy. : ${avg} pts · Disputées : ${disputed}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#f3f4f6", fontFamily: "Inter, system-ui, sans-serif", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "36px 40px", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", width: "100%", maxWidth: 500, border: "1px solid #e5e7eb" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 44, height: 44, background: "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22 }}>✓</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Session terminée</h1>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Room <strong style={{ letterSpacing: 1 }}>{code}</strong></p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 24, justifyContent: "center" }}>
          {[["Stories", total], ["Moy.", `${avg} pts`], ["Disputées", disputed]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center", background: "#f3f4f6", borderRadius: 8, padding: "10px 18px", flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            {history.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "#f9fafb", borderRadius: 7, padding: "9px 14px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.story}</div>
                  {h.needsDiscussion && <div style={{ fontSize: 11, color: "#d97706" }}>⚠️ discussion</div>}
                </div>
                <div style={{ background: "#111827", color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>{h.estimate}</div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-ghost" onClick={copyRecap} style={{ width: "100%", justifyContent: "center", background: copied ? "#dcfce7" : undefined, borderColor: copied ? "#bbf7d0" : undefined, color: copied ? "#16a34a" : undefined }}>
          {copied ? <><IconCheck /> Copié !</> : <><IconCopy /> Copier le récap</>}
        </button>
        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 12, color: "#9ca3af", textDecoration: "none" }}>Retour à l'accueil</a>
      </div>
    </div>
  );
}

/* ── Close session modal ── */
function CloseModal({ history, onConfirm, onCancel, loading }) {
  const total = history.length;
  const avg = total > 0 ? (history.reduce((s, h) => s + h.estimate, 0) / total).toFixed(1) : "—";
  const disputed = history.filter((h) => h.needsDiscussion).length;
  const biggest = total > 0 ? history.reduce((mx, h) => h.estimate > mx.estimate ? h : mx) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", width: "100%", maxWidth: 420 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 18px" }}>Clore la session ?</h2>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          {[["Stories", total], ["Moy.", `${avg} pts`], ["Disputées", disputed]].map(([l, v]) => (
            <div key={l} style={{ flex: 1, background: "#f3f4f6", borderRadius: 7, padding: "10px 12px" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{l}</div>
            </div>
          ))}
        </div>
        {biggest && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 18px" }}>
            Plus grosse US : <strong style={{ color: "#111827" }}>{biggest.story}</strong> ({biggest.estimate} pts)
          </p>
        )}
        {total === 0 && <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 16px" }}>Aucune story chiffrée dans cette session.</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={onCancel} style={{ flex: 1 }}>Annuler</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} style={{ flex: 1 }}>
            {loading ? "Clôture…" : "Clore la session"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Room ── */
export default function Room({ code, isPO, name }) {
  const toast = useToast();
  const [room, setRoom] = useState(null);
  const [roomNotFound, setRoomNotFound] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [finalEstimate, setFinalEstimate] = useState("");
  const [copied, setCopied] = useState(false);
  const [showClosing, setShowClosing] = useState(false);
  const [closing, setClosing] = useState(false);
  const [editingStory, setEditingStory] = useState(false);
  const [editStoryVal, setEditStoryVal] = useState("");

  const shareUrl = `${window.location.origin}/room/${code}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* Firestore listener */
  useEffect(() => {
    return onSnapshot(
      doc(db, "rooms", code),
      (snap) => { if (snap.exists()) setRoom(snap.data()); else setRoomNotFound(true); },
      () => toast("Erreur de connexion à la room", "error")
    );
  }, [code]);

  /* Presence — heartbeat every 40s, offline only on actual page close */
  useEffect(() => {
    if (isPO) return;
    const ref = doc(db, "rooms", code);
    const markOnline = () => updateDoc(ref, {
      [`participants.${name}.online`]: true,
      [`participants.${name}.lastSeen`]: serverTimestamp(),
    }).catch(() => {});
    const markOffline = () => updateDoc(ref, { [`participants.${name}.online`]: false }).catch(() => {});

    markOnline();
    const hb = setInterval(markOnline, 40000);
    window.addEventListener("beforeunload", markOffline);
    return () => {
      clearInterval(hb);
      window.removeEventListener("beforeunload", markOffline);
      markOffline();
    };
  }, [code, name, isPO]);

  /* Guards */
  if (roomNotFound) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#f3f4f6", fontFamily: "Inter, sans-serif", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 28 }}>🃏</div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Room introuvable</h1>
      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Ce code n'existe pas ou la room a expiré.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: 8, textDecoration: "none" }}>Retour à l'accueil</a>
    </div>
  );

  if (!room) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", color: "#6b7280", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
      Chargement…
    </div>
  );

  const participants = room.participants || {};
  const votes = room.votes || {};
  const revealed = room.revealed || false;
  const status = room.status || "waiting";
  const history = room.history || [];

  if (status === "closed") return <ClosedView history={history} code={code} />;

  /* Participant is online if lastSeen is within 2 minutes (or no lastSeen yet) */
  function isOnline(p) {
    if (p.online === false) return false;
    if (!p.lastSeen) return true;
    return Date.now() - (p.lastSeen.toDate?.().getTime() ?? Date.now()) < 120000;
  }

  /* Stable order: sort all joined participants by joinedAt timestamp */
  const allJoined = Object.entries(participants)
    .filter(([, p]) => p.joined)
    .sort(([, a], [, b]) => {
      const ta = a.joinedAt?.toDate?.().getTime() ?? 0;
      const tb = b.joinedAt?.toDate?.().getTime() ?? 0;
      return ta - tb;
    });

  const onlinePlayers = allJoined.filter(([, p]) => isOnline(p));
  const offlinePlayers = allJoined.filter(([, p]) => !isOnline(p));

  const myData = participants[name];
  const hasVoted = myData?.voted ?? false;
  const voteCount = Object.keys(votes).length;
  const results = revealed && voteCount > 0 ? computeResult(votes) : null;
  const joinedMidSession = !isPO && !myData && status !== "waiting";

  function buildReset() {
    const r = {};
    Object.keys(participants).forEach((n) => { r[`participants.${n}.voted`] = false; });
    return r;
  }

  async function run(fn, msg) {
    try { await fn(); } catch { toast(msg, "error"); }
  }

  const startStory = (s) => run(() => updateDoc(doc(db, "rooms", code), { currentStory: s, status: "voting", votes: {}, revealed: false, ...buildReset() }), "Impossible de démarrer le vote");
  const reveal = () => run(() => updateDoc(doc(db, "rooms", code), { revealed: true, status: "revealed" }), "Impossible de révéler");
  const reVote = () => run(() => updateDoc(doc(db, "rooms", code), { status: "voting", votes: {}, revealed: false, ...buildReset() }), "Impossible de relancer le vote");
  const castVote = (v) => run(() => updateDoc(doc(db, "rooms", code), { [`participants.${name}.voted`]: true, [`votes.${name}`]: v }), "Impossible d'enregistrer le vote");

  async function validateAndNext() {
    const est = parseInt(finalEstimate, 10);
    if (isNaN(est) || est < 1) return;
    await run(() => updateDoc(doc(db, "rooms", code), {
      history: arrayUnion({ story: room.currentStory, estimate: est, average: results?.average ?? null, recommendation: results?.recommendation ?? null, needsDiscussion: results?.needsDiscussion ?? false, votes: { ...votes } }),
      currentStory: "", status: "waiting", votes: {}, revealed: false, ...buildReset(),
    }), "Impossible de valider");
    setFinalEstimate("");
    setEditingStory(false);
  }

  async function closeSession() {
    setClosing(true);
    await run(() => updateDoc(doc(db, "rooms", code), { status: "closed", closedAt: serverTimestamp() }), "Impossible de clore");
    setClosing(false);
    setShowClosing(false);
  }

  function startEditStory() {
    setEditStoryVal(room.currentStory);
    setEditingStory(true);
  }

  async function saveEditStory() {
    const trimmed = editStoryVal.trim();
    if (!trimmed) return;
    await run(() => updateDoc(doc(db, "rooms", code), { currentStory: trimmed }), "Impossible de modifier");
    setEditingStory(false);
  }

  /* Status badge */
  const statusBadge = {
    voting: { label: "Vote en cours", cls: "badge-blue" },
    revealed: { label: "Votes révélés", cls: "badge-green" },
    waiting: { label: "En attente", cls: "badge-gray" },
  }[status] ?? { label: status, cls: "badge-gray" };

  return (
    <div className="app-shell">
      {showClosing && <CloseModal history={history} onConfirm={closeSession} onCancel={() => setShowClosing(false)} loading={closing} />}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "18px 16px 12px", borderBottom: "1px solid #1e2535" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 28, height: 28, background: "#1e3a5f", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🃏</div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb" }}>Poker Planning</span>
          </a>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: 1 }}>Room</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", letterSpacing: 2 }}>{code}</span>
          </div>
        </div>

        {/* Participants */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }}>
          {onlinePlayers.length > 0 && (
            <>
              <div className="sidebar-section">Connectés ({onlinePlayers.length})</div>
              {onlinePlayers.map(([pName, data]) => (
                <div key={pName} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, marginBottom: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#d1d5db" }}>{pName}</span>
                  </div>
                  {revealed && votes[pName] !== undefined
                    ? <span className="badge badge-blue" style={{ fontSize: 11, padding: "2px 8px" }}>{votes[pName]}</span>
                    : data.voted
                      ? <span style={{ color: "#4ade80", fontSize: 12 }}>✓</span>
                      : <span style={{ color: "#4b5563", fontSize: 11 }}>…</span>
                  }
                </div>
              ))}
            </>
          )}

          {offlinePlayers.length > 0 && (
            <>
              <div className="sidebar-section" style={{ marginTop: 8 }}>Déconnectés</div>
              {offlinePlayers.map(([pName]) => (
                <div key={pName} style={{ padding: "5px 8px", opacity: 0.4 }}>
                  <span style={{ fontSize: 12, color: "#6b7280", textDecoration: "line-through" }}>{pName}</span>
                </div>
              ))}
            </>
          )}

          {allJoined.length === 0 && (
            <div style={{ padding: "12px 8px", fontSize: 12, color: "#4b5563", textAlign: "center" }}>
              Aucun participant pour l'instant
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid #1e2535", display: "flex", flexDirection: "column", gap: 6 }}>
          {isPO && (
            <button
              onClick={() => setShowClosing(true)}
              style={{ width: "100%", padding: "7px 10px", background: "transparent", border: "1px solid #374151", borderRadius: 6, color: "#6b7280", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#f87171"; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#6b7280"; }}
            >
              Clore la session
            </button>
          )}
          <button
            onClick={copyLink}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "7px 10px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
              border: `1px solid ${copied ? "rgba(74,222,128,0.4)" : "#1e2535"}`,
              background: copied ? "rgba(74,222,128,0.1)" : "transparent",
              color: copied ? "#4ade80" : "#9ca3af",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            {copied ? <><IconCheck /> Copié !</> : <><IconCopy /> Copier le lien</>}
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="main-area">
        {/* Topbar */}
        <div className="topbar">
          <button className="topbar-burger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <nav style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0 }}>
            <a href="/" style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}>Accueil</a>
            <span style={{ color: "#d1d5db", fontSize: 12 }}>›</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: 1 }}>{code}</span>
          </nav>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <span className={`badge ${statusBadge.cls}`}>{statusBadge.label}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500 }}>
              {isPO ? "🎯 PO" : name}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {/* Story title */}
          <div style={{ marginBottom: 20 }}>
            {editingStory ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={editStoryVal}
                  onChange={(e) => setEditStoryVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEditStory(); if (e.key === "Escape") setEditingStory(false); }}
                  autoFocus
                  className="input"
                  style={{ fontSize: 16, fontWeight: 600, flex: 1 }}
                />
                <button className="btn btn-primary" onClick={saveEditStory} disabled={!editStoryVal.trim()}>OK</button>
                <button className="btn btn-ghost" onClick={() => setEditingStory(false)}>✕</button>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
                  {room.currentStory || (isPO ? "Démarrer une story" : "En attente du PO…")}
                </h1>
                {isPO && room.currentStory && (
                  <button
                    onClick={startEditStory}
                    title="Modifier le titre"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, display: "flex", alignItems: "center", borderRadius: 4, lineHeight: 1 }}
                    onMouseOver={(e) => e.currentTarget.style.color = "#374151"}
                    onMouseOut={(e) => e.currentTarget.style.color = "#9ca3af"}
                  >
                    <IconEdit />
                  </button>
                )}
              </div>
            )}
            {room.currentStory && !editingStory && (
              <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                User story en cours
              </span>
            )}
          </div>

          {/* Mid-session join banner */}
          {joinedMidSession && (
            <div className="warning-block" style={{ marginBottom: 16 }}>
              <span>⚠️</span>
              <span>Tu as rejoint en cours de session —{" "}
                {status === "voting" ? "le vote est en cours, tu peux encore voter" : "les votes viennent d'être révélés"}
              </span>
            </div>
          )}

          {/* PO: add story */}
          {isPO && status === "waiting" && <StoryInput onAdd={startStory} disabled={false} />}

          {/* Participant cards — stable order, all joined (offline faded) */}
          {allJoined.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 12px" }}>
                Participants
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {allJoined.map(([pName, data]) => (
                  <ParticipantCard
                    key={pName}
                    name={pName}
                    voted={data.voted}
                    revealed={revealed}
                    vote={votes[pName]}
                    offline={!isOnline(data)}
                  />
                ))}
              </div>
            </div>
          )}

          {allJoined.length === 0 && (
            <div className="card" style={{ textAlign: "center", color: "#9ca3af", fontSize: 13, padding: "32px", marginBottom: 20 }}>
              En attente des participants — partagez le lien de la room
            </div>
          )}

          {/* Participant: vote cards */}
          {!isPO && status === "voting" && !hasVoted && (
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 14px" }}>
                Votre vote — <em style={{ fontWeight: 400, color: "#6b7280" }}>{room.currentStory}</em>
              </p>
              <VoteCards onVote={castVote} selectedVote={undefined} disabled={false} />
            </div>
          )}

          {!isPO && status === "voting" && hasVoted && (
            <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 7, padding: "10px 16px", fontSize: 13, color: "#15803d", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <IconCheck /> Vote enregistré — en attente des autres participants
            </div>
          )}

          {/* PO: reveal */}
          {isPO && status === "voting" && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                {voteCount} / {onlinePlayers.length} vote{voteCount !== 1 ? "s" : ""} reçu{voteCount !== 1 ? "s" : ""}
              </span>
              <button
                className={`btn ${voteCount === onlinePlayers.length && voteCount > 0 ? "btn-success" : "btn-primary"}`}
                onClick={reveal}
                disabled={voteCount === 0}
              >
                {voteCount === onlinePlayers.length && voteCount > 0 ? "✓ Révéler tous les votes" : `Révéler (${voteCount}/${onlinePlayers.length})`}
              </button>
            </div>
          )}

          {/* Results */}
          {revealed && results && (
            <>
              <Results average={results.average} recommendation={results.recommendation} needsDiscussion={results.needsDiscussion} votes={votes} />

              {isPO && (
                <div className="card" style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Chiffrage final retenu
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="number" min={1} max={100}
                      value={finalEstimate}
                      onChange={(e) => setFinalEstimate(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
                      placeholder={results.recommendation}
                      autoFocus
                      className="input"
                      style={{ fontSize: 22, fontWeight: 700, textAlign: "center", width: 100, flexShrink: 0 }}
                    />
                    <button className="btn btn-success" onClick={validateAndNext}
                      disabled={!finalEstimate || isNaN(parseInt(finalEstimate, 10))}
                      style={{ flex: 1 }}>
                      Valider →
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={reVote}
                      title="Re-voter (conserver la story)"
                      style={{ padding: "0 12px", flexShrink: 0 }}
                    >
                      <IconChevronLeft />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* History — newest first */}
          {history.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 10px" }}>
                Historique ({history.length})
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[...history].reverse().map((entry, i) => (
                  <div key={i} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 16px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.story}</div>
                      {entry.average !== null && (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                          Moy. {entry.average} · Reco. {entry.recommendation}{entry.needsDiscussion && " · ⚠️"}
                        </div>
                      )}
                    </div>
                    <div style={{ background: "#111827", color: "#fff", borderRadius: 6, padding: "3px 12px", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                      {entry.estimate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
