// deno-lint-ignore-file
import {
  addDoc,
  collection,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

import db from "../db/firestore.ts";
import collectionType from "./collection.type.ts";

export default {
  createLog: async (data: any) => {
    const docRef = await addDoc(
      collection(db, collectionType.EVENT_LOGS),
      data,
    );
    return docRef.id;
  },
};
