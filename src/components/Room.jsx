import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db, computeResult } from "../firebase";
import { getDeck, getSequence } from "../sequences";
import { useToast } from "./Toast";
import VoteCards from "./VoteCards";
import Results from "./Results";
import StoryInput from "./StoryInput";
import Avatar from "./Avatar";
import ThemeToggle from "./ThemeToggle";
import { IconCopy, IconCheck, IconChevronLeft, IconEdit, IconMenu } from "./Icons";
import "../layout.css";

/* ── Carte participant (flip 3D) ── */
function ParticipantCard({ name, voted, revealed, vote, offline }) {
  const flipped = voted && !revealed;
  const showVote = revealed && voted;

  return (
    <div className="pcard" style={{ opacity: offline ? 0.45 : 1, transition: "opacity 0.3s" }}>
      <div className={`pcard-inner ${flipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className={`pcard-face ${showVote ? "revealed" : ""}`}>
          <Avatar name={name} size={34} />
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textAlign: "center", lineHeight: 1.2, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </div>
          {revealed ? (
            voted
              ? <div style={{ fontSize: 24, fontWeight: 800, color: "var(--accent-text)", lineHeight: 1 }}>{vote}</div>
              : <div style={{ fontSize: 16, color: "var(--text-faint)" }}>—</div>
          ) : (
            <div style={{ display: "flex", gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "var(--text-faint)", animation: `pulse-dot 1.4s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          )}
        </div>
        {/* Back */}
        <div className="pcard-face back">
          <div style={{ fontSize: 26, opacity: 0.85, color: "#fff" }}>🂠</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Voté</div>
        </div>
      </div>
    </div>
  );
}

