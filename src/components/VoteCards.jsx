/*
  Deck de vote. Les valeurs viennent de la suite choisie pour la room (prop `values`).
*/
export default function VoteCards({ values, onVote, selectedVote, disabled }) {
  return (
    <div className="deck">
      {values.map((v) => (
        <button
          key={v}
          onClick={() => !disabled && onVote(v)}
          disabled={disabled}
          className={`vote-card ${selectedVote === v ? "selected" : ""}`}
          aria-pressed={selectedVote === v}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
