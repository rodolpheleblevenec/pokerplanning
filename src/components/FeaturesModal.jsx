import { useEffect } from "react";

/*
  Panneau "Fonctionnalités" — petit récap de tout ce que fait le produit.
  Accessible via le lien discret en bas de l'accueil.
*/

const SECTIONS = [
  {
    title: "Sessions & rooms",
    items: [
      ["🃏", "Rooms à code mémorable", "Un mot de 6 lettres facile à dicter à voix haute."],
      ["🔗", "Lien de partage", "Invite toute l'équipe en un clic."],
      ["💾", "Mes sessions", "Retrouve tes dernières rooms créées."],
      ["✅", "Clôture & récap", "Bilan de session copiable en un bouton."],
      ["🧹", "Nettoyage auto", "Les vieilles rooms s'effacent toutes seules."],
    ],
  },
  {
    title: "Vote",
    items: [
      ["🗳️", "Cartes 1 → 10", "Vote en un tap."],
      ["✏️", "Vote modifiable", "Change ton choix jusqu'à la révélation."],
      ["👀", "Révélation synchro", "Tout le monde découvre les votes en même temps."],
      ["🎴", "Cartes animées", "Effet de retournement 3D au moment du reveal."],
      ["📊", "Moyenne & reco", "Calculées automatiquement à chaque tour."],
      ["⚠️", "Alerte discussion", "Signale les écarts de votes trop importants."],
      ["🎯", "Chiffrage final", "Le PO tranche, ou relance un vote."],
    ],
  },
  {
    title: "Collaboration",
    items: [
      ["👤", "Rôles PO / votants", "Chacun son interface adaptée."],
      ["🟢", "Présence en direct", "Qui est connecté, en temps réel."],
      ["✍️", "Édition de la story", "Corrige le titre à la volée."],
      ["🕑", "Historique", "Toutes les stories chiffrées de la session."],
      ["📱", "Responsive", "Fonctionne aussi sur mobile."],
    ],
  },
];

const SOON = ["Suite de Fibonacci", "Prénom libre", "Export CSV", "Thème sombre"];

export default function FeaturesModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 400,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 14, width: "100%", maxWidth: 460,
          maxHeight: "85vh", display: "flex", flexDirection: "column",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)", overflow: "hidden",
          animation: "slideUp 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "22px 24px 16px", borderBottom: "1px solid #f0f1f3",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 3px" }}>
              Tout ce que fait Poker Planning
            </h2>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              Le tour complet des fonctionnalités · v2
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            style={{
              background: "none", border: "none", cursor: "pointer", color: "#9ca3af",
              fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0, fontFamily: "inherit",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "4px 24px 20px", overflowY: "auto" }}>
          {SECTIONS.map((sec) => (
            <div key={sec.title} style={{ marginTop: 18 }}>
              <p style={{
                fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
                letterSpacing: 1, margin: "0 0 10px",
              }}>
                {sec.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {sec.items.map(([icon, title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, lineHeight: 1.3, flexShrink: 0, width: 20, textAlign: "center" }}>
                      {icon}
                    </span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Idées à venir */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px dashed #e5e7eb" }}>
            <p style={{
              fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase",
              letterSpacing: 1, margin: "0 0 10px",
            }}>
              Idées à venir
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SOON.map((s) => (
                <span key={s} style={{
                  fontSize: 11, fontWeight: 500, color: "#6b7280", background: "#f3f4f6",
                  border: "1px solid #e5e7eb", borderRadius: 20, padding: "4px 11px",
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
