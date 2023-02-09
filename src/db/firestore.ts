import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import config from "../shared/config.ts";

const firebaseConfig = JSON.parse(config.FIREBASE_CONFIG || "");

const firebaseApp = initializeApp({
  apiKey: firebaseConfig.private_key,
  projectId: firebaseConfig.project_id,
  appId: firebaseConfig.private_key_id,
}, "pokpok-app");

const db = getFirestore(firebaseApp);

export default db;
