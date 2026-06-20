import { useEffect } from "react";
import { IconX } from "./Icons";

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
      ["🎚️", "Suite au choix", "Linéaire (1→10) ou Fibonacci, choisie à la création."],
      ["✏️", "Vote modifiable", "Change ton choix jusqu'à la révélation."],
      ["👀", "Révélation synchro", "Tout le monde découvre les votes en même temps."],
      ["🎴", "Cartes animées", "Effet de retournement 3D au moment du reveal."],
      ["📊", "Moyenne, reco & distribution", "Calculées automatiquement à chaque tour."],
      ["⚠️", "Alerte discussion", "Signale les écarts de votes trop importants."],
      ["🎯", "Chiffrage final", "Le PO tranche, ou relance un vote."],
    ],
  },
  {
    title: "Confort & collaboration",
    items: [
      ["🙋", "Prénom libre", "Chacun saisit son prénom à l'arrivée."],
      ["🌙", "Thème clair / sombre", "Bascule en un clic, mémorisée."],
      ["🟢", "Présence en direct", "Qui est connecté, en temps réel."],
      ["✍️", "Édition de la story", "Corrige le titre à la volée."],
      ["🕑", "Historique", "Toutes les stories chiffrées de la session."],
      ["📱", "Responsive", "Fonctionne aussi sur mobile."],
    ],
  },
];

const SOON = ["Cartes ½ / ? / ☕", "Minuteur de vote", "Export CSV", "Comptes & équipes"];

export default function FeaturesModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 3 }}>
              Tout ce que fait Poker Planning
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Le tour complet des fonctionnalités · v3</p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Fermer" style={{ flexShrink: 0 }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "4px 24px 20px", overflowY: "auto" }}>
          {SECTIONS.map((sec) => (
            <div key={sec.title} style={{ marginTop: 18 }}>
              <p className="section-label" style={{ margin: "0 0 10px" }}>{sec.title}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {sec.items.map(([icon, title, desc]) => (
                  <div key={title} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, lineHeight: 1.3, flexShrink: 0, width: 20, textAlign: "center" }}>{icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>{title}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Idées à venir */}
          <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px dashed var(--border-strong)" }}>
            <p className="section-label" style={{ margin: "0 0 10px" }}>Idées à venir</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SOON.map((s) => (
                <span key={s} className="badge badge-muted">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
