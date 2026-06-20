import { useState } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Room from "../components/Room";
import ThemeToggle from "../components/ThemeToggle";
import { IconArrowRight } from "../components/Icons";

function cleanName(v) {
  return v.replace(/[.#$/[\]~*`]/g, "").slice(0, 20);
}

export default function RoomPage() {
  const { sessionId: code } = useParams();
  const isPO = localStorage.getItem(`poker_room_${code}_role`) === "po";
  const savedName = localStorage.getItem(`poker_room_${code}_name`);

  const [name, setName] = useState(savedName || "");
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);

  async function joinAs(chosen) {
    const clean = chosen.trim();
    if (!clean) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "rooms", code), {
        [`participants.${clean}`]: { voted: false, joined: true, joinedAt: serverTimestamp() },
      });
      localStorage.setItem(`poker_room_${code}_name`, clean);
      setName(clean);
    } finally {
      setLoading(false);
    }
  }

  // Lien partagé sans identité → saisie du prénom (libre)
  if (!isPO && !name) {
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 16, padding: "48px 16px",
      }}>
        <div style={{ position: "fixed", top: 16, right: 16 }}>
          <ThemeToggle />
        </div>

        <div className="panel" style={{ width: "100%", maxWidth: 360, padding: "34px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, background: "var(--accent-soft)", borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", fontSize: 24,
            }}>🃏</div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)" }}>Rejoindre la room</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              <strong style={{ color: "var(--text)", letterSpacing: 1 }}>{code}</strong>
            </p>
          </div>

          <label className="field-label">Ton prénom</label>
          <input
            className="input"
            value={typed}
            onChange={(e) => setTyped(cleanName(e.target.value))}
            onKeyDown={(e) => e.key === "Enter" && joinAs(typed)}
            placeholder="Ex : Alex"
            autoFocus
            disabled={loading}
            style={{ marginBottom: 16 }}
          />
          <button className="btn btn-primary btn-block" onClick={() => joinAs(typed)} disabled={!typed.trim() || loading}>
            {loading ? "Connexion…" : <>Rejoindre <IconArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    );
  }

  return <Room code={code} isPO={isPO} name={isPO ? (savedName || "PO") : name} />;
}
