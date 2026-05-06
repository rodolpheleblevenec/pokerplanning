import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/*
STRUCTURE FIRESTORE

rooms/{code}
  createdBy: "Rodolphe"
  status: "waiting" | "voting" | "revealed" | "closed"
  currentStory: string
  participants: { [name]: { voted: bool, joined: bool, online: bool, lastSeen: timestamp } }
  votes: { [name]: number }
  history: [{ story, estimate, average, recommendation, needsDiscussion, votes }]
  revealed: bool
  createdAt: timestamp
  closedAt: timestamp (optionnel)
*/

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyBv0Fr_hMO0cQuoCuQNUSZaGhOCzB4ONXQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "pokerplanning-495508.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "pokerplanning-495508",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "pokerplanning-495508.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "866295040752",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:866295040752:web:8bc9935299410d2264d035",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-RT4EYW8LVQ",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export function computeResult(votes) {
  const values = Object.values(votes).filter((v) => typeof v === "number");
  if (values.length === 0) return { average: null, recommendation: null, needsDiscussion: false };
  const average = values.reduce((s, v) => s + v, 0) / values.length;
  const recommendation = Math.ceil(average);
  const needsDiscussion = Math.max(...values) - Math.min(...values) > 3;
  return { average: Math.round(average * 10) / 10, recommendation, needsDiscussion };
}
