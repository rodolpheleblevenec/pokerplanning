import { useState } from "react";
import { useParams } from "react-router-dom";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import Room from "../components/Room";

const ALL_PLAYERS = ["Rodolphe", "Djamal", "Nicolas", "Moez", "Paul", "Malek", "Autre 1", "Autre 2", "Autre 3"];

export default function RoomPage() {
  const { sessionId } = useParams();
  const storageKey = `poker_player_${sessionId}`;
  const [playerName, setPlayerName] = useState(() => localStorage.getItem(storageKey) || "");

  async function chooseName(name) {
    localStorage.setItem(storageKey, name);
    await updateDoc(doc(db, "sessions", sessionId), {
      participants: arrayUnion(name),
    });
    setPlayerName(name);
  }

  if (!playerName) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#f4f5f9",
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          padding: "36px 40px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          width: 340,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>
            Qui êtes-vous ?
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
            Choisissez votre prénom pour rejoindre la session.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ALL_PLAYERS.map((name) => (
              <button
                key={name}
                onClick={() => chooseName(name)}
                style={{
                  background: name === "Rodolphe" ? "#12121f" : "#fff",
                  color: name === "Rodolphe" ? "#fff" : "#111827",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: name === "Rodolphe" ? 700 : 400,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {name}
                {name === "Rodolphe" && (
                  <span style={{ fontSize: 11, color: "#9999bb", fontWeight: 400 }}>Animateur</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <Room sessionId={sessionId} playerName={playerName} />;
}
