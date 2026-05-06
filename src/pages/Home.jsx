import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import "../layout.css";

const MOCK_SESSIONS = [
  { id: "PP-2026-01", title: "Refinement 28/04/2026", participants: ["Djamal", "Nicolas", "Moez", "Sarah"], status: "active" },
  { id: "PP-2026-02", title: "Refinement 21/04/2026", participants: ["Djamal", "Nicolas", "Moez"], status: "closed" },
  { id: "PP-2026-03", title: "Refinement 14/04/2026", participants: ["Nicolas", "Sarah", "Karim"], status: "closed" },
];

function StatusBadge({ status }) {
  const isActive = status === "active";
  return (
    <span style={{
      backgroundColor: isActive ? "#dcfce7" : "#f3f4f6",
      color: isActive ? "#16a34a" : "#6b7280",
      padding: "2px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {isActive ? "Active" : "Clôturée"}
    </span>
  );
}

function SessionCard({ session }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 10,
      padding: "16px 20px",
      marginBottom: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3 }}>#{session.id}</div>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.title}
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.participants.join(" · ")}
        </div>
      </div>
      <StatusBadge status={session.status} />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleNewSession() {
    setLoading(true);
    try {
      const today = new Date();
      const formatted = today.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
      const docRef = await addDoc(collection(db, "sessions"), {
        title: `Refinement ${formatted}`,
        createdAt: serverTimestamp(),
        status: "active",
        stories: [],
      });
      navigate(`/room/${docRef.id}`);
    } finally {
      setLoading(false);
    }
  }

  const filtered = MOCK_SESSIONS.filter((s) => {
    const matchesTab = activeTab === "active" ? s.status === "active" : s.status === "closed";
    return matchesTab && s.title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="app-shell">
      {/* Mobile topbar */}
      <div className="topbar">
        <span className="topbar-title">Poker Planning</span>
        <button className="burger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>

      {/* Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 28 }}>
          Poker Planning
        </div>

        <button
          onClick={handleNewSession}
          disabled={loading}
          style={{
            background: "#2563eb", color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 0", fontWeight: 600, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, marginBottom: 28,
          }}
        >
          {loading ? "Création..." : "+ Nouvelle session"}
        </button>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[{ label: "Sessions actives", value: "active" }, { label: "Historique", value: "closed" }].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => { setActiveTab(value); setSidebarOpen(false); }}
              style={{
                background: activeTab === value ? "rgba(255,255,255,0.08)" : "transparent",
                color: activeTab === value ? "#60a5fa" : "#d1d5db",
                borderLeft: activeTab === value ? "2px solid #2563eb" : "2px solid transparent",
                border: "none",
                borderRadius: 6,
                padding: "9px 12px",
                textAlign: "left",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="main">
        <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 18 }}>Accueil &gt; Sessions</div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Sessions de Refinement
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
          Retrouvez l'ensemble de vos sessions de poker planning
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {[{ label: "Sessions actives", value: "active" }, { label: "Historique", value: "closed" }].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              style={{
                background: activeTab === tab.value ? "#2563eb" : "#fff",
                color: activeTab === tab.value ? "#fff" : "#6b7280",
                border: "1px solid",
                borderColor: activeTab === tab.value ? "#2563eb" : "#e5e7eb",
                borderRadius: 8, padding: "7px 16px", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher une session..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: 420, padding: "9px 14px",
            borderRadius: 8, border: "1px solid #e5e7eb",
            fontSize: 14, marginBottom: 20, outline: "none",
          }}
        />

        {filtered.length === 0
          ? <p style={{ color: "#9ca3af", fontSize: 14 }}>Aucune session trouvée.</p>
          : filtered.map((s) => <SessionCard key={s.id} session={s} />)
        }
      </main>
    </div>
  );
}
