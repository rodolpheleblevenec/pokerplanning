import { createContext, useCallback, useContext, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 8, zIndex: 9999,
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            padding: "12px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            background: t.type === "error" ? "#fee2e2" : t.type === "success" ? "#dcfce7" : "#fef9c3",
            color: t.type === "error" ? "#dc2626" : t.type === "success" ? "#16a34a" : "#92400e",
            animation: "slideUp 0.2s ease",
          }}>
            {t.message}
          </div>
        ))}
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
