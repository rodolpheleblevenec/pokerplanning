import { useTheme } from "../theme";
import { IconSun, IconMoon } from "./Icons";

export default function ThemeToggle({ size = 18 }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      className="btn-icon"
      onClick={toggle}
      title={isDark ? "Passer en clair" : "Passer en sombre"}
      aria-label="Changer de thème"
    >
      {isDark ? <IconSun size={size} /> : <IconMoon size={size} />}
    </button>
  );
}
