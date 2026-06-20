export default function Avatar({ name, size = 32 }) {
  const letter = (name || "?").trim()[0] || "?";
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>
      {letter}
    </div>
  );
}
