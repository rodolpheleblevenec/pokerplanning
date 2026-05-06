import { useState } from "react";

export default function StoryInput({ onAdd, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nom de la user story…"
        disabled={disabled}
        maxLength={120}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={disabled || !value.trim()}
        style={{ whiteSpace: "nowrap", flexShrink: 0 }}
      >
        Ajouter
      </button>
    </form>
  );
}
