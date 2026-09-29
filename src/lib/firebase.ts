import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

const requiredConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

for (const [key, value] of Object.entries(requiredConfig)) {
  if (!value) {
    throw new Error("Missing Firebase environment variable for " + key);
  }
}

const databaseURL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL?.trim() ||
  "https://fatu-oph-2026-default-rtdb.asia-southeast1.firebasedatabase.app";

export const firebaseApp =
  getApps()[0] ??
  initializeApp({
    ...requiredConfig,
    ...(databaseURL ? { databaseURL } : {}),
  });

export const auth = getAuth(firebaseApp);

export const database: Database | null = databaseURL
  ? getDatabase(firebaseApp, databaseURL)
  : null;

export function requireDatabase(): Database {
  if (!database) {
    throw new Error(
      "Firebase Realtime Database is not configured. Create the database, then set VITE_FIREBASE_DATABASE_URL.",
    );
  }

  return database;
}

export function isRealtimeDatabaseConfigured(): boolean {
  return database !== null;
}
