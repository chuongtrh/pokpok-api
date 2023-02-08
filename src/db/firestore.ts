import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = JSON.parse(Deno.env.get("FIREBASE_CONFIG") || "");

const firebaseApp = initializeApp({
  apiKey: firebaseConfig.private_key,
  projectId: firebaseConfig.project_id,
  appId: firebaseConfig.private_key_id,
}, "pokpok-app");

const db = getFirestore(firebaseApp);

export default db;
