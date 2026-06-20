/*
  Suites de cartes disponibles pour le vote.
  Le choix est fait par le PO à la création de la room et stocké sur le document Firestore
  (champ `sequence`). Les anciennes rooms sans ce champ retombent sur "linear".
*/

export const SEQUENCES = {
  linear: {
    key: "linear",
    label: "Linéaire",
    hint: "1 à 10, progression régulière",
    values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  fib: {
    key: "fib",
    label: "Fibonacci",
    hint: "1, 2, 3, 5, 8, 13, 21 — écarts croissants",
    values: [1, 2, 3, 5, 8, 13, 21],
  },
};

export function getSequence(key) {
  return SEQUENCES[key] || SEQUENCES.linear;
}

export function getDeck(key) {
  return getSequence(key).values;
}
