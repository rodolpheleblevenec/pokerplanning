import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "../components/Toast";
import "../layout.css";

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

const NAMES = ["Djamal", "Nicolas", "Moez", "Paul", "Malek", "Autre"];

function randomCode() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function Avatar({ name, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#1e3a5f", color: "#93c5fd",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: "#6b7280", fontSize: 12,
      cursor: "pointer", padding: "0 0 16px", display: "flex", alignItems: "center", gap: 4,
      fontFamily: "inherit",
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Retour
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState("landing");
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [loading, setLoading] = useState(false);

  const mySessions = JSON.parse(localStorage.getItem("poker_my_sessions") || "[]");

  function reset(toStep) {
    setRoomCode(""); setRoomError(""); setStep(toStep);
  }

  async function handleCreate() {
    setLoading(true);
    try {
      const code = randomCode();
      await setDoc(doc(db, "rooms", code), {
        createdBy: "Rodolphe", status: "waiting", currentStory: "",
        participants: {}, votes: {}, revealed: false, createdAt: serverTimestamp(),
      });
      localStorage.setItem(`poker_room_${code}_role`, "po");
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
      setRoomError(""); setStep("join-name");
    } catch {
      toast("Erreur réseau — vérifie ta connexion.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinName(name) {
    const code = roomCode.toUpperCase();
    setLoading(true);
    try {
      await updateDoc(doc(db, "rooms", code), {
        [`participants.${name}`]: { voted: false, joined: true },
      });
      localStorage.setItem(`poker_room_${code}_name`, name);
      navigate(`/room/${code}`);
    } catch {
      toast("Impossible de rejoindre. Réessaie.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: "flex", height: "100dvh", alignItems: "center", justifyContent: "center",
      background: "#f3f4f6", fontFamily: "Inter, system-ui, sans-serif", padding: "0 16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, padding: "36px 36px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)", width: "100%", maxWidth: 380,
        border: "1px solid #e5e7eb",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, background: "#111827", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px", fontSize: 22,
          }}>🃏</div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
            Poker Planning
          </h1>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
            Sessions de refinement agile
          </p>
        </div>

        {/* Landing */}
        {step === "landing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary" onClick={handleCreate} disabled={loading} style={{ flex: 1 }}>
                {loading ? "Création…" : "Créer une room"}
              </button>
              <button className="btn btn-ghost" onClick={() => setStep("join-code")} style={{ flex: 1 }}>
                Rejoindre
              </button>
            </div>
            {mySessions.length > 0 && (
              <button className="btn btn-ghost" onClick={() => setStep("sessions")} style={{ width: "100%", fontSize: 12, color: "#6b7280" }}>
                Mes sessions ({mySessions.length})
              </button>
            )}
          </div>
        )}

        {/* Room code */}
        {step === "join-code" && (
          <div>
            <BackBtn onClick={() => reset("landing")} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Code de la room</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px" }}>6 lettres communiquées par le PO.</p>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => { setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); setRoomError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinCode()}
              placeholder="JARDIN"
              autoFocus
              style={{
                width: "100%", padding: "12px", borderRadius: 7,
                border: `1px solid ${roomError ? "#dc2626" : "#e5e7eb"}`,
                fontSize: 22, letterSpacing: 8, textAlign: "center", fontWeight: 700,
                outline: "none", marginBottom: roomError ? 6 : 16,
                fontFamily: "inherit", color: "#111827", textTransform: "uppercase",
              }}
            />
            {roomError && <p style={{ color: "#dc2626", fontSize: 12, margin: "0 0 12px" }}>{roomError}</p>}
            <button className="btn btn-primary" onClick={handleJoinCode}
              disabled={roomCode.length !== 6 || loading} style={{ width: "100%" }}>
              {loading ? "Vérification…" : "Continuer →"}
            </button>
          </div>
        )}

        {/* Name selection */}
        {step === "join-name" && (
          <div>
            <BackBtn onClick={() => setStep("join-code")} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Qui êtes-vous ?</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px" }}>
              Room <strong style={{ color: "#111827", letterSpacing: 1 }}>{roomCode.toUpperCase()}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {NAMES.map((n) => (
                <button key={n} onClick={() => handleJoinName(n)} disabled={loading}
                  style={{
                    padding: "10px 14px", background: "#fff", color: "#111827",
                    border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, fontWeight: 500,
                    textAlign: "left", cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    opacity: loading ? 0.6 : 1, fontFamily: "inherit",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.background = "#f8faff"; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#fff"; }}
                >
                  <Avatar name={n} size={30} />
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sessions history */}
        {step === "sessions" && (
          <div>
            <BackBtn onClick={() => reset("landing")} />
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Mes sessions</p>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 16px" }}>
              Cliquez pour retrouver l'historique d'une session.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {mySessions.map((s) => {
                const date = new Date(s.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                });
                return (
                  <button key={s.code} onClick={() => navigate(`/room/${s.code}`)}
                    style={{
                      padding: "10px 14px", background: "#fff", border: "1px solid #e5e7eb",
                      borderRadius: 7, fontSize: 13, textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      fontFamily: "inherit", transition: "border-color 0.15s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = "#bfdbfe"}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                  >
                    <span style={{ fontWeight: 700, letterSpacing: 1, color: "#111827" }}>{s.code}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>{date}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
