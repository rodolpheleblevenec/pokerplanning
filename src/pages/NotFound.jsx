import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100dvh", background: "#f3f4f6",
      fontFamily: "Inter, system-ui, sans-serif", flexDirection: "column", gap: 12,
    }}>
      <div style={{
        width: 52, height: 52, background: "#111827", borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
      }}>🃏</div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Page introuvable</h1>
      <p style={{ fontSize: 13, color: "#6b7280", margin: 0, textAlign: "center", maxWidth: 280 }}>
        Ce lien n'existe pas ou la room a expiré.
      </p>
      <button className="btn btn-primary" onClick={() => navigate("/")} style={{ marginTop: 8 }}>
        Retour à l'accueil
      </button>
    </div>
  );
}
