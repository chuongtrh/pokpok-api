import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import db from "../db/firestore.ts";
import collectionType from "./collection.type.ts";

export default {
  getUserByEmail: async (email: string) => {
    const userRef = collection(db, collectionType.USERS);
    const q = query(userRef, where("email", "==", email), limit(1));
    const snaps = await getDocs(q);
    if (snaps.docs.length > 0) {
      const snap = snaps.docs[0];
      return {
        ...snap.data(),
        id: snap.id,
      };
    }
    return null;
  },
  getById: async (id: string) => {
    const snap = await getDoc(doc(db, collectionType.USERS, id));
    return {
      ...snap.data(),
      id,
    };
  },
};
