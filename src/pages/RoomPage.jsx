import { useState } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Room from "../components/Room";

const NAMES = ["Djamal", "Nicolas", "Moez", "Paul", "Malek", "Autre"];

export default function RoomPage() {
  const { sessionId: code } = useParams();
  const isPO = localStorage.getItem(`poker_room_${code}_role`) === "po";
  const savedName = localStorage.getItem(`poker_room_${code}_name`);

  const [name, setName] = useState(savedName || "");
  const [loading, setLoading] = useState(false);

  async function joinAs(chosen) {
    setLoading(true);
    try {
      await updateDoc(doc(db, "rooms", code), {
        [`participants.${chosen}`]: { voted: false, joined: true },
      });
      localStorage.setItem(`poker_room_${code}_name`, chosen);
      setName(chosen);
    } finally {
      setLoading(false);
    }
  }

  // Lien partagé sans identité → sélecteur de prénom
  if (!isPO && !name) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100dvh", background: "#f4f5f9",
        fontFamily: "Inter, system-ui, sans-serif", padding: "0 16px",
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: "36px 40px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)", width: "100%", maxWidth: 360,
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, background: "#12121f", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", fontSize: 22,
            }}>
              🃏
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
              Rejoindre la room
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
              <strong style={{ color: "#111827", letterSpacing: 1 }}>{code}</strong>
            </p>
          </div>

          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px", textAlign: "center" }}>
            Qui êtes-vous ?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {NAMES.map((n) => (
              <button
                key={n}
                onClick={() => joinAs(n)}
                disabled={loading}
                style={{
                  padding: "11px 16px", background: "#fff", color: "#111827",
                  border: "1.5px solid #e5e7eb", borderRadius: 8,
                  fontSize: 14, fontWeight: 500, textAlign: "left",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#12121f",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {n[0]}
                </span>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <Room code={code} isPO={isPO} name={isPO ? "Rodolphe" : name} />;
}
