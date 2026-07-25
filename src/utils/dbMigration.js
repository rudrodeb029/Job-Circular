import {
  getCollection,
  updateDocument,
  COLLECTIONS
} from '../services/firestoreService';

/**
 * Migration script to ensure all existing Firestore documents have a createdAt timestamp.
 * This fixes the issue where old posts show "Just now" because of missing dates.
 */
export const runDatabaseMigration = async () => {
  console.log('🚀 Starting Database Migration...');

  const targetCollections = [
    COLLECTIONS.JOBS,
    COLLECTIONS.QUESTIONS,
    COLLECTIONS.LIVE_EXAMS,
    COLLECTIONS.ADMITS,
    COLLECTIONS.ACTIVITIES,
    COLLECTIONS.NOTIFICATIONS
  ];

  for (const collectionName of targetCollections) {
    try {
      console.log(`Checking collection: ${collectionName}`);
      const documents = await getCollection(collectionName);
      let updatedCount = 0;

      for (const doc of documents) {
        // If createdAt is missing, try to infer it from ID or use a reasonable default
        if (!doc.createdAt) {
          let inferredDate = new Date().toISOString();

          // Try to extract timestamp from ID (e.g., job_1234567890)
          const matches = String(doc.id).match(/\d{10,13}/);
          if (matches) {
            const timestamp = parseInt(matches[0], 10);
            // Check if it's a valid timestamp (between 2020 and 2030)
            if (timestamp > 1577836800000 && timestamp < 1893456000000) {
              inferredDate = new Date(timestamp).toISOString();
            }
          } else if (doc.postedAt && doc.postedAt.includes('-')) {
            // Use postedAt if it looks like a date (YYYY-MM-DD)
            inferredDate = new Date(doc.postedAt).toISOString();
          } else if (doc.date && doc.date.includes('-')) {
             inferredDate = new Date(doc.date).toISOString();
          } else {
             // Default to a date in the past so it doesn't say "Just now"
             // Using roughly 1 hour ago as a safe default for truly unknown old items
             inferredDate = new Date(Date.now() - 3600000).toISOString();
          }

          await updateDocument(collectionName, doc.id, {
            createdAt: inferredDate,
            updatedAt: inferredDate
          });
          updatedCount++;
        }
      }
      console.log(`✅ Finished ${collectionName}: Updated ${updatedCount} documents.`);
    } catch (err) {
      console.error(`❌ Error migrating ${collectionName}:`, err);
    }
  }

  console.log('🏁 Database Migration Complete!');
};
