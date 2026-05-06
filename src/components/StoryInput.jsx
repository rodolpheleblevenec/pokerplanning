import { useState } from "react";

export default function StoryInput({ onAdd, disabled }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la user story..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: "9px 14px",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          fontSize: 14,
          outline: "none",
          background: disabled ? "#f9fafb" : "#fff",
        }}
      />
      <button
        type="submit"
        disabled={disabled || !name.trim()}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "9px 20px",
          fontWeight: 600,
          fontSize: 14,
          cursor: disabled || !name.trim() ? "not-allowed" : "pointer",
          opacity: disabled || !name.trim() ? 0.5 : 1,
        }}
      >
        Ajouter
      </button>
    </form>
  );
}
