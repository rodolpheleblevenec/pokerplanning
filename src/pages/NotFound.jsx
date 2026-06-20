import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 12, padding: 24,
    }}>
      <div style={{
        width: 54, height: 54, background: "var(--accent-soft)", borderRadius: 14,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
      }}>🃏</div>
      <h1 style={{ fontSize: 19, fontWeight: 800, color: "var(--text)" }}>Page introuvable</h1>
      <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", maxWidth: 280 }}>
        Ce lien n'existe pas ou la room a expiré.
      </p>
      <button className="btn btn-primary" onClick={() => navigate("/")} style={{ marginTop: 8 }}>
        Retour à l'accueil
      </button>
    </div>
  );
}
