const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

// Exécuté chaque nuit à 2h (Europe/Paris)
// Supprime : rooms "closed" depuis > 30 jours, rooms abandonnées > 60 jours
exports.cleanupOldRooms = onSchedule(
  { schedule: "0 2 * * *", timeZone: "Europe/Paris" },
  async () => {
    const db = getFirestore();
    const now = Date.now();
    const MS_30D = 30 * 24 * 60 * 60 * 1000;
    const MS_60D = 60 * 24 * 60 * 60 * 1000;

    const [closedSnap, allSnap] = await Promise.all([
      db.collection("rooms").where("status", "==", "closed").get(),
      db.collection("rooms").get(),
    ]);

    const batch = db.batch();
    let count = 0;

    closedSnap.docs.forEach((doc) => {
      const closedAt = doc.data().closedAt?.toMillis() ?? 0;
      if (now - closedAt > MS_30D) { batch.delete(doc.ref); count++; }
    });

    allSnap.docs.forEach((doc) => {
      const createdAt = doc.data().createdAt?.toMillis() ?? 0;
      const status = doc.data().status;
      // Rooms waiting/voting abandonnées depuis 60 jours
      if (status !== "closed" && now - createdAt > MS_60D) {
        batch.delete(doc.ref); count++;
      }
    });

    await batch.commit();
    console.log(`[cleanupOldRooms] ${count} room(s) supprimée(s)`);
  }
);
