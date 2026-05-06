import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBv0Fr_hMO0cQuoCuQNUSZaGhOCzB4ONXQ",
  authDomain: "pokerplanning-495508.firebaseapp.com",
  projectId: "pokerplanning-495508",
  storageBucket: "pokerplanning-495508.firebasestorage.app",
  messagingSenderId: "866295040752",
  appId: "1:866295040752:web:8bc9935299410d2264d035",
  measurementId: "G-RT4EYW8LVQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/*
STRUCTURE FIRESTORE

sessions/                          <- collection principale
  {sessionId}/                     <- document par session
    title: "Refinement 06/05/2026"
    createdAt: timestamp
    status: "active" | "closed"
    stories: [                     <- tableau dans le document
      {
        id: "story_1"
        name: "En tant qu'utilisateur..."
        status: "voting" | "revealed" | "done"
        votes: {
          Djamal: 5,
          Nicolas: 8,
          Moez: 3
        }
        average: 5.3
        recommendation: 6
        needsDiscussion: true | false
      }
    ]
*/

export function computeResult(votes) {
  const values = Object.values(votes);
  if (values.length === 0) return { average: 0, recommendation: 0, needsDiscussion: false };

  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const recommendation = Math.ceil(average);
  const needsDiscussion = Math.max(...values) - Math.min(...values) > 3;

  return { average: Math.round(average * 10) / 10, recommendation, needsDiscussion };
}
