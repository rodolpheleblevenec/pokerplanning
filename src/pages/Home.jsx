import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../layout.css";

const ADMIN_PIN = "1234"; // Modifier ici pour changer le PIN

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

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "#12121f",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "none", border: "none", color: "#6b7280", fontSize: 13,
      cursor: "pointer", padding: "0 0 20px", display: "flex", alignItems: "center", gap: 6,
    }}>
      ← Retour
    </button>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [step, setStep] = useState("landing");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [loading, setLoading] = useState(false);

  function reset(toStep) {
    setPin(""); setPinError("");
    setRoomCode(""); setRoomError("");
    setStep(toStep);
  }

  const mySessions = JSON.parse(localStorage.getItem("poker_my_sessions") || "[]");

  async function handleCreate() {
    if (pin !== ADMIN_PIN) { setPinError("Code PIN incorrect"); return; }
    setLoading(true);
    try {
      const code = randomCode();
      await setDoc(doc(db, "rooms", code), {
        createdBy: "Rodolphe",
        status: "waiting",
        currentStory: "",
        participants: {},
        votes: {},
        revealed: false,
        createdAt: serverTimestamp(),
      });
      localStorage.setItem(`poker_room_${code}_role`, "po");
      const sessions = JSON.parse(localStorage.getItem("poker_my_sessions") || "[]");
      sessions.unshift({ code, createdAt: new Date().toISOString() });
      localStorage.setItem("poker_my_sessions", JSON.stringify(sessions.slice(0, 30)));
      navigate(`/room/${code}`);
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
      setRoomError("");
      setStep("join-name");
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      display: "flex", height: "100dvh", alignItems: "center", justifyContent: "center",
      background: "#f4f5f9", fontFamily: "Inter, system-ui, sans-serif", padding: "0 16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: "40px 40px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)", width: "100%", maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, background: "#12121f", borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px", fontSize: 24,
          }}>
            🃏
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
            Poker Planning
          </h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
            Sessions de refinement en équipe
          </p>
        </div>

        {/* Step: landing */}
        {step === "landing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setStep("create-pin")}
                style={{
                  flex: 1, padding: "14px 0", background: "#12121f", color: "#fff",
                  border: "none", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}
              >
                Créer une room
              </button>
              <button
                onClick={() => setStep("join-code")}
                style={{
                  flex: 1, padding: "14px 0", background: "#fff", color: "#111827",
                  border: "2px solid #e5e7eb", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer",
                }}
              >
                Rejoindre
              </button>
            </div>
            {mySessions.length > 0 && (
              <button
                onClick={() => setStep("sessions")}
                style={{
                  width: "100%", padding: "11px 0", background: "#f4f5f9", color: "#6b7280",
                  border: "none", borderRadius: 10, fontWeight: 500, fontSize: 13, cursor: "pointer",
                }}
              >
                Mes sessions ({mySessions.length})
              </button>
            )}
          </div>
        )}

        {/* Step: PIN */}
        {step === "create-pin" && (
          <div>
            <BackButton onClick={() => reset("landing")} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Code PIN</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
              Entrez le code PIN pour créer une room.
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setPinError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="••••"
              autoFocus
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                border: `1.5px solid ${pinError ? "#ef4444" : "#e5e7eb"}`,
                fontSize: 22, letterSpacing: 10, textAlign: "center",
                outline: "none", marginBottom: 6,
              }}
            />
            {pinError && <p style={{ color: "#ef4444", fontSize: 12, margin: "0 0 10px" }}>{pinError}</p>}
            <button
              onClick={handleCreate}
              disabled={pin.length !== 4 || loading}
              style={{
                width: "100%", marginTop: 16, padding: "12px", background: "#2563eb", color: "#fff",
                border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14,
                cursor: pin.length !== 4 || loading ? "not-allowed" : "pointer",
                opacity: pin.length !== 4 || loading ? 0.5 : 1,
              }}
            >
              {loading ? "Création…" : "Créer la room"}
            </button>
          </div>
        )}

        {/* Step: room code */}
        {step === "join-code" && (
          <div>
            <BackButton onClick={() => reset("landing")} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Code de la room</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
              Entrez le code à 6 lettres communiqué par le PO.
            </p>
            <input
              type="text"
              maxLength={6}
              value={roomCode}
              onChange={(e) => { setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, "")); setRoomError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinCode()}
              placeholder="JARDIN"
              autoFocus
              style={{
                width: "100%", padding: "12px", borderRadius: 8,
                border: `1.5px solid ${roomError ? "#ef4444" : "#e5e7eb"}`,
                fontSize: 24, letterSpacing: 8, textAlign: "center", fontWeight: 700,
                outline: "none", marginBottom: 6, textTransform: "uppercase",
              }}
            />
            {roomError && <p style={{ color: "#ef4444", fontSize: 12, margin: "0 0 10px" }}>{roomError}</p>}
            <button
              onClick={handleJoinCode}
              disabled={roomCode.length !== 6 || loading}
              style={{
                width: "100%", marginTop: 16, padding: "12px", background: "#2563eb", color: "#fff",
                border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14,
                cursor: roomCode.length !== 6 || loading ? "not-allowed" : "pointer",
                opacity: roomCode.length !== 6 || loading ? 0.5 : 1,
              }}
            >
              {loading ? "Vérification…" : "Continuer →"}
            </button>
          </div>
        )}

        {/* Step: mes sessions */}
        {step === "sessions" && (
          <div>
            <BackButton onClick={() => reset("landing")} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Mes sessions</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
              Cliquez sur une session pour retrouver l'historique des chiffrages.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {mySessions.map((s) => {
                const date = new Date(s.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "2-digit", year: "numeric",
                });
                return (
                  <button
                    key={s.code}
                    onClick={() => navigate(`/room/${s.code}`)}
                    style={{
                      padding: "12px 16px", background: "#fff", color: "#111827",
                      border: "1.5px solid #e5e7eb", borderRadius: 8,
                      fontSize: 14, textAlign: "left", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                    }}
                  >
                    <span style={{ fontWeight: 700, letterSpacing: 1, color: "#111827" }}>{s.code}</span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>{date}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: name selection */}
        {step === "join-name" && (
          <div>
            <BackButton onClick={() => setStep("join-code")} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Qui êtes-vous ?</h2>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
              Room <strong>{roomCode.toUpperCase()}</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => handleJoinName(name)}
                  disabled={loading}
                  style={{
                    padding: "11px 14px", background: "#fff", color: "#111827",
                    border: "1.5px solid #e5e7eb", borderRadius: 8,
                    fontSize: 14, fontWeight: 500, textAlign: "left", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <Avatar name={name} size={32} />
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
