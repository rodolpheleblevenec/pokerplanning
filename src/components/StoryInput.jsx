import { useState } from "react";
import { IconPlus } from "./Icons";

export default function StoryInput({ onAdd, disabled }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
      <input
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nom de la user story à estimer…"
        disabled={disabled}
        maxLength={120}
        autoFocus
      />
      <button type="submit" className="btn btn-primary" disabled={disabled || !value.trim()} style={{ flexShrink: 0 }}>
        <IconPlus size={16} /> Lancer le vote
      </button>
    </form>
  );
}
