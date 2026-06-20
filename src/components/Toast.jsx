import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "error") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", bottom: 20, right: 20,
        display: "flex", flexDirection: "column", gap: 8, zIndex: 9999,
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`note note-${t.type === "error" ? "amber" : t.type === "success" ? "accent" : "muted"}`}
            style={{
              minWidth: 220,
              boxShadow: "var(--shadow-md)",
              background: t.type === "error" ? "var(--danger-soft)" : undefined,
              color: t.type === "error" ? "var(--danger-text)" : undefined,
              fontWeight: 500,
              animation: "slideUp 0.2s ease",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