/* ── Vue session close ── */
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
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="panel" style={{ width: "100%", maxWidth: 520, padding: "36px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ width: 48, height: 48, background: "var(--accent-soft)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "var(--accent-text)" }}>
            <IconCheck size={24} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>Session terminée</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Room <strong style={{ letterSpacing: 1, color: "var(--text)" }}>{code}</strong></p>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {[["Stories", total], ["Moy.", `${avg} pts`], ["Disputées", disputed]].map(([l, v]) => (
            <div key={l} style={{ textAlign: "center", background: "var(--surface-2)", borderRadius: "var(--r)", padding: "12px 18px", flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>{v}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            {history.map((h, i) => (
              <div key={i} className="history-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.story}</div>
                  {h.needsDiscussion && <div style={{ fontSize: 11, color: "var(--amber-text)" }}>⚠️ discussion</div>}
                </div>
                <div className="history-estimate">{h.estimate}</div>
              </div>
            ))}
          </div>
        )}

        <button className="btn btn-secondary btn-block" onClick={copyRecap}>
          {copied ? <><IconCheck size={15} /> Copié !</> : <><IconCopy size={15} /> Copier le récap</>}
        </button>
        <a href="/" style={{ display: "block", textAlign: "center", marginTop: 12, fontSize: 12, color: "var(--text-faint)", textDecoration: "none" }}>Retour à l'accueil</a>
      </div>
    </div>
  );
}

/* ── Modale de clôture ── */
function CloseModal({ history, onConfirm, onCancel, loading }) {
  const total = history.length;
  const avg = total > 0 ? (history.reduce((s, h) => s + h.estimate, 0) / total).toFixed(1) : "—";
  const disputed = history.filter((h) => h.needsDiscussion).length;
  const biggest = total > 0 ? history.reduce((mx, h) => (h.estimate > mx.estimate ? h : mx)) : null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "26px 30px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 18 }}>Clore la session ?</h2>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[["Stories", total], ["Moy.", `${avg} pts`], ["Disputées", disputed]].map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "11px 12px" }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text)" }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{l}</div>
              </div>
            ))}
          </div>
          {biggest && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>
              Plus grosse US : <strong style={{ color: "var(--text)" }}>{biggest.story}</strong> ({biggest.estimate} pts)
            </p>
          )}
          {total === 0 && <p style={{ fontSize: 13, color: "var(--text-faint)", marginBottom: 16 }}>Aucune story chiffrée dans cette session.</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-block" onClick={onCancel}>Annuler</button>
            <button className="btn btn-danger btn-block" onClick={onConfirm} disabled={loading}>
              {loading ? "Clôture…" : "Clore la session"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Room ── */
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
  const [showHistory, setShowHistory] = useState(false);

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

  /* Presence — heartbeat toutes les 40s, offline à la fermeture */
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
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, padding: 24 }}>
      <div style={{ fontSize: 30 }}>🃏</div>
      <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Room introuvable</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Ce code n'existe pas ou la room a expiré.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: 8, textDecoration: "none" }}>Retour à l'accueil</a>
    </div>
  );

  if (!room) return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
      Chargement…
    </div>
  );

  const participants = room.participants || {};
  const votes = room.votes || {};
  const revealed = room.revealed || false;
  const status = room.status || "waiting";
  const history = room.history || [];
  const sequence = getSequence(room.sequence);
  const deck = getDeck(room.sequence);

  if (status === "closed") return <ClosedView history={history} code={code} />;

  /* Online si lastSeen < 2 min (ou pas encore de lastSeen) */
  function isOnline(p) {
    if (p.online === false) return false;
    if (!p.lastSeen) return true;
    return Date.now() - (p.lastSeen.toDate?.().getTime() ?? Date.now()) < 120000;
  }

  /* Ordre stable : tri par joinedAt */
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

  const statusBadge = {
    voting: { label: "Vote en cours", cls: "badge-accent", dot: true },
    revealed: { label: "Votes révélés", cls: "badge-amber" },
    waiting: { label: "En attente", cls: "badge-muted" },
  }[status] ?? { label: status, cls: "badge-muted" };

  return (
    <div className="app-shell">
      {showClosing && <CloseModal history={history} onConfirm={closeSession} onCancel={() => setShowClosing(false)} loading={closing} />}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* ── Sidebar ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, background: "var(--accent-soft)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🃏</div>
            <span style={{ fontSize: 14, fontWeight: 800, color: "var(--text)" }}>Poker Planning</span>
          </a>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: 1 }}>Room</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent-text)", letterSpacing: 2 }}>{code}</div>
            </div>
            <span className="badge badge-muted">{sequence.label}</span>
          </div>
        </div>

        <div className="sidebar-body">
          {onlinePlayers.length > 0 && (
            <>
              <div className="sidebar-section">Connectés ({onlinePlayers.length})</div>
              {onlinePlayers.map(([pName, data]) => (
                <div key={pName} className="roster-row">
                  <div className="roster-name">
                    <span className="status-dot on" />
                    <span>{pName}</span>
                  </div>
                  {revealed && votes[pName] !== undefined
                    ? <span className="badge badge-accent" style={{ padding: "2px 9px" }}>{votes[pName]}</span>
                    : data.voted
                      ? <span style={{ color: "var(--accent)", display: "flex" }}><IconCheck size={14} /></span>
                      : <span style={{ color: "var(--text-faint)", fontSize: 12 }}>…</span>
                  }
                </div>
              ))}
            </>
          )}

          {offlinePlayers.length > 0 && (
            <>
              <div className="sidebar-section">Déconnectés</div>
              {offlinePlayers.map(([pName]) => (
                <div key={pName} className="roster-row" style={{ opacity: 0.5 }}>
                  <div className="roster-name">
                    <span className="status-dot off" />
                    <span style={{ textDecoration: "line-through" }}>{pName}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {allJoined.length === 0 && (
            <div style={{ padding: "16px 8px", fontSize: 13, color: "var(--text-faint)", textAlign: "center" }}>
              Aucun participant pour l'instant
            </div>
          )}
        </div>

        <div className="sidebar-foot">
          {isPO && (
            <button className="btn btn-ghost btn-sm btn-block" onClick={() => setShowClosing(true)} style={{ color: "var(--text-muted)" }}>
              Clore la session
            </button>
          )}
          <button className="btn btn-secondary btn-sm btn-block" onClick={copyLink}>
            {copied ? <><IconCheck size={14} /> Lien copié !</> : <><IconCopy size={14} /> Copier le lien</>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-area">
        <div className="topbar">
          <button className="topbar-burger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <IconMenu size={20} />
          </button>

          <nav style={{ display: "flex", alignItems: "center", gap: 7, flex: 1, minWidth: 0 }}>
            <a href="/" style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>Accueil</a>
            <span style={{ color: "var(--text-faint)", fontSize: 13 }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", letterSpacing: 1 }}>{code}</span>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span className={`badge ${statusBadge.cls}`}>
              {statusBadge.dot && <span className="dot" />}
              {statusBadge.label}
            </span>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
              {isPO ? `${name} · PO` : name}
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="content">
          <div className="content-inner">
            {/* Story header */}
            <div className="story-header">
              {editingStory ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={editStoryVal}
                    onChange={(e) => setEditStoryVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEditStory(); if (e.key === "Escape") setEditingStory(false); }}
                    autoFocus
                    className="input"
                    style={{ fontSize: 18, fontWeight: 700, flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={saveEditStory} disabled={!editStoryVal.trim()}>OK</button>
                  <button className="btn btn-ghost btn-icon" onClick={() => setEditingStory(false)}>✕</button>
                </div>
              ) : (
                <>
                  <span className="story-eyebrow">{room.currentStory ? "User story en cours" : "Session"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h1 className="story-title">
                      {room.currentStory || (isPO ? "Démarrer une story" : "En attente du PO…")}
                    </h1>
                    {isPO && room.currentStory && (
                      <button className="btn-icon" onClick={startEditStory} title="Modifier le titre" style={{ width: 32, height: 32 }}>
                        <IconEdit size={15} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Bandeau mi-session */}
            {joinedMidSession && (
              <div className="note note-amber" style={{ marginBottom: 18 }}>
                <span>⚠️</span>
                <span>Tu as rejoint en cours de session — {status === "voting" ? "le vote est en cours, tu peux voter" : "les votes viennent d'être révélés"}.</span>
              </div>
            )}

            {/* PO en attente : démarrer une story */}
            {isPO && status === "waiting" && <StoryInput onAdd={startStory} disabled={false} />}

            {/* Participant : vote (modifiable jusqu'à la révélation) */}
            {!isPO && status === "voting" && (
              <div className="vote-panel">
                <div className="vote-panel-head">
                  <span>Ton vote</span>
                  {hasVoted
                    ? <span className="vote-hint"><IconCheck size={14} /> Enregistré · tu peux encore changer</span>
                    : <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-faint)" }}>Choisis une carte · {sequence.label}</span>}
                </div>
                <VoteCards values={deck} onVote={castVote} selectedVote={votes[name]} disabled={false} />
              </div>
            )}

            {/* PO en vote : barre de révélation */}
            {isPO && status === "voting" && (
              <div className="action-bar">
                <span>{voteCount} / {onlinePlayers.length} vote{voteCount !== 1 ? "s" : ""} reçu{voteCount !== 1 ? "s" : ""}</span>
                <button
                  className={`btn ${voteCount === onlinePlayers.length && voteCount > 0 ? "btn-primary" : "btn-secondary"}`}
                  onClick={reveal}
                  disabled={voteCount === 0}
                >
                  {voteCount === onlinePlayers.length && voteCount > 0 ? <><IconCheck size={15} /> Révéler les votes</> : `Révéler (${voteCount}/${onlinePlayers.length})`}
                </button>
              </div>
            )}

            {/* Participants */}
            {allJoined.length > 0 && (
              <div style={{ marginBottom: 26 }}>
                <p className="section-label">Participants</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
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
              <div className="card" style={{ textAlign: "center", color: "var(--text-faint)", fontSize: 13, padding: 32, marginBottom: 20 }}>
                En attente des participants — partagez le lien de la room.
              </div>
            )}

            {/* Résultats */}
            {revealed && results && (
              <>
                <Results average={results.average} recommendation={results.recommendation} needsDiscussion={results.needsDiscussion} votes={votes} />

                {isPO && (
                  <div className="vote-panel" style={{ marginTop: 14 }}>
                    <p className="section-label" style={{ marginBottom: 12 }}>Chiffrage final retenu</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number" min={1} max={100}
                        value={finalEstimate}
                        onChange={(e) => setFinalEstimate(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && validateAndNext()}
                        placeholder={results.recommendation}
                        autoFocus
                        className="input"
                        style={{ fontSize: 22, fontWeight: 800, textAlign: "center", width: 96, flexShrink: 0 }}
                      />
                      <button className="btn btn-primary" onClick={validateAndNext} disabled={!finalEstimate || isNaN(parseInt(finalEstimate, 10))} style={{ flex: 1 }}>
                        Valider & suivant
                      </button>
                      <button className="btn btn-secondary btn-icon" onClick={reVote} title="Relancer un vote (garder la story)" style={{ flexShrink: 0 }}>
                        <IconChevronLeft size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Historique (repliable) */}
            {history.length > 0 && (
              <div style={{ marginTop: 30 }}>
                <button className="history-toggle" onClick={() => setShowHistory((v) => !v)}>
                  <svg className={`history-chevron ${showHistory ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  Historique ({history.length})
                </button>
                {showHistory && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[...history].reverse().map((entry, i) => (
                      <div key={i} className="history-row">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.story}</div>
                          {entry.average !== null && (
                            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>
                              Moy. {entry.average} · Reco. {entry.recommendation}{entry.needsDiscussion && " · ⚠️"}
                            </div>
                          )}
                        </div>
                        <div className="history-estimate">{entry.estimate}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
