import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/Toast";
import FeaturesModal from "../components/FeaturesModal";
import ThemeToggle from "../components/ThemeToggle";
import Segmented from "../components/Segmented";
import { SEQUENCES, getSequence } from "../sequences";
import { IconArrowRight, IconChevronLeft } from "../components/Icons";

const WORDS = [
  "JARDIN", "SOLEIL", "MAISON", "CHEMIN", "MOUTON", "CANARD", "CHEVAL", "PIERRE",
  "FLEUVE", "MARCHE", "RAPIDE", "ORANGE", "VIOLET", "BUREAU", "NATION", "SAISON",
  "VOYAGE", "MARRON", "PRISON", "FLEURS", "TOMATE", "CARNET", "MIROIR", "BOUGIE",
  "BALLON", "BANANE", "CAHIER", "CASQUE", "CLOCHE", "COMBAT", "DESSIN", "DISQUE",
  "DRAGON", "ENFANT", "FACILE", "GARAGE", "GATEAU", "GRILLE", "HAMEAU", "JUNGLE",
  "LETTRE", "LIMITE", "LUSTRE", "MARAIS", "MEUBLE", "MONTRE", "MOUCHE", "MUSEAU",
  "NUAGES", "OISEAU", "PALAIS", "PAPIER", "PARDON", "PAROLE", "PELOTE", "PHRASE",
  "PIGEON", "PILOTE", "PLANTE", "PLAQUE", "POULET", "POUMON", "PROJET", "PROPRE",
  "PUZZLE", "QUARTZ", "RADEAU", "RAISIN", "RENARD", "REQUIN", "RESEAU", "RIDEAU",
  "RIVAGE", "ROSEAU", "SABLES", "SAUMON", "SAVANE", "SECRET", "SIGNAL", "SIRENE",
  "SOLDAT", "SOMMET", "SOURIS", "STATUE", "TALENT", "TAMPON", "TOISON", "TURBAN",
  "UNIQUE", "VALISE", "VENTRE", "VERGER", "VIANDE", "VILAIN", "VISION", "VOLANT",
  "VOLCAN",
];

function randomCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

// Caractères interdits dans une clé de champ Firestore (chemin pointé)
function cleanName(v) {
  return v.replace(/[.#$/[\]~*`]/g, "").slice(0, 20);
}

function BackBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="btn btn-ghost btn-sm"
      style={{ padding: "4px 6px", marginBottom: 14, marginLeft: -6, gap: 4 }}
    >
      <IconChevronLeft size={14} /> Retour
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState("landing");
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Création
  const [poName, setPoName] = useState("");
  const [sequence, setSequence] = useState("fib");

  // Rejoindre
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [joinData, setJoinData] = useState(null);
  const [joinName, setJoinName] = useState("");

  const mySessions = JSON.parse(localStorage.getItem("poker_my_sessions") || "[]");

  function reset(toStep) {
    setRoomCode(""); setRoomError(""); setJoinName(""); setJoinData(null); setStep(toStep);
  }

  async function handleCreate() {
    const name = poName.trim();
    if (!name) return;
    setLoading(true);
    try {
      const code = randomCode();
      await setDoc(doc(db, "rooms", code), {
        createdBy: name, status: "waiting", currentStory: "", sequence,
        participants: {}, votes: {}, revealed: false, createdAt: serverTimestamp(),
      });
      localStorage.setItem(`poker_room_${code}_role`, "po");
      localStorage.setItem(`poker_room_${code}_name`, name);
      const sessions = JSON.parse(localStorage.getItem("poker_my_sessions") || "[]");
      sessions.unshift({ code, createdAt: new Date().toISOString() });
      localStorage.setItem("poker_my_sessions", JSON.stringify(sessions.slice(0, 30)));
      navigate(`/room/${code}`);
    } catch {
      toast("Erreur lors de la création. Réessaie.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinCode() {
    const code = roomCode.toUpperCase();
    if (code.length !== 6) { setRoomError("Le code doit faire 6 lettres"); return; }
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "rooms", code));
      if (!snap.exists()) { setRoomError("Room introuvable — vérifie le code"); return; }
      if (snap.data().status === "closed") { setRoomError("Cette session est terminée"); return; }
      setJoinData(snap.data()); setRoomError(""); setStep("join-name");
    } catch {
      toast("Erreur réseau — vérifie ta connexion.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinName() {
    const name = joinName.trim();
    if (!name) return;
    const code = roomCode.toUpperCase();
    setLoading(true);
    try {
      await updateDoc(doc(db, "rooms", code), {
        [`participants.${name}`]: { voted: false, joined: true, joinedAt: serverTimestamp() },
      });
      localStorage.setItem(`poker_room_${code}_name`, name);
      navigate(`/room/${code}`);
    } catch {
      toast("Impossible de rejoindre. Réessaie.", "error");
    } finally {
      setLoading(false);
    }
  }

  const nameTaken = joinData && joinData.participants && Object.keys(joinData.participants).includes(joinName.trim());

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 16, padding: "48px 16px",
    }}>
      <div style={{ position: "fixed", top: 16, right: 16 }}>
        <ThemeToggle />
      </div>

      <div className="panel" style={{ width: "100%", maxWidth: 400, padding: "34px 32px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, background: "var(--accent-soft)", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", fontSize: 24,
          }}>🃏</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.3 }}>
            Poker Planning
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Estimez vos user stories, ensemble.
          </p>
        </div>

        {/* ── Landing ── */}
        {step === "landing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            <button className="btn btn-primary btn-lg btn-block" onClick={() => reset("create")} disabled={loading}>
              Créer une room
            </button>
            <button className="btn btn-secondary btn-lg btn-block" onClick={() => reset("join-code")} disabled={loading}>
              Rejoindre avec un code
            </button>
            {mySessions.length > 0 && (
              <button className="btn btn-ghost btn-sm btn-block" onClick={() => setStep("sessions")} style={{ marginTop: 4 }}>
                Mes sessions ({mySessions.length})
              </button>
            )}
          </div>
        )}

        {/* ── Create ── */}
        {step === "create" && (
          <div>
            <BackBtn onClick={() => reset("landing")} />
            <label className="field-label">Ton prénom (Product Owner)</label>
            <input
              className="input"
              value={poName}
              onChange={(e) => setPoName(cleanName(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Ex : Camille"
              autoFocus
              style={{ marginBottom: 20 }}
            />

            <label className="field-label">Suite de cartes</label>
            <Segmented
              full
              value={sequence}
              onChange={setSequence}
              options={Object.values(SEQUENCES).map((s) => ({ value: s.key, label: s.label }))}
            />
            <p className="field-hint" style={{ margin: "8px 0 12px" }}>{getSequence(sequence).hint}</p>
            <div className="deck" style={{ gap: 6, marginBottom: 22, pointerEvents: "none" }}>
              {getSequence(sequence).values.map((v) => (
                <div key={v} className="vote-card mini">{v}</div>
              ))}
            </div>

            <button className="btn btn-primary btn-block" onClick={handleCreate} disabled={!poName.trim() || loading}>
              {loading ? "Création…" : <>Créer la room <IconArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── Join : code ── */}
        {step === "join-code" && (
          <div>
            <BackBtn onClick={() => reset("landing")} />
            <label className="field-label">Code de la room</label>
            <p className="field-hint" style={{ marginBottom: 12 }}>6 lettres communiquées par le PO.</p>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => { setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); setRoomError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinCode()}
              placeholder="JARDIN"
              autoFocus
              className="input"
              style={{
                fontSize: 24, letterSpacing: 8, textAlign: "center", fontWeight: 800,
                marginBottom: roomError ? 6 : 16, textTransform: "uppercase",
                borderColor: roomError ? "var(--danger)" : undefined,
              }}
            />
            {roomError && <p style={{ color: "var(--danger-text)", fontSize: 12, margin: "0 0 12px" }}>{roomError}</p>}
            <button className="btn btn-primary btn-block" onClick={handleJoinCode} disabled={roomCode.length !== 6 || loading}>
              {loading ? "Vérification…" : <>Continuer <IconArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── Join : name ── */}
        {step === "join-name" && (
          <div>
            <BackBtn onClick={() => setStep("join-code")} />
            <label className="field-label">Ton prénom</label>
            <p className="field-hint" style={{ marginBottom: 12 }}>
              Room <strong style={{ color: "var(--text)", letterSpacing: 1 }}>{roomCode.toUpperCase()}</strong>
              {joinData?.sequence && <> · {getSequence(joinData.sequence).label}</>}
            </p>
            <input
              className="input"
              value={joinName}
              onChange={(e) => setJoinName(cleanName(e.target.value))}
              onKeyDown={(e) => e.key === "Enter" && handleJoinName()}
              placeholder="Ex : Alex"
              autoFocus
              style={{ marginBottom: nameTaken ? 6 : 16 }}
            />
            {nameTaken && (
              <p style={{ color: "var(--amber-text)", fontSize: 12, margin: "0 0 12px" }}>
                Ce prénom est déjà dans la room — continue si c'est bien toi.
              </p>
            )}
            <button className="btn btn-primary btn-block" onClick={handleJoinName} disabled={!joinName.trim() || loading}>
              {loading ? "Connexion…" : <>Rejoindre <IconArrowRight size={16} /></>}
            </button>
          </div>
        )}

        {/* ── Sessions ── */}
        {step === "sessions" && (
          <div>
            <BackBtn onClick={() => reset("landing")} />
            <label className="field-label">Mes sessions</label>
            <p className="field-hint" style={{ marginBottom: 14 }}>Retrouve l'historique d'une de tes rooms.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {mySessions.map((s) => {
                const date = new Date(s.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                });
                return (
                  <button
                    key={s.code}
                    onClick={() => navigate(`/room/${s.code}`)}
                    className="card"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      cursor: "pointer", padding: "12px 16px", textAlign: "left",
                      fontFamily: "inherit",
                    }}
                  >
                    <span style={{ fontWeight: 700, letterSpacing: 1, color: "var(--text)" }}>{s.code}</span>
                    <span style={{ fontSize: 12, color: "var(--text-faint)" }}>{date}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setFeaturesOpen(true)}
        style={{
          background: "none", border: "none", color: "var(--text-faint)", fontSize: 12,
          cursor: "pointer", fontFamily: "inherit", padding: 4,
          textDecoration: "underline", textUnderlineOffset: 3,
        }}
      >
        Fonctionnalités
      </button>

      <FeaturesModal open={featuresOpen} onClose={() => setFeaturesOpen(false)} />
    </div>
  );
}
